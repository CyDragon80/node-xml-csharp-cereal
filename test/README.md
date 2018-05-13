# TESTING node-xml-csharp-cereal

## Running Tests
For Linux, you will most likely need to install [mono-complete](http://www.mono-project.com/download/stable/#download-lin) to run the "csharpxml.exe". For Windows, you will need the appropriate NET framework installed.

> npm test

## Node.js Side

The test entry point is "test.js". It will run all test class and value set combinations listed in "list_test_classes.js". It will runs these combinations with every XML library listed in "list_xml_libs.js".

### Adding a New XML Library

 1. Create module file with expected exports. (See "test_xml2js.js" for example.)
 - SaveToXml(instance_of_obj, XmlFactory, xml_file_path)
 - LoadFromXml(XmlFactory, xml_file_path) returning resulting object
 2. Add new module to "list_xml_libs.js". (Refer to xml2js entries for example.)

### Adding New Class or Value Set

 1. Create module file that exportsGetFactory() returning XmlTemplateFactory. (See "TestClass.js" for example.)
 2. Add new module to "list_test_classes.js". (Refer to TestClass for example.)

## The "csharpxml" Console Program

The module "csharp-test.js" exports the functions necessary to run "csharpxml". The source code is in the "csharpxml" subfolder. The necessary bin/Release/csharpxml.exe and [Compare-Net-Objects DLL](https://github.com/GregFinzer/Compare-Net-Objects) is stored in the repo so you do not need to recompile unless you are adding/changing it. (It also saves time/complexity in Travis testing.) Note that the read comparison is XML versus expected, so the first value is what was read from the XML and the second is the expected value.

The main entry point is in "Program.cs". The command line takes a test number (which selects a set of classes) and a subtest number (which selects how those classes are populated). Each set of test classes is defined in its own cs file with its own namespace. Each root class must derive from XmlTestObject&lt;T> and override void PopulateTestObject(int subtest_number). Test classes are created/selected from "ListOfClasses.cs".

### Adding New Class Set

 1. Create a new cs file with a new namespace to house the new test class set.
 2. Make sure the XML root class derive from XmlTestObject and overrides PopulateTestObject.
 3. Add creation code to "ListOfClasses.cs" inside of GetClassForTestNumber.
 4. Don't forget to add the Node.js counterparts as described in the sections above.
 5. Be sure to build and check in the new bin/Release/csharpxml.exe for Travis.

### Adding New Value Set

 1. Add a new subtest number to the given class's PopulateTestObject method.
 2. Don't forget to add the Node.js counterparts as described in the sections above.
 3. Be sure to build and check in the new bin/Release/csharpxml.exe for Travis.

