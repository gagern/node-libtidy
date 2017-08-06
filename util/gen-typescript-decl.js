"use strict";

const fs = require("fs");
const path = require("path");
const libtidy = require("../");

function alphabeticalByName(a, b) {
  return a.name < b.name ? -1 : a.name > b.name ? 1 : 0;
}

function lines() {
  const doc = new libtidy.TidyDoc();
  const lines = [];
  for (let opt of doc.getOptionList().sort(alphabeticalByName)) {
    const name = opt.name.replace(/-/g, "_");
    let values = opt.pickList.map(JSON.stringify);
    if (opt.type === "integer") {
      if (values.length === 0)
        values = ["number"];
    } else if (opt.type === "string") {
      if (values.length === 0)
        values = ["string"];
    } else if (opt.type === "boolean") {
      values = ["boolean"];
    } else {
      throw Exception(`Unknown type: ${opt.type}`);
    }
    lines.push(`${name}?: ${values.join(" | ")}`);
  }
  return lines;
}

function generate() {
  return `/**
* Type for libtidy options
* @generated with /util/gen-typescript-decl.ts
*/
export namespace Generated {
  /**
  * NOTE:
  * This definition describes the dictionary as returned by the getters.
  * When setting value, a lot more is technically possible:
  *  - setting enum values by number
  *  - setting boolean values using strings like "yes"
  *  - using CamelCase instead of _ for multi-word option names
  * But none of that is advisable practice in a type-checked setup.
  */
  interface OptionDict {
    ${lines().join("\n    ")}
  }
}
`;
}

function main() {
  const dts = path.join(__dirname, "..", "src", "options.d.ts");
  const content = generate();

  fs.writeFileSync(dts, content);
  console.log(`successfully generated ${dts}`);
  process.exit(0);
}

main();
