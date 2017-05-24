var gProcessor = null;        // required by OpenJScad.org

var gComponents = [ { name:'Box', file: './examples/box.jscad' },
                    { name:'Frog', file: './examples/frog-OwenCollins.stl' },
                    { name:'Hook', file: './examples/s-hook.jscad' },
                    { name:'Gear', file: './examples/gears.jscad'},
                    { name:'Test', file: './examples/Test.jscad'},
                  ];

var hash="";

function init()
{
      gProcessor = new Processor(document.getElementById("viewerContext"),
                                           {
                                                viewerwidth: '100%',
                                                viewerheight: '100%',
                                                drawLines: false,
                                                drawFaces: true,
                                            });

      loadJSCAD(0);

      resize();
      $(window).resize(function(){resize();});

      $(window).on("hashchange", function(){
        hash = location.hash.substr(1);
        //console.log(hash);
        var component = gComponents.findIndex(findComponent);
        //console.log(component);
        loadJSCAD(component);
      });
}

function findComponent(component,hash)
{
  return component.name === window.location.hash.substr(1);
}

function loadJSCAD(choice)
{
      var filepath = gComponents[choice].file;
      var xhr = new XMLHttpRequest();
      xhr.open("GET", filepath, true);

      gProcessor.setStatus("Loading "+filepath+" <img id=busy src='jscad/imgs/busy.gif'>");

      xhr.overrideMimeType("text/plain; charset=x-user-defined");

      xhr.onload = function()
      {
        var source = this.responseText;

        if(filepath.match(/\.jscad$/i)||filepath.match(/\.js$/i))
        {
          gProcessor.setOpenJsCadPath(gProcessor.baseurl+'jscad/libraries/');// set for library path
          gProcessor.setStatus("Processing "+filepath+" <img id=busy src='jscad/imgs/busy.gif'>");
          gProcessor.setJsCad(source,filepath);
        }
        else
        {
          var worker = Processor.createImportWorker(gProcessor);

          gProcessor.setStatus("Converting "+filepath+" <img id=busy src='jscad/imgs/busy.gif'>");
          var u = gProcessor.baseurl +'jscad/libraries/';

          //note: cache: false is set to allow evaluation of 'include' statements
          worker.postMessage({baseurl: u, source: source, filename: filepath, cache: false});
        }

      }
      xhr.send();
}

function resize()
{
  var height = $('#columnBig').height();
  $('#columnSmall').height(height);
}

$(document).ready(function() {
  console.log("Document loaded starting Jscad now...");
  init()
});
