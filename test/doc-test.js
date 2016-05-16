"use strict";

var chai = require("chai");
chai.use(require("chai-subset"));
var expect = chai.expect;
var libtidy = require("../");
var TidyDoc = libtidy.TidyDoc;

describe("TidyDoc:", function() {

  var testDoc1 = Buffer('<!DOCTYPE html>\n<html><head></head>\n' +
                        '<body><p>foo</p></body></html>');
  var testDoc2 = Buffer('<!DOCTYPE html>\n<html><head></head>\n' +
                        '<body><form><ul><li></form></ul></li>');

  describe("construction:", function() {

    it("as constructor", function() {
      var doc = new TidyDoc();
      expect(doc).instanceof(TidyDoc);
      expect(doc.optGet("input-xml")).equal(false);
    });

    it("as function", function() {
      var doc = TidyDoc();
      expect(doc).instanceof(TidyDoc);
      expect(doc.optGet("input-xml")).equal(false);
    });

  });

  describe("basic synchroneous operation:", function() {

    it("parse buffer", function() {
      var messages =
          "line 2 column 7 - Warning: inserting missing 'title' element\n";
      var doc = new TidyDoc();
      expect(doc.getErrorLog()).equal("");
      var res = doc.parseBufferSync(testDoc1);
      expect(doc.getErrorLog()).equal(messages);
      expect(res).to.equal(messages);
    });

    it("clean and repair", function() {
      // Can there be any output during clean and repair?
      var messages = "";
      var doc = new TidyDoc();
      doc.parseBufferSync(testDoc1);
      var res = doc.cleanAndRepairSync();
      expect(doc.getErrorLog()).equal(messages);
      expect(res).to.equal(messages);
    });

    it("diagnostics", function() {
      var messages =
          'Info: Document content looks like HTML5\n' +
          'Tidy found 1 warning and 0 errors!\n\n';
      var doc = new TidyDoc();
      doc.parseBufferSync(testDoc1);
      doc.cleanAndRepairSync();
      var res = doc.runDiagnosticsSync();
      expect(doc.getErrorLog()).equal(messages);
      expect(res).equal(messages);
    });

    it("save to buffer", function() {
      var doc = new TidyDoc();
      doc.parseBufferSync(testDoc1);
      doc.cleanAndRepairSync();
      doc.runDiagnosticsSync();
      var res = doc.saveBufferSync();
      expect(doc.getErrorLog()).equal("");
      expect(Buffer.isBuffer(res)).ok;
      expect(res.toString()).to.match(/<title>.*<\/title>/);
    });

    it("report errors in diagnostics", function() {
      var messages =
          'Info: Document content looks like HTML5\n' +
          'Tidy found 5 warnings and 2 errors!\n\n' +
          'This document has errors that must be fixed before\n' +
          'using HTML Tidy to generate a tidied up version.\n\n';
      var doc = new TidyDoc();
      doc.parseBufferSync(testDoc2);
      doc.cleanAndRepairSync();
      var res = doc.runDiagnosticsSync();
      expect(doc.getErrorLog()).equal(messages);
      expect(res).equal(messages);
    });

    it("will not produce output in case of an error", function() {
      var doc = new TidyDoc();
      doc.parseBufferSync(testDoc2);
      doc.cleanAndRepairSync();
      doc.runDiagnosticsSync();
      var res = doc.saveBufferSync();
      expect(doc.getErrorLog()).equal("");
      expect(Buffer.isBuffer(res)).ok;
      expect(res).to.have.length(0);
    });

    it("can produce output despite errors", function() {
      var doc = new TidyDoc();
      doc.parseBufferSync(testDoc2);
      doc.cleanAndRepairSync();
      doc.runDiagnosticsSync();
      expect(doc.optGet("force-output")).to.be.false;
      doc.optSet("force-output", true);
      expect(doc.optGet("force-output")).to.be.true;
      var res = doc.saveBufferSync();
      expect(doc.getErrorLog()).equal("");
      expect(res).to.have.length.above(100);
    });

  });

  describe("basic asynchroneous operation:", function() {

    it("parse buffer", function(done) {
      var messages =
          "line 2 column 7 - Warning: inserting missing 'title' element\n";
      var doc = new TidyDoc();
      doc.parseBuffer(testDoc1, function(err, res) {
        expect(err).to.be.null;
        expect(res).to.not.contain.key("output");
        expect(res).to.containSubset({
          errlog: messages,
        });
        expect(doc.getErrorLog()).equal(messages);
        done();
      });
    });

    it("clean and repair", function(done) {
      // Can there be any output during clean and repair?
      var messages = "";
      var doc = new TidyDoc();
      doc.parseBufferSync(testDoc1);
      doc.cleanAndRepair(function(err, res) {
        expect(err).to.be.null;
        expect(res).to.not.contain.key("output");
        expect(res).to.containSubset({
          errlog: messages,
        });
        expect(doc.getErrorLog()).equal(messages);
        done();
      });
    });

    it("diagnostics", function(done) {
      var messages =
          'Info: Document content looks like HTML5\n' +
          'Tidy found 1 warning and 0 errors!\n\n';
      var doc = new TidyDoc();
      doc.parseBufferSync(testDoc1);
      doc.cleanAndRepairSync();
      doc.runDiagnostics(function(err, res) {
        expect(err).to.be.null;
        expect(res).to.not.contain.key("output");
        expect(res).to.containSubset({
          errlog: messages,
        });
        expect(doc.getErrorLog()).equal(messages);
        done();
      });
    });

    it("save to buffer", function(done) {
      var doc = new TidyDoc();
      doc.parseBufferSync(testDoc1);
      doc.cleanAndRepairSync();
      doc.runDiagnosticsSync();
      doc.saveBuffer(function(err, res) {
        expect(err).to.be.null;
        expect(res).to.contain.key("output");
        expect(res).to.containSubset({
          errlog: "",
        });
        expect(Buffer.isBuffer(res.output)).ok;
        expect(res.output.toString()).to.match(/<title>.*<\/title>/);
        expect(doc.getErrorLog()).equal("");
        done();
      });
    });

    it("will not produce output in case of an error", function(done) {
      var doc = new TidyDoc();
      doc.parseBufferSync(testDoc2);
      doc.cleanAndRepairSync();
      doc.runDiagnosticsSync();
      var res = doc.saveBufferSync();
      doc.saveBuffer(function(err, res) {
        expect(err).to.be.null;
        expect(res).to.contain.key("output");
        expect(res).to.containSubset({
          errlog: "",
          output: null,
        });
        expect(doc.getErrorLog()).equal("");
        done();
      });
    });

    it("all in one go", function(done) {
      var doc = new TidyDoc();
      doc.tidyBuffer(testDoc1, function(err, res) {
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

  });

});
