namespace node_libtidy {

  class TidyWorker : public Nan::AsyncWorker {
  public:
    TidyWorker(Doc* doc, v8::Local<v8::Function> cb);
    void setInput(const char* data, size_t length);
    void Execute();
    void WorkComplete();

    bool shouldCleanAndRepair;
    bool shouldRunDiagnostics;
    bool shouldSaveToBuffer;

  private:
    WorkerParent parent;
    Doc* doc;
    TidyBuffer input;
    Buf output;
    int rc;
    const char* lastFunction;
    Nan::Callback cb;
  };

}
