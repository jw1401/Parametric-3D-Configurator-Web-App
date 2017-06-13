if(typeof module == 'undefined')
{
  console.log("in lib mode...");
  var require = function(){};
}

var log = require('./log.js');
var AlertUserOfUncaughtExceptions = require('./errorHandler');
var createJscadWorker = require ('./jscad-createJscad-worker.js');
var createJscadFunction = require('./jscad-createJscad-function.js');
var Viewer = require ('./jscad-Viewer');
var {getParameterDefinitionsFromScript , getParamValues} = require ('./Parameters.js');
var {isChrome, isSafari, getWindowURL, textToBlobUrl, revokeBlobUrl} = require ('./utils.js');
var {createControl, createChoiceControl, createGroupControl} = require ('./Controls.js');
var {convertObjectsToBlob, supportedFormatsForCurrentObjects} = require ('./Files.js')
var work = require('webworkify');


/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//JsCadProcessor
//
function Processor(containerdiv, viewerOptions, onchange)
{
  console.log("Processor started...");
  AlertUserOfUncaughtExceptions();

  //pass in div which contains viewerContext
  this.containerdiv = containerdiv;

  //initialize Options and pass in options if available or generate empty options Object
  this.viewerOptions = viewerOptions = viewerOptions || {};

  //checks if options passed in by Constructor or not, if not then asign standard option
  // Draw black triangle lines ("wireframe")
  this.viewerOptions.drawLines = !!this.cleanOption(viewerOptions.drawLines, false);
  // Draw surfaces
  this.viewerOptions.drawFaces = !!this.cleanOption(viewerOptions.drawFaces, true);
  // verbose output
  this.viewerOptions.verbose = !!this.cleanOption(viewerOptions.verbose, true);

  this.viewerdiv = null;
  this.viewer = null;

  //sets the viewer size; if no viewerOptions are assigned the default size applies
  this.viewerSize =
  {
    widthDefault: "800px",
    heightDefault: "600px",
    width: this.viewerOptions.viewerwidth,
    height: this.viewerOptions.viewerheight,
    heightratio: this.viewerOptions.viewerheightratio
  };

  this.hasValidCurrentObject = false;
  this.hasOutputFile = false;
  this.worker = null;
  this.paramDefinitions = [];
  this.paramControls = [];
  this.script = null;
  this.hasError = false;
  this.formats = null;

  // the default options for processing
  this.processOpts =
  {
    libraries: ['libCSG.js','libCSGExporter.js','libOpenscad.js'],
    openJsCadPath: 'jscad/Libraries/',
    imagePath: 'jscad/imgs/',
    useAsync: true,
    useSync:  true,
  };

  // callbacks
  this.ondownload = null; // function(Processor) for callback

  this.currentObjects = [];  // list of objects returned from rebuildObject*
  this.viewedObject = null;  // the object being rendered
  this.currentFormat = "stla";

  this.baseurl = document.location.href;
  this.baseurl = this.baseurl.replace(/#.*$/,''); // remove remote URL
  this.baseurl = this.baseurl.replace(/\?.*$/,''); // remove parameters

  if (this.baseurl.lastIndexOf('/') != (this.baseurl.length-1))
  {
    this.baseurl = this.baseurl.substring(0,this.baseurl.lastIndexOf('/')+1);
  }

  // state of the processor
  // 0 - initialized - no viewer, no parameters, etc
  // 1 - processing  - processing JSCAD script
  // 2 - complete    - completed processing
  // 3 - incomplete  - incompleted due to errors in processing

  this.state = 0;

  this.readyStr = "Ready <img id=busy src='" + this.processOpts.imagePath + "ready.png'>";
  this.abortStr = "Aborted <img id=busy src='" + this.processOpts.imagePath + "aborted.png'>";
  this.busyStr  = "Rendering. Please wait <img id=busy src='" + this.processOpts.imagePath + "busy.gif'>";

  this.createElements();
};

// makes Objects ready to display with csg fixTJunctions
//
Processor.convertToSolid = function(objs)
{

  if (objs.length === undefined)
  {
    if ((objs instanceof CAG) || (objs instanceof CSG))
    {
      var obj = objs;
      objs = [obj];
    }
    else
    {
      throw new Error("Cannot convert object ("+ typeof(objs) +") to solid");
    }
  }

  var solid = null;

  for(var i=0; i<objs.length; i++)
  {
    var obj = objs[i];

    if (obj instanceof CAG)
    {
      // convert CAG to a thin solid CSG
      obj = obj.extrude({offset: [0,0,0.1]});
    }

    if (solid !== null)
    {
      solid = solid.unionForNonIntersecting(obj);
    }
    else
    {
      solid = obj;
    }
  }
  return solid;
};

// Create an worker (thread) for converting/importing various formats to JSCAD
// See jscad-import-worker.js for the conversion process
//
Processor.createImportWorker = function(gProcessor)
{
  var w = work(require('./jscad-import-worker.js'));
  w.onmessage = function(e)
  {
      if (e.data instanceof Object)
      {
        var data = e.data;
        if ('filename' in data && 'converted' in data)
        {
          if ('cache' in data && data.cache == true){}
          // - set the converted source into the processor (viewer)
          gProcessor.setJsCad(data.converted, data.filename);
          gProcessor.viewer.handleResize();
        }
      }
  };
  return w;
};

// Most functions are in here
//
Processor.prototype =
{
    //checks if options are available, if not then returns the option assigned in the function call
    //
    cleanOption: function(option, deflt)
    {
        return typeof option != "undefined" ? option : deflt;
    },

    // draw options can be toggled from code or UI, its done here
    // pass "faces" or "lines"; viewer calls means JsCadViewer calls
    //
    toggleDrawOption: function(str)
    {
        if (str == 'faces' || str == 'lines')
        {
            var newState = !this.viewer.drawOptions[str];//inverses bool
            this.viewer.drawOptions[str] = newState;
            this.viewer.applyDrawOptions(); // calls the JsCadViewer.applyDrawOptions function
            return newState;
        }
    },

    //is called from OpenJsCad.processor
    //
    //this creates
    //
    //    --viewerdiv
    //    --instances the OpenJsCadViewer which can be referenced by this.viewer in here
    //    --updatediv
    //    --optionsdiv
    //    --parametersdiv
    //    --ErrorDiv
    //
    createElements: function()
    {
        var that = this;   // for event handlers

        // removes all childs; containerdiv is the #viewerContext
        while(this.containerdiv.children.length > 0)
        {
            this.containerdiv.removeChild(this.containerdiv.firstChild);
        }

        // creates the viewerDiv
        var viewerdiv = document.createElement("div");
        viewerdiv.className = "viewer";
        viewerdiv.style.width = '100%';
        viewerdiv.style.height = '100%';
        this.containerdiv.appendChild(viewerdiv);


        // creates the Viewer and is assigned to viewerdiv
        try
        {
            this.viewer = new Viewer(viewerdiv, this.viewerSize, this.viewerOptions);
        }
        catch(e)
        {
            viewerdiv.innerHTML = "<b><br><br>Error: " + e.toString() + "</b><br><br>A browser with support for WebGL is required";
        }


        // creates the ErrorDiv
        this.errordiv = document.querySelector("div#errordiv");
        if (!this.errordiv)
        {
            this.errordiv = document.createElement("div");
            this.errordiv.id = 'errordiv';
            this.errordiv.style="margin-top:5px";
            this.containerdiv.parentElement.appendChild(this.errordiv);
        }
        this.errorpre = document.createElement("pre");
        this.errordiv.appendChild(this.errorpre);


        // creates the optionsdiv
        this.optionsdiv = document.querySelector("#optionsdiv");

        this.optionsdiv.innerHTML= '<div class="drodown" style="float:left">'+
                                    '<button class="btn btn-secondary btn-viewer dropdown-toggle" type="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">'+
                                    '<i class="fa fa-cog" aria-hidden="true"></i></button>'+
                                      '<ul class="dropdown-menu">'+
                                        '<li><a class="dropdown-item" id="toggleLines" >Toggle Lines</a></li>'+
                                        '<li><a class="dropdown-item" id="toggleFaces" >Toggle Faces</a></li>'+
                                        '<li><a class="dropdown-item" id="showToolbar" >Show Info</a></li>'+
                                      '</ul>'+
                                    '</div>'+

                                    '<input  id ="instantUpdate" type="checkbox" >'+

                                    '<button style="float:left; " class="btn  btn-outline-primary btn-viewer" id="update">Update</button>'+
                                    '<button style="float:left; " class="btn  btn-outline-danger btn-viewer" id="abort">Abort</button>';

                                    $('#toggleLines').on("click", function()
                                    {
                                      console.log("toggle-lines");
                                      that.toggleDrawOption("lines");
                                    });

                                    $('#toggleFaces').on("click", function()
                                    {
                                      //console.log("toggleFaces");
                                      that.toggleDrawOption('faces');
                                    });

                                    $('#showToolbar').on("click",function()
                                    {
                                      //console.log($('#updatediv').is(':visible'));
                                      if($('.draggable-status-div').is(':visible'))
                                      {
                                        $('.draggable-status-div').hide();
                                      }
                                      else $('.draggable-status-div').show();
                                    });

        this.abortbutton = document.querySelector("#abort");
        this.abortbutton.onclick = function(e) {that.abort();};

        this.updateButton = document.querySelector("#update");
        this.updateButton.onclick = function(e) {that.rebuildSolid();};

        this.instantUpdateCheckbox = document.querySelector("#instantUpdate");
        this.instantUpdateCheckbox.checked = true;
        //this.instantUpdateCheckbox.style.display="none";

        this.downloadbuttons = document.createElement("div");
        this.downloadbuttons.id = 'downloadbuttons';
        this.optionsdiv.appendChild(this.downloadbuttons);

        this.downloadOutputFileLink = document.createElement("a");
        this.downloadOutputFileLink.className = "btn btn-warning"; // so we can css it
        this.optionsdiv.appendChild(this.downloadOutputFileLink);


        // creates the ParametersDiv
        this.parametersdiv = document.querySelector("#parametersdiv");

        if (!this.parametersdiv)
        {
            this.parametersdiv = document.createElement("div");
            this.parametersdiv.id = "parametersdiv";
            this.containerdiv.parentElement.appendChild(this.parametersdiv);
        }

        // create ParametersTable which is filled by createParamControls
        this.parameterstable = document.createElement("table");
        this.parameterstable.className = "parameterstable";
        this.parametersdiv.appendChild(this.parameterstable);


        // creates the StatusDiv
        this.statusspan = document.createElement("div");
        this.statusspan.id = 'statusspan';

        this.statusdiv = document.querySelector("#statusdiv");
        this.statusdiv.appendChild(this.statusspan);


        // shows the items depending on cases
        this.enableItems();

        //clears the viewer
        this.clearViewer();
    },

    // sets the current Objects to display, updates the view, the Formats and the
    // Update Pipeline is started here!!!!
    //
    setCurrentObjects: function(objs)
    {
        if (!(length in objs))
        {
            objs = [objs]; // create a list
        }
        this.currentObjects = objs;  // list of CAG or CSG objects
        this.updateView();
        this.updateFormats();
    },

    // updates the view based on the selected objects
    //
    updateView: function()
    {
        //get all objects
        var objs = this.currentObjects;

        // enforce CSG to display ==> important function convertToSolid()
        //
        this.viewedObject = Processor.convertToSolid(objs);

        //determines if this is first rendering; if true the reset zoom
        this.isFirstRender_ = typeof this.isFirstRender_ == 'undefined' ? true : false;

        // (re-)set zoom only on very first rendering action
        this.viewer.setCsg(this.viewedObject, this.isFirstRender_);
        this.hasValidCurrentObject = true;

        if(this.viewer)
        {
            //sets the viewer and displays objects
            this.viewer.setCsg(this.viewedObject);
        }
    },

    // updates the Download Buttons (STL, STL BIN) based on supproted formats
    //
    updateFormats: function()
    {
        while (this.downloadbuttons.hasChildNodes())
        {
            this.downloadbuttons.removeChild(this.downloadbuttons.lastChild);
        }

        var that = this;

        this.formatInfo("stla"); // make sure the formats are initialized
        var formats = supportedFormatsForCurrentObjects(this.currentObjects, this.formats);

        formats.forEach(function(format)
        {
            var info = that.formatInfo(format);
            var button = document.createElement("button");

            button.setAttribute("value",format);
            button.innerHTML = info.displayName;
            button.className="btn btn-primary btn-viewer";

            button.onclick = function(e)
            {
              //Format is set here for download
              that.currentFormat = button.value.toString();
              //console.log(that.currentFormat);
              that.generateOutputFile();
            };
            this.downloadbuttons.appendChild(button);
        });
    },

    // clears the Viewer and the Output File
    //
    clearViewer: function()
    {
        this.clearOutputFile();

        if (this.viewedObject)
        {
            this.viewer.clear();
            this.viewedObject = null;
        }

        this.enableItems();
    },

    // aborts the build process and rendering
    //
    abort: function()
    {
        // abort if state is processing
        if(this.state == 1)
        {
            this.setStatus(this.abortStr);
            this.worker.terminate();
            this.state = 3; // incomplete
            this.enableItems();
        }
    },

    // controls the visibility of the elemnts created by createElements()
    //
    enableItems: function()
    {
        this.abortbutton.style.display = (this.state == 1) ? "inline-block":"none";
        this.downloadOutputFileLink.style.display = this.hasOutputFile? "none":"none";
        this.parametersdiv.style.display = (this.paramControls.length > 0)? "inline-block":"none";     // was 'block'
        this.errordiv.style.display = this.hasError? "block":"none";
        this.optionsdiv.style.display = this.hasError? "none":"block";
    },

    // adds libraries to this.opts Object
    //
    addLibrary: function(lib)
    {
        this.processOpts['libraries'].push(lib);
    },

    // set Path for libraries
    //
    setOpenJsCadPath: function(path)
    {
        this.processOpts['openJsCadPath'] = path;
    },

    // set image path externaly
    //
    setImagePath: function(path)
    {
      this.processOpts['imagePath'] = path;
      this.readyStr = "Ready <img id=busy src='" + this.processOpts.imagePath + "ready.png'>";
      this.abortStr = "Aborted <img id=busy src='" + this.processOpts.imagePath + "aborted.png'>";
      this.busyStr  = "Rendering. Please wait <img id=busy src='" + this.processOpts.imagePath + "busy.gif'>";
    },

    // sets the error message in the errordiv
    //
    setError: function(txt)
    {
        this.hasError = (txt != "");
        this.errorpre.textContent = txt;
        this.enableItems();
    },

    //just sets the Status in the statusspan in statusdiv and logs via OpenJsCad.log
    //
    setStatus: function(txt)
    {
        if(typeof document !== 'undefined')
        {
            this.statusspan.innerHTML = txt;
        }
        else
        {
            log(txt);
        }
    },

    // returns the current format
    //
    selectedFormat: function()
    {
        //log('Current Format in selectedFormat ' + this.currentFormat)
        return this.currentFormat
    },

    // returns the current formatInfo
    //
    selectedFormatInfo: function()
    {
        return this.formatInfo(this.selectedFormat());
    },


    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //Setting up the Model and the Parameters starts here
    //
    // script: javascript code
    // filename: optional, the name of the .jscad file
    //

    // this is the initial entry point triggerd by main.js
    //
    setJsCad: function(script, filename)
    {
        //check if file otherwise set to openjscad.jscad
        if(!filename) filename = "openjscad.jscad";

        //init everything needed
        this.abort();
        this.clearViewer();
        this.paramDefinitions = [];
        this.paramControls = [];
        this.script = null;
        this.setError("");
        var scripthaserrors = false;

        try
        {
            //get Parameters Definition in jscad file
            this.paramDefinitions = getParameterDefinitionsFromScript(script);
            //create the parameter Controls out of params[] array which is returned by getParameterDefinitionsFromScript() function
            this.createParameterControls();
        }
        catch(e)
        {
            this.setError(e.toString());
            this.setStatus("Error.");
            scripthaserrors = true;
        }

        if(!scripthaserrors)
        {
            // if everithing OK call function rebuildSolid()
            this.script = script;
            this.filename = filename;
            this.rebuildSolid();
        }
        else
        {
            this.enableItems();
        }
    },

    // rebuild Solid is triggered by setJsCad()
    // it also decides on bool if rebuild should be async or sync as entered in options
    // rebuild solid is called every time a parameter changes and a update is forced
    //
    rebuildSolid: function()
    {
        // clear previous solid and settings
        this.abort();
        this.setError("");
        this.clearViewer();
        this.enableItems();
        this.setStatus(this.busyStr);

        // rebuild the solid Async
        if (this.processOpts.useAsync)
        {
            try
            {
                this.rebuildSolidAsync();
                return;
            }
            catch(err)
            {
                console.log(err)
                if (! this.processOpts.useSync)
                {
                    var errtxt = err.toString();
                    if(err.stack) {errtxt += '\nStack trace:\n'+err.stack;}
                    this.setError(errtxt);
                    this.setStatus("Error ");
                    this.state = 3; // incomplete
                    this.enableItems();
                }
            }
        }
        //rebuild the solid Sync
        if (this.processOpts.useSync)
        {
            this.rebuildSolidSync();
        }
    },

    // starts an worker Thread an rbuilds solid Asnyc
    //
    rebuildSolidAsync: function()
    {
        //get all Parameter Values stored in parameters Object with names from jsCad File
        var parameters = getParamValues(this.paramControls);//console.log(parameters)

        //checks if multithreading worker is supported
        if(!window.Worker) throw new Error("Worker threads are unsupported.");

        // create the worker
        var that = this;
        that.state = 1; // processing
        that.worker = createJscadWorker( this.baseurl + this.filename, this.script,
            // handle the results
            function(err, objs)
            {
              that.worker = null;

              if(err)
              {
                that.setError(err);
                that.setStatus("Error ");
                that.state = 3; // incomplete
              }
              else
              {
                that.setCurrentObjects(objs);
                that.setStatus(that.readyStr);
                that.state = 2; // complete
              }

              that.enableItems();
            });

        // pass the libraries to the worker for import
        var libraries = this.processOpts.libraries.map( function(l) {return this.processOpts.openJsCadPath + l;}, this); //this.baseurl +

        // start the worker
        that.worker.postMessage({cmd: "render", parameters: parameters, libraries: libraries});
        that.enableItems();
    },

    // rebuilds solid sync; everything in browser window tab is blocking until process finished
    //
    rebuildSolidSync: function()
    {
        var parameters = getParamValues(this.paramControls);
        try
        {
            this.state = 1; // processing

            // calls jscad-function.js createJscadFunction() ==> returns the function with jsCad Script
            var func = createJscadFunction(this.baseurl+this.filename, this.script);
            var objs = func(parameters);
            this.setCurrentObjects(objs);
            this.setStatus(this.readyStr);
            this.state = 2; // complete
        }
        catch(err)
        {
            var errtxt = err.toString();
            if(err.stack) { errtxt += '\nStack trace:\n'+err.stack;}
            this.setError(errtxt);
            this.setStatus("Error ");
            this.state = 3; // incomplete
        }
        this.enableItems();
    },




    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //File Generation and download happen here
    //
    //

    // clears the Output File
    //
    clearOutputFile: function()
    {
        if(this.hasOutputFile)
        {
            this.hasOutputFile = false;

            if(this.outputFileDirEntry)
            {
                this.outputFileDirEntry.removeRecursively(function(){});
                this.outputFileDirEntry=null;
            }

            if(this.outputFileBlobUrl)
            {
                revokeBlobUrl(this.outputFileBlobUrl);
                this.outputFileBlobUrl = null;
            }

            this.enableItems();
        }
    },

    // entry Point for File Generation that can be downloaded
    // is called by the clicked Download Button
    //
    generateOutputFile: function()
    {
        this.clearOutputFile();

        if(this.viewedObject)
        {
            try
            {
                this.generateOutputFileBlobUrl();
            }
            catch(e)
            {
                log("generateOutputFile Error: " +e);
            }

            if(this.ondownload) this.ondownload(this);
        }
    },

    // hold all he Format Infos
    //
    formatInfo: function(format)
    {
        if ( this.formats === null )
        {
          this.formats =
            {
                stla:  { displayName: "STL", extension: "stl", mimetype: "application/sla", convertCSG: true, convertCAG: false },
                stlb:  { displayName: "STL BIN", extension: "stl", mimetype: "application/sla", convertCSG: true, convertCAG: false },
            };
        }
        return this.formats[format];
    },

    // File is prepared for downlaod via URI
    //
    generateOutputFileBlobUrl: function()
    {
        var fileName = "forYou.";

        if (isSafari())
        {
            console.log("Trying download via DATA URI in Safari");
            // convert BLOB to DATA URI
            var blob = convertObjectsToBlob(this.currentObjects, this.selectedFormat(), this.formatInfo(this.selectedFormat()));
            var that = this;
            var reader = new FileReader();
            reader.onloadend = function()
            {
              if (reader.result)
              {
                that.hasOutputFile = true;
                that.downloadOutputFileLink.href = reader.result;
                var ext = that.selectedFormatInfo().extension;
                that.downloadOutputFileLink.setAttribute("download",fileName + ext);
                that.downloadOutputFileLink.setAttribute("target", "_blank");
                that.enableItems();
                that.downloadOutputFileLink.click();
              }
            };
            reader.readAsDataURL(blob);
        }
        else
        {
          console.log("Trying download via BLOB URL for other Browsers");
          // convert BLOB to BLOB URL (HTML5 Standard)
          var blob = convertObjectsToBlob(this.currentObjects, this.selectedFormat(), this.formatInfo(this.selectedFormat()));
          var windowURL=getWindowURL();
          this.outputFileBlobUrl = windowURL.createObjectURL(blob);
          if(!this.outputFileBlobUrl) throw new Error("createObjectURL() failed");
          this.hasOutputFile = true;
          this.downloadOutputFileLink.href = this.outputFileBlobUrl;
          var ext = this.selectedFormatInfo().extension;
          this.downloadOutputFileLink.setAttribute("download", fileName + ext);
          this.enableItems();
          this.downloadOutputFileLink.click();
        }
    },



    /////////////////////////////////////////////////////////////////////////////7/////////////////////////////////////////
    // Creates the Parameter Controls for parametersdiv
    //
    createParameterControls: function()
    {
        this.parameterstable.innerHTML = "";
        this.paramControls = [];

        for(var i = 0; i < this.paramDefinitions.length; i++)
        {
            var paramdef = this.paramDefinitions[i];
            paramdef.index = i+1;

            var control = null;
            var type = paramdef.type.toLowerCase();

            switch (type)
            {
                case 'choice':
                    control = createChoiceControl(paramdef);
                    break;

                case 'group':
                    control = createGroupControl(paramdef);
                    break;

                default:
                    control = createControl(paramdef);
                    break;
            }

            // add the appropriate element to the table
            var tr = document.createElement("tr");

            if(type == "group")
            {
                var th = document.createElement("th");
                if('className' in control)
                {
                    th.className = control.className;
                    th.colSpan = "2";
                }
                th.innerHTML = control.text;
                tr.appendChild(th);
            }
            else
            {
                // implementing instantUpdate
                var that = this;
                control.onchange = function(e)
                {
                    var l = e.currentTarget.nextElementSibling;

                    if(l !== null && l.nodeName == "LABEL")
                    {
                        l.innerHTML = e.currentTarget.value;
                    }

                    if(document.getElementById("instantUpdate").checked==true)
                    {
                        that.rebuildSolid();
                    }
                };

                this.paramControls.push(control);

                var td = document.createElement("td");
                var label = paramdef.name + ":";

                if('caption' in paramdef)
                {
                    label = paramdef.caption;
                    td.className = 'caption';
                }

                td.innerHTML = label;
                tr.appendChild(td);
                td = document.createElement("td");
                td.appendChild(control);

                if("label" in control)
                {
                    td.appendChild(control.label);
                }
                tr.appendChild(td);
            }
            this.parameterstable.appendChild(tr);
        }
    },

}//End of Module

if(typeof module !== 'undefined')
{
   module.exports = Processor;
}
