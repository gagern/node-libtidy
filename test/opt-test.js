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
      doc.optSet("alt-text", "foo");
      expect(doc.optGet("alt-text")).to.be.equal("foo");
    });

    it("with underscores", function() {
      var doc = TidyDoc();
      doc.optSet("alt_text", "foo");
      expect(doc.optGet("alt-text")).to.be.equal("foo");
    });

    it("with camelCase", function() {
      var doc = TidyDoc();
      doc.optSet("altText", "foo");
      expect(doc.optGet("alt-text")).to.be.equal("foo");
    });

    it("mixed", function() {
      var doc = TidyDoc();
      doc.optSet("add_xmlDecl", true);
      expect(doc.optGet("add-xml_Decl")).to.be.true;
    });

  });

  describe("getting and setting values:", function() {

    it("setting should affect the value", function() {
      var doc = TidyDoc();
      expect(doc.optGet("alt-text")).to.be.null;
      expect(doc.optSet("alt-text", "foo")).to.be.undefined;
      expect(doc.optGet("alt-text")).to.be.equal("foo");
    });

    it("null or undefined clear string settings", function() {
      var doc = TidyDoc();
      expect(doc.optSet("alt-text", "foo")).to.be.undefined;
      expect(doc.optGet("alt-text")).to.be.equal("foo");
      expect(doc.optSet("alt-text", null)).to.be.undefined;
      expect(doc.optGet("alt-text")).to.be.null;
      expect(doc.optSet("alt-text", "bar")).to.be.undefined;
      expect(doc.optGet("alt-text")).to.be.equal("bar");
      expect(doc.optSet("alt-text")).to.be.undefined;
      expect(doc.optGet("alt-text")).to.be.null;
    });

    it("objects get stringified", function() {
      var doc = TidyDoc();
      doc.optSet("alt-text", [1, 2]);
      expect(doc.optGet("alt-text")).to.be.equal("1,2");
    });

    it("invalid keys throw", function() {
      var doc = TidyDoc();
      expect(function() {
        doc.optGet("no_suchOption")
      }).to.throw(Error, /'no-such-option'/);
    });

    it("can handle boolean options", function() {
      var doc = TidyDoc();
      expect(doc.optGet("add-xml-decl")).to.be.false;
      expect(doc.optSet("add-xml-decl", "this starts with T")).to.be.undefined;
      expect(doc.optGet("add-xml-decl")).to.be.true;
      expect(doc.optSet("add-xml-decl", false)).to.be.undefined;
      expect(doc.optGet("add-xml-decl")).to.be.false;
      expect(function() {
        doc.optSet("add-xml-decl", "some strange value");
      }).to.throw();
    });

    it("setting a readonly option throws", function() {
      var doc = TidyDoc();
      var opt = doc.getOption('doctype-mode');
      // If readOnly changes in future, this will help to locate the fail.
      expect(opt.readOnly).to.be.true;
      expect(function() {
        doc.optSet('doctype-mode');
      }).to.throw(Error, /' is readonly/);
    });

    it("can handle integer options", function() {
      var doc = TidyDoc();
      expect(doc.optGet("tab-size")).to.be.equal(8);
      expect(doc.optSet("tab-size", 3)).to.be.undefined;
      expect(doc.optGet("tab-size")).to.be.equal(3);
      expect(doc.optSet("tab-size", "5")).to.be.undefined;
      expect(doc.optGet("tab-size")).to.be.equal(5);
      expect(doc.optSet("tab-size", 2.2)).to.be.undefined;
      expect(doc.optGet("tab-size")).to.be.equal(2);
      expect(function() { doc.optSet("tab-size", "not a number"); }).to.throw();
    });

    it("can handle the char-encoding option", function() {
      var doc = TidyDoc();
      var utf8 = doc.optGet("char-encoding");
      expect(doc.optSet("char-encoding", "utf8")).to.be.undefined;
      expect(doc.optGet("char-encoding")).to.be.equal(utf8);
      expect(doc.optSet("char-encoding", "latin1")).to.be.undefined;
      expect(doc.optGet("char-encoding")).to.be.not.equal(utf8);
      expect(function() { doc.optSet("char-encoding", "foobar"); }).to.throw();
    });

    it("can handle the newline option", function() {
      var doc = TidyDoc();
      expect(doc.optSet("newline", 0)).to.be.undefined;
      expect(doc.optGet("newline")).to.be.equal("LF");
      expect(doc.optSet("newline", "crlf")).to.be.undefined;
      expect(doc.optGet("newline")).to.be.equal("CRLF");
      expect(doc.optSet("newline", 2)).to.be.undefined;
      expect(doc.optGet("newline")).to.be.equal("CR");
      expect(function() { doc.optSet("newline", "yes"); }).to.throw();
    });

    it("can handle AutoBool options", function() {
      var doc = TidyDoc();
      expect(doc.optGet("indent")).to.be.equal("no");
      expect(doc.optSet("indent", "auto")).to.be.undefined;
      expect(doc.optGet("indent")).to.be.equal("auto");
      expect(doc.optSet("indent", "yes")).to.be.undefined;
      expect(doc.optGet("indent")).to.be.equal("yes");
      expect(doc.optSet("indent", false)).to.be.undefined;
      expect(doc.optGet("indent")).to.be.equal("no");
      expect(doc.optSet("indent", true)).to.be.undefined;
      expect(doc.optGet("indent")).to.be.equal("yes");
      expect(function() { doc.optSet("indent", "unknown"); }).to.throw();
    });

    it("can find current value from enum", function() {
      var doc = TidyDoc();
      expect(doc.optGetCurrPick("indent")).to.be.equal("no");
      expect(doc.optSet("indent", "auto")).to.be.undefined;
      expect(doc.optGetCurrPick("indent")).to.be.equal("auto");
      expect(doc.optGetCurrPick("alt-text")).to.be.null;
      expect(doc.optGetCurrPick("input-xml")).to.be.equal("no");
    });

    it("only affect one document", function() {
      var doc1 = TidyDoc();
      var doc2 = TidyDoc();
      doc1.optSet("alt-text", "foo");
      expect(doc1.optGet("alt-text")).to.be.equal("foo");
      expect(doc2.optGet("alt-text")).to.be.null;
      expect(TidyDoc().optGet("alt-text")).to.be.null;
    });

  });

  describe("Documentation for options:", function() {

    it("optGetDoc", function() {
      var doc = TidyDoc();
      expect(doc.optGetDoc("newline")).to.match(/Mac OS/);
    });

    it("optGetDocLinksList", function() {
      var doc = TidyDoc();
      var links = doc.optGetDocLinksList("char-encoding");
      expect(links).to.be.instanceof(Array);
      expect(links).to.have.length.above(1);
      expect(links[0]).to.be.instanceof(TidyOption);
      expect(links.map(String))
        .to.containSubset(['input-encoding', 'output-encoding']);
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
      expect(opt.category).to.be.equal("PrettyPrint");
      expect(doc.getOption("indent").pickList).to.eql(["no", "yes", "auto"]);
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
      expect(doc.optGet(opt)).to.be.equal(8);
    });

    it("for setting", function() {
      var doc = TidyDoc();
      var opt = doc.getOption("tabSize");
      expect(doc.optSet(opt, 3)).to.be.undefined;
      expect(doc.optGet("tab_size")).to.be.equal(3);
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
      expect(doc.optGet(tabSize)).to.be.equal(8);
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
      doc.optSet("alt-text", "foo");
      expect(opts.alt_text).to.be.equal("foo");
      expect(doc.options.alt_text).to.be.equal("foo");
    });

    it("can be used for setting", function() {
      var doc = TidyDoc();
      expect(doc.optGet("alt-text")).to.be.null;
      doc.options.alt_text = "foo";
      expect(doc.optGet("alt-text")).to.be.equal("foo");
    });

    it("can be assigned to for configuration", function() {
      var doc = TidyDoc();
      expect(doc.optGet("alt-text")).to.be.null;
      expect(doc.optGet("tab-size")).to.be.equal(8);
      doc.options = {
        alt_text: "foo",
        tabSize: 3
      };
      expect(doc.optGet("alt-text")).to.be.equal("foo");
      expect(doc.optGet("tab-size")).to.be.equal(3);
    });

  });

});
