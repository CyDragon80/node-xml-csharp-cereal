using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Xml.Serialization;

/*
 * This a test class to serialize.
 * It is the default test case, or test number zero.
 * 
 */

namespace csharpxml.Test0
{
    // NOTE: if enum does not handle zero and enum prop is not given initial non-zero value, serializer throws.
    public enum MyEnum { zero=0, one=1, two=2, three=3 };
    public class TestClass : XmlTestObject<TestClass>
    {
        [XmlAttribute]
        public string SomeAttr;
        public MyEnum MyEnumProp;
        public MyEnum[] MyEnumArray;
        public bool MyBool;
        public byte MyByte;
        public int MyInt;
        public uint MyUInt;
        public long MyLong;
        public double MyDouble;
        public int[][][] MyJagIntArray2; // moving this up here to avoid tag renaming by nullables below
        public int? MyNullInt;
        public int?[] MyNullIntArr; // NOTE: if this nullable array occurs before MyJagIntArray, MyJagIntArray's tags become "ArrayOfInt1" instead of "ArrayOfInt"
        public int[] MyIntArray;
        [XmlArrayItem(ElementName = "ArrayOfInt", IsNullable = false, Type = typeof(int[]))] // this prevents bug described above
        public int[][] MyJagIntArray;
        public MyEnum[][] MyJagEnumArray;
        public List<string> MyStrList = new List<string>(); // fun fact, XmlSerializer will construct one regardless of whether any tag is there

        public SubTestClass MySubClass = new SubTestClass();
        public SubTestClass[] MySubClassArray;
        public SerializableDictionaryTyped<string, int> MyIntDictTyped = new SerializableDictionaryTyped<string, int>();
        public SerializableDictionary<string, int> MyIntDict = new SerializableDictionary<string, int>();
        public SerializableDictionary<string, int>[] MyIntDictArr;
        public SerializableDictionary<string, SubTestClass> MySubClassDict = new SerializableDictionary<string, SubTestClass>();
        public SerializableDictionary<string, MyEnum[]> MyEnumArrDict;
        public SerializableDictionary<string, SerializableDictionary<string, int> > MyIntDictDict;
        public SerializableDictionary<string, SerializableDictionary<string, int>[]> MyIntDictArrDict;

        public SerializableDateTime MyTime;
        public SerializableTimeSpan MySpan;
        /*[XmlArrayItem(ElementName = "DateTime", Type = typeof(SerializableDateTime))]
        public SerializableDateTime[] MyTimes;*/

        public override void PopulateTestObject(int subtest)
        {
            switch (subtest)
            {
                case 0:
                    // run with constructor defaults
                    break;
                case 1:
                    //var tm = new DateTime(2018, 12, 25, 13, 30, 15, 750, DateTimeKind.Utc);
                    //var tm = new DateTime(2018, 12, 25, 13, 30, 15, 750, DateTimeKind.Local);
                    var tm = new DateTime(2018, 12, 25, 13, 30, 15, 750);
                    MyTime = new SerializableDateTime(tm);
                    MySpan = new SerializableTimeSpan(TimeSpan.FromMilliseconds(123456789));
                    /*MyTimes = new SerializableDateTime[]
                    {
                        new SerializableDateTime("5/30/2018 5:30PM"),
                        new SerializableDateTime("5/30/2018 6:30PM")
                    };*/
                    SomeAttr = "att";
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
                    MyJagIntArray2 = new int[][][]
                    {
                        new int[][]{ new int[] {11,22}, new int[] {33,44} },
                        new int[][]{ new int[] {55,66}, new int[] {77,88} },
                    };
                    MyJagEnumArray = new MyEnum[][]
                    {
                        new MyEnum[] { MyEnum.one, MyEnum.two},
                        new MyEnum[] { MyEnum.three }
                    };
                    MyStrList = new List<string>();
                    MyStrList.Add("List0");
                    MyStrList.Add("List1");
                    MySubClass.Populate(-1);
                    MySubClassArray = new SubTestClass[3];
                    for (int i = 0; i < MySubClassArray.Length-1; ++i)
                    {
                        MySubClassArray[i] = new SubTestClass();
                        MySubClassArray[i].Populate(i);
                    }
                    MyIntDict.Add("first", 55);
                    MyIntDict.Add("second", 65);
                    MyIntDictTyped.Add("third", 75);
                    MyIntDictTyped.Add("fourth", 85);
                    MyIntDictArr = new SerializableDictionary<string, int>[2];
                    for (int i = 0; i < MyIntDictArr.Length; ++i)
                    {
                        MyIntDictArr[i] = new SerializableDictionary<string, int>();
                        MyIntDictArr[i].Add("item1-" + i.ToString(), i * 9);
                        MyIntDictArr[i].Add("item2-" + i.ToString(), i * 19);
                    }
                    var sub = new SubTestClass();
                    sub.Populate(11);
                    MySubClassDict.Add("subclass", sub);
                    MyEnumArrDict = new SerializableDictionary<string, MyEnum[]>();
                    MyEnumArrDict.Add("EnumKey", new MyEnum[] { MyEnum.three, MyEnum.two, MyEnum.one });
                    // good lord
                    MyIntDictDict = new SerializableDictionary<string, SerializableDictionary<string, int>>();
                    MyIntDictDict.Add("really", MyIntDict);
                    // stop, please
                    MyIntDictArrDict = new SerializableDictionary<string, SerializableDictionary<string, int>[]>();
                    MyIntDictArrDict.Add("yes", MyIntDictArr);
                    break;
                default:
                    break;
            }
        }
    } // END CLASS: TestClass

    public class SubTestClass
    {
        [XmlAttribute]
        public int SubAttr;
        [XmlAttribute]
        public string SubAttr2;
        /* serializer doesn't do nullable attributes
        [XmlAttribute]
        public int? SubAttr3;*/
        public int MySubInt;
        public string MySubStr;

        public void Populate(int test)
        {
            SubAttr = test * 9;
            SubAttr2 = "att_" + test.ToString();
            //SubAttr3 = test * 42;
            MySubInt = test * 30 + 15;
            MySubStr = "SubClass string " + test.ToString();
        }
    } // END CLASS: SubTestClass

} // END NAMESPACE
