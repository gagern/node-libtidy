/**
 *
 * Compile or run this file to see if type checks
 *
 * required package (not included in package.json):
 * - ts-node or tsc
 * - @types/chai
 *
 */

import * as libtidy from '../';
import { expect } from 'chai';

const doc = libtidy.TidyDoc();

doc.optSet("alt-text", "foo");
expect(doc.optGet("alt_text")).to.eq('foo');
expect(doc.optGet("AltText")).to.eq('foo');

doc.optSet("wrap", 82);
expect(doc.optGet("Wrap")).to.eq(82);
