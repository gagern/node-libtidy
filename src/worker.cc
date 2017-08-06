#include "node-libtidy.hh"

namespace node_libtidy {

  TidyWorker::TidyWorker(Doc* doc,
                         v8::Local<v8::Function> resolve,
                         v8::Local<v8::Function> reject)
    : Nan::AsyncWorker(NULL), doc(doc), resolve(resolve), reject(reject)
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
    v8::Local<v8::Value> args[1];
    Nan::HandleScope scope;
    {
      Nan::TryCatch tryCatch;
      doc->CheckResult(rc, lastFunction);
      if (tryCatch.HasCaught()) {
        if (!tryCatch.CanContinue()) return;
        args[0] = tryCatch.Exception();
        reject(1, args);
        return;
      }
    }
    v8::Local<v8::Object> res = Nan::New<v8::Object>();
    if (shouldSaveToBuffer) {
      v8::Local<v8::Value> out = Nan::Null();
      if (!output.isEmpty())
        out = output.buffer().ToLocalChecked();
      Nan::Set(res, Nan::New("output").ToLocalChecked(), out);
    }
    v8::Local<v8::Value> err = doc->err.string().ToLocalChecked();
    Nan::Set(res, Nan::New("errlog").ToLocalChecked(), err);
    args[0] = res;
    resolve(1, args);
  }

}
