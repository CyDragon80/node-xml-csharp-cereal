'use strict';
/**
 * C#-ish XML serializer
 * @module xml-csharp-cereal
 */

const xml2js = require('xml2js'); // TODO - save settings as XML or JSON?
const fs = require('fs');
const path = require('path');
const util = require('util');
const log     = require('debug')('node-axdms:rest_service');

/* xml-csharp-cereal.js

This module is to aid in the serializing of XML to and from classes in a fashion similar to C#.
However we must create xml template classes to describe the structure and aid in the process.
It is assumed all arrays have elements of the same type.
During parsing from XML, class constructors are called without arguments (unless a default set is stored in its template).
If needed, code could be modified to store some arguments to pass to the constructor in the XmlTemplate?

Some Example Classes to use:
    class MyClass1
    {
        constructor()   // during parsing, constructor will be called without arguments (so params will be undefined)
        {
            this.SearchStr = ""; // string - search string
            this.SearchMode = 0; // number - search mode
        }
        static GetXmlTemplate() // defines default method to generate a template
        {
            var temp = new module.exports.XmlTemplate(RestVar);
            temp.addString('SearchStr');
            temp.addInt('SearchMode');
            return temp;
        }
    }
    class MyClass2
    {
        constructor()
        {
            this.Url = url; // string
            this.TimeOutMS = 7000; // number
            this.Searches = []; // array of MyClass1 instances
        }
    };
    function MakeTemplateForMyClass2()  // provide separate means to generate template, if you can't/don't-want-to alter orignal class
    {
        var temp = new module.exports.XmlTemplate(MyClass2);
        temp.addString('Url');
        temp.addInt('TimeOutMS');
        temp.add('Searches', 'MyClass1', true);
        return temp;
    }

Example using xml2js objects:   [tested vs xml2js 0.4.19]
    const xml2js = require('xml2js');
    const fs = require('fs');
    . . .
    var temps = new module.exports.XmlTemplateFactory(); // need to setup factory with all our class templates
    temps.add(MyClass1);    // using class function that has static GetXmlTemplate()
    temps.add(MakeTemplateForMyClass2());   // getting a XmlTemplate from some custom function
    // (NOTE: if classes have default GetXmlTemplate, they can be listed in XmlTemplateFactory constructor instead of calling add manually.)
    var fname = "/some/path/to/xml";
    var parser = new xml2js.Parser(); // using defaults {explicitArray:true,explicitRoot:true}
    fs.readFile(fname, function(err, data)
    {
        parser.parseString(data, function (err, result)
        {
            if (err) log(err);
            else
            {
                var res = temps.from_xml2js(result);
                log(util.inspect(res, false, null));
            }
        });
    });

Example using xmldom:
    TODO - need to create methods to handle xmldom objects: from_xmldom(), to_xmldom()

*/

// region "Some parsers for primitive node values" -----
// (TODO - Do we want to get into nullable numbers?)

/**
 * This callback takes value from XML and decodes it into appropriate value for object.
 * @callback DecoderCallback
 * @param {any} val - the XML value to decode
 * @param {any} err_val - result value to return on error
 * @return {any} - the decoded value or err_val
 */

module.exports.DecodeInt = function(val, err_val)
{
    var n = parseInt(val);
    if (typeof(n) == "number" && !isNaN(n) && isFinite(n)) return n;
    return err_val;
}
module.exports.DecodeFloat = function(val, err_val)
{
    var n = parseFloat(val);
    if (typeof(n) == "number" && !isNaN(n) && isFinite(n)) return n;
    return err_val;
}
module.exports.DecodeDouble = function(val, err_val)
{
    // parseFloat is effectively  parseDouble
    var n = parseFloat(val);
    if (typeof(n) == "number" && !isNaN(n) && isFinite(n)) return n;
    return err_val;
}
module.exports.DecodeBool = function(val, err_val)
{
    if (module.exports.IsString(val))
    {
        if (val.toUpperCase()=="TRUE") return true;
        if (val.toUpperCase()=="FALSE") return false;
        var num = module.exports.DecodeInt(val, null); // if '1' or '0' perhaps?
        if (num==null) return err_val;
        return (num != 0);  // any non-zero value is true?
    }
    else
    {
        return (val ? true : false); // rely on falsy/truthy ?
    }
}
module.exports.DecodeString = function(val, err_val)
{
    // process undefined the same as null, or should we catch and return err_val?
    if (val==null) return null; // should we return null or "" ?
    return val.toString(); // just in case it isn't already a string?
}

/**
 * This callback takes value from object and encodes it into appropriate value for XML.
 * @callback EncoderCallback
 * @param {any} val - the value to encode
 * @param {any} err_val - result value to return on error
 * @return {any} - the encoded XML value or err_val
 */

module.exports.EncodeString = function(val, err_val)
{
    return val.toString(); // just in case it isn't already a string?
}
module.exports.EncodeBool = function(val, err_val)
{
    return (val ? "true" : "false"); // c sharp xml prints the lowercase string
}
module.exports.EncodePassthrough = function(val, err_val)
{
    // numbers should passthrough fine, unless XML library needs them an explicit type?
    if (val instanceof Number) return val.valueOf(); // unwrap if in Number object ?
    return val; // no special processing required before passing to XML library
}


// Expose simple type encoders/decoders so they can be modified or additions could be made?
// Should these be members of XmlTemplateFactory for individual adjustablity?
/**
 * Collection of simple type decoders for XmlTemplateFactory. Key is the type name string and value is
 * @see {@link DecoderCallback}.
 */
module.exports.SimpleTypeDecoders =
{
    'string': module.exports.DecodeString,
    'int': module.exports.DecodeInt,
    'uint': module.exports.DecodeInt,
    'short': module.exports.DecodeInt,
    'ushort': module.exports.DecodeInt,
    'float': module.exports.DecodeFloat,
    'double': module.exports.DecodeDouble,
    'bool': module.exports.DecodeBool,
}
/**
 * Collection of simple type encoders for XmlTemplateFactory. Key is the type name string and value is
 * @see {@link EncoderCallback}.
 */
module.exports.SimpleTypeEncoders =
{
    'string': module.exports.EncodeString,
    'int': module.exports.EncodePassthrough,
    'uint': module.exports.EncodePassthrough,
    'short': module.exports.EncodePassthrough,
    'ushort': module.exports.EncodePassthrough,
    'float': module.exports.EncodePassthrough,
    'double': module.exports.EncodePassthrough,
    'bool': module.exports.EncodeBool,
}

// endregion "Some parsers for primitive node values" -----



// region "Helper Functions" -----

module.exports.IsString = function(val) { return (typeof(val)=='string' || val instanceof String); }
// Technically prototype and constructor should always be there?
module.exports.IsClassFunction = function(val) { return (typeof(val) == 'function' && val.prototype); }
module.exports.IsClassInstance = function(val) { return (typeof(val) == 'object' && val.constructor); }
/*module.exports.GuessClassName = function(v)
{
    // Take a guess at what is most appropriate class name for this JS variable
    var class_name;
    if (typeof(v) == 'number' || v instanceof Number) class_name = 'double';
    else if (module.exports.IsString(v)) class_name = 'string';
    else if (module.exports.IsClassFunction(v)) class_name = v.name;
    else if (module.exports.IsClassInstance(v)) class_name = v.constructor.name;
    else return null;
    return class_name;
}*/
function CheckConvertClassName(class_name)
{
    // If passed the actual class function
    if (module.exports.IsClassFunction(class_name)) class_name = class_name.name;
    // if passed an instance of the class
    else if (module.exports.IsClassInstance(class_name)) class_name = class_name.constructor.name;
    return class_name;
}

// endregion "Helper Functions" -----


// region "Generic object as Dictionary" -----
// In theory, one could create a dictionary as an array of a key-value classes and use serializer normally, BUT what about a generic JS object used as a dictionary?
/*
class KeyValuePair
{
    constructor(k,v)
    {
        this.Key=k; this.Value=v;
    }
    static GetXmlTemplate()
    {
        var temp = new xml_sharp.XmlTemplate(RestVar);
        temp.add('Key', ?); // whatever type Key stores
        temp.add('Value', ?); // whatever type Value stores
        return temp;
    }
}
class SomeClass
{
    constructor()
    {
        this.Dictionary = []; // array of KeyValuePair
    }
    static GetXmlTemplate()
    {
        var temp = new xml_sharp.XmlTemplate(RestVar);
        temp.add('Dictionary', 'KeyValuePair', true);
        return temp;
    }
}
*/
// For a {} dictionary we need to know what the key and value tags are named in the xml, and what class each is.
// (Key is most likely going to be a 'string', unless you want to try to use a JSON string for an object key?)
// ClassName is needed only if there is an array of dictionaries, otherwise the property name is used for the main node.
/*
<ClassName>
    <PairName>
        <KeyName>KeyClass</KeyName>
        <ValueName>ValueClass</ValueName>
    </PairName>
</ClassName>
*/
/**
 * Internal stub for dictionary abstraction of a generic object.
 * @private
 * @class DictionaryStub
 */
class DictionaryStub
{
    constructor()
    {
        this.Items = [];    // this property should not show in XML
    }
    // No static GetXmlTemplate() cause we are going to generate one based on other info
}
/**
 * Internal stub for a key-value pair with arbitrary key/value names.
 * @private
 * @class KeyValuePairStub
 */
class KeyValuePairStub
{
    constructor(key_name, key_content, value_name, value_content)
    {
        // actual exposed properties for serializer (Content cannot be undefined!)
        if (key_content===undefined) key_content=null;
        if (value_content===undefined) value_content=null;
        this[key_name] = key_content;
        this[value_name] = value_content;
    }
    // Can't have static GetXmlTemplate(), since properties are dynamic. Xml template must generated dynamically
}
/**
 * Internal factory for producing dictionary stubs for abstracting generic object.
 * @private
 * @class DictionaryFactory
 */
class DictionaryFactory  // For now maybe we don't expose internal plumbing of generic object dictionary
{
    constructor(pair_name, key_name, key_class, value_name, value_class)
    {
        if (!module.exports.IsString(pair_name)) throw new Error("DictionaryFactory pair_name must be string");
        if (!module.exports.IsString(key_name)) throw new Error("DictionaryFactory key_name must be string");
        if (!module.exports.IsString(key_class)) throw new Error("DictionaryFactory key_class must be string");
        if (!module.exports.IsString(value_name)) throw new Error("DictionaryFactory value_name must be string");
        if (!module.exports.IsString(value_class)) throw new Error("DictionaryFactory value_class must be string");
        // TODO - ACTUALLY for a generic {} dictionary, the key must be a string or representable as a string? At least for now.
        if (key_class!='string') throw new Error("DictionaryFactory: At this time key_class must be 'string'");
        this.PairName = pair_name;
        this.KeyName = key_name;
        this.KeyClass = key_class;
        this.ValueName = value_name;
        this.ValueClass = value_class;
    }
    createDictTemplate(class_name)
    {
        var t = new module.exports.XmlTemplate(DictionaryStub);
        t._add('Items', this.PairName, true, this);
        t.XmlPassthrough = 'Items'; // in xml processing, this class is transparent, the value of Items replaces the class itself in XML
        return t;
    }
    createPairTemplate(key, value)
    {
        // create a temporary template for this particular KeyValuePair
        var args = [this.KeyName, key, this.ValueName, value];
        var t = new module.exports.XmlTemplate(KeyValuePairStub, args);
        t.add(this.KeyName, this.KeyClass);
        t.add(this.ValueName, this.ValueClass);
        return t;
    }
    createPairStub(key, value)
    {
        return new KeyValuePairStub(this.KeyName, key, this.ValueName, value);
    }
} // END CLASS: DictionaryFactory
// endregion "Generic object as Dictionary" -----


/** Class representing the XML template for a given property. */
class XmlTemplateItem
{
    /**
     * Creates an instance of XmlTemplateItem.
     * @param {string} prop_name - Property Name
     * @param {string} class_name - Class or Type Name
     * @param {boolean} [isArray=false] - Is it an array
     * @param {?DictionaryFactory} [dict_factory=null] - (INTERNAL-USE) Generic object dictionary factory.
     */
    constructor(prop_name, class_name, isArray, dict_factory)
    {
        if (!module.exports.IsString(prop_name)) throw new Error("XmlTemplateItem.constructor prop_name must be string");
        if (!module.exports.IsString(class_name)) throw new Error("XmlTemplateItem.constructor class_name must be string");
        if (isArray==undefined) isArray = false; // rely on falsy or explicitly make it a default value?
        if (dict_factory!=null && !(dict_factory instanceof DictionaryFactory))
            throw new Error("XmlTemplateItem.constructor dict_factory must be null or instance of DictionaryFactory");
        if (class_name=='' && dict_factory==null) throw new Error("XmlTemplateItem.constructor class_name cannot be empty string");
        this.Name = prop_name;
        this.ClassName = class_name;
        this.IsArray = isArray;
        this.Dictionary = dict_factory || null; // instance of DictionaryFactory
        // Should we also track if type is simple or object?
        // Add a member for tracking XML element vs attribute?
    }
} // END CLASS: XmlTemplateItem
module.exports.XmlTemplateItem = XmlTemplateItem;


/** The XmlTemplate class stores info of how a class's properties are to be serialized. */
class XmlTemplate
{
    /**
     * Creates an instance of XmlTemplate.
     * @param {Function} parent_class - Class function (essentially the constructor)
     * @param {?any[]} [constructor_args=null] - Arguments to feed constructor when creating a new instance
     */
    constructor(parent_class, constructor_args)
    {
        if (!module.exports.IsClassFunction(parent_class)) throw new Error("XmlTemplate.constructor requires parent_class to be class function");
        if (constructor_args!=null && !Array.isArray(constructor_args)) throw new Error("XmlTemplate.constructor requires constructor_args to be null or an array");
        this.ClassConstructor = parent_class;
        this.ConstructorArgs = constructor_args || null;
        this.Props = [];
    }
    /**
     * Returns a new instance of the class associated with this template.
     *
     * @param {...any} constructor_args - If parameters given, they are passed to constructor; otherwise any stored ConstructorArgs are used.
     * @returns {Object} - New instance of ClassConstructor using ConstructorArgs
     */
    newObj()
    {
        // NOTE: explicitly passing undefined counts as arguments.length==1 which would override ConstructorArgs if needed.
        var constructor_args = (arguments.length > 0 ? Array.from(arguments) : this.ConstructorArgs);
        if (Array.isArray(constructor_args))
        {
            //https://stackoverflow.com/a/8843181
            var args = [null].concat(constructor_args); // first arg is bind context, which doesn't matter but must be present
            return new (Function.prototype.bind.apply(this.ClassConstructor, args));
        }
        return new this.ClassConstructor;
    }
    /**
     * Adds a property XML template to this class XML template.
     *
     * @private
     * @param {string|XmlTemplateItem} prop_name - Property Name or instance of Property XML template. If passing full item template, other parameters are ignored.
     * @param {string|Function|Object} class_name - Class Name or Class instance or Class function of the property.
     * @param {boolean} [isArray=false] - Is it an array?
     * @param {?DictionaryFactory} [dictionary_temp=null] - Dictionary factory for generic object dictionaries.
     * @returns {XmlTemplateItem} - instance of the new property XML template
     */
    _add(prop_name, class_name, isArray, dictionary_temp) // Might want to discourage extern actors from using the generic object dictionary plumbing
    {
        var obj = prop_name; // allow feeding just a XmlTemplateItem instance
        if (!(prop_name instanceof module.exports.XmlTemplateItem))
        {
            class_name = CheckConvertClassName(class_name);
            obj = new module.exports.XmlTemplateItem(prop_name, class_name, isArray, dictionary_temp);
        }
        this.Props.push(obj);
        return obj; // return XmlTemplateItem in case it is useful at some point?
    }
    /**
     * Add property to this class XML template.
     *
     * @param {string|XmlTemplateItem} prop_name - Property Name or instance of Property XML template. If passing full item template, other parameters are ignored.
     * @param {string|Function|Object} class_name - Class Name or Class instance or Class function of the property.
     * @param {boolean} [isArray=false] - Is it an array?
     * @returns {XmlTemplateItem} - instance of the new property XML template
     */
    add(prop_name, class_name, isArray){return this._add(prop_name, class_name, isArray)}
    // common type add helpers
    addString(prop_name, isArray) {return this.add(prop_name,'string',isArray)}
    addInt(prop_name, isArray) {return this.add(prop_name,'int',isArray)}
    addUInt(prop_name, isArray) {return this.add(prop_name,'uint',isArray)}
    addShort(prop_name, isArray) {return this.add(prop_name,'short',isArray)}
    addUShort(prop_name, isArray) {return this.add(prop_name,'ushort',isArray)}
    addFloat(prop_name, isArray) {return this.add(prop_name,'float',isArray)}
    addDouble(prop_name, isArray) {return this.add(prop_name,'double',isArray)}
    addBool(prop_name, isArray) {return this.add(prop_name,'bool',isArray)}
    /**
     * Add an implicit dictionary-style XML template for a generic Object property by constructing an array of key-value pairs.
     *
     * @param {string|XmlTemplateItem} prop_name - Property Name or instance of Property XML template. If passing full item template, other parameters are ignored.
     * @param {boolean} [isArray=false] - Is it an array?
     * @param {string|Function|Object} class_name - Class Name or Class instance or Class function of the property. (Only used if it's an array of dictionaries)
     * @param {string} pair_name - Name to use for a key-value pair in XML.
     * @param {string} key_name - Name to use for a key in XML.
     * @param {string|Function|Object} key_class - Class name/instance/function for the key (For now must be 'string').
     * @param {string} value_name - Name to use for a value in XML.
     * @param {string|Function|Object} value_class - Class name/instance/function for the value (For now must be 'string').
     * @returns {XmlTemplateItem} - instance of the new property XML template
     */
    addDict(prop_name, isArray, class_name, pair_name, key_name, key_class, value_name, value_class)
    {
        /* if (class_name==undefined) class_name="Dictionary";
        if (pair_name==undefined) pair_name="KeyValuePair";
        if (key_name==undefined) key_name="Key";
        if (key_class==undefined) key_class="string";
        if (value_name==undefined) value_name="Value"; */
        key_class = CheckConvertClassName(key_class);
        value_class = CheckConvertClassName(value_class);
        var t = new DictionaryFactory(pair_name, key_name, key_class, value_name, value_class);
        return this._add(prop_name, class_name, isArray, t);
    }
    addDictQuick(prop_name, isArray, value_class)
    {
        value_class = CheckConvertClassName(value_class);
        var t = new DictionaryFactory("KeyValuePair", "Key", "string", "Value", value_class);
        return this._add(prop_name, "Dictionary", isArray, t);
    }
    /*addAuto(prop) // if props have an initial value, could we automatically determine class names? Could be problematic?
    {
        if (typeof(prop)=='number') this.addDouble(prop);
    }*/
    // parsing/generating methods for various kinds of XML library objects
    _from_xml2js(factory, xml2js_obj, opts, _state)
    {
        if (xml2js_obj==null) return null;
        var new_obj = this.newObj();
        this.Props.forEach(function(prop)
        {
            var xml_node = this.XmlPassthrough ? xml2js_obj : xml2js_obj[prop.Name];
            if (xml_node!=undefined) // XML has this class property
            {
                var new_item = undefined; // null is a valid answer, so use undefined until it is defined
                // xml2js default has everything an array in case there are multiple tags of the same name.
                // We assume class properties are only used once and thus grab the first
                if (Array.isArray(xml_node) && !this.XmlPassthrough)
                {
                    if (xml_node.length<1) return;
                    else xml_node = xml_node[0];
                }
                if (prop.IsArray)   // we expect an array of a single type
                {
                    // xml2js will turn our type tags into a property containing the sub nodes as another array.
                    // At this point we have {type:[value,...]}
                    var node_arr = xml_node[prop.ClassName];
                    if (node_arr==undefined) return;
                    if (!Array.isArray(node_arr)) node_arr = [node_arr]; // in case it isn't in an array
                    new_item = [];
                    node_arr.forEach(function(item)
                    {
                        var temp = factory._decodeType(item, prop, '_from_xml2js', opts, _state);
                        if (temp!==undefined) new_item.push(temp); // null is a valid answer
                    }, this);
                }
                else // we expect a single value
                {
                    new_item = factory._decodeType(xml_node, prop, '_from_xml2js', opts, _state);
                }
                if (new_item!==undefined) new_obj[prop.Name] = new_item; // null is a valid answer
            }
        }, this);
        return new_obj;
    }
    _to_xml2js(factory, class_inst, opts, _state)
    {
        if (class_inst==null) return null;
        var new_obj = {};
        this.Props.forEach(function(prop)
        {
            var cur_data = class_inst[prop.Name];
            var new_item;
            if (prop.IsArray)
            {
                if (!Array.isArray(cur_data)) cur_data = [cur_data];
                // xml2js needs typed arrays presented to it as {type:[value,...]}
                var arr = [];
                cur_data.forEach(function(item)
                {
                    var arr_item = factory._encodeType(item, prop, '_to_xml2js', opts, _state);
                    if (arr_item===undefined) throw new Error("XmlTemplate._to_xml2js could not generate " + prop.ClassName);
                    arr.push(arr_item);
                },this);
                var wrap = {};
                wrap[prop.ClassName] = arr;
                new_item = wrap;
            }
            else    // single node is pretty straight forward for xml2js
            {
                var new_item = factory._encodeType(cur_data, prop,'_to_xml2js', opts, _state);
                if (new_item===undefined) throw new Error("XmlTemplate._to_xml2js could not generate " + prop.ClassName);
            }
            new_obj[prop.Name] = new_item;
        }, this);
        return (this.XmlPassthrough ? new_obj[this.XmlPassthrough] : new_obj);
    }
} // END CLASS: XmlTemplate
module.exports.XmlTemplate = XmlTemplate;


/** The XmlTemplateFactory class stores a collection of XmlTemplate instances for serializing them into/out-of XML. */
class XmlTemplateFactory
{
    /**
     * Creates an instance of XmlTemplateFactory.
     *
     * @param {...Function|XmlTemplate} [templates] - Variable number of class functions (with static GetXmlTemplate), or XmlTemplate's, or arrays of either.
     */
    constructor()
    {
        this.XmlTemplates = {}; // use object instead of array so we can use class names as unique keys
        // allow passing list of classes to constructor? both as variable param list or as an array?
        Array.from(arguments).forEach(function(arg)
        {
            if (Array.isArray(arg))
            {
                arg.forEach(function(a)
                {
                    this.add(a);
                },this);
            }
            else this.add(arg);
        },this);
    }
    /**
     * Add a class XML template to the factory.
     *
     * @param {Function|XmlTemplate} xml_template - Class function (with static GetXmlTemplate) or XmlTemplate instance.
     */
    add(xml_template)
    {
        // if passing the actual class with default static function 'GetXmlTemplate' defined, call it to get the XmlTemplate instance
        if (typeof(xml_template) == 'function' && xml_template.GetXmlTemplate) xml_template = xml_template.GetXmlTemplate();
        // Make sure we have a XmlTemplate instance at this point
        if (!(xml_template instanceof module.exports.XmlTemplate)) throw new Error("XmlTemplateFactory.add only takes instances of XmlTemplate OR class functions with static GetXmlTemplate()");
        this.XmlTemplates[xml_template.ClassConstructor.name] = xml_template;
    }
    /**
     * Finds a class XML template from the factory's collection.
     *
     * @param {string|Object|Function} class_name - Name, instance, or class function of the XML class template to find
     * @returns {?XmlTemplate} - Returns the XML template if found, otherwise returns null
     */
    find(class_name)
    {
        class_name = CheckConvertClassName(class_name);
        // Make sure we finally end up with a name string
        if (!module.exports.IsString(class_name)) throw new Error("XmlTemplateFactory.find requires class name");
        return this.XmlTemplates[class_name] || null;
    }
    _decodeType(obj, prop_info, from_method, opts, _state)
    {
        if (obj==null) return null;
        // check for generic Object used as dictionary
        if (prop_info.Dictionary)
        {
            if (prop_info.ClassName == prop_info.Dictionary.PairName)
            {
                // obj is an instance of the KeyValuePairStub
                var tp = prop_info.Dictionary.createPairTemplate();
                return tp[from_method](this, obj, opts, _state);
            }
            else
            {
                var tp = prop_info.Dictionary.createDictTemplate(prop_info.ClassName);
                var new_item = tp[from_method](this, obj, opts, _state);
                // convert stub into {}
                var dict_obj = {};
                if (Array.isArray(new_item.Items))
                {
                    new_item.Items.forEach(function(item)
                    {
                        var key_content = item[prop_info.Dictionary.KeyName];
                        dict_obj[key_content] = item[prop_info.Dictionary.ValueName];
                    }, dict_obj);
                }
                return dict_obj;
            }
        }
        // check simple types
        var func = module.exports.SimpleTypeDecoders[prop_info.ClassName];
        if (func != undefined) return func(obj);
        // check registered class types
        if (!obj) return null; // could be empty string
        var tp = this.find(prop_info.ClassName);
        if (tp==null) return null;  // return undefined to ignore, null to set obj instance to null, or should we throw error?
        return tp[from_method](this,obj);
    }
    _encodeType(obj, prop_info, to_method, opts, _state)
    {
        if (obj==null) return null;
        // check for generic Object used as dictionary
        if (prop_info.Dictionary)
        {
            if (prop_info.ClassName == prop_info.Dictionary.PairName)
            {
                // obj is an instance of the KeyValuePairStub
                var tp = prop_info.Dictionary.createPairTemplate();
                return tp[to_method](this,obj);
            }
            else
            {
                // obj is a {} where property names are keys
                var keys = Object.getOwnPropertyNames(obj);
                var arr = [];
                keys.forEach(function(k)
                {
                    var stub = prop_info.Dictionary.createPairStub(k, obj[k]);
                    arr.push(stub);
                }, arr);
                var tp = prop_info.Dictionary.createDictTemplate(prop_info.ClassName);
                return tp[to_method](this, {Items:arr});
            }
        }
        // check simple types
        var func = module.exports.SimpleTypeEncoders[prop_info.ClassName];
        if (func != undefined) return func(obj);
        // check class types
        var tp = this.find(prop_info.ClassName);
        if (tp==null) return null;  // return undefined to throw, or null to include it as null tag?
        return tp[to_method](this,obj);
    }
    /**
     * Creates a new class instance from the given object from xml2js.
     *
     * @param {Object} xml2js_obj - Object produced by xml2js from XML.
     * @param {Object} [options] - Object of options to use for deserialization (specific to this function).
     * @returns {Object} - An instance of the object deserialized from the XML root.
     */
    from_xml2js(xml2js_obj, options) // create object instance from xml2js object
    {
        // set up any options or initial internal state values
        options = Object.assign({}, options);
        var _state = {};
        // get root node
        var props = Object.getOwnPropertyNames(xml2js_obj);
        if (!Array.isArray(props)) props = Object.getOwnPropertyNames(props); // if not an array, assume root is first property
        if (props.length < 1) throw new Error("XmlTemplateFactory.from_xml2js needs at least one root property");
        // find xml template with which to parse node
        var obj = this.find(props[0]);
        if (obj==null) throw new Error("XmlTemplateFactory does not contain template for '" + props[0] +"'");
        return obj._from_xml2js(this, xml2js_obj[props[0]], options, _state);
    }
    /**
     * Creates a new object for xml2js to use from given instance of a known class.
     *
     * @param {Object} root_obj - Instance of a class known to this factory to be serialized.
     * @param {Object} [options] - Object of options to use for serialization (specific to this function).
     * @returns {Object} - Object that xml2js can use to generate XML.
     */
    to_xml2js(root_obj, options) // create xml2js object from the given object instance
    {
        // set up any options or initial internal state values
        options = Object.assign({}, options);
        var _state = {};
        // find the root object in the xml factory
        var class_name;
        if (module.exports.IsClassInstance(root_obj)) class_name = root_obj.constructor.name;
        else throw new Error("XmlTemplateFactory.to_xml2js cannot determine class name from instance");
        // find xml template with which to parse node
        var obj = this.find(class_name);
        if (obj==null) throw new Error("XmlTemplateFactory does not contain template for '" + class_name +"'");
        // make root node, which for xml2js is an explicit property (using default settings)
        var xml_obj = {};
        xml_obj[class_name] = obj._to_xml2js(this, root_obj, options, _state);
        return xml_obj;
    }
} // END CLASS: XmlTemplateFactory
module.exports.XmlTemplateFactory = XmlTemplateFactory;



//=============TEST

class XmlTestClass2
{
    constructor()
    {
        this.MyNumber = 0;
        this.MyString = "";
    }
    static GetXmlTemplate()
    {
        var temp = new module.exports.XmlTemplate(XmlTestClass2);
        temp.addInt('MyNumber', false);
        temp.addString('MyString')
        return temp;
    }
}
class XmlTestClass1
{
    constructor(arg)
    {
        this.IntArray = []; // array of int
        this.MyDict = []; // dictionary<str,XmlTestClass2>
        this.OneDict = [];
        //this.Str = arg || null;
    }
    static GetXmlTemplate()
    {
        var temp = new module.exports.XmlTemplate(XmlTestClass1);
        temp.addInt('IntArray', true);
        temp.addDict('MyDict', true, 'Dictionary', 'KeyValuePair', 'Key', 'string', 'Value', 'XmlTestClass2' );
        temp.addDict('OneDict', false, 'Dictionary', 'KeyValuePair', 'Key', 'string', 'Value', 'XmlTestClass2' );
        return temp;
    }
}
var XmlFactory = new module.exports.XmlTemplateFactory(XmlTestClass1,XmlTestClass2);
module.exports.Test = function()
{
    //var t = XmlFactory.find(XmlTestClass1);
    //var o = t.newObj(undefined);
    //var t = XmlFactory.find("poop");
    var ntcip_folder = process.env.NTCIP_FOLDER || '/AMSI/User/Ntcip';
    var fname = path.join(ntcip_folder,"xmltest.xml");
    var parser = new xml2js.Parser();
    fs.readFile(fname, function(err, data)
    {
        parser.parseString(data, function (err, result)
        {
            if (err) log(err);
            else
            {
                var obj = null;
                try
                {
                    console.log(util.inspect(result, false, null));
                    obj = XmlFactory.from_xml2js(result);
                    //console.log(util.inspect(MySettings, false, null));
                    console.log(util.inspect(obj, false, null));
                }
                catch(e) { log("RestServiceSettings load failed: " + e.message); obj=null;}

                var fname = path.join(ntcip_folder,"xmltest2.xml");
                var js_obj = XmlFactory.to_xml2js(obj);
                var builder = new xml2js.Builder();
                var xml = builder.buildObject(js_obj);
                fs.writeFile(fname, xml, function(err)
                {
                    if(err) log(err);
                });

            }
        });
    });
}
