using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Runtime.Serialization; // DataContractSerializer (which we may or may not use)

namespace csharpxml.Test3
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
    public class AlienSuperHero : SuperHero
    {
        [DataMember]
        public string Planet;
        public AlienSuperHero() : base() { }
        public AlienSuperHero(string p, string sn, string n, int a) : base(sn, n, a) { Planet = p; }
    }

    [DataContract]
    [KnownType(typeof(AlienSuperHero))]
    [KnownType(typeof(SuperHero))]
    public class TestClass : XmlTestObject<TestClass>
    {
        [DataMember]
        public Person OnePerson;
        [DataMember]
        public Person AnotherPerson;
        [DataMember]
        public Person[] SomePeople;
        [DataMember]
        public Dictionary<string, Person> PhoneBook;

        public override void PopulateTestObject(int subtest)
        {
            switch (subtest)
            {
                case 0:
                    break;
                case 1:
                    OnePerson = new Person("NoOne", 13);
                    AnotherPerson = new Person("SomeOne", 1);
                    SomePeople = new Person[]
                    {
                        new Person("Bob", 27),
                        new Person("Sally", 28),
                    };
                    PhoneBook = new Dictionary<string, Person>();
                    PhoneBook.Add("111-2222", new Person("Sarah", 54));
                    break;
                case 2:
                    OnePerson = new SuperHero("IronicMan", "Ned", 42);
                    AnotherPerson = new Person("SomeCouple", 2);
                    SomePeople = new Person[]
                    {
                        new SuperHero("SpongeBob", "Carl", 37),
                        new SuperHero("MustangeSally", "Susan", 55),
                        new Person("NeutralSpectator", -3),
                        new AlienSuperHero("Mars", "Red Baron", "Marvin", 999),
                    };
                    PhoneBook = new Dictionary<string, Person>();
                    PhoneBook.Add("111-2222", new SuperHero("TheSass", "Berthold", 32));
                    break;
            }
        }
    }
}
