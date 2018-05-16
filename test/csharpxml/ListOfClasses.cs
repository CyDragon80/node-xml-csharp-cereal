using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

/*
 * This class holds the list of test classes to use for given test numbers.
 * 
 */

namespace csharpxml
{
    public class ListOfClasses
    {
        public static XmlTestObjectInterface GetClassForTestNumber(int testNumber)
        {
            switch (testNumber)
            {
                case 0:
                    return (XmlTestObjectInterface)new Test0.TestClass();
                case 1:
                    return (XmlTestObjectInterface)new Test1.TestClass();
                case 2:
                    return (XmlTestObjectInterface)new Test2.TestClass();
                case 3:
                    return (XmlTestObjectInterface)new Test3.TestClass();
                default:
                    return null;
            }

        } // END FUNC: GetClassForTestNumber

    } // END CLASS: ListOfClasses

} // END NAMESPACE
