"use strict";

var key;

var lib = require("./lib");
for (key in lib)
  module.exports[key] = lib[key];

// Will augment TidyDoc, no need to assign result
require("./TidyDoc");

var htmltidy = require("./htmltidy");
for (key in htmltidy)
  module.exports[key] = htmltidy[key];
