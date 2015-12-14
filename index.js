"use strict";

var lib = require("bindings")("tidy");
for (var key in lib)
    module.exports[key] = lib[key];
var TidyDoc = lib.TidyDoc;
Object.defineProperties(TidyDoc.prototype, {

  options: {
    configurable: true,
    enumerable: true,
    get: function() {
      var doc = this;
      var props = {};
      this.getOptionList().forEach(function(opt) {
        var prop = {
          configurable: true,
          enumerable: true,
          get: function() {
            return doc.optGetValue(opt);
          },
          set: function(val) {
            return doc.optSetValue(opt, val);
          }
        };
        var name = opt.toString();
        //props[name] = prop;
        props[name.replace(/-/g, '_')] = prop;
      });
      var obj = {};
      Object.defineProperties(obj, props);
      return obj;
    }
  },

});
