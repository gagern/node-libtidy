"use strict";

var key;

var lib = require("./lib");
for (key in lib)
  module.exports[key] = lib[key];

var TidyDoc = require("./TidyDoc");

var htmltidy = require("./htmltidy");
for (key in htmltidy)
  module.exports[key] = htmltidy[key];

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
  doc.tidyBuffer(buf, cb);
};
