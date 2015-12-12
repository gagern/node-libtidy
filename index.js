"use strict";

var lib = require("bindings")("tidy");
for (var key in lib)
    module.exports[key] = lib[key];
