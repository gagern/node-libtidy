"use strict";

// Interface like htmltidy, see https://www.npmjs.com/package/htmltidy

var TidyDoc = require("./TidyDoc");

module.exports.tidy = function(text, opts, cb) {
  if (typeof cb === "undefined" && typeof opts === "function") {
    cb = opts;
    opts = {};
  }
  if (typeof cb !== "function") {
    throw Error("no callback provided");
  }
  opts = opts || {};
  var doc = TidyDoc();
  doc.options = { // magic setter
    show_warnings: false,
    tidy_mark: false,
    force_output: true,
    quiet: false,
  };
  doc.options = opts; // another magic setter
  if (!Buffer.isBuffer(text))
    text = Buffer(String(text));
  doc._async(text, true, true, true, function(err, res) {
    if (err) {
      return cb(err);
    }
    var errlog = res.errlog;
    var output = res.output;
    if (Buffer.isBuffer(output))
      output = output.toString();
    if (!doc.optGet("show-warnings"))
      errlog = "";
    cb(errlog, output);
  });
};
