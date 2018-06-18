using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Xml.Serialization;

namespace csharpxml.Test5
{
    [XmlRoot(ElementName ="node")]
    public class DBusNode : XmlTestObject<DBusNode>
    {
        [XmlAttribute]
        public string name;
        [XmlElement(ElementName = "interface")]
        public DBusInterface[] Interfaces;

        public override void PopulateTestObject(int subtest)
        {
            switch (subtest)
            {
                case 0:
                    break;
                case 1:
                    var face = new DBusInterface();
                    face.name = "MyInterface";
                    var m = new DBusMethod();
                    m.name = "MyMethod";
                    m.Args = new DBusArg[]
                    {
                        new DBusArg("Arg1", "s", "in"),
                        new DBusArg("Out1", "s", "out"),
                    };
                    face.Methods = new DBusMethod[] { m };
                    var s = new DBusSignal();
                    s.name = "MySig";
                    s.Args = new DBusArg[]
                    {
                        new DBusArg("SigArg", "si", null),
                    };
                    face.Signals = new DBusSignal[] { s };
                    face.Properties = new DBusProperty[]
                    {
                        new DBusProperty("MyProp", "s", "readwrite"),
                    };
                    Interfaces = new DBusInterface[] { face };
                    break;
            }
        }

    }

    public class DBusArg
    {
        [XmlAttribute]
        public string name;
        [XmlAttribute]
        public string type;
        [XmlAttribute]
        public string direction;

        public DBusArg() { }
        public DBusArg(string n, string t, string d) { name = n; type = t; direction = d; }
    }

    public class DBusProperty
    {
        [XmlAttribute]
        public string name;
        [XmlAttribute]
        public string type;
        [XmlAttribute]
        public string access;

        public DBusProperty() { }
        public DBusProperty(string n, string t, string a) { name = n; type = t; access = a; }
    }

    public class DBusMethod
    {
        [XmlAttribute]
        public string name;
        [XmlElement(ElementName = "arg")]
        public DBusArg[] Args;

        public DBusMethod() { }
    }

    public class DBusSignal
    {
        [XmlAttribute]
        public string name;
        [XmlElement(ElementName = "arg")]
        public DBusArg[] Args;

        public DBusSignal() { }
    }

    public class DBusInterface
    {
        [XmlAttribute]
        public string name;
        [XmlElement(ElementName = "method")]
        public DBusMethod[] Methods;
        [XmlElement(ElementName = "signal")]
        public DBusSignal[] Signals;
        [XmlElement(ElementName = "property")]
        public DBusProperty[] Properties;

        public DBusInterface() { }
    }

}
