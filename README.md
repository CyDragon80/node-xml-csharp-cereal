# node-xml-csharp-cereal [![Build Status](https://travis-ci.org/CyDragon80/node-xml-csharp-cereal.svg?branch=master)](https://travis-ci.org/CyDragon80/node-xml-csharp-cereal)

This a module to provide XML object serialization in Nodejs. It is meant to be at least somewhat compatible with XML from/to the C# XmlSerializer (not DataContractSerializer at this time).

## Motivation

The original author could not find a simple XML serializer for Nodejs, so this meager one was started. Links to alternative or derivative libraries may be added to this readme section over time to help others searching for similar solutions.
* [xml-csharp-cereal](https://www.npmjs.com/package/xml-csharp-cereal) - This one.

## Installation

This module is contained in a single file, so you can either just grab 'xml-csharp-cereal.js' and add it to your project, or install it from npm.
> npm install xml-csharp-cereal

## XML Libraries

This module is not written to depend on a singular XML library. Therefore you need to install a supported XML package separately. Each supported XML library would have an associated "to_*XmlLib*()" and "from_*XmlLib*()" on XmlTemplateFactory.
* [xml2js](https://www.npmjs.com/package/xml2js) { [test/test_xml2js.js](test/test_xml2js.js) } - Supports all current features.

Support for more XML libraries might be added over time.

## Code Example
```javascript
// Importing the module
const xml = require('xml-csharp-cereal');
```
### Deserializing from XML
Assume we have XML file to deserialize into "my_obj", which if successful should be instanceof MyClass1.
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
            var my_obj = XmlFactory.from_xml2js(xml_obj); // deserialize my_obj
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
In order to serialize or deserialize your classes, this library needs a XmlTemplate for each class describing the properties to include. This can be done by defining a static GetXmlTemplate() on the class itself, or via some external means like a separate function.
```javascript
class MyClass1
{
    constructor()
    {
        this.MyString = null; // string
        this.MyNumber = 0; // number
        this.SomeClass = null; // instance of MyClass2
    }
    static GetXmlTemplate() // you could use built-in template
    {
        var temp = new xml.XmlTemplate(this);
        temp.addString('MyString'); // like a C# string
        temp.addInt('MyNumber'); // like a C# int
        temp.add('SomeClass', 'MyClass2'); // another class
        return temp;
    }
}
// Or you could use separate template generation
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
// Constructor takes multiple XmlTemplate's and/or classes with GetXmlTemplate()
var factory = new xml.XmlTemplateFactory(MyClass1, GetMyClass2XmlTemplate());

// You can also add templates to an existing instance
var factory = new xml.XmlTemplateFactory();
factory.add(MyClass1);
factory.add(GetMyClass2XmlTemplate());
```
Decoder and encoders for some common simple types are stored in XmlTemplateFactory properties SimpleTypeDecoders and SimpleTypeEncoders. You can add or override these per instance.
```javascript
// Defining a simple type called 'hex'
//  where factory = new XmlTemplateFactory(...)
factory.SimpleTypeDecoders['hex'] = function(val, err_val)
{
    var ret = parseInt(val, 16);
    return Number.isFinite(ret) ? ret : err_val;
}
factory.SimpleTypeEncoders['hex'] = function(val, err_val)
{
    if (!Number.isFinite(val)) return err_val;
    return val.toString(16);
}
. . .
// when building XML template...
temp.add('MyHex', 'hex');
```
64 bit integers are handled as strings by default. However if you are using a library such as [long.js](https://www.npmjs.com/package/long), you can override the simple type decoder/encoder to utilize a 64 bit number class.
```javascript
const Long = require("long");
// Overriding default int64 handlers
//  where factory = new XmlTemplateFactory(...)
factory.SimpleTypeDecoders['Int64'] =
factory.SimpleTypeDecoders['long'] = function(val, err_val)
{
    // parse XML value into Long instance
    if (val == null) return null; // handle nullable long
    try { return Long.fromValue(val, false); }
    catch { return err_val; }
}
factory.SimpleTypeEncoders['Int64'] =
factory.SimpleTypeEncoders['long'] = function(val, err_val)
{
    // output Long as string for XML node
    if (val == null) return null; // handle nullable long
    if (!(val instanceof Long)) return err_val;
    try { return val.toString() }
    catch { return err_val; }
}
```
The default DateTime decoder/encoder uses ISO string and javascript Date object. The default TimeSpan uses string, as there is no built-in javascript  equivalent. Both DateTime and TimeSpan decode/encoder can be overriden to use other methods or libraries.
### XmlTemplate - Add Methods
The XmlTemplate class provides add functions for the all of the XmlTemplateFactory's built-in types.
Method|Description
------|-----------
add(*prop_name*, *class_name*, *arr_levels*)|Add instance of class (or simple type) with given array levels
addString(*prop_name*, *arr_levels*)|Same as add(*prop_name*, 'string', *arr_levels*)
addByte(*prop_name*, *arr_levels*)|Same as add(*prop_name*, 'byte', *arr_levels*)
addInt(*prop_name*, *arr_levels*)|Same as add(*prop_name*, 'int', *arr_levels*)
addFloat(*prop_name*, *arr_levels*)|Same as add(*prop_name*, 'float', *arr_levels*)
addDouble(*prop_name*, *arr_levels*)|Same as add(*prop_name*, 'double', *arr_levels*)
addBool(*prop_name*, *arr_levels*)|Same as add(*prop_name*, 'bool', *arr_levels*)
Also included: addInt16, addUInt16, addInt32, addUInt32, addInt64, addUInt64, addSByte, addUInt, addShort, and addUShort.
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
During testing a strange behavior was observed in C# where defining a int?[] before int[][] would cause the tag names in int[][] to change from "ArrayOfInt" to "ArrayOfInt1". This can be mitigated by either declaring the nullable array last or adding an explicit XmlArrayItem attribute to the subsequent int[][].
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
factory.SimpleTypeDecoders['MyEnum'] = function(val, err_val)
{
    var lut = { zero:0, one:1, two:2, three:3 }
    if (lut[val]==undefined) return err_val;
    return lut[val];
}
factory.SimpleTypeEncoders['MyEnum'] = function(val, err_val)
{
    var lut = { 0:'zero', 1:'one', 2:'two', 3:'three' }
    if (lut[val]==undefined) return err_val;
    return lut[val];
}
```
3. Add object or class that defines getEnumValue(*name*) and getEnumName(*value*) functions to factory.
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

### XmlTemplateFactory - Add Object as Implicit Dictionary
One can certainly construct an explicit dictionary class with explicit templates, but many may opt to use an object whose enumerable property names are used as dictionary keys. (At this time keys should probably be a simple type when using implicit dictionary.)
Basically you need to register a class with factory that spells out the key-value pair tag name and property info for the key and value.
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
Some more examples of dictionaries:
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

## Tests

The tests consist of a node portion (test.js) and a C# portion (csharpxml). csharpxml generates test XMLs for node to read, then node loads/resaves the XML, and csharpxml verifies the result using [Compare-Net-Objects](https://github.com/GregFinzer/Compare-Net-Objects). If running on Linux, you will need to install the [mono-complete package](http://www.mono-project.com/download/stable/#download-lin) to run the tests. A pre-compiled version of the csharpxml app is included with the code in the repo, so re-compilation is not needed unless you need to alter that portion of the tests. (It also saves on Travis test time and complexity.)

> npm test

See the readme in the test folder for more info.

## License

There are too many licenses. The authors and contributors assume no liability or warranty. Use at your own risk. This code is public domain (or "Unlicense" if you prefer). If you are in a country without public domain, apply whatever compatible permissive license is convenient for use in your country.
