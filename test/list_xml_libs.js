'use strict'

/*
 To add XML library:
 1. Create module file that exports:
 - SaveToXml(obj, XmlFactory, fname)
 - LoadFromXml(XmlFactory, fname) returning resulting object
 2. Import module file under Sectio 1 below.
 3. Add instance of XmlLibObj to list in Section 2 below.
*/

/**
 * Just a little wrapper around the xml library module that provides a description for test to use.
 */
class XmlLibObj
{
    constructor(name, mod)
    {
        if (typeof(name)!='string'&&!(name instanceof String)) throw new Error("XmlLibObj(name,mod) name must be string");
        if (typeof(mod)!='object'||typeof(mod.SaveToXml)!='function')  throw new Error("XmlLibObj(name,mod) mod must be object with SaveToXml(obj, XmlFactory, fname)");
        if (typeof(mod)!='object'||typeof(mod.LoadFromXml)!='function')  throw new Error("XmlLibObj(name,mod) mod must be object with LoadFromXml(XmlFactory, fname) returning resulting object");
        this.Name = name;
        this.Module = mod;
    }
}



// region Section 1 - XML Library module imports
const lib_xml2js = require('./test_xml2js');
// endregion Section 1 - XML Library module imports



// region Section 2 XML Library object list
module.exports = 
[
    new XmlLibObj("xml2js", lib_xml2js),
];
// endregion Section 2 XML Library object list

