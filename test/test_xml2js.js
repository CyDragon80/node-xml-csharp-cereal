'use strict'
/*
    This module provides the xml2js based load/save functions for testing.
*/
const fs = require('fs');
const xml2js = require('xml2js');
const xml = require('../xml-csharp-cereal');

module.exports.SaveToXml = function(obj, XmlFactory, fname)
{
    return new Promise((resolve,reject)=>
    {
        var js_obj = XmlFactory.to_xml2js(obj);
        var builder = new xml2js.Builder();
        var xml = builder.buildObject(js_obj);
        fs.writeFile(fname, xml, function(err)
        {
            if(err) reject(err);
            else resolve();
        });
    });
}

module.exports.LoadFromXml = function(XmlFactory, fname)
{
    return new Promise((resolve,reject)=>
    {
        var parser = new xml2js.Parser();
        fs.readFile(fname, function(err, data)
        {
            if (err) reject(err);
            else parser.parseString(data, function (err, result)
            {
                if (err) reject(err);
                else
                {
                    var obj = null;
                    try
                    {
                        obj = XmlFactory.from_xml2js(result);
                        resolve(obj);
                    }
                    catch(e) { reject(e); }
                }
            });
        });
    });
}
