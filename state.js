
//##############################################################################
// Module to the state of the program.
//##############################################################################

var STATE = ( function(mod) {

  // Animation variables.
  var frameRate = 8;
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
  mod.stepToNextFrame = function(value) {
    if (typeof value !== 'undefined') { stepToNextFrame = value; }
    return stepToNextFrame;
  }

  // Paused variables.
  var paused = false;
  mod.paused = function(value) {
    if (typeof value !== 'undefined') {
      paused = value;
      if (UI.enabled) { UI.updatePaused(); }
    }
    return paused;
  }
  mod.pausedToggle = function() {
    STATE.paused( !paused );
  }

  // Blur variables.
  // Set blurPercent, and calculate blurAbsolute from that.
  var blurAbsolute = 0;
  var blurPercent = 0;
  var blurMax = 0.6;
  mod.blurPercent = function(value) {
    if (typeof value !== 'undefined') {
      blurPercent = parseInt(value);
      blurAbsolute = blurMax - (blurMax * blurPercent / 100);
      if (blurAbsolute == blurMax) { blurAbsolute = 1; }
      if (UI.enabled) { UI.updateBlur(); }
    }
    return blurPercent;
  }
  mod.blurAbsolute = function() {
    return blurAbsolute;
  }

  // Rule and loop variables.
  var currentRuleType = 'Conway';
  var lastCustomRuleName = '(custom 1)';
  var loopType = '(none)';
  var loopState = 0;
  var loopRules = ['Conway','Conway'];
  var loopRates = [];
  var frameCount = 0;
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
  mod.loopRules = function(value) {
    if (typeof value !== 'undefined') {
      loopRules = value;
      if (UI.enabled) { UI.updateLoopRules(); }
    }
    return loopRules;
  }
  mod.loopRates = function(value) {
    if (typeof value !== 'undefined') { loopRates = value; }
    return loopRates;
  }

  // Framecount is the number of frames in the current loop.
  // Not used if there is no loop in progress ( loopType == '(none)' ).
  // Framecount can either be reset, or ticked.
  mod.frameCountReset = function() {
    frameCount = 0;
  }
  mod.frameCountTick = function() {
    if (loopType != '(none)') {
      frameCount = frameCount + 1;
      if (frameCount >= loopRates[loopState]) {
        frameCount = 0;

        // Currently handles just 2 states.
        loopState = (loopState == 0) ? 1 : 0;
        if (UI.enabled) { UI.updateRuleByName( loopRules[loopState] ); }
      }
    }
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
