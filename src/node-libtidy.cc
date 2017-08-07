#include "node-libtidy.hh"

NAN_MODULE_INIT(Init) {
  node_libtidy::initMemory();
  node_libtidy::Opt::Init(target);
  node_libtidy::Doc::Init(target);
  Nan::Set(target, Nan::New("libraryVersion").ToLocalChecked(),
           Nan::New(tidyLibraryVersion()).ToLocalChecked());
}
NODE_MODULE(libtidy, Init)
