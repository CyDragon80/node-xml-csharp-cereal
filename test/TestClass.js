'use strict'
const xml = require('../xml-csharp-cereal');

module.exports.GetFactory = function()
{
    return new xml.XmlTemplateFactory(TestClass,SubTestClass);
}

class TestClass
{
    constructor()
    {
        this.MyInt=0; //public int MyInt;
        this.MyDouble=0; //public double MyDouble;
        this.MyIntArray=[]; //public int[] MyIntArray;
        this.MyJagIntArray=[]; //public int[][] MyJagIntArray;

        this.MySubClass=null; //public SubTestClass MySubClass
        this.MySubClassArray=[]; //public SubTestClass[] MySubClassArray;
        this.MyIntDict=null; //public SerializableDictionary<string, int> MyIntDict
        this.MyIntDictArr=[]; //public SerializableDictionary<string, int>[] MyIntDictArr;
        this.MySubClassDict=null; //public SerializableDictionary<string, SubTestClass> MySubClassDict
    }
    static GetXmlTemplate()
    {
        var temp = new xml.XmlTemplate(this);
        temp.addInt('MyInt');
        temp.addDouble('MyDouble');
        temp.addInt('MyIntArray', true);
        temp.addInt('MyJagIntArray',true);// TODO - jag arrays
        temp.add('MySubClass', 'SubTestClass');
        temp.add('MySubClassArray', 'SubTestClass', true);
        temp.addDict('MyIntDict', false, '', 'KeyValuePair', 'Key', 'string', 'Value', 'int');
        temp.addDict('MyIntDictArr', true, 'SerializableDictionaryOfStringInt32', 'KeyValuePair', 'Key', 'string', 'Value', 'int');
        temp.addDict('MySubClassDict', false, '', 'KeyValuePair', 'Key', 'string', 'Value', 'SubTestClass');
        return temp;
    }
}
module.exports.TestClass=TestClass;

class SubTestClass
{
    constructor()
    {
        this.MySubInt=0; //public int MySubInt;
        this.MySubStr=null; //public string MySubStr;
    }
    static GetXmlTemplate()
    {
        var temp = new xml.XmlTemplate(this);
        temp.addInt('MySubInt');
        temp.addString('MySubStr');
        return temp;
    }    
}
module.exports.SubTestClass=SubTestClass;
