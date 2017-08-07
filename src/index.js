"use strict";

const fs = require("fs");

var lib = require("./lib");
for (let key in lib)
  module.exports[key] = lib[key];

module.exports.nodeModuleVersion = require("../package.json").version;

var TidyDoc = require("./TidyDoc");

module.exports.compat = require("./compat");

class TidyException extends Error {
  constructor(message, opts) {
    this.message = message;
    for (var key in opts)
      this[key] = opts[key];
    Error.captureStackTrace(this, TidyException);
  }
}

function tidyBuffer(buf, opts, cb) {
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
}

function readFile(name) {
  return new Promise((resolve, reject) =>
    fs.readFile(name, (err, content) => {
      if (err) reject(err);
      else resolve({name: name, buf: content});
    }));
}

function readStream(stream, name) {
  name = name || "<stream>";
  return new Promise((resolve, reject) => {
    const chunks = [];
    stream.once("error", reject);
    stream.on("data", chunk => chunks.append(chunk));
    stream.on("end", resolve({name: name, buf: Buffer.concat(chunks)}));
  });
}

function readStdin() {
  return readStream(process.stdin, "<stdin>");
}

function readBuffer(stream, buf) {
  name = name || "<buffer>";
  return new Promise((resolve, reject) => resolve({name: name, buf: buf}));
}

function tidyUp(opts) {
  return input =>
    tidyBuffer(input.buf, opts).then(res => {
      if (!res.output)
        throw new TidyException(`Failed to parse ${input.name}`, res);
      res.inputName = input.name;
      return res;
    });
}

function writeFile(name) {
  return res =>
    new Promise((resolve, reject) =>
      fs.writeFile(name, res.output, err => {
        if (err) return reject(err);
        delete res.output; // save memory
        res.outputName = name;
        resolve(res);
      }));
}

function writeStreamUnchecked(stream, name) {
  name = name || "<stream>";
  return res => {
    stream.write(res.output);
    delete res.output; // save memory
    res.outputName = name;
    return res;
  };
}

function writeStreamChecked(stream, name) {
  name = name || "<stream>";
  return res =>
    new Promise((resolve, reject) => {
      stream.once("error", reject);
      stream.once("finish", resolve);
      stream.end(res.output);
    }).then(() => {
      delete res.output; // save memory
      res.outputName = name;
      return res;
    });
}

function writeStdout() {
  return writeStreamUnchecked(process.stdout, "<stdout>");
}

function promiseOrCallback(cb, f) {
  if (cb) f().then(res => cb(null, res), err => cb(err));
  else return f();
}

function tidyFileToFile(input, output, opts, cb) {
  if (typeof opts === "undefined" &&
      typeof cb === "undefined" &&
      typeof output === "function") {
    cb = output;
    output = input;
    opts = {};
  } else if (typeof cb === "undefined" && typeof opts === "function") {
    cb = opts;
    if (typeof output === "string") {
      opts = {};
    } else {
      opts = output;
      output = input;
    }
  }
  return promiseOrCallback(cb, () =>
    readFile(input).then(tidyUp(opts)).then(writeFile(output)));
};

function tidyFilesInPlace(files, opts, cb) {
  if (typeof cb === "undefined" && typeof opts === "function") {
    cb = opts;
    opts = {};
  }
  return promiseOrCallback(cb, () =>
    Promise.all(Array.from(files, file => tidyFileToFile(file, file, opts))));
}

module.exports.tidyBuffer = tidyBuffer;
module.exports.readFile = readFile;
module.exports.readStream = readStream;
module.exports.readStdin = readStdin;
module.exports.readBuffer = readBuffer;
module.exports.tidyUp = tidyUp;
module.exports.writeFile = writeFile;
module.exports.writeStreamUnchecked = writeStreamUnchecked;
module.exports.writeStreamChecked = writeStreamChecked;
module.exports.writeStdout = writeStdout;
module.exports.promiseOrCallback = promiseOrCallback;
module.exports.tidyFileToFile = tidyFileToFile;
module.exports.tidyFilesInPlace = tidyFilesInPlace;
