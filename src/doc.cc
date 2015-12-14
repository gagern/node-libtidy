#include "node-libtidy.hh"

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

    constructor.Reset(Nan::GetFunction(tpl).ToLocalChecked());
    Nan::Set(target, Nan::New("TidyDoc").ToLocalChecked(),
             Nan::GetFunction(tpl).ToLocalChecked());
  }

  Doc::Doc() {
    doc = tidyCreateWithAllocator(&allocator);
    tidySetErrorBuffer(doc, err); // TODO: handle return value
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

  NAN_METHOD(Doc::parseBufferSync) {
    Doc* doc = Nan::ObjectWrap::Unwrap<Doc>(info.Holder());
    if (!node::Buffer::HasInstance(info[0])) {
      Nan::ThrowTypeError("Argument to parseBufferSync must be a buffer");
      return;
    }
    TidyBuffer inbuf = {0};
    tidyBufInitWithAllocator(&inbuf, &allocator);
    tidyBufAttach(&inbuf, reinterpret_cast<byte*>(node::Buffer::Data(info[0])),
                  node::Buffer::Length(info[0]));
    int rc = tidyParseBuffer(doc->doc, &inbuf);
    tidyBufDetach(&inbuf);
    if (rc < 0)
      Nan::ThrowError(Nan::ErrnoException(-rc, NULL,
                                          "Error running tidyParseBuffer"));
  }

  NAN_METHOD(Doc::cleanAndRepairSync) {
    Doc* doc = Nan::ObjectWrap::Unwrap<Doc>(info.Holder());
    int rc = tidyCleanAndRepair(doc->doc);
    if (rc < 0)
      Nan::ThrowError(Nan::ErrnoException(-rc, NULL,
                                          "Error running tidyCleanAndRepair"));
  }

  NAN_METHOD(Doc::saveBufferSync) {
    Doc* doc = Nan::ObjectWrap::Unwrap<Doc>(info.Holder());
    Buf out;
    int rc = tidySaveBuffer(doc->doc, out);
    if (rc < 0)
      Nan::ThrowError(Nan::ErrnoException(-rc, NULL,
                                          "Error running tidySaveBuffer"));
    else
      info.GetReturnValue().Set(out.buffer().ToLocalChecked());
  }

  NAN_METHOD(Doc::getOptionList) {
    Doc* doc = Nan::ObjectWrap::Unwrap<Doc>(info.Holder());
    v8::Local<v8::Array> arr = Nan::New<v8::Array>();
    TidyIterator iter = tidyGetOptionList(doc->doc);
    while (iter) {
      TidyOption opt = tidyGetNextOption(doc->doc, &iter);
      v8::Local<v8::Object> obj = Opt::Create(opt);
      Nan::Set(arr, arr->Length(), obj);
    }
    info.GetReturnValue().Set(arr);
  }

}
