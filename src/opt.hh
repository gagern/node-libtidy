namespace node_libtidy {

  namespace Opt {

    extern Nan::Persistent<v8::Function> constructor;
    NAN_MODULE_INIT(Init);
    NAN_METHOD(New);
    v8::Local<v8::Object> Create(TidyOption opt);
    TidyOption Unwrap(v8::Local<v8::Value> object);

    NAN_METHOD(toString);
    NAN_PROPERTY_GETTER(getCategory);
    NAN_PROPERTY_GETTER(getDefault);
    NAN_PROPERTY_GETTER(getId);
    NAN_PROPERTY_GETTER(getName);
    NAN_PROPERTY_GETTER(getPickList);
    NAN_PROPERTY_GETTER(getReadOnly);
    NAN_PROPERTY_GETTER(getType);

  }

}
