
//##############################################################################
// Module to the state of the program.
//##############################################################################

var STATE = ( function(mod) {

  // Blur variables.
  // Set blurPercent, and calculate blurAbsolute from that.
  let blurAbsolute = 0;
  let blurPercent = 0;
  let blurMax = 0.6;
  mod.blurPercent = function(value) {
    if (typeof value !== 'undefined') {
      blurPercent = parseInt(value);
      blurAbsolute = blurMax - (blurMax * blurPercent / 100);
      if (blurAbsolute == blurMax) blurAbsolute = 1;
      if (UI.enabled) UI.updateBlur();
    }
    return blurPercent;
  }
  mod.blurAbsolute = function() {
    return blurAbsolute;
  }

  // Rule and loop variables.
  let currentRuleType = 'Conway';
  let lastCustomRuleName = '(custom 1)';
  let loopType = '(none)';
  let loopState = 0;
  let loopRules = ['Conway','Conway'];
  let loopRates = [];
  let frameCount = 0;
  mod.currentRuleType = function(value) {
    if (typeof value !== 'undefined') currentRuleType = value;
    return currentRuleType;
  }
  mod.lastCustomRuleName = function(value) {
    if (typeof value !== 'undefined') lastCustomRuleName = value;
    return lastCustomRuleName;
  }
  mod.loopType = function(value) {
    if (typeof value !== 'undefined') loopType = value;
    return loopType;
  }
  mod.loopRules = function(value) {
    if (typeof value !== 'undefined') {
      loopRules = value;
      if (UI.enabled) UI.updateLoopRules();
    }
    return loopRules;
  }
  mod.loopRates = function(value) {
    if (typeof value !== 'undefined') loopRates = value;
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
        if (UI.enabled) UI.updateRuleByName( loopRules[loopState] );
      }
    }
  }

  // Search to see if the selected rules match any of the named loops.
  mod.updateLoopRule = function(index, value) {

    // Update the STATE.
    let lr = STATE.loopRules();
    lr[index] = value;
    STATE.loopRules(lr);

    // Debug print.
    FUNCTIONS.puts('updateLoopRule -- index:' + index + '  value:' + value);

    // Clone and sort the loop rules.
    let lrClone = lr.slice(0);
    lrClone.sort();
    lrClone = JSON.stringify(lrClone);

    // Loop to find a match.
    let loopTypeMatched = false;
    for (let loopName in RULES.loops) {
      if (RULES.loops.hasOwnProperty(loopName)) {

        let rules = RULES.loops[loopName]['rules'];
        rules.sort();
        rules = JSON.stringify(rules);
        FUNCTIONS.puts(rules);

        if (rules == lrClone) {
          loopTypeMatched = true;
          document.getElementById('loop_type').value = loopName;
          FUNCTIONS.puts('loopTypeMatched = true');
        }
      }
    }

    // Select 'Custom' if not rule matched.
    if (!loopTypeMatched) {
      document.getElementById('loop_type').value = '(custom)';
    }
  }

  // Change the loop rates.
  mod.updateLoopRate = function(index, value) {
    let lr = STATE.loopRates();
    lr[index] = value;
    STATE.loopRates(lr);
    document.getElementById('span_loop_rate_' + index).innerHTML = value;
    FUNCTIONS.puts('updateLoopRate -- index:' + index + '  value:' + value);
  }

  return mod;
}(STATE || {}));

//##############################################################################
