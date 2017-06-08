// parse the jscad script to get the parameter definitions in the
// getParameterDefintions (returns array) from Function in the jsCad File
//
function getParameterDefinitionsFromScript(script)
{
  var scriptisvalid = true;
  script += "\nfunction include() {}";    // at least make it not throw an error so early

  try
  {
    // first try to execute the script itself; this will catch any syntax errors
    (new Function(script))();
  }
  catch(e)
  {
    scriptisvalid = false;
  }

  var params = [];

  if(scriptisvalid)
  {
    var script1 = "if(typeof(getParameterDefinitions) == 'function') {return getParameterDefinitions();} else {return [];} ";
    script1 += script;

    var f = new Function(script1);
    params = f();

    if( (typeof(params) != "object") || (typeof(params.length) != "number") )
    {
      throw new Error("The getParameterDefinitions() function should return an array with the parameter definitions");
    }
  }

  //returns the getParameterDefinitions array out of the jsCad File for ParametersDiv
  return params;
}

// Get the Parameter Values in the jsCad File
//
function getParamValues (paramControls)
{
    var paramValues = {};

    //iterates through the paramControls Arry generated by createParamControls() function
    //
    for(var i = 0; i < paramControls.length; i++)
    {
        var control = paramControls[i];

        switch (control.paramType)
        {
            case 'choice':

                paramValues[control.paramName] = control.options[control.selectedIndex].value;
                break;

            case 'float':
            case 'number':

                var value = control.value;

                if (!isNaN(parseFloat(value)) && isFinite(value))
                {
                    paramValues[control.paramName] = parseFloat(value);
                }
                else
                {
                    throw new Error("Parameter ("+control.paramName+") is not a valid number ("+value+")");
                }
                break;

            case 'int':

                var value = control.value;
                if (!isNaN(parseFloat(value)) && isFinite(value))
                {
                    paramValues[control.paramName] = parseInt(value);
                }
                else
                {
                    throw new Error("Parameter ("+control.paramName+") is not a valid number ("+value+")");
                }
                break;

            case 'checkbox':
            case 'radio':

                if (control.checked == true && control.value.length > 0)
                {
                    paramValues[control.paramName] = control.value;
                }
                else
                {
                    paramValues[control.paramName] = control.checked;
                }
                break;

            default:

                paramValues[control.paramName] = control.value;
                break;

        }
    }

    // retunrs the paramValues Object allen control Values
    return paramValues;
}

module.exports =
{
  getParamValues,
  getParameterDefinitionsFromScript
}
