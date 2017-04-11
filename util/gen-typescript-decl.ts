/**
 * Generate TypeScript decl for options in node-libtidy (https://github.com/gagern/node-libtidy)
 * @author Wang Guan <momocraft@gmail.com>
 */

import * as fs from 'fs';
import * as path from 'path';
import * as dom from 'dts-dom';
import * as chai from 'chai';

// a bootstrap declaration is required to call libtidy.TidyDoc.getOptionList()
import * as libtidy from '../';

/**
 * Main entrypoint: generate and update ../src/index.d.ts
 */
function main() {
    var dts = path.join(__dirname, ...'../src/index.d.ts'.split('/'));
    var oldContent = fs.readFileSync(dts, "utf-8")
        .split('// START-GENERATED-NAMESPACE')[0];
    var newContent = oldContent + `// START-GENERATED-NAMESPACE
// The rest of this file is generated.
` + generate();
    fs.writeFileSync(dts, newContent);
}

main();
process.exit(0);

/**
 * Create type for union of constants
 * @return dom.Type
 */
function createConstUnion(values: (number | string)[]) {
    const v = values.map(_ => typeof _ === "string" ? JSON.stringify(_) : _);
    const u = v.map(_ => dom.create.namedTypeReference(<any>v));
    return dom.create.union(u);
}

/**
 * Change "skip-nested" to "skip_nested"
 * @param optionName option name in '-' notation
 */
function underscoreName(optionName: string) {
    return optionName.replace(/-/g, '_');
}

function upperFirst(word: string) {
    return word.replace(/(^.)/, (m: any, $1: string) => $1.toUpperCase());
}

function uniq<T>(items: T[], eq?: (a1: T, a2: T) => boolean) {
    const result: T[] = [];
    for (const i of items) {
        if (!result.some(v => eq ? eq(i, v) : i === v))
            result.push(i);
    }
    return result;
}

/**
 * Change "skip-nested" to "skip_nested"
 */
function camelCaseName(optionName: string) {
    return optionName
        .split('-')
        .map(upperFirst)
        .join('');
}

/**
 * Enumerate variants of option name
 *
 * @param {string} optionName
 * @returns {string[]} variants
 */
function enumerateNames(optionName: string) {
    const name1 = optionName;
    const name2 = underscoreName(optionName);
    const name3 = camelCaseName(optionName);
    return uniq([name1, name2, name3]);
}

/**
 *
 *
 * @param {libtidy.TidyOption} o the option
 * @returns {dom.Type} A union type that can be used to set/get the option
 */
function nameUnion(o: libtidy.TidyOption): dom.Type {
    const names = enumerateNames(o.name).map(n => JSON.stringify(n));

    const t = (names.length === 1)
        ? dom.create.namedTypeReference(names[0])
        : dom.create.union(names.map(dom.create.namedTypeReference));
    return t;
}

/**
 * create a type for available option values
 * @param o
 */
function valueType(o: libtidy.TidyOption): dom.Type {

    switch (o.type) {
        case "integer":
        case "boolean":
        case "string":
            break;
        default:
            throw new Error(`not implemented`);
    }

    if (o.type === "integer") {
        if (!o.pickList.length) {
            return dom.create.namedTypeReference("number");
        }

        // If the picklist
        const pickListNumbers = o.pickList
            .map(v => +(v.match(/^\d+/) || [])[0]);

        if (pickListNumbers.every(v => !isNaN(v))) {
            const u = pickListNumbers.map(<any>dom.create.namedTypeReference);
            return dom.create.union(<any>u);
        } else {
            const u = o.pickList
                .map(v => JSON.stringify(v))
                .map(<any>dom.create.namedTypeReference);
            return dom.create.union(<any>u);
        }
    } else if (o.type === "string") {

        if (!o.pickList.length) {
            return dom.create.namedTypeReference("string");
        }
        return dom.create.union(
            o.pickList.map(v => dom.create.namedTypeReference(JSON.stringify(v)))
        )

    } else if (o.type === "boolean") {
        return dom.create.namedTypeReference("boolean");
    }

    console.error(o);
    throw new Error(`not implemented`);
}

/**
 *
 *
 * @returns {string} A long string of `namespace Generated ...`
 */
function generate(): string {
    const doc = new libtidy.TidyDoc() as any;
    const options = doc.getOptionList();

    const nm = dom.create.namespace("Generated");
    nm.flags = dom.DeclarationFlags.None;
    nm.jsDocComment = `
Type for libtidy options
@generated with /util/gen-typescript-decl.ts
    `.trim();

    // type of TidyDoc.options
    const optionDict = dom.create.interface("OptionDict");
    // optGet / optSet overloads in TidyDoc
    const optAccessors = dom.create.interface('TidyDocOption');

    // cowardly see if boolean options are boolean
    for (const o of options) {
        if (o.type === "boolean") {
            chai.expect(typeof doc.optGet(o)).eq("boolean");
            chai.expect(typeof doc.optGet(o.name)).eq("boolean");
        }
    }

    for (const o of options) {
        const values = valueType(o);
        const v = dom.create.alias(underscoreName(o.name), values);

        const getOpt = dom.create.method("optGet",
            [dom.create.parameter("key", nameUnion(o))],
            valueType(o));

        getOpt.jsDocComment = o.name;

        optAccessors.members.push(getOpt)

        optAccessors.members.push(
            dom.create.method("optSet",
                [dom.create.parameter("key", nameUnion(o)), dom.create.parameter("value", valueType(o))],
                dom.create.namedTypeReference("void")
            )
        )

        optionDict.members.push(
            dom.create.property(
                underscoreName(o.name),
                valueType(o),
                dom.DeclarationFlags.Optional));

        optionDict.members.push(
            dom.create.property(
                camelCaseName(o.name),
                valueType(o),
                dom.DeclarationFlags.Optional));
    }
    nm.members.push(optAccessors);
    nm.members.push(optionDict);
    return dom.emit(nm)
        .replace(/\r\n/g, "\n");
}
