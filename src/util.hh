namespace node_libtidy {

  inline void
  SetAccessor(v8::Local<v8::FunctionTemplate>&,
              v8::Local<v8::ObjectTemplate>& otpl,
              const char* name,
              Nan::GetterCallback getter) {
    Nan::SetAccessor(otpl, Nan::New(name).ToLocalChecked(), getter);
  }

}
