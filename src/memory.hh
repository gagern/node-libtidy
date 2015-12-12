namespace node_libtidy {

  extern TidyAllocator allocator;

  void adjustMem(ssize_t diff);

  // An object of the following class must be created on the main V8 thread
  // and be kept alive during the execution of a worker thread,
  // to be eventually destroyed on the main V8 thread again.
  // Only a single worker is allowed per parent.
  class TIDY_EXPORT WorkerParent {
  public:
    WorkerParent();
    virtual ~WorkerParent();
  private:
    friend void adjustMem(ssize_t);
    ssize_t memAdjustments;
  };

  // An object of the following class must be created in the worker thread,
  // and kept alive as long as the worker interfaces with libxmljs.
  // It must eventually be destroyed while still in the worker thread.
  class TIDY_EXPORT WorkerSentinel {
  public:
    WorkerSentinel(WorkerParent& parent);
    virtual ~WorkerSentinel();
  private:
    friend void adjustMem(ssize_t);
    WorkerParent& parent;
  };

  void initMemory();

}
