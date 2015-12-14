# libtidy

This package provides bindings to
[libtidy](http://www.html-tidy.org/developer/) a.k.a.
[TidyLib](http://api.html-tidy.org/tidy/tidylib_api_5.1.25/tidylib.html)
which can be used to parse and tidy up HTML 5.
The library is built as a native node extension,
so you don't have to have the HTML Tidy package installed on your system.

## Alternatives

* [tidy-html5](https://www.npmjs.com/package/tidy-html5)
  has libtidy compiles to JavaScript using emscripten.
  It is likely more portable, but at the cost of performance.
  Only supports synchroneous operation.
* [tidy](https://www.npmjs.com/package/tidy)
  and [tidy2](https://www.npmjs.com/package/tidy2)
  also provide bindings for libtidy,
  but they expect the library and its header files
  to be installed on the system.
  Only supports synchroneous operation.
* [htmltidy](https://www.npmjs.com/package/htmltidy)
  and [htmltidy2](https://www.npmjs.com/package/htmltidy2)
  use the command line tool to tidy up html,
  so they incur some process creation overhead.
  The binaries for the most common platforms are shipped with the package,
  but other platforms are not supported.
  This approach requires no build tools, though.
  Only supports asynchroneous operation.

The project will try to provide drop-in replacements for these libraries,
so that people can easily compare implementations.
At the moment, the `tidy` method shared with the `htmltidy` modules
is the only such replacement which has been implemented.

## API

The project aims to provide fine-grained access to a growing set of
library functions, with a rather direct mapping between JavaScript and
C functions.
On the other hand, the project offers high-level functions to easily
deal with common workflows.

### Callback convention

Most asynchroneous operations in this library take a callback with the
conventional node signature `cb(err, res)`.
In the case of a serious error, `err` will contain an exception
providing details about the problem.
In less severe situations, `err` will be `null`
and `res` will be an object containing several properties:

* **`errlog`** contains the error messages generated during the run,
  formatted as a string including a trailing newline.
* **`output`** contains the output buffer if output was generated.
  The property is unset if generating output was not part of the
  method in question, or `null` if no output was generated due to errors.

Other useful properties may be added in the future.

### High-level

High-level functions automate the most common workflows.

#### tidyBuffer(document, [options,] callback)

The `document` is assumed to be a buffer or a string.
Anything else will be converted to a string and then turned into a buffer.
`options` is an optional dictionary of options,
see [the section on options](#options) for details.
`callback` follows the [convention described above](#callback-convention).

### Basic workflow

The type `libtidy.TidyDoc` is the central object for dealing with the
library at a low level.
Such an object will hold a configuration and be able to process one
input file at a time, while multiple such objects can deal with
multiple inputs simultaneously using an independent configuration for
each of them.

The basic workflow consists of these four steps executed on such an object:

1. `parseBuffer`
2. `cleanAndRepair`
3. `runDiagnostics`
4. `saveBuffer`

In the C library, these are functions prefixed by `tidy`,
i.e. `tidyParseBuffer` and so on.
In the JavaScript bindings, these methods come in two flavors:
synchroneous and asynchroneous.
The synchroneous version has a `Sync` suffix to its name.
Most synchroneous functions take no argument
and return any diagnostic messages generated in the process.
The first of the methods takes a buffer as an argument,
and the last returns the resulting output buffer.
The asynchroneous methods take a callback function as last argument,
following the [convention described above](#callback-convention).

### Options

For the list of available options, please refer to the
[Quick Reference](http://api.html-tidy.org/tidy/tidylib_api_5.1.25/quick_ref.html).

There are various ways to operate on options.
Each time an option is identified, the library offers several choices:
the option may be identified by name (i.e. a string),
by id (i.e. an integer) or by a `TidyOption` object.
When using a string, you may choose between the original hyphenated name,
a version where hyphens are replaced by underscores, or a camelCase version.
So `alt-text`, `alt_text` and `altText` all describe the same option.

The lowest level of option access are the `optGetValue(key)` and
`optSetValue(key, value)` methods of the `TidyDoc` object.
These convert the value to a type suitable for the option in question,
using the JavaScript type conversion rules.
So the libtidy parser which can turn any option string into a setting
is not being used, and instead values are processed through functions
like `tidyOptGetBool` and `tidyOptSetInt` which work on these types.

The methods `getOption(key)` and `getOptionsList()` return a single
`TidyOption` object resp. the list of all available options.
Each such option object contains getters for the following properties:
`name`, `id`, `type`, `readOnly`, `default`.

The `options` property of each `TidyDoc` object can be used for elegant
high-level access to all the options.
It provides a dictionary of getter/setter pairs,
which can be used to directly inspect modify each of the options.
The keys in this dictionary use the underscore notation.
The `options` property itself is implemented using a getter/setter pair,
and the setter takes its argument and configures all its keys-value pairs.
In this case you again have full choice of naming convention.
So one way to configure a document object would be this:

```js
var libtidy = require("libtidy");
var doc = libtidy.TidyDoc();
doc.options = {
  forceOutput = true,
  output_xhtml = false,
};
```

## License

The project itself uses [the MIT license](LICENSE.md).
For the license of the underlying library, please see
[its license file](https://github.com/htacg/tidy-html5/blob/5.1.25/README/LICENSE.md)
