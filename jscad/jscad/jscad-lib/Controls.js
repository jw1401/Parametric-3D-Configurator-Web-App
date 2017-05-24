///////////////////////////////////////////////////////////
// Control Creation for Parameters starts here
//
//
function createGroupControl (definition)
{
    var control = document.createElement("title");
    control.paramName = definition.name;
    control.paramType = definition.type;

    if('caption' in definition)
    {
        control.text = "<span class='lead  w-100'>"+definition.caption+"</span><hr>";
        control.className = 'caption';
    }
    else
    {
        control.text = definition.name;
    }

    return control;
}

function createChoiceControl (definition)
{
    if(!('values' in definition))
    {
        throw new Error("Definition of choice parameter ("+definition.name+") should include a 'values' parameter");
    }

    var control = document.createElement("select");
    control.paramName = definition.name;
    control.paramType = definition.type;
    var values = definition.values;
    var captions;
    if('captions' in definition)
    {
        captions = definition.captions;
        if(captions.length != values.length)
        {
            throw new Error("Definition of choice parameter ("+definition.name+") should have the same number of items for 'captions' and 'values'");
        }
    }
    else
    {
        captions = values;
    }

    var selectedindex = 0;

    for(var valueindex = 0; valueindex < values.length; valueindex++)
    {
        var option = document.createElement("option");
        option.value = values[valueindex];
        option.text = captions[valueindex];
        control.add(option);

        if('default' in definition)
        {
            if(definition["default"] == values[valueindex])
            {
                selectedindex = valueindex;
            }
        }

        else if('initial' in definition)
        {
            if(definition.initial == values[valueindex])
            {
                selectedindex = valueindex;
            }
        }
    }

    if(values.length > 0)
    {
        control.selectedIndex = selectedindex;
    }

    return control;
}

function createControl (definition)
{
    var control_list =
    [
        {type: "text"    , control: "text"    , required: ["index","type","name"], initial: ""},
        {type: "int"     , control: "number"  , required: ["index","type","name"], initial: 0},
        {type: "float"   , control: "number"  , required: ["index","type","name"], initial: 0.0},
        {type: "number"  , control: "number"  , required: ["index","type","name"], initial: 0.0},
        {type: "checkbox", control: "checkbox", required: ["index","type","name","checked"], initial: ""},
        {type: "radio"   , control: "radio"   , required: ["index","type","name","checked"], initial: ""},
        {type: "color"   , control: "color"   , required: ["index","type","name"], initial: "#000000"},
        {type: "date"    , control: "date"    , required: ["index","type","name"], initial: ""},
        {type: "email"   , control: "email"   , required: ["index","type","name"], initial: ""},
        {type: "password", control: "password", required: ["index","type","name"], initial: ""},
        {type: "url"     , control: "url"     , required: ["index","type","name"], initial: ""},
        {type: "slider"  , control: "range"   , required: ["index","type","name","min","max"], initial: 0, label: true},
    ];

    // check for required parameters

    if(!('type' in definition))
    {
        throw new Error("Parameter definition ("+definition.index+ ") must include a 'type' parameter");
    }

    var control = document.createElement("input");
    var i,j,c_type,p_name;

    for (i = 0; i < control_list.length; i++)
    {
        c_type = control_list[i];
        if (c_type.type == definition.type)
        {
            for (j = 0; j < c_type.required.length; j++)
            {
                p_name = c_type.required[j];

                if(p_name in definition)
                {
                    if(p_name == "index") continue;
                    if(p_name == "type") continue;
                    if (p_name == "checked")
                    { // setAttribute() only accepts strings
                        control.checked = definition.checked;
                    }
                    else
                    {
                        control.setAttribute(p_name, definition[p_name]);
                    }
                }
                else
                {
                    throw new Error("Parameter definition ("+definition.index+ ") must include a '"+p_name+"' parameter");
                }
            }
            break;
        }
    }

    if (i == control_list.length)
    {
        throw new Error("Parameter definition ("+definition.index+ ") is not a valid 'type'");
    }

    // set the control type
    control.setAttribute("type", c_type.control);

    // set name and type for obtaining values
    control.paramName = definition.name;
    control.paramType = definition.type;

    // determine initial value of control
    if('initial' in definition)
    {
        control.value = definition.initial;
    }
    else if('default' in definition)
    {
        control.value = definition.default;
    }
    else
    {
        control.value = c_type.initial;
    }

    // set generic HTML attributes

    for (var property in definition)
    {
        if (definition.hasOwnProperty(property))
        {
            if (c_type.required.indexOf(property) < 0)
            {
                control.setAttribute(property, definition[property]);
            }
        }
    }

    // add a label if necessary
    if('label' in c_type)
    {
        control.label = document.createElement("label");
        control.label.innerHTML = control.value;
    }
    return control;
}


module.exports =
{
  createControl,
  createGroupControl,
  createChoiceControl
}
