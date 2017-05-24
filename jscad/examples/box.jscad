// title      : OpenJSCAD.org Logo
// author     : Rene K. Mueller
// license    : MIT License
// revision   : 0.003
// tags       : Logo,Intersection,Sphere,Cube
// file       : logo.jscad


var result = []; //result Array



function getParameterDefinitions() {
  return [
    {type: 'group', caption: "Size" },
    { name: 'width', type: 'int', initial: 40, caption: "Width" },
    { name: 'height', type: 'int', initial: 30, caption: "Height" },
    { name: 'depth', type: 'int', initial: 50, caption: "Depth" },
    { name: 'thicknes', type:'int',initial: 1,min: 1,max: 5 ,step: 1,caption:"Wall-Thicknes"},

    { type: 'group', caption: "Choices" },
    { name: 'cap', type: 'choice', caption: 'Want a Cap?', values: [0, 1], captions: ["No thanks", "Yes please"], initial: 1 },

    { name: 'num', type:'slider',initial: 1,min: 1,max: 2 ,step: 1,caption:"Number of Boxes"},
    { type: 'group', caption: "Checks" },
    { name: 'check', type: 'checkbox', checked: 0, caption: "CheckVolume" }
  ];
}

function box(width, depth, height, thicknes,check, params)
{
    for (i=0; i<params.num;i++)
 {
    // define two opposite corners
    var cube1 =CSG.cube ({
    corner1: [0, 0, 0],
    corner2: [width, depth, height]
    });

    cube1 =translate([0,0,0],cube1);
    //cube1 =cube1.rotateX(0);
    //cube1=cube1.mirroredX();

    var cube2 =CSG.cube ({
    corner1: [thicknes, thicknes, thicknes],
    corner2: [width-thicknes, depth-thicknes, height]
    });
    //cube2=cube2.rotateX(0);

    cube2=cube2.setColor(0.5,1,1,0.5);

    cube1= cube1.subtract(cube2)
    cube2 =translate([0,(-depth-5)*i,0],cube2);

    cube1=cube1.setColor(0.7,0.5,1,1);
    cube1 =translate([0,(-depth-5)*i,0],cube1);

    result.push(cube1);
    if(check===true)
    {
        result.push(cube2);
    }
 }
}

function makeCap(width, depth, thicknes, params)
{
    for (i=0; i<params.num;i++)
    {
    var cube =CSG.cube({
        corner1: [0,0,0],
        corner2: [width,depth,2]
    });
    cube =cube.translate([-width-10,0,0]);

    var c=0.5;
    //var num = clearance +clearance;
    //echo(num, clearance);

    var cube2 =CSG.cube({
        corner1: [thicknes+c,thicknes+c,1],
        corner2: [width-thicknes-c,depth-thicknes-c,4]
    });
    cube2 =cube2.translate([-width-10,0,0]);

    cube =cube.union(cube2);
    cube= cube.translate([0,(-depth-5)*i,0]);
    cube=cube.setColor(0.8,0.5,0.5,1);

    //echo(params.cap);
    if (params.cap == 1)
    {
    result.push(cube);
    }
    //result.push(cube2);
    }
}


function main(params)
{
 box(params.width,params.depth,params.height,params.thicknes,params.check,params);

 makeCap(params.width,params.depth,params.thicknes,params);

 return result;
}
