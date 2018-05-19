'use strict'
const xml = require('../xml-csharp-cereal');

// DataContract names get messy.
// Some names get little hash suffixes

module.exports.GetFactory = function()
{
    return (new xml.XmlTemplateFactory(TestClass,SubTestClass))
        .addEnum('MyEnum', MyEnumSimple)
        .addDict('ArrayOfKeyValueOfstringint','KeyValueOfstringint',['Key','string'],['Value','int'])
        .addDict('ArrayOfArrayOfKeyValueOfstringint','KeyValueOfstringArrayOfArrayOfKeyValueOfstringintty7Ep6D1',['Key','string'],['Value','ArrayOfKeyValueOfstringint',1])
        .addDict('ArrayOfKeyValueOfstringSubTestClassjHm_ShSx9','KeyValueOfstringSubTestClassjHm_ShSx9',['Key','string'],['Value','SubTestClass'])
        .addDict('ArrayOfKeyValueOfstringArrayOfMyEnumjHm_ShSx9','KeyValueOfstringArrayOfMyEnumjHm_ShSx9', ['Key','string'], ['Value', 'MyEnum', 1])
        .addDict('ArrayOfKeyValueOfstringArrayOfKeyValueOfstringintty7Ep6D1','KeyValueOfstringArrayOfKeyValueOfstringintty7Ep6D1',['Key','string'],['Value','ArrayOfKeyValueOfstringint'])
        .applyDataContractNameSpaces("http://schemas.datacontract.org/2004/07/csharpxml.Test1");
}

class TestClass
{
    constructor()
    {
        // This constructor should mirror its C# counterpart, otherwise missing tags might result in differences due to mismatched defaults.
        // If the C# constructor leaves something null, also null it here.
        // If the C# constructor inits a member, do so here.
        //this.SomeAttr = null; // [XmlAttribute] public string SomeAttr;
        this.MyEnumProp = 0; //public MyEnum MyEnumProp; // C# inits enums as zero
        this.MyEnumArray=null; //public MyEnum[] MyEnumArray;
        this.MyBool=false;
        this.MyByte=0; //public byte MyByte;
        this.MyInt=0; //public int MyInt;
        this.MyUInt=0; //public uint MyUInt;
        this.MyLong=0; //public long MyLong;
        this.MyDouble=0; //public double MyDouble;
        this.MyNullInt; //public int? MyNullInt;
        this.MyNullIntArr; //public int?[] MyNullIntArr;
        this.MyIntArray=null; //public int[] MyIntArray;
        this.MyJagIntArray=null; //public int[][] MyJagIntArray;
        this.MyJagIntArray2=null; //public int[][][] MyJagIntArray2;
        this.MyJagEnumArray=null; //public MyEnum[][] MyJagEnumArray;
        this.MyStrList=null; //public List<string> MyStrList;

        this.MySubClass=new SubTestClass(); //public SubTestClass MySubClass
        this.MySubClassArray=null; //public SubTestClass[] MySubClassArray;
        this.MyIntDict=[]; //public SerializableDictionary<string, int> MyIntDict
        this.MyIntDictArr=null; //public SerializableDictionary<string, int>[] MyIntDictArr;
        this.MySubClassDict=[]; //public SerializableDictionary<string, SubTestClass> MySubClassDict
        this.MyEnumArrDict = null; //public SerializableDictionary<string, MyEnum[]> MyEnumArrDict;
        this.MyIntDictDict = null; //public SerializableDictionary<string, SerializableDictionary<string, int> > MyIntDictDict;
        this.MyIntDictArrDict = null; //public SerializableDictionary<string, SerializableDictionary<string, int>[]> MyIntDictArrDict;

        this.MyTime = null; // DateTime
        this.MySpan = null; // TimeSpan
    }
    static GetXmlTemplate()
    {
        var temp = new xml.XmlTemplate(this);
        //temp.addString('SomeAttr').attr();
        temp.add('MyEnumProp', 'MyEnum');
        temp.add('MyEnumArray', 'MyEnum', 1);
        temp.addBool('MyBool');
        temp.addByte('MyByte');
        temp.addInt('MyInt');
        temp.addUInt('MyUInt');
        temp.addLong('MyLong');
        temp.addDouble('MyDouble');
        temp.addInt('MyNullInt').nullable();
        temp.addInt('MyNullIntArr',1).nullable();
        temp.addInt('MyIntArray',1);
        //temp.addInt('MyJagIntArray', 2); // jagged array has two dimensions
        temp.addInt('MyJagIntArray', 2, xml.xmlNS_Array); // enum usually doesn't have namespace
        temp.addInt('MyJagIntArray2', 3, xml.xmlNS_Array);
        temp.add('MyJagEnumArray', 'MyEnum',2,"http://schemas.datacontract.org/2004/07/csharpxml.Test1");
        temp.addString('MyStrList', 1);
        temp.add('MySubClass', 'SubTestClass');
        temp.add('MySubClassArray', 'SubTestClass',1);
        temp.add('MyIntDict', 'ArrayOfKeyValueOfstringint');
        temp.add('MyIntDictArr', 'ArrayOfKeyValueOfstringint',1);
        temp.add('MySubClassDict', 'ArrayOfKeyValueOfstringSubTestClassjHm_ShSx9');
        // complex embedding?
        temp.add('MyIntDictDict', 'ArrayOfKeyValueOfstringArrayOfKeyValueOfstringintty7Ep6D1');
        temp.add('MyEnumArrDict', 'ArrayOfKeyValueOfstringArrayOfMyEnumjHm_ShSx9');
        temp.add('MyIntDictArrDict', 'ArrayOfArrayOfKeyValueOfstringint');
        temp.addDateTime('MyTime');
        temp.addTimeSpan('MySpan');
        temp.sortByName(); // cheat to avoid re-ordering these properly (won't be an option with derived classes)
        return temp;
    }
}
module.exports.TestClass=TestClass;

class SubTestClass
{
    constructor()
    {
        //this.SubAttr=0; // [XmlAttribute] public int SubAttr;
        //this.SubAttr2=null; // [XmlAttribute] public string SubAttr2;
        this.MySubInt=0; //public int MySubInt;
        this.MySubStr=null; //public string MySubStr;
    }
    static GetXmlTemplate()
    {
        var temp = new xml.XmlTemplate(this);
        //temp.addInt('SubAttr').attr();
        //temp.addString('SubAttr2').attr();
        temp.addInt('MySubInt');
        temp.addString('MySubStr');
        return temp;
    }
}
module.exports.SubTestClass=SubTestClass;

const MyEnumSimple = { zero:0, one:1, two:2, three:3 }
