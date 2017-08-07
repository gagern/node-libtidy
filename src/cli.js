#!/usr/bin/env node

"use strict";

const libtidy = require("../");

function OptionHandler(doc, args) {
  this.doc = doc;
  doc.options = {
    newline: "LF",
  };
  doc.getOption("char-encoding").pickList.forEach(
    enc => this["-" + enc] = () => doc.options.char_encoding = enc);
  const positional = [];
  for (let i = 0; i < args.length; ++i) {
    const arg = args[i];
    if (!arg.startsWith("-")) {
      positional.push(arg);
      continue;
    } else if (arg === "--") {
      return positional.concat(args.slice(i + 1));
    }
    let h = this[arg];
    while (typeof h === "string" && h[0] === "-")
      h = this[h];
    if (typeof h === "string") {
      if (h.endsWith("=")) {
        if (++i === args.length) {
          console.error(`Missing argument for ${arg}`);
          process.exit(1);
        }
        doc.optSet(h.substr(0, h.length - 1), args[i]);
      } else {
        doc.optSet(h, "yes");
      }
    } else if (typeof h === "function") {
      if (i + h.length >= args.length) {
        console.error(`Missing argument for ${arg}`);
        process.exit(1);
      }
      h.apply(this, args.slice(i + 1, i + h.length + 1));
      i += h.length;
    } else if (typeof h === "undefined" && arg.startsWith("--")) {
      if (++i === args.length) {
        console.error(`Missing argument for ${arg}`);
        process.exit(1);
      }
      doc.optSet(arg.substr(2), args[i]);
    } else {
      console.error(`Unknown argument: ${arg}`);
      process.exit(1);
    } // end of case distinction for typeof h
  } // end of for loop
  return positional;
};

OptionHandler.prototype = {
  "-xml": "input-xml",
  "-asxml": "output-xhtml",
  "-asxhtml": "output-xhtml",
  "-ashtml": "output-html",
  "-i": "-indent",
  "-indent": function() {
    this.doc.options.indent = "auto";
    if (this.doc.options.indent_spaces == 0)
      this.doc.optResetToDefault("indent-spaces");
  },
  "-omit": "omit-optional-tags",
  "-u": "-upper",
  "-upper": "uppercase-tags",
  "-c": "-clean",
  "-clean": "clean",
  "-g": "-gdoc",
  "-gdoc": "gdoc",
  "-b": "-bare",
  "-bare": "bare",
  "-n": "-numeric",
  "-numeric": "numeric-entities",
  "-m": "-modify",
  "-modify": "write-back",
  "-e": "-errors",
  "-errors": "markup",
  "-q": "-quiet",
  "-quiet": "quiet",
  "-language": "-lang",
  "-lang": "language=",
  "--help": "-help",
  "-h": "-help",
  "-help": function() {
    console.log("No usage help available at this point.");
    console.log("Most options follow the tidy-html5 command line too, though.");
    console.log("So eithe read the sources or its documentation.");
    process.exit(0);
  },
  "--output-file": "-output",
  "-o": "-output",
  "-output": "output-file",
  "--file": "-file",
  "-f": "-file",
  "-file": "error-file",
  "--wrap": "-wrap",
  "-w": "-wrap",
  "-wrap": "wrap=",
  "--version": "-version",
  "-v": "-version",
  "-version": function() {
    var package_info = require("../package.json")
    console.log(
      `Node module ${package_info.name} version ${package_info.version}`);
    console.log(`Native library libtidy version ${libtidy.libraryVersion}`);
    process.exit(0);
  },
  "-access": "accessibility-check=",
};

function main(args) {
  const doc = new libtidy.TidyDoc();
  const positional = new OptionHandler(doc, args);
  const opts = {};
  for (let opt of doc.getOptionList()) {
    let value = doc.optGet(opt);
    if (!opt.readOnly && value != opt.default)
      opts[opt] = value;
  }
  let promise = null;
  if (doc.options.write_back) {
    promise = libtidy.tidyFilesInPlace(positional, opts);
  } else if (positional.length > 1) {
    console.error("Cannot tidy more than one file unless -modify is specified");
    process.exit(1);
  } else {
    if (positional.length === 0)
      promise = libtidy.readStdin();
    else
      promise = libtidy.readFile(positional[0]);
    promise = promise.then(libtidy.tidyUp(opts));
    if (doc.options.output_file)
      promise = promise.then(libtidy.writeFile(doc.options.output_file));
    else
      promise = promise.then(libtidy.writeStdout());
  }
  promise.then(
    res => process.exit(0),
    err => { console.error(String(err)); process.exit(2); });
}

if (require.main === module)
  main(process.argv.slice(2))
