namespace node_libtidy {

  class Doc : public Nan::ObjectWrap {
  public:
    Doc();
    ~Doc();

    static NAN_MODULE_INIT(Init);

  private:
    TidyDoc doc;

    static NAN_METHOD(New);
    static NAN_METHOD(parseBufferSync);

    static Nan::Persistent<v8::Function> constructor;
  };

}
