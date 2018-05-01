'use strict';
/*

Provide simple functions for running external test functions.

For Linux you will most likely need to install mono-complete to run the csharpxml.exe
http://www.mono-project.com/download/stable/#download-lin

*/

const spawn = require('child_process').spawn;
const exec = require('child_process').exec;
const path = require('path');

const csharpxml_folder = path.join(__dirname,"csharpxml","bin","Release");
const csharpxml_exe = path.join(csharpxml_folder,"csharpxml.exe");

module.exports.Cmds = 
{
    InCmd: 'in',
    OutCmd: 'out'
};


module.exports.PrepAndLoad = function(test,subtest,fname)
{
    return module.exports.SaveTestXml(test,subtest,fname).then((res)=>
    {
        return module.exports.LoadTestXml(test,subtest,fname);
    });
}

module.exports.LoadTestXml = function(test,subtest,fname)
{
    return module.exports.RunCSharpTest(module.exports.Cmds.InCmd,test,subtest,fname);
}
module.exports.SaveTestXml = function(test,subtest,fname)
{
    return module.exports.RunCSharpTest(module.exports.Cmds.OutCmd,test,subtest,fname);
}

module.exports.RunCSharpTest = function(cmd,test,subtest,fname)
{
    return new Promise(function(resolve, reject)
    {
        // adapted some ideas from https://stackoverflow.com/a/15515651
        // If not on windows, run with mono
        if (process.platform=='win32') var command = spawn(csharpxml_exe, ['-c='+cmd, '-t='+test, '-s='+subtest, '-f="'+fname+'"']);
        else var command = spawn("mono", [csharpxml_exe, '-c='+cmd, '-t='+test, '-s='+subtest, '-f="'+fname+'"']);
        var result = '';
        command.stdout.on('data', function(data)
        {
            result += data.toString();
        });
        command.on('close', function(code)
        {
            //console.log(result);
            if (code != 0) reject(new Error(result));
            resolve();
        });
    });
}
