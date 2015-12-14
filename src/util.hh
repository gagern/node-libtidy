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

  inline std::ostream& operator<<(std::ostream& out,
                                  const Nan::Utf8String& str) {
    return out.write(*str, str.length());
  }

  inline v8::Local<v8::String> NewString(const std::string& str) {
    return Nan::New<v8::String>(str.c_str(), str.length()).ToLocalChecked();
  }

  inline std::string trim(std::string str) {
    while (str.length() && str[str.length() - 1] == '\n')
      str.resize(str.length() - 1);
    return str;
  }

}
