"use strict";

var fs = require("fs");

var path = require.resolve("./tidy-html5/version.txt");
var content = fs.readFileSync(path, "utf-8").split(/\r?\n/g);

switch(process.argv[2]) {
case "version":
    console.log(content[0]);
    break;
case "date":
    console.log(content[1].replace(/\./g, "/"));
    break;
default:
    throw Error('Must specify argument "version" or "date"');
}
