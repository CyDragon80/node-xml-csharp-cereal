# node-xml-csharp-cereal [![Build Status](https://travis-ci.org/CyDragon80/node-xml-csharp-cereal.svg?branch=master)](https://travis-ci.org/CyDragon80/node-xml-csharp-cereal)
[![NPM](https://nodei.co/npm/xml-csharp-cereal.png)](https://nodei.co/npm/xml-csharp-cereal/)

This a module to provide XML object serialization in Nodejs. It is meant to be at least somewhat compatible with XML from/to the C# XmlSerializer (and DataContractSerializer with a little work).

This module has no dependencies. Other heavier packages might be created that import this module and other dependencies for those who want more out-of-the-box.

## Motivation

The original author could not find a simple XML serializer for Nodejs, so this meager one was started. Links to alternative or derivative libraries may be added to this readme section over time to help others searching for similar solutions.
* [xml-csharp-cereal](https://www.npmjs.com/package/xml-csharp-cereal) - This one.

## Installation

This module is contained in a single file, so you can either just grab [xml-csharp-cereal.js](xml-csharp-cereal.js) and add it to your project directly, or install it from npm.
> npm install xml-csharp-cereal

## XML Libraries

This module is not written to depend on a singular XML library. Therefore you need to install a supported XML package separately. Each supported XML library would have an associated "to_*XmlLib*()" and "from_*XmlLib*()" on XmlTemplateFactory.
* [xml2js](https://www.npmjs.com/package/xml2js) { [test/test_xml2js.js](test/test_xml2js.js) } - Supports all current features.
* [xmldom](https://www.npmjs.com/package/xmldom) { [test/test_xmldom.js](test/test_xmldom.js) } - Supports all current features.

Support for more XML libraries might be added over time.

## Code Example
```javascript
// Importing the module
const xml = require('xml-csharp-cereal');
```
### Deserializing from XML
Assume we have XML file to deserialize into "my_obj", which if successful should be an actual instanceof 'MyClass1'.
```javascript
var XmlFactory = new xml.XmlTemplateFactory(MyClass1, MyClass2);

// Example using xml2js to parse XML file read by fs
var parser = new xml2js.Parser();
fs.readFile("/some/path/to/xml", function(err, xml_data)
{
    parser.parseString(xml_data, function (err, xml_obj)
    {
        if (err) log(err);
        else
        {
            // deserialize my_obj from xml lib object
            var my_obj = XmlFactory.from_xml2js(xml_obj);
            log(util.inspect(my_obj, false, null));
        }
    });
});
```
### Serializing to XML
Assume we have "my_obj" which is instanceof MyClass1 and we want to serialize to XML file.
```javascript
var XmlFactory = new xml.XmlTemplateFactory(MyClass1, MyClass2);

// Example using xml2js to build XML file written by fs
var xml_obj = XmlFactory.to_xml2js(my_obj); // serialize my_obj
var builder = new xml2js.Builder();
var xml_data = builder.buildObject(xml_obj);
fs.writeFile("/some/path/to/xml", xml_data, function(err)
{
    if(err) reject(err);
    else resolve();
});
```
### Setting Up Your Classes
In order to serialize or deserialize your classes, this library needs a XmlTemplate for each class describing the properties to include. This can be done by defining a static getXmlTemplate() on the class itself, or via some external means like a separate function.
```javascript
class MyClass1
{
    constructor()
    {
        this.MyString = null; // string
        this.MyNumber = 0; // number
        this.SomeClass = null; // instance of MyClass2
    }
    static getXmlTemplate() // you could use built-in template
    {
        var temp = new xml.XmlTemplate(this);
        temp.addString('MyString'); // like a C# string
        temp.addInt('MyNumber'); // like a C# int
        temp.add('SomeClass', 'MyClass2'); // another class
        return temp;
    }
}
// Or you could generate the template separately
class MyClass2
{
    constructor() { this.OtherString = null }
}
function GetMyClass2XmlTemplate()
{
  var temp = new xml.XmlTemplate(MyClass2);
  temp.addString('OtherString');
  return temp;
}
```
### Setting Up Your XmlTemplateFactory
An XML file may have various classes and types in it. A XmlTemplateFactory stores everything needed to decode or encode them.
```javascript
// Constructor takes multiple XmlTemplate's and/or classes with getXmlTemplate()
var factory = new xml.XmlTemplateFactory(MyClass1, GetMyClass2XmlTemplate());

// You can also add templates to an existing instance
var factory = new xml.XmlTemplateFactory();
factory.add(MyClass1);
factory.add(GetMyClass2XmlTemplate());
```
Decoder and encoders for some common simple types are stored in XmlTemplateFactory properties 'SimpleTypeDecoders' and 'SimpleTypeEncoders' by default. You can add or override these per instance.
```javascript
// Defining a simple type called 'hex'
//  where factory = new XmlTemplateFactory(...)
factory.SimpleTypeDecoders['hex'] = function(val)
{
    // parse hex in XML node to number in object property
    var ret = parseInt(val, 16);
    if (!Number.isFinite(ret)) throw new Error('Decoder for "hex" cannot parse node into finite number');
    return ret;
}
factory.SimpleTypeEncoders['hex'] = function(val)
{
    // write hex into XML node from object property value
    val = parseInt(val); // make sure val is actual number
    if (!Number.isFinite(val)) throw new Error('Encoder for "hex" requires finite number');
    return val.toString(16);
}
. . .
// when building XML template...
temp.add('MyHex', 'hex'); // this.MyHex is number stored as hex
```
64 bit integers are handled as strings by default. However if you are using a library such as [long.js](https://www.npmjs.com/package/long), you can override the simple type decoder/encoder to utilize a 64 bit number class.
```javascript
const Long = require("long");
// Overriding default int64 handlers
//  where factory = new XmlTemplateFactory(...)
factory.SimpleTypeDecoders['Int64'] =
factory.SimpleTypeDecoders['long'] = function(val)
{
    // parse XML value into Long instance
    if (val == null) return null; // handle nullable
    return Long.fromValue(val, false); // let it throw on error
}
factory.SimpleTypeEncoder['Int64'] =
factory.SimpleTypeEncoders['long'] = function(val)
{
    // output Long as string for XML node
    if (val == null) return null; // handle nullable
    // if not Long instance already, try to parse into a Long
    val = Long.fromValue(val, false);
    return val.toString(); // let it throw on error
}
// the unsigned is largely the same, just change unsigned param...
factory.SimpleTypeDecoders['UInt64'] =
factory.SimpleTypeDecoders['ulong'] = function(val)
{
    if (val == null) return null;
    return Long.fromValue(val, true);
}
factory.SimpleTypeEncoder['UInt64'] =
factory.SimpleTypeEncoders['ulong'] = function(val)
{
    if (val == null) return null;
    val = Long.fromValue(val, true);
    return val.toString();
}
```
The default DateTime decoder/encoder uses ISO string and javascript Date object. The default for TimeSpan decodes ISO string to seconds using the [moment.js regex method](https://github.com/moment/moment/blob/2e2a5b35439665d4b0200143d808a7c26d6cd30f/src/lib/duration/create.js#L17), as there is no built-in javascript  equivalent. Both DateTime and TimeSpan decode/encode can be overridden to use other methods or libraries, such as [moment.js](https://www.npmjs.com/package/moment) or [TimeSpan.js](https://www.npmjs.com/package/timespan).

### XmlTemplate - Add Methods
The XmlTemplate class provides add functions for the all of the XmlTemplateFactory's built-in types.
Method|Description
------|-----------
add(*prop_name*, *class_name*, *arr_levels*, *arr_namespace*, *isNullable*)|Add instance of class (or simple type) with given array levels and options.
addString(*prop_name*, ...)|Same as add(*prop_name*, 'string', ...)
addByte(*prop_name*, ...)|Same as add(*prop_name*, 'byte', ...)
addInt(*prop_name*, ...)|Same as add(*prop_name*, 'int', ...)
addFloat(*prop_name*, ...)|Same as add(*prop_name*, 'float', ...)
addDouble(*prop_name*, ...)|Same as add(*prop_name*, 'double', ...)
addBool(*prop_name*, ...)|Same as add(*prop_name*, 'bool', ...)
Also included: addInt16, addUInt16, addInt32, addUInt32, addInt64, addUInt64, addSByte, addUInt, addShort, addUShort, addDateTime, and addTimeSpan.
### XmlTemplate - Add Array
Just leverage the optional *arr_levels* parameter of add functions. Pass a number of dimensions or an array of level names to use for XML tags.
```javascript
// int[] MyIntArray
temp.addInt('MyIntArray', 1);

// int[][] MyJagIntArray using implicit level names
temp.addInt('MyJagIntArray', 2);
// int[][] MyJagIntArray using explicit level names
temp.addInt('MyJagIntArray', ['int','ArrayOfInt']);
```
**NOTE:** During testing a strange behavior was observed with C# XmlSerializer where defining a nullable integer array "int?[]" before a jagged integar array "int[][]" would cause the tag names in int[][] to change from "ArrayOfInt" to "ArrayOfInt1". This can be mitigated by either declaring the nullable array last or adding an explicit XmlArrayItem attribute to the subsequent int[][].
```csharp
[XmlArrayItem(ElementName = "ArrayOfInt", IsNullable = false, Type = typeof(int[]))]
public int[][] MyJagIntArray;
```
### XmlTemplate - Add Nullable
Just call nullable() on a XmlTemplateItem to make it nullable.
```javascript
// public int? MyNullInt;
temp.addInt('MyNullInt').nullable();
// public int?[] MyNullIntArr;
temp.addInt('MyNullIntArr', 1).nullable();
. . .
// OR use isNullable parameter on add
temp.addInt('MyNullInt', null, null, true);
temp.addInt('MyNullIntArr', 1, null, true);
```
### XmlTemplate - Add as XML Attribute
Just call attr() on a XmlTemplateItem to us it as XML attribute. Try to keep to simple types as XML attributes.
```csharp
// C# declaration
[XmlAttribute]
public string SomeAttr;
```
```javascript
// Building XmlTemplate
temp.addString('SomeAttr').attr();
```
### XmlTemplateFactory - Add Enum
There are three ways to decode/encode an enumeration.
1. Add a simple object representation of the enum to factory.
```javascript
var MyEnumSimple = { zero:0, one:1, two:2, three:3 };
factory.addEnum('MyEnum', MyEnumSimple);
```
2. Define a simple type decoder and encoder on the factory.
```javascript
factory.SimpleTypeDecoders['MyEnum'] = function(val)
{
    var lut = { zero:0, one:1, two:2, three:3 }
    if (lut[val]==undefined) throw new Error('MyEnum does not define ' + val);
    return lut[val];
}
factory.SimpleTypeEncoders['MyEnum'] = function(val)
{
    var lut = { 0:'zero', 1:'one', 2:'two', 3:'three' }
    if (lut[val]==undefined) throw new Error('MyEnum does not define ' + val);
    return lut[val];
}
```
3. Add object or class that defines getEnumValue(*name*) and getEnumName(*value*) functions for the factory to use.
```javascript
factory.addEnum('MyEnum', MyEnumExplicit);
const MyEnumExplicit =
{
    getEnumValue: function(n)
    {
        var lut = { zero:0, one:1, two:2, three:3 };
        return lut[n];
    },
    getEnumName: function(v)
    {
        var lut = { 0:'zero', 1:'one', 2:'two', 3:'three' }
        return lut[v];
    }
}
```

### XmlTemplateFactory - Add Object as Explicit Dictionary
```javascript
// Brief example of what an explicit dictionary might look like
class KeyValuePair
{
    constructor(k,v)
    {
        this.Key=k; this.Value=v;
    }
    static getXmlTemplate()
    {
        var temp = new xml_sharp.XmlTemplate(this);
        temp.add('Key', ?); // whatever type Key stores
        temp.add('Value', ?); // whatever type Value stores
        return temp;
    }
}
class SomeClass
{
    constructor()
    {
        this.MyDictionary = []; // array of KeyValuePair
    }
    static getXmlTemplate()
    {
        var temp = new xml_sharp.XmlTemplate(this);
        temp.add('MyDictionary', 'KeyValuePair', 1);
        return temp;
    }
}
```

### XmlTemplateFactory - Add Object as Implicit Dictionary
One can certainly construct an explicit dictionary class with explicit templates, but many may opt to use an object whose enumerable property names are used as dictionary keys. (At this time keys should probably be a simple type when using implicit dictionary.)
Basically you need to register a class with the factory that spells out the key-value pair tag name and property info for the key and value.
```javascript
// longest form
factory.addDict('SerializableDictionaryOfStringInt32','KeyValuePair', new xml.XmlTemplateItem('Key','string'),new xml.XmlTemplateItem('Value','int'));

// long form with array constructor shortcuts
factory.addDict('SerializableDictionaryOfStringInt32','KeyValuePair',['Key','string'],['Value','int']);

// short form assumes names and keys of string
factory.addDictQuick('SerializableDictionaryOfStringInt32','int');
```
Once a dictionary class is registered to the factory, you can use the class name when creating a template.
```javascript
// property using a simple class acting as dictionary
// C# - SerializableDictionary<string, int> MyIntDict;
this.MyIntDict = { "dogs":3, "cats":2 };
. . .
// added to template with class name of dictionary
temp.add('MyIntDict','SerializableDictionaryOfStringInt32');
```
Some examples of dictionaries:
```javascript
// SerializableDictionary<string, SerializableDictionary<string, int> >
.addDictQuick('SerializableDictionaryOfStringSerializableDictionaryOfStringInt32','SerializableDictionaryOfStringInt32')
// SerializableDictionary<string, SubTestClass>
.addDictQuick('SerializableDictionaryOfStringSubTestClass','SubTestClass')
// SerializableDictionary<string, MyEnum[]>
.addDictQuick('SerializableDictionaryOfStringArrayOfMyEnum','MyEnum',1)
// SerializableDictionary<string, SerializableDictionary<string, int>[]>
.addDictQuick('SerializableDictionaryOfStringArrayOfSerializableDictionaryOfStringInt32','SerializableDictionaryOfStringInt32', 1)

```

### XmlTemplate - Constructor Arguments
By default, a XmlTemplate generates new instances of its assigned class without constructor arguments. However the constructor for XmlTemplate takes an optional second parameter, which is an array of arguments to use when constructing new instances. This is primarily used internally, but if it is useful to you in some way, it is there.
```javascript
// XmlTemplate(parent_class, constructor_args)
var args = [KeyName, key, ValueName, value];
var temp = new xml.XmlTemplate(KeyValuePairStub, args);
// Below statement is equivalent to
//  "var obj = new KeyValuePairStub(...args)"
var obj = temp.newObj();
```

### Derived Classes
See [test/Test2.js](test/Test2.js) and [test/Test3.js](test/Test3.js) for examples. Basically use XmlTemplate.extend() on a copy of base class's XmlTemplate and add the derived properties to it.
```javascript
class SuperHero extends Person
{
    constructor()
    {
        super();
        this.SuperName = null;
    }
    static getXmlTemplate()
    {
        var temp = super.getXmlTemplate();
        temp.extend(this);
        temp.addString('SuperName');
        return temp;
    }
}
```

### DataContract / DataContractSerializer
Some observations of DataContract XMLs:
- Most everything except built-in types have namespaces.
- Some tag names include a hash suffix derived from namespace info.
- All property tags are in alphabetical order AND derived class props are listed after base props.
- Arrays and dictionaries are tagged with special namespaces.
- Array namespace can vary based on content.
- Jagged array and dictionary type tags follow different naming convention compared to XmlSerializer.
- Built-in DateTime and TimeSpan support using ISO strings.

See [test/Test1.js](test/Test1.js), [test/Test3.js](test/Test3.js), and [test/Test4.js](test/Test4.js) for examples. There are some helper methods provided.
```javascript
// XmlTemplate.setXmlNameSpace() is provided to set a class's XML namespace
temp.setXmlNameSpace('http://schemas.datacontract.org/2004/07/csharpxml.Test1');
. . .
// XmlTemplateFactory.applyDataContractNameSpaces() attempts to assign XML namespaces where they are not already defined by the user. You pass the default namespace.
factory.applyDataContractNameSpaces("http://schemas.datacontract.org/2004/07/csharpxml.Test1");
. . .
// XmlTemplate.add() can take an array XML namespace, if you want to set that manually.
temp.addInt('MyIntArray', 1, 'http://schemas.microsoft.com/2003/10/Serialization/Arrays');
```

## Tests

The tests consist of a node portion (test.js) and a C# portion (csharpxml). csharpxml generates test XMLs for node to read, then node loads/resaves the XML, and csharpxml verifies the result using [Compare-Net-Objects](https://github.com/GregFinzer/Compare-Net-Objects). If running on Linux, you will need to install the [mono-complete package](http://www.mono-project.com/download/stable/#download-lin) to run the tests. A pre-compiled version of the csharpxml app is included with the code in the repo, so re-compilation is not needed unless you need to alter that portion of the tests. (It also saves on Travis test time and complexity.)

> npm test

See the readme in the test folder for more info.

## License

The authors and contributors assume no liability or warranty. Use at your own risk. This code is public domain (or "Unlicense" if you prefer). If you are in a country without public domain, apply whatever compatible permissive license is convenient for use in your country.

## Future?
Things that might be done in future?
- Make testing more granular?
- Make testing more thorough?
- Add tests for error reporting?
- Improve error reporting?
- Create another package that includes things like Long.js and TimeSpan.js?
- In-browser compatibility?
- Support other non-standard XmlSerializer constructs?
