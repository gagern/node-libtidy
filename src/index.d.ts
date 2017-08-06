// Type definitions for node-libtidy v0.3
// Project: node-libtidy / https://github.com/gagern/node-libtidy
// Definitions by: Wang Guan <momocraft@gmail.com>
// vim: shiftwidth=2

export const tidyBuffer: TidyBufferStatic
export const TidyDoc: TidyDocConstructor
export const compat: TidyCompat

/// <reference types="node" />
import { Generated } from './options';

/**
 *  Callback convention: the result
 */
interface TidyResult {
  /**
   * errlog contains the error messages generated during the run,
   * formatted as a string including a trailing newline.
   */
  errlog?: string
  /**
   * output contains the output buffer if output was generated.
   * The property is unset if generating output was not part of the method
   * in question, or null if no output was generated due to errors.
   */
  output?: Buffer
}

/**
 * Callback convention: the signerature used in async APIs
 */
interface TidyCallback {
  (err: Error | null, res: TidyResult | null): void
}

/**
 * High-level functions automate the most common workflows.
 *
 * The document is assumed to be a buffer or a string.
 * Anything else will be converted to a string and then
 * turned into a buffer.
 */
interface TidyBufferStatic {
  (document: string | Buffer, options: Generated.OptionDict,
    callback: TidyCallback): void

  (document: string | Buffer, callback: TidyCallback): void
}

export class TidyOption {
  // creation of TidyOption is not exposed
  private constructor()
  readonly name: string
  readonly type: "boolean" | "integer" | "doctype" | "string"
  readonly readOnly: boolean
  readonly pickList: string[]
  readonly id: number
  readonly category: string
  toString(): string
}

/**
 * TidyDoc is the central object for dealing with the library at a low level
 *
 * Such an object will hold a configuration and be able to process one input
 * file at a time, while multiple such objects can deal with multiple inputs
 * simultaneously using an independent configuration for each of them.
 */
interface TidyDoc extends Generated.TidyDocOption {
  // Sync calls
  cleanAndRepairSync(): string
  parseBufferSync(document: Buffer): string
  runDiagnosticsSync(): string
  saveBufferSync(): Buffer
  // getErrorLog(): string // is not needed: other calls already return log

  // Async calls
  cleanAndRepair(callback: TidyCallback): void
  parseBuffer(document: Buffer, callback: TidyCallback): void
  runDiagnostics(callback: TidyCallback): void
  saveBuffer(callback: TidyCallback): void
  tidyBuffer(buf: Buffer, callback: TidyCallback): void

  // batch set/get of options
  options: Generated.OptionDict
  // Methods that return TidyOption object
  getOptionList(): TidyOption[]
  getOption(option: TidyOption): TidyOption
  getOption(optionId: number): TidyOption
  getOption(optionName: string): TidyOption
  /**
   * FIXME: does this return the list of related options??
   */
  optGetDocLinksList(optionId: number): TidyOption[]
  optGetDocLinksList(optionName: string): TidyOption[]
  /* FIXME: what does this do? */
  optGetCurrPick(key: any): any
}

/**
 * Constructor
 * (Can be used with `new` or normal call)
 */
interface TidyDocConstructor {
  new (): TidyDoc
  (): TidyDoc
}

/**
 * Elements of the compat namespace offer compatibility with other
 * libtidy bindings for node.
 */
interface TidyCompat {
  libtidy: {
    tidy: {
      (text: string, callback: (err: any, html: string) => void): void
      (text: string, options: any, callback: (err: any, html: string) => void): void
    }
  }
}
