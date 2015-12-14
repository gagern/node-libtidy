"use strict";

var chai = require("chai");
chai.use(require("chai-subset"));
var expect = chai.expect;
var util = require("util");
var libtidy = require("../");
var TidyDoc = libtidy.TidyDoc;
var TidyOption = libtidy.TidyOption;

describe("TidyOption:", function() {

  describe("naming:", function() {

    it("with hyphens", function() {
      var doc = TidyDoc();
      doc.optSetValue("alt-text", "foo");
      expect(doc.optGetValue("alt-text")).to.be.equal("foo");
    });

    it("with underscores", function() {
      var doc = TidyDoc();
      doc.optSetValue("alt_text", "foo");
      expect(doc.optGetValue("alt-text")).to.be.equal("foo");
    });

    it("with camelCase", function() {
      var doc = TidyDoc();
      doc.optSetValue("altText", "foo");
      expect(doc.optGetValue("alt-text")).to.be.equal("foo");
    });

    it("mixed", function() {
      var doc = TidyDoc();
      doc.optSetValue("add_xmlDecl", true);
      expect(doc.optGetValue("add-xml_Decl")).to.be.true;
    });

  });

  describe("getting and setting values:", function() {

    it("setting should affect the value", function() {
      var doc = TidyDoc();
      expect(doc.optGetValue("alt-text")).to.be.null;
      expect(doc.optSetValue("alt-text", "foo")).to.be.undefined;
      expect(doc.optGetValue("alt-text")).to.be.equal("foo");
    });

    it("null or undefined clear string settings", function() {
      var doc = TidyDoc();
      expect(doc.optSetValue("alt-text", "foo")).to.be.undefined;
      expect(doc.optGetValue("alt-text")).to.be.equal("foo");
      expect(doc.optSetValue("alt-text", null)).to.be.undefined;
      expect(doc.optGetValue("alt-text")).to.be.null;
      expect(doc.optSetValue("alt-text", "bar")).to.be.undefined;
      expect(doc.optGetValue("alt-text")).to.be.equal("bar");
      expect(doc.optSetValue("alt-text")).to.be.undefined;
      expect(doc.optGetValue("alt-text")).to.be.null;
    });

    it("objects get stringified", function() {
      var doc = TidyDoc();
      doc.optSetValue("alt-text", [1, 2]);
      expect(doc.optGetValue("alt-text")).to.be.equal("1,2");
    });

    it("invalid keys throw", function() {
      var doc = TidyDoc();
      expect(function() {
        doc.optGetValue("no_suchOption")
      }).to.throw(Error, /'no-such-option'/);
    });

    it("can handle boolean options", function() {
      var doc = TidyDoc();
      expect(doc.optGetValue("add-xml-decl")).to.be.false;
      expect(doc.optSetValue("add-xml-decl", "truthy")).to.be.undefined;
      expect(doc.optGetValue("add-xml-decl")).to.be.true;
      expect(doc.optSetValue("add-xml-decl", false)).to.be.undefined;
      expect(doc.optGetValue("add-xml-decl")).to.be.false;
    });

    it("can handle integer options", function() {
      var doc = TidyDoc();
      expect(doc.optGetValue("tab-size")).to.be.equal(8);
      expect(doc.optSetValue("tab-size", 3)).to.be.undefined;
      expect(doc.optGetValue("tab-size")).to.be.equal(3);
      expect(doc.optSetValue("tab-size", "5")).to.be.undefined;
      expect(doc.optGetValue("tab-size")).to.be.equal(5);
      expect(doc.optSetValue("tab-size", 2.2)).to.be.undefined;
      expect(doc.optGetValue("tab-size")).to.be.equal(2);
    });

    it("only affect one document", function() {
      var doc1 = TidyDoc();
      var doc2 = TidyDoc();
      doc1.optSetValue("alt-text", "foo");
      expect(doc1.optGetValue("alt-text")).to.be.equal("foo");
      expect(doc2.optGetValue("alt-text")).to.be.null;
      expect(TidyDoc().optGetValue("alt-text")).to.be.null;
    });

  });

  describe("dealing with TidyOption objects:", function() {

    it("lookup by name", function() {
      var doc = TidyDoc();
      var opt = doc.getOption("tabSize");
      expect(opt).to.be.instanceof(TidyOption);
    });

    it("accessors", function() {
      var doc = TidyDoc();
      var opt = doc.getOption("tabSize");
      expect(opt.name).to.be.equal("tab-size");
      expect(opt.id).to.be.a("number");
      expect(opt.default).to.be.equal(8);
      expect(opt.readOnly).to.be.false;
      expect(opt.type).to.be.equal("integer");
    });

    it("lookup by id", function() {
      var doc = TidyDoc();
      var opt = doc.getOption("tab_size");
      opt = doc.getOption(+opt.id);
      expect(opt.name).to.be.equal("tab-size");
    });

    it("for getting", function() {
      var doc = TidyDoc();
      var opt = doc.getOption("tab-size");
      expect(doc.optGetValue(opt)).to.be.equal(8);
    });

    it("for setting", function() {
      var doc = TidyDoc();
      var opt = doc.getOption("tabSize");
      expect(doc.optSetValue(opt, 3)).to.be.undefined;
      expect(doc.optGetValue("tab_size")).to.be.equal(3);
    });

    it("listing options", function() {
      var doc = TidyDoc();
      var opts = doc.getOptionList();
      expect(opts).to.have.length.above(80);
      var tabSize = opts.filter(function(opt) {
        return opt.name == "tab-size";
      })
      expect(tabSize).to.have.length(1);
      tabSize = tabSize[0];
      expect(tabSize).to.be.an.instanceof(TidyOption);
      expect(doc.optGetValue(tabSize)).to.be.equal(8);
    });

  });

  describe("the options object:", function() {

    it("listing options", function() {
      var doc = TidyDoc();
      var opts = doc.options;
      expect(opts).to.containSubset({
        tab_size: 8,
        alt_text: null,
      });
      expect(opts).to.not.have.any.keys("tab-size", "altText");
    });

    it("complete list", function() {
      var doc = TidyDoc();
      var opts = doc.options;
      expect(Object.keys(opts).length).to.be.equal(doc.getOptionList().length);
    });

    it("can be used for getting", function() {
      var doc = TidyDoc();
      var opts = doc.options;
      expect(opts.alt_text).to.be.null;
      doc.optSetValue("alt-text", "foo");
      expect(opts.alt_text).to.be.equal("foo");
      expect(doc.options.alt_text).to.be.equal("foo");
    });

    it("can be used for setting", function() {
      var doc = TidyDoc();
      expect(doc.optGetValue("alt-text")).to.be.null;
      doc.options.alt_text = "foo";
      expect(doc.optGetValue("alt-text")).to.be.equal("foo");
    });

    it("can be assigned to for configuration", function() {
      var doc = TidyDoc();
      expect(doc.optGetValue("alt-text")).to.be.null;
      expect(doc.optGetValue("tab-size")).to.be.equal(8);
      doc.options = {
        alt_text: "foo",
        tabSize: 3
      };
      expect(doc.optGetValue("alt-text")).to.be.equal("foo");
      expect(doc.optGetValue("tab-size")).to.be.equal(3);
    });

  });

});
