#include "node-libtidy.hh"

namespace node_libtidy {

  namespace Opt {

    Nan::Persistent<v8::Function> constructor;

    NAN_MODULE_INIT(Init) {
      v8::Local<v8::FunctionTemplate> tpl = Nan::New<v8::FunctionTemplate>(New);
      tpl->SetClassName(Nan::New("TidyOption").ToLocalChecked());
      tpl->InstanceTemplate()->SetInternalFieldCount(1);
      v8::Local<v8::ObjectTemplate> itpl = tpl->InstanceTemplate();

      Nan::SetPrototypeMethod(tpl, "toString", toString);
      SetAccessor(tpl, itpl, "default", getDefault);
      SetAccessor(tpl, itpl, "id", getId);
      SetAccessor(tpl, itpl, "name", getName);
      SetAccessor(tpl, itpl, "readOnly", getReadOnly);
      SetAccessor(tpl, itpl, "type", getType);

      constructor.Reset(Nan::GetFunction(tpl).ToLocalChecked());
      Nan::Set(target, Nan::New("TidyOption").ToLocalChecked(),
               Nan::GetFunction(tpl).ToLocalChecked());
    }

    NAN_METHOD(New) {
      if (info.IsConstructCall()) {
        Nan::SetInternalFieldPointer(info.This(), 0, NULL);
        info.GetReturnValue().Set(info.This());
      } else {
        v8::Local<v8::Function> cons = Nan::New(constructor);
        info.GetReturnValue().Set(cons->NewInstance());
      }
    }

    v8::Local<v8::Object> Create(TidyOption opt) {
      Nan::EscapableHandleScope scope;
      v8::Local<v8::Function> cons = Nan::New(constructor);
      v8::Local<v8::Object> obj = cons->NewInstance();
      Nan::SetInternalFieldPointer
        (obj, 0, const_cast<void*>(reinterpret_cast<const void*>(opt)));
      return scope.Escape(obj);
    }

    TidyOption Unwrap(v8::Local<v8::Object> object) {
      if (object->InternalFieldCount() < 1) {
        Nan::ThrowTypeError("Not a valid TidyOption object");
        return NULL;
      }
      TidyOption opt = reinterpret_cast<TidyOption>
        (Nan::GetInternalFieldPointer(object, 0));
      if (opt == NULL) {
        Nan::ThrowTypeError("TidyOption not properly initialized");
        return NULL;
      }
      return opt;
    }

    NAN_METHOD(toString) {
      TidyOption opt = Unwrap(info.Holder()); if (!opt) return;
      const char* res = reinterpret_cast<const char*>(tidyOptGetName(opt));
      info.GetReturnValue().Set(Nan::New<v8::String>(res).ToLocalChecked());
    }

    NAN_PROPERTY_GETTER(getDefault) {
      TidyOption opt = Unwrap(info.Holder()); if (!opt) return;
      switch (tidyOptGetType(opt)) {
      case TidyBoolean:
        info.GetReturnValue().Set(Nan::New<v8::Boolean>
                                  (tidyOptGetDefaultBool(opt)));
        break;
      case TidyInteger:
        info.GetReturnValue().Set(Nan::New<v8::Number>
                                  (tidyOptGetDefaultInt(opt)));
        break;
      default:
        const char* res = reinterpret_cast<const char*>(tidyOptGetDefault(opt));
        if (res)
          info.GetReturnValue().Set(Nan::New<v8::String>(res).ToLocalChecked());
        else
          info.GetReturnValue().Set(Nan::Null());
        break;
      }
    }

    NAN_PROPERTY_GETTER(getId) {
      TidyOption opt = Unwrap(info.Holder()); if (!opt) return;
      double res = tidyOptGetId(opt);
      info.GetReturnValue().Set(Nan::New(res));
    }

    NAN_PROPERTY_GETTER(getName) {
      TidyOption opt = Unwrap(info.Holder()); if (!opt) return;
      const char* res = reinterpret_cast<const char*>(tidyOptGetName(opt));
      info.GetReturnValue().Set(Nan::New<v8::String>(res).ToLocalChecked());
    }

    NAN_PROPERTY_GETTER(getReadOnly) {
      TidyOption opt = Unwrap(info.Holder()); if (!opt) return;
      info.GetReturnValue().Set(Nan::New<v8::Boolean>(tidyOptIsReadOnly(opt)));
    }

    NAN_PROPERTY_GETTER(getType) {
      TidyOption opt = Unwrap(info.Holder()); if (!opt) return;
      const char* res;
      switch (tidyOptGetType(opt)) {
      case TidyBoolean:
        res = "boolean";
        break;
      case TidyInteger:
        res = "integer";
        break;
      case TidyString:
        res = "string";
        break;
      default:
        res = "unknown";
      }
      info.GetReturnValue().Set(Nan::New<v8::String>(res).ToLocalChecked());
    }

  }

}
