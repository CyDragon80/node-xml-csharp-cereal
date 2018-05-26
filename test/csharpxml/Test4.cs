using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Runtime.Serialization; // DataContractSerializer (which we may or may not use)

namespace csharpxml.Test4
{
    [DataContract]
    public class Person
    {
        [DataMember]
        public string Name;
        [DataMember]
        public int Age;

        public Person() { }
        public Person(string n, int a) { Name = n; Age = a; }
    }
    [DataContract]
    public class SuperHero : Person
    {
        [DataMember]
        public string SuperName;
        public SuperHero() : base() { }
        public SuperHero(string sn, string n, int a) : base(n, a) { SuperName = sn; }
    }

    [DataContract]
    public class SubTestClass
    {
        [DataMember]
        public string MyString;
    }

    [DataContract]
    [KnownType(typeof(SuperHero))]
    public class TestClass : XmlTestObject<TestClass>
    {
        [DataMember]
        public Person OriginalPerson;
        [DataMember]
        public csharpxml.Test3.Person OnePerson;
        [DataMember]
        public csharpxml.Test3.Person AnotherPerson;
        [DataMember]
        public csharpxml.Test3.Person[] SomePeople;
        [DataMember]
        public Dictionary<string, csharpxml.Test3.Person> PhoneBook;
        [DataMember]
        public Person[][] JaggedPeople;
        [DataMember]
        public SubTestClass SubTest;

        public override void PopulateTestObject(int subtest)
        {
            switch (subtest)
            {
                case 0:
                    break;
                case 1:
                    SubTest = new SubTestClass();
                    SubTest.MyString = "I'm another class";
                    OriginalPerson = new Person("Sam", 97);
                    JaggedPeople = new Person[][]
                    {
                        new Person[] { new Person("Thing 1", -1) },
                        new Person[] { new Person("Thing 2", -2) },
                    };

                    OnePerson = new csharpxml.Test3.Person("NoOne", 13);
                    AnotherPerson = new csharpxml.Test3.Person("SomeOne", 1);
                    SomePeople = new csharpxml.Test3.Person[]
                    {
                        new csharpxml.Test3.Person("Bob", 27),
                        new csharpxml.Test3.Person("Sally", 28),
                    };
                    PhoneBook = new Dictionary<string, csharpxml.Test3.Person>();
                    PhoneBook.Add("111-2222", new csharpxml.Test3.Person("Sarah", 54));
                    break;
                case 2:
                    SubTest = new SubTestClass();
                    SubTest.MyString = "I'm another class";
                    OriginalPerson = new SuperHero("Uber Sam","Sam", 97);
                    JaggedPeople = new Person[][]
                    {
                        new Person[] { new Person("Thing 1", -1) },
                        new Person[] { new SuperHero("Major Thing", "Thing 2", -2) },
                    };

                    OnePerson = new csharpxml.Test3.Person("NoOne", 13);
                    AnotherPerson = new csharpxml.Test3.Person("SomeOne", 1);
                    SomePeople = new csharpxml.Test3.Person[]
                    {
                        new csharpxml.Test3.Person("Bob", 27),
                        new csharpxml.Test3.Person("Sally", 28),
                    };
                    PhoneBook = new Dictionary<string, csharpxml.Test3.Person>();
                    PhoneBook.Add("111-2222", new csharpxml.Test3.Person("Sarah", 54));
                    break;
            }
        }
    }

}
