/**
 * This file is mostly for the TypeScript declaration and not the behavior
 * If this file does not type check, mocha will refuse to start test
 */

import { expect } from 'chai';
/// <reference types="node" />

import * as libtidy from '../';

describe('index.d.ts', () => {
  const testDoc1 = Buffer.from('<!DOCTYPE html>\n<html><head></head>\n' +
    '<body><p>foo</p></body></html>');

  let doc: libtidy.TidyDoc;

  beforeEach(() => {
    doc = libtidy.TidyDoc();
  });

  it("has sync tidy API", () => {
    // not actually calling the API
    if (1) return;

    doc.parseBufferSync(testDoc1);
    var res = doc.cleanAndRepairSync();
    const diag: string = doc.runDiagnosticsSync();
    const log: string = doc.getErrorLog();
    const buf: Buffer = doc.saveBufferSync();
  });

  it("has async tidy API", () => {
    if (1) return;

    doc.parseBuffer(testDoc1, dummyCB);
    doc.cleanAndRepair(dummyCB);
    doc.runDiagnostics(dummyCB);
    doc.saveBuffer(dummyCB);
    doc.tidyBuffer(testDoc1, dummyCB);
  });

  it("has option set / get API", () => {
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
  });
});

function dummyCB(err: Error, result: { errlog: string, output: Buffer }) { }

// vim: shiftwidth=2
