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
    Nan::SetPrototypeMethod(tpl, "saveBufferSync", saveBufferSync);
    Nan::SetPrototypeMethod(tpl, "getOptionList", getOptionList);
    Nan::SetPrototypeMethod(tpl, "optGetValue", optGetValue);
    Nan::SetPrototypeMethod(tpl, "optSetValue", optSetValue);
    Nan::SetPrototypeMethod(tpl, "_async", async);

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
    doc->CheckResult(rc, "tidyParseBuffer");
  }

  NAN_METHOD(Doc::cleanAndRepairSync) {
    Doc* doc = Prelude(info.Holder()); if (!doc) return;
    int rc = tidyCleanAndRepair(doc->doc);
    doc->CheckResult(rc, "tidyCleanAndRepair");
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

  TidyOption Doc::asOption(v8::Local<v8::Value> value) {
    TidyOption opt = NULL;
    {
      Nan::TryCatch tryCatch;
      opt = Opt::Unwrap(value);
      if (opt || !tryCatch.CanContinue()) return opt;
    }
    Nan::Utf8String str(value);
    opt = tidyGetOptionByName(doc, *str);
    return opt;
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
    int rc;
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
      Nan::Utf8String str(info[1]);
      rc = tidyOptSetValue(doc->doc, id, *str);
      fn = "tidyOptSetValue";
    }
    doc->CheckResult(rc, fn);
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

}
