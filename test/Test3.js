'use strict'
const xml = require('../xml-csharp-cereal');

// DataContract names get messy.
// Some names get little hash suffixes

module.exports.GetFactory = function()
{
    return (new xml.XmlTemplateFactory(TestClass,AlienSuperHero,SuperHero,Person))
    .addDict('ArrayOfKeyValueOfstringPerson','KeyValueOfstringPersondRl_SenG_P',['Key','string'],['Value','Person',0,xml.dc_noNS]);
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
        temp.addInt('Age');
        temp.addString('Name');
        temp.convToDataContract('http://schemas.datacontract.org/2004/07/csharpxml.Test3');
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
        temp.convToDataContract('http://schemas.datacontract.org/2004/07/csharpxml.Test3');
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
        temp.convToDataContract('http://schemas.datacontract.org/2004/07/csharpxml.Test3');
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
        temp.add('AnotherPerson','Person');
        temp.add('OnePerson','Person');
        temp.add('PhoneBook','ArrayOfKeyValueOfstringPerson', 0, xml.dc_ArrayNS);
        temp.add('SomePeople','Person', 1); // array of custom types has no namespace?
        temp.convToDataContract('http://schemas.datacontract.org/2004/07/csharpxml.Test3');
        return temp;
    }
}
