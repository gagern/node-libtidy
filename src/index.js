"use strict";

var key;

var lib = require("./lib");
for (key in lib)
  module.exports[key] = lib[key];

var TidyDoc = require("./TidyDoc");

module.exports.compat = require("./compat");

module.exports.tidyBuffer = function(buf, opts, cb) {
  if (typeof cb === "undefined" && typeof opts === "function") {
    cb = opts;
    opts = {};
  }
  opts = opts || {};
  var doc = TidyDoc();
  doc.options = {
    newline: "LF",
  };
  doc.options = opts;
  if (!Buffer.isBuffer(buf))
    buf = Buffer(String(buf));
  return doc.tidyBuffer(buf, cb); // can handle both cb and promise
};
