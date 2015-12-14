
namespace node_libtidy {

  class Buf {

  public:

    Buf() { tidyBufInitWithAllocator(&buf, &allocator); }

    ~Buf() {
      tidyBufFree(&buf);
    }

    operator TidyBuffer*() {
      return &buf;
    }

    bool isEmpty() {
      return buf.size == 0;
    }

    void reset() {
      buf.next = buf.size = 0;
    }

    v8::MaybeLocal<v8::String> string() const {
      return Nan::New<v8::String>(data(), buf.size);
    }

    v8::MaybeLocal<v8::Object> buffer() const {
      return Nan::CopyBuffer(data(), buf.size);
    }

  private:

    TidyBuffer buf;

    char* data() const {
      return b2c(buf.bp);
    }

    friend std::ostream& operator<<(std::ostream& out, Buf& buf);

  };

  inline std::ostream& operator<<(std::ostream& out, Buf& buf) {
    return out.write(buf.data(), buf.buf.size);
  }

}
