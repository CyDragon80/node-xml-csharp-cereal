"use strict";const MyExports={};var myDOMImplementation=null;function getDOMImplementation(){if(myDOMImplementation)return myDOMImplementation;if("undefined"!=typeof document&&void 0!==document.implementation)myDOMImplementation=document.implementation;else{var t=TryRequire("xmldom");if(null==t)return null;myDOMImplementation=new t.DOMImplementation}return myDOMImplementation}function TryRequire(t){try{return require(t)}catch(t){return null}}class XmlSerializerError extends Error{constructor(t,e=null,r=null){null==r&&(r={});var a="{"+XmlSerializerError.pathArrToStr(r.ObjPath)+"} ";r.LastError=t,t instanceof Error?(t.message=a+t.message,super(t.message),Object.assign(this,t)):(super(a+t),"function"==typeof Error.captureStackTrace&&Error.captureStackTrace(this,this.constructor)),this.name=this.constructor.name,this.options=e,this.state=r}toString(){return this.name+": "+this.message}static pathArrToStr(t){return null==t?"?":t.join("/")}}function TS_ValOrZero(t){return void 0==t?0:(t=parseFloat(t.replace(",",".")),Number.isFinite(t)?t:0)}function CheckConvertClassName(t){return MyExports.IsClassFunction(t)?t=t.name:MyExports.IsClassInstance(t)?t=t.constructor.name:t instanceof XmlTemplateItem?t=t.ClassName:t instanceof XmlTemplate&&(t=t.getName(!0)),t}function getShortClass(t){if(null==t)return null;var e=t.split(".");return e[e.length-1]}MyExports.decodeInt=function(t){var e=parseInt(t);if(Number.isFinite(e))return e;throw new Error("Value cannot be parsed to int ("+t+")")},MyExports.decodeFloat=function(t){var e=parseFloat(t);if(Number.isFinite(e))return e;throw new Error("Value cannot be parsed to float ("+t+")")},MyExports.decodeDouble=function(t){var e=parseFloat(t);if(Number.isFinite(e))return e;throw new Error("Value cannot be parsed to float ("+t+")")},MyExports.decodeBool=function(t){if(!MyExports.IsString(t))return!!t;if("TRUE"==t.toUpperCase())return!0;if("FALSE"==t.toUpperCase())return!1;try{return 0!=MyExports.decodeInt(t)}catch(e){throw new Error('decodeBool cannot parse "'+t+'"')}},MyExports.decodeString=function(t){return null==t?null:t.toString()},MyExports.decodeDateTime=function(t){return null==t?null:new Date(t)},MyExports.decodeTimeSpan=function(t){if(null==t)return null;var e=/^(-|\+)?P(?:([-+]?[0-9,.]*)Y)?(?:([-+]?[0-9,.]*)M)?(?:([-+]?[0-9,.]*)W)?(?:([-+]?[0-9,.]*)D)?(?:T(?:([-+]?[0-9,.]*)H)?(?:([-+]?[0-9,.]*)M)?(?:([-+]?[0-9,.]*)S)?)?$/.exec(t);if(e){var r=31556926*TS_ValOrZero(e[2])+2629743.83*TS_ValOrZero(e[3])+604800*TS_ValOrZero(e[4])+86400*TS_ValOrZero(e[5])+3600*TS_ValOrZero(e[6])+60*TS_ValOrZero(e[7])+TS_ValOrZero(e[8]);return"-"===e[1]?-r:r}throw new Error('Cannot parse ISO time span "'+t+'"')},MyExports.encodeString=function(t){return t.toString()},MyExports.encodeBool=function(t){return t?"true":"false"},MyExports.encodePassthrough=function(t){return t instanceof Number?t.valueOf():t},MyExports.encodeDateTime=function(t){if(null==t)return null;if(t instanceof Date)return t.toISOString();if(MyExports.IsString(t))return t;throw new Error("encodeDateTime requires instance of Date or a string")},MyExports.encodeTimeSpan=function(t){if(null==t)return null;if(t=parseFloat(t),!Number.isFinite(t))throw new Error("encodeTimeSpan requires a number of seconds");return"PT"+t+"S"},MyExports.IsString=function(t){return"string"==typeof t||t instanceof String},MyExports.IsClassFunction=function(t){return"function"==typeof t&&t.prototype},MyExports.IsClassInstance=function(t){return"object"==typeof t&&t.constructor},MyExports.genArrLevels=function(t,e,r){if(null==t)return null;if(Array.isArray(t))return t;if(!Number.isFinite(t))throw new Error("Array levels must be array of names of number of dimensions");if(t<1)return null;e=getShortClass(e);var a=[],s=r==MyExports.xmlModes.DataContractSerializer?e:e.charAt(0).toUpperCase()+e.slice(1);a[0]=e;for(let e=1;e<t;++e)s="ArrayOf"+s,a[e]=s;return a},MyExports.xmlNS_Array="http://schemas.microsoft.com/2003/10/Serialization/Arrays",MyExports.xmlNS_System="http://schemas.datacontract.org/2004/07/System",MyExports.xmlNS_None="",MyExports.xmlModes={XmlSerializer:0,DataContractSerializer:1},MyExports.CsharpTypeAliases={sbyte:"SByte",byte:"Byte",int:"Int32",uint:"UInt32",short:"Int16",ushort:"UInt16",long:"Int64",ulong:"UInt64"};class ArrayStub{constructor(){this._Items_=[]}}class KeyValuePairStub{constructor(t,e,r,a){void 0===e&&(e=null),void 0===a&&(a=null),this[t]=e,this[r]=a}}class DictionaryFactory{constructor(t,e,r,a){if(!MyExports.IsString(t))throw new Error("DictionaryFactory pair_name must be string");if(!(e instanceof XmlTemplateItem))throw new Error("DictionaryFactory key_class must be XmlTemplateItem");if(!(r instanceof XmlTemplateItem))throw new Error("DictionaryFactory value_class must be XmlTemplateItem");this.PairName=t,this.KeyProp=e,this.ValueProp=r,this.XmlNameSpace=a}createDictTemplate(t){var e=new XmlTemplate(ArrayStub);return e.add("_Items_",this.PairName,1,this.XmlNameSpace).DictionaryData=this,e.XmlPassthrough="_Items_",e}createPairTemplate(t,e){var r=[this.KeyProp.Name,t,this.ValueProp.Name,e],a=new XmlTemplate(KeyValuePairStub,r);return a.add(this.KeyProp),a.add(this.ValueProp),a}createPairStub(t,e){return new KeyValuePairStub(this.KeyProp.Name,t,this.ValueProp.Name,e)}}class ArrayFactory{constructor(t,e){if(!Array.isArray(t)&&!Number.isFinite(t))throw new Error("Array levels must be string[] or number");this.Levels=t,this.XmlNameSpace=e}clone(t,e){return void 0==t&&(t=this.Levels),void 0==e&&(e=this.XmlNameSpace),new ArrayFactory(t,e)}getTopTag(){return this.Levels[this.Levels.length-1]}isOneDim(){return null==this.Levels||1==this.Levels.length}nextTemp(t){var e=new ArrayFactory(this.Levels.slice(0,-1),this.XmlNameSpace),r=new XmlTemplate(ArrayStub);return r.add(t.clone("_Items_",t.ClassName,e)),r.XmlPassthrough="_Items_",r}}class XmlTemplateItem{constructor(t,e,r,a,s,n){if(!MyExports.IsString(t))throw new Error("XmlTemplateItem.constructor prop_name must be string");if(!MyExports.IsString(e))throw new Error("XmlTemplateItem.constructor class_name must be string");this.Name=t,this.ClassName=e,this.ArrayData=r?r instanceof ArrayFactory?r:new ArrayFactory(r,a):null,this.NullableData=s?{}:null,this.AttrData=null,this.ExplicitTypeTag=n?{}:null}_checkArray(t){if(Array.isArray(this.ArrayData.Levels))return this;var e=this.clone();return e.ArrayData.Levels=MyExports.genArrLevels(this.ArrayData.Levels,this.ClassName,t.XmlMode),e}clone(t,e,r){void 0==t&&(t=this.Name),void 0==e&&(e=this.ClassName),void 0==r?r=this.ArrayData.clone():Array.isArray(r)&&(r=this.ArrayData.clone(r));var a=new XmlTemplateItem(t,e,r);return a.NullableData=this.NullableData,a.AttrData=this.AttrData,a.DictionaryData=this.DictionaryData,a.ExplicitTypeTag=this.ExplicitTypeTag,a}nullable(){if(this.AttrData)throw new Error("Nullable types not supported as XML attributes");return this.NullableData={},this}attr(){if(this.ArrayData)throw new Error("Arrays not supported as XML attributes");if(this.NullableData)throw new Error("Nullable types not supported as XML attributes");if(this.ExplicitTypeTag)throw new Error("Explicit type tag not supported as XML attributes");return this.AttrData={},this}explicitTypeTag(){if(this.AttrData)throw new Error("Explicit type tag not supported as XML attributes");this.ExplicitTypeTag={}}}MyExports.XmlTemplateItem=XmlTemplateItem;class XmlTemplate{constructor(t,e,r){this.extend(t,e,r),this.Props=[],this.XmlNameSpace=null}getName(t){return t?this.ClassName:getShortClass(this.ClassName)}hasAlias(){return this.ClassConstructor.name!=this.ClassName}extend(t,e,r){if(!MyExports.IsClassFunction(t))throw new Error("XmlTemplate.constructor requires class_constructor to be class function");if(null!=e&&!Array.isArray(e))throw new Error("XmlTemplate.constructor requires constructor_args to be null or an array");return this.ClassName&&Array.isArray(this.Props)&&this.Props.forEach(function(t){Array.isArray(t.BaseClass)?t.BaseClass.push(this.ClassName):t.BaseClass=[this.ClassName]},this),this.ClassConstructor=t,this.ConstructorArgs=e||null,this.ClassName=r||this.ClassConstructor.name,this}clone(t,e,r){void 0==t&&(t=this.ClassConstructor),void 0==e&&(e=this.ConstructorArgs),void 0==r&&(r=this.ClassName);var a=new XmlTemplate(t,e,r);return a.Props=this.Props.slice(),a.XmlNameSpace=this.XmlNameSpace,a}newObj(...t){return t.length>0?new this.ClassConstructor(...t):Array.isArray(this.ConstructorArgs)?new this.ClassConstructor(...this.ConstructorArgs):new this.ClassConstructor}add(t,e,r,a,s,n){var o=t;return o instanceof XmlTemplateItem||(e=CheckConvertClassName(e),o=new XmlTemplateItem(t,e,r,a,s,n)),this.Props.push(o),o}addBool(t,...e){return this.add(t,"bool",...e)}addString(t,...e){return this.add(t,"string",...e)}addSByte(t,...e){return this.add(t,"sbyte",...e)}addByte(t,...e){return this.add(t,"byte",...e)}addInt(t,...e){return this.add(t,"int",...e)}addUInt(t,...e){return this.add(t,"uint",...e)}addShort(t,...e){return this.add(t,"short",...e)}addUShort(t,...e){return this.add(t,"ushort",...e)}addLong(t,...e){return this.add(t,"long",...e)}addULong(t,...e){return this.add(t,"ulong",...e)}addFloat(t,...e){return this.add(t,"float",...e)}addDouble(t,...e){return this.add(t,"double",...e)}addDateTime(t,...e){return this.add(t,"DateTime",...e)}addTimeSpan(t,...e){return this.add(t,"TimeSpan",...e)}addInt16(t,...e){return this.add(t,"Int16",...e)}addUInt16(t,...e){return this.add(t,"UInt16",...e)}addInt32(t,...e){return this.add(t,"Int32",...e)}addUInt32(t,...e){return this.add(t,"UInt32",...e)}addInt64(t,...e){return this.add(t,"Int64",...e)}addUInt64(t,...e){return this.add(t,"UInt64",...e)}sortByName(t){if(t){var e=[],r=[];this.Props.forEach(function(t){t.BaseClass?e.push(t):r.push(t)}),r.sort(function(t,e){return t.Name<e.Name?-1:t.Name>e.Name?1:0}),this.Props=e.concat(r)}else this.Props.sort(function(t,e){return t.Name<e.Name?-1:t.Name>e.Name?1:0});return this}setXmlNameSpace(t){return this.XmlNameSpace=t,this}_from_xmlobj(t,e,r){if(null==t)return null;var a=this.newObj();return this.Props.forEach(function(s){try{var n;if(r.pushPath(this,s),void 0!=(n=this.XmlPassthrough||s.AttrData?t:t.getFirstNode(r.prefix(s.Name)))){var o=r.saveNsState(),i=void 0;if("true"==n.getAttr(r.XmlInstance+":nil"))return void(a[s.Name]=null);var l=r.Factory._findNS(s);if(null!=l)if(""==l||l==r.RootNameSpace)r.setPrefix(l,null,e);else{let t=n.findNS(l);r.setPrefix(l,t,e)}if(s.ArrayData){s=s._checkArray(e);var m=n.getNodes(r.prefix(s.ArrayData.getTopTag()));if(void 0==m)return void(this.XmlPassthrough==s.Name?a[s.Name]=null:a[s.Name]=[]);i=[],m.forEach(function(t,a){r.ObjPath.push(a);var n=r.Factory._decodeType(t,s,e,r);void 0!==n&&i.push(n),r.ObjPath.pop()},this),a[s.Name]=i}else s.ExplicitTypeTag&&(n=n.getFirstNode(s.ClassName)),void 0!==(i=r.Factory._decodeType(n,s,e,r))&&(a[s.Name]=i);r.loadNsState(o)}}catch(t){throw t instanceof XmlSerializerError?t:new XmlSerializerError(t,e,r)}finally{r.popAll()}},this),a}_to_xmlobj(t,e,r,a){if(null==t)throw new Error("XmlTemplate._to_xmlobj given null object");return this.Props.forEach(function(s){try{var n=this.XmlPassthrough?e:e.makeNode(a.prefix(s.Name));a.pushPath(this,s);var o=a.saveNsState(),i=a.applyNS(a.Factory._findNS(s),r),l=a.checkForNsChange(o,i);l&&n.addAttr("xmlns:"+l,i);var m=t[s.Name];if(null==m)(s.NullableData&&null==s.ArrayData||r.UseNil)&&(n.addAttr(a.XmlInstance+":nil","true"),e!==n&&e.addNode(n));else if(s.ArrayData){s=s._checkArray(r);var u=a.prefix(s.ArrayData.getTopTag());Array.isArray(m)||(m=[m]),m.forEach(function(t,e){a.ObjPath.push(e);var o=n.makeNode(u);if(void 0===(o=a.Factory._encodeType(t,s,o,r,a)))throw new Error('XmlTemplate._to_xmlobj could not generate "'+s.ClassName+'"');n.addNode(o),a.ObjPath.pop()},this),e!==n&&e.addNode(n)}else if(s.ExplicitTypeTag){var c=n.makeNode(s.ClassName);if(void 0===(c=a.Factory._encodeType(m,s,c,r,a)))throw new Error('XmlTemplate._to_xmlobj could not generate "'+s.ClassName+'"');n.addNode(c),e!==n&&e.addNode(n)}else{if(void 0===(n=a.Factory._encodeType(m,s,n,r,a)))throw new Error('XmlTemplate._to_xmlobj could not generate "'+s.ClassName+'"');s.AttrData?e.addAttr(s.Name,n.getValue()):e!==n&&e.addNode(n)}a.loadNsState(o)}catch(t){throw t instanceof XmlSerializerError?t:new XmlSerializerError(t,r,a)}finally{a.popAll()}},this),e}}MyExports.XmlTemplate=XmlTemplate;class XmlTemplateFactory{constructor(...t){this.XmlTemplates={},this.Enums={},this.ImplicitDicts={},this.ClassNameAlias={},t.forEach(function(t){Array.isArray(t)?t.forEach(function(t){this.add(t)},this):this.add(t)},this),this.SimpleTypeDecoders={bool:MyExports.decodeBool,string:MyExports.decodeString,sbyte:MyExports.decodeInt,byte:MyExports.decodeInt,short:MyExports.decodeInt,Int16:MyExports.decodeInt,ushort:MyExports.decodeInt,UInt16:MyExports.decodeInt,int:MyExports.decodeInt,Int32:MyExports.decodeInt,uint:MyExports.decodeInt,UInt32:MyExports.decodeInt,long:MyExports.decodeString,Int64:MyExports.decodeString,ulong:MyExports.decodeString,UInt64:MyExports.decodeString,float:MyExports.decodeFloat,double:MyExports.decodeDouble,DateTime:MyExports.decodeDateTime,TimeSpan:MyExports.decodeTimeSpan},this.SimpleTypeEncoders={bool:MyExports.encodeBool,string:MyExports.encodeString,sbyte:MyExports.encodePassthrough,byte:MyExports.encodePassthrough,short:MyExports.encodePassthrough,Int16:MyExports.encodePassthrough,ushort:MyExports.encodePassthrough,UInt16:MyExports.encodePassthrough,int:MyExports.encodePassthrough,Int32:MyExports.encodePassthrough,uint:MyExports.encodePassthrough,UInt32:MyExports.encodePassthrough,long:MyExports.encodeString,Int64:MyExports.encodeString,ulong:MyExports.encodeString,UInt64:MyExports.encodeString,float:MyExports.encodePassthrough,double:MyExports.encodePassthrough,DateTime:MyExports.encodeDateTime,TimeSpan:MyExports.encodeTimeSpan},this.SimpleTypeNameSpaces={}}setSimpleCodec(t,e,r,a){if(null!=e&&"function"!=typeof e)throw new Error("decode_func is not a function");if(null!=r&&"function"!=typeof r)throw new Error("encode_func is not a function");return Array.isArray(t)||(t=[t]),t.forEach(function(t){null!=e&&(this.SimpleTypeDecoders[t]=e),null!=r&&(this.SimpleTypeEncoders[t]=r),null!=a&&(this.SimpleTypeNameSpaces[t]=a)},this),this}add(t){if("function"==typeof t&&"function"==typeof t.getXmlTemplate&&(t=t.getXmlTemplate()),!(t instanceof XmlTemplate))throw new Error("XmlTemplateFactory.add only takes instances of XmlTemplate OR class functions with static getXmlTemplate()");return this.XmlTemplates[t.getName(!0)]=t,t.hasAlias()&&(this.ClassNameAlias[t.ClassConstructor.name]=t.getName(!0)),this}addEnum(t,e,r){return this.Enums[t]={obj:e,ns:r},this}addDict(t,e,r,a,s,n){if(!MyExports.IsString(t))throw new Error("XmlTemplateFactory.addDict class_name must be string");Array.isArray(r)&&(r=new XmlTemplateItem(...r)),Array.isArray(a)&&(a=new XmlTemplateItem(...a)),n&&(r.explicitTypeTag(),a.explicitTypeTag());var o=new DictionaryFactory(e,r,a,s);return this.ImplicitDicts[t]=o,this}addDictQuick(t,e,r,a){if(Array.isArray(e)&&(e=new XmlTemplateItem(...e)),e instanceof XmlTemplateItem)e.ClassName;else{if(!MyExports.IsString(e))throw new Error("addDictQuick value_prop must be string, XmlTemplateItem, or array of XmlTemplateItem constructor arguments");e=new XmlTemplateItem("Value",e)}return this.addDict(t,"KeyValuePair",["Key","string"],e,r,a)}find(t){if(t=CheckConvertClassName(t),!MyExports.IsString(t))throw new Error("XmlTemplateFactory.find requires class name");return t=this.ClassNameAlias[t]||t,this.XmlTemplates[t]||null}_decodeType(t,e,r,a){if(null==t||"true"==t.getAttr(a.XmlInstance+":nil"))return null;if(e.AttrData&&(t=t.getAttr(e.Name)),e.ArrayData&&!e.ArrayData.isOneDim()){var s=(u=e.ArrayData.nextTemp(e))._from_xmlobj(t,r,a);return Array.isArray(s._Items_)?s._Items_:null}if(e.DictionaryData)return(u=e.DictionaryData.createPairTemplate())._from_xmlobj(t,r,a);var n=this.ImplicitDicts[e.ClassName];if(n){s=(u=n.createDictTemplate(e.ClassName))._from_xmlobj(t,r,a);var o={};return Array.isArray(s._Items_)&&s._Items_.forEach(function(t){var e=t[n.KeyProp.Name];o[e]=t[n.ValueProp.Name]}),o}var i=this.Enums[e.ClassName];if(void 0!=i&&void 0!=i.obj){var l=null;if(null==(l="function"==typeof i.obj.getEnumValue?i.obj.getEnumValue(getNodeValue(t)):i.obj[getNodeValue(t)]))throw new Error(e.ClassName+' does not define "'+getNodeValue(t)+'"');return l}var m=this.SimpleTypeDecoders[e.ClassName];if(void 0!=m)return m(getNodeValue(t),r,a);if(!t)return null;var u,c=t.getAttr(a.XmlInstance+":type"),h=c||e.ClassName;if(null==(u=this.find(h)))throw new Error("XmlTemplateFactory cannot find type "+h);return u._from_xmlobj(t,r,a)}_encodeType(t,e,r,a,s){if(null==t)return r.addAttr(s.XmlInstance+":nil","true"),r;if(e.ArrayData&&!e.ArrayData.isOneDim()){var n={_Items_:t};return(h=e.ArrayData.nextTemp(e))._to_xmlobj(n,r,a,s)}if(e.DictionaryData)return(h=e.DictionaryData.createPairTemplate())._to_xmlobj(t,r,a,s);var o=this.ImplicitDicts[e.ClassName];if(o){var i=[];for(let e in t){var l=o.createPairStub(e,t[e]);i.push(l)}return 0==i.length?r:(h=o.createDictTemplate(e.ClassName))._to_xmlobj({_Items_:i},r,a,s)}var m=this.Enums[e.ClassName];if(void 0!=m&&void 0!=m.obj){var u=null;if("function"==typeof m.obj.getEnumName)u=m.obj.getEnumName(t);else for(let e in m.obj)if(m.obj[e]==t){u=e;break}if(null==u)throw new Error(e.ClassName+' does not define "'+t+'"');return r.setValue(u)}var c=this.SimpleTypeEncoders[e.ClassName];if(void 0!=c)return r.setValue(c(t,a,s));var h,p=this.find(e.ClassName);if(null==(h=this._checkForDerived(t,p)))throw new Error("XmlTemplateFactory cannot find type "+cn);return p!==h&&r.addAttr(s.XmlInstance+":type",h.getName()),h._to_xmlobj(t,r,a,s)}_checkForDerived(t,e){if(null==e)return null;if(!MyExports.IsClassInstance(t))return e;var r=getShortClass(this.ClassNameAlias[t.constructor.name])||t.constructor.name;if(r==e.getName())return e;if(!(Object.getPrototypeOf(t)instanceof e.ClassConstructor))throw new Error("Not derived class: Data is "+r+", but property is "+e.getName());return this.find(r)}_findNS(t){if(t.ArrayData&&null!=t.ArrayData.XmlNameSpace)return t.ArrayData.XmlNameSpace;var e=this.ImplicitDicts[t.ClassName];if(e)return e.XmlNameSpace;var r=this.Enums[t.ClassName];if(void 0!=r)return null==r.ns?null:r.ns;var a=this.SimpleTypeNameSpaces[t.ClassName];if(void 0!=a)return a;var s=this.find(t.ClassName);return null!=s?s.XmlNameSpace:null}applyDataContractNameSpaces(t){for(let e in this.Enums)null==this.Enums[e].ns&&(this.Enums[e].ns=t);for(let t in this.ImplicitDicts)null==this.ImplicitDicts[t].XmlNameSpace&&(this.ImplicitDicts[t].XmlNameSpace="http://schemas.microsoft.com/2003/10/Serialization/Arrays");for(let e in this.XmlTemplates)null==this.XmlTemplates[e].XmlNameSpace&&(this.XmlTemplates[e].XmlNameSpace=t);for(let t in this.XmlTemplates)this.XmlTemplates[t].Props.forEach(function(t){if(t.ArrayData&&null==t.ArrayData.XmlNameSpace)if(t.NullableData)t.ArrayData.XmlNameSpace="http://schemas.datacontract.org/2004/07/System";else{var e=this._findNS(t);t.ArrayData.XmlNameSpace=e||"http://schemas.microsoft.com/2003/10/Serialization/Arrays"}},this);return this}_from_xmlobj(t,e,r){e=new XmlProcOptions(e);var a=new XmlProcState(this),s=r.fromTopObject(t),n=this.find(s.getTagName());if(null==n)throw new Error('XmlTemplateFactory does not contain template for "'+root_name+'"');var o=s.findNS("http://www.w3.org/2001/XMLSchema-instance");return o&&(a.XmlInstance=o),a.RootNameSpace=n.XmlNameSpace,n._from_xmlobj(s,e,a)}_to_xmlobj(t,e,r){e=new XmlProcOptions(e);var a,s=new XmlProcState(this);if(!MyExports.IsClassInstance(t))throw new Error("XmlTemplateFactory.to_xmldom cannot determine class name from instance");a=t.constructor.name;var n=this.find(a);if(null==n)throw new Error('XmlTemplateFactory does not contain template for "'+a+'"');var o=r.makeTopObject(a);return s.RootNameSpace=n.XmlNameSpace,n.XmlNameSpace?(o.addAttr("xmlns:i","http://www.w3.org/2001/XMLSchema-instance"),o.addAttr("xmlns",n.XmlNameSpace),s.XmlInstance="i"):(o.addAttr("xmlns:xsd","http://www.w3.org/2001/XMLSchema"),o.addAttr("xmlns:xsi","http://www.w3.org/2001/XMLSchema-instance"),s.XmlInstance="xsi"),n._to_xmlobj(t,o,e,s),o.getTopObject()}from_xmldom(t,e){return this._from_xmlobj(t,e,Wrapper_xmldom)}to_xmldom(t,e){return this._to_xmlobj(t,e,Wrapper_xmldom)}from_xml2js(t,e){return this._from_xmlobj(t,e,Wrapper_xml2js)}to_xml2js(t,e){return this._to_xmlobj(t,e,Wrapper_xml2js)}}MyExports.XmlTemplateFactory=XmlTemplateFactory;class XmlProcOptions{constructor(t){this.XmlMode=MyExports.xmlModes.XmlSerializer,Object.assign(this,t),void 0==this.UseNil&&this.isDC()&&(this.UseNil=!0)}isDC(){return this.XmlMode==MyExports.xmlModes.DataContractSerializer}setDC(){this.XmlMode=MyExports.xmlModes.DataContractSerializer}}class XmlProcState{constructor(t){this.Factory=t,this.ObjPath=[],this.RootNameSpace=null,this.NS=new XmlNameSpaceState}prefix(t){return this.NS.prefix(t)}saveNsState(){return this.NS.clone()}loadNsState(t){this.NS=t}setPrefix(t,e,r){null!=t&&(""==t||t==this.RootNameSpace?this.NS.Prefix="":null!=e&&(this.NS.Prefix=e))}applyNS(t,e){return null!=t&&(""==t||t==this.RootNameSpace?this.NS.Prefix="":this.NS.CurNameSpace!=t&&(++this.NS.PrefixCount,this.NS.Prefix="ns"+this.NS.PrefixCount)),this.NS.CurNameSpace=t,t}checkForNsChange(t,e){return this.NS.Prefix!=t.Prefix&&this.NS.Prefix&&e?this.NS.Prefix:null}pushPath(t,e){this.ObjPath.push(t.XmlPassthrough==e.Name?e.ClassName:e.Name)}popAll(){void 0==this.LastError&&this.ObjPath.pop()}}class XmlNameSpaceState{constructor(){this.Prefix="",this.PrefixCount=0,this.CurNameSpace=null}clone(){var t=new XmlNameSpaceState;return Object.assign(t,this),t}prefix(t){return this.Prefix?this.Prefix+":"+t:t}}class Wrapper_Base{constructor(){}}function getNodeValue(t){return null==t?null:t instanceof Wrapper_Base?t.getValue():t}class Wrapper_xmldom extends Wrapper_Base{constructor(t,e){super(),this.XmlDoc=t,this.Node=e}static fromTopObject(t){return new Wrapper_xmldom(t,t.documentElement)}static makeTopObject(t){var e=getDOMImplementation();if(null==e)throw new Error("Cannot find DOMImplementatio !");try{e=e.createDocument()}catch(t){throw new Error("Cannot create XMLDocument> "+t.message)}var r=e.createElement(t);e.appendChild(r);var a=e.createProcessingInstruction("xml",'version="1.0" encoding="utf-8"');return e.insertBefore(a,e.documentElement),new Wrapper_xmldom(e,r)}getTopObject(){return this.XmlDoc}getTagName(){return this.Node.tagName}makeNode(t,e){var r=this.XmlDoc.createElement(t);return void 0!=e&&(r.textContent=e),new Wrapper_xmldom(this.XmlDoc,r)}addNode(t){return this.Node.appendChild(t.Node),this}addAttr(t,e){this.Node.setAttribute(t,e)}getAttr(t){if(null==this.Node||null==this.Node.getAttribute)return null;var e=this.Node.getAttribute(t);return e||void 0}findNS(t){if(null==this.Node)return null;for(let r=0;r<this.Node.attributes.length;++r){var e=this.Node.attributes[r];if(e.name.startsWith("xmlns:")&&e.value==t)return e.name.substr(6)}return null}getFirstNode(t){if(null!=this.Node)for(let e=0;e<this.Node.childNodes.length;++e)if(1==this.Node.childNodes[e].nodeType&&this.Node.childNodes[e].tagName==t)return new Wrapper_xmldom(this.XmlDoc,this.Node.childNodes[e])}getNodes(t){var e=[];for(let r=0;r<this.Node.childNodes.length;++r)1==this.Node.childNodes[r].nodeType&&this.Node.childNodes[r].tagName==t&&e.push(new Wrapper_xmldom(this.XmlDoc,this.Node.childNodes[r]));return e}setValue(t){return this.Node.textContent=t,this}getValue(){return null==this.Node.textContent?null:this.Node.textContent}}class Wrapper_xml2js extends Wrapper_Base{constructor(t,e){super(),this.TagName=t,this.Content=e}static fromTopObject(t){var e=Object.getOwnPropertyNames(t);if(Array.isArray(e)||(e=Object.getOwnPropertyNames(e)),e.length<1)throw new Error("Wrapper_xml2js.fromTopObject needs at least one root property");var r=e[0];return new Wrapper_xml2js(r,t[r])}static makeTopObject(t){return new Wrapper_xml2js(t,{})}getTopObject(){return{[this.TagName]:this.Content}}getTagName(){return this.TagName}makeNode(t,e){return new Wrapper_xml2js(t,e)}addNode(t){if(null==this.Content&&(this.Content={}),!Array.isArray(this.Content[t.TagName])){if(null==t.Content)return this.Content[t.TagName]=null,this;this.Content[t.TagName]=[]}return this.Content[t.TagName].push(t.Content),this}addAttr(t,e){this.Content||(this.Content={}),this.Content.$?this.Content.$[t]=e:this.Content.$={[t]:e}}getAttr(t){return this.Content&&this.Content.$?this.Content.$[t]:void 0}findNS(t){if(this.Content&&this.Content.$){var e=Object.getOwnPropertyNames(this.Content.$);for(let r=0;r<e.length;++r)if(e[r].startsWith("xmlns:")&&this.Content.$[e[r]]==t)return e[r].substr(6)}return null}getFirstNode(t){if(null!=this.Content){var e=this.Content[t];if(Array.isArray(e)){if(e.length<1)return;e=e[0]}return void 0==e?null:new Wrapper_xml2js(t,e)}}getNodes(t){if(null!=this.Content){var e=this.Content[t];return void 0==e?null:(Array.isArray(e)||(e=[e]),e.map(function(e){return new Wrapper_xml2js(t,e)}))}}setValue(t){return this.Content=t,this}getValue(){return null==this.Content?null:this.Content}}export default MyExports;