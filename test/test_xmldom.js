'use strict'
/*
    This module provides the xmldom based load/save functions for testing.
*/
const fs = require('fs');
const xmldom = require('xmldom');
const xml = require('../xml-csharp-cereal');

module.exports.SaveToXml = function(obj, XmlFactory, fname, opts)
{
    // test dom implementation override for xmldom forks/clones ?
    //opts = Object.assign({}, opts, { DOMImplementation:new xmldom.DOMImplementation() });
    /* var MyDom = { createDocument: function() { return (new xmldom.DOMImplementation()).createDocument(); } }
    opts = Object.assign({}, opts, { DOMImplementation: MyDom }); */

    return new Promise((resolve,reject)=>
    {
        var xml_obj = XmlFactory.to_xmldom(obj, opts);
        var builder = new xmldom.XMLSerializer();
        var xml_data = builder.serializeToString(xml_obj);
        fs.writeFile(fname, formatXML(xml_data), 'utf8', function(err)
        {
            if(err) reject(err);
            else resolve();
        });
    });
}

module.exports.LoadFromXml = function(XmlFactory, fname, opts)
{
    return new Promise((resolve,reject)=>
    {
        var parser = new xmldom.DOMParser();
        fs.readFile(fname, 'utf8', function(err, xml_data)
        {
            if (err) reject(err);
            else
            {
                try
                {
                    var xml_obj = parser.parseFromString(xml_data, 'application/xml');
                    // note traditional XML DOMParser returns <parsererror > XML doc on error
                    var obj = XmlFactory.from_xmldom(xml_obj, opts);
                    resolve(obj);
                }
                catch(e) { reject(e); }
            }
        });
    });
}

// try to do something more readable
function formatXML(xml_str)
{
    return xml_str.split('><').join('>\n<'); // crudely add new lines
}
