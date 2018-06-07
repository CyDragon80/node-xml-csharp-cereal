"use strict";(function(){const t={};var e=null;function r(){if(e)return e;if("undefined"!=typeof document&&void 0!==document.implementation)e=document.implementation;else{var t=function(t){try{return require(t)}catch(t){return null}}("xmldom");if(null==t)return null;e=new t.DOMImplementation}return e}class a extends Error{constructor(t,e=null,r=null){null==r&&(r={});var n="{"+a.pathArrToStr(r.ObjPath)+"} ";r.LastError=t,t instanceof Error?(t.message=n+t.message,super(t.message),Object.assign(this,t)):(super(n+t),"function"==typeof Error.captureStackTrace&&Error.captureStackTrace(this,this.constructor)),this.name=this.constructor.name,this.options=e,this.state=r}toString(){return this.name+": "+this.message}static pathArrToStr(t){return null==t?"?":t.join("/")}}function n(t){return void 0==t?0:(t=parseFloat(t.replace(",",".")),Number.isFinite(t)?t:0)}function s(e){return t.IsClassFunction(e)?e=e.name:t.IsClassInstance(e)?e=e.constructor.name:e instanceof m?e=e.ClassName:e instanceof h&&(e=e.getName(!0)),e}function i(t){if(null==t)return null;var e=t.split(".");return e[e.length-1]}t.decodeInt=function(t){var e=parseInt(t);if(Number.isFinite(e))return e;throw new Error("Value cannot be parsed to int ("+t+")")},t.decodeFloat=function(t){var e=parseFloat(t);if(Number.isFinite(e))return e;throw new Error("Value cannot be parsed to float ("+t+")")},t.decodeDouble=function(t){var e=parseFloat(t);if(Number.isFinite(e))return e;throw new Error("Value cannot be parsed to float ("+t+")")},t.decodeBool=function(e){if(!t.IsString(e))return!!e;if("TRUE"==e.toUpperCase())return!0;if("FALSE"==e.toUpperCase())return!1;try{return 0!=t.decodeInt(e)}catch(t){throw new Error('decodeBool cannot parse "'+e+'"')}},t.decodeString=function(t){return null==t?null:t.toString()},t.decodeDateTime=function(t){return null==t?null:new Date(t)},t.decodeTimeSpan=function(t){if(null==t)return null;var e=/^(-|\+)?P(?:([-+]?[0-9,.]*)Y)?(?:([-+]?[0-9,.]*)M)?(?:([-+]?[0-9,.]*)W)?(?:([-+]?[0-9,.]*)D)?(?:T(?:([-+]?[0-9,.]*)H)?(?:([-+]?[0-9,.]*)M)?(?:([-+]?[0-9,.]*)S)?)?$/.exec(t);if(e){var r=31556926*n(e[2])+2629743.83*n(e[3])+604800*n(e[4])+86400*n(e[5])+3600*n(e[6])+60*n(e[7])+n(e[8]);return"-"===e[1]?-r:r}throw new Error('Cannot parse ISO time span "'+t+'"')},t.encodeString=function(t){return t.toString()},t.encodeBool=function(t){return t?"true":"false"},t.encodePassthrough=function(t){return t instanceof Number?t.valueOf():t},t.encodeDateTime=function(e){if(null==e)return null;if(e instanceof Date)return e.toISOString();if(t.IsString(e))return e;throw new Error("encodeDateTime requires instance of Date or a string")},t.encodeTimeSpan=function(t){if(null==t)return null;if(t=parseFloat(t),!Number.isFinite(t))throw new Error("encodeTimeSpan requires a number of seconds");return"PT"+t+"S"},t.IsString=function(t){return"string"==typeof t||t instanceof String},t.IsClassFunction=function(t){return"function"==typeof t&&t.prototype},t.IsClassInstance=function(t){return"object"==typeof t&&t.constructor},t.genArrLevels=function(e,r,a){if(null==e)return null;if(Array.isArray(e))return e;if(!Number.isFinite(e))throw new Error("Array levels must be array of names of number of dimensions");if(e<1)return null;r=i(r);var n=[],s=a==t.xmlModes.DataContractSerializer?r:r.charAt(0).toUpperCase()+r.slice(1);n[0]=r;for(let t=1;t<e;++t)s="ArrayOf"+s,n[t]=s;return n},t.xmlNS_Array="http://schemas.microsoft.com/2003/10/Serialization/Arrays",t.xmlNS_System="http://schemas.datacontract.org/2004/07/System",t.xmlNS_None="",t.xmlModes={XmlSerializer:0,DataContractSerializer:1},t.CsharpTypeAliases={sbyte:"SByte",byte:"Byte",int:"Int32",uint:"UInt32",short:"Int16",ushort:"UInt16",long:"Int64",ulong:"UInt64"};class o{constructor(){this._Items_=[]}}class l{constructor(t,e,r,a){void 0===e&&(e=null),void 0===a&&(a=null),this[t]=e,this[r]=a}}class u{constructor(e,r,a,n){if(!t.IsString(e))throw new Error("DictionaryFactory pair_name must be string");if(!(r instanceof m))throw new Error("DictionaryFactory key_class must be XmlTemplateItem");if(!(a instanceof m))throw new Error("DictionaryFactory value_class must be XmlTemplateItem");this.PairName=e,this.KeyProp=r,this.ValueProp=a,this.XmlNameSpace=n}createDictTemplate(t){var e=new h(o);return e.add("_Items_",this.PairName,1,this.XmlNameSpace).DictionaryData=this,e.XmlPassthrough="_Items_",e}createPairTemplate(t,e){var r=[this.KeyProp.Name,t,this.ValueProp.Name,e],a=new h(l,r);return a.add(this.KeyProp),a.add(this.ValueProp),a}createPairStub(t,e){return new l(this.KeyProp.Name,t,this.ValueProp.Name,e)}}class c{constructor(t,e){if(!Array.isArray(t)&&!Number.isFinite(t))throw new Error("Array levels must be string[] or number");this.Levels=t,this.XmlNameSpace=e}clone(t,e){return void 0==t&&(t=this.Levels),void 0==e&&(e=this.XmlNameSpace),new c(t,e)}getTopTag(){return this.Levels[this.Levels.length-1]}isOneDim(){return null==this.Levels||1==this.Levels.length}nextTemp(t){var e=new c(this.Levels.slice(0,-1),this.XmlNameSpace),r=new h(o);return r.add(t.clone("_Items_",t.ClassName,e)),r.XmlPassthrough="_Items_",r}}class m{constructor(e,r,a,n,s,i){if(!t.IsString(e))throw new Error("XmlTemplateItem.constructor prop_name must be string");if(!t.IsString(r))throw new Error("XmlTemplateItem.constructor class_name must be string");this.Name=e,this.ClassName=r,this.ArrayData=a?a instanceof c?a:new c(a,n):null,this.NullableData=s?{}:null,this.AttrData=null,this.ExplicitTypeTag=i?{}:null}_checkArray(e){if(Array.isArray(this.ArrayData.Levels))return this;var r=this.clone();return r.ArrayData.Levels=t.genArrLevels(this.ArrayData.Levels,this.ClassName,e.XmlMode),r}clone(t,e,r){void 0==t&&(t=this.Name),void 0==e&&(e=this.ClassName),void 0==r?r=this.ArrayData.clone():Array.isArray(r)&&(r=this.ArrayData.clone(r));var a=new m(t,e,r);return a.NullableData=this.NullableData,a.AttrData=this.AttrData,a.DictionaryData=this.DictionaryData,a.ExplicitTypeTag=this.ExplicitTypeTag,a}nullable(){if(this.AttrData)throw new Error("Nullable types not supported as XML attributes");return this.NullableData={},this}attr(){if(this.ArrayData)throw new Error("Arrays not supported as XML attributes");if(this.NullableData)throw new Error("Nullable types not supported as XML attributes");if(this.ExplicitTypeTag)throw new Error("Explicit type tag not supported as XML attributes");return this.AttrData={},this}explicitTypeTag(){if(this.AttrData)throw new Error("Explicit type tag not supported as XML attributes");this.ExplicitTypeTag={}}}t.XmlTemplateItem=m;class h{constructor(t,e,r){this.extend(t,e,r),this.Props=[],this.XmlNameSpace=null}getName(t){return t?this.ClassName:i(this.ClassName)}hasAlias(){return this.ClassConstructor.name!=this.ClassName}extend(e,r,a){if(!t.IsClassFunction(e))throw new Error("XmlTemplate.constructor requires class_constructor to be class function");if(null!=r&&!Array.isArray(r))throw new Error("XmlTemplate.constructor requires constructor_args to be null or an array");return this.ClassName&&Array.isArray(this.Props)&&this.Props.forEach(function(t){Array.isArray(t.BaseClass)?t.BaseClass.push(this.ClassName):t.BaseClass=[this.ClassName]},this),this.ClassConstructor=e,this.ConstructorArgs=r||null,this.ClassName=a||this.ClassConstructor.name,this}clone(t,e,r){void 0==t&&(t=this.ClassConstructor),void 0==e&&(e=this.ConstructorArgs),void 0==r&&(r=this.ClassName);var a=new h(t,e,r);return a.Props=this.Props.slice(),a.XmlNameSpace=this.XmlNameSpace,a}newObj(...t){return t.length>0?new this.ClassConstructor(...t):Array.isArray(this.ConstructorArgs)?new this.ClassConstructor(...this.ConstructorArgs):new this.ClassConstructor}add(t,e,r,a,n,i){var o=t;return o instanceof m||(e=s(e),o=new m(t,e,r,a,n,i)),this.Props.push(o),o}addBool(t,...e){return this.add(t,"bool",...e)}addString(t,...e){return this.add(t,"string",...e)}addSByte(t,...e){return this.add(t,"sbyte",...e)}addByte(t,...e){return this.add(t,"byte",...e)}addInt(t,...e){return this.add(t,"int",...e)}addUInt(t,...e){return this.add(t,"uint",...e)}addShort(t,...e){return this.add(t,"short",...e)}addUShort(t,...e){return this.add(t,"ushort",...e)}addLong(t,...e){return this.add(t,"long",...e)}addULong(t,...e){return this.add(t,"ulong",...e)}addFloat(t,...e){return this.add(t,"float",...e)}addDouble(t,...e){return this.add(t,"double",...e)}addDateTime(t,...e){return this.add(t,"DateTime",...e)}addTimeSpan(t,...e){return this.add(t,"TimeSpan",...e)}addInt16(t,...e){return this.add(t,"Int16",...e)}addUInt16(t,...e){return this.add(t,"UInt16",...e)}addInt32(t,...e){return this.add(t,"Int32",...e)}addUInt32(t,...e){return this.add(t,"UInt32",...e)}addInt64(t,...e){return this.add(t,"Int64",...e)}addUInt64(t,...e){return this.add(t,"UInt64",...e)}sortByName(t){if(t){var e=[],r=[];this.Props.forEach(function(t){t.BaseClass?e.push(t):r.push(t)}),r.sort(function(t,e){return t.Name<e.Name?-1:t.Name>e.Name?1:0}),this.Props=e.concat(r)}else this.Props.sort(function(t,e){return t.Name<e.Name?-1:t.Name>e.Name?1:0});return this}setXmlNameSpace(t){return this.XmlNameSpace=t,this}_from_xmlobj(t,e,r){if(null==t)return null;var n=this.newObj();return this.Props.forEach(function(s){try{var i;if(r.pushPath(this,s),void 0!=(i=this.XmlPassthrough||s.AttrData?t:t.getFirstNode(r.prefix(s.Name)))){var o=r.saveNsState(),l=void 0;if("true"==i.getAttr(r.XmlInstance+":nil"))return void(n[s.Name]=null);var u=r.Factory._findNS(s);if(null!=u)if(""==u||u==r.RootNameSpace)r.setPrefix(u,null,e);else{let t=i.findNS(u);r.setPrefix(u,t,e)}if(s.ArrayData){s=s._checkArray(e);var c=i.getNodes(r.prefix(s.ArrayData.getTopTag()));if(void 0==c)return void(this.XmlPassthrough==s.Name?n[s.Name]=null:n[s.Name]=[]);l=[],c.forEach(function(t,a){r.ObjPath.push(a);var n=r.Factory._decodeType(t,s,e,r);void 0!==n&&l.push(n),r.ObjPath.pop()},this),n[s.Name]=l}else s.ExplicitTypeTag&&(i=i.getFirstNode(s.ClassName)),void 0!==(l=r.Factory._decodeType(i,s,e,r))&&(n[s.Name]=l);r.loadNsState(o)}}catch(t){throw t instanceof a?t:new a(t,e,r)}finally{r.popAll()}},this),n}_to_xmlobj(t,e,r,n){if(null==t)throw new Error("XmlTemplate._to_xmlobj given null object");return this.Props.forEach(function(s){try{var i=this.XmlPassthrough?e:e.makeNode(n.prefix(s.Name));n.pushPath(this,s);var o=n.saveNsState(),l=n.applyNS(n.Factory._findNS(s),r),u=n.checkForNsChange(o,l);u&&i.addAttr("xmlns:"+u,l);var c=t[s.Name];if(null==c)(s.NullableData&&null==s.ArrayData||r.UseNil)&&(i.addAttr(n.XmlInstance+":nil","true"),e!==i&&e.addNode(i));else if(s.ArrayData){s=s._checkArray(r);var m=n.prefix(s.ArrayData.getTopTag());Array.isArray(c)||(c=[c]),c.forEach(function(t,e){n.ObjPath.push(e);var a=i.makeNode(m);if(void 0===(a=n.Factory._encodeType(t,s,a,r,n)))throw new Error('XmlTemplate._to_xmlobj could not generate "'+s.ClassName+'"');i.addNode(a),n.ObjPath.pop()},this),e!==i&&e.addNode(i)}else if(s.ExplicitTypeTag){var h=i.makeNode(s.ClassName);if(void 0===(h=n.Factory._encodeType(c,s,h,r,n)))throw new Error('XmlTemplate._to_xmlobj could not generate "'+s.ClassName+'"');i.addNode(h),e!==i&&e.addNode(i)}else{if(void 0===(i=n.Factory._encodeType(c,s,i,r,n)))throw new Error('XmlTemplate._to_xmlobj could not generate "'+s.ClassName+'"');s.AttrData?e.addAttr(s.Name,i.getValue()):e!==i&&e.addNode(i)}n.loadNsState(o)}catch(t){throw t instanceof a?t:new a(t,r,n)}finally{n.popAll()}},this),e}}t.XmlTemplate=h;t.XmlTemplateFactory=class{constructor(...e){this.XmlTemplates={},this.Enums={},this.ImplicitDicts={},this.ClassNameAlias={},e.forEach(function(t){Array.isArray(t)?t.forEach(function(t){this.add(t)},this):this.add(t)},this),this.SimpleTypeDecoders={bool:t.decodeBool,string:t.decodeString,sbyte:t.decodeInt,byte:t.decodeInt,short:t.decodeInt,Int16:t.decodeInt,ushort:t.decodeInt,UInt16:t.decodeInt,int:t.decodeInt,Int32:t.decodeInt,uint:t.decodeInt,UInt32:t.decodeInt,long:t.decodeString,Int64:t.decodeString,ulong:t.decodeString,UInt64:t.decodeString,float:t.decodeFloat,double:t.decodeDouble,DateTime:t.decodeDateTime,TimeSpan:t.decodeTimeSpan},this.SimpleTypeEncoders={bool:t.encodeBool,string:t.encodeString,sbyte:t.encodePassthrough,byte:t.encodePassthrough,short:t.encodePassthrough,Int16:t.encodePassthrough,ushort:t.encodePassthrough,UInt16:t.encodePassthrough,int:t.encodePassthrough,Int32:t.encodePassthrough,uint:t.encodePassthrough,UInt32:t.encodePassthrough,long:t.encodeString,Int64:t.encodeString,ulong:t.encodeString,UInt64:t.encodeString,float:t.encodePassthrough,double:t.encodePassthrough,DateTime:t.encodeDateTime,TimeSpan:t.encodeTimeSpan},this.SimpleTypeNameSpaces={}}setSimpleCodec(t,e,r,a){if(null!=e&&"function"!=typeof e)throw new Error("decode_func is not a function");if(null!=r&&"function"!=typeof r)throw new Error("encode_func is not a function");return Array.isArray(t)||(t=[t]),t.forEach(function(t){null!=e&&(this.SimpleTypeDecoders[t]=e),null!=r&&(this.SimpleTypeEncoders[t]=r),null!=a&&(this.SimpleTypeNameSpaces[t]=a)},this),this}add(t){if("function"==typeof t&&"function"==typeof t.getXmlTemplate&&(t=t.getXmlTemplate()),!(t instanceof h))throw new Error("XmlTemplateFactory.add only takes instances of XmlTemplate OR class functions with static getXmlTemplate()");return this.XmlTemplates[t.getName(!0)]=t,t.hasAlias()&&(this.ClassNameAlias[t.ClassConstructor.name]=t.getName(!0)),this}addEnum(t,e,r){return this.Enums[t]={obj:e,ns:r},this}addDict(e,r,a,n,s,i){if(!t.IsString(e))throw new Error("XmlTemplateFactory.addDict class_name must be string");Array.isArray(a)&&(a=new m(...a)),Array.isArray(n)&&(n=new m(...n)),i&&(a.explicitTypeTag(),n.explicitTypeTag());var o=new u(r,a,n,s);return this.ImplicitDicts[e]=o,this}addDictQuick(e,r,a,n){if(Array.isArray(r)&&(r=new m(...r)),r instanceof m)r.ClassName;else{if(!t.IsString(r))throw new Error("addDictQuick value_prop must be string, XmlTemplateItem, or array of XmlTemplateItem constructor arguments");r=new m("Value",r)}return this.addDict(e,"KeyValuePair",["Key","string"],r,a,n)}find(e){if(e=s(e),!t.IsString(e))throw new Error("XmlTemplateFactory.find requires class name");return e=this.ClassNameAlias[e]||e,this.XmlTemplates[e]||null}_decodeType(t,e,r,a){if(null==t||"true"==t.getAttr(a.XmlInstance+":nil"))return null;if(e.AttrData&&(t=t.getAttr(e.Name)),e.ArrayData&&!e.ArrayData.isOneDim()){var n=(c=e.ArrayData.nextTemp(e))._from_xmlobj(t,r,a);return Array.isArray(n._Items_)?n._Items_:null}if(e.DictionaryData)return(c=e.DictionaryData.createPairTemplate())._from_xmlobj(t,r,a);var s=this.ImplicitDicts[e.ClassName];if(s){n=(c=s.createDictTemplate(e.ClassName))._from_xmlobj(t,r,a);var i={};return Array.isArray(n._Items_)&&n._Items_.forEach(function(t){var e=t[s.KeyProp.Name];i[e]=t[s.ValueProp.Name]}),i}var o=this.Enums[e.ClassName];if(void 0!=o&&void 0!=o.obj){var l=null;if(null==(l="function"==typeof o.obj.getEnumValue?o.obj.getEnumValue(y(t)):o.obj[y(t)]))throw new Error(e.ClassName+' does not define "'+y(t)+'"');return l}var u=this.SimpleTypeDecoders[e.ClassName];if(void 0!=u)return u(y(t),r,a);if(!t)return null;var c,m=t.getAttr(a.XmlInstance+":type"),h=m||e.ClassName;if(null==(c=this.find(h)))throw new Error("XmlTemplateFactory cannot find type "+h);return c._from_xmlobj(t,r,a)}_encodeType(t,e,r,a,n){if(null==t)return r.addAttr(n.XmlInstance+":nil","true"),r;if(e.ArrayData&&!e.ArrayData.isOneDim()){var s={_Items_:t};return(h=e.ArrayData.nextTemp(e))._to_xmlobj(s,r,a,n)}if(e.DictionaryData)return(h=e.DictionaryData.createPairTemplate())._to_xmlobj(t,r,a,n);var i=this.ImplicitDicts[e.ClassName];if(i){var o=[];for(let e in t){var l=i.createPairStub(e,t[e]);o.push(l)}return 0==o.length?r:(h=i.createDictTemplate(e.ClassName))._to_xmlobj({_Items_:o},r,a,n)}var u=this.Enums[e.ClassName];if(void 0!=u&&void 0!=u.obj){var c=null;if("function"==typeof u.obj.getEnumName)c=u.obj.getEnumName(t);else for(let e in u.obj)if(u.obj[e]==t){c=e;break}if(null==c)throw new Error(e.ClassName+' does not define "'+t+'"');return r.setValue(c)}var m=this.SimpleTypeEncoders[e.ClassName];if(void 0!=m)return r.setValue(m(t,a,n));var h,d=this.find(e.ClassName);if(null==(h=this._checkForDerived(t,d)))throw new Error("XmlTemplateFactory cannot find type "+cn);return d!==h&&r.addAttr(n.XmlInstance+":type",h.getName()),h._to_xmlobj(t,r,a,n)}_checkForDerived(e,r){if(null==r)return null;if(!t.IsClassInstance(e))return r;var a=i(this.ClassNameAlias[e.constructor.name])||e.constructor.name;if(a==r.getName())return r;if(!(Object.getPrototypeOf(e)instanceof r.ClassConstructor))throw new Error("Not derived class: Data is "+a+", but property is "+r.getName());return this.find(a)}_findNS(t){if(t.ArrayData&&null!=t.ArrayData.XmlNameSpace)return t.ArrayData.XmlNameSpace;var e=this.ImplicitDicts[t.ClassName];if(e)return e.XmlNameSpace;var r=this.Enums[t.ClassName];if(void 0!=r)return null==r.ns?null:r.ns;var a=this.SimpleTypeNameSpaces[t.ClassName];if(void 0!=a)return a;var n=this.find(t.ClassName);return null!=n?n.XmlNameSpace:null}applyDataContractNameSpaces(t){for(let e in this.Enums)null==this.Enums[e].ns&&(this.Enums[e].ns=t);for(let t in this.ImplicitDicts)null==this.ImplicitDicts[t].XmlNameSpace&&(this.ImplicitDicts[t].XmlNameSpace="http://schemas.microsoft.com/2003/10/Serialization/Arrays");for(let e in this.XmlTemplates)null==this.XmlTemplates[e].XmlNameSpace&&(this.XmlTemplates[e].XmlNameSpace=t);for(let t in this.XmlTemplates)this.XmlTemplates[t].Props.forEach(function(t){if(t.ArrayData&&null==t.ArrayData.XmlNameSpace)if(t.NullableData)t.ArrayData.XmlNameSpace="http://schemas.datacontract.org/2004/07/System";else{var e=this._findNS(t);t.ArrayData.XmlNameSpace=e||"http://schemas.microsoft.com/2003/10/Serialization/Arrays"}},this);return this}_from_xmlobj(t,e,r){e=new d(e);var a=new p(this),n=r.fromTopObject(t),s=this.find(n.getTagName());if(null==s)throw new Error('XmlTemplateFactory does not contain template for "'+root_name+'"');var i=n.findNS("http://www.w3.org/2001/XMLSchema-instance");return i&&(a.XmlInstance=i),a.RootNameSpace=s.XmlNameSpace,s._from_xmlobj(n,e,a)}_to_xmlobj(e,r,a){r=new d(r);var n,s=new p(this);if(!t.IsClassInstance(e))throw new Error("XmlTemplateFactory.to_xmldom cannot determine class name from instance");n=e.constructor.name;var i=this.find(n);if(null==i)throw new Error('XmlTemplateFactory does not contain template for "'+n+'"');var o=a.makeTopObject(n);return s.RootNameSpace=i.XmlNameSpace,i.XmlNameSpace?(o.addAttr("xmlns:i","http://www.w3.org/2001/XMLSchema-instance"),o.addAttr("xmlns",i.XmlNameSpace),s.XmlInstance="i"):(o.addAttr("xmlns:xsd","http://www.w3.org/2001/XMLSchema"),o.addAttr("xmlns:xsi","http://www.w3.org/2001/XMLSchema-instance"),s.XmlInstance="xsi"),i._to_xmlobj(e,o,r,s),o.getTopObject()}from_xmldom(t,e){return this._from_xmlobj(t,e,g)}to_xmldom(t,e){return this._to_xmlobj(t,e,g)}from_xml2js(t,e){return this._from_xmlobj(t,e,S)}to_xml2js(t,e){return this._to_xmlobj(t,e,S)}};class d{constructor(e){this.XmlMode=t.xmlModes.XmlSerializer,Object.assign(this,e),void 0==this.UseNil&&this.isDC()&&(this.UseNil=!0)}isDC(){return this.XmlMode==t.xmlModes.DataContractSerializer}setDC(){this.XmlMode=t.xmlModes.DataContractSerializer}}class p{constructor(t){this.Factory=t,this.ObjPath=[],this.RootNameSpace=null,this.NS=new f}prefix(t){return this.NS.prefix(t)}saveNsState(){return this.NS.clone()}loadNsState(t){this.NS=t}setPrefix(t,e,r){null!=t&&(""==t||t==this.RootNameSpace?this.NS.Prefix="":null!=e&&(this.NS.Prefix=e))}applyNS(t,e){return null!=t&&(""==t||t==this.RootNameSpace?this.NS.Prefix="":this.NS.CurNameSpace!=t&&(++this.NS.PrefixCount,this.NS.Prefix="ns"+this.NS.PrefixCount)),this.NS.CurNameSpace=t,t}checkForNsChange(t,e){return this.NS.Prefix!=t.Prefix&&this.NS.Prefix&&e?this.NS.Prefix:null}pushPath(t,e){this.ObjPath.push(t.XmlPassthrough==e.Name?e.ClassName:e.Name)}popAll(){void 0==this.LastError&&this.ObjPath.pop()}}class f{constructor(){this.Prefix="",this.PrefixCount=0,this.CurNameSpace=null}clone(){var t=new f;return Object.assign(t,this),t}prefix(t){return this.Prefix?this.Prefix+":"+t:t}}class N{constructor(){}}function y(t){return null==t?null:t instanceof N?t.getValue():t}class g extends N{constructor(t,e){super(),this.XmlDoc=t,this.Node=e}static fromTopObject(t){return new g(t,t.documentElement)}static makeTopObject(t){var e=r();if(null==e)throw new Error("Cannot find DOMImplementatio !");try{e=e.createDocument()}catch(t){throw new Error("Cannot create XMLDocument> "+t.message)}var a=e.createElement(t);e.appendChild(a);var n=e.createProcessingInstruction("xml",'version="1.0" encoding="utf-8"');return e.insertBefore(n,e.documentElement),new g(e,a)}getTopObject(){return this.XmlDoc}getTagName(){return this.Node.tagName}makeNode(t,e){var r=this.XmlDoc.createElement(t);return void 0!=e&&(r.textContent=e),new g(this.XmlDoc,r)}addNode(t){return this.Node.appendChild(t.Node),this}addAttr(t,e){this.Node.setAttribute(t,e)}getAttr(t){if(null==this.Node||null==this.Node.getAttribute)return null;var e=this.Node.getAttribute(t);return e||void 0}findNS(t){if(null==this.Node)return null;for(let r=0;r<this.Node.attributes.length;++r){var e=this.Node.attributes[r];if(e.name.startsWith("xmlns:")&&e.value==t)return e.name.substr(6)}return null}getFirstNode(t){if(null!=this.Node)for(let e=0;e<this.Node.childNodes.length;++e)if(1==this.Node.childNodes[e].nodeType&&this.Node.childNodes[e].tagName==t)return new g(this.XmlDoc,this.Node.childNodes[e])}getNodes(t){var e=[];for(let r=0;r<this.Node.childNodes.length;++r)1==this.Node.childNodes[r].nodeType&&this.Node.childNodes[r].tagName==t&&e.push(new g(this.XmlDoc,this.Node.childNodes[r]));return e}setValue(t){return this.Node.textContent=t,this}getValue(){return null==this.Node.textContent?null:this.Node.textContent}}class S extends N{constructor(t,e){super(),this.TagName=t,this.Content=e}static fromTopObject(t){var e=Object.getOwnPropertyNames(t);if(Array.isArray(e)||(e=Object.getOwnPropertyNames(e)),e.length<1)throw new Error("Wrapper_xml2js.fromTopObject needs at least one root property");var r=e[0];return new S(r,t[r])}static makeTopObject(t){return new S(t,{})}getTopObject(){return{[this.TagName]:this.Content}}getTagName(){return this.TagName}makeNode(t,e){return new S(t,e)}addNode(t){if(null==this.Content&&(this.Content={}),!Array.isArray(this.Content[t.TagName])){if(null==t.Content)return this.Content[t.TagName]=null,this;this.Content[t.TagName]=[]}return this.Content[t.TagName].push(t.Content),this}addAttr(t,e){this.Content||(this.Content={}),this.Content.$?this.Content.$[t]=e:this.Content.$={[t]:e}}getAttr(t){return this.Content&&this.Content.$?this.Content.$[t]:void 0}findNS(t){if(this.Content&&this.Content.$){var e=Object.getOwnPropertyNames(this.Content.$);for(let r=0;r<e.length;++r)if(e[r].startsWith("xmlns:")&&this.Content.$[e[r]]==t)return e[r].substr(6)}return null}getFirstNode(t){if(null!=this.Content){var e=this.Content[t];if(Array.isArray(e)){if(e.length<1)return;e=e[0]}return void 0==e?null:new S(t,e)}}getNodes(t){if(null!=this.Content){var e=this.Content[t];return void 0==e?null:(Array.isArray(e)||(e=[e]),e.map(function(e){return new S(t,e)}))}}setValue(t){return this.Content=t,this}getValue(){return null==this.Content?null:this.Content}}window.xml_csharp_cereal=t}).call(this);