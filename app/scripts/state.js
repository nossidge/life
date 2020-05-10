
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

  //############################################################################

  mod.toHash = function() {
    let h = {};
    let cc = CELLS.cellCount();
    let cp = CELLS.cellPixels();

    let cellState = '';
    for (let i = 0; i < cc.x; i++) {
      for (let j = 0; j < cc.y; j++) {
        cellState += CELLS.cells(i, j).stateAsString();
      }
    }

    h.cellState = lzw_encode(cellState);
    h.cellCount_x = cc.x;
    h.cellCount_y = cc.y;
    h.cellPixels_x = cp.x;
    h.cellPixels_y = cp.y;
    h.frameRate = ANIMATION.frameRate();
    h.blurPercent = STATE.blurPercent();
    h.fillColourDead = CELLS.colourHexOnly(0);
    h.fillColourAlive = CELLS.colourHexOnly(1);
    h.currentRuleType = STATE.currentRuleType();

    return h;
  }

  // Save the state of the automation.
  mod.save = function() {
    let variables = FUNCTIONS.serialiseToURLParams(STATE.toHash());
    let baseURL = location.protocol + '//' + location.host + location.pathname;
    let stateURL = baseURL + '?' + variables;

    document.getElementById('state_text').value = stateURL;
    document.getElementById('state_text').select();

    let elemHTML = "<p><a href='" + stateURL + "'>test</a></p>"
    FUNCTIONS.updateDOMInnerHTML('saved_url', elemHTML);
  }

  // Load the state of the automation from the passed object.
  mod.load = function(stateObject) {

    /*
    TODO: Need to be able to read from String as well.
    if (typeof fullState === 'undefined') {
      fullState = document.getElementById('state_text').value;
    }
    */
    stateObject.cellState = lzw_decode(stateObject.cellState);

    FUNCTIONS.updateDOMValue('range_width', stateObject.cellCount_x);
    FUNCTIONS.updateDOMInnerHTML('span_width', stateObject.cellCount_x);
    FUNCTIONS.updateDOMValue('range_height', stateObject.cellCount_y);
    FUNCTIONS.updateDOMInnerHTML('span_height', stateObject.cellCount_y);
    FUNCTIONS.updateDOMValue('range_pixels', stateObject.cellPixels_x);
    FUNCTIONS.updateDOMInnerHTML('span_pixels', stateObject.cellPixels_x);
    ANIMATION.frameRate(stateObject.frameRate);
    STATE.blurPercent(stateObject.blurPercent);
    UI.updateColourDead('#' + stateObject.fillColourDead);
    UI.updateColourLive('#' + stateObject.fillColourAlive);
    UI.updateRuleByName(stateObject.currentRuleType)

    // Redraw the canvas.
    UI.clickRedrawButton();

    // Load the cell states from the variables array.
    let cellStates = stateObject.cellState.match(/.{1,2}/g);

    // Loop through all the cells.
    let counter = 0, cc = CELLS.cellCount();
    for (let i = 0; i < cc.x; i++) {
      for (let j = 0; j < cc.y; j++) {

        // Set the state at each index.
        let cellState = cellStates[counter];
        for (let k = 0; k < cellState.length; k++) {
          let state = parseInt( cellState.charAt(k) );
          CELLS.cells(i, j).state(k, state);
        }
        counter++;
      }
    }

    CELLS.render({force: true});
  }

  return mod;
}(STATE || {}));

//##############################################################################
