// Implementation of Import Worker Thread
//
// Handle the onmessage event which starts the thread
// The "event" (message) is expected to have:
//   data - an anonymous object for passing data
//   data.url      - url of the page
//   data.filename - name of the source file
//   data.source   - contents of the source file
//
// A message is posted back to the main thread with:
//   source    - source code for the editor (See logic below)
//   converted - converted code for the processor (See logic below)
// Depending on what's being converted, the two are different or the same.
//
// Additional scripts (libraries) are imported only if necessary

module.exports = function (self)
{
self.addEventListener('message',function (e)
{
  console.log("Import-Worker has started...");

  var r = { source: "", converted: "", filename: "", baseurl: "", cache: false };

  if (e.data instanceof Object)
  {
    var data = e.data;

    if ('cache' in data)
    {
      r.cache = data.cache; // forward cache (gMemFS) controls
    }

    if ('baseurl' in data)
    {
      r.baseurl = data.baseurl;
    }

    if ('filename' in data)
    {
      r.filename = data.filename;

      if ('source' in data)
      {
        var e = data.filename.toLowerCase().match(/\.(\w+)$/i);
        e = RegExp.$1;

        switch (e)
        {
          case 'stl':
            console.log('Importing STL File...');
            importScripts(r.baseurl+'libCSG.js', r.baseurl+'libOpenscad.js');
            r.source = r.converted = parseSTL(data.source,data.filename);
            break;

          case 'jscad':
            console.log("Importing JSCAD File...");
            r.source = r.converted = data.source;
            break;

          default:
            r.source = r.converted = '// Invalid file type in conversion ('+e+')';
            break;
        }
      }
    }
  }
  self.postMessage(r);
});
}
