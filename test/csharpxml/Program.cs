using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Runtime.Serialization; // DataContractSerializer (which we may or may not use)

// https://github.com/GregFinzer/Compare-Net-Objects
using KellermanSoftware.CompareNetObjects;

/*
 * Quick stupid C# xml test console app for testing xml-csharp-cereal
 * It's ugly, but gets the job done.
 * Author: "That guy!" (Points behind you, then runs away while you're not looking)
 */

namespace csharpxml
{
    class Program
    {
        // some exit codes for our caller to pick up
        const int ERR_NONE = 0;
        const int ERR_GENERAL = -1;
        const int ERR_COMMANDLINE = -2;
        const int ERR_SERIALIZATION = -3;
        const int ERR_VALUEMISMATCH = -4;
        const int ERR_DIDNOTHING = -5;

        static void Main(string[] args)
        {
            string Ret;
            string cmd = "in";
            string filename = "test.xml";
            bool shouldShowHelp = false;
            int testNumber = 0;
            int subTestNumber = 0;
            List<string> extra;
            XmlTestObjectInterface TestObj = null;
            XmlTestObjectInterface TestResult = null;
            var options = new NDesk.Options.OptionSet
            {
                { "c|command=", "the command (i.e. 'out', 'in')", c => cmd=c.ToLower() },
                { "f|file=", "the file name to use", f => filename=RemoveQuotes(f) },
                { "t|test=", "the test number", (int t) => testNumber = t },
                { "s|sub=", "the test number", (int t) => subTestNumber = t },
                { "h|help", "show this message and exit", h => shouldShowHelp = (h != null) },
            };
            try { extra = options.Parse(args); }
            catch (Exception ex) { Console.WriteLine(ex.Message); End(ERR_COMMANDLINE); }

            try
            {
                Console.WriteLine("csharpxml - Test helper for xml-csharp-cereal");
                if (shouldShowHelp)
                {
                    options.WriteOptionDescriptions(Console.Out);
                    End(ERR_DIDNOTHING); // does help imply not doing anything?
                }
                Console.WriteLine(" Command: " + cmd);
                Console.WriteLine(" Test: " + testNumber.ToString() + " [" + subTestNumber.ToString() + "]");
                Console.WriteLine(" File: " + filename);
                // construct the test object for this test number
                switch (testNumber)
                {
                    case 0:
                        TestObj = (XmlTestObjectInterface)new TestClass();
                        break;
                    default:
                        Console.WriteLine("Unknown test: " + testNumber.ToString());
                        End(ERR_COMMANDLINE);
                        break;
                }
                // populate test object for this subtest
                TestObj.PopulateTestObject(subTestNumber);
                switch (cmd)
                {
                    case "in":  // read and verify the test object in xml file
                        object temp;
                        Ret = TestObj.FromXml(out temp, filename);
                        if (Ret != null) throw new ConException(ERR_SERIALIZATION, Ret);
                        Console.WriteLine("XML File Read.");
                        TestResult = temp as XmlTestObjectInterface;
                        Ret = TestResult.VerifyTestObject(TestObj);
                        if (Ret != null) throw new ConException(ERR_VALUEMISMATCH, Ret);
                        Console.WriteLine("Object Read matches Expected.");
                        break;
                    case "out": // write test object out to XML
                        Ret = TestObj.ToXml(filename);
                        if (Ret != null) throw new ConException(ERR_SERIALIZATION, Ret);
                        Console.WriteLine("XML File Written.");
                        break;
                    default: // I don't know what you want
                        Console.WriteLine("Unknown command: " + cmd);
                        End(ERR_COMMANDLINE);
                        break;
                }

                End(ERR_NONE);
            }
            catch (ConException ex)
            {
                Console.WriteLine("ERROR> " + ex.Message);
                End(ex.ExitCode);
            }
            catch (Exception ex)
            {
                // should we really be writting to Console.Error instead? Does it matter?
                //Console.Error.WriteLine("ERROR> " + ex.Message);
                Console.WriteLine("ERROR> " + ex.Message);
                End(ERR_GENERAL);
            }
        } // END MAIN

        protected static void End(int code)
        {
            Environment.Exit(code); // (put breakpoint here to keep console open during debugging)
        }

        protected static string RemoveQuotes(string v)
        {
            if (string.IsNullOrEmpty(v)) return v;
            // don't really need to check if they are leading or trailing as path should not have quotes in it at all
            return v.Replace("\"", "");
        }
    } // END CLASS: Program


    public class ConException : Exception
    {
        public int ExitCode { get; protected set; }
        public ConException(int ErrCode, string desc) : base(desc) { ExitCode = ErrCode; }
    }

    public interface XmlTestObjectInterface
    {
        string FromXml(out object obj, string FilePath); // can't have static in interface, so need to make new from existing instance
        string ToXml(string FilePath);
        void PopulateTestObject(int subtest);
        string VerifyTestObject(object expected);
    }

    [DataContract]
    public class XmlTestObject<T> : BaseXmlObject<T>, XmlTestObjectInterface where T : new()
    {
        // If you add fields or properties to the base class, make sure they are tagged [XmlIgnore] !

        public string FromXml(out object obj, string FilePath)
        {
            T newObj;
            string Ret;
            //Ret = LoadFromXml(out newObj, FilePath);
            Ret = LoadEitherFromXml(out newObj, FilePath);
            obj = newObj;
            return Ret;
        }
        public string ToXml(string FilePath)
        {
            return base.SaveEitherToXml(FilePath);
            // return base.SaveToXml(FilePath);
        }
        public virtual void PopulateTestObject(int subtest)
        {
            // do any non-default member initialization for the test?
            // do we do this on an individual basis or use reflection to automate?
            // TODO - ClassPopulator that uses reflection to populate unique non-default content into arbitrary classes
            //var pop = new ClassPopulator();
            //pop.Populate(this);
        }
        public virtual string VerifyTestObject(object expected)
        {
            // verify members are what they are supposed to be populated with?
            //return "This object's VerifyTestObject() is not setup";
            // By default use reflection, derived classes can certainly override if desired
            var config = new ComparisonConfig();
            config.MaxDifferences = 50;
            var compareLogic = new CompareLogic(config);
            var result = compareLogic.Compare(this, expected);
            if (result.AreEqual) return null;
            return result.DifferencesString;
        }
    }

} // END NAMESPACE

