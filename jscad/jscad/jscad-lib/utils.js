// checks if is Chrome browser
//
function isChrome()
{
  return (window.navigator.userAgent.search("Chrome") >= 0);
};

// checks if is Safari Browser
//
function isSafari()
{
  return /Version\/[\d\.]+.*Safari/.test(window.navigator.userAgent); // FIXME WWW says don't use this
}

// returns Object for creating Object urls
//
function getWindowURL()
{
  if(window.URL) return window.URL;
  else if(window.webkitURL) return window.webkitURL;
  else throw new Error("Your browser doesn't support window.URL");
};

// creates an Object URL based on blob
//
function textToBlobUrl(txt)
{
  var windowURL= getWindowURL();
  var blob = new Blob([txt], { type : 'application/javascript' });
  var blobURL = windowURL.createObjectURL(blob);
  if(!blobURL) throw new Error("createObjectURL() failed");
  return blobURL;
};

// tell the browser not to keep the reference to the File any longer
//
function revokeBlobUrl(url)
{
  if(window.URL) window.URL.revokeObjectURL(url);
  else if(window.webkitURL) window.webkitURL.revokeObjectURL(url);
  else throw new Error("Your browser doesn't support window.URL");
};

module.exports =
{
  isChrome,
  isSafari,
  getWindowURL,
  textToBlobUrl,
  revokeBlobUrl
}
