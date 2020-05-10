
//##############################################################################
// Module to store miscellaneous helper functions.
//##############################################################################

var FUNCTIONS = (function (mod) {

  let writeToConsole = false;

  // Random number between two values.
  mod.rand = function(_max, _min, _int) {
    let max = (_max === 0 || _max) ? _max : 1,
        min = _min || 0,
        gen = min + (max - min) * Math.random();
    return (_int) ? Math.round(gen) : gen;
  }

  // Console log wrapper. Set to false when web page is live.
  mod.puts = function(input) {
    if (writeToConsole) {
      console.log(input);
    }
  }

  // Alter CSS through JavaScript.
  // http://stackoverflow.com/a/11081100/139299
  mod.css = function(selector, prop, val) {
    for (let i = 0; i < document.styleSheets.length; i++) {
      try {
        document.styleSheets[i].insertRule(
          selector + ' {' + prop + ':' + val + '}',
          document.styleSheets[i].cssRules.length
        );
      } catch(e) {
        try {
          document.styleSheets[i].addRule(selector, prop + ':' + val);
        } catch(e) {}
      }
    }
  }

  // http://stackoverflow.com/a/5624139/139299
  mod.hexToRgb = function(hex) {
    let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }

  // Update a DOM element.
  mod.updateDOMInnerHTML = function(DOMID, text) {
    document.getElementById(DOMID).innerHTML = text;
  }
  mod.updateDOMValue = function(DOMID, text) {
    document.getElementById(DOMID).value = text;
  }

  // Pad a number with leading zeros in JavaScript.
  // https://stackoverflow.com/a/10073788/139299
  mod.pad = function(n, width, z) {
    z = z || '0';
    n = n + '';
    return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
  }

  // Serialize object into URL query parameters.
  // https://stackoverflow.com/a/6566471/139299
  mod.serialiseToURLParams = function(obj) {
    let str = '';
    for (let key in obj) {
      if (str != '') str += '&';
      str += key + '=' + obj[key];
    }
    return str;
  }

  // Serialize URL query parameters into object.
  // https://stackoverflow.com/a/8486188/139299
  mod.serialiseFromURLParams = function(url) {
    if(!url) url = location.href;
    var question = url.indexOf('?');
    var hash = url.indexOf('#');
    if(hash==-1 && question==-1) return {};
    if(hash==-1) hash = url.length;
    var query = question==-1 || hash==question+1 ? url.substring(hash) : url.substring(question+1,hash);
    var result = {};
    query.split('&').forEach(function(part) {
      if(!part) return;
      part = part.split('+').join(' '); // replace every + with space, regexp-free version
      var eq = part.indexOf('=');
      var key = eq>-1 ? part.substr(0,eq) : part;
      var val = eq>-1 ? decodeURIComponent(part.substr(eq+1)) : '';
      var from = key.indexOf('[');
      if(from==-1) result[decodeURIComponent(key)] = val;
      else {
        var to = key.indexOf(']',from);
        var index = decodeURIComponent(key.substring(from+1,to));
        key = decodeURIComponent(key.substring(0,from));
        if(!result[key]) result[key] = [];
        if(!index) result[key].push(val);
        else result[key][index] = val;
      }
    });
    return result;
  }

  return mod;
}(FUNCTIONS || {}));

//##############################################################################
