#include "node-libtidy.hh"

#include <cstdlib>
#include <cstdio>

namespace node_libtidy {

  void adjustMem(ssize_t diff);

  namespace {

    struct memHdr {
      size_t size;
      double data;
    };

    inline size_t hdrSize() {
      return offsetof(memHdr, data);
    }

    inline void* hdr2client(memHdr* hdr) {
      return static_cast<void*>(reinterpret_cast<char*>(hdr) + hdrSize());
    }

    inline memHdr* client2hdr(void* client) {
      return reinterpret_cast<memHdr*>(static_cast<char*>(client) - hdrSize());
    }

    void* TIDY_CALL myAlloc(TidyAllocator*, size_t size) {
      size_t totalSize = size + hdrSize();
      memHdr* mem = static_cast<memHdr*>(std::malloc(totalSize));
      if (!mem) return NULL;
      mem->size = size;
      adjustMem(totalSize);
      return hdr2client(mem);
    }

    void* TIDY_CALL myRealloc(TidyAllocator*, void* buf, size_t size) {
      memHdr* mem1 = buf ? client2hdr(buf) : NULL;
      ssize_t oldSize = mem1 ? mem1->size : -hdrSize();
      memHdr* mem2 = static_cast<memHdr*>(std::realloc(mem1, size + hdrSize()));
      if (!mem2) return NULL;
      mem2->size = size;
      adjustMem(ssize_t(size) - oldSize);
      return hdr2client(mem2);
    }

    void TIDY_CALL myFree(TidyAllocator*, void* buf) {
      if (!buf) return;
      memHdr* mem = client2hdr(buf);
      ssize_t totalSize = mem->size + hdrSize();
      adjustMem(-totalSize);
      std::free(mem);
    }

    void TIDY_CALL myPanic(TidyAllocator*, ctmbstr msg) {
      std::fputs(msg, stderr);
      std::abort();
    }

    const TidyAllocatorVtbl vtbl = {
      myAlloc,
      myRealloc,
      myFree,
      myPanic
    };

    Nan::nauv_key_t tlsKey;

  }

  TidyAllocator allocator = {
    &vtbl
  };

  void adjustMem(ssize_t diff) {
    WorkerSentinel* worker =
      static_cast<WorkerSentinel*>(Nan::nauv_key_get(&tlsKey));
    if (worker) {
      worker->parent.memAdjustments += diff;
      return;
    }

    // if v8 is no longer running, don't try to adjust memory
    // this happens when the v8 vm is shutdown and the program is exiting
    // our cleanup routines for libxml will be called (freeing memory)
    // but v8 is already offline and does not need to be informed
    // trying to adjust after shutdown will result in a fatal error
#if (NODE_MODULE_VERSION > 0x000B)
    if (v8::Isolate::GetCurrent() == 0) {
      assert(diff <= 0);
      return;
    }
#endif
    if (v8::V8::IsDead()) {
      assert(diff <= 0);
      return;
    }
    Nan::AdjustExternalMemory(diff);
  }

  void initMemory() {
    Nan::nauv_key_create(&tlsKey);
  }

  // Set up in V8 thread
  WorkerParent::WorkerParent() : memAdjustments(0) {
  }

  // Tear down in V8 thread
  WorkerParent::~WorkerParent() {
    Nan::AdjustExternalMemory(memAdjustments);
  }

  // Set up in worker thread
  WorkerSentinel::WorkerSentinel(WorkerParent& parent) : parent(parent) {
    Nan::nauv_key_set(&tlsKey, this);
  }

  // Tear down in worker thread
  WorkerSentinel::~WorkerSentinel() {
    Nan::nauv_key_set(&tlsKey, NULL);
  }

}
