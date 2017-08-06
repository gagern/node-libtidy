"use strict";

var lib = require("./lib");
var TidyDoc = lib.TidyDoc;
module.exports = TidyDoc;

// Augment native code by some JavaScript-written convenience methods

TidyDoc.prototype._async1 = function(buf, b1, b2, b3, cb) {
  if (cb)
    this._async2(buf, b1, b2, b3, res => cb(null, res), err => cb(err));
  else
    return new Promise(
      (resolve, reject) => this._async2(buf, b1, b2, b3, resolve, reject));
}

TidyDoc.prototype.parseBuffer = function(buf, cb) {
  return this._async1(buf, false, false, false, cb);
};

TidyDoc.prototype.cleanAndRepair = function(cb) {
  return this._async1(null, true, false, false, cb);
};

TidyDoc.prototype.runDiagnostics = function(cb) {
  return this._async1(null, false, true, false, cb);
};

TidyDoc.prototype.saveBuffer = function(cb) {
  return this._async1(null, false, false, true, cb);
};

TidyDoc.prototype.tidyBuffer = function(buf, cb) {
  return this._async1(buf, true, true, true, cb);
};

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
            return doc.optGet(opt);
          },
          set: function(val) {
            return doc.optSet(opt, val);
          }
        };
        var name = opt.toString();
        //props[name] = prop;
        props[name.replace(/-/g, '_')] = prop;
      });
      var obj = {};
      Object.defineProperties(obj, props);
      return obj;
    },
    set: function(opts) {
      for (var key in opts)
        this.optSet(key, opts[key]);
    },
  },

});
