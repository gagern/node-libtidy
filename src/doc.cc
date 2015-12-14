#include "node-libtidy.hh"
#include <string>
#include <sstream>

namespace node_libtidy {

  Nan::Persistent<v8::Function> Doc::constructor;
  
  NAN_MODULE_INIT(Doc::Init) {
    v8::Local<v8::FunctionTemplate> tpl = Nan::New<v8::FunctionTemplate>(New);
    tpl->SetClassName(Nan::New("TidyDoc").ToLocalChecked());
    tpl->InstanceTemplate()->SetInternalFieldCount(1);

    Nan::SetPrototypeMethod(tpl, "parseBufferSync", parseBufferSync);
    Nan::SetPrototypeMethod(tpl, "cleanAndRepairSync", cleanAndRepairSync);
    Nan::SetPrototypeMethod(tpl, "runDiagnosticsSync", runDiagnosticsSync);
    Nan::SetPrototypeMethod(tpl, "saveBufferSync", saveBufferSync);
    Nan::SetPrototypeMethod(tpl, "getOptionList", getOptionList);
    Nan::SetPrototypeMethod(tpl, "getOption", getOption);
    Nan::SetPrototypeMethod(tpl, "optGetValue", optGetValue);
    Nan::SetPrototypeMethod(tpl, "optSetValue", optSetValue);
    Nan::SetPrototypeMethod(tpl, "_async", async);
    Nan::SetPrototypeMethod(tpl, "getErrorLog", getErrorLog);

    constructor.Reset(Nan::GetFunction(tpl).ToLocalChecked());
    Nan::Set(target, Nan::New("TidyDoc").ToLocalChecked(),
             Nan::GetFunction(tpl).ToLocalChecked());
  }

  Doc::Doc() : locked(false) {
    doc = tidyCreateWithAllocator(&allocator);
  }

  Doc::~Doc() {
    tidyRelease(doc);
  }

  NAN_METHOD(Doc::New) {
    if (info.IsConstructCall()) {
      Doc *obj = new Doc();
      obj->Wrap(info.This());
      info.GetReturnValue().Set(info.This());
    } else {
      const int argc = 1; 
      v8::Local<v8::Value> argv[argc] = {info[0]};
      v8::Local<v8::Function> cons = Nan::New(constructor);
      info.GetReturnValue().Set(cons->NewInstance(argc, argv));
    }
  }

  Doc* Doc::Prelude(v8::Local<v8::Object> self) {
    Doc* doc = Nan::ObjectWrap::Unwrap<Doc>(self);
    if (doc->locked) {
      Nan::ThrowError("TidyDoc is locked for asynchroneous use.");
      return NULL;
    }
    doc->err.reset();
    int rc = tidySetErrorBuffer(doc->doc, doc->err);
    if (rc) {
      Nan::ThrowError("Error calling tidySetErrorBuffer");
      return NULL;
    }
    return doc;
  };

  bool Doc::CheckResult(int rc, const char* functionName) {
    if (rc < 0) { // Serious problem, probably rc == -errno
      std::ostringstream buf;
      buf << functionName << " returned " << rc;
      if (!err.isEmpty())
        buf << " - " << err;
      std::string str = buf.str();
      while (str.length() && str[str.length() - 1] == '\n')
        str.resize(str.length() - 1);
      v8::Local<v8::String> msg = Nan::New<v8::String>
        (str.c_str(), str.length()).ToLocalChecked();
      Nan::ThrowError(msg);
      err.reset();
      return false;
    }
    return true;
  };

  NAN_METHOD(Doc::parseBufferSync) {
    Doc* doc = Prelude(info.Holder()); if (!doc) return;
    if (!node::Buffer::HasInstance(info[0])) {
      Nan::ThrowTypeError("Argument to parseBufferSync must be a buffer");
      return;
    }
    TidyBuffer inbuf;
    tidyBufInitWithAllocator(&inbuf, &allocator);
    tidyBufAttach(&inbuf, c2b(node::Buffer::Data(info[0])),
                  node::Buffer::Length(info[0]));
    int rc = tidyParseBuffer(doc->doc, &inbuf);
    tidyBufDetach(&inbuf);
    if (doc->CheckResult(rc, "tidyParseBuffer"))
      info.GetReturnValue().Set(doc->err.string().ToLocalChecked());
  }

  NAN_METHOD(Doc::cleanAndRepairSync) {
    Doc* doc = Prelude(info.Holder()); if (!doc) return;
    int rc = tidyCleanAndRepair(doc->doc);
    if (doc->CheckResult(rc, "tidyCleanAndRepair"))
      info.GetReturnValue().Set(doc->err.string().ToLocalChecked());
  }

  NAN_METHOD(Doc::runDiagnosticsSync) {
    Doc* doc = Prelude(info.Holder()); if (!doc) return;
    int rc = tidyRunDiagnostics(doc->doc);
    if (doc->CheckResult(rc, "runDiagnosticsSync"))
      info.GetReturnValue().Set(doc->err.string().ToLocalChecked());
  }

  NAN_METHOD(Doc::saveBufferSync) {
    Doc* doc = Prelude(info.Holder()); if (!doc) return;
    Buf out;
    int rc = tidySaveBuffer(doc->doc, out);
    if (doc->CheckResult(rc, "tidySaveBuffer"))
      info.GetReturnValue().Set(out.buffer().ToLocalChecked());
  }

  NAN_METHOD(Doc::getOptionList) {
    Doc* doc = Prelude(info.Holder()); if (!doc) return;
    v8::Local<v8::Array> arr = Nan::New<v8::Array>();
    TidyIterator iter = tidyGetOptionList(doc->doc);
    while (iter) {
      TidyOption opt = tidyGetNextOption(doc->doc, &iter);
      v8::Local<v8::Object> obj = Opt::Create(opt);
      Nan::Set(arr, arr->Length(), obj);
    }
    info.GetReturnValue().Set(arr);
  }

  TidyOption Doc::asOption(v8::Local<v8::Value> key) {
    TidyOption opt = NULL;
    {
      Nan::TryCatch tryCatch;
      opt = Opt::Unwrap(key);
      if (opt || !tryCatch.CanContinue()) return opt;
    }
    if (key->IsNumber()) {
      double dnum = Nan::To<double>(key).FromJust();
      int inum = dnum;
      if (dnum != inum) {
        Nan::ThrowTypeError("Option id must be an integer");
      } else if (inum <= 0 || inum > N_TIDY_OPTIONS) {
        Nan::ThrowRangeError("Option id outside range of allowed options");
      } else {
        opt = tidyGetOption(doc, TidyOptionId(inum));
        if (!opt) {
          Nan::ThrowError("No option with this id");
        }
      }
      return opt;
    }
    Nan::Utf8String str1(key);
    std::string str2(*str1, str1.length());
    for (std::string::size_type i = str2.length() - 1; i > 0; --i) {
      if (str2[i] == '_') str2[i] = '-';
      if (str2[i] >= 'A' && str2[i] <= 'Z' &&
          str2[i - 1] >= 'a' && str2[i - 1] <= 'z') {
        str2[i] = str2[i] + ('a' - 'A');
        str2.insert(i, 1, '-');
      }
    }
    opt = tidyGetOptionByName(doc, str2.c_str());
    if (!opt) {
      std::ostringstream buf;
      buf << "Option '" << str2 << "' unknown";
      std::string str3 = buf.str();
      v8::Local<v8::String> msg = Nan::New<v8::String>
        (str3.c_str(), str3.length()).ToLocalChecked();
      Nan::ThrowError(msg);
    }
    return opt;
  }

  NAN_METHOD(Doc::getOption) {
    Doc* doc = Prelude(info.Holder()); if (!doc) return;
    TidyOption opt = doc->asOption(info[0]);
    if (!opt) return;
    info.GetReturnValue().Set(Opt::Create(opt));
  }

  NAN_METHOD(Doc::optGetValue) {
    Doc* doc = Prelude(info.Holder()); if (!doc) return;
    TidyOption opt = doc->asOption(info[0]);
    if (!opt) return;
    TidyOptionId id = tidyOptGetId(opt);
    switch (tidyOptGetType(opt)) {
    case TidyBoolean:
      info.GetReturnValue().Set(Nan::New<v8::Boolean>
                                (bb(tidyOptGetBool(doc->doc, id))));
      break;
    case TidyInteger:
      info.GetReturnValue().Set(Nan::New<v8::Number>
                                (tidyOptGetInt(doc->doc, id)));
      break;
    default:
      const char* res = tidyOptGetValue(doc->doc, id);
      if (res)
        info.GetReturnValue().Set(Nan::New<v8::String>(res).ToLocalChecked());
      else
        info.GetReturnValue().Set(Nan::Null());
      break;
    }
  }

  NAN_METHOD(Doc::optSetValue) {
    Doc* doc = Prelude(info.Holder()); if (!doc) return;
    TidyOption opt = doc->asOption(info[0]);
    if (!opt) return;
    TidyOptionId id = tidyOptGetId(opt);
    Bool rc;
    const char* fn;
    switch (tidyOptGetType(opt)) {
    case TidyBoolean:
      rc = tidyOptSetBool(doc->doc, id, bb(Nan::To<bool>(info[1]).FromJust()));
      fn = "tidyOptSetBool";
      break;
    case TidyInteger:
      rc = tidyOptSetInt(doc->doc, id, Nan::To<double>(info[1]).FromJust());
      fn = "tidyOptSetInt";
      break;
    default:
      if (info[1]->IsNull() || info[1]->IsUndefined()) {
        rc = tidyOptSetValue(doc->doc, id, "");
      } else {
        Nan::Utf8String str(info[1]);
        rc = tidyOptSetValue(doc->doc, id, *str);
      }
      fn = "tidyOptSetValue";
    }
    if (rc != yes)
      Nan::ThrowError("Failed to set option value");
  }

  // arguments:
  // 0 - input buffer or null if already parsed
  // 1 - boolean whether to call tidyCleanAndRepair
  // 2 - boolean whether to call tidyRunDiagnostics
  // 3 - boolean whether to save the output to a buffer
  // 4 - callback to invoke once we are done
  NAN_METHOD(Doc::async) {
    Doc* doc = Prelude(info.Holder()); if (!doc) return;
    if (info.Length() != 5) {
      Nan::ThrowTypeError("_async must be called with exactly 5 arguments.");
      return;
    }
    if (!(info[0]->IsNull() || node::Buffer::HasInstance(info[0]))) {
      Nan::ThrowTypeError("First argument to _async must be a buffer");
      return;
    }
    if (!info[4]->IsFunction()) {
      Nan::ThrowTypeError("Last argument to _async must be a function");
      return;
    }
    TidyWorker* w = new TidyWorker(doc, info[4].As<v8::Function>());
    w->SaveToPersistent(0u, info.Holder());
    if (!info[0]->IsNull()) {
      w->SaveToPersistent(1u, info[0]);
      w->setInput(node::Buffer::Data(info[0]), node::Buffer::Length(info[0]));
    }
    w->shouldCleanAndRepair = Nan::To<bool>(info[1]).FromJust();
    w->shouldRunDiagnostics = Nan::To<bool>(info[2]).FromJust();
    w->shouldSaveToBuffer = Nan::To<bool>(info[3]).FromJust();
    Nan::AsyncQueueWorker(w);
  }

  NAN_METHOD(Doc::getErrorLog) {
    Doc* doc = Nan::ObjectWrap::Unwrap<Doc>(info.Holder());
    if (doc->locked) {
      Nan::ThrowError("TidyDoc is locked for asynchroneous use.");
      return;
    }
    info.GetReturnValue().Set(doc->err.string().ToLocalChecked());
  }

}
