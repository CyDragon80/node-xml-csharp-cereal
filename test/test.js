'use strict'

const csharp = require('./csharp-test');
const path = require('path');
const test_xml = path.join(__dirname,"temp.xml");

// region "Supported XML librarys" -----
// Must provide:
// - SaveToXml(obj, XmlFactory, fname)
// - LoadFromXml(XmlFactory, fname) returning resulting object
const lib_xml2js = require('./test_xml2js');

const XmlLibs = 
{
    'xml2js': lib_xml2js,
};
// endregion "Supported XML librarys" -----

// region "TestClasses" -----
// Must provide GetFactory() returning XmlTemplateFactory
const TestClass0 = require('./TestClass');

const TestClassList =
{
    "Test0": TestClass0,
};
// endregion "TestClasses" -----

// TODO - figure out how to loop each test on each xml library

describe('C# Serialization with xml2js', function()
{
    describe('Test 0.0', function(done)
    {
        it('should load test 0.0 xml successfully', function()
        {
            //return csharp.PrepAndLoad(0,0,test_xml);
            return RunTest(TestClass0,lib_xml2js,0,0);
        });
    });
});


function RunTest(test_class,xml_lib,test_number,subtest_number)
{
    let test_factory = test_class.GetFactory();
    // first have csharp generate xml
    return csharp.SaveTestXml(test_number,subtest_number,test_xml).then(()=>
    {
        // we read the xml
        return xml_lib.LoadFromXml(test_factory,test_xml);
    }).then((obj)=>
    {
        // we write the xml
        return xml_lib.SaveToXml(obj,test_factory,test_xml);
    }).then(()=>
    {
        // csharp verifies the xml
        return csharp.LoadTestXml(test_number,subtest_number,test_xml);
    });
}
