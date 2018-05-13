using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Runtime.Serialization; // DataContractSerializer (which we may or may not use)
using System.Xml.Serialization;
//using System.ServiceModel;

namespace csharpxml.Test1
{
    // NOTE: if enum does not handle zero and enum prop is not given initial non-zero value, serializer throws.
    public enum MyEnum { zero = 0, one = 1, two = 2, three = 3 };
    [DataContract]
    //[XmlSerializerFormat] // XML attributes in DataContract is largely a hack
    public class TestClass : XmlTestObject<TestClass>
    {
        //[DataMember, XmlAttribute]
        //public string SomeAttr;
        [DataMember]
        public MyEnum MyEnumProp;
        [DataMember]
        public MyEnum[] MyEnumArray;
        [DataMember]
        public bool MyBool;
        [DataMember]
        public byte MyByte;
        [DataMember]
        public int MyInt;
        [DataMember]
        public uint MyUInt;
        [DataMember]
        public long MyLong;
        [DataMember]
        public double MyDouble;
        [DataMember]
        public int? MyNullInt;
        [DataMember]
        public int?[] MyNullIntArr;
        [DataMember]
        public int[] MyIntArray;
        [DataMember]
        public int[][] MyJagIntArray;
        [DataMember]
        public MyEnum[][] MyJagEnumArray;

        [DataMember]
        public SubTestClass MySubClass = new SubTestClass();
        [DataMember]
        public SubTestClass[] MySubClassArray;
        [DataMember]
        public Dictionary<string, int> MyIntDict = new Dictionary<string, int>();
        [DataMember]
        public Dictionary<string, int>[] MyIntDictArr;
        [DataMember]
        public Dictionary<string, SubTestClass> MySubClassDict = new Dictionary<string, SubTestClass>();
        [DataMember]
        public Dictionary<string, MyEnum[]> MyEnumArrDict;
        [DataMember]
        public Dictionary<string, Dictionary<string, int>> MyIntDictDict;
        [DataMember]
        public Dictionary<string, Dictionary<string, int>[]> MyIntDictArrDict;

        public override void PopulateTestObject(int subtest)
        {
            switch (subtest)
            {
                case 0:
                    // run with constructor defaults
                    break;
                case 1:
                    //SomeAttr = "att";
                    MyEnumProp = MyEnum.three;
                    MyEnumArray = new MyEnum[] { MyEnum.one, MyEnum.two };
                    MyBool = true;
                    MyInt = 1;
                    MyNullInt = 42;
                    MyNullIntArr = new int?[] { 43, null, 45 };
                    MyByte = byte.MaxValue;
                    MyUInt = uint.MaxValue;
                    MyLong = long.MaxValue;
                    MyDouble = double.MaxValue;
                    MyIntArray = new int[] { 3, 4, 5 };
                    MyJagIntArray = new int[][]
                    {
                        new int[] { 6, 7, 8 },
                        new int[] { 9, 10 },
                    };
                    MyJagEnumArray = new MyEnum[][]
                    {
                        new MyEnum[] { MyEnum.one, MyEnum.two},
                        new MyEnum[] { MyEnum.three }
                    };
                    MySubClass.Populate(-1);
                    MySubClassArray = new SubTestClass[2];
                    for (int i = 0; i < MySubClassArray.Length; ++i)
                    {
                        MySubClassArray[i] = new SubTestClass();
                        MySubClassArray[i].Populate(i);
                    }
                    MyIntDict.Add("first", 55);
                    MyIntDict.Add("second", 65);
                    MyIntDictArr = new Dictionary<string, int>[2];
                    for (int i = 0; i < MyIntDictArr.Length; ++i)
                    {
                        MyIntDictArr[i] = new Dictionary<string, int>();
                        MyIntDictArr[i].Add("item1-" + i.ToString(), i * 9);
                        MyIntDictArr[i].Add("item2-" + i.ToString(), i * 19);
                    }
                    var sub = new SubTestClass();
                    sub.Populate(11);
                    MySubClassDict.Add("subclass", sub);
                    MyEnumArrDict = new Dictionary<string, MyEnum[]>();
                    MyEnumArrDict.Add("EnumKey", new MyEnum[] { MyEnum.three, MyEnum.two, MyEnum.one });
                    // good lord
                    MyIntDictDict = new Dictionary<string, Dictionary<string, int>>();
                    MyIntDictDict.Add("really", MyIntDict);
                    // stop, please
                    MyIntDictArrDict = new Dictionary<string, Dictionary<string, int>[]>();
                    MyIntDictArrDict.Add("yes", MyIntDictArr);
                    break;
                default:
                    break;
            }
        }
    } // END CLASS: TestClass

    [DataContract]
    public class SubTestClass
    {
        /*[DataMember, XmlAttribute]
        public int SubAttr;
        [DataMember, XmlAttribute]
        public string SubAttr2;*/
        [DataMember]
        public int MySubInt;
        [DataMember]
        public string MySubStr;

        public void Populate(int test)
        {
            //SubAttr = test * 9;
            //SubAttr2 = "att_" + test.ToString();
            //SubAttr3 = test * 42;
            MySubInt = test * 30 + 15;
            MySubStr = "SubClass string " + test.ToString();
        }
    } // END CLASS: SubTestClass

} // END NAMESPACE
