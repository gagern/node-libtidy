/**
 *
 * Compile or run this file to see if type checks
 *
 * required package (not included in package.json):
 * - ts-node or tsc
 * - @types/chai
 *
 */

/// <reference types="node" />
import * as libtidy from '../';
import { expect } from 'chai';

const doc = libtidy.TidyDoc();

doc.optSet("alt-text", "foo");
expect(doc.optGet("alt_text")).to.eq('foo');
expect(doc.optGet("AltText")).to.eq('foo');

doc.optSet("wrap", 82);
expect(doc.optGet("Wrap")).to.eq(82);

doc.options = {
    wrap: 83,
    InputEncoding: "win1252"
};

expect(doc.optGet("Wrap")).to.eq(83);
expect(doc.optGet("input-encoding")).to.eq("win1252");

(function() {
  var testDoc1 = Buffer.from('<!DOCTYPE html>\n<html><head></head>\n' +
                        '<body><p>foo</p></body></html>');
  var messages = "";
  var doc = new libtidy.TidyDoc();
  doc.parseBufferSync(testDoc1);
  var res = doc.cleanAndRepairSync();
  expect(doc.getErrorLog()).equal(messages);
  expect(res).to.equal(messages);
})();
