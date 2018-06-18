'use strict'
const xml = require('../xml-csharp-cereal');
const Long = require("long"); // to test simple decode/encode overrides

// Try serializing some standard form of XML like DBus introspection

module.exports.GetFactory = function()
{
    return (new xml.XmlTemplateFactory(DBusNode, DBusInterface, DBusSignal, DBusMethod, DBusProperty, DBusArg));
}

class DBusNode
{
    constructor()
    {
        this.name = null; // string
        this.Interfaces = null; // array of DBusInterface
    }
    static getXmlTemplate()
    {
        var temp = new xml.XmlTemplate(this, null, 'node');
        temp.addString('name').attr();
        temp.add('Interfaces', 'DBusInterface', ['interface']).flatArr();
        return temp;
    }
}
module.exports.TestClass=DBusNode;

class DBusArg
{
    constructor()
    {
        this.name = null;
        this.type = null;
        this.direction = null;
    }
    static getXmlTemplate()
    {
        var temp = new xml.XmlTemplate(this);
        temp.addString('name').attr();
        temp.addString('type').attr();
        temp.addString('direction').attr();
        return temp;
    }
}

class DBusProperty
{
    constructor()
    {
        this.name = null;
        this.type = null;
        this.access = null;
    }
    static getXmlTemplate()
    {
        var temp = new xml.XmlTemplate(this);
        temp.addString('name').attr();
        temp.addString('type').attr();
        temp.addString('access').attr();
        return temp;
    }
}

class DBusMethod
{
    constructor()
    {
        this.name = null;
        this.Args = null;
    }
    static getXmlTemplate()
    {
        var temp = new xml.XmlTemplate(this);
        temp.addString('name').attr();
        temp.add('Args', 'DBusArg', ['arg']).flatArr();
        return temp;
    }
}

class DBusSignal
{
    constructor()
    {
        this.name = null;
        this.Args = null;
    }
    static getXmlTemplate()
    {
        var temp = new xml.XmlTemplate(this);
        temp.addString('name').attr();
        temp.add('Args', 'DBusArg', ['arg']).flatArr();
        return temp;
    }
}

class DBusInterface
{
    constructor()
    {
        this.name = null;
        this.Methods = null;
        this.Signals = null;
        this.Properties = null;
    }
    static getXmlTemplate()
    {
        var temp = new xml.XmlTemplate(this);
        temp.addString('name').attr();
        temp.add('Methods', 'DBusMethod', ['method']).flatArr();
        temp.add('Signals', 'DBusSignal', ['signal']).flatArr();
        temp.add('Properties', 'DBusProperty', ['property']).flatArr();
        return temp;
    }
}
