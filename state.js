
//##############################################################################
// Module to the state of the program.
//##############################################################################

var STATE = ( function(mod) {

  // Canvas constants.
  var a = document.getElementById('canvas');
  var c = a.getContext('2d');
  mod.a = function() { return a; }
  mod.c = function() { return c; }

  // Animation variables.
  var frameRate = 8;
  var frameCount = 0;
  var paused = false;
  mod.frameRate = function(value) {
    if (typeof value !== "undefined") { frameRate = value; }
    return frameRate;
  }
  mod.frameCount = function(value) {
    if (typeof value !== "undefined") { frameCount = value; }
    return frameCount;
  }
  mod.paused = function(value) {
    if (typeof value !== "undefined") { paused = value; }
    return paused;
  }

  // Blur variables.
  var blur = 1;
  var blurPercent = 0;
  mod.blur = function(value) {
    if (typeof value !== "undefined") { blur = value; }
    return blur;
  }
  mod.blurPercent = function(value) {
    if (typeof value !== "undefined") { blurPercent = value; }
    return blurPercent;
  }

  return mod;
}( STATE || {} ));

//##############################################################################

// ToDo: How do I non-global this?
var ANIMATION;

var currentRuleType = 'Conway';
var loopType = '(none)';
var loopState = 0;
var lastCustomRuleName = '(custom 1)';
var stepToNextFrame = false;

var cells;

var colourLiveIsBackground = true;
var colourDeadIsText = true;

var loopRules = ['Conway','Conway'];
var loopRates = [];

// Move to UI.
var mirrorNS = false;
var mirrorEW = false;
var mirrorNESW = false;
var mirrorNWSE = false;

// Move to EPILEPSY.
var epilepsySafe = true;

var mouse = {x: 0, y: 0};
var mouseDown = false;

var now, then, delta, interval = 1000 / STATE.frameRate();
var globalStateStatic;

//##############################################################################
