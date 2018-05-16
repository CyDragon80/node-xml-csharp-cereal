using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Xml.Serialization;

namespace csharpxml.Test2
{
    [XmlInclude(typeof(SuperHero))]
    public class Person
    {
        public string Name;
        public int Age;

        public Person() { }
        public Person(string n, int a) { Name = n;Age = a; }
    }

    [XmlInclude(typeof(AlienSuperHero))]
    public class SuperHero : Person
    {
        public string SuperName;
        public SuperHero() : base() { }
        public SuperHero(string sn, string n, int a) : base(n,a) { SuperName = sn; }
    }

    public class AlienSuperHero : SuperHero
    {
        public string Planet;
        public AlienSuperHero() : base() { }
        public AlienSuperHero(string p, string sn, string n, int a) : base(sn,n,a) { Planet = p; }
    }

    public class TestClass : XmlTestObject<TestClass>
    {
        public Person OnePerson;
        public Person AnotherPerson;
        //Could also do [XmlArrayItem(Type = typeof(SuperHero)),XmlArrayItem(Type = typeof(Person))] but XmlInclude seems easier
        public Person[] SomePeople;
        public SerializableDictionary<string, Person> PhoneBook;

        public override void PopulateTestObject(int subtest)
        {
            switch(subtest)
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
                    PhoneBook = new SerializableDictionary<string, Person>();
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
                    PhoneBook = new SerializableDictionary<string, Person>();
                    PhoneBook.Add("111-2222", new SuperHero("TheSass", "Berthold", 32));
                    break;
            }
        }
    }

}
