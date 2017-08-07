namespace node_libtidy {

  class Doc : public Nan::ObjectWrap {
  public:
    Doc();
    ~Doc();

    TidyOption asOption(v8::Local<v8::Value> value);
    bool CheckResult(int rc, const char* functionName);
    v8::Local<v8::Value> exception(int rc);
    void Lock() { locked = true; }
    void Unlock() { locked = false; }

    static NAN_MODULE_INIT(Init);

  private:
    TidyDoc doc;
    Buf err;
    bool locked;

    static Doc* Prelude(v8::Local<v8::Object> self);

    static NAN_METHOD(New);
    static NAN_METHOD(parseBufferSync);
    static NAN_METHOD(cleanAndRepairSync);
    static NAN_METHOD(runDiagnosticsSync);
    static NAN_METHOD(saveBufferSync);
    static NAN_METHOD(getOptionList);
    static NAN_METHOD(getOption);
    static NAN_METHOD(optGet);
    static NAN_METHOD(optSet);
    static NAN_METHOD(optGetCurrPick);
    static NAN_METHOD(optGetDoc);
    static NAN_METHOD(optGetDocLinksList);
    static NAN_METHOD(optResetToDefault);
    static NAN_METHOD(async);
    static NAN_METHOD(getErrorLog);

    static Nan::Persistent<v8::Function> constructor;

    friend class TidyWorker;
  };

}
