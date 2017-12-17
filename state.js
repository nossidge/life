
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
  var stepToNextFrame = false;
  mod.frameRate = function(value) {
    if (typeof value !== 'undefined') {
      let fr = parseInt(value);
      frameRate = fr;
      interval = 1000 / fr;
      if (UI.enabled) { UI.updateFramerate(); }
    }
    return frameRate;
  }
  mod.frameCount = function(value) {
    if (typeof value !== 'undefined') { frameCount = value; }
    return frameCount;
  }
  mod.paused = function(value) {
    if (typeof value !== 'undefined') { paused = value; }
    return paused;
  }
  mod.stepToNextFrame = function(value) {
    if (typeof value !== 'undefined') { stepToNextFrame = value; }
    return stepToNextFrame;
  }

  // Blur variables.
  var blur = 1;
  var blurPercent = 0;
  mod.blur = function(value) {
    if (typeof value !== 'undefined') { blur = value; }
    return blur;
  }
  mod.blurPercent = function(value) {
    if (typeof value !== 'undefined') { blurPercent = value; }
    return blurPercent;
  }

  // Rule and loop variables.
  var currentRuleType = 'Conway';
  var lastCustomRuleName = '(custom 1)';
  var loopType = '(none)';
  var loopState = 0;
  var loopRules = ['Conway','Conway'];
  var loopRates = [];
  mod.currentRuleType = function(value) {
    if (typeof value !== 'undefined') { currentRuleType = value; }
    return currentRuleType;
  }
  mod.lastCustomRuleName = function(value) {
    if (typeof value !== 'undefined') { lastCustomRuleName = value; }
    return lastCustomRuleName;
  }
  mod.loopType = function(value) {
    if (typeof value !== 'undefined') { loopType = value; }
    return loopType;
  }
  mod.loopState = function(value) {
    if (typeof value !== 'undefined') { loopState = value; }
    return loopState;
  }
  mod.loopRules = function(value) {
    if (typeof value !== 'undefined') { loopRules = value; }
    return loopRules;
  }
  mod.loopRates = function(value) {
    if (typeof value !== 'undefined') { loopRates = value; }
    return loopRates;
  }

  return mod;
}(STATE || {}));

//##############################################################################

// ToDo: How do I non-global this?
var ANIMATION;

var cells;

// Move to UI.
var mirrorNS = false;
var mirrorEW = false;
var mirrorNESW = false;
var mirrorNWSE = false;
var mouse = {x: 0, y: 0};
var mouseDown = false;

var now, then, delta, interval = 1000 / STATE.frameRate();
var globalStateStatic;

//##############################################################################
