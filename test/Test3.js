'use strict'
const xml = require('../xml-csharp-cereal');

// Some derived class stuff for DataContract
// DataContract names get messy.
// Some names get little hash suffixes

module.exports.GetFactory = function()
{
    return (new xml.XmlTemplateFactory(TestClass, AlienSuperHero, SuperHero, Person))
    .addDict('ArrayOfKeyValueOfstringPerson','KeyValueOfstringPersondRl_SenG_P',['Key','string'],['Value','Person'])
    .applyDataContractNameSpaces('http://schemas.datacontract.org/2004/07/csharpxml.Test3');
}

class Person
{
    constructor()
    {
        this.Name = null;   //public string Name;
        this.Age = 0;   //public int Age;
    }
    static getXmlTemplate()
    {
        var temp = new xml.XmlTemplate(this);
        temp.addInt('Age');
        temp.addString('Name');
        temp.setXmlNameSpace('http://schemas.datacontract.org/2004/07/csharpxml.Test3');
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
    static getXmlTemplate()
    {
        var temp = super.getXmlTemplate(); // get copy of base class template
        temp.extend(this); // this template should extend class
        // add the addition props
        temp.addString('SuperName');
        temp.setXmlNameSpace('http://schemas.datacontract.org/2004/07/csharpxml.Test3');
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
    static getXmlTemplate()
    {
        var temp = super.getXmlTemplate(); // get copy of base class template
        temp.extend(this); // this template should extend class
        // add the addition props
        temp.addString('Planet');
        temp.setXmlNameSpace('http://schemas.datacontract.org/2004/07/csharpxml.Test3');
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
    static getXmlTemplate()
    {
        var temp = new xml.XmlTemplate(this);
        temp.add('AnotherPerson','Person');
        temp.add('OnePerson','Person');
        temp.add('PhoneBook','ArrayOfKeyValueOfstringPerson');
        temp.add('SomePeople','Person', 1); // array of custom types has no namespace?
        temp.setXmlNameSpace('http://schemas.datacontract.org/2004/07/csharpxml.Test3');
        return temp;
    }
}
