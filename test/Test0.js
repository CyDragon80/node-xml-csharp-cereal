'use strict'
const xml = require('../xml-csharp-cereal');
const Long = require("long"); // to test simple decode/encode overrides

// Just a big mash up of stuff for XmlSerializer

module.exports.GetFactory = function()
{
    return (new xml.XmlTemplateFactory(TestClass, SubTestClass))
        //.addEnum('MyEnum', MyEnumSimple)
        .addEnum('MyEnum', MyEnumExplicit)
        //.addDict('SerializableDictionaryOfStringInt32','KeyValuePair', new xml.XmlTemplateItem('Key','string'),new xml.XmlTemplateItem('Value','int'))
        .addDict('SerializableDictionaryOfStringInt32','KeyValuePair',['Key','string'],['Value','int'])
        .addDict('SerializableDictionaryTypedOfStringInt32','KeyValuePair',['Key','string'],['Value','int'], null, true)
        // is same as .addDictQuick('SerializableDictionaryOfStringInt32','int')
        .addDictQuick('SerializableDictionaryOfStringSerializableDictionaryOfStringInt32','SerializableDictionaryOfStringInt32')
        .addDictQuick('SerializableDictionaryOfStringSubTestClass','SubTestClass')
        .addDictQuick('SerializableDictionaryOfStringArrayOfMyEnum',['Value','MyEnum',1])
        .addDictQuick('SerializableDictionaryOfStringArrayOfSerializableDictionaryOfStringInt32',['Value','SerializableDictionaryOfStringInt32', 1])
        // defaults for long are to decode/encode as string, override with Long.js for this test
        .setSimpleCodec(['long', 'Int64'], decodeLongjs, encodeLongjs)
        .setSimpleCodec(['ulong', 'UInt64'], decodeULongjs, encodeULongjs);
}

class TestClass
{
    constructor()
    {
        // This constructor should mirror its C# counterpart, otherwise missing tags might result in differences due to mismatched defaults.
        // If the C# constructor leaves something null, also null it here.
        // If the C# constructor inits a member, do so here.
        this.SomeAttr = null; // [XmlAttribute] public string SomeAttr;
        this.MyEnumProp = 0; //public MyEnum MyEnumProp; // C# inits enums as zero
        this.MyEnumArray=null; //public MyEnum[] MyEnumArray;
        this.MyBool=false;
        this.MyByte=0; //public byte MyByte;
        this.MyInt=0; //public int MyInt;
        this.MyUInt=0; //public uint MyUInt;
        this.MyLong=0; //public long MyLong;
        this.MyDouble=0; //public double MyDouble;
        this.MyNullInt; //public int? MyNullInt;
        // C# Bug?: if int?[] occurs before int[][], int[][] becomes "ArrayOfInt1" instead of "ArrayOfInt" ?
        // This bug can be avoided by using [XmlArrayItem(ElementName = "ArrayOfInt", IsNullable = false, Type = typeof(int[]))] on MyJagIntArray
        this.MyNullIntArr; //public int?[] MyNullIntArr;
        this.MyIntArray=null; //public int[] MyIntArray;
        this.MyJagIntArray=null; //public int[][] MyJagIntArray;
        this.MyJagIntArray2=null; //public int[][][] MyJagIntArray2;
        this.MyJagEnumArray=null; //public MyEnum[][] MyJagEnumArray;
        this.MyStrList=null; //public List<string> MyStrList; - NOTE: it seems XmlSerializer will create a list on the other side regardless of whether a tag is actually present in XML

        this.MySubClass=new SubTestClass(); //public SubTestClass MySubClass
        this.MySubClassArray=null; //public SubTestClass[] MySubClassArray;
        this.MyIntDict=[]; //public SerializableDictionary<string, int> MyIntDict
        this.MyIntDictTyped=[]; //public SerializableDictionaryTyped<string, int> MyIntDictTyped
        this.MyIntDictArr=null; //public SerializableDictionary<string, int>[] MyIntDictArr;
        this.MySubClassDict=[]; //public SerializableDictionary<string, SubTestClass> MySubClassDict
        this.MyEnumArrDict = null; //public SerializableDictionary<string, MyEnum[]> MyEnumArrDict;
        this.MyIntDictDict = null; //public SerializableDictionary<string, SerializableDictionary<string, int> > MyIntDictDict;
        this.MyIntDictArrDict = null; //public SerializableDictionary<string, SerializableDictionary<string, int>[]> MyIntDictArrDict;

        this.MyTime = null; // DateTime
        this.MySpan = null; // TimeSpan
    }
    static getXmlTemplate()
    {
        var temp = new xml.XmlTemplate(this);
        temp.addString('SomeAttr').attr();
        temp.add('MyEnumProp', 'MyEnum');
        temp.add('MyEnumArray', 'MyEnum', 1);
        temp.addBool('MyBool');
        temp.addByte('MyByte');
        temp.addInt('MyInt');
        temp.addUInt('MyUInt');
        temp.addLong('MyLong');
        temp.addDouble('MyDouble');
        temp.addInt('MyJagIntArray2', 3);
        temp.addInt('MyNullInt').nullable();
        temp.addInt('MyNullIntArr', 1).nullable();
        temp.addInt('MyIntArray', 1)
        //temp.addInt('MyJagIntArray', 2); // jagged array has two dimensions
        temp.addInt('MyJagIntArray', ['int','ArrayOfInt']);
        temp.add('MyJagEnumArray', 'MyEnum', 2);
        temp.addString('MyStrList', 1);
        temp.add('MySubClass', 'SubTestClass');
        temp.add('MySubClassArray', 'SubTestClass', 1);
        temp.add('MyIntDictTyped', 'SerializableDictionaryTypedOfStringInt32');
        temp.add('MyIntDict', 'SerializableDictionaryOfStringInt32');
        temp.add('MyIntDictArr', 'SerializableDictionaryOfStringInt32', 1);
        temp.add('MySubClassDict', 'SerializableDictionaryOfStringSubTestClass');
        // complex embedding?
        temp.add('MyEnumArrDict', 'SerializableDictionaryOfStringArrayOfMyEnum');
        temp.add('MyIntDictDict', 'SerializableDictionaryOfStringSerializableDictionaryOfStringInt32');
        temp.add('MyIntDictArrDict', 'SerializableDictionaryOfStringArrayOfSerializableDictionaryOfStringInt32');
        temp.addDateTime('MyTime');
        temp.addTimeSpan('MySpan');
        return temp;
    }
}
module.exports.TestClass=TestClass;

class SubTestClass
{
    constructor()
    {
        this.SubAttr=0; // [XmlAttribute] public int SubAttr;
        this.SubAttr2=null; // [XmlAttribute] public string SubAttr2;
        this.MySubInt=0; //public int MySubInt;
        this.MySubStr=null; //public string MySubStr;
    }
    static getXmlTemplate()
    {
        var temp = new xml.XmlTemplate(this);
        temp.addInt('SubAttr').attr();
        temp.addString('SubAttr2').attr();
        temp.addInt('MySubInt');
        temp.addString('MySubStr');
        return temp;
    }
}
module.exports.SubTestClass=SubTestClass;

// Two ways to provide an enum definition
const MyEnumSimple = { zero:0, one:1, two:2, three:3 }
const MyEnumExplicit =
{
    getEnumValue: function(n)
    {
        var lut = { zero:0, one:1, two:2, three:3 };
        if (lut[n]==undefined) return null; // decode will likely throw if raw value cannot be determined
        return lut[n];
    },
    getEnumName: function(v)
    {
        var lut = { 0:'zero', 1:'one', 2:'two', 3:'three' }
        if (lut[v]==undefined) return v;  // could return raw value, or return null and encode will throw Error
        return lut[v];
    }
}

// examples of decode/encode overrides (using Long.js for 64 bit integers)
function decodeLongjs(val)
{
    // parse XML value into Long instance
    if (val == null) return null; // handle nullable
    return Long.fromValue(val, false); // let it throw on error
}
function encodeLongjs(val)
{
    // output Long as string for XML node
    if (val == null) return null; // handle nullable
    // if not Long instance already, try to parse into a Long
    val = Long.fromValue(val, false);
    return val.toString(); // let it throw on error
}
function decodeULongjs(val)
{
    // parse XML value into Long instance
    if (val == null) return null; // handle nullable
    return Long.fromValue(val, true); // let it throw on error
}
function encodeULongjs(val)
{
    // output Long as string for XML node
    if (val == null) return null; // handle nullable
    // if not Long instance already, try to parse into a Long
    val = Long.fromValue(val, true);
    return val.toString(); // let it throw on error
}
