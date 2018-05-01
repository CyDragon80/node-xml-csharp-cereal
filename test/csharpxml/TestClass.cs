using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

/*
 * This a TestClass to serialize.
 * It is the default test case, or test number zero.
 * 
 */

namespace csharpxml
{
    // NOTE: if enum does not handle zero and enum prop is not given initial non-zero value, serializer throws.
    //public enum MyEnum { zero=0, one=1, two=2, three=3 };
    public class TestClass : XmlTestObject<TestClass>
    {
        //public MyEnum MyEnumProp;
        public int MyInt;
        public double MyDouble;
        public int[] MyIntArray;
        public int[][] MyJagIntArray;

        public SubTestClass MySubClass = new SubTestClass();
        public SubTestClass[] MySubClassArray;
        public SerializableDictionary<string, int> MyIntDict = new SerializableDictionary<string, int>();
        public SerializableDictionary<string, int>[] MyIntDictArr;
        public SerializableDictionary<string, SubTestClass> MySubClassDict = new SerializableDictionary<string, SubTestClass>();

        public override void PopulateTestObject(int subtest)
        {
            switch (subtest)
            {
                case 0:
                    MyInt = 1;
                    MyDouble = 2.5;
                    MyIntArray = new int[] { 3, 4, 5 };
                    MyJagIntArray = new int[][]
                    {
                        new int[] { 6, 7, 8 },
                        new int[] { 9, 10 },
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
                    break;
                default:
                    break;
            }
        }
    } // END CLASS: TestClass

    public class SubTestClass
    {
        public int MySubInt;
        public string MySubStr;

        public void Populate(int test)
        {
            MySubInt = test * 30 + 15;
            MySubStr = "SubClass string " + test.ToString();
        }
    } // END CLASS: SubTestClass
}
