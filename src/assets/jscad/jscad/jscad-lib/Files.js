//makes the blob Data for File Download based on selected Format and currentObjects
//
function convertObjectsToBlob(objs, format, formatInfo)
{
    // review the given objects
    var i;
    var foundCSG = false;
    var foundCAG = false;

    for (i = 0; i < objs.length; i++ )
    {
        if (objs[i] instanceof CSG) { foundCSG = true; }
        if (objs[i] instanceof CAG) { foundCAG = true; }
    }

    // convert based on the given format
    foundCSG = foundCSG && formatInfo.convertCSG;
    foundCAG = foundCAG && formatInfo.convertCAG;

    if (foundCSG && foundCAG) { foundCAG = false; } // use 3D conversion

    var object = new CSG();
    if ( foundCSG == false ) { object = new CAG(); }

    for (i = 0; i < objs.length; i++ )
    {
        if (foundCSG == true && objs[i] instanceof CAG)
        {
            object = object.union(objs[i].extrude({offset: [0,0,0.1]})); // convert CAG to a thin solid CSG
            continue;
        }

        if (foundCAG == true && objs[i] instanceof CSG)
        {
            continue;
        }
        object = object.union(objs[i]);
    }
    var blob = null;

    switch(format)
    {

        case 'stla':
            blob = object.toStlString();
            break;

        case 'stlb':
            blob = object.toStlBinary({webBlob: true});
            break;

        default:
            throw new Error("Not supported");
    }
    return blob;
}

// returns the supported Format of the current display objects
//
function supportedFormatsForCurrentObjects (objs, formats)
{
    var objectFormats = [];
    var i;
    var format;

    var foundCSG = false;
    var foundCAG = false;

    for (i = 0; i < objs.length; i++ )
    {
        if (objs[i] instanceof CSG) { foundCSG = true; }
        if (objs[i] instanceof CAG) { foundCAG = true; }
    }

    for (format in formats)
    {
        if (foundCSG && formats[format].convertCSG == true )
        {
            objectFormats[objectFormats.length] = format;
            continue; // only add once
        }

        if (foundCAG && formats[format].convertCAG == true )
        {
            objectFormats[objectFormats.length] = format;
        }
    }
    return objectFormats;
}




module.exports =
{
  convertObjectsToBlob,
  supportedFormatsForCurrentObjects


}
