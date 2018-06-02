'use strict'

const csharp = require('./csharp-test');
const path = require('path');
const test_xml_cs = path.join(__dirname,"temp_cs.xml"); // use two files so we can compare if we want
const test_xml_js = path.join(__dirname,"temp_js.xml");

// "Supported XML librarys"
const XmlLibs = require('./list_xml_libs');

// "TestClasses"
const TestClassList = require('./list_test_classes');



for (let i=0; i<XmlLibs.length; ++i)
{
    let cur_xml_obj = XmlLibs[i];
    describe('C# Serialization with xml library: ' + cur_xml_obj.Name, function()
    {
        for (let t=0; t<TestClassList.length; ++t)
        {
            let cur_class_obj = TestClassList[t];
            describe('Class set: ' + cur_class_obj.Name, function()
            {
                for (let s=0; s<cur_class_obj.SubTests.length; ++s)
                {
                    let sub_test_obj = cur_class_obj.SubTests[s];
                    it('should serialize with value set: ' + sub_test_obj.Name, function()
                    {
                        //return RunTest(TestClass0,lib_xml2js,0,0);
                        return RunTest(cur_class_obj.Module, cur_xml_obj.Module, cur_class_obj.Number, sub_test_obj.Number, sub_test_obj.Options);
                    });
                }
            });
        }
    });
}

function RunTest(test_class,xml_lib,test_number,subtest_number,opts)
{
    let test_factory = test_class.GetFactory();
    // first have csharp generate xml
    return csharp.SaveTestXml(test_number,subtest_number,test_xml_cs).then(()=>
    {
        // we read the xml
        return xml_lib.LoadFromXml(test_factory,test_xml_cs,opts);
    }).then((obj)=>
    {
        // we write the xml
        return xml_lib.SaveToXml(obj,test_factory,test_xml_js,opts);
    }).then(()=>
    {
        // csharp verifies the xml
        return csharp.LoadTestXml(test_number,subtest_number,test_xml_js);
    });
}
