#include "node-libtidy.hh"

namespace node_libtidy {

  namespace Opt {

    Nan::Persistent<v8::FunctionTemplate> constructorTemplate;
    Nan::Persistent<v8::Function> constructor;

    NAN_MODULE_INIT(Init) {
      v8::Local<v8::FunctionTemplate> tpl = Nan::New<v8::FunctionTemplate>(New);
      tpl->SetClassName(Nan::New("TidyOption").ToLocalChecked());
      tpl->InstanceTemplate()->SetInternalFieldCount(1);
      v8::Local<v8::ObjectTemplate> itpl = tpl->InstanceTemplate();

      Nan::SetPrototypeMethod(tpl, "toString", toString);
      SetAccessor(tpl, itpl, "category", getCategory);
      SetAccessor(tpl, itpl, "default", getDefault);
      SetAccessor(tpl, itpl, "id", getId);
      SetAccessor(tpl, itpl, "name", getName);
      SetAccessor(tpl, itpl, "pickList", getPickList);
      SetAccessor(tpl, itpl, "readOnly", getReadOnly);
      SetAccessor(tpl, itpl, "type", getType);

      constructorTemplate.Reset(tpl);
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

    TidyOption Unwrap(v8::Local<v8::Value> value) {
      v8::Local<v8::FunctionTemplate> tpl = Nan::New(constructorTemplate);
      if (!tpl->HasInstance(value)) {
        Nan::ThrowTypeError("Not a valid TidyOption object");
        return NULL;
      }
      v8::Local<v8::Object> object =
        Nan::To<v8::Object>(value).ToLocalChecked();
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
      const char* res = tidyOptGetName(opt);
      info.GetReturnValue().Set(Nan::New<v8::String>(res).ToLocalChecked());
    }

    NAN_PROPERTY_GETTER(getCategory) {
      TidyOption opt = Unwrap(info.Holder()); if (!opt) return;
      const char* res;
      switch (tidyOptGetCategory(opt)) {
      case TidyMarkup:
        res = "Markup";
        break;
      case TidyDiagnostics:
        res = "Diagnostics";
        break;
      case TidyPrettyPrint:
        res = "PrettyPrint";
        break;
      case TidyEncoding:
        res = "Encoding";
        break;
      case TidyMiscellaneous:
        res = "Miscellaneous";
        break;
      default:
        Nan::ThrowError("Unknown option category");
        return;
      }
      info.GetReturnValue().Set(Nan::New<v8::String>(res).ToLocalChecked());
    }

    NAN_PROPERTY_GETTER(getDefault) {
      TidyOption opt = Unwrap(info.Holder()); if (!opt) return;
      switch (tidyOptGetType(opt)) {
      case TidyBoolean:
        info.GetReturnValue().Set(Nan::New<v8::Boolean>
                                  (bb(tidyOptGetDefaultBool(opt))));
        break;
      case TidyInteger:
        info.GetReturnValue().Set(Nan::New<v8::Number>
                                  (tidyOptGetDefaultInt(opt)));
        break;
      default:
        const char* res = tidyOptGetDefault(opt);
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
      const char* res = tidyOptGetName(opt);
      info.GetReturnValue().Set(Nan::New<v8::String>(res).ToLocalChecked());
    }

    NAN_PROPERTY_GETTER(getPickList) {
      TidyOption opt = Unwrap(info.Holder()); if (!opt) return;
      v8::Local<v8::Array> arr = Nan::New<v8::Array>();
      TidyIterator iter = tidyOptGetPickList(opt);
      while (iter) {
        const char* pick = tidyOptGetNextPick(opt, &iter);
        v8::Local<v8::Value> str = Nan::New<v8::String>(pick).ToLocalChecked();
        Nan::Set(arr, arr->Length(), str);
      }
      info.GetReturnValue().Set(arr);
    }

    NAN_PROPERTY_GETTER(getReadOnly) {
      TidyOption opt = Unwrap(info.Holder()); if (!opt) return;
      info.GetReturnValue().Set(Nan::New<v8::Boolean>(bb(tidyOptIsReadOnly(opt))));
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
        Nan::ThrowError("Unknown option type");
        return;
      }
      info.GetReturnValue().Set(Nan::New<v8::String>(res).ToLocalChecked());
    }

  }

}
