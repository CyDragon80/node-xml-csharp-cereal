'use strict'

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
    add(sub_name, sub_num)
    {
        this.SubTests.push(new SubTestObj(sub_name, sub_num));
        return this;
    }
}
class SubTestObj
{
    constructor(name, num)
    {
        this.Name = name;
        this.Number = num;
    }
}
// endregion Section 0 - Helper containers


// region Section 1 - Test class module imports
const Test0 = require('./Test0');
// endregion Section 1 - Test class module imports


// region Section 2 Test class object list
module.exports =
[
    new TestClassObj("Test0", 0, Test0)
    .add("Defaults", 0)
    .add("Set 1", 1),
/*     new TestClassObj("Test1", 1, Test0)
    .add("Defaults", 0)
    .add("Set 1", 1), */
];
// endregion Section 2 Test class object list
