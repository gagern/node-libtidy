#include "node-libtidy.hh"

NAN_MODULE_INIT(Init) {
  node_libtidy::initMemory();
  node_libtidy::Doc::Init(target);
}
NODE_MODULE(libtidy, Init)
