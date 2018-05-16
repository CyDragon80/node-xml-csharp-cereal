'use strict'
const xml = require('../xml-csharp-cereal');

// DataContract names get messy.
// Some names get little hash suffixes

module.exports.GetFactory = function()
{
    return (new xml.XmlTemplateFactory(TestClass,AlienSuperHero,SuperHero,Person))
    .addDictQuick('SerializableDictionaryOfStringPerson','Person');
}

class Person
{
    constructor()
    {
        this.Name = null;   //public string Name;
        this.Age = 0;   //public int Age;
    }
    static GetXmlTemplate()
    {
        var temp = new xml.XmlTemplate(this);
        temp.addString('Name');
        temp.addInt('Age');
        return temp;
    }
}

class SuperHero extends Person
{
    constructor()
    {
        super();
        this.SuperName = null; // public string SuperName;
    }
    static GetXmlTemplate()
    {
        var temp = super.GetXmlTemplate(); // get copy of base class template
        temp.changeClass(this); // reset the copy to this class
        // add the addition props
        temp.addString('SuperName');
        return temp;
    }
}

class AlienSuperHero extends SuperHero
{
    constructor()
    {
        super();
        this.Planet = null; //public string Planet;
    }
    static GetXmlTemplate()
    {
        var temp = super.GetXmlTemplate(); // get copy of base class template
        temp.changeClass(this); // reset the copy to this class
        // add the addition props
        temp.addString('Planet');
        return temp;
    }
}

class TestClass
{
    constructor()
    {
        this.OnePerson = null; //public Person OnePerson;
        this.AnotherPerson = null; //public Person AnotherPerson;
        this.SomePeople = null; //public Person[] SomePeople;
        this.PhoneBook = null; //public SerializableDictionary<string, Person> PhoneBook;
    }
    static GetXmlTemplate()
    {
        var temp = new xml.XmlTemplate(this);
        temp.add('OnePerson','Person');
        temp.add('AnotherPerson','Person');
        temp.add('SomePeople','Person', 1);
        temp.add('PhoneBook','SerializableDictionaryOfStringPerson');
        return temp;
    }
}
