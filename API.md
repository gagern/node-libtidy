# API of the libtidy package for node

General usage:

```js
var libtidy = require("libtidy");
```

<a id="tidyBuffer"></a>
## tidyBuffer(input, [opts,] cb)

Asynchronous function.
Suggested entry point for most applications.

* **input** – anything except a buffer will be
  converted to String and then turned into a buffer.
* **opts** – a dictionary of [libtidy options](README.md#options).
* **cb** – callback following the
  [callback convention](README.md#callback-convention),
  i.e. with signature `function(exception, {output, errlog})`.

The function applies the following libtidy options by default:

* newline = LF

<a id="TidyDoc"></a>
## TidyDoc()

Constructor. Main entry point for low-level access to the library.
Contruction wraps `tidyCreateWithAllocator`,
while garbage collection triggers `tidyRelease`.

<a id="TidyDoc.cleanAndRepair"></a>
### TidyDoc.cleanAndRepair(cb)

Asynchronous method binding `tidyCleanAndRepair`.

* **cb** – callback following the
  [callback convention](README.md#callback-convention),
  i.e. with signature `function(exception, {errlog})`

<a id="TidyDoc.cleanAndRepairSync"></a>
### TidyDoc.cleanAndRepairSync()

Synchronous method binding `tidyCleanAndRepair`.
Returns any diagnostics encountered during operation, as a string.

<a id="TidyDoc.getOption"></a>
### TidyDoc.getOption(key)

Retrieve the [TidyOption](#TidyOption) object for the key in question.

* **key** – can be a string
  (hyphen-separated, underscore_separated or camelCase),
  a numeric [id](#TidyOption.id) (not portable)
  or a [TidyOption](#TidyOption) object (rather pointless here).

Wraps `tidyGetOptionByName` and `tidyGetOption`.

<a id="TidyDoc.getOptionList"></a>
### TidyDoc.getOptionList() – method

Retrieve the list of all known options,
as an array of [TidyOption](#TidyOption) objects.

Wraps `tidyGetOptionList` and `tidyGetNextOption`.

<a id="TidyDoc.optGet"></a>
### TidyDoc.optGet(key) – method

Get the current value of the option in question.

For enumerated options,
the result will return the [current pick value](#TidyDoc.optGetCurrPick)
as a string.
Otherwise, `optGet` returns the option value based on its
[type](#TidyOption.type),
i.e. call `tidyOptGetBool`, `tidyOptGetInt` or `tidyOptGetValue`.
Empty strings will be returned as `null` like libtidy does.

* **key** – can be a string
  (hyphen-separated, underscore_separated or camelCase),
  a numeric [id](#TidyOption.id) (not portable)
  or a [TidyOption](#TidyOption) object.

<a id="TidyDoc.optGetCurrPick"></a>
### TidyDoc.optGetCurrPick(key) – method

Get a string representation of the current value for a given option.
The option must have a [pick list](#TidyOption.pickList) associated.
It applies to enumerated options (which internally are of type int)
and to boolean options.

For most applications, [optGet](#TidyDoc.optGet) should be more suitable.

* **key** – can be a string
  (hyphen-separated, underscore_separated or camelCase),
  a numeric [id](#TidyOption.id) (not portable)
  or a [TidyOption](#TidyOption) object.

Wraps `tidyOptGetCurrPick`.

<a id="TidyDoc.optGetDoc"></a>
### TidyDoc.optGetDoc(key) – method

Describe the named option.
The description is a HTML snippet, returned as a string.

* **key** – can be a string
  (hyphen-separated, underscore_separated or camelCase),
  a numeric [id](#TidyOption.id) (not portable)
  or a [TidyOption](#TidyOption) object.

Wraps `tidyOptGetDoc`.

<a id="TidyDoc.optGetDocLinksList"></a>
### TidyDoc.optGetDocLinksList(key) – method

Identify related options.
The result is a (possibly empty) array of [TidyOption](#TidyOption) objects.

* **key** – can be a string
  (hyphen-separated, underscore_separated or camelCase),
  a numeric [id](#TidyOption.id) (not portable)
  or a [TidyOption](#TidyOption) object.

Wraps `tidyOptGetDocLinksList` and `tidyOptGetNextDocLinks`.

<a id="TidyDoc.optSet"></a>
### TidyDoc.optSet(key, value) – method

Set the value for the option in question.

* **key** – can be a string
  (hyphen-separated, underscore_separated or camelCase),
  a numeric [id](#TidyOption.id) (not portable)
  or a [TidyOption](#TidyOption) object.
* **value** – new value of the option.

The interpretation of the `value` depends on the
[type](#TidyOption.type) of the option:

* If the type of the option is integer and the provided value is a number,
  the method will call `tidyOptSetInt`.
* If the type of the option is boolean and the provided value is boolean,
  the method will call `tidyOptSetBool`.
* If the value is `null`,
  `tidyOptSetValue` will be called with an empty string.
* In all other cases, it calls `tidyOptSetValue`,
  which in turn uses the libtidy option parser.
  This in particular allows parsing enumerated options.
  The passed value is the result of JavaScript conversion to string.
  One effect of this is that it is possible to pass a
  boolean value to an AutoBool option and obtain the expected result.

Note that `tidyOptSetValue` may not reject all values you'd expect it would.
For example, boolean options are judged by their first non-whitespace letter,
and accept the `auto` keyword just like options of type AutoBool.

<a id="TidyDoc.options"></a>
### TidyDoc.options

Getter and setter pair.

The getter will build a configuration dictionary
of [all options](#TidyDoc.getOptionList).
Each element of the dictionary corresponds to one option,
with the key given in underscore_separated format.
Reading that element implies a call to [optGet](#TidyDoc.optGet),
while writing it corresponds to calling [optSet](#TidyDoc.optSet).

The setter will take the assigned value and merge its elements
into the configuration one at a time.
This merging goes through [optSet](#TidyDoc.optSet),
so keys can use any of the allowed option naming schemes.

<a id="TidyDoc.parseBuffer"></a>
### TidyDoc.parseBuffer(buf, cb)

Asynchronous method binding `tidyParseBuffer`.
Callback follows the [callback convention](README.md#callback-convention),
i.e. have signature `function(exception, {errlog})`

* **buf** – must be a buffer, other input will be rejected.
* **cb** – callback following the
  [callback convention](README.md#callback-convention),
  i.e. with signature `function(exception, {errlog})`

It is suggested to use this method for strings as well,
since JavaScript strings come with a length information
and may contain `\0` characters while C strings are null-terminated.
Make sure to leave the `input-encoding` option at its default of UTF8
if the input is `Buffer(str)`.

<a id="TidyDoc.parseBufferSync"></a>
### TidyDoc.parseBufferSync(buf)

Synchronous method binding `tidyParseBuffer`.
Returns any diagnostics encountered during operation, as a string.

* **buf** – must be a buffer, other input will be rejected.

It is suggested to use this method for strings as well,
since JavaScript strings come with a length information
and may contain `\0` characters while C strings are null-terminated.
Make sure to leave the `input-encoding` option at its default of UTF8
if the input is `Buffer(str)`.

<a id="TidyDoc.runDiagnostics"></a>
### TidyDoc.runDiagnostics(cb)

Asynchronous method binding `tidyRunDiagnostics`.
Callback follows the [callback convention](README.md#callback-convention),
i.e. have signature `function(exception, {errlog})`

<a id="TidyDoc.runDiagnosticsSync"></a>
### TidyDoc.runDiagnosticsSync()

Synchronous method binding `tidyRunDiagnostics`.
Returns any diagnostics encountered during operation, as a string.

<a id="TidyDoc.saveBuffer"></a>
### TidyDoc.saveBuffer(cb)

Asynchronous method binding `tidySaveBuffer`.

* **cb** – callback following the
  [callback convention](README.md#callback-convention),
  i.e. with signature `function(exception, {errlog, output})`
  where `output` is a buffer.

<a id="TidyDoc.saveBufferSync"></a>
### TidyDoc.saveBufferSync()

Synchronous method binding `tidySaveBuffer`.
Returns the resulting buffer as a string.

<a id="TidyDoc.tidyBuffer"></a>
### TidyDoc.tidyBuffer(buf, cb)

Asynchronous method performing the four basic steps in a row:

1. `tidyParseBuffer`
2. `tidyCleanAndRepair`
3. `tidyRunDiagnostics`
4. `tidySaveBuffer`

* **buf** – must be a buffer, other input will be rejected.
* **cb** – callback following the
  [callback convention](README.md#callback-convention),
  i.e. with signature `function(exception, {errlog, output})`
  where `output` is a buffer.

<a id="TidyOption"></a>
## TidyOption()

Although part of the public interface,
this constructor is not meant to be called from JavaScript.
Its prototype is open to extension, though.

One can obtain objects of this class from
[TidyDoc.getOption](#TidyDoc.getOption),
[TidyDoc.getOptionList](#TidyDoc.getOptionList) or
[TidyDoc.optGetDocLinksList](#TidyDoc.optGetDocLinksList).

The properties of this type are implemented as getters,
so actually retrieving these values may incur some performance cost,
and retrieving the same property twice may lead to different
but equivalent objects.

<a id="TidyOption.category"></a>
### TidyOption.category

The category of the option, as a string.
Will be one of `"Markup"`, `"Diagnostics"`, `"PrettyPrint"`,
`"Encoding"` or `"Miscellaneous"`.

Wraps `tidyOptGetCategory`.

<a id="TidyOption.default"></a>
### TidyOption.default

The default value of the option.
The returned type depends on the type of the option.
Contrary to [`optGet`](#TidyDoc.optGet),
the default will be a number for enumerated types,
not a string, since `tidyOptGetCurrPick` has no
matching `tidyOptGetDefaultPick` or similar.

Wraps `tidyOptGetDefaultBool`, `tidyOptGetDefaultInt`
or `tidyOptGetDefault`.

<a id="TidyOption.id"></a>
### TidyOption.id

The numeric identifier identifying this option.
The returned number is not portable across different versions,
different builds and perhaps even different machines.
So be careful using this, preferably only within a single process.
In general, the [name](#TidyOption.name) is preferable.

Wraps `tidyOptGetId`.

<a id="TidyOption.name"></a>
### TidyOption.name

The name of the option, in its hyphen-separated default form.

Wraps `tidyOptGetName`.

<a id="TidyOption.pickList"></a>
### TidyOption.pickList

List of possible values for enumerated properties,
as an array of strings.
Otherwise the list will be empty.

Wraps `tidyOptGetPickList` and `tidyOptGetNextPick`.

<a id="TidyOption.readOnly"></a>
### TidyOption.readOnly

Indicates whether the property is read-only.

Wraps `tidyOptIsReadOnly`.

<a id="TidyOption.toString"></a>
### TidyOption.toString()

Returns the [name](#TidyOption.name) of the option.

<a id="TidyOption.type"></a>
### TidyOption.type

Returns the type of the option, as a string.
Will be one of `"boolean"`, `"integer"`, `"string"`.
Note that enumerated options, including those of type AutoBool,
will be represented as type `"integer"`.

Wraps `tidyOptGetType`.

<a id="compat"></a>
## compat

Elements of the `compat` namespace offer
compatibility with other libtidy bindings for node.

<a id="htmltidy"></a>
### compat.htmltidy

This offers a drop-in replacement for
[htmltidy](https://www.npmjs.com/package/htmltidy) and
[htmltidy2](https://www.npmjs.com/package/htmltidy2).

```diff
-var htmltidy = require("htmltidy2");
+var htmltidy = require("libtidy").compat.htmltidy;
```

<a id="compat.htmltidy.tidy"></a>
<a id="tidy"></a>
## compat.htmltidy.tidy(input, [opts,] cb)

Asynchronous function.

Similar to [`tidyBuffer`](#tidyBuffer),
but the arguments to the callback are different.
In case of a non-serious error,
the first argument will contain any diagnostic messages as a string,
while the second argument holds the output, again as a string.
If the `show-warnings` option is false
(which is the default for this function),
then in case of a successfully generated output
an empty diagnostics string will be returned.

* **input** – anything except a buffer will be
  converted to String and then turned into a buffer.
* **opts** – a dictionary of [libtidy options](README.md#options).
* **cb** – callback with signature `function(err, output)`,
  where `err` is an `Error` in case of a serious error,
  or a diagnostic string in case of less serious problems.

The function applies the following libtidy options by default:

* show-warnings = no
* tidy-mark = no
* force-output = yes
* quiet = no
