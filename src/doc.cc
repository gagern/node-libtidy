#include "node-libtidy.hh"

namespace node_libtidy {

  Nan::Persistent<v8::Function> Doc::constructor;
  
  NAN_MODULE_INIT(Doc::Init) {
    v8::Local<v8::FunctionTemplate> tpl = Nan::New<v8::FunctionTemplate>(New);
    tpl->SetClassName(Nan::New("TidyDoc").ToLocalChecked());
    tpl->InstanceTemplate()->SetInternalFieldCount(1);

    Nan::SetPrototypeMethod(tpl, "parseBufferSync", parseBufferSync);

    constructor.Reset(Nan::GetFunction(tpl).ToLocalChecked());
    Nan::Set(target, Nan::New("TidyDoc").ToLocalChecked(),
             Nan::GetFunction(tpl).ToLocalChecked());
  }

  Doc::Doc() {
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

  NAN_METHOD(Doc::parseBufferSync) {
    Doc* doc = Nan::ObjectWrap::Unwrap<Doc>(info.This());
    if (!node::Buffer::HasInstance(info[0])) {
      return;
    }
    TidyBuffer buf = {0};
    tidyBufAttach(&buf, reinterpret_cast<byte*>(node::Buffer::Data(info[0])),
                  node::Buffer::Length(info[0]));
    tidyParseBuffer(doc->doc, &buf);
    tidyBufDetach(&buf);
  }

}
