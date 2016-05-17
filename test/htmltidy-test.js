"use strict";

var chai = require("chai");
chai.use(require("chai-subset"));
var expect = chai.expect;

// Can't use htmltidy 0.0.6 (the “original”) due to
// https://github.com/vavere/htmltidy/issues/24
var fork = require("htmltidy2");
var clone = require("../").compat.htmltidy;

describe("htmltidy interface:", function() {

  describe("tidy function:", function() {

    it("Handles a simple document the same way", function(done) {
      var ores = null, cres = null;
      var doc = '<!DOCTYPE html><html><head><title>test</title><p>Body</html>';
      fork.tidy(doc, {}, function(err, doc) {
        ores = {err: err, doc: doc};
        if (cres) process.nextTick(compare);
      });
      clone.tidy(doc, {}, function(err, doc) {
        cres = {err: err, doc: doc};
        if (ores) process.nextTick(compare);
      });
      function compare() {
        expect(cres.err).to.be.equal(ores.err);
        expect(cres.doc).to.be.equal(ores.doc);
        done();
      }
    });
  });

});
