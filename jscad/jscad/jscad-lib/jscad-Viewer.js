// Viewer with threeCSG bridge
//

var THREE = require("three-js")();//(["OrbitControls, CanvasRenderer"]);
var OrbitControls = require('three-orbit-controls')(THREE);
const threeCSG =require ('./three-csg-bridge.js')

//OpenJsCadViewer Constructor (Beinhaltenden containerElm, Size, options)
function Viewer(containerElm, size, options)
{
    // config stuff fg and bg colors, axes and grid
    var defaultBgColor = [1, 1, 1];
    var defaultMeshColor = [1, 0, 1];
    var drawAxes = true;
    var axLength = 50;
    var gridLength = 100;

    this.perspective = 45; // in degrees

    //options from openjscad.processor are passed in
    this.drawOptions =
        {
            lines: options.drawLines,   // Draw black triangle lines ("wireframe")
            faces: options.drawFaces    // Draw surfaces
        };

    // end config stuff

    //the size from construcotr is passed in which is defined in openjscad.processor
    this.size = size;
    this.defaultColor_ = options.color || defaultMeshColor;

    // default is opaque if not defined otherwise
    if (this.defaultColor_.length == 3)
    {
      this.defaultColor_.push(1);
    }

    this.bgColor_ = new THREE.Color();
    this.bgColor_.setRGB.apply(this.bgColor_, options.bgColor || defaultBgColor);

    // the elm to contain the canvas
    this.containerElm_ = containerElm;

    this.createScene(drawAxes, axLength, gridLength);
    this.createCamera();

    //checks if size Params are passed in, othwerwise asigns default width and default height defined in the openjscad.processor constructor
    // also decides if it is dynamic resizeable and attaches Eventlistener for handle resize
    this.parseSizeParams();

    options.noWebGL=false; //force to use WebGl
    // createRenderer will also call render
    this.createRenderer(options.noWebGL);
    this.animate();
};

Viewer.prototype =
{
    // adds axes too
    createScene: function(drawAxes, axLen, gridLength)
    {
      var scene = new THREE.Scene();
      this.scene_ = scene;

      if (drawAxes)
      {
        this.drawAxes(axLen,gridLength);
      }
    },

    createCamera: function()
    {
      var light = new THREE.PointLight();
      light.position.set(0, 0, 0);

      // aspect ration changes later - just a placeholder
      var camera = new THREE.PerspectiveCamera(this.perspective, 1/1, 0.01, 1000000);
      this.camera_ = camera;

      camera.add(light);
      camera.up.set(0, 0, 1);
      this.scene_.add(camera);
    },

    createControls: function(canvas)
    {
      // controls. just change this line (and script include) to other threejs controls if desired
      var controls = new OrbitControls(this.camera_, canvas);
      this.controls_ = controls;

      controls.enableKeys = true;
      controls.zoomSpeed = 0.5;
      controls.enablePan = false;
      controls.target = new THREE.Vector3(0, 0, 0);
      //controls.minPolarAngle = 0;
      //controls.maxPolarAngle = Math.PI;
      //controls.autoRotate = true;
      controls.autoRotateSpeed = 1;

      controls.addEventListener( 'change', this.render.bind(this));
    },

    webGLAvailable: function()
    {
        try
        {
            var canvas = document.createElement("canvas");
            return !! (window.WebGLRenderingContext &&(canvas.getContext("webgl") ||canvas.getContext("experimental-webgl")));
        }
        catch(e)
        {
            return false;
        }
    },

    createRenderer: function(bool_noWebGL)
    {
      var Renderer = this.webGLAvailable() && !bool_noWebGL ? THREE.WebGLRenderer : null; //THREE.CanvasRenderer;

      // we're creating new canvas on switching renderer, as same
      // canvas doesn't tolerate moving from webgl to canvasrenderer
      var renderer = new Renderer({precision: 'highp', antialias: true, alpha:true});
      this.renderer_ = renderer;

      if (this.canvas)
      {
        this.canvas.remove();
      }
      this.canvas = renderer.domElement;
      this.containerElm_.appendChild(this.canvas);

      //renderer.setClearColor(this.bgColor_);

      // and add controls
      this.createControls(renderer.domElement);

      // if coming in from contextrestore, enable rendering here
      this.pauseRender_ = false;
      this.handleResize();

      // handling context lost
      var this_ = this;

      this.canvas.addEventListener("webglcontextlost", function(e) {
          e.preventDefault();
          this_.cancelAnimate();
      }, false);

      this.canvas.addEventListener("webglcontextrestored", function(e) {
        this_.createRenderer(true);
        this_.animate();
        }, false);
    },

    render: function()
    {
      if (!this.pauseRender_)
      {
        this.renderer_.render(this.scene_, this.camera_);
      }
    },

    animate: function()
    {
        this.requestID_ = requestAnimationFrame(this.animate.bind(this));
        this.controls_.update();
    },

    cancelAnimate: function()
    {
        this.pauseRender_ = true;
        cancelAnimationFrame(this.requestID_);
    },

    drawAxes: function(axLen,gridLength) // draws grid and axes
    {
        axLen = axLen || 1000;
        gridLength = gridLength || 100;

        var size = gridLength;
        var divisions = 20;

        var gridXY = new THREE.GridHelper( size, divisions);
        gridXY.rotation.x = Math.PI/2;
        //gridXY.position.set(50,50,0);
        this.scene_.add( gridXY );

        //axes
        var axes = new THREE.AxisHelper(axLen);
        this.scene_.add(axes);
    },

    setCsg: function(csg, resetZoom)
    {
        this.clear();
        var res = threeCSG.fromCSG(csg, this.defaultColor_);

        var colorMeshes = [].concat(res.colorMesh)
          .map(function(mesh) {
            mesh.userData = {faces: true};
            return mesh;
        });

        var wireMesh = res.wireframe;
        wireMesh.userData = {lines: true};

        this.scene_.add.apply(this.scene_, colorMeshes);
        this.scene_.add(wireMesh);

        resetZoom && this.resetZoom(res.boundLen);
        this.applyDrawOptions();
    },

    applyDrawOptions: function()
    {
        this.getUserMeshes('faces').forEach(function(faceMesh) {
          faceMesh.visible = !!this.drawOptions.faces;
        }, this);

        this.getUserMeshes('lines').forEach(function(lineMesh) {
          lineMesh.visible = !! this.drawOptions.lines;
        }, this);

        this.render();
    },

    //clears or removes the scene in THREEJS
    //
    clear: function()
    {
        this.scene_.remove.apply(this.scene_, this.getUserMeshes());
    },

    // gets the meshes created by setCsg
    getUserMeshes: function(str)
    {
        return this.scene_.children.filter(function(ch) {
          if (str) {
            return ch.userData[str];
          } else {
            return ch.userData.lines || ch.userData.faces;
          }
        });
    },

    resetZoom: function(r)
    {
        if (!r)
        {
          // empty object - any default zoom
          r = 10;
        }

        var d = r / Math.tan(this.perspective * Math.PI / 180);

        // play here for different start zoom
        this.camera_.position.set(d*2, d*2, d);
        this.camera_.zoom = 1;
        this.camera_.lookAt(this.scene_.position);
        this.camera_.updateProjectionMatrix();
    },


    //looks if dynamic resize is needed, depends on size Params eg % // binds resize listener
    //
    parseSizeParams: function()
    {
        // essentially, allow all relative + px. Not cm and such.
        var winResizeUnits = ['%', 'vh', 'vw', 'vmax', 'vmin'];
        var width, height;

        //assigns widthDefault and heightDefault from openjscad.processor constructor if needed
        if (!this.size.width){this.size.width = this.size.widthDefault;}
        if (!this.size.height){this.size.height = this.size.heightDefault;}

        //gets the width height properties/options
        var wUnit = this.size.width.match(/^(\d+(?:\.\d+)?)(.*)$/)[2];
        var hUnit = typeof this.size.height == 'string' ? this.size.height.match(/^(\d+(?:\.\d+)?)(.*)$/)[2] : '';

        // whether unit scales on win resize, is checked by watching if there are % or vh or something else in wUnit or hUnit
        var isDynUnit = winResizeUnits.indexOf(wUnit) != -1 || winResizeUnits.indexOf(hUnit) != -1;

        // e.g if units are %, need to keep resizing canvas with dom, if isDynUnit is true then resize Eventlistener is attached
        //and bind to the handleResize function
        if (isDynUnit)
        {
            window.addEventListener('resize', this.handleResize.bind(this))
        }
    },

    //resizes the viewer dynamicallie if needed
    //
    handleResize: function()
    {
        var hIsRatio = typeof this.size.height != 'string';

        // apply css, then check px size. This is in case css is not in px
        this.canvas.style.width = this.size.width;

        if (!hIsRatio)
        {
            this.canvas.style.height = this.size.height;
        }

        var widthInPx = this.canvas.clientWidth;
        var heightInPx = hIsRatio ? widthInPx * this.size.height : this.canvas.clientHeight;

        this.camera_.aspect = widthInPx/heightInPx;
        this.camera_.updateProjectionMatrix();

        // set canvas attributes (false => don't set css)
        this.renderer_.setSize(widthInPx, heightInPx, false);
        this.render();
    }
};

module.exports = Viewer;
