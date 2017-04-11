// Type definitions for node-libtidy v0.3
// Project: node-libtidy
// Definitions by: Wang Guan <momocraft@gmail.com> / https://github.com/jokester

export const tidyBuffer: TidyBufferStatic
export const TidyDoc: TidyDocConstructor
export const compat: TidyCompat
/// <reference types="node" />

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
    getErrorLog(): string

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

// START-GENERATED-NAMESPACE
// The rest of this file is generated.
/**
 * Type for libtidy options
 * @generated with /util/gen-typescript-decl.ts
 */
declare namespace Generated {
    interface TidyDocOption {
        /**
         * indent-spaces
         */
        optGet(key: "indent-spaces" | "indent_spaces" | "IndentSpaces"): number;
        optSet(key: "indent-spaces" | "indent_spaces" | "IndentSpaces", value: number): void;
        /**
         * wrap
         */
        optGet(key: "wrap" | "Wrap"): number;
        optSet(key: "wrap" | "Wrap", value: number): void;
        /**
         * tab-size
         */
        optGet(key: "tab-size" | "tab_size" | "TabSize"): number;
        optSet(key: "tab-size" | "tab_size" | "TabSize", value: number): void;
        /**
         * char-encoding
         */
        optGet(key: "char-encoding" | "char_encoding" | "CharEncoding"): "raw" | "ascii" | "latin0" | "latin1" | "utf8" | "iso2022" | "mac" | "win1252" | "ibm858" | "utf16le" | "utf16be" | "utf16" | "big5" | "shiftjis";
        optSet(key: "char-encoding" | "char_encoding" | "CharEncoding", value: "raw" | "ascii" | "latin0" | "latin1" | "utf8" | "iso2022" | "mac" | "win1252" | "ibm858" | "utf16le" | "utf16be" | "utf16" | "big5" | "shiftjis"): void;
        /**
         * input-encoding
         */
        optGet(key: "input-encoding" | "input_encoding" | "InputEncoding"): "raw" | "ascii" | "latin0" | "latin1" | "utf8" | "iso2022" | "mac" | "win1252" | "ibm858" | "utf16le" | "utf16be" | "utf16" | "big5" | "shiftjis";
        optSet(key: "input-encoding" | "input_encoding" | "InputEncoding", value: "raw" | "ascii" | "latin0" | "latin1" | "utf8" | "iso2022" | "mac" | "win1252" | "ibm858" | "utf16le" | "utf16be" | "utf16" | "big5" | "shiftjis"): void;
        /**
         * output-encoding
         */
        optGet(key: "output-encoding" | "output_encoding" | "OutputEncoding"): "raw" | "ascii" | "latin0" | "latin1" | "utf8" | "iso2022" | "mac" | "win1252" | "ibm858" | "utf16le" | "utf16be" | "utf16" | "big5" | "shiftjis";
        optSet(key: "output-encoding" | "output_encoding" | "OutputEncoding", value: "raw" | "ascii" | "latin0" | "latin1" | "utf8" | "iso2022" | "mac" | "win1252" | "ibm858" | "utf16le" | "utf16be" | "utf16" | "big5" | "shiftjis"): void;
        /**
         * newline
         */
        optGet(key: "newline" | "Newline"): "LF" | "CRLF" | "CR";
        optSet(key: "newline" | "Newline", value: "LF" | "CRLF" | "CR"): void;
        /**
         * doctype-mode
         */
        optGet(key: "doctype-mode" | "doctype_mode" | "DoctypeMode"): "html5" | "omit" | "auto" | "strict" | "transitional" | "user";
        optSet(key: "doctype-mode" | "doctype_mode" | "DoctypeMode", value: "html5" | "omit" | "auto" | "strict" | "transitional" | "user"): void;
        /**
         * doctype
         */
        optGet(key: "doctype" | "Doctype"): "html5" | "omit" | "auto" | "strict" | "transitional" | "user";
        optSet(key: "doctype" | "Doctype", value: "html5" | "omit" | "auto" | "strict" | "transitional" | "user"): void;
        /**
         * repeated-attributes
         */
        optGet(key: "repeated-attributes" | "repeated_attributes" | "RepeatedAttributes"): "keep-first" | "keep-last";
        optSet(key: "repeated-attributes" | "repeated_attributes" | "RepeatedAttributes", value: "keep-first" | "keep-last"): void;
        /**
         * alt-text
         */
        optGet(key: "alt-text" | "alt_text" | "AltText"): string;
        optSet(key: "alt-text" | "alt_text" | "AltText", value: string): void;
        /**
         * slide-style
         */
        optGet(key: "slide-style" | "slide_style" | "SlideStyle"): string;
        optSet(key: "slide-style" | "slide_style" | "SlideStyle", value: string): void;
        /**
         * error-file
         */
        optGet(key: "error-file" | "error_file" | "ErrorFile"): string;
        optSet(key: "error-file" | "error_file" | "ErrorFile", value: string): void;
        /**
         * output-file
         */
        optGet(key: "output-file" | "output_file" | "OutputFile"): string;
        optSet(key: "output-file" | "output_file" | "OutputFile", value: string): void;
        /**
         * write-back
         */
        optGet(key: "write-back" | "write_back" | "WriteBack"): boolean;
        optSet(key: "write-back" | "write_back" | "WriteBack", value: boolean): void;
        /**
         * markup
         */
        optGet(key: "markup" | "Markup"): boolean;
        optSet(key: "markup" | "Markup", value: boolean): void;
        /**
         * show-info
         */
        optGet(key: "show-info" | "show_info" | "ShowInfo"): boolean;
        optSet(key: "show-info" | "show_info" | "ShowInfo", value: boolean): void;
        /**
         * show-warnings
         */
        optGet(key: "show-warnings" | "show_warnings" | "ShowWarnings"): boolean;
        optSet(key: "show-warnings" | "show_warnings" | "ShowWarnings", value: boolean): void;
        /**
         * quiet
         */
        optGet(key: "quiet" | "Quiet"): boolean;
        optSet(key: "quiet" | "Quiet", value: boolean): void;
        /**
         * indent
         */
        optGet(key: "indent" | "Indent"): "no" | "yes" | "auto";
        optSet(key: "indent" | "Indent", value: "no" | "yes" | "auto"): void;
        /**
         * coerce-endtags
         */
        optGet(key: "coerce-endtags" | "coerce_endtags" | "CoerceEndtags"): boolean;
        optSet(key: "coerce-endtags" | "coerce_endtags" | "CoerceEndtags", value: boolean): void;
        /**
         * omit-optional-tags
         */
        optGet(key: "omit-optional-tags" | "omit_optional_tags" | "OmitOptionalTags"): boolean;
        optSet(key: "omit-optional-tags" | "omit_optional_tags" | "OmitOptionalTags", value: boolean): void;
        /**
         * hide-endtags
         */
        optGet(key: "hide-endtags" | "hide_endtags" | "HideEndtags"): boolean;
        optSet(key: "hide-endtags" | "hide_endtags" | "HideEndtags", value: boolean): void;
        /**
         * input-xml
         */
        optGet(key: "input-xml" | "input_xml" | "InputXml"): boolean;
        optSet(key: "input-xml" | "input_xml" | "InputXml", value: boolean): void;
        /**
         * output-xml
         */
        optGet(key: "output-xml" | "output_xml" | "OutputXml"): boolean;
        optSet(key: "output-xml" | "output_xml" | "OutputXml", value: boolean): void;
        /**
         * output-xhtml
         */
        optGet(key: "output-xhtml" | "output_xhtml" | "OutputXhtml"): boolean;
        optSet(key: "output-xhtml" | "output_xhtml" | "OutputXhtml", value: boolean): void;
        /**
         * output-html
         */
        optGet(key: "output-html" | "output_html" | "OutputHtml"): boolean;
        optSet(key: "output-html" | "output_html" | "OutputHtml", value: boolean): void;
        /**
         * add-xml-decl
         */
        optGet(key: "add-xml-decl" | "add_xml_decl" | "AddXmlDecl"): boolean;
        optSet(key: "add-xml-decl" | "add_xml_decl" | "AddXmlDecl", value: boolean): void;
        /**
         * uppercase-tags
         */
        optGet(key: "uppercase-tags" | "uppercase_tags" | "UppercaseTags"): boolean;
        optSet(key: "uppercase-tags" | "uppercase_tags" | "UppercaseTags", value: boolean): void;
        /**
         * uppercase-attributes
         */
        optGet(key: "uppercase-attributes" | "uppercase_attributes" | "UppercaseAttributes"): boolean;
        optSet(key: "uppercase-attributes" | "uppercase_attributes" | "UppercaseAttributes", value: boolean): void;
        /**
         * bare
         */
        optGet(key: "bare" | "Bare"): boolean;
        optSet(key: "bare" | "Bare", value: boolean): void;
        /**
         * clean
         */
        optGet(key: "clean" | "Clean"): boolean;
        optSet(key: "clean" | "Clean", value: boolean): void;
        /**
         * gdoc
         */
        optGet(key: "gdoc" | "Gdoc"): boolean;
        optSet(key: "gdoc" | "Gdoc", value: boolean): void;
        /**
         * logical-emphasis
         */
        optGet(key: "logical-emphasis" | "logical_emphasis" | "LogicalEmphasis"): boolean;
        optSet(key: "logical-emphasis" | "logical_emphasis" | "LogicalEmphasis", value: boolean): void;
        /**
         * drop-proprietary-attributes
         */
        optGet(key: "drop-proprietary-attributes" | "drop_proprietary_attributes" | "DropProprietaryAttributes"): boolean;
        optSet(key: "drop-proprietary-attributes" | "drop_proprietary_attributes" | "DropProprietaryAttributes", value: boolean): void;
        /**
         * drop-font-tags
         */
        optGet(key: "drop-font-tags" | "drop_font_tags" | "DropFontTags"): boolean;
        optSet(key: "drop-font-tags" | "drop_font_tags" | "DropFontTags", value: boolean): void;
        /**
         * drop-empty-elements
         */
        optGet(key: "drop-empty-elements" | "drop_empty_elements" | "DropEmptyElements"): boolean;
        optSet(key: "drop-empty-elements" | "drop_empty_elements" | "DropEmptyElements", value: boolean): void;
        /**
         * drop-empty-paras
         */
        optGet(key: "drop-empty-paras" | "drop_empty_paras" | "DropEmptyParas"): boolean;
        optSet(key: "drop-empty-paras" | "drop_empty_paras" | "DropEmptyParas", value: boolean): void;
        /**
         * fix-bad-comments
         */
        optGet(key: "fix-bad-comments" | "fix_bad_comments" | "FixBadComments"): boolean;
        optSet(key: "fix-bad-comments" | "fix_bad_comments" | "FixBadComments", value: boolean): void;
        /**
         * break-before-br
         */
        optGet(key: "break-before-br" | "break_before_br" | "BreakBeforeBr"): boolean;
        optSet(key: "break-before-br" | "break_before_br" | "BreakBeforeBr", value: boolean): void;
        /**
         * split
         */
        optGet(key: "split" | "Split"): boolean;
        optSet(key: "split" | "Split", value: boolean): void;
        /**
         * numeric-entities
         */
        optGet(key: "numeric-entities" | "numeric_entities" | "NumericEntities"): boolean;
        optSet(key: "numeric-entities" | "numeric_entities" | "NumericEntities", value: boolean): void;
        /**
         * quote-marks
         */
        optGet(key: "quote-marks" | "quote_marks" | "QuoteMarks"): boolean;
        optSet(key: "quote-marks" | "quote_marks" | "QuoteMarks", value: boolean): void;
        /**
         * quote-nbsp
         */
        optGet(key: "quote-nbsp" | "quote_nbsp" | "QuoteNbsp"): boolean;
        optSet(key: "quote-nbsp" | "quote_nbsp" | "QuoteNbsp", value: boolean): void;
        /**
         * quote-ampersand
         */
        optGet(key: "quote-ampersand" | "quote_ampersand" | "QuoteAmpersand"): boolean;
        optSet(key: "quote-ampersand" | "quote_ampersand" | "QuoteAmpersand", value: boolean): void;
        /**
         * wrap-attributes
         */
        optGet(key: "wrap-attributes" | "wrap_attributes" | "WrapAttributes"): boolean;
        optSet(key: "wrap-attributes" | "wrap_attributes" | "WrapAttributes", value: boolean): void;
        /**
         * wrap-script-literals
         */
        optGet(key: "wrap-script-literals" | "wrap_script_literals" | "WrapScriptLiterals"): boolean;
        optSet(key: "wrap-script-literals" | "wrap_script_literals" | "WrapScriptLiterals", value: boolean): void;
        /**
         * wrap-sections
         */
        optGet(key: "wrap-sections" | "wrap_sections" | "WrapSections"): boolean;
        optSet(key: "wrap-sections" | "wrap_sections" | "WrapSections", value: boolean): void;
        /**
         * wrap-asp
         */
        optGet(key: "wrap-asp" | "wrap_asp" | "WrapAsp"): boolean;
        optSet(key: "wrap-asp" | "wrap_asp" | "WrapAsp", value: boolean): void;
        /**
         * wrap-jste
         */
        optGet(key: "wrap-jste" | "wrap_jste" | "WrapJste"): boolean;
        optSet(key: "wrap-jste" | "wrap_jste" | "WrapJste", value: boolean): void;
        /**
         * wrap-php
         */
        optGet(key: "wrap-php" | "wrap_php" | "WrapPhp"): boolean;
        optSet(key: "wrap-php" | "wrap_php" | "WrapPhp", value: boolean): void;
        /**
         * fix-backslash
         */
        optGet(key: "fix-backslash" | "fix_backslash" | "FixBackslash"): boolean;
        optSet(key: "fix-backslash" | "fix_backslash" | "FixBackslash", value: boolean): void;
        /**
         * indent-attributes
         */
        optGet(key: "indent-attributes" | "indent_attributes" | "IndentAttributes"): boolean;
        optSet(key: "indent-attributes" | "indent_attributes" | "IndentAttributes", value: boolean): void;
        /**
         * assume-xml-procins
         */
        optGet(key: "assume-xml-procins" | "assume_xml_procins" | "AssumeXmlProcins"): boolean;
        optSet(key: "assume-xml-procins" | "assume_xml_procins" | "AssumeXmlProcins", value: boolean): void;
        /**
         * add-xml-space
         */
        optGet(key: "add-xml-space" | "add_xml_space" | "AddXmlSpace"): boolean;
        optSet(key: "add-xml-space" | "add_xml_space" | "AddXmlSpace", value: boolean): void;
        /**
         * enclose-text
         */
        optGet(key: "enclose-text" | "enclose_text" | "EncloseText"): boolean;
        optSet(key: "enclose-text" | "enclose_text" | "EncloseText", value: boolean): void;
        /**
         * enclose-block-text
         */
        optGet(key: "enclose-block-text" | "enclose_block_text" | "EncloseBlockText"): boolean;
        optSet(key: "enclose-block-text" | "enclose_block_text" | "EncloseBlockText", value: boolean): void;
        /**
         * keep-time
         */
        optGet(key: "keep-time" | "keep_time" | "KeepTime"): boolean;
        optSet(key: "keep-time" | "keep_time" | "KeepTime", value: boolean): void;
        /**
         * word-2000
         */
        optGet(key: "word-2000" | "word_2000" | "Word2000"): boolean;
        optSet(key: "word-2000" | "word_2000" | "Word2000", value: boolean): void;
        /**
         * tidy-mark
         */
        optGet(key: "tidy-mark" | "tidy_mark" | "TidyMark"): boolean;
        optSet(key: "tidy-mark" | "tidy_mark" | "TidyMark", value: boolean): void;
        /**
         * gnu-emacs
         */
        optGet(key: "gnu-emacs" | "gnu_emacs" | "GnuEmacs"): boolean;
        optSet(key: "gnu-emacs" | "gnu_emacs" | "GnuEmacs", value: boolean): void;
        /**
         * gnu-emacs-file
         */
        optGet(key: "gnu-emacs-file" | "gnu_emacs_file" | "GnuEmacsFile"): string;
        optSet(key: "gnu-emacs-file" | "gnu_emacs_file" | "GnuEmacsFile", value: string): void;
        /**
         * literal-attributes
         */
        optGet(key: "literal-attributes" | "literal_attributes" | "LiteralAttributes"): boolean;
        optSet(key: "literal-attributes" | "literal_attributes" | "LiteralAttributes", value: boolean): void;
        /**
         * show-body-only
         */
        optGet(key: "show-body-only" | "show_body_only" | "ShowBodyOnly"): "no" | "yes" | "auto";
        optSet(key: "show-body-only" | "show_body_only" | "ShowBodyOnly", value: "no" | "yes" | "auto"): void;
        /**
         * fix-uri
         */
        optGet(key: "fix-uri" | "fix_uri" | "FixUri"): boolean;
        optSet(key: "fix-uri" | "fix_uri" | "FixUri", value: boolean): void;
        /**
         * lower-literals
         */
        optGet(key: "lower-literals" | "lower_literals" | "LowerLiterals"): boolean;
        optSet(key: "lower-literals" | "lower_literals" | "LowerLiterals", value: boolean): void;
        /**
         * hide-comments
         */
        optGet(key: "hide-comments" | "hide_comments" | "HideComments"): boolean;
        optSet(key: "hide-comments" | "hide_comments" | "HideComments", value: boolean): void;
        /**
         * indent-cdata
         */
        optGet(key: "indent-cdata" | "indent_cdata" | "IndentCdata"): boolean;
        optSet(key: "indent-cdata" | "indent_cdata" | "IndentCdata", value: boolean): void;
        /**
         * force-output
         */
        optGet(key: "force-output" | "force_output" | "ForceOutput"): boolean;
        optSet(key: "force-output" | "force_output" | "ForceOutput", value: boolean): void;
        /**
         * show-errors
         */
        optGet(key: "show-errors" | "show_errors" | "ShowErrors"): number;
        optSet(key: "show-errors" | "show_errors" | "ShowErrors", value: number): void;
        /**
         * ascii-chars
         */
        optGet(key: "ascii-chars" | "ascii_chars" | "AsciiChars"): boolean;
        optSet(key: "ascii-chars" | "ascii_chars" | "AsciiChars", value: boolean): void;
        /**
         * join-classes
         */
        optGet(key: "join-classes" | "join_classes" | "JoinClasses"): boolean;
        optSet(key: "join-classes" | "join_classes" | "JoinClasses", value: boolean): void;
        /**
         * join-styles
         */
        optGet(key: "join-styles" | "join_styles" | "JoinStyles"): boolean;
        optSet(key: "join-styles" | "join_styles" | "JoinStyles", value: boolean): void;
        /**
         * escape-cdata
         */
        optGet(key: "escape-cdata" | "escape_cdata" | "EscapeCdata"): boolean;
        optSet(key: "escape-cdata" | "escape_cdata" | "EscapeCdata", value: boolean): void;
        /**
         * language
         */
        optGet(key: "language" | "Language"): string;
        optSet(key: "language" | "Language", value: string): void;
        /**
         * ncr
         */
        optGet(key: "ncr" | "Ncr"): boolean;
        optSet(key: "ncr" | "Ncr", value: boolean): void;
        /**
         * output-bom
         */
        optGet(key: "output-bom" | "output_bom" | "OutputBom"): "no" | "yes" | "auto";
        optSet(key: "output-bom" | "output_bom" | "OutputBom", value: "no" | "yes" | "auto"): void;
        /**
         * replace-color
         */
        optGet(key: "replace-color" | "replace_color" | "ReplaceColor"): boolean;
        optSet(key: "replace-color" | "replace_color" | "ReplaceColor", value: boolean): void;
        /**
         * css-prefix
         */
        optGet(key: "css-prefix" | "css_prefix" | "CssPrefix"): string;
        optSet(key: "css-prefix" | "css_prefix" | "CssPrefix", value: string): void;
        /**
         * new-inline-tags
         */
        optGet(key: "new-inline-tags" | "new_inline_tags" | "NewInlineTags"): string;
        optSet(key: "new-inline-tags" | "new_inline_tags" | "NewInlineTags", value: string): void;
        /**
         * new-blocklevel-tags
         */
        optGet(key: "new-blocklevel-tags" | "new_blocklevel_tags" | "NewBlocklevelTags"): string;
        optSet(key: "new-blocklevel-tags" | "new_blocklevel_tags" | "NewBlocklevelTags", value: string): void;
        /**
         * new-empty-tags
         */
        optGet(key: "new-empty-tags" | "new_empty_tags" | "NewEmptyTags"): string;
        optSet(key: "new-empty-tags" | "new_empty_tags" | "NewEmptyTags", value: string): void;
        /**
         * new-pre-tags
         */
        optGet(key: "new-pre-tags" | "new_pre_tags" | "NewPreTags"): string;
        optSet(key: "new-pre-tags" | "new_pre_tags" | "NewPreTags", value: string): void;
        /**
         * accessibility-check
         */
        optGet(key: "accessibility-check" | "accessibility_check" | "AccessibilityCheck"): 0 | 1 | 2 | 3;
        optSet(key: "accessibility-check" | "accessibility_check" | "AccessibilityCheck", value: 0 | 1 | 2 | 3): void;
        /**
         * vertical-space
         */
        optGet(key: "vertical-space" | "vertical_space" | "VerticalSpace"): "no" | "yes" | "auto";
        optSet(key: "vertical-space" | "vertical_space" | "VerticalSpace", value: "no" | "yes" | "auto"): void;
        /**
         * punctuation-wrap
         */
        optGet(key: "punctuation-wrap" | "punctuation_wrap" | "PunctuationWrap"): boolean;
        optSet(key: "punctuation-wrap" | "punctuation_wrap" | "PunctuationWrap", value: boolean): void;
        /**
         * merge-emphasis
         */
        optGet(key: "merge-emphasis" | "merge_emphasis" | "MergeEmphasis"): boolean;
        optSet(key: "merge-emphasis" | "merge_emphasis" | "MergeEmphasis", value: boolean): void;
        /**
         * merge-divs
         */
        optGet(key: "merge-divs" | "merge_divs" | "MergeDivs"): "no" | "yes" | "auto";
        optSet(key: "merge-divs" | "merge_divs" | "MergeDivs", value: "no" | "yes" | "auto"): void;
        /**
         * decorate-inferred-ul
         */
        optGet(key: "decorate-inferred-ul" | "decorate_inferred_ul" | "DecorateInferredUl"): boolean;
        optSet(key: "decorate-inferred-ul" | "decorate_inferred_ul" | "DecorateInferredUl", value: boolean): void;
        /**
         * preserve-entities
         */
        optGet(key: "preserve-entities" | "preserve_entities" | "PreserveEntities"): boolean;
        optSet(key: "preserve-entities" | "preserve_entities" | "PreserveEntities", value: boolean): void;
        /**
         * sort-attributes
         */
        optGet(key: "sort-attributes" | "sort_attributes" | "SortAttributes"): "none" | "alpha";
        optSet(key: "sort-attributes" | "sort_attributes" | "SortAttributes", value: "none" | "alpha"): void;
        /**
         * merge-spans
         */
        optGet(key: "merge-spans" | "merge_spans" | "MergeSpans"): "no" | "yes" | "auto";
        optSet(key: "merge-spans" | "merge_spans" | "MergeSpans", value: "no" | "yes" | "auto"): void;
        /**
         * anchor-as-name
         */
        optGet(key: "anchor-as-name" | "anchor_as_name" | "AnchorAsName"): boolean;
        optSet(key: "anchor-as-name" | "anchor_as_name" | "AnchorAsName", value: boolean): void;
        /**
         * indent-with-tabs
         */
        optGet(key: "indent-with-tabs" | "indent_with_tabs" | "IndentWithTabs"): boolean;
        optSet(key: "indent-with-tabs" | "indent_with_tabs" | "IndentWithTabs", value: boolean): void;
        /**
         * skip-nested
         */
        optGet(key: "skip-nested" | "skip_nested" | "SkipNested"): boolean;
        optSet(key: "skip-nested" | "skip_nested" | "SkipNested", value: boolean): void;
        /**
         * strict-tags-attributes
         */
        optGet(key: "strict-tags-attributes" | "strict_tags_attributes" | "StrictTagsAttributes"): boolean;
        optSet(key: "strict-tags-attributes" | "strict_tags_attributes" | "StrictTagsAttributes", value: boolean): void;
        /**
         * escape-scripts
         */
        optGet(key: "escape-scripts" | "escape_scripts" | "EscapeScripts"): boolean;
        optSet(key: "escape-scripts" | "escape_scripts" | "EscapeScripts", value: boolean): void;
    }

    interface OptionDict {
        indent_spaces?: number;
        wrap?: number;
        tab_size?: number;
        char_encoding?: "raw" | "ascii" | "latin0" | "latin1" | "utf8" | "iso2022" | "mac" | "win1252" | "ibm858" | "utf16le" | "utf16be" | "utf16" | "big5" | "shiftjis";
        input_encoding?: "raw" | "ascii" | "latin0" | "latin1" | "utf8" | "iso2022" | "mac" | "win1252" | "ibm858" | "utf16le" | "utf16be" | "utf16" | "big5" | "shiftjis";
        output_encoding?: "raw" | "ascii" | "latin0" | "latin1" | "utf8" | "iso2022" | "mac" | "win1252" | "ibm858" | "utf16le" | "utf16be" | "utf16" | "big5" | "shiftjis";
        newline?: "LF" | "CRLF" | "CR";
        doctype_mode?: "html5" | "omit" | "auto" | "strict" | "transitional" | "user";
        doctype?: "html5" | "omit" | "auto" | "strict" | "transitional" | "user";
        repeated_attributes?: "keep-first" | "keep-last";
        alt_text?: string;
        slide_style?: string;
        error_file?: string;
        output_file?: string;
        write_back?: boolean;
        markup?: boolean;
        show_info?: boolean;
        show_warnings?: boolean;
        quiet?: boolean;
        indent?: "no" | "yes" | "auto";
        coerce_endtags?: boolean;
        omit_optional_tags?: boolean;
        hide_endtags?: boolean;
        input_xml?: boolean;
        output_xml?: boolean;
        output_xhtml?: boolean;
        output_html?: boolean;
        add_xml_decl?: boolean;
        uppercase_tags?: boolean;
        uppercase_attributes?: boolean;
        bare?: boolean;
        clean?: boolean;
        gdoc?: boolean;
        logical_emphasis?: boolean;
        drop_proprietary_attributes?: boolean;
        drop_font_tags?: boolean;
        drop_empty_elements?: boolean;
        drop_empty_paras?: boolean;
        fix_bad_comments?: boolean;
        break_before_br?: boolean;
        split?: boolean;
        numeric_entities?: boolean;
        quote_marks?: boolean;
        quote_nbsp?: boolean;
        quote_ampersand?: boolean;
        wrap_attributes?: boolean;
        wrap_script_literals?: boolean;
        wrap_sections?: boolean;
        wrap_asp?: boolean;
        wrap_jste?: boolean;
        wrap_php?: boolean;
        fix_backslash?: boolean;
        indent_attributes?: boolean;
        assume_xml_procins?: boolean;
        add_xml_space?: boolean;
        enclose_text?: boolean;
        enclose_block_text?: boolean;
        keep_time?: boolean;
        word_2000?: boolean;
        tidy_mark?: boolean;
        gnu_emacs?: boolean;
        gnu_emacs_file?: string;
        literal_attributes?: boolean;
        show_body_only?: "no" | "yes" | "auto";
        fix_uri?: boolean;
        lower_literals?: boolean;
        hide_comments?: boolean;
        indent_cdata?: boolean;
        force_output?: boolean;
        show_errors?: number;
        ascii_chars?: boolean;
        join_classes?: boolean;
        join_styles?: boolean;
        escape_cdata?: boolean;
        language?: string;
        ncr?: boolean;
        output_bom?: "no" | "yes" | "auto";
        replace_color?: boolean;
        css_prefix?: string;
        new_inline_tags?: string;
        new_blocklevel_tags?: string;
        new_empty_tags?: string;
        new_pre_tags?: string;
        accessibility_check?: 0 | 1 | 2 | 3;
        vertical_space?: "no" | "yes" | "auto";
        punctuation_wrap?: boolean;
        merge_emphasis?: boolean;
        merge_divs?: "no" | "yes" | "auto";
        decorate_inferred_ul?: boolean;
        preserve_entities?: boolean;
        sort_attributes?: "none" | "alpha";
        merge_spans?: "no" | "yes" | "auto";
        anchor_as_name?: boolean;
        indent_with_tabs?: boolean;
        skip_nested?: boolean;
        strict_tags_attributes?: boolean;
        escape_scripts?: boolean;
    }

}
