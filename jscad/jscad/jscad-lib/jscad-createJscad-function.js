// Create an function for processing the JSCAD script into CSG/CAG objects
//
// fullurl  - URL to original script
// script   - FULL script with all possible support routines, etc
// callback - function to call, returning results or errors
//
// This function creates an anonymous Function, which is invoked to execute the thread.
// The function executes in the GLOBAL context, so all necessary parameters are provided.
//

//const {CSG, CAG} = require('./csg.js');

var log = require('./log.js');

 module.exports = function createJscadFunction (fullurl, script, callback)
{
  log("Running in Sync Mode...");

  // determine the relative base path for include(<relativepath>)
  var relpath = fullurl;
  if (relpath.lastIndexOf('/') >= 0)
  {
    relpath = relpath.substring(0,relpath.lastIndexOf('/')+1);
  }

  var source = "// SYNC WORKER\n";
  //source += 'const {CSG, CAG} = require(`./csg.js`);'
  source += '  var relpath = "'+relpath+'";\n'
  source += '  var include = includeJscadSync;\n';
  source += '\n';
  source += includeJscadSync.toString()+'\n';
  source += '\n';
  source += script+'\n';
  source += '\n';
  source += "return main(params);\n";

  //console.log("SOURCE: "+source);

  var f = new Function("params", source);
  return f;
};

//
// THESE FUNCTIONS ARE SERIALIZED FOR INCLUSION IN THE FULL SCRIPT
//
// TODO It might be possible to cache the serialized versions
//

// Include the requested script via MemFs (if available) or HTTP Request
//
// (Note: This function is appended together with the JSCAD script)
//
function includeJscadSync(fn)
{
  // include the requested script via MemFs if possible
  if (typeof(gMemFs) == 'object')
  {
    for(var fs in gMemFs)
    {
      if (gMemFs[fs].name == fn)
      {
        eval(gMemFs[fs].source);
        return;
      }
    }
  }
  // include the requested script via webserver access
  var xhr = new XMLHttpRequest();
  var url = relpath+fn;
  if (fn.match(/^(https:|http:)/i))
  {
    url = fn;
  }
  xhr.open('GET',url,false);
  xhr.onload = function()
  {
    var src = this.responseText;
    eval(src);
  };
  xhr.onerror = function()
  {
  };
  xhr.send();
};
