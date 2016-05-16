"use strict";

var chai = require("chai");
chai.use(require("chai-subset"));
var expect = chai.expect;
var util = require("util");
var libtidy = require("../");

describe("High-level API:", function() {

  var testDoc1 = Buffer('<!DOCTYPE html>\n<html><head></head>\n' +
                        '<body><p>foo</p></body></html>');

  describe("tidyBuffer:", function() {

    it("on simple document", function(done) {
      libtidy.tidyBuffer(testDoc1, function(err, res) {
        expect(err).to.be.null;
        expect(res).to.contain.key("output");
        expect(res).to.contain.key("errlog");
        expect(res.errlog).to.match(/inserting missing/);
        expect(res.errlog).to.match(/looks like HTML5/);
        expect(res.errlog).to.match(/Tidy found/);
        expect(Buffer.isBuffer(res.output)).ok;
        expect(res.output.toString()).to.match(/<title>.*<\/title>/);
        done();
      });
    });

    it("doesn't use CRLF in its output", function(done) {
      libtidy.tidyBuffer(testDoc1, function(err, res) {
        expect(res.output.toString()).to.not.match(/\r\n/);
        done();
      });
    });

    it("Converts argument to buffer", function(done) {
      libtidy.tidyBuffer({
        toString: testDoc1.toString.bind(testDoc1)
      }, function(err, res) {
        expect(err).to.be.null;
        expect(Buffer.isBuffer(res.output)).ok;
        expect(res.output.toString()).to.match(/<title>.*<\/title>/);
        done();
      });
    });

  });

});
