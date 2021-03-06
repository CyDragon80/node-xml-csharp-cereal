'use strict'
const xml = require('../xml-csharp-cereal');

/*
 To add test class and/or value set:
 1. Create module file that exportsGetFactory() returning XmlTemplateFactory
 2. Import module file under Sectio 1 below.
 3. Add instance of TestClassObj to list in Section 2 below.
    (Include any sub test value sets in TestClassObj instance)
*/

// region Section 0 - Helper containers
class TestClassObj
{
    constructor(name, num, mod, subtests)
    {
        this.Name = name;
        this.Number = num;
        this.Module = mod;
        this.SubTests = (Array.isArray(subtests) ? subtests : []);
    }
    add(sub_name, sub_num, opts)
    {
        this.SubTests.push(new SubTestObj(sub_name, sub_num, opts));
        return this;
    }
}
class SubTestObj
{
    constructor(name, num, opts)
    {
        this.Name = name;
        this.Number = num;
        this.Options = opts;
    }
}
// endregion Section 0 - Helper containers


// region Section 1 - Test class module imports
const Test0 = require('./Test0');
const Test1 = require('./Test1');
const Test2 = require('./Test2');
const Test3 = require('./Test3');
const Test4 = require('./Test4');
const Test5 = require('./Test5');
// endregion Section 1 - Test class module imports


// region Section 2 Test class object list
module.exports =
[
    new TestClassObj("General XmlSerializer", 0, Test0)
    .add("Defaults", 0)
    .add("Set 1", 1),
    new TestClassObj("General DataContractSerializer", 1, Test1)
    .add("Defaults", 0, {XmlMode:xml.xmlModes.DataContractSerializer})
    .add("Set 1", 1, {XmlMode:xml.xmlModes.DataContractSerializer}),
    new TestClassObj("Derived XmlSerializer", 2, Test2)
    .add("Defaults", 0)
    .add("Normal Set", 1)
    .add("Derived Set", 2),
    new TestClassObj("Derived DataContractSerializer", 3, Test3)
    .add("Defaults", 0, {XmlMode:xml.xmlModes.DataContractSerializer})
    .add("Normal Set", 1, {XmlMode:xml.xmlModes.DataContractSerializer})
    .add("Derived Set", 2, {XmlMode:xml.xmlModes.DataContractSerializer}),
    new TestClassObj("NameSpaces DataContractSerializer", 4, Test4)
    .add("Defaults", 0, {XmlMode:xml.xmlModes.DataContractSerializer})
    .add("Normal Set", 1, {XmlMode:xml.xmlModes.DataContractSerializer})
    .add("Derived Set", 2, {XmlMode:xml.xmlModes.DataContractSerializer}),
    new TestClassObj("DBus Introspect Example", 5, Test5)
    .add("Defaults", 0)
    .add("Set 1", 1),
];
// endregion Section 2 Test class object list
