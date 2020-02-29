
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

  // Save the state of the automation.
  mod.save = function() {
    let cc = CELLS.cellCount();
    let cp = CELLS.cellPixels();

    let variables = 'cellState=';
    for (let i = 0; i < cc.x; i++) {
      for (let j = 0; j < cc.y; j++) {
        variables += CELLS.cells(i, j).stateAsString();
      }
    }
    variables = variables.slice(0, -1);

    variables += ',cellCount.x=' + cc.x;
    variables += ',cellCount.y=' + cc.y;
    variables += ',cellPixels.x=' + cp.x;
    variables += ',cellPixels.y=' + cp.y;
    variables += ',frameRate=' + ANIMATION.frameRate();
    variables += ',blurPercent=' + STATE.blurPercent();
    variables += ',fillColourDead=' + CELLS.colourHexOnly(0);
    variables += ',fillColourAlive=' + CELLS.colourHexOnly(1);
    variables += ',currentRuleType=' + STATE.currentRuleType();

    variables = lzw_encode(variables);

    document.getElementById('state_text').value = variables;
    document.getElementById('state_text').select();
  }

  // Load the state of the automation.
  mod.load = function(fullState) {
    if (typeof fullState === 'undefined') {
      fullState = document.getElementById('state_text').value;
    }
    fullState = lzw_decode(fullState);

    document.getElementById('state_text').value = fullState;

    // Load the variables first, before we draw the cells.
    let variables = fullState.split(',');
    for (let i = 1; i < variables.length; i++) {

      // 'variables[i]' is in the form 'variable="value"'
      let split = variables[i].split('=');
      let variable = split[0];
      let value = split[1];

      // Change the required variable.
      switch( variable ) {
        case 'cellCount.x':
          FUNCTIONS.updateDOMValue('range_width',value);
          FUNCTIONS.updateDOMInnerHTML('span_width',value);
          break;
        case 'cellCount.y':
          FUNCTIONS.updateDOMValue('range_height',value);
          FUNCTIONS.updateDOMInnerHTML('span_height',value);
          break;
        case 'cellPixels.x':
          FUNCTIONS.updateDOMValue('range_pixels',value);
          FUNCTIONS.updateDOMInnerHTML('span_pixels',value);
          break;
    /*  case 'cellPixels.y':
          FUNCTIONS.updateDOMInnerHTML('span_pixels',value);
          break;  */
        case 'frameRate':
          ANIMATION.frameRate(value);
          break;
        case 'blurPercent':
          STATE.blurPercent(value);
          break;
        case 'fillColourDead':
          UI.updateColourDead('#' + value);
          break;
        case 'fillColourAlive':
          UI.updateColourLive('#' + value);
          break;
        case 'currentRuleType':
          UI.updateRuleByName(value)
          break;
        default: break;
      }
    }

    // Redraw the canvas.
    UI.clickRedrawButton();

    // Load the cell states from the variables array.
    let cellStates = variables[0].split('=')[1].match(/.{1,2}/g);

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
