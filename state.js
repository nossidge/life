
//##############################################################################
// Module to the state of the program.
//##############################################################################

var STATE = ( function(mod) {

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
