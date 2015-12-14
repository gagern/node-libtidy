namespace node_libtidy {

  inline void
  SetAccessor(v8::Local<v8::FunctionTemplate>&,
              v8::Local<v8::ObjectTemplate>& otpl,
              const char* name,
              Nan::GetterCallback getter) {
    Nan::SetAccessor(otpl, Nan::New(name).ToLocalChecked(), getter);
  }

  inline const byte* c2b(const char* c) {
    return reinterpret_cast<const byte*>(c);
  }

  inline byte* c2b(char* c) {
    return reinterpret_cast<byte*>(c);
  }

  inline const char* b2c(const byte* b) {
    return reinterpret_cast<const char*>(b);
  }

  inline char* b2c(byte* b) {
    return reinterpret_cast<char*>(b);
  }

  inline Bool bb(bool b) {
    return b ? yes : no;
  }

  inline bool bb(Bool b) {
    return b != no;
  }

}
