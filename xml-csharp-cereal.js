'use strict';
/**
 * Node.js XML serializer with an eye toward limited C# XmlSerializer compatibility
 * @module xml-csharp-cereal
 * @license (Unlicense OR Apache-2.0) DISCLAIMER: Authors and contributors assume no liability or warranty. Use at your own risk.
 */

// self executing anon func can wrap code for CommonJS or classic script, but not for ES6 module as export must be top level
//? if (typeof CLASSIC !== 'undefined')
//?= '(function() {'

const MyExports = {}; // lets collect all the exports in one object to make it easier to handle different module systems (see bottom for actual export)

// We need a DOMImplementation in order to create a xml doc via xmldom method (unless we force user to pass one to us?)
//const xmldom = TryRequire('xmldom');
var myDOMImplementation = null;
function getDOMImplementation()
{
    if (myDOMImplementation) return myDOMImplementation; // if we already made one, use it
    // see if xmldom is available, first via 'document.implementation', then by requiring xmldom package
    if (typeof(document) !== 'undefined' && typeof(document.implementation) !== 'undefined') myDOMImplementation = document.implementation;
    else
    {
        var xmldom = TryRequire('xmldom');
        if (xmldom==null) return null;
        myDOMImplementation = new xmldom.DOMImplementation();
    }
    return myDOMImplementation;
}
function TryRequire(name)
{
    // check err.code === 'MODULE_NOT_FOUND' ? or require.resolve() ?
    try { return require(name); }
    catch (e) { return null; }
}


/**
 * Extend standard Error object with additional information from XML serialization process
 */
class XmlSerializerError extends Error
{
    /**
     * Creates an instance of XmlSerializerError
     * @param {Error|string} msg Error object or error message string
     * @param {?Object} [opts=null] Options object that was used at time of the error
     * @param {?Object} [_state=null] Internal state object at time of the error
     */
    constructor(msg, opts = null, _state = null)
    {
        if (_state==null) _state={};
        // In order to get object path into stack output, we need to add it to the message.
        // Error.stack is a getter, so we can change the message even though the stack has been established.
        // (One could override the getter, if one wanted to go that far https://stackoverflow.com/a/35392881 )
        var path_str = '{' + XmlSerializerError.pathArrToStr(_state.ObjPath) + '} ';
        _state.LastError = msg; // our state is in error now
        if (msg instanceof Error)
        {
            msg.message = path_str + msg.message;
            super(msg.message); // use no args or just give it message?
            //this.stack = msg.stack;
            Object.assign(this, msg); // assign all props from original error
        }
        else
        {
            super(path_str + msg);  // technically super would create an initial stack at this exact line?
            if (typeof(Error.captureStackTrace)=='function') { Error.captureStackTrace(this, this.constructor); } // this generates a new stack omitting this.constructor
        }
        this.name = this.constructor.name;
        this.options = opts;
        this.state = _state;
    }
    toString()
    {
        //if (this.objectPath) return this.name + ' @ ' + this.objectPath + ': ' + this.message;
        return this.name + ': ' + this.message;
    }
    static pathArrToStr(arr)
    {
        if (arr==null) return '?';
        // TODO - should manually build this string and put numbers in square brackets?
        // TODO - instead of array of strings, would array of XmlTemplateItems be better? for XmlPassthrough just have string or null prop name?
        return arr.join('/');
    }
}



// region "Some parsers for primitive node values" -----

/**
 * This callback takes value from XML and decodes it into appropriate value for object.
 * @callback DecoderCallback
 * @param {any} val the XML node string to decode
 * @return {any} the decoded JS property value
 */

MyExports.decodeInt = function decodeInt(val)
{
    var n = parseInt(val);
    if (Number.isFinite(n)) return n;
    throw new Error('Value cannot be parsed to int (' + val + ')');
}
MyExports.decodeFloat = function decodeFloat(val)
{
    var n = parseFloat(val);
    if (Number.isFinite(n)) return n;
    throw new Error('Value cannot be parsed to float (' + val + ')');
}
MyExports.decodeDouble = function decodeDouble(val)
{
    // parseFloat is effectively  parseDouble
    var n = parseFloat(val);
    if (Number.isFinite(n)) return n;
    throw new Error('Value cannot be parsed to float (' + val + ')');
}
MyExports.decodeBool = function decodeBool(val)
{
    // if object, try ValueOf or toString? is that presuming too much?
    if (MyExports.IsString(val))
    {
        if (val.toUpperCase()=='TRUE') return true;
        if (val.toUpperCase()=='FALSE') return false;
        try
        {
            var num = MyExports.decodeInt(val); // if '1' or '0' perhaps?
            return (num != 0);  // any non-zero value is true?
        }
        catch (e) { throw new Error('decodeBool cannot parse "' + val + '"'); }
    }
    else
    {
        return (val ? true : false); // rely on falsy/truthy ?
    }
}
MyExports.decodeString = function decodeString(val)
{
    // process undefined the same as null or treat it as an error?
    if (val==null) return null; // should we return null or "" ? null seems more in tune with C# behavior?
    return val.toString(); // just in case it isn't already a string?
}
MyExports.decodeDateTime = function decodeDateTime(val)
{
    // ISO 8601 i.e. '2018-05-30T17:30:00'
    // process undefined the same as null or treat it as an error?
    if (val==null) return null; // could be nullable
    return new Date(val);
}
//Might want to defer due to the many possible approaches and external libraries? Maybe provide a basic 'as seconds' default?
MyExports.decodeTimeSpan = function decodeTimeSpan(val)
{
    // ISO 8601 i.e. 'P1DT10H17M36.789S'
    // There's moment.js, TimeSpan.js, etc libraries to choose from for fuller feature sets?
    // process undefined the same as null or treat it as an error?
    if (val==null) return null; // could be nullable
    // adapted from http://momentjs.com [MIT] (citing http://docs.closure-library.googlecode.com/git/closure_goog_date_date.js.source.html)
    // see isoRegex in 'moment/src/lib/duration/create.js'
    var isoRegex = /^(-|\+)?P(?:([-+]?[0-9,.]*)Y)?(?:([-+]?[0-9,.]*)M)?(?:([-+]?[0-9,.]*)W)?(?:([-+]?[0-9,.]*)D)?(?:T(?:([-+]?[0-9,.]*)H)?(?:([-+]?[0-9,.]*)M)?(?:([-+]?[0-9,.]*)S)?)?$/;
    var match = isoRegex.exec(val);
    if (match)
    {
        // Based on some info from https://stackoverflow.com/a/34532410 and https://stackoverflow.com/a/12466271
        var secs = TS_ValOrZero(match[2])*31556926 // years
            +TS_ValOrZero(match[3])*2629743.83 // months
            +TS_ValOrZero(match[4])*604800 // weeks
            +TS_ValOrZero(match[5])*86400 // days
            +TS_ValOrZero(match[6])*3600 // hours
            +TS_ValOrZero(match[7])*60 // mintues
            +TS_ValOrZero(match[8]); // seconds
        return (match[1] === '-' ? -secs : secs);
    }
    throw new Error('Cannot parse ISO time span "' + val + '"');
}
function TS_ValOrZero(val)
{
    // adapted from http://momentjs.com [MIT] function parseIso() to use in decodeTimeSpan()
    // we don't need to deal with sign here, cause we apply that after we get total seconds
    // val is regex result which is either a string or undefined
    if (val==undefined) return 0;
    val = parseFloat(val.replace(',', '.')); // I assume the replace is for locales that use comma for decimals?
    return (Number.isFinite(val) ? val : 0);
}

/**
 * This callback takes value from object and encodes it into appropriate value for XML.
 * @callback EncoderCallback
 * @param {any} val the JS property value to encode
 * @return {any} the encoded XML node string
 */

MyExports.encodeString = function encodeString(val)
{
    return val.toString(); // just in case it isn't already a string?
}
MyExports.encodeBool = function encodeBool(val)
{
    return (val ? 'true' : 'false'); // c sharp xml prints the lowercase string
}
MyExports.encodePassthrough = function encodePassthrough(val)
{
    // numbers should passthrough fine, unless XML library needs them an explicit type?
    if (val instanceof Number) return val.valueOf(); // unwrap if in Number object ?
    return val; // no special processing required before passing to XML library
}
MyExports.encodeDateTime = function encodeDateTime(val)
{
    // '2018-05-30T17:30:00'
    // process undefined the same as null, or should we catch and return err_val?
    if (val==null) return null; // could be nullable
    if (val instanceof Date) return val.toISOString();
    if (MyExports.IsString(val)) return val; // assume if string, it's just passing through
    throw new Error('encodeDateTime requires instance of Date or a string');
}
MyExports.encodeTimeSpan = function encodeTimeSpan(val)
{
    if (val==null) return null;
    val = parseFloat(val); // in case it is not a number already (or could use Number() or '+' operator?)
    if (!Number.isFinite(val)) throw new Error('encodeTimeSpan requires a number of seconds');
    // Is this cheap? Yes. Yes it is.
    return "PT" + val + "S"; // val assumed to be seconds
}

// endregion "Some parsers for primitive node values" -----



// region "Helper Functions" -----

MyExports.IsString = function IsString(val) { return (typeof(val)=='string' || val instanceof String); }
// Technically prototype and constructor should always be there?
MyExports.IsClassFunction = function IsClassFunction(val) { return (typeof(val) == 'function' && val.prototype); }
MyExports.IsClassInstance = function IsClassInstance(val) { return (typeof(val) == 'object' && val.constructor); }
/*MyExports.GuessClassName = function(v)
{
    // Take a guess at what is most appropriate class name for this JS variable
    var class_name;
    if (typeof(v) == 'number' || v instanceof Number) class_name = 'double';
    else if (MyExports.IsString(v)) class_name = 'string';
    else if (MyExports.IsClassFunction(v)) class_name = v.name;
    else if (MyExports.IsClassInstance(v)) class_name = v.constructor.name;
    else return null;
    return class_name;
}*/
function CheckConvertClassName(class_name)
{
    // If passed the actual class function
    if (MyExports.IsClassFunction(class_name)) class_name = class_name.name;
    // if passed an instance of the class
    else if (MyExports.IsClassInstance(class_name)) class_name = class_name.constructor.name;
    // if passed one of our objects that holds a class name
    else if (class_name instanceof XmlTemplateItem) class_name = class_name.ClassName;
    else if (class_name instanceof XmlTemplate) class_name = class_name.getName(true);
    return class_name;
}
function getShortClass(class_name)
{
    if (class_name==null) return null;
    var fields = class_name.split('.'); // remove any extra namespace qualifiers
    return fields[fields.length-1];
}
MyExports.genArrLevels = function genArrLevels(levels, class_name, xml_mode)
{
    if (levels==null) return null; // no levels
    if (Array.isArray(levels)) return levels; // already an array of levels
    if (!Number.isFinite(levels)) throw new Error('Array levels must be array of names of number of dimensions');
    if (levels < 1) return null; // zero-dimensions is effectively no array
    class_name = getShortClass(class_name); // drop any qualifier for use as tag name
    var ArrLevels = [];
    var str = (xml_mode==MyExports.xmlModes.DataContractSerializer ? class_name : class_name.charAt(0).toUpperCase() + class_name.slice(1));
    // levels are named from inner dimension to outer dimensions
    ArrLevels[0] = class_name;
    for (let i=1; i < levels; ++i)
    {
        str = ('ArrayOf' + str);
        ArrLevels[i] = str;
    }
    return ArrLevels;
}

/*
DataContract suffix hashes essentially derived from md5 of a special composite name spaces string?
https://github.com/mono/mono/blob/master/mcs/class/referencesource/System.Runtime.Serialization/System/Runtime/Serialization/DataContractSerializer.cs
https://github.com/mono/mono/blob/master/mcs/class/referencesource/System.Runtime.Serialization/System/Runtime/Serialization/DataContract.cs
https://github.com/mono/mono/blob/0bcbe39b148bb498742fc68416f8293ccd350fb6/mcs/class/referencesource/System.ServiceModel.Internals/System/Runtime/HashHelper.cs
        var data = "asdf";
        var crypto = require('crypto');
        crypto.createHash('md5').update(data).digest("base64");

// TODO - is this a useful helper or just a big mess?
MyExports.genDictClassNameDc = function genDictClassNameDc(pair_class)
{
    // KeyValueOf may contain namespace hash suffix, so better ask
    return 'ArrayOf' + pair_class;
}
MyExports.genDictClassName = function genDictClassName(key_class, value_class, xml_mode)
{
    key_class = CheckConvertClassName(key_class);
    value_class = CheckConvertClassName(value_class);
    if (xml_mode==MyExports.xmlModes.DataContractSerializer)
    {
        // TODO - actually you need the pair name since that may have a hash suffix
        return 'ArrayOfKeyValueOf' + key_class + value_class;
    }
    else
    {
        var alias = MyExports.CsharpTypeAliases[key_class];
        if (alias!=undefined) key_class = alias;
        var alias = MyExports.CsharpTypeAliases[value_class];
        if (alias!=undefined) value_class = alias;
        return 'DictionaryOf' + key_class.charAt(0).toUpperCase() + key_class.slice(1)
        + value_class.charAt(0).toUpperCase() + value_class.slice(1);
    }
} */

// endregion "Helper Functions" -----


// region "Constants and LUTs" -----

// typical XmlNameSpaces for DataContract
MyExports.xmlNS_Array = 'http://schemas.microsoft.com/2003/10/Serialization/Arrays';
MyExports.xmlNS_System = 'http://schemas.datacontract.org/2004/07/System';
MyExports.xmlNS_None = '';

MyExports.xmlModes = { XmlSerializer:0, DataContractSerializer:1 };

MyExports.CsharpTypeAliases =
{
    // there is no Int8/UInt8, it just stays sbyte/byte or SByte/Byte
    'sbyte': 'SByte',
    'byte': 'Byte',
    'int': 'Int32',
    'uint': 'UInt32',
    'short': 'Int16',
    'ushort': 'UInt16',
    'long': 'Int64',
    'ulong': 'UInt64',
}

// endregion "Constants and LUTs" -----


// region "Generic object as Dictionary" -----
// In theory, one could create a dictionary as an array of a key-value classes and use serializer normally, BUT what about a generic JS object used as a dictionary?
/*
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
        this.Dictionary = []; // array of KeyValuePair
    }
    static getXmlTemplate()
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
        this._Items_ = [];    // this property should not show in XML
    }
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
}
/**
 * Internal factory for producing dictionary stubs for abstracting generic object.
 * @private
 * @class DictionaryFactory
 */
class DictionaryFactory  // For now maybe we don't expose internal plumbing of generic object dictionary
{
    constructor(pair_name, key_prop, value_prop, namespace)
    {
        if (!MyExports.IsString(pair_name)) throw new Error('DictionaryFactory pair_name must be string');
        if (!(key_prop instanceof XmlTemplateItem)) throw new Error('DictionaryFactory key_class must be XmlTemplateItem');
        if (!(value_prop instanceof XmlTemplateItem)) throw new Error('DictionaryFactory value_class must be XmlTemplateItem');
        // TODO - ACTUALLY for a generic {} dictionary, the key must be a string or representable as a string? At least for now.
        // Actually any simple type that can be used as a js object prop name should work?
        //if (key_prop.ClassName!='string') throw new Error('DictionaryFactory: At this time key_class must be "string"');
        this.PairName = pair_name;
        this.KeyProp = key_prop;
        this.ValueProp = value_prop;
        this.XmlNameSpace = namespace;
    }
    createDictTemplate(class_name)
    {
        var t = new XmlTemplate(ArrayStub);
        var item = t.add('_Items_', this.PairName, 1, this.XmlNameSpace);
        item.DictionaryData = this;
        t.XmlPassthrough = '_Items_'; // in xml processing, this class is transparent, the value of Items replaces the class itself in XML
        return t;
    }
    createPairTemplate(key, value)
    {
        // create a temporary template for this particular KeyValuePair
        var args = [this.KeyProp.Name, key, this.ValueProp.Name, value];
        var t = new XmlTemplate(KeyValuePairStub, args);
        t.add(this.KeyProp);    // TODO - do these need to be clones? is it safe to just pass the original props?
        t.add(this.ValueProp);
        return t;
    }
    createPairStub(key, value)
    {
        return new KeyValuePairStub(this.KeyProp.Name, key, this.ValueProp.Name, value);
    }
} // END CLASS: DictionaryFactory
// endregion "Generic object as Dictionary" -----


/**
 * Internal factory for handling potentially multidimensional arrays
 * @private
 * @class ArrayFactory
 */
class ArrayFactory
{
    constructor(levels, namespace) // levels is either a number of dimensions or an array of string names
    {
        // allow user to defer on level names, but level names must be known during use!
        if (!Array.isArray(levels) && !Number.isFinite(levels)) throw new Error('Array levels must be string[] or number');
        this.Levels = levels;
        this.XmlNameSpace = namespace;
    }
    clone(new_levels, new_namespace)
    {
        if (new_levels==undefined) new_levels = this.Levels;
        if (new_namespace==undefined) new_namespace = this.XmlNameSpace;
        return new ArrayFactory(new_levels, new_namespace);
    }
    getTopTag() { return this.Levels[this.Levels.length-1]; }
    isOneDim() { return (this.Levels==null || this.Levels.length==1); }
    nextTemp(cur_prop) // call in decode/encode to handle extra layer
    {
        var nx = new ArrayFactory(this.Levels.slice(0, -1), this.XmlNameSpace); // get next level
        var t = new XmlTemplate(ArrayStub);
        t.add( cur_prop.clone('_Items_', cur_prop.ClassName, nx) );
        t.XmlPassthrough = '_Items_'; // in xml processing, this class is transparent, the value of Items replaces the class itself in XML
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
     * @param {?string[]|number} [arr_levels=null] XML tag names for array levels or number of dimensions (if not defined, assumes not an array)
     * @param {?string} [arr_namespace=undefined] XML namespace for array, if any
     * @param {?boolean} [isNullable=null] If simple type should be flagged as nullable
     * @param {?boolean} [hasExplicitTypeTag=null] If true this prop uses an explicit type tag (somewhat like an array without being one)
     */
    constructor(prop_name, class_name, arr_levels, arr_namespace, isNullable, hasExplicitTypeTag)
    {
        if (!MyExports.IsString(prop_name)) throw new Error('XmlTemplateItem.constructor prop_name must be string');
        if (!MyExports.IsString(class_name)) throw new Error('XmlTemplateItem.constructor class_name must be string');
        //if (class_name=='') throw new Error("XmlTemplateItem.constructor class_name cannot be empty string");
        this.Name = prop_name;
        this.ClassName = class_name;
        // instance of ArrayFactory
        if (!arr_levels) this.ArrayData = null;
        else if (arr_levels instanceof ArrayFactory) this.ArrayData = arr_levels;
        else this.ArrayData = new ArrayFactory(arr_levels, arr_namespace);
        this.NullableData = (isNullable ? {} : null);
        this.AttrData = null; // Add a member for tracking XML element vs attribute
        this.ExplicitTypeTag = (hasExplicitTypeTag ? {} : null);
        // temp runtime props
        //this.DictionaryData = null; // can hold a DictionaryFactory in a KeyValuePair during XML processing
    }
    _checkArray(opts)
    {
        // if Array Levels already set, nothing to do
        if (Array.isArray(this.ArrayData.Levels)) return this;
        // else we need to generate a copy with auto generated array names
        var n = this.clone();
        n.ArrayData.Levels = MyExports.genArrLevels(this.ArrayData.Levels, this.ClassName, opts.XmlMode);
        return n;
    }
    clone(prop_name, class_name, arr_levels)
    {
        if (prop_name==undefined) prop_name = this.Name;
        if (class_name==undefined) class_name = this.ClassName;
        // arr_namespace is part of ArrayData
        if (arr_levels==undefined) arr_levels = this.ArrayData.clone(); // no override, create deep copy
        else if (Array.isArray(arr_levels)) arr_levels = this.ArrayData.clone(arr_levels); // create copy with new levels
        var n = new XmlTemplateItem(prop_name, class_name, arr_levels);
        n.NullableData = this.NullableData;
        n.AttrData = this.AttrData;
        n.DictionaryData = this.DictionaryData; // some temporary props carry dict data
        n.ExplicitTypeTag = this.ExplicitTypeTag;
        return n;
    }
    /**
     * Mark XmlTemplateItem as nullable
     * @returns {XmlTemplateItem} This XmlTemplateItem instance
     */
    nullable()
    {
        if (this.AttrData) throw new Error("Nullable types not supported as XML attributes")
        this.NullableData = {}; // could contain other options if needed?
        return this;
    }
    /**
     * Mark XmlTemplateItem as an XML attribute
     * @returns {XmlTemplateItem} This XmlTemplateItem instance
     */
    attr()
    {
        if (this.ArrayData) throw new Error("Arrays not supported as XML attributes");
        if (this.NullableData) throw new Error("Nullable types not supported as XML attributes")
        if (this.ExplicitTypeTag) throw new Error("Explicit type tag not supported as XML attributes")
        // mark prop as an attribute? does it need to be a primitive or just call toString/ValueOf? Rely on given type decode/encode functions?
        this.AttrData = {};
        return this;
    }
    /**
     * Mark XmlTemplateItem as having an explicit type tag
     * @returns {XmlTemplateItem} This XmlTemplateItem instance
     */
    explicitTypeTag()
    {
        if (this.AttrData) throw new Error("Explicit type tag not supported as XML attributes")
        this.ExplicitTypeTag = {};
    }
} // END CLASS: XmlTemplateItem
MyExports.XmlTemplateItem = XmlTemplateItem;


/** The XmlTemplate class stores info of how a class's properties are to be serialized. */
class XmlTemplate
{
    /**
     * Creates an instance of XmlTemplate.
     * @param {Function} class_constructor Class function (essentially the constructor)
     * @param {?any[]} [constructor_args=null] Arguments to feed constructor when creating a new instance
     * @param {?string} [class_name] An alternative class name to use in place of the constructor's name
     */
    constructor(class_constructor, constructor_args, class_name)
    {
        this.extend(class_constructor, constructor_args, class_name);
        this.Props = []; // array of XmlTemplateItem
        this.XmlNameSpace = null;
        // temp runtime props
        //this.XmlPassthrough = null; // name of prop that is used as abstract passthrough for XML processing
    }
    /**
     * Gets the name of the class being mapped by this XML template.
     * @param {?boolean} [full=null] If true, include any class name qualifiers
     * @return {string} Name of the class that this template maps
     */
    getName(full) { return (full ? this.ClassName : getShortClass(this.ClassName)); }
    /**
     * Checks if this template is using a class name alias
     * @returns {boolean} True if this template uses a class name alias
     */
    hasAlias() { return (this.ClassConstructor.name!=this.ClassName); }
    /**
     * Converts the current template into a template for the given derived class
     * @param {Function} class_constructor Class function (essentially the constructor)
     * @param {?any[]} [constructor_args=null] Arguments to feed constructor when creating a new instance
     * @param {?string} [class_name] An alternative class name to use in place of the constructor's name
     * @return {XmlTemplate} The current modified template (not a copy)
     */
    extend(class_constructor, constructor_args, class_name)
    {
        if (!MyExports.IsClassFunction(class_constructor)) throw new Error('XmlTemplate.constructor requires class_constructor to be class function');
        if (constructor_args!=null && !Array.isArray(constructor_args)) throw new Error('XmlTemplate.constructor requires constructor_args to be null or an array');
        // mark any existing Props as inherited? might be useful later?
        if (this.ClassName && Array.isArray(this.Props))
        {
            this.Props.forEach(function(item)
            {
                if (Array.isArray(item.BaseClass)) item.BaseClass.push(this.ClassName); // just keep track of last, or track the whole stack up?
                else item.BaseClass = [this.ClassName];
            },this);
        }
        this.ClassConstructor = class_constructor;
        this.ConstructorArgs = constructor_args || null;
        this.ClassName = (class_name ? class_name : this.ClassConstructor.name);
        return this; // should we just return this for possible chaining ?
    }
    /**
     * Makes a shallow copy of this template. You can specify a different class or constructor args if you want.
     * @param {Function} [class_constructor] Class function (essentially the constructor)
     * @param {?any[]} [constructor_args] Arguments to feed constructor when creating a new instance
     * @param {?string} [class_name] An alternative class name to use in place of the constructor's name
     * @return {XmlTemplate} The shallow clone of this
     */
    clone(class_constructor, constructor_args, class_name)
    {
        if (class_constructor==undefined) class_constructor = this.ClassConstructor;
        if (constructor_args==undefined) constructor_args = this.ConstructorArgs; // shallow copy? since it's arbitary, deep copy might be a bit much?
        if (class_name==undefined) class_name = this.ClassName;
        var n = new XmlTemplate(class_constructor, constructor_args, class_name);
        n.Props = this.Props.slice(); // shallow copy good enough?
        //this.Props.forEach(function(item){ n.Props.push(item.clone()) }); // deep copy safer?
        n.XmlNameSpace = this.XmlNameSpace;
        return n;
    }
    /**
     * Returns a new instance of the class associated with this template.
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
     * @param {string|XmlTemplateItem} prop_name Property Name or instance of Property XML template. If passing full item template, other parameters are ignored.
     * @param {string|Function|Object} class_name Class Name or Class instance or Class function of the property.
     * @param {?number|string[]} [arr_levels=0] Number of dimensions or array of tag names (if not defined, assumes no array)
     * @param {?string} [arr_namespace=undefined] XML namespace for array, if any
     * @param {?boolean} [isNullable=null] If simple type should be flagged as nullable
     * @param {?boolean} [hasExplicitTypeTag=null] If true this prop uses an explicit type tag (somewhat like an array without being one)
     * @returns {XmlTemplateItem} Instance of the new XML template item that was added for this property
     */
    add(prop_name, class_name, arr_levels, arr_namespace, isNullable, hasExplicitTypeTag)
    {
        var obj = prop_name; // allow feeding just a XmlTemplateItem instance
        if (!(obj instanceof XmlTemplateItem))
        {
            class_name = CheckConvertClassName(class_name);
            obj = new XmlTemplateItem(prop_name, class_name, arr_levels, arr_namespace, isNullable, hasExplicitTypeTag);
        }
        this.Props.push(obj);
        return obj; // return XmlTemplateItem in case it is useful at some point?
    }
    // common type add helpers
    addBool(prop_name, ...args) {return this.add(prop_name,'bool',...args)}
    addString(prop_name, ...args) {return this.add(prop_name,'string',...args)}
    addSByte(prop_name, ...args) {return this.add(prop_name,'sbyte',...args)}
    addByte(prop_name, ...args) {return this.add(prop_name,'byte',...args)}
    addInt(prop_name, ...args) {return this.add(prop_name,'int',...args)}
    addUInt(prop_name, ...args) {return this.add(prop_name,'uint',...args)}
    addShort(prop_name, ...args) {return this.add(prop_name,'short',...args)}
    addUShort(prop_name, ...args) {return this.add(prop_name,'ushort',...args)}
    addLong(prop_name, ...args) {return this.add(prop_name,'long',...args)}
    addULong(prop_name, ...args) {return this.add(prop_name,'ulong',...args)}
    addFloat(prop_name, ...args) {return this.add(prop_name,'float',...args)}
    addDouble(prop_name, ...args) {return this.add(prop_name,'double',...args)}
    addDateTime(prop_name, ...args) {return this.add(prop_name,'DateTime',...args)}
    addTimeSpan(prop_name, ...args) {return this.add(prop_name,'TimeSpan',...args)}
    addInt16(prop_name, ...args) {return this.add(prop_name,'Int16',...args)}
    addUInt16(prop_name, ...args) {return this.add(prop_name,'UInt16',...args)}
    addInt32(prop_name, ...args) {return this.add(prop_name,'Int32',...args)}
    addUInt32(prop_name, ...args) {return this.add(prop_name,'UInt32',...args)}
    addInt64(prop_name, ...args) {return this.add(prop_name,'Int64',...args)}
    addUInt64(prop_name, ...args) {return this.add(prop_name,'UInt64',...args)}
    /*addAuto(prop) // if props have an initial value, could we automatically determine class names? Could be problematic?
    {
        var class_name = GuessClassName(prop);
        var prop_name = ; // need to either determine original name or pass separately?
        this.add(prop_name, class_name);
    }*/
    /**
     * Sorts the properties list by property names
     * @param {?boolean} [skip_inherited=null] If true, any inherited props are ignored and put at top of the list in the order they are encounted.
     * @returns {XmlTemplate} This instance
     */
    sortByName(skip_inherited)
    {
        if (skip_inherited)
        {
            var inherited = [];
            var other = [];
            this.Props.forEach(function(item){ if (item.BaseClass) inherited.push(item); else other.push(item); });
            other.sort(function(a,b) { return (a.Name<b.Name ? -1 : (a.Name>b.Name ? 1 : 0)); });
            this.Props = inherited.concat(other);
        }
        else this.Props.sort(function(a,b) { return (a.Name<b.Name ? -1 : (a.Name>b.Name ? 1 : 0)); });
        return this;
    }
    /**
     * Sets the XML namespace for this class template
     * @param {string} xml_namespace The full XML namespace to use for this class
     * @returns {XmlTemplate} This instance
     */
    setXmlNameSpace(xml_namespace) { this.XmlNameSpace = xml_namespace; return this; }
    // parsing/generating methods for various kinds of XML library objects
    /**
     * Deserializes the class described by this template from the given XML node
     * @private
     * @param {Object} xml_obj Current XML node
     * @param {Object} opts Options to be used during the deserialization process
     * @param {Object} _state Internal state information
     * @return {Object} Instance of the class described by this template resulting from the XML
     */
    _from_xmlobj(xml_obj, opts, _state)
    {
        if (xml_obj==null) return null;
        var new_obj = this.newObj();
        this.Props.forEach(function(prop)
        {
            try
            {
                _state.pushPath(this, prop);
                var xml_node;
                if (this.XmlPassthrough || prop.AttrData) xml_node = xml_obj;
                else xml_node = xml_obj.getFirstNode(_state.prefix(prop.Name));
                if (xml_node!=undefined) // XML has this class property
                {
                    var prevNS = _state.saveNsState();
                    var new_item = undefined; // null is a valid answer, so use undefined until it is defined
                    if (xml_node.getAttr(_state.XmlInstance+':nil')=='true') // regardless of being nullable, if tagged nil make it null
                    {
                        new_obj[prop.Name] = null;
                        return;
                    }
                    var ns = _state.Factory._findNS(prop);
                    if (ns != null)
                    {
                        if (ns=='' || ns == _state.RootNameSpace) _state.setPrefix(ns, null, opts);
                        else
                        {
                            let pns = xml_node.findNS(ns);
                            _state.setPrefix(ns, pns, opts);
                        }
                    }
                    if (prop.ArrayData)   // we expect an array of a single type
                    {
                        prop = prop._checkArray(opts);
                        var node_arr = xml_node.getNodes(_state.prefix(prop.ArrayData.getTopTag()));
                        if (node_arr==undefined)
                        {
                            if (this.XmlPassthrough==prop.Name) new_obj[prop.Name] = null;
                            else new_obj[prop.Name] = []; // tag was there but empty, so empty array?
                            return;
                        }
                        new_item = [];
                        node_arr.forEach(function(item,index)
                        {
                            _state.ObjPath.push(index);
                            var temp = _state.Factory._decodeType(item, prop, opts, _state);
                            if (temp!==undefined) new_item.push(temp); // null is a valid answer
                            _state.ObjPath.pop();
                        }, this);
                        new_obj[prop.Name] = new_item;
                    }
                    else // we expect a single value
                    {
                        if (prop.ExplicitTypeTag) xml_node = xml_node.getFirstNode(prop.ClassName); // unwrap extra type tag
                        new_item = _state.Factory._decodeType(xml_node, prop, opts, _state);
                        if (new_item!==undefined) new_obj[prop.Name] = new_item; // null is a valid answer
                    }
                    _state.loadNsState(prevNS);
                }
                //else new_obj[prop.Name] = null; // XML does not have this prop, so it must be null? Actually value should be unchanged.
            }
            catch (e)
            {
                if (e instanceof XmlSerializerError) throw e;
                else throw new XmlSerializerError(e, opts, _state);
            }
            finally { _state.popAll(); } // in case of a normal return from try block (after catch state is useless)
        }, this);
        return new_obj;
    }
    /**
     *
     * Serializes this class to a XML node
     * @private
     * @param {Object} class_inst Instance of the class described by this template from which to produce XML
     * @param {Object} xml_obj Current XML node
     * @param {Object} opts Options to be used during the deserialization process
     * @param {Object} _state Internal state information
     * @return {Object} XML object describing the resulting XML node (TODO - this return isn't really used?)
     */
    _to_xmlobj(class_inst, xml_obj, opts, _state)
    {
        if (class_inst==null) throw new Error('XmlTemplate._to_xmlobj given null object');
        this.Props.forEach(function(prop)
        {
            try
            {
                var new_item = (this.XmlPassthrough ? xml_obj : xml_obj.makeNode(_state.prefix(prop.Name)));
                _state.pushPath(this, prop);
                var prevNS = _state.saveNsState();
                var ns = _state.applyNS(_state.Factory._findNS(prop), opts);
                var ns_prefix = _state.checkForNsChange(prevNS, ns);
                if (ns_prefix) new_item.addAttr('xmlns:'+ns_prefix, ns);
                var cur_data = class_inst[prop.Name];
                if (cur_data==null)
                {
                    if ((prop.NullableData && prop.ArrayData==null) || opts.UseNil )
                    {
                        new_item.addAttr(_state.XmlInstance+':nil', 'true');
                        if (xml_obj!==new_item) xml_obj.addNode(new_item);
                    }
                }
                else if (prop.ArrayData)
                {
                    prop = prop._checkArray(opts);
                    var level = _state.prefix(prop.ArrayData.getTopTag());
                    if (!Array.isArray(cur_data)) cur_data = [cur_data];
                    cur_data.forEach(function(item,index)
                    {
                        _state.ObjPath.push(index);
                        var arr_item = new_item.makeNode(level);
                        arr_item = _state.Factory._encodeType(item, prop, arr_item, opts, _state);
                        if (arr_item===undefined) throw new Error('XmlTemplate._to_xmlobj could not generate "' + prop.ClassName +'"');
                        new_item.addNode(arr_item);
                        _state.ObjPath.pop();
                    },this);
                    if (xml_obj!==new_item) xml_obj.addNode(new_item);
                }
                else if (prop.ExplicitTypeTag) // it's like being in an unlisted array of one
                {
                    var arr_item = new_item.makeNode(prop.ClassName);
                    arr_item = _state.Factory._encodeType(cur_data, prop, arr_item, opts, _state);
                    if (arr_item===undefined) throw new Error('XmlTemplate._to_xmlobj could not generate "' + prop.ClassName +'"');
                    new_item.addNode(arr_item);
                    if (xml_obj!==new_item) xml_obj.addNode(new_item);
                }
                else    // single node is pretty straight forward for xml2js
                {
                    new_item = _state.Factory._encodeType(cur_data, prop, new_item, opts, _state);
                    if (new_item===undefined) throw new Error('XmlTemplate._to_xmlobj could not generate "' + prop.ClassName+'"');
                    if (prop.AttrData) xml_obj.addAttr(prop.Name, new_item.getValue());
                    else if (xml_obj!==new_item) xml_obj.addNode(new_item);
                }
                _state.loadNsState(prevNS);
            }
            catch (e)
            {
                if (e instanceof XmlSerializerError) throw e;
                else throw new XmlSerializerError(e, opts, _state);
            }
            finally { _state.popAll(); } // in case of a normal return from try block (after catch state is useless)
        }, this);
        return xml_obj;
    }
} // END CLASS: XmlTemplate
MyExports.XmlTemplate = XmlTemplate;


/** The XmlTemplateFactory class stores a collection of XmlTemplate instances for serializing them into/out-of XML. */
class XmlTemplateFactory
{
    /**
     * Creates an instance of XmlTemplateFactory.
     * @param {...Function|XmlTemplate} [templates] Variable number of class functions (with static getXmlTemplate), or XmlTemplate's, or arrays of either.
     */
    constructor(...templates)
    {
        this.XmlTemplates = {}; // use object instead of array so we can use class names as unique keys
        this.Enums = {}; // Enumerations
        this.ImplicitDicts = {}; // Implicit object dictionaries
        this.ClassNameAlias = {}; // Class name aliases
        // allow passing list of classes to constructor? both as variable param list or as an array?
        templates.forEach(function(arg)
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
            'bool': MyExports.decodeBool,
            'string': MyExports.decodeString,
            'sbyte': MyExports.decodeInt,
            'byte': MyExports.decodeInt,
            'short': MyExports.decodeInt, 'Int16': MyExports.decodeInt,
            'ushort': MyExports.decodeInt, 'UInt16': MyExports.decodeInt,
            'int': MyExports.decodeInt, 'Int32': MyExports.decodeInt,
            'uint': MyExports.decodeInt, 'UInt32': MyExports.decodeInt,
            'long': MyExports.decodeString, 'Int64': MyExports.decodeString,
            'ulong': MyExports.decodeString, 'UInt64': MyExports.decodeString,
            'float': MyExports.decodeFloat,
            'double': MyExports.decodeDouble,
            'DateTime': MyExports.decodeDateTime,
            'TimeSpan': MyExports.decodeTimeSpan,
        };
        this.SimpleTypeEncoders =
        {
            'bool': MyExports.encodeBool,
            'string': MyExports.encodeString,
            'sbyte': MyExports.encodePassthrough,
            'byte': MyExports.encodePassthrough,
            'short': MyExports.encodePassthrough, 'Int16': MyExports.encodePassthrough,
            'ushort': MyExports.encodePassthrough, 'UInt16': MyExports.encodePassthrough,
            'int': MyExports.encodePassthrough, 'Int32': MyExports.encodePassthrough,
            'uint': MyExports.encodePassthrough, 'UInt32': MyExports.encodePassthrough,
            'long': MyExports.encodeString, 'Int64': MyExports.encodeString,
            'ulong': MyExports.encodeString, 'UInt64': MyExports.encodeString,
            'float': MyExports.encodePassthrough,
            'double': MyExports.encodePassthrough,
            'DateTime': MyExports.encodeDateTime,
            'TimeSpan': MyExports.encodeTimeSpan,
        };
        this.SimpleTypeNameSpaces = {}; // defaults are all buit-in and have no namespace
        /* this.SimpleTypeMeta =
        {
            'bool': { BuiltIn: true },
            'string': { BuiltIn: true },
            'sbyte': { BuiltIn: true },
            'byte': { BuiltIn: true },
            'short': { BuiltIn: true }, 'Int16': { BuiltIn: true },
            'ushort': { BuiltIn: true }, 'UInt16': { BuiltIn: true },
            'int': { BuiltIn: true }, 'Int32': { BuiltIn: true },
            'uint': { BuiltIn: true }, 'UInt32': { BuiltIn: true },
            'long': { BuiltIn: true }, 'Int64': { BuiltIn: true },
            'ulong': { BuiltIn: true }, 'UInt64': { BuiltIn: true },
            'float': { BuiltIn: true },
            'double': { BuiltIn: true },
            'DateTime': { BuiltIn: true },
            'TimeSpan': { BuiltIn: true },
        }; */
    }
    /**
     * Sets the simple type decoder or encoder for this factory
     * @param {string|string[]} type_names Simple type name(s) being set
     * @param {?DecoderCallback} [decode_func=null] Function to decode XML node string into JS property value
     * @param {?EncoderCallback} [encode_func=null] Function to encode JS property value into XML node string
     * @param {?string} [type_namespace=null] XML namespace to use for this simple type
     * @return {XmlTemplateFactory} This factory instance
     */
    setSimpleCodec(type_names, decode_func, encode_func, type_namespace)
    {
        if (decode_func!=null && typeof(decode_func)!='function') throw new Error('decode_func is not a function');
        if (encode_func!=null && typeof(encode_func)!='function') throw new Error('encode_func is not a function');
        if (!Array.isArray(type_names)) type_names = [type_names];
        type_names.forEach(function(item)
        {
            if (decode_func!=null) this.SimpleTypeDecoders[item] = decode_func;
            if (encode_func!=null) this.SimpleTypeEncoders[item] = encode_func;
            if (type_namespace!=null) this.SimpleTypeNameSpaces[item] = type_namespace;
        },this);
        return this;
    }
    /**
     * Add a class XML template to the factory.
     * @param {Function|XmlTemplate} xml_template Class function (with static getXmlTemplate) or XmlTemplate instance.
     * @return {XmlTemplateFactory} This factory instance
     */
    add(xml_template)
    {
        // if passing the actual class with default static function 'getXmlTemplate' defined, call it to get the XmlTemplate instance
        if (typeof(xml_template) == 'function' && typeof(xml_template.getXmlTemplate) == 'function') xml_template = xml_template.getXmlTemplate();
        // Make sure we have a XmlTemplate instance at this point
        if (!(xml_template instanceof XmlTemplate)) throw new Error('XmlTemplateFactory.add only takes instances of XmlTemplate OR class functions with static getXmlTemplate()');
        this.XmlTemplates[xml_template.getName(true)] = xml_template;
        if (xml_template.hasAlias()) this.ClassNameAlias[xml_template.ClassConstructor.name] = xml_template.getName(true);
        return this;
    }
    /**
     * Adds an enum type description
     * @param {string} enum_name Name of the enum
     * @param {Object} enum_obj Simple object representation of the enum, or object providing getEnumValue and getEnumName functions
     * @param {?string} [enum_namespace=null] Class namespace of the enum
     * @return {XmlTemplateFactory} This factory instance
     */
    addEnum(enum_name, enum_obj, enum_namespace)
    {
        this.Enums[enum_name] = { obj: enum_obj, ns: enum_namespace };
        return this;
    }
    /**
     * Adds an implicit dictionary description
     * @param {string} class_name Name of dictionary class
     * @param {string} pair_name Name of key-value pair
     * @param {XmlTemplateItem|any[]} key_prop Property info for the key (if given array, it is passed to XmlTemplateItem constructor)
     * @param {XmlTemplateItem|any[]} value_prop Property info for the value (if given array, it is passed to XmlTemplateItem constructor)
     * @param {?string} [dict_namespace=null] Class namespace of the dictionary
     * @param {?boolean} [hasExplicitTypeTags] If true, this dictionary uses type tags within key and value tags
     * @return {XmlTemplateFactory} This factory instance
     */
    addDict(class_name, pair_name, key_prop, value_prop, dict_namespace, hasExplicitTypeTags)
    {
        if (!MyExports.IsString(class_name)) throw new Error('XmlTemplateFactory.addDict class_name must be string');
        // XmlTemplateItem(prop_name, class_name, arr_levels, arr_namespace)
        if (Array.isArray(key_prop)) key_prop = new XmlTemplateItem(...key_prop);
        if (Array.isArray(value_prop)) value_prop = new XmlTemplateItem(...value_prop);
        if (hasExplicitTypeTags) // automatically set key and value props to use explicit type tags
        {
            key_prop.explicitTypeTag();
            value_prop.explicitTypeTag();
        }
        var t = new DictionaryFactory(pair_name, key_prop, value_prop, dict_namespace);
        this.ImplicitDicts[class_name] = t;
        return this;
    }
    /**
     * Adds an implicit dictionary description assuming 'KeyValuePair' with string 'Key'
     * @param {string} class_name Name of dictionary class
     * @param {string|XmlTemplateItem|any[]} value_prop Value class name or property info (if given array, it is passed to XmlTemplateItem constructor)
     * @param {?string} [dict_namespace=null] Class namespace of the dictionary
     * @param {?boolean} [hasExplicitTypeTags] If true, this dictionary uses type tags within key and value tags
     * @return {XmlTemplateFactory} This factory instance
     */
    addDictQuick(class_name, value_prop, dict_namespace, hasExplicitTypeTags)
    {
        if (Array.isArray(value_prop))
        {
            value_prop = new XmlTemplateItem(...value_prop);
        }
        if (value_prop instanceof XmlTemplateItem) // value_prop is full item
        {
            var value_class = value_prop.ClassName;
        }
        else if (MyExports.IsString(value_prop)) // value_prop is just a class name
        {
            var value_class = value_prop;
            value_prop = new XmlTemplateItem('Value', value_prop);
        }
        else throw new Error('addDictQuick value_prop must be string, XmlTemplateItem, or array of XmlTemplateItem constructor arguments');
        //if (class_name==null) class_name = MyExports.genDictClassName('string', value_class, this.XmlMode);
        return this.addDict(class_name, 'KeyValuePair', ['Key', 'string'], value_prop, dict_namespace, hasExplicitTypeTags);
    }
    /**
     * Finds a class XML template from the factory's collection.
     * @param {string|Object|Function} class_name Name, instance, or class function of the XML class template to find
     * @returns {?XmlTemplate} Returns the XML template if found, otherwise returns null
     */
    find(class_name)
    {
        class_name = CheckConvertClassName(class_name);
        // Make sure we finally end up with a name string
        if (!MyExports.IsString(class_name)) throw new Error('XmlTemplateFactory.find requires class name');
        class_name = this.ClassNameAlias[class_name] || class_name;
        return this.XmlTemplates[class_name] || null;
    }
    /**
     * Decodes a given property from XML value to object value
     * @private
     * @param {any} node XML node of the property to be decoded
     * @param {XmlTemplateItem} prop_info XML template for the give property
     * @param {Object} opts Options to pass through to next level of XML processing
     * @param {Object} _state State to pass through to next level of XML processing
     * @return {any} Value of the decoded type (could be simple type or another object)
     */
    _decodeType(node, prop_info, opts, _state)
    {
        if (node==null || node.getAttr(_state.XmlInstance+':nil')=='true') return null;
        if (prop_info.AttrData) node = node.getAttr(prop_info.Name);
        // check for jagged array
        if (prop_info.ArrayData && !prop_info.ArrayData.isOneDim())
        {
            var tp = prop_info.ArrayData.nextTemp(prop_info);
            var new_item = tp._from_xmlobj(node, opts, _state);
            return (Array.isArray(new_item._Items_) ?  new_item._Items_ : null);
        }
        // check for generic Object used as dictionary
        if (prop_info.DictionaryData)
        {
            // node is an instance of the KeyValuePairStub
            var tp = prop_info.DictionaryData.createPairTemplate();
            return tp._from_xmlobj(node, opts, _state);
        }
        var dict_factory = this.ImplicitDicts[prop_info.ClassName];
        if (dict_factory)
        {
            var tp = dict_factory.createDictTemplate(prop_info.ClassName);
            var new_item = tp._from_xmlobj(node, opts, _state);
            // convert stub into {}
            var dict_obj = {};
            if (Array.isArray(new_item._Items_))
            {
                new_item._Items_.forEach(function(item)
                {
                    var key_content = item[dict_factory.KeyProp.Name];
                    dict_obj[key_content] = item[dict_factory.ValueProp.Name];
                });
            }
            return dict_obj;
        }
        // check for enums
        var enum_obj = this.Enums[prop_info.ClassName];
        if (enum_obj!=undefined && enum_obj.obj!=undefined)
        {
            var v = null;
            if (typeof(enum_obj.obj.getEnumValue)=='function') v = enum_obj.obj.getEnumValue(getNodeValue(node));
            else v = enum_obj.obj[getNodeValue(node)];
            // if it's undefind it will be ignored, do we want an error instead?
            if (v==null) throw new Error(prop_info.ClassName + ' does not define "' + getNodeValue(node) +'"');
            return v;
        }
        // check simple types
        var func = this.SimpleTypeDecoders[prop_info.ClassName];
        if (func != undefined) return func(getNodeValue(node), opts, _state);
        // check registered class types
        if (!node) return null; // if node is XML empty string?
        var dc = node.getAttr(_state.XmlInstance+':type');
        var cn = (dc ? dc : prop_info.ClassName);
        var tp = this.find(cn);
        if (tp==null) throw new Error('XmlTemplateFactory cannot find type '+cn);  // return undefined to ignore, null to set node instance to null, or should we throw error?
        return tp._from_xmlobj(node, opts, _state);
    }
    /**
     * Encodes an object property value into XML value
     * @private
     * @param {any} obj Property value to encode
     * @param {XmlTemplateItem} prop_info Template describing the property to encode
     * @param {Object} xml_obj Current XML node
     * @param {Object} opts Options to pass through to next level of XML processing
     * @param {Object} _state state to pass through to next level of XML processing
     * @return {any} Value for use in XML
     */
    _encodeType(obj, prop_info, xml_obj, opts, _state)
    {
        if (obj==null)
        {
            xml_obj.addAttr(_state.XmlInstance+':nil', 'true');
            return xml_obj;
        }
        // check for jagged array
        if (prop_info.ArrayData && !prop_info.ArrayData.isOneDim())
        {
            var tp = prop_info.ArrayData.nextTemp(prop_info);
            var stub_obj = {_Items_: obj};
            return tp._to_xmlobj(stub_obj, xml_obj, opts, _state);
        }
        // check for generic Object used as dictionary
        if (prop_info.DictionaryData)
        {
            // obj is an instance of the KeyValuePairStub
            var tp = prop_info.DictionaryData.createPairTemplate();
            return tp._to_xmlobj(obj, xml_obj, opts, _state);
        }
        var dict_factory = this.ImplicitDicts[prop_info.ClassName];
        if (dict_factory)
        {
            // obj is a {} where property names are keys
            var arr = [];
            for (let k in obj) // just enumerable object props?
            {
                var stub = dict_factory.createPairStub(k, obj[k]);
                arr.push(stub);
            }
            if (arr.length==0) return xml_obj;
            var tp = dict_factory.createDictTemplate(prop_info.ClassName);
            return tp._to_xmlobj({_Items_:arr}, xml_obj, opts, _state);
        }
        // check for enum
        var enum_obj = this.Enums[prop_info.ClassName];
        if (enum_obj!=undefined&&enum_obj.obj!=undefined)
        {
            var n = null;
            if (typeof(enum_obj.obj.getEnumName)=='function') n = enum_obj.obj.getEnumName(obj);
            else
            {
                for (let k in enum_obj.obj) // just enumerable object props?
                {
                    if (enum_obj.obj[k]==obj) { n = k; break; }
                }
            }
            // if it cannot find enum name, do we error or just use the raw value?
            if (n==null) throw new Error(prop_info.ClassName + ' does not define "' + obj +'"');
            return xml_obj.setValue(n);
        }
        // check simple types
        var func = this.SimpleTypeEncoders[prop_info.ClassName];
        if (func != undefined) return xml_obj.setValue(func(obj, opts, _state));
        // check class types
        var otp = this.find(prop_info.ClassName);
        var tp = this._checkForDerived(obj, otp);
        //if (tp==null) return undefined;  // return undefined to throw, or null to include it as null tag?
        if (tp==null) throw new Error('XmlTemplateFactory cannot find type '+cn);
        if (otp !== tp) xml_obj.addAttr(_state.XmlInstance+':type', tp.getName());
        return tp._to_xmlobj(obj, xml_obj, opts, _state);
    }
    _checkForDerived(obj, tp)
    {
        if (tp==null) return null; // don't have base, so bail
        if (!MyExports.IsClassInstance(obj)) return tp; // not a class, no change
        var obj_name = getShortClass(this.ClassNameAlias[obj.constructor.name]) || obj.constructor.name; // get class name of the current data instance
        if (obj_name == tp.getName()) return tp; // data is the expected class, no change
        // safety check - make sure the class derives from the prop's class?
        if (!(Object.getPrototypeOf(obj) instanceof tp.ClassConstructor)) throw new Error("Not derived class: Data is " + obj_name + ", but property is " + tp.getName());
        // find template for derived class
        return this.find(obj_name);
    }
    _findNS(prop_info)
    {
        if (prop_info.ArrayData && prop_info.ArrayData.XmlNameSpace!=null) return prop_info.ArrayData.XmlNameSpace;
        var dict_factory = this.ImplicitDicts[prop_info.ClassName];
        if (dict_factory) return dict_factory.XmlNameSpace;
        var enum_obj = this.Enums[prop_info.ClassName];
        if (enum_obj != undefined) return (enum_obj.ns==null ? null : enum_obj.ns);
        var ns = this.SimpleTypeNameSpaces[prop_info.ClassName];
        if (ns != undefined) return ns;
        var tp = this.find(prop_info.ClassName);
        if (tp!=null) return tp.XmlNameSpace;
        return null;
    }
    /**
     * Loops all the templates and attempts to add XML namespaces where they are not already defined based on DataContract style XML.
     * @param {string} default_namespace Typically the root namespace. Basically applied to all templates without an existing namespace
     * @return {XmlTemplateFactory} This factory instance
     */
    applyDataContractNameSpaces(default_namespace)
    {
        // By default, nothing has a namespace.
        // Calling this will attempt to set namespaces in a fashion for DataContract use.
        // However custom types still need to be set manually? If unset, use default namespace.
        // Simple types are assumed built-in and require manual assignment if needed.
        // If namespace is empty string '', it should be ignored as purposely set to nothing.
        for (let e in this.Enums)
        {
            // Enums assumed to be default_namespace unless already assigned.
            if (this.Enums[e].ns==null) this.Enums[e].ns = default_namespace;
        }
        for (let d in this.ImplicitDicts)
        {
            if (this.ImplicitDicts[d].XmlNameSpace==null) this.ImplicitDicts[d].XmlNameSpace = 'http://schemas.microsoft.com/2003/10/Serialization/Arrays';
        }
        for (let t in this.XmlTemplates) // get templates first
        {
            if (this.XmlTemplates[t].XmlNameSpace==null) this.XmlTemplates[t].XmlNameSpace = default_namespace;
        }
        for (let t in this.XmlTemplates) // then go looking for arrays
        {
            this.XmlTemplates[t].Props.forEach(function(p)
            {
                if (p.ArrayData && p.ArrayData.XmlNameSpace==null)
                {
                    if (p.NullableData) p.ArrayData.XmlNameSpace = 'http://schemas.datacontract.org/2004/07/System';
                    else // if it has its own namespace, use that; otherwise assume built-in and use array name space
                    {
                        var ns = this._findNS(p);
                        if (ns) p.ArrayData.XmlNameSpace = ns;
                        else p.ArrayData.XmlNameSpace = 'http://schemas.microsoft.com/2003/10/Serialization/Arrays';
                    }
                }
            },this);
        }
        return this;
    }
    _from_xmlobj(xml_obj, options, wrapper_constructor)
    {
        // set up any options or initial internal state values
        options = new XmlProcOptions(options);
        var _state = new XmlProcState(this);
        // get root node
        var root_node = wrapper_constructor.fromTopObject(xml_obj);
        // find xml template with which to parse node
        var root_temp = this.find(root_node.getTagName());
        if (root_temp==null) throw new Error('XmlTemplateFactory does not contain template for "' + root_name +'"');
        // grab any needed namespace info off root element
        var inst_ns = root_node.findNS('http://www.w3.org/2001/XMLSchema-instance');
        if (inst_ns) _state.XmlInstance = inst_ns;
        _state.RootNameSpace = root_temp.XmlNameSpace;
        return root_temp._from_xmlobj(root_node, options, _state);
    }
    _to_xmlobj(root_obj, options, wrapper_constructor)
    {
        // set up any options or initial internal state values
        options = new XmlProcOptions(options);
        var _state = new XmlProcState(this);
        // find the root object in the xml factory
        var class_name;
        if (MyExports.IsClassInstance(root_obj)) class_name = root_obj.constructor.name;
        else throw new Error('XmlTemplateFactory.to_xmldom cannot determine class name from instance');
        // find xml template with which to parse node
        var temp = this.find(class_name);
        if (temp==null) throw new Error('XmlTemplateFactory does not contain template for "' + class_name +'"');
        // make root node
        var xml_obj = wrapper_constructor.makeTopObject(class_name);
        _state.RootNameSpace = temp.XmlNameSpace;
        if (temp.XmlNameSpace) // TODO - should check be temp.XmlNameSpace or options.isDC() ?
        {
            xml_obj.addAttr('xmlns:i', 'http://www.w3.org/2001/XMLSchema-instance');
            xml_obj.addAttr('xmlns', temp.XmlNameSpace);
            _state.XmlInstance = 'i';
        }
        else
        {
            xml_obj.addAttr('xmlns:xsd', 'http://www.w3.org/2001/XMLSchema');
            xml_obj.addAttr('xmlns:xsi', 'http://www.w3.org/2001/XMLSchema-instance');
            _state.XmlInstance = 'xsi';
        }
        temp._to_xmlobj(root_obj, xml_obj, options, _state);
        return xml_obj.getTopObject();
    }

    /**
     * Creates a new class instance from the given object from xmldom XMLDocument.
     * @param {Object} xmldom_obj XmlDocument object produced by xmldom from XML.
     * @param {Object} [options] Object of options to use for deserialization (specific to this function).
     * @returns {Object} An instance of the root object deserialized from the XML root.
     */
    from_xmldom(xmldom_obj, options)
    {
        return this._from_xmlobj(xmldom_obj, options, Wrapper_xmldom);
    }
    /**
     * Creates a new object for xml2js to use from given instance of a known class.
     * @param {Object} root_obj Instance of a class known to this factory to be serialized.
     * @param {Object} [options] Object of options to use for serialization (specific to this function).
     * @returns {Object} XmlDocument object that xmldom can use to generate XML.
     */
    to_xmldom(root_obj, options)
    {
        return this._to_xmlobj(root_obj, options, Wrapper_xmldom);
    }

    /**
     * Creates a new class instance from the given object from xml2js.
     * @param {Object} xml2js_obj Object produced by xmldom from XML.
     * @param {Object} [options] Object of options to use for deserialization (specific to this function).
     * @returns {Object} An instance of the root object deserialized from the XML root.
     */
    from_xml2js(xml2js_obj, options)
    {
        return this._from_xmlobj(xml2js_obj, options, Wrapper_xml2js);
    }
    /**
     * Creates a new object for xml2js to use from given instance of a known class.
     * @param {Object} root_obj Instance of a class known to this factory to be serialized.
     * @param {Object} [options] Object of options to use for serialization (specific to this function).
     * @returns {Object} Object that xml2js can use to generate XML.
     */
    to_xml2js(root_obj, options)
    {
        return this._to_xmlobj(root_obj, options, Wrapper_xml2js);
    }
} // END CLASS: XmlTemplateFactory
MyExports.XmlTemplateFactory = XmlTemplateFactory;


/**
 * A little wrapper for internal handling of user options
 * @private
 */
class XmlProcOptions
{
    constructor(user_opts)
    {
        // Define defaults here
        this.XmlMode=MyExports.xmlModes.XmlSerializer;
        // Apply user overrides here
        Object.assign(this, user_opts);
        // if user did not state a UseNil preference and we are doing DataContract, flip UseNil true
        if (this.UseNil == undefined && this.isDC()) this.UseNil = true;
    }
    isDC() { return (this.XmlMode==MyExports.xmlModes.DataContractSerializer); }
    setDC() { this.XmlMode=MyExports.xmlModes.DataContractSerializer; }
}

/**
 * Provide a base level of state tracking info. Various XML libs might dynamically tack on various props, but these are the common core.
 * @private
 */
class XmlProcState
{
    constructor(factory)
    {
        this.Factory = factory; // XML factory in use
        this.ObjPath = [];
        this.RootNameSpace = null;
        //this.NameSpaceStack = [];
        this.NS = new XmlNameSpaceState();
    }
    prefix(tag) { return this.NS.prefix(tag); }
    saveNsState() { return this.NS.clone(); }
    loadNsState(prevNS) { this.NS = prevNS; }
    setPrefix(ns, prefix, opts) // used in 'from' when we encounter new namespace
    {
        if (ns != null)
        {
            //if(ns=='') _state.Prefix = '';
            if (ns=='' || ns == this.RootNameSpace) this.NS.Prefix = '';
            else
            {
                if (prefix!=null) this.NS.Prefix = prefix;
                //else throw new Error("Cannot find XML namespace " + ns);
            }
        }
    }
    applyNS(ns, opts) // used in 'to' when we encounter new namespace
    {
        if (ns != null)
        {
            if(ns=='' || ns == this.RootNameSpace) this.NS.Prefix = '';
            else if (this.NS.CurNameSpace != ns)
            {
                // TODO - does state need a namespace stack !?! Or just track cur namespace alongside prefix?
                ++this.NS.PrefixCount;
                this.NS.Prefix = 'ns' + this.NS.PrefixCount;
            }
        }
        this.NS.CurNameSpace = ns;
        return ns;
    }
    checkForNsChange(prevNS, ns) // (used in 'to') if ns change, return prefix so we can tag it with xmlns
    {
        if (this.NS.Prefix!=prevNS.Prefix && this.NS.Prefix && ns)
        {
            //--this.NS.PrefixCount; // actually the prev state save will roll this back for us
            return this.NS.Prefix;
        }
        return null;
    }
    pushPath(xml_temp, prop) // centralize this form of push so we can fine tune it in one place
    {
        this.ObjPath.push((xml_temp.XmlPassthrough==prop.Name ? prop.ClassName : prop.Name));
    }
    popAll() // provide single pop function in case other stacks are added?
    {
        if (this.LastError==undefined) this.ObjPath.pop(); // if in midst of err throw, don't pop?
    }
}
/**
 * XML Namespace state may need to be saved or stacked, so create a standardized object for it
 * @private
 */
class XmlNameSpaceState
{
    constructor()
    {
        this.Prefix = '';           //string
        this.PrefixCount = 0;       //number
        this.CurNameSpace = null;   //string
    }
    clone()
    {
        var n = new XmlNameSpaceState();
        Object.assign(n, this);
        return n;
    }
    prefix(tag)
    {
        return (this.Prefix ? this.Prefix + ':' + tag : tag);
    }
}


/**
 * Base class for XML library wrappers
 * @private
 */
class Wrapper_Base
{
    constructor()
    {
        // anything in common besides methods?
    }
}
/**
 * If node is XML, extract value. If already a value, pass it through
 * @private
 * @param {any} node XML node or value
 */
function getNodeValue(node)
{
    if (node == null) return null;
    if (node instanceof Wrapper_Base)
    {
        return node.getValue();
    }
    return node; // assume it is already a value
}

/**
 * Wrapper for xmldom
 * @private
 */
class Wrapper_xmldom extends Wrapper_Base
{
    constructor(doc, node)
    {
        super();
        this.XmlDoc = doc;
        this.Node = node;
    }
    static fromTopObject(read_obj)
    {
        // top object of xmldom is XmlDocument
        return new Wrapper_xmldom(read_obj, read_obj.documentElement);
    }
    static makeTopObject(root_name) // return new root node?
    {
        var doc = getDOMImplementation();
        if (doc==null) throw new Error('Cannot find DOMImplementatio !');
        try { doc = doc.createDocument(); }
        catch (e) { throw new Error('Cannot create XMLDocument> ' + e.message); }
        var root_node = doc.createElement(root_name);
        doc.appendChild(root_node);
        var pi = doc.createProcessingInstruction('xml', 'version="1.0" encoding="utf-8"');
        doc.insertBefore(pi, doc.documentElement);
        return new Wrapper_xmldom(doc, root_node);
    }
    getTopObject() { return this.XmlDoc; }
    getTagName() { return this.Node.tagName; }
    makeNode(name, content)
    {
        var node = this.XmlDoc.createElement(name);
        if (content!=undefined) node.textContent = content;
        return new Wrapper_xmldom(this.XmlDoc, node);
    }
    addNode(node)
    {
        this.Node.appendChild(node.Node);
        return this;
    }
    addAttr(n, v)
    {
        this.Node.setAttribute(n, v);
    }
    getAttr(n)
    {
        if (this.Node == null || this.Node.getAttribute == null) return null;
        var v = this.Node.getAttribute(n);
        return (v ? v : undefined);
    }
    findNS(ns)
    {
        if (this.Node==null) return null;
        for (let i=0; i<this.Node.attributes.length; ++i)
        {
            var attrib = this.Node.attributes[i];
            if (attrib.name.startsWith('xmlns:') && attrib.value == ns) return attrib.name.substr(6);
        }
        return null;
    }
    getFirstNode(n)
    {
        if (this.Node!=null)
        {
            for (let i=0; i<this.Node.childNodes.length; ++i)
            {
                if (this.Node.childNodes[i].nodeType==1 && this.Node.childNodes[i].tagName == n) return new Wrapper_xmldom(this.XmlDoc, this.Node.childNodes[i]);
            }
        }
        return undefined;
    }
    getNodes(n)
    {
        var arr = [];
        for (let i=0; i<this.Node.childNodes.length; ++i)
        {
            if (this.Node.childNodes[i].nodeType==1 && this.Node.childNodes[i].tagName == n) arr.push(new Wrapper_xmldom(this.XmlDoc, this.Node.childNodes[i]));
        }
        return arr;
    }
    setValue(v)
    {
        this.Node.textContent = v;
        return this;
    }
    getValue()
    {
        return (this.Node.textContent == null ? null : this.Node.textContent);
    }
}

/**
 * Wrapper for xml2js
 * @private
 */
class Wrapper_xml2js extends Wrapper_Base
{
    constructor(name, content)
    {
        super();
        this.TagName = name;
        this.Content = content;
    }
    static fromTopObject(read_obj)
    {
        // top object has property with name of root node, assume first prop is root
        var props = Object.getOwnPropertyNames(read_obj);
        if (!Array.isArray(props)) props = Object.getOwnPropertyNames(props); // if not an array, assume root is first property
        if (props.length < 1) throw new Error('Wrapper_xml2js.fromTopObject needs at least one root property');
        var root_name = props[0];
        return new Wrapper_xml2js(root_name, read_obj[root_name]);
    }
    static makeTopObject(root_name) // return new root node?
    {
        return new Wrapper_xml2js(root_name, {});
    }
    getTopObject() { return { [this.TagName]: this.Content}; }
    getTagName() { return this.TagName; }
    makeNode(name, content)
    {
        return new Wrapper_xml2js(name, content);
    }
    addNode(node)
    {
        // xml2js keeps tags of the same name in an array i.e. tagName: [node1, node2,...]
        if (this.Content==null) this.Content = {};
        if (!Array.isArray(this.Content[node.TagName])) // subnodes not established
        {
            if (node.Content==null) // adding empty node
            {
                this.Content[node.TagName] = null; // need this for a proper empty tag
                return this;
            }
            else this.Content[node.TagName] = []; // we are adding non-empty node
        }
        this.Content[node.TagName].push(node.Content);
        return this;
    }
    addAttr(n, v)
    {
        if (!this.Content) this.Content = {};
        if (this.Content.$) this.Content.$[n] = v;
        else this.Content.$ = { [n]:v };
    }
    getAttr(n)
    {
        return (this.Content && this.Content.$) ? this.Content.$[n] : undefined;
    }
    findNS(ns)
    {
        if (this.Content && this.Content.$)
        {
            var attrs = Object.getOwnPropertyNames(this.Content.$);
            for (let i=0; i<attrs.length; ++i)
            {
                // xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" -> {'xmlns:xsi':"http://www.w3.org/2001/XMLSchema-instance"}
                // Should we just do root_node.$[a].includes('XMLSchema-instance') or stay specific ?
                //if (attrs[i].startsWith('xmlns:') && this.Obj.$[attrs[i]].includes(ns))
                if (attrs[i].startsWith('xmlns:') && this.Content.$[attrs[i]]==ns)
                {
                    return attrs[i].substr(6); // remove 'xmlns:'
                }
            }
        }
        return null;
    }
    getFirstNode(n)
    {
        if (this.Content==null) return undefined;
        var xml_node = this.Content[n];
        if (Array.isArray(xml_node))
        {
            if (xml_node.length<1) return;
            else xml_node = xml_node[0];
        }
        if (xml_node==undefined) return null;
        return new Wrapper_xml2js(n, xml_node);
    }
    getNodes(n)
    {
        if (this.Content==null) return undefined;
        var xml_node = this.Content[n];
        if (xml_node==undefined) return null;
        if (!Array.isArray(xml_node)) xml_node = [xml_node];
        return xml_node.map(function(item){return new Wrapper_xml2js(n, item);});
    }
    setValue(v)
    {
        this.Content = v;
        return this;
    }
    getValue()
    {
        return (this.Content == null ? null : this.Content);
    }
}

/* Auto determine exports? No way to conditionally do 'export default' for ES6?
if (typeof(module) !== 'undefined' && module.exports) module.exports = MyExports;
else if (typeof(window) !== 'undefined') window.xml_csharp_cereal = MyExports; // babel transpiler may set 'this' as undefined in ES6 module mode
else this.xml_csharp_cereal = MyExports; */

// Do the actual exporting here (use MetaScript to allow generation of non-CommonJS versions)

//? if (typeof CLASSIC !== 'undefined') {
//?= 'window.xml_csharp_cereal = MyExports; // browser global'
//? } else if (typeof ES6_MOD !== 'undefined') {
//?= 'export default MyExports; // ES6 Module'
//? } else {
module.exports = MyExports; // CommonJS
//? }

//? if (typeof CLASSIC !== 'undefined')
//?= '}).call(this);'
