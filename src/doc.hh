namespace node_libtidy {

  class Doc : public Nan::ObjectWrap {
  public:
    Doc();
    ~Doc();

    static NAN_MODULE_INIT(Init);

  private:
    TidyDoc doc;
    Buf err;

    static NAN_METHOD(New);
    static NAN_METHOD(parseBufferSync);
    static NAN_METHOD(cleanAndRepairSync);
    static NAN_METHOD(saveBufferSync);
    static NAN_METHOD(getOptionList);

    static Nan::Persistent<v8::Function> constructor;
  };

}
