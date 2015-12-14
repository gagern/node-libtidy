#include "node-libtidy.hh"

namespace node_libtidy {

  TidyWorker::TidyWorker(Doc* doc, v8::Local<v8::Function> cb)
    : Nan::AsyncWorker(NULL), doc(doc), cb(cb)
  {
    doc->Lock();
    tidyBufInitWithAllocator(&input, &allocator);
  }

  void TidyWorker::setInput(const char* data, size_t length) {
    tidyBufAttach(&input, c2b(const_cast<char*>(data)), length);
  }

  void TidyWorker::Execute() {
    WorkerSentinel sentinel(parent);
    rc = 0;
    if (rc >= 0 && input.bp) {
      lastFunction = "tidyParseString";
      rc = tidyParseBuffer(doc->doc, &input);
    }
    if (rc >= 0 && shouldCleanAndRepair) {
      lastFunction = "tidyCleanAndRepair";
      rc = tidyCleanAndRepair(doc->doc);
    }
    if (rc >= 0 && shouldRunDiagnostics) {
      lastFunction = "tidyRunDiagnostics";
      rc = tidyRunDiagnostics(doc->doc);
    }
    if (rc >= 0 && shouldSaveToBuffer) {
      lastFunction = "tidySaveBuffer";
      rc = tidySaveBuffer(doc->doc, output);
    }
  }

  void TidyWorker::WorkComplete() {
    doc->Unlock();
    v8::Local<v8::Value> args[2] = { Nan::Null(), Nan::Undefined() };
    int argc = 2;
    Nan::HandleScope scope;
    {
      Nan::TryCatch tryCatch;
      doc->CheckResult(rc, lastFunction);
      if (tryCatch.HasCaught()) {
        if (!tryCatch.CanContinue()) return;
        args[0] = tryCatch.Exception();
        argc = 1;
      }
    }
    if (argc == 2) {
      v8::Local<v8::Object> res = Nan::New<v8::Object>();
      if (shouldSaveToBuffer) {
        v8::Local<v8::Value> out = Nan::Null();
        if (!output.isEmpty())
          out = output.buffer().ToLocalChecked();
        Nan::Set(res, Nan::New("output").ToLocalChecked(), out);
      }
      v8::Local<v8::Value> err = Nan::Null();
      if (!doc->err.isEmpty())
        err = doc->err.string().ToLocalChecked();
      Nan::Set(res, Nan::New("errlog").ToLocalChecked(), err);
      args[1] = res;
    }
    cb(argc, args);
  }

}
