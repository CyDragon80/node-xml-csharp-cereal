<a name="module_xml-csharp-cereal"></a>

## xml-csharp-cereal
Node.js XML serializer with an eye toward limited C# XmlSerializer compatibility

**License**: (Unlicense OR Apache-2.0) DISCLAIMER: Authors and contributors assume no liability or warranty. Use at your own risk.  

* [xml-csharp-cereal](#module_xml-csharp-cereal)
    * [~XmlSerializerError](#module_xml-csharp-cereal..XmlSerializerError)
        * [new XmlSerializerError(msg, [opts], [_state])](#new_module_xml-csharp-cereal..XmlSerializerError_new)
    * [~XmlTemplateItem](#module_xml-csharp-cereal..XmlTemplateItem)
        * [new XmlTemplateItem(prop_name, class_name, [arr_levels], [arr_namespace], [isNullable], [hasExplicitTypeTag])](#new_module_xml-csharp-cereal..XmlTemplateItem_new)
        * [.nullable()](#module_xml-csharp-cereal..XmlTemplateItem+nullable) ⇒ <code>XmlTemplateItem</code>
        * [.attr()](#module_xml-csharp-cereal..XmlTemplateItem+attr) ⇒ <code>XmlTemplateItem</code>
        * [.explicitTypeTag()](#module_xml-csharp-cereal..XmlTemplateItem+explicitTypeTag) ⇒ <code>XmlTemplateItem</code>
    * [~XmlTemplate](#module_xml-csharp-cereal..XmlTemplate)
        * [new XmlTemplate(class_constructor, [constructor_args], [class_name])](#new_module_xml-csharp-cereal..XmlTemplate_new)
        * [.getName([full])](#module_xml-csharp-cereal..XmlTemplate+getName) ⇒ <code>string</code>
        * [.hasAlias()](#module_xml-csharp-cereal..XmlTemplate+hasAlias) ⇒ <code>boolean</code>
        * [.extend(class_constructor, [constructor_args], [class_name])](#module_xml-csharp-cereal..XmlTemplate+extend) ⇒ <code>XmlTemplate</code>
        * [.clone([class_constructor], [constructor_args], [class_name])](#module_xml-csharp-cereal..XmlTemplate+clone) ⇒ <code>XmlTemplate</code>
        * [.newObj(...constructor_args)](#module_xml-csharp-cereal..XmlTemplate+newObj) ⇒ <code>Object</code>
        * [.add(prop_name, class_name, [arr_levels], [arr_namespace], [isNullable], [hasExplicitTypeTag])](#module_xml-csharp-cereal..XmlTemplate+add) ⇒ <code>XmlTemplateItem</code>
        * [.sortByName([skip_inherited])](#module_xml-csharp-cereal..XmlTemplate+sortByName) ⇒ <code>XmlTemplate</code>
        * [.setXmlNameSpace(xml_namespace)](#module_xml-csharp-cereal..XmlTemplate+setXmlNameSpace) ⇒ <code>XmlTemplate</code>
    * [~XmlTemplateFactory](#module_xml-csharp-cereal..XmlTemplateFactory)
        * [new XmlTemplateFactory([...templates])](#new_module_xml-csharp-cereal..XmlTemplateFactory_new)
        * [.setSimpleCodec(type_names, [decode_func], [encode_func], [type_namespace])](#module_xml-csharp-cereal..XmlTemplateFactory+setSimpleCodec) ⇒ <code>XmlTemplateFactory</code>
        * [.add(xml_template)](#module_xml-csharp-cereal..XmlTemplateFactory+add) ⇒ <code>XmlTemplateFactory</code>
        * [.addEnum(enum_name, enum_obj, [enum_namespace])](#module_xml-csharp-cereal..XmlTemplateFactory+addEnum) ⇒ <code>XmlTemplateFactory</code>
        * [.addDict(class_name, pair_name, key_prop, value_prop, [dict_namespace], [hasExplicitTypeTags])](#module_xml-csharp-cereal..XmlTemplateFactory+addDict) ⇒ <code>XmlTemplateFactory</code>
        * [.addDictQuick(class_name, value_prop, [dict_namespace], [hasExplicitTypeTags])](#module_xml-csharp-cereal..XmlTemplateFactory+addDictQuick) ⇒ <code>XmlTemplateFactory</code>
        * [.find(class_name)](#module_xml-csharp-cereal..XmlTemplateFactory+find) ⇒ <code>XmlTemplate</code>
        * [.applyDataContractNameSpaces(default_namespace)](#module_xml-csharp-cereal..XmlTemplateFactory+applyDataContractNameSpaces) ⇒ <code>XmlTemplateFactory</code>
        * [.from_xmldom(xmldom_obj, [options])](#module_xml-csharp-cereal..XmlTemplateFactory+from_xmldom) ⇒ <code>Object</code>
        * [.to_xmldom(root_obj, [options])](#module_xml-csharp-cereal..XmlTemplateFactory+to_xmldom) ⇒ <code>Object</code>
        * [.from_xml2js(xml2js_obj, [options])](#module_xml-csharp-cereal..XmlTemplateFactory+from_xml2js) ⇒ <code>Object</code>
        * [.to_xml2js(root_obj, [options])](#module_xml-csharp-cereal..XmlTemplateFactory+to_xml2js) ⇒ <code>Object</code>
    * [~DecoderCallback](#module_xml-csharp-cereal..DecoderCallback) ⇒ <code>any</code>
    * [~EncoderCallback](#module_xml-csharp-cereal..EncoderCallback) ⇒ <code>string</code>

<a name="module_xml-csharp-cereal..XmlSerializerError"></a>

### xml-csharp-cereal~XmlSerializerError
Extend standard Error object with additional information from XML serialization process

**Kind**: inner class of [<code>xml-csharp-cereal</code>](#module_xml-csharp-cereal)  
<a name="new_module_xml-csharp-cereal..XmlSerializerError_new"></a>

#### new XmlSerializerError(msg, [opts], [_state])
Creates an instance of XmlSerializerError


| Param | Type | Default | Description |
| --- | --- | --- | --- |
| msg | <code>Error</code> \| <code>string</code> |  | Error object or error message string |
| [opts] | <code>Object</code> | <code></code> | Options object that was used at time of the error |
| [_state] | <code>Object</code> | <code></code> | Internal state object at time of the error |

<a name="module_xml-csharp-cereal..XmlTemplateItem"></a>

### xml-csharp-cereal~XmlTemplateItem
Class representing the XML template for a given property.

**Kind**: inner class of [<code>xml-csharp-cereal</code>](#module_xml-csharp-cereal)  

* [~XmlTemplateItem](#module_xml-csharp-cereal..XmlTemplateItem)
    * [new XmlTemplateItem(prop_name, class_name, [arr_levels], [arr_namespace], [isNullable], [hasExplicitTypeTag])](#new_module_xml-csharp-cereal..XmlTemplateItem_new)
    * [.nullable()](#module_xml-csharp-cereal..XmlTemplateItem+nullable) ⇒ <code>XmlTemplateItem</code>
    * [.attr()](#module_xml-csharp-cereal..XmlTemplateItem+attr) ⇒ <code>XmlTemplateItem</code>
    * [.explicitTypeTag()](#module_xml-csharp-cereal..XmlTemplateItem+explicitTypeTag) ⇒ <code>XmlTemplateItem</code>

<a name="new_module_xml-csharp-cereal..XmlTemplateItem_new"></a>

#### new XmlTemplateItem(prop_name, class_name, [arr_levels], [arr_namespace], [isNullable], [hasExplicitTypeTag])
Creates an instance of XmlTemplateItem.


| Param | Type | Default | Description |
| --- | --- | --- | --- |
| prop_name | <code>string</code> |  | Property Name |
| class_name | <code>string</code> |  | Class or Type Name |
| [arr_levels] | <code>?Array.&lt;string&gt;</code> \| <code>number</code> | <code></code> | XML tag names for array levels or number of dimensions (if not defined, assumes not an array) |
| [arr_namespace] | <code>string</code> |  | XML namespace for array, if any |
| [isNullable] | <code>boolean</code> | <code></code> | If simple type should be flagged as nullable |
| [hasExplicitTypeTag] | <code>boolean</code> | <code></code> | If true this prop uses an explicit type tag (somewhat like an array without being one) |

<a name="module_xml-csharp-cereal..XmlTemplateItem+nullable"></a>

#### xmlTemplateItem.nullable() ⇒ <code>XmlTemplateItem</code>
Mark XmlTemplateItem as nullable

**Kind**: instance method of [<code>XmlTemplateItem</code>](#module_xml-csharp-cereal..XmlTemplateItem)  
**Returns**: <code>XmlTemplateItem</code> - This XmlTemplateItem instance  
<a name="module_xml-csharp-cereal..XmlTemplateItem+attr"></a>

#### xmlTemplateItem.attr() ⇒ <code>XmlTemplateItem</code>
Mark XmlTemplateItem as an XML attribute

**Kind**: instance method of [<code>XmlTemplateItem</code>](#module_xml-csharp-cereal..XmlTemplateItem)  
**Returns**: <code>XmlTemplateItem</code> - This XmlTemplateItem instance  
<a name="module_xml-csharp-cereal..XmlTemplateItem+explicitTypeTag"></a>

#### xmlTemplateItem.explicitTypeTag() ⇒ <code>XmlTemplateItem</code>
Mark XmlTemplateItem as having an explicit type tag

**Kind**: instance method of [<code>XmlTemplateItem</code>](#module_xml-csharp-cereal..XmlTemplateItem)  
**Returns**: <code>XmlTemplateItem</code> - This XmlTemplateItem instance  
<a name="module_xml-csharp-cereal..XmlTemplate"></a>

### xml-csharp-cereal~XmlTemplate
The XmlTemplate class stores info of how a class's properties are to be serialized.

**Kind**: inner class of [<code>xml-csharp-cereal</code>](#module_xml-csharp-cereal)  

* [~XmlTemplate](#module_xml-csharp-cereal..XmlTemplate)
    * [new XmlTemplate(class_constructor, [constructor_args], [class_name])](#new_module_xml-csharp-cereal..XmlTemplate_new)
    * [.getName([full])](#module_xml-csharp-cereal..XmlTemplate+getName) ⇒ <code>string</code>
    * [.hasAlias()](#module_xml-csharp-cereal..XmlTemplate+hasAlias) ⇒ <code>boolean</code>
    * [.extend(class_constructor, [constructor_args], [class_name])](#module_xml-csharp-cereal..XmlTemplate+extend) ⇒ <code>XmlTemplate</code>
    * [.clone([class_constructor], [constructor_args], [class_name])](#module_xml-csharp-cereal..XmlTemplate+clone) ⇒ <code>XmlTemplate</code>
    * [.newObj(...constructor_args)](#module_xml-csharp-cereal..XmlTemplate+newObj) ⇒ <code>Object</code>
    * [.add(prop_name, class_name, [arr_levels], [arr_namespace], [isNullable], [hasExplicitTypeTag])](#module_xml-csharp-cereal..XmlTemplate+add) ⇒ <code>XmlTemplateItem</code>
    * [.sortByName([skip_inherited])](#module_xml-csharp-cereal..XmlTemplate+sortByName) ⇒ <code>XmlTemplate</code>
    * [.setXmlNameSpace(xml_namespace)](#module_xml-csharp-cereal..XmlTemplate+setXmlNameSpace) ⇒ <code>XmlTemplate</code>

<a name="new_module_xml-csharp-cereal..XmlTemplate_new"></a>

#### new XmlTemplate(class_constructor, [constructor_args], [class_name])
Creates an instance of XmlTemplate.


| Param | Type | Default | Description |
| --- | --- | --- | --- |
| class_constructor | <code>function</code> |  | Class function (essentially the constructor) |
| [constructor_args] | <code>Array.&lt;any&gt;</code> | <code></code> | Arguments to feed constructor when creating a new instance |
| [class_name] | <code>string</code> | <code>null</code> | An alternative class name or alias to use in place of the constructor's name |

<a name="module_xml-csharp-cereal..XmlTemplate+getName"></a>

#### xmlTemplate.getName([full]) ⇒ <code>string</code>
Gets the name of the class being mapped by this XML template.

**Kind**: instance method of [<code>XmlTemplate</code>](#module_xml-csharp-cereal..XmlTemplate)  
**Returns**: <code>string</code> - Name of the class that this template maps  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [full] | <code>boolean</code> | <code>false</code> | If true, include any class name qualifiers |

<a name="module_xml-csharp-cereal..XmlTemplate+hasAlias"></a>

#### xmlTemplate.hasAlias() ⇒ <code>boolean</code>
Checks if this template is using a class name alias

**Kind**: instance method of [<code>XmlTemplate</code>](#module_xml-csharp-cereal..XmlTemplate)  
**Returns**: <code>boolean</code> - True if this template uses a class name alias  
<a name="module_xml-csharp-cereal..XmlTemplate+extend"></a>

#### xmlTemplate.extend(class_constructor, [constructor_args], [class_name]) ⇒ <code>XmlTemplate</code>
Converts the current template into a template for the given derived class

**Kind**: instance method of [<code>XmlTemplate</code>](#module_xml-csharp-cereal..XmlTemplate)  
**Returns**: <code>XmlTemplate</code> - The current modified template (not a copy)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| class_constructor | <code>function</code> |  | Class function (essentially the constructor) |
| [constructor_args] | <code>Array.&lt;any&gt;</code> | <code></code> | Arguments to feed constructor when creating a new instance |
| [class_name] | <code>string</code> | <code>null</code> | An alternative class name to use in place of the constructor's name |

<a name="module_xml-csharp-cereal..XmlTemplate+clone"></a>

#### xmlTemplate.clone([class_constructor], [constructor_args], [class_name]) ⇒ <code>XmlTemplate</code>
Makes a shallow copy of this template. You can specify a different class or constructor args if you want.

**Kind**: instance method of [<code>XmlTemplate</code>](#module_xml-csharp-cereal..XmlTemplate)  
**Returns**: <code>XmlTemplate</code> - The shallow clone of this  

| Param | Type | Description |
| --- | --- | --- |
| [class_constructor] | <code>function</code> | Class function (essentially the constructor) |
| [constructor_args] | <code>Array.&lt;any&gt;</code> | Arguments to feed constructor when creating a new instance |
| [class_name] | <code>string</code> | An alternative class name to use in place of the constructor's name |

<a name="module_xml-csharp-cereal..XmlTemplate+newObj"></a>

#### xmlTemplate.newObj(...constructor_args) ⇒ <code>Object</code>
Returns a new instance of the class associated with this template.

**Kind**: instance method of [<code>XmlTemplate</code>](#module_xml-csharp-cereal..XmlTemplate)  
**Returns**: <code>Object</code> - New instance of ClassConstructor (using ConstructorArgs if any)  

| Param | Type | Description |
| --- | --- | --- |
| ...constructor_args | <code>any</code> | If parameters given, they are passed to constructor; otherwise any stored ConstructorArgs are used. |

<a name="module_xml-csharp-cereal..XmlTemplate+add"></a>

#### xmlTemplate.add(prop_name, class_name, [arr_levels], [arr_namespace], [isNullable], [hasExplicitTypeTag]) ⇒ <code>XmlTemplateItem</code>
Add property to this class XML template.

**Kind**: instance method of [<code>XmlTemplate</code>](#module_xml-csharp-cereal..XmlTemplate)  
**Returns**: <code>XmlTemplateItem</code> - Instance of the new XML template item that was added for this property  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| prop_name | <code>string</code> \| <code>XmlTemplateItem</code> |  | Property Name or instance of Property XML template. If passing full item template, other parameters are ignored. |
| class_name | <code>string</code> \| <code>function</code> \| <code>Object</code> |  | Class Name or Class instance or Class function of the property. |
| [arr_levels] | <code>number</code> \| <code>Array.&lt;string&gt;</code> | <code>0</code> | Number of dimensions or array of tag names (if not defined, assumes no array) |
| [arr_namespace] | <code>string</code> |  | XML namespace for array, if any |
| [isNullable] | <code>boolean</code> | <code></code> | If simple type should be flagged as nullable |
| [hasExplicitTypeTag] | <code>boolean</code> | <code></code> | If true this prop uses an explicit type tag (somewhat like an array without being one) |

<a name="module_xml-csharp-cereal..XmlTemplate+sortByName"></a>

#### xmlTemplate.sortByName([skip_inherited]) ⇒ <code>XmlTemplate</code>
Sorts the properties list by property names

**Kind**: instance method of [<code>XmlTemplate</code>](#module_xml-csharp-cereal..XmlTemplate)  
**Returns**: <code>XmlTemplate</code> - This instance  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [skip_inherited] | <code>boolean</code> | <code>false</code> | If true, any inherited props are ignored and put at top of the list in the order they are encounted. |

<a name="module_xml-csharp-cereal..XmlTemplate+setXmlNameSpace"></a>

#### xmlTemplate.setXmlNameSpace(xml_namespace) ⇒ <code>XmlTemplate</code>
Sets the XML namespace for this class template

**Kind**: instance method of [<code>XmlTemplate</code>](#module_xml-csharp-cereal..XmlTemplate)  
**Returns**: <code>XmlTemplate</code> - This instance  

| Param | Type | Description |
| --- | --- | --- |
| xml_namespace | <code>string</code> | The full XML namespace to use for this class |

<a name="module_xml-csharp-cereal..XmlTemplateFactory"></a>

### xml-csharp-cereal~XmlTemplateFactory
The XmlTemplateFactory class stores a collection of XmlTemplate instances for serializing them into/out-of XML.

**Kind**: inner class of [<code>xml-csharp-cereal</code>](#module_xml-csharp-cereal)  

* [~XmlTemplateFactory](#module_xml-csharp-cereal..XmlTemplateFactory)
    * [new XmlTemplateFactory([...templates])](#new_module_xml-csharp-cereal..XmlTemplateFactory_new)
    * [.setSimpleCodec(type_names, [decode_func], [encode_func], [type_namespace])](#module_xml-csharp-cereal..XmlTemplateFactory+setSimpleCodec) ⇒ <code>XmlTemplateFactory</code>
    * [.add(xml_template)](#module_xml-csharp-cereal..XmlTemplateFactory+add) ⇒ <code>XmlTemplateFactory</code>
    * [.addEnum(enum_name, enum_obj, [enum_namespace])](#module_xml-csharp-cereal..XmlTemplateFactory+addEnum) ⇒ <code>XmlTemplateFactory</code>
    * [.addDict(class_name, pair_name, key_prop, value_prop, [dict_namespace], [hasExplicitTypeTags])](#module_xml-csharp-cereal..XmlTemplateFactory+addDict) ⇒ <code>XmlTemplateFactory</code>
    * [.addDictQuick(class_name, value_prop, [dict_namespace], [hasExplicitTypeTags])](#module_xml-csharp-cereal..XmlTemplateFactory+addDictQuick) ⇒ <code>XmlTemplateFactory</code>
    * [.find(class_name)](#module_xml-csharp-cereal..XmlTemplateFactory+find) ⇒ <code>XmlTemplate</code>
    * [.applyDataContractNameSpaces(default_namespace)](#module_xml-csharp-cereal..XmlTemplateFactory+applyDataContractNameSpaces) ⇒ <code>XmlTemplateFactory</code>
    * [.from_xmldom(xmldom_obj, [options])](#module_xml-csharp-cereal..XmlTemplateFactory+from_xmldom) ⇒ <code>Object</code>
    * [.to_xmldom(root_obj, [options])](#module_xml-csharp-cereal..XmlTemplateFactory+to_xmldom) ⇒ <code>Object</code>
    * [.from_xml2js(xml2js_obj, [options])](#module_xml-csharp-cereal..XmlTemplateFactory+from_xml2js) ⇒ <code>Object</code>
    * [.to_xml2js(root_obj, [options])](#module_xml-csharp-cereal..XmlTemplateFactory+to_xml2js) ⇒ <code>Object</code>

<a name="new_module_xml-csharp-cereal..XmlTemplateFactory_new"></a>

#### new XmlTemplateFactory([...templates])
Creates an instance of XmlTemplateFactory.


| Param | Type | Description |
| --- | --- | --- |
| [...templates] | <code>function</code> \| <code>XmlTemplate</code> | Variable number of class functions (with static getXmlTemplate), or XmlTemplate's, or arrays of either. |

<a name="module_xml-csharp-cereal..XmlTemplateFactory+setSimpleCodec"></a>

#### xmlTemplateFactory.setSimpleCodec(type_names, [decode_func], [encode_func], [type_namespace]) ⇒ <code>XmlTemplateFactory</code>
Sets the given simple type decoder or encoder for this factory

**Kind**: instance method of [<code>XmlTemplateFactory</code>](#module_xml-csharp-cereal..XmlTemplateFactory)  
**Returns**: <code>XmlTemplateFactory</code> - This factory instance  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| type_names | <code>string</code> \| <code>Array.&lt;string&gt;</code> |  | Simple type name(s) being set |
| [decode_func] | <code>DecoderCallback</code> | <code></code> | Function to decode XML node string into JS property value |
| [encode_func] | <code>EncoderCallback</code> | <code></code> | Function to encode JS property value into XML node string |
| [type_namespace] | <code>string</code> | <code>null</code> | XML namespace to use for this simple type |

<a name="module_xml-csharp-cereal..XmlTemplateFactory+add"></a>

#### xmlTemplateFactory.add(xml_template) ⇒ <code>XmlTemplateFactory</code>
Add a class XML template to the factory.

**Kind**: instance method of [<code>XmlTemplateFactory</code>](#module_xml-csharp-cereal..XmlTemplateFactory)  
**Returns**: <code>XmlTemplateFactory</code> - This factory instance  

| Param | Type | Description |
| --- | --- | --- |
| xml_template | <code>function</code> \| <code>XmlTemplate</code> | Class function (with static getXmlTemplate) or XmlTemplate instance. |

<a name="module_xml-csharp-cereal..XmlTemplateFactory+addEnum"></a>

#### xmlTemplateFactory.addEnum(enum_name, enum_obj, [enum_namespace]) ⇒ <code>XmlTemplateFactory</code>
Adds an enum type description

**Kind**: instance method of [<code>XmlTemplateFactory</code>](#module_xml-csharp-cereal..XmlTemplateFactory)  
**Returns**: <code>XmlTemplateFactory</code> - This factory instance  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| enum_name | <code>string</code> |  | Name of the enum |
| enum_obj | <code>Object</code> |  | Simple object representation of the enum, or object providing getEnumValue and getEnumName functions |
| [enum_namespace] | <code>string</code> | <code>null</code> | XML namespace of the enum |

<a name="module_xml-csharp-cereal..XmlTemplateFactory+addDict"></a>

#### xmlTemplateFactory.addDict(class_name, pair_name, key_prop, value_prop, [dict_namespace], [hasExplicitTypeTags]) ⇒ <code>XmlTemplateFactory</code>
Adds an implicit dictionary description

**Kind**: instance method of [<code>XmlTemplateFactory</code>](#module_xml-csharp-cereal..XmlTemplateFactory)  
**Returns**: <code>XmlTemplateFactory</code> - This factory instance  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| class_name | <code>string</code> |  | Name of dictionary class |
| pair_name | <code>string</code> |  | Name of key-value pair |
| key_prop | <code>XmlTemplateItem</code> \| <code>Array.&lt;any&gt;</code> |  | Property info for the key (if given array, it is passed to XmlTemplateItem constructor) |
| value_prop | <code>XmlTemplateItem</code> \| <code>Array.&lt;any&gt;</code> |  | Property info for the value (if given array, it is passed to XmlTemplateItem constructor) |
| [dict_namespace] | <code>string</code> | <code>null</code> | XML namespace of the dictionary |
| [hasExplicitTypeTags] | <code>boolean</code> | <code>false</code> | If true, this dictionary uses type tags within key and value tags |

<a name="module_xml-csharp-cereal..XmlTemplateFactory+addDictQuick"></a>

#### xmlTemplateFactory.addDictQuick(class_name, value_prop, [dict_namespace], [hasExplicitTypeTags]) ⇒ <code>XmlTemplateFactory</code>
Adds an implicit dictionary description assuming 'KeyValuePair' with string 'Key'

**Kind**: instance method of [<code>XmlTemplateFactory</code>](#module_xml-csharp-cereal..XmlTemplateFactory)  
**Returns**: <code>XmlTemplateFactory</code> - This factory instance  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| class_name | <code>string</code> |  | Name of dictionary class |
| value_prop | <code>string</code> \| <code>XmlTemplateItem</code> \| <code>Array.&lt;any&gt;</code> |  | Value class name or property info (if given array, it is passed to XmlTemplateItem constructor) |
| [dict_namespace] | <code>string</code> | <code>null</code> | Class namespace of the dictionary |
| [hasExplicitTypeTags] | <code>boolean</code> | <code>false</code> | If true, this dictionary uses type tags within key and value tags |

<a name="module_xml-csharp-cereal..XmlTemplateFactory+find"></a>

#### xmlTemplateFactory.find(class_name) ⇒ <code>XmlTemplate</code>
Finds a class XML template from the factory's collection.

**Kind**: instance method of [<code>XmlTemplateFactory</code>](#module_xml-csharp-cereal..XmlTemplateFactory)  
**Returns**: <code>XmlTemplate</code> - Returns the XML template if found, otherwise returns null  

| Param | Type | Description |
| --- | --- | --- |
| class_name | <code>string</code> \| <code>Object</code> \| <code>function</code> | Name, instance, or class function of the XML class template to find |

<a name="module_xml-csharp-cereal..XmlTemplateFactory+applyDataContractNameSpaces"></a>

#### xmlTemplateFactory.applyDataContractNameSpaces(default_namespace) ⇒ <code>XmlTemplateFactory</code>
Loops all the templates and attempts to add XML namespaces where they are not already defined based on DataContract style XML.

**Kind**: instance method of [<code>XmlTemplateFactory</code>](#module_xml-csharp-cereal..XmlTemplateFactory)  
**Returns**: <code>XmlTemplateFactory</code> - This factory instance  

| Param | Type | Description |
| --- | --- | --- |
| default_namespace | <code>string</code> | Typically the root namespace. Basically applied to all templates without an existing namespace |

<a name="module_xml-csharp-cereal..XmlTemplateFactory+from_xmldom"></a>

#### xmlTemplateFactory.from_xmldom(xmldom_obj, [options]) ⇒ <code>Object</code>
Creates a new class instance of the root object from xmldom XMLDocument.

**Kind**: instance method of [<code>XmlTemplateFactory</code>](#module_xml-csharp-cereal..XmlTemplateFactory)  
**Returns**: <code>Object</code> - An instance of the root object deserialized from the XML root.  

| Param | Type | Description |
| --- | --- | --- |
| xmldom_obj | <code>Object</code> | XmlDocument object produced by xmldom from XML. |
| [options] | <code>Object</code> | Object of options to use for deserialization (specific to this function). |

<a name="module_xml-csharp-cereal..XmlTemplateFactory+to_xmldom"></a>

#### xmlTemplateFactory.to_xmldom(root_obj, [options]) ⇒ <code>Object</code>
Creates a new xmldom XMLDocument from given instance of a known class.

**Kind**: instance method of [<code>XmlTemplateFactory</code>](#module_xml-csharp-cereal..XmlTemplateFactory)  
**Returns**: <code>Object</code> - XmlDocument object that xmldom can use to generate XML.  

| Param | Type | Description |
| --- | --- | --- |
| root_obj | <code>Object</code> | Instance of a class known to this factory to be serialized. |
| [options] | <code>Object</code> | Object of options to use for serialization (specific to this function). |

<a name="module_xml-csharp-cereal..XmlTemplateFactory+from_xml2js"></a>

#### xmlTemplateFactory.from_xml2js(xml2js_obj, [options]) ⇒ <code>Object</code>
Creates a new class instance of the root object from the given xml2js object.

**Kind**: instance method of [<code>XmlTemplateFactory</code>](#module_xml-csharp-cereal..XmlTemplateFactory)  
**Returns**: <code>Object</code> - An instance of the root object deserialized from the XML root.  

| Param | Type | Description |
| --- | --- | --- |
| xml2js_obj | <code>Object</code> | Object produced by xmldom from XML. |
| [options] | <code>Object</code> | Object of options to use for deserialization (specific to this function). |

<a name="module_xml-csharp-cereal..XmlTemplateFactory+to_xml2js"></a>

#### xmlTemplateFactory.to_xml2js(root_obj, [options]) ⇒ <code>Object</code>
Creates a new xml2js object from given instance of a known class.

**Kind**: instance method of [<code>XmlTemplateFactory</code>](#module_xml-csharp-cereal..XmlTemplateFactory)  
**Returns**: <code>Object</code> - Object that xml2js can use to generate XML.  

| Param | Type | Description |
| --- | --- | --- |
| root_obj | <code>Object</code> | Instance of a class known to this factory to be serialized. |
| [options] | <code>Object</code> | Object of options to use for serialization (specific to this function). |

<a name="module_xml-csharp-cereal..DecoderCallback"></a>

### xml-csharp-cereal~DecoderCallback ⇒ <code>any</code>
This callback takes value from XML and decodes it into appropriate value for object.

**Kind**: inner typedef of [<code>xml-csharp-cereal</code>](#module_xml-csharp-cereal)  
**Returns**: <code>any</code> - the decoded JS property value  

| Param | Type | Description |
| --- | --- | --- |
| val | <code>any</code> | the XML node string to decode |

<a name="module_xml-csharp-cereal..EncoderCallback"></a>

### xml-csharp-cereal~EncoderCallback ⇒ <code>string</code>
This callback takes value from object and encodes it into appropriate value for XML.

**Kind**: inner typedef of [<code>xml-csharp-cereal</code>](#module_xml-csharp-cereal)  
**Returns**: <code>string</code> - the encoded XML node string  

| Param | Type | Description |
| --- | --- | --- |
| val | <code>any</code> | the JS property value to encode |

