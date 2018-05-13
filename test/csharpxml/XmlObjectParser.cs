using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

using System.Xml;
using System.Xml.Serialization;
using System.IO;

using System.Runtime.Serialization; // DataContractSerializer (which is opt-in vs XmlSerializer which is opt-out)

namespace csharpxml
{
    /// <summary>
    /// Quick and dirty way to build XML serialization into objects
    /// </summary>
    /// <typeparam name="T"></typeparam>
    [DataContract]
    public abstract class BaseXmlObject<T> where T : new() // need constraints for LoadFromXmlFolder to work
    {
        public static string LoadFromXml(out T obj, string FilePath)
        {
            try
            {
                // Deserialization
                XmlSerializer s = new XmlSerializer(typeof(T));
                XmlReaderSettings rSet = new XmlReaderSettings();
                rSet.IgnoreWhitespace = false;
                using (XmlReader r = XmlReader.Create(FilePath, rSet))
                { 
                    //TextReader r = new StreamReader(FilePath);
                    obj = (T)s.Deserialize(r);
                }
            }
            catch (Exception ex)
            {
                obj = default(T);
                var msg = ex.Message;
                if (ex.InnerException != null) msg += " [" + ex.InnerException.Message + "]";
                return msg;
                //return ex.ToString();
            }
            return null;
        }
        public virtual string SaveToXml(string FilePath)
        {
            try
            {
                // Serialization
                XmlSerializer s = new XmlSerializer(typeof(T));
                using (TextWriter w = new StreamWriter(FilePath))
                    s.Serialize(w, this);
            }
            catch (Exception ex)
            {
                var msg = ex.Message;
                if (ex.InnerException != null) msg += " [" + ex.InnerException.Message + "]";
                return msg;
                //return ex.ToString();
            }
            return null;
        }
        public virtual string SaveDataContractToXml(string FilePath)
        {
            try
            {
                // Serialization
                var s = new DataContractSerializer(typeof(T));
                var settings = new XmlWriterSettings { Indent = true };
                using (var w = XmlWriter.Create(FilePath, settings))
                {
                    s.WriteObject(w, this);
                }
            }
            catch (Exception ex)
            {
                var msg = ex.Message;
                if (ex.InnerException != null) msg += " [" + ex.InnerException.Message + "]";
                return msg;
                //return ex.ToString();
            }
            return null;
        }
        public static string LoadDataContractFromXml(out T obj, string FilePath)
        {
            try
            {
                // Serialization
                var s = new DataContractSerializer(typeof(T));
                using (var w = File.OpenRead(FilePath))
                {
                    obj = (T)s.ReadObject(w);
                }
            }
            catch (Exception ex)
            {
                obj = default(T);
                var msg = ex.Message;
                if (ex.InnerException != null) msg += " [" + ex.InnerException.Message + "]";
                return msg;
                //return ex.ToString();
            }
            return null;
        }
        public static bool IsDataContract()
        {
            //var attr = Attribute.GetCustomAttribute(typeof(T), typeof(DataContractAttribute));
            //return (attr != null);
            // https://stackoverflow.com/a/1226170
            return typeof(T).IsDefined(typeof(DataContractAttribute), false); // only if top class is marked (bases are already marked just in case they need to be)
        }
        public static string LoadEitherFromXml(out T obj, string FilePath)
        {
            if (IsDataContract()) return LoadDataContractFromXml(out obj, FilePath);
            else return LoadFromXml(out obj, FilePath);
        }
        public virtual string SaveEitherToXml(string FilePath)
        {
            if (IsDataContract()) return SaveDataContractToXml(FilePath);
            else return SaveToXml(FilePath);
        }
    } // END CLASS: BaseXmlObject



    // Data Contract serialize supports Dictionary out-of-box. (But for what sub types?)
    // Does not use type tags inside key/value, but it does require namespaces.
    // Not sure if we want to get into the intricacies of the DataContract XML serialization?
    // https://theburningmonk.com/2010/05/net-tips-xml-serialize-or-deserialize-dictionary-in-csharp/
    /*[DataContract]
    public class MyClass : XmlTestObject<MyClass>
    {
        // need a parameterless constructor for serialization
        public MyClass()
        {
            MyDictionary = new Dictionary<string, string>();
            MyDictionary.Add("test1", "value1");
            MyDictionary.Add("test2", "value2");
        }
        [DataMember]
        public Dictionary<string, string> MyDictionary { get; set; }
    }*/
    /*
    <MyClass xmlns="http://schemas.datacontract.org/2004/07/csharpxml" xmlns:i="http://www.w3.org/2001/XMLSchema-instance">
	    <MyDictionary xmlns:a="http://schemas.microsoft.com/2003/10/Serialization/Arrays">
		    <a:KeyValueOfstringstring>
			    <a:Key>test1</a:Key>
			    <a:Value>value1</a:Value>
		    </a:KeyValueOfstringstring>
		    <a:KeyValueOfstringstring>
			    <a:Key>test2</a:Key>
			    <a:Value>value2</a:Value>
		    </a:KeyValueOfstringstring>
	    </MyDictionary>
    </MyClass>
    */


    // Adapted from various sources
    // https://stackoverflow.com/a/1728996
    // https://weblogs.asp.net/pwelter34/444961
    // This version includes type tags in the Key/Value tags.
    [XmlRoot("DictionaryTyped")]
    public class SerializableDictionaryTyped<TKey, TValue> : Dictionary<TKey, TValue>, IXmlSerializable
    {
        public SerializableDictionaryTyped() { }
        public SerializableDictionaryTyped(IDictionary<TKey, TValue> dictionary) : base(dictionary) { }
        public SerializableDictionaryTyped(IDictionary<TKey, TValue> dictionary, IEqualityComparer<TKey> comparer) : base(dictionary, comparer) { }
        public SerializableDictionaryTyped(IEqualityComparer<TKey> comparer) : base(comparer) { }
        public SerializableDictionaryTyped(int capacity) : base(capacity) { }
        public SerializableDictionaryTyped(int capacity, IEqualityComparer<TKey> comparer) : base(capacity, comparer) { }

        #region IXmlSerializable Members
        public System.Xml.Schema.XmlSchema GetSchema()
        {
            return null;
        }

        public void ReadXml(System.Xml.XmlReader reader)
        {
            XmlSerializer keySerializer = new XmlSerializer(typeof(TKey));
            XmlSerializer valueSerializer = new XmlSerializer(typeof(TValue));

            bool wasEmpty = reader.IsEmptyElement;
            reader.Read();

            if (wasEmpty)
                return;

            while (reader.NodeType != System.Xml.XmlNodeType.EndElement)
            {
                reader.ReadStartElement("KeyValuePair");

                reader.ReadStartElement("Key");
                TKey key = (TKey)keySerializer.Deserialize(reader);
                reader.ReadEndElement();

                reader.ReadStartElement("Value");
                TValue value = (TValue)valueSerializer.Deserialize(reader);
                reader.ReadEndElement();

                this.Add(key, value);

                reader.ReadEndElement();
                reader.MoveToContent();
            }
            reader.ReadEndElement();
        }

        public void WriteXml(System.Xml.XmlWriter writer)
        {
            XmlSerializer keySerializer = new XmlSerializer(typeof(TKey));
            XmlSerializer valueSerializer = new XmlSerializer(typeof(TValue));

            foreach (TKey key in this.Keys)
            {
                writer.WriteStartElement("KeyValuePair");

                writer.WriteStartElement("Key");
                keySerializer.Serialize(writer, key);
                writer.WriteEndElement();

                writer.WriteStartElement("Value");
                TValue value = this[key];
                valueSerializer.Serialize(writer, value);
                writer.WriteEndElement();

                writer.WriteEndElement();
            }
        }
        #endregion
    }


    // This version does not include type tags in the Key/Value tags.
    // It is closer to DataContractSerializer's format, but does not use the additional namespaces.
    [XmlRoot("Dictionary")]
    public class SerializableDictionary<TKey, TValue> : Dictionary<TKey, TValue>, IXmlSerializable
    {
        public SerializableDictionary() { }
        public SerializableDictionary(IDictionary<TKey, TValue> dictionary) : base(dictionary) { }
        public SerializableDictionary(IDictionary<TKey, TValue> dictionary, IEqualityComparer<TKey> comparer) : base(dictionary, comparer) { }
        public SerializableDictionary(IEqualityComparer<TKey> comparer) : base(comparer) { }
        public SerializableDictionary(int capacity) : base(capacity) { }
        public SerializableDictionary(int capacity, IEqualityComparer<TKey> comparer) : base(capacity, comparer) { }

        #region IXmlSerializable Members
        public System.Xml.Schema.XmlSchema GetSchema()
        {
            return null;
        }

        public void ReadXml(System.Xml.XmlReader reader)
        {
            XmlSerializer keySerializer = new XmlSerializer(typeof(TKey), new XmlRootAttribute("Key"));
            XmlSerializer valueSerializer = new XmlSerializer(typeof(TValue), new XmlRootAttribute("Value"));

            bool wasEmpty = reader.IsEmptyElement;
            reader.Read();

            if (wasEmpty)
                return;

            while (reader.NodeType != System.Xml.XmlNodeType.EndElement)
            {
                reader.ReadStartElement("KeyValuePair");

                //reader.ReadStartElement("Key");
                TKey key = (TKey)keySerializer.Deserialize(reader);
                //reader.ReadEndElement();

                //reader.ReadStartElement("Value");
                TValue value = (TValue)valueSerializer.Deserialize(reader);
                //reader.ReadEndElement();

                this.Add(key, value);

                reader.ReadEndElement();
                reader.MoveToContent();
            }
            reader.ReadEndElement();
        }

        public void WriteXml(System.Xml.XmlWriter writer)
        {
            XmlSerializer keySerializer = new XmlSerializer(typeof(TKey), new XmlRootAttribute("Key"));
            XmlSerializer valueSerializer = new XmlSerializer(typeof(TValue), new XmlRootAttribute("Value"));

            foreach (TKey key in this.Keys)
            {
                writer.WriteStartElement("KeyValuePair");

                //writer.WriteStartElement("Key");
                keySerializer.Serialize(writer, key);
                //writer.WriteEndElement();

                //writer.WriteStartElement("Value");
                TValue value = this[key];
                valueSerializer.Serialize(writer, value);
                //writer.WriteEndElement();

                writer.WriteEndElement();
            }
        }
        #endregion
    }

} // END NAMESPACE

