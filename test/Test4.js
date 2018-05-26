'use strict'
const xml = require('../xml-csharp-cereal');

// DataContract namespace super fun
// We have two Person's from two namespaces.
// Can we use class name overrides and qualified class names to cover that?

module.exports.GetFactory = function()
{
    return (new xml.XmlTemplateFactory(TestClass, Person, SuperHero, Person2, ClassOfDifferentName))
    .addDict('ArrayOfKeyValueOfstringPerson','KeyValueOfstringPersondRl_SenG_P',['Key','string'],['Value','Test3.Person'])
    .applyDataContractNameSpaces('http://schemas.datacontract.org/2004/07/csharpxml.Test4');
}

class Person2   // can't define two 'Person' js classes
{
    constructor()
    {
        this.Name = null;   //public string Name;
        this.Age = 0;   //public int Age;
    }
    static getXmlTemplate()
    {
        var temp = new xml.XmlTemplate(this, null, 'Test3.Person'); // quailifier doesn't really matter as long as it is unique (only used for type lookup)
        temp.addInt('Age');
        temp.addString('Name');
        temp.setXmlNameSpace('http://schemas.datacontract.org/2004/07/csharpxml.Test3');
        return temp;
    }
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
        var temp = new xml.XmlTemplate(this, null, 'Test4.Person'); // specify an override class name that is qualified in some way
        temp.addInt('Age');
        temp.addString('Name');
        temp.setXmlNameSpace('http://schemas.datacontract.org/2004/07/csharpxml.Test4');
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
        temp.extend(this, null, 'Test4.SuperHero'); // this template should extend class
        // add the addition props
        temp.addString('SuperName');
        temp.setXmlNameSpace('http://schemas.datacontract.org/2004/07/csharpxml.Test4');
        return temp;
    }
}


class ClassOfDifferentName  // test using different name from actual JS class
{
    constructor() { this.MyString = null; }
    static getXmlTemplate()
    {
        var temp = new xml.XmlTemplate(this, null, 'SubTestClass');
        temp.addString('MyString');
        temp.setXmlNameSpace('http://schemas.datacontract.org/2004/07/csharpxml.Test4');
        return temp;
    }
}

class TestClass
{
    constructor()
    {
        // Test4's (this) namespace person
        this.OriginalPerson = null;
        this.JaggedPeople = null;
        // Test3's person
        this.OnePerson = null; //public Person OnePerson;
        this.AnotherPerson = null; //public Person AnotherPerson;
        this.SomePeople = null; //public Person[] SomePeople;
        this.PhoneBook = null; //public SerializableDictionary<string, Person> PhoneBook;
    }
    static getXmlTemplate()
    {
        var temp = new xml.XmlTemplate(this);
        temp.add('AnotherPerson','Test3.Person');
        temp.add('JaggedPeople', 'Test4.Person', 2);
        temp.add('OnePerson','Test3.Person');
        temp.add('OriginalPerson','Test4.Person');
        temp.add('PhoneBook','ArrayOfKeyValueOfstringPerson');
        temp.add('SomePeople','Test3.Person', 1); // array of custom types has no namespace?
        temp.add('SubTest','SubTestClass');
        temp.setXmlNameSpace('http://schemas.datacontract.org/2004/07/csharpxml.Test4');
        return temp;
    }
}
