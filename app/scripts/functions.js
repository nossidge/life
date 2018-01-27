
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

  return mod;
}(FUNCTIONS || {}));

//##############################################################################
