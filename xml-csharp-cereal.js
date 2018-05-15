'use strict';
/**
 * Node.js XML serializer with an eye toward C# XmlSerializer interop
 * @module xml-csharp-cereal
 */

// Put a copy of package.json version here in case module is used by itself.
module.exports.getVersion = function getVersion() { return '0.0.0'; }

/* xml-csharp-cereal.js
This module is to aid in the serializing of XML to and from classes in a fashion similar to C#.
However we must create xml template classes to describe the structure and aid in the process.
It is assumed all arrays have elements of the same type.
During parsing from XML, class constructors are called without arguments (unless a default set is stored in its template).
If needed, code could be modified to store some arguments to pass to the constructor in the XmlTemplate.
*/

/* TODO -
-attributes on array elements? elements probably classes as primitives don't have members?
-simple type encoders/decoders should be in object in case we want to add more info to simple types?
-Derived type handling?
    <!-- Manager class derives from Employee -->
    <Employees>
        <Employee>
            <Name>Haley</Name>
        </Employee>
        <Employee xsi:type = "Manager">
            <Name>Ann</Name>
            <Level>3</Level>
        <Employee>
    </Employees >
 */
/*
DataContractSerializer notes (if we go there)
-Root tag notes full class namespace xmlns="http://schemas.datacontract.org/2004/07/csharpxml.Test1".
-All tag are in alphabetical order.
-No tags can be omitted, nulls use attribute nil="true".
-Arrays and dictionaries are tagged xmlns:d2p1="http://schemas.microsoft.com/2003/10/Serialization/Arrays".
-Jagged Array and dictionary type tags follow different naming convention compared to XmlSerializer.
-Built-in DateTime and TimeSpan support using ISO strings.
*/

/*Example using xml2js objects:   [tested vs xml2js 0.4.19]
    const xml2js = require('xml2js');
    const fs = require('fs');
    . . .
    var temps = new module.exports.XmlTemplateFactory(); // need to setup factory with all our class templates
    temps.add(MyClass1);    // using class function that has static GetXmlTemplate()
    temps.add(MakeTemplateForMyClass2());   // getting a XmlTemplate from some custom function
    // (NOTE: if classes have default GetXmlTemplate, they can be listed in XmlTemplateFactory constructor instead of calling add manually.)
    var parser = new xml2js.Parser(); // using defaults {explicitArray:true,explicitRoot:true}
    fs.readFile("/some/path/to/xml", function(err, data)
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
Example using xml-js:
    TODO - ?
*/


// region "Some parsers for primitive node values" -----

/**
 * This callback takes value from XML and decodes it into appropriate value for object.
 * @callback DecoderCallback
 * @param {any} val the XML value to decode
 * @param {any} err_val result value to return on error
 * @return {any} the decoded value or err_val
 */

module.exports.DecodeInt = function DecodeInt(val, err_val)
{
    var n = parseInt(val);
    if (Number.isFinite(n)) return n;
    return err_val;
}
module.exports.DecodeFloat = function DecodeFloat(val, err_val)
{
    var n = parseFloat(val);
    if (Number.isFinite(n)) return n;
    return err_val;
}
module.exports.DecodeDouble = function DecodeDouble(val, err_val)
{
    // parseFloat is effectively  parseDouble
    var n = parseFloat(val);
    if (Number.isFinite(n)) return n;
    return err_val;
}
module.exports.DecodeBool = function DecodeBool(val, err_val)
{
    if (module.exports.IsString(val))
    {
        if (val.toUpperCase()=='TRUE') return true;
        if (val.toUpperCase()=='FALSE') return false;
        var num = module.exports.DecodeInt(val, null); // if '1' or '0' perhaps?
        if (num==null) return err_val;
        return (num != 0);  // any non-zero value is true?
    }
    else
    {
        return (val ? true : false); // rely on falsy/truthy ?
    }
}
module.exports.DecodeString = function DecodeString(val, err_val)
{
    // process undefined the same as null, or should we catch and return err_val?
    if (val==null) return null; // should we return null or "" ?
    return val.toString(); // just in case it isn't already a string?
}
module.exports.DecodeDateTime = function DecodeDateTime(val, err_val)
{
    // '2018-05-30T17:30:00'
    // process undefined the same as null, or should we catch and return err_val?
    if (val==null) return null; // could be nullable
    return new Date(val);
}
/* Might want to defer due to many possible approaches and external libraries?
module.exports.DecodeTimeSpan = function DecodeTimeSpan(val, err_val)
{
    // 'P1DT10H17M36.789S'
    // There's moment.isoduration.js or TimeSpan.js ?
    // process undefined the same as null, or should we catch and return err_val?
    if (val==null) return null; // could be nullable
    return new Date(val);
}*/

/**
 * This callback takes value from object and encodes it into appropriate value for XML.
 * @callback EncoderCallback
 * @param {any} val the value to encode
 * @param {any} err_val result value to return on error
 * @return {any} the encoded XML value or err_val
 */

module.exports.EncodeString = function EncodeString(val, err_val)
{
    return val.toString(); // just in case it isn't already a string?
}
module.exports.EncodeBool = function EncodeBool(val, err_val)
{
    return (val ? 'true' : 'false'); // c sharp xml prints the lowercase string
}
module.exports.EncodePassthrough = function EncodePassthrough(val, err_val)
{
    // numbers should passthrough fine, unless XML library needs them an explicit type?
    if (val instanceof Number) return val.valueOf(); // unwrap if in Number object ?
    return val; // no special processing required before passing to XML library
}
module.exports.EncodeDateTime = function EncodeDateTime(val, err_val)
{
    // '2018-05-30T17:30:00'
    // process undefined the same as null, or should we catch and return err_val?
    if (val==null) return null; // could be nullable
    if (val instanceof Date) return val.toISOString();
    if (module.exports.IsString(val)) return val; // assume if string, it's just passing through
    return err_val;
}

// endregion "Some parsers for primitive node values" -----

module.exports.CsharpTypeAliases =
{
    // there is no Int8/UInt8, it just stays sbyte/byte or SByte/Byte
    'int': 'Int32',
    'uint': 'UInt32',
    'short': 'Int16',
    'ushort': 'UInt16',
    'long': 'Int64',
    'ulong': 'UInt64',
}


// region "Helper Functions" -----

module.exports.IsString = function IsString(val) { return (typeof(val)=='string' || val instanceof String); }
// Technically prototype and constructor should always be there?
module.exports.IsClassFunction = function IsClassFunction(val) { return (typeof(val) == 'function' && val.prototype); }
module.exports.IsClassInstance = function IsClassInstance(val) { return (typeof(val) == 'object' && val.constructor); }
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

// prefix is used for XML generation, during XML reading the uri is searched and its given prefix is used during parsing
module.exports.dc_ArrayNS = {uri:"http://schemas.microsoft.com/2003/10/Serialization/Arrays",prefix:'d2p1'};
module.exports.dc_SystemNS = {uri:"http://schemas.datacontract.org/2004/07/System",prefix:'d2p1'};
module.exports.dc_noNS = {uri:"",prefix:""};

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
        var temp = new xml_sharp.XmlTemplate(this);
        temp.add('Dictionary', 'KeyValuePair', 1);
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
 * Internal stub for abstracting an array that is transparent in the XML structure.
 * @private
 * @class ArrayStub
 */
class ArrayStub
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
    constructor(pair_name, key_prop, value_prop)
    {
        if (!module.exports.IsString(pair_name)) throw new Error('DictionaryFactory pair_name must be string');
        if (!(key_prop instanceof module.exports.XmlTemplateItem)) throw new Error('DictionaryFactory key_class must be XmlTemplateItem');
        if (!(value_prop instanceof module.exports.XmlTemplateItem)) throw new Error('DictionaryFactory value_class must be XmlTemplateItem');
        // TODO - ACTUALLY for a generic {} dictionary, the key must be a string or representable as a string? At least for now.
        // Actually any simple type that can be used as an object prop name should work?
        //if (key_prop.ClassName!='string') throw new Error('DictionaryFactory: At this time key_class must be "string"');
        this.PairName = pair_name;
        this.KeyProp = key_prop;
        this.ValueProp = value_prop;
    }
    createDictTemplate(class_name)
    {
        var t = new module.exports.XmlTemplate(ArrayStub);
        var item = t.add('Items', this.PairName, 1);
        item.DictionaryData = this;
        t.XmlPassthrough = 'Items'; // in xml processing, this class is transparent, the value of Items replaces the class itself in XML
        return t;
    }
    createPairTemplate(key, value)
    {
        // create a temporary template for this particular KeyValuePair
        var args = [this.KeyProp.Name, key, this.ValueProp.Name, value];
        var t = new module.exports.XmlTemplate(KeyValuePairStub, args);
        t.add(this.KeyProp);    // TODO - do these need to be clones? just pass the props?
        t.add(this.ValueProp);
        return t;
    }
    createPairStub(key, value)
    {
        return new KeyValuePairStub(this.KeyProp.Name, key, this.ValueProp.Name, value);
    }
} // END CLASS: DictionaryFactory
// endregion "Generic object as Dictionary" -----

module.exports.arrLevels = function arrLevels(levels, class_name, is_DataContract)
{
    var Levels = [];
    var str = (is_DataContract ? class_name : class_name.charAt(0).toUpperCase() + class_name.slice(1));
    Levels[0] = class_name;
    for (let i=1; i < levels; ++i)
    {
        str = ('ArrayOf' + str);
        Levels[i] = str;
    }
    return Levels;
}

/**
 * Internal factory for handling potentially multidimensional arrays
 * @private
 * @class ArrayFactory
 */
class ArrayFactory
{
    constructor(levels, class_name) // levels is either a number of dimensions or an array of string names
    {
        // levels are named from inner dimension to outer dimensions
        if (!Array.isArray(levels)) // if no names given, guess based on observed patterns
        {
            this.Levels = module.exports.arrLevels(levels, class_name);
        }
        else this.Levels = levels;
    }
    getTopClass() { return this.Levels[this.Levels.length-1]; }
    isOneDim() { return (this.Levels==null || this.Levels.length==1); }
    nextProp(cur_prop) // call in from?
    {
        if (this.isOneDim()) return cur_prop; // hit the end, process as normal array
        var NextName = this.getTopClass();
        var prop = cur_prop.clone(cur_prop.Name, NextName);
        prop.ArrayData = new ArrayFactory(this.Levels.slice(0, -1));
        return prop;
    }
    nextTemp(prop_info) // call in decode/encode to handle extra layer
    {
        var t = new module.exports.XmlTemplate(ArrayStub);
        t.add(prop_info.clone('Items', prop_info.ArrayData.getTopClass()));
        t.XmlPassthrough = 'Items'; // in xml processing, this class is transparent, the value of Items replaces the class itself in XML
        return t;
    }
} // END CLASS: ArrayFactory

/** Class representing the XML template for a given property. */
class XmlTemplateItem
{
    /**
     * Creates an instance of XmlTemplateItem.
     * @param {string} prop_name Property Name
     * @param {string} class_name Class or Type Name
     * @param {number|string[]} [arr_levels=0] Number of dimensions or array of tag names (if not defined, assumes no array)
     * @param {string} namespace DataContract name space
     */
    constructor(prop_name, class_name, arr_levels, namespace)
    {
        if (!module.exports.IsString(prop_name)) throw new Error('XmlTemplateItem.constructor prop_name must be string');
        if (!module.exports.IsString(class_name)) throw new Error('XmlTemplateItem.constructor class_name must be string');
        //if (class_name=='') throw new Error("XmlTemplateItem.constructor class_name cannot be empty string");
        this.Name = prop_name;
        this.ClassName = class_name;
        // instance of ArrayFactory
        if (arr_levels instanceof ArrayFactory) this.ArrayData = arr_levels;
        else if (Array.isArray(arr_levels)) this.ArrayData = new ArrayFactory(arr_levels, this.ClassName);
        else if (arr_levels > 0) this.ArrayData = new ArrayFactory(module.exports.arrLevels(arr_levels,this.ClassName,(namespace!=null)), this.ClassName);
        else this.ArrayData = null;
        this.NullableData = null;
        this.AttrData = null;
        this.NameSpace = namespace; // DataContract
        // temp runtime props
        //this.DictionaryData = null; // can hold a DictionaryFactory in a KeyValuePair during XML processing
        // Add a member for tracking XML element vs attribute?
    }
    toString() { return this.Name; }
    clone(prop_name, class_name, arr_levels, namespace)
    {
        if (prop_name==undefined) prop_name = this.Name;
        if (class_name==undefined) class_name = this.ClassName;
        if (arr_levels==undefined) arr_levels = this.ArrayData;
        if (namespace==undefined) namespace = this.NameSpace;
        var n = new module.exports.XmlTemplateItem(prop_name, class_name, arr_levels, namespace);
        n.NullableData = this.NullableData;
        n.AttrData = this.AttrData; // TODO - AttrData ?
        return n;
    }
    nullable()
    {
        if (this.AttrData) throw new Error("Nullable types not supported as XML attributes")
        this.NullableData = {}; // could contain other options if needed?
        return this;
    }
    attr()
    {
        if (this.ArrayData) throw new Error("Arrays not supported as XML attributes");
        if (this.NullableData) throw new Error("Nullable types not supported as XML attributes")
        // mark prop as an attribute? does it need to be a primitive or just call toString/ValueOf? Rely on given type decode/encode functions?
        this.AttrData = {};
        return this;
    }
} // END CLASS: XmlTemplateItem
module.exports.XmlTemplateItem = XmlTemplateItem;


/** The XmlTemplate class stores info of how a class's properties are to be serialized. */
class XmlTemplate
{
    /**
     * Creates an instance of XmlTemplate.
     * @param {Function} parent_class Class function (essentially the constructor)
     * @param {?any[]} [constructor_args=null] Arguments to feed constructor when creating a new instance
     */
    constructor(parent_class, constructor_args)
    {
        if (!module.exports.IsClassFunction(parent_class)) throw new Error('XmlTemplate.constructor requires parent_class to be class function');
        if (constructor_args!=null && !Array.isArray(constructor_args)) throw new Error('XmlTemplate.constructor requires constructor_args to be null or an array');
        this.ClassConstructor = parent_class;
        this.ConstructorArgs = constructor_args || null;
        this.Props = []; // array of XmlTemplateItem
        // temp runtime props
        //this.XmlPassthrough = null; // name of prop that is used as abstract passthrough for XML processing
    }
    /**
     * Returns a new instance of the class associated with this template.
     *
     * @param {...any} constructor_args If parameters given, they are passed to constructor; otherwise any stored ConstructorArgs are used.
     * @returns {Object} New instance of ClassConstructor (using ConstructorArgs if any)
     */
    newObj(...constructor_args)
    {
        // NOTE: explicitly passing undefined counts as arguments.length==1 which would override ConstructorArgs if needed.
        if (constructor_args.length>0) return new this.ClassConstructor(...constructor_args);
        if (Array.isArray(this.ConstructorArgs)) return new this.ClassConstructor(...this.ConstructorArgs);
        return new this.ClassConstructor();
    }
    /**
     * Add property to this class XML template.
     *
     * @param {string|XmlTemplateItem} prop_name Property Name or instance of Property XML template. If passing full item template, other parameters are ignored.
     * @param {string|Function|Object} class_name Class Name or Class instance or Class function of the property.
     * @param {number|string[]} [arr_levels=0] Number of dimensions or array of tag names (if not defined, assumes no array)
     * @returns {XmlTemplateItem} instance of the new property XML template that was added
     */
    add(prop_name, class_name, arr_levels, namespace)
    {
        var obj = prop_name; // allow feeding just a XmlTemplateItem instance
        if (!(obj instanceof module.exports.XmlTemplateItem))
        {
            class_name = CheckConvertClassName(class_name);
            obj = new module.exports.XmlTemplateItem(prop_name, class_name, arr_levels, namespace);
        }
        this.Props.push(obj);
        return obj; // return XmlTemplateItem in case it is useful at some point?
    }
    // common type add helpers
    addString(prop_name, arr_levels, namespace) {return this.add(prop_name,'string',arr_levels,namespace)}
    addSByte(prop_name, arr_levels, namespace) {return this.add(prop_name,'sbyte',arr_levels,namespace)}
    addByte(prop_name, arr_levels, namespace) {return this.add(prop_name,'byte',arr_levels,namespace)}
    addInt(prop_name, arr_levels, namespace) {return this.add(prop_name,'int',arr_levels,namespace)}
    addUInt(prop_name, arr_levels, namespace) {return this.add(prop_name,'uint',arr_levels,namespace)}
    addShort(prop_name, arr_levels, namespace) {return this.add(prop_name,'short',arr_levels,namespace)}
    addUShort(prop_name, arr_levels, namespace) {return this.add(prop_name,'ushort',arr_levels,namespace)}
    addLong(prop_name, arr_levels, namespace) {return this.add(prop_name,'long',arr_levels,namespace)}
    addULong(prop_name, arr_levels, namespace) {return this.add(prop_name,'ulong',arr_levels,namespace)}
    addFloat(prop_name, arr_levels, namespace) {return this.add(prop_name,'float',arr_levels,namespace)}
    addDouble(prop_name, arr_levels, namespace) {return this.add(prop_name,'double',arr_levels,namespace)}
    addBool(prop_name, arr_levels, namespace) {return this.add(prop_name,'bool',arr_levels,namespace)}
    addDateTime(prop_name, arr_levels, namespace) {return this.add(prop_name,'DateTime',arr_levels,namespace)}
    addTimeSpan(prop_name, arr_levels, namespace) {return this.add(prop_name,'TimeSpan',arr_levels,namespace)}
    /*addAuto(prop) // if props have an initial value, could we automatically determine class names? Could be problematic?
    {
        var class_name = GuessClassName(prop);
        var prop_name = ; // need to either determine original name or pass separately?
        this.add(prop_name, class_name);
    }*/
    convToDataContract(class_namespace)
    {
        // sort Props
        this.Props.sort();
        // make everything nullable?
        this.Props.forEach(function(item)
        {
            item.nullable();
        });
        // Add namespace to class
        this.ClassNameSpace = class_namespace;
    }
    // parsing/generating methods for various kinds of XML library objects
    /**
     * Deserializes this class from the given XML node
     * @private
     * @param {XmlTemplateFactory} factory Instance of XML factory to use
     * @param {Object} xml2js_obj An xml2js object describing an XML file
     * @param {Object} opts Options to be used during the deserialization process
     * @param {Object} _state Internal state information
     * @return {Object} Instance of this class resulting from the XML
     */
    _from_xml2js(factory, xml2js_obj, opts, _state)
    {
        if (xml2js_obj==null) return null;
        var new_obj = this.newObj();
        this.Props.forEach(function(prop)
        {
            var xml_node;
            if (this.XmlPassthrough) xml_node = xml2js_obj;
            else if (prop.AttrData) xml_node = (xml2js_obj.$ ? xml2js_obj.$[prop.Name] : undefined);
            else xml_node = xml2js_obj[_state.Prefix+prop.Name];
            if (xml_node!=undefined) // XML has this class property
            {
                var prev_prefix = _state.Prefix;
                var new_item = undefined; // null is a valid answer, so use undefined until it is defined
                // xml2js default has everything an array in case there are multiple tags of the same name.
                // We assume class properties are only used once and thus grab the first
                if (Array.isArray(xml_node) && !this.XmlPassthrough)
                {
                    if (xml_node.length<1) return;
                    else xml_node = xml_node[0];
                }
                if (xml_node.$ && xml_node.$[_state.XmlInstance+':nil']=='true') // regardless of being nullable, if tagged nil make it null
                {
                    new_obj[prop.Name] = null;
                    return;
                }
                if (prop.NameSpace != null)
                {
                    if(prop.NameSpace.uri=='') _state.Prefix = '';
                    else
                    {
                        let ns = xml2js_FindNS(xml_node, prop.NameSpace.uri);
                        if (ns!=null) _state.Prefix = ns + ':';
                    }
                }
                if (prop.ArrayData)   // we expect an array of a single type
                {
                    // xml2js will turn our type tags into a property containing the sub nodes as another array.
                    // At this point we have {type:[value,...]}
                    var arrProp = prop.ArrayData.nextProp(prop);
                    var node_arr = xml_node[_state.Prefix+arrProp.ClassName];
                    if (node_arr==undefined)
                    {
                        if (this.XmlPassthrough==arrProp.Name) new_obj[arrProp.Name] = null;
                        return;
                    }
                    if (!Array.isArray(node_arr)) node_arr = [node_arr]; // in case it isn't in an array
                    new_item = [];
                    node_arr.forEach(function(item)
                    {
                        if (item.$ && item.$[_state.XmlInstance+':nil']=='true') new_item.push(null);
                        else
                        {
                            var temp = factory._decodeType(item, arrProp, '_from_xml2js', opts, _state);
                            if (temp!==undefined) new_item.push(temp); // null is a valid answer
                        }
                    }, this);
                    new_obj[arrProp.Name] = new_item;
                    /* if (new_item.length>0) new_obj[arrProp.Name] = new_item; // null is a valid answer
                    else new_obj[arrProp.Name] = null; */
                }
                else // we expect a single value
                {
                    new_item = factory._decodeType(xml_node, prop, '_from_xml2js', opts, _state);
                    if (new_item!==undefined) new_obj[prop.Name] = new_item; // null is a valid answer
                }
                _state.Prefix = prev_prefix;
            }
            //else new_obj[prop.Name] = null; // XML does not have this prop, so it must be null? Actually value should be unchanged.
        }, this);
        return new_obj;
    }
    /**
     *
     * Serializes this class to a XML node
     * @private
     * @param {XmlTemplateFactory} factory Instance of XML factory to use
     * @param {Object} class_inst Instance of this class from which to produce XML
     * @param {Object} opts Options to be used during the deserialization process
     * @param {Object} _state Internal state information
     * @return {Object} xml2js object describing the resulting XML node
     */
    _to_xml2js(factory, class_inst, opts, _state)
    {
        if (class_inst==null) return null;
        var new_obj = {};
        this.Props.forEach(function(prop)
        {
            var prev_prefix = _state.Prefix;
            var new_item;
            if (prop.NameSpace != null)
            {
                if(prop.NameSpace.uri=='') _state.Prefix = '';
                else _state.Prefix = prop.NameSpace.prefix+':';
            }
            var cur_data = class_inst[prop.Name];
            if (cur_data==null)
            {
                if (prop.NullableData) new_obj[prev_prefix+prop.Name] = new_item = { $: { [_state.XmlInstance+':nil']:'true' } };
            }
            else if (prop.ArrayData)
            {
                if (!Array.isArray(cur_data)) cur_data = [cur_data];
                // xml2js needs typed arrays presented to it as {type:[value,...]}
                var arrProp = prop.ArrayData.nextProp(prop);
                var arr = [];
                cur_data.forEach(function(item)
                {
                    var arr_item;
                    if (item==null) arr_item = { $: { [_state.XmlInstance+':nil']:'true' } }; // null array items must be listed
                    else
                    {
                        arr_item = factory._encodeType(item, arrProp, '_to_xml2js', opts, _state);
                        if (arr_item===undefined) throw new Error('XmlTemplate._to_xml2js could not generate "' + arrProp.ClassName +'"');
                    }
                    arr.push(arr_item);
                },this);
                var wrap = {};
                wrap[_state.Prefix+arrProp.ClassName] = arr;
                new_item = wrap;
                if (this.XmlPassthrough) new_obj[prop.Name] = new_item;
                else new_obj[prev_prefix+arrProp.Name] = new_item;
            }
            else    // single node is pretty straight forward for xml2js
            {
                var new_item;
                new_item = factory._encodeType(cur_data, prop,'_to_xml2js', opts, _state);
                if (new_item===undefined) throw new Error('XmlTemplate._to_xml2js could not generate "' + prop.ClassName+'"');
                if (prop.AttrData && new_item != null)
                {
                    //new_obj.$ = Object.assign({ [prop.Name]:new_item }, new_obj.$); // easier, but reverses order?
                    xml2js_AddAttr(new_obj, prop.Name, new_item);
                }
                else if (this.XmlPassthrough) new_obj[prop.Name] = new_item;
                else new_obj[prev_prefix+prop.Name] = new_item;
            }
            if (_state.Prefix != prev_prefix && prop.NameSpace && prop.NameSpace.uri) xml2js_AddAttrBack(new_item, 'xmlns:'+prop.NameSpace.prefix, prop.NameSpace.uri);
            _state.Prefix = prev_prefix;
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
     * @param {...Function|XmlTemplate} [templates] Variable number of class functions (with static GetXmlTemplate), or XmlTemplate's, or arrays of either.
     */
    constructor(...templates)
    {
        this.XmlTemplates = {}; // use object instead of array so we can use class names as unique keys
        // allow passing list of classes to constructor? both as variable param list or as an array?
        Array.from(templates).forEach(function(arg)
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
        // Allow each factory to hold its own simple type handlers so they can be customized per factory
        this.SimpleTypeDecoders =
        {
            'string': module.exports.DecodeString,
            'long': module.exports.DecodeString,
            'ulong': module.exports.DecodeString,
            'byte': module.exports.DecodeInt,
            'sbyte': module.exports.DecodeInt,
            'int': module.exports.DecodeInt,
            'uint': module.exports.DecodeInt,
            'short': module.exports.DecodeInt,
            'ushort': module.exports.DecodeInt,
            'float': module.exports.DecodeFloat,
            'double': module.exports.DecodeDouble,
            'bool': module.exports.DecodeBool,
            'DateTime': module.exports.DecodeDateTime,
            'TimeSpan': module.exports.DecodeString,
        };
        this.SimpleTypeEncoders =
        {
            'string': module.exports.EncodeString,
            'long': module.exports.EncodeString,
            'ulong': module.exports.EncodeString,
            'byte': module.exports.EncodePassthrough,
            'sbyte': module.exports.EncodePassthrough,
            'int': module.exports.EncodePassthrough,
            'uint': module.exports.EncodePassthrough,
            'short': module.exports.EncodePassthrough,
            'ushort': module.exports.EncodePassthrough,
            'float': module.exports.EncodePassthrough,
            'double': module.exports.EncodePassthrough,
            'bool': module.exports.EncodeBool,
            'DateTime': module.exports.EncodeDateTime,
            'TimeSpan': module.exports.EncodeString,
        };
        // Enumerations
        this.Enums = {};
        // Implicit object dictionaries
        this.ImplicitDicts = {};
    }
    /**
     * Add a class XML template to the factory.
     *
     * @param {Function|XmlTemplate} xml_template Class function (with static GetXmlTemplate) or XmlTemplate instance.
     */
    add(xml_template)
    {
        // if passing the actual class with default static function 'GetXmlTemplate' defined, call it to get the XmlTemplate instance
        if (typeof(xml_template) == 'function' && typeof(xml_template.GetXmlTemplate) == 'function') xml_template = xml_template.GetXmlTemplate();
        // Make sure we have a XmlTemplate instance at this point
        if (!(xml_template instanceof module.exports.XmlTemplate)) throw new Error('XmlTemplateFactory.add only takes instances of XmlTemplate OR class functions with static GetXmlTemplate()');
        this.XmlTemplates[xml_template.ClassConstructor.name] = xml_template;
        return this;
    }
    /**
     * Adds an enum type description
     * @param {string} enum_name Name of the enum
     * @param {Object} enum_obj Simple object representation of the enum, or object providing getEnumValue and getEnumName functions
     * @return {XmlTemplateFactory} This factory instance
     */
    addEnum(enum_name, enum_obj)
    {
        this.Enums[enum_name] = enum_obj;
        return this;
    }
    /**
     * Adds an implicit dictionary description
     * @param {string} class_name Name of dictionary class
     * @param {string} pair_name Name of key-value pair
     * @param {XmlTemplateItem|any[]} key_prop Property info for the key (if given array, it is passed to XmlTemplateItem constructor)
     * @param {XmlTemplateItem|any[]} value_prop Property info for the value (if given array, it is passed to XmlTemplateItem constructor)
     * @return {XmlTemplateFactory} This factory instance
     */
    addDict(class_name, pair_name, key_prop, value_prop)
    {
        if (Array.isArray(key_prop)) key_prop = new module.exports.XmlTemplateItem(...key_prop);
        if (Array.isArray(value_prop)) value_prop = new module.exports.XmlTemplateItem(...value_prop);
        var t = new DictionaryFactory(pair_name, key_prop, value_prop);
        this.ImplicitDicts[class_name] = t;
        return this;
    }
    /**
     * Adds an implicit dictionary description assuming 'KeyValuePair' with string 'Key'
     * @param {string} class_name Name of dictionary class
     * @param {string|XmlTemplateItem|any[]} value_class Value class name or property info (if given array, it is passed to XmlTemplateItem constructor)
     * @param {number|string[]} [value_arr_levels=0] Number of dimensions or array of tag names (if not defined, assumes no array)
     * @return {XmlTemplateFactory} This factory instance
     */
    addDictQuick(class_name, value_class, value_arr_levels)
    {
        if (Array.isArray(value_class)) value_class = new module.exports.XmlTemplateItem(...value_class);
        if (value_class instanceof module.exports.XmlTemplateItem) // value_class is full item
        {
            var alias = module.exports.CsharpTypeAliases[value_class.ClassName];
            if (alias==undefined) alias = value_class.ClassName;
        }
        else // value_class is just a class name
        {
            var alias = module.exports.CsharpTypeAliases[value_class];
            if (alias==undefined) alias = value_class;
            value_class = new module.exports.XmlTemplateItem('Value', value_class, value_arr_levels);
        }
        if (class_name==undefined) class_name = 'DictionaryOfString' + alias.charAt(0).toUpperCase() + alias.slice(1);
        return this.addDict(class_name, 'KeyValuePair', ['Key', 'string'], value_class);
    }
    /**
     * Finds a class XML template from the factory's collection.
     *
     * @param {string|Object|Function} class_name Name, instance, or class function of the XML class template to find
     * @returns {?XmlTemplate} Returns the XML template if found, otherwise returns null
     */
    find(class_name)
    {
        class_name = CheckConvertClassName(class_name);
        // Make sure we finally end up with a name string
        if (!module.exports.IsString(class_name)) throw new Error('XmlTemplateFactory.find requires class name');
        return this.XmlTemplates[class_name] || null;
    }
    /**
     * Decodes a given property from XML value to object value
     * @param {any} obj Instance of the property to be decoded
     * @param {XmlTemplateItem} prop_info XML template for the give property
     * @param {string} from_method Name of the function to call on prop_info to process next level of XML processing
     * @param {Object} opts Options to pass through to next level of XML processing
     * @param {Object} _state State to pass through to next level of XML processing
     * @return {any} Value of the decoded type (could be simple type or another object)
     */
    _decodeType(obj, prop_info, from_method, opts, _state)
    {
        if (obj==null) return null;
        // check for jagged array
        if (prop_info.ArrayData && prop_info.ClassName != prop_info.ArrayData.getTopClass())
        {
            var tp = prop_info.ArrayData.nextTemp(prop_info);
            var new_item = tp[from_method](this, obj, opts, _state);
            return (Array.isArray(new_item.Items) ?  new_item.Items : null);
        }
        // check for generic Object used as dictionary
        if (prop_info.DictionaryData)
        {
            // obj is an instance of the KeyValuePairStub
            var tp = prop_info.DictionaryData.createPairTemplate();
            return tp[from_method](this, obj, opts, _state);
        }
        var dict_factory = this.ImplicitDicts[prop_info.ClassName];
        if (dict_factory)
        {
            var tp = dict_factory.createDictTemplate(prop_info.ClassName);
            var new_item = tp[from_method](this, obj, opts, _state);
            // convert stub into {}
            var dict_obj = {};
            if (Array.isArray(new_item.Items))
            {
                new_item.Items.forEach(function(item)
                {
                    var key_content = item[dict_factory.KeyProp.Name];
                    dict_obj[key_content] = item[dict_factory.ValueProp.Name];
                });
            }
            return dict_obj;
        }
        // check for enums
        var enum_obj = this.Enums[prop_info.ClassName];
        if (enum_obj!=undefined)
        {
            var v = null;
            if (typeof(enum_obj.getEnumValue)=='function') v = enum_obj.getEnumValue(obj);
            else v = enum_obj[obj];
            // if it's undefind it will be ignored, do we want an error instead?
            if (v==null) throw new Error(prop_info.ClassName + ' does not define "' + obj +'"');
            return v;
        }
        // check simple types
        var func = this.SimpleTypeDecoders[prop_info.ClassName];
        if (func != undefined) return func(obj);
        // check registered class types
        if (!obj) return null; // could be empty string
        var tp = this.find(prop_info.ClassName);
        if (tp==null) return null;  // return undefined to ignore, null to set obj instance to null, or should we throw error?
        return tp[from_method](this, obj, opts, _state);
    }
    /**
     * Encodes an object property value into XML value
     * @param {any} obj Property value to encode
     * @param {XmlTemplateItem} prop_info Template describing the property to encode
     * @param {string} to_method Name of prop_info function to call to process next level of XML processing
     * @param {Object} opts Options to pass through to next level of XML processing
     * @param {Object} _state state to pass through to next level of XML processing
     * @return {any} Value for use in XML
     */
    _encodeType(obj, prop_info, to_method, opts, _state)
    {
        if (obj==null) return null;
        // check for jagged array
        if (prop_info.ArrayData && prop_info.ClassName != prop_info.ArrayData.getTopClass())
        {
            var tp = prop_info.ArrayData.nextTemp(prop_info);
            var stub_obj = {Items: obj};
            return tp[to_method](this, stub_obj, opts, _state);
        }
        // check for generic Object used as dictionary
        if (prop_info.DictionaryData)
        {
            // obj is an instance of the KeyValuePairStub
            var tp = prop_info.DictionaryData.createPairTemplate();
            return tp[to_method](this, obj, opts, _state);
        }
        var dict_factory = this.ImplicitDicts[prop_info.ClassName];
        if (dict_factory)
        {
            // obj is a {} where property names are keys
            var keys = Object.getOwnPropertyNames(obj);
            var arr = [];
            keys.forEach(function(k)
            {
                var stub = dict_factory.createPairStub(k, obj[k]);
                arr.push(stub);
            });
            var tp = dict_factory.createDictTemplate(prop_info.ClassName);
            return tp[to_method](this, {Items:arr}, opts, _state);
        }
        // check for enum
        var enum_obj = this.Enums[prop_info.ClassName];
        if (enum_obj!=undefined)
        {
            var n = null;
            if (typeof(enum_obj.getEnumName)=='function') n = enum_obj.getEnumName(obj);
            else
            {
                var keys = Object.getOwnPropertyNames(enum_obj);
                keys.forEach(function(k)
                {
                    if (enum_obj[k]==obj) n = k;
                });
            }
            // if it cannot find enum name, do we error or just use the raw value?
            if (n==null) throw new Error(prop_info.ClassName + ' does not define "' + obj +'"');
            return n;
        }
        // check simple types
        var func = this.SimpleTypeEncoders[prop_info.ClassName];
        if (func != undefined) return func(obj);
        // check class types
        var tp = this.find(prop_info.ClassName);
        if (tp==null) return null;  // return undefined to throw, or null to include it as null tag?
        return tp[to_method](this, obj, opts, _state);
    }
    /**
     * Creates a new class instance from the given object from xml2js.
     *
     * @param {Object} xml2js_obj Object produced by xml2js from XML.
     * @param {Object} [options] Object of options to use for deserialization (specific to this function).
     * @returns {Object} An instance of the object deserialized from the XML root.
     */
    from_xml2js(xml2js_obj, options) // create object instance from xml2js object
    {
        // set up any options or initial internal state values
        options = Object.assign({}, options);
        var _state = {Prefix:''};
        // get root node
        var props = Object.getOwnPropertyNames(xml2js_obj);
        if (!Array.isArray(props)) props = Object.getOwnPropertyNames(props); // if not an array, assume root is first property
        if (props.length < 1) throw new Error('XmlTemplateFactory.from_xml2js needs at least one root property');
        var root_name = props[0];
        var root_node = xml2js_obj[root_name];
        // find xml template with which to parse node
        var root_temp = this.find(root_name);
        if (root_temp==null) throw new Error('XmlTemplateFactory does not contain template for "' + root_name +'"');
        // grab any needed namespace info off root element
        var inst_ns = xml2js_FindNS(root_node, 'http://www.w3.org/2001/XMLSchema-instance');
        if (inst_ns) _state.XmlInstance = inst_ns;
        return root_temp._from_xml2js(this, xml2js_obj[props[0]], options, _state);
    }
    /**
     * Creates a new object for xml2js to use from given instance of a known class.
     *
     * @param {Object} root_obj Instance of a class known to this factory to be serialized.
     * @param {Object} [options] Object of options to use for serialization (specific to this function).
     * @returns {Object} Object that xml2js can use to generate XML.
     */
    to_xml2js(root_obj, options) // create xml2js object from the given object instance
    {
        // set up any options or initial internal state values
        options = Object.assign({}, options);
        var _state = {Prefix:''};
        // find the root object in the xml factory
        var class_name;
        if (module.exports.IsClassInstance(root_obj)) class_name = root_obj.constructor.name;
        else throw new Error('XmlTemplateFactory.to_xml2js cannot determine class name from instance');
        // find xml template with which to parse node
        var temp = this.find(class_name);
        if (temp==null) throw new Error('XmlTemplateFactory does not contain template for "' + class_name +'"');
        // make root node, which for xml2js is an explicit property (using default settings)
        var xml_obj = {};
        _state.XmlInstance = (temp.ClassNameSpace ? 'i' : 'xsi'); // we will add the actual namespace at the end
        xml_obj[class_name] = temp._to_xml2js(this, root_obj, options, _state);
        if (typeof(xml_obj[class_name])=='object')
        {
            // add typical namespaces, taking care not to blow away any attributes already there
            var name_spaces = temp.ClassNameSpace ? { 'xmlns:i':'http://www.w3.org/2001/XMLSchema-instance', 'xmlns':temp.ClassNameSpace } : { 'xmlns:xsd':'http://www.w3.org/2001/XMLSchema', 'xmlns:xsi':'http://www.w3.org/2001/XMLSchema-instance' };
            xml_obj[class_name]['$'] = Object.assign(name_spaces, xml_obj[class_name]['$']);
        }
        return xml_obj;
    }
} // END CLASS: XmlTemplateFactory
module.exports.XmlTemplateFactory = XmlTemplateFactory;


function xml2js_FindNS(node, ns)
{
    if (node && node.$)
    {
        var attrs = Object.getOwnPropertyNames(node.$);
        for (let i=0; i<attrs.length; ++i)
        {
            // xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" -> {'xmlns:xsi':"http://www.w3.org/2001/XMLSchema-instance"}
            // Should we just do root_node.$[a].includes('XMLSchema-instance') or stay specific ?
            //if (attrs[i].startsWith('xmlns:') && node.$[attrs[i]].includes(ns))
            if (attrs[i].startsWith('xmlns:') && node.$[attrs[i]]==ns)
            {
                return attrs[i].substr(6); // remove 'xmlns:'
            }
        }
    }
    return null;
}
function xml2js_AddAttr(node, n, v)
{
    if (node)
    {
        if (node.$) node.$[n] = v;
        else node.$ = { [n]:v };
    }
}
function xml2js_AddAttrBack(node, n, v)
{
    if (node) node.$ = Object.assign({ [n]:v }, node.$);
}
