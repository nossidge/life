
//##############################################################################

// Check to see if the chosen Birth/Survival checkboxes match an existing rule.
function checkLifeRules() {

  // Make arrays of each rule type.
  let birth = [];
  let survival = [];
  for (let i = 0; i <= 8; i++) {
    if (document.getElementById('birth_' + i).checked) {
      birth.push(i);
    }
    if (document.getElementById('survival_' + i).checked) {
      survival.push(i);
    }
  }

  // Convert to string for hacky array comparison.
  strBirth    = JSON.stringify(birth);
  strSurvival = JSON.stringify(survival);

  // Check each in { EPILEPSY.validLifeRules() } for a match.
  let ruleMatched = false;
  for (let ruleName in EPILEPSY.validLifeRules()) {
    if (RULES.rules.hasOwnProperty(ruleName)) {

      // Convert to string for hacky array comparison.
      thisBirth    = JSON.stringify(RULES.rules[ruleName]['birth']);
      thisSurvival = JSON.stringify(RULES.rules[ruleName]['survival']);

      // Don't match to a 'custom' rule.
      let isCustom = RULES.rules[ruleName].hasOwnProperty('custom');

      if (!isCustom && strBirth == thisBirth && strSurvival == thisSurvival) {
        FUNCTIONS.puts('ruleMatched = true');

        // Select the rule.
        UI.updateRuleByName(ruleName);
        ruleMatched = true;
      }
    }
  }

  // Select previous 'Custom' if not rule matched.
  if (!ruleMatched) {
    ruleName = STATE.lastCustomRuleName();

    // Update custom to the new options.
    RULES.rules[ruleName]['birth'] = birth;
    RULES.rules[ruleName]['survival'] = survival;
    UI.updateRuleByName(ruleName);
  }
}

//##############################################################################

// Init function.
(function() {
  let cc = CELLS.cellCount();
  let cp = CELLS.cellPixels();

  CANVAS.a.width  = cc.x * cp.x;
  CANVAS.a.height = cc.y * cp.y;
  UI.updateRuleByName(STATE.currentRuleType());
  STATE.blurPercent(0);
  UI.updateFramerate();
  ANIMATION.initCanvas();
  EPILEPSY.setEpilepsy(true);
  UI.HtmlLifeRulesDropDowns();
  UI.HtmlLoopTypeDropDown();
  FUNCTIONS.updateDOMInnerHTML('span_width', cc.x);
  FUNCTIONS.updateDOMInnerHTML('span_height', cc.y);
  UI.setColourLiveIsBackground(true);
  UI.setColourDeadIsText(true);
  UI.toggleHtmlLoopTypeDesc();
  UI.toggleHtmlRulesDesc();
  STATE.updateLoopRate(0, 20);
  STATE.updateLoopRate(1, 20);
  STATE.updateLoopRule(0, 'Conway');
  STATE.updateLoopRule(1, 'Conway');
  UI.updateLoopType('(none)');
  UI.toggleMirrorNS();
  UI.toggleMirrorEW();
  UI.toggleMirrorNESW();
  UI.toggleMirrorNWSE();
})();

//##############################################################################

// Get state of all cells.
function stateSave() {
  let cc = CELLS.cellCount();
  let cp = CELLS.cellPixels();

  let states = 'cellState=';
  for (let i = 0; i < cc.x; i++) {
    for (let j = 0; j < cc.y; j++) {
      states += CELLS.cells(i, j).state();
    }
  }

  states += ',cellCount.x=' + cc.x;
  states += ',cellCount.y=' + cc.y;
  states += ',cellPixels.x=' + cp.x;
  states += ',cellPixels.y=' + cp.y;
  states += ',frameRate=' + ANIMATION.frameRate();
  states += ',blurPercent=' + STATE.blurPercent();
  states += ',fillColourDead=' + CELLS.colour(0);
  states += ',fillColourAlive=' + CELLS.colour(1);
  states += ',currentRuleType=' + STATE.currentRuleType();

  states = lzw_encode(states);

  document.getElementById('state_text').value = states;
  document.getElementById('state_text').select();
}


// Get state of all cells.
function stateLoad() {
  let fullState = document.getElementById('state_text').value;
  fullState = lzw_decode(fullState);

  document.getElementById('state_text').value = fullState;

  // Load the variables first, before we draw the cells.
  let states = fullState.split(',');
  for (let i = 1; i < states.length; i++) {

    // 'states[i]' is in the form 'variable="value"'
    let split = states[i].split('=');
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
        UI.updateColourDead(value);
        break;
      case 'fillColourAlive':
        UI.updateColourLive(value);
        break;
      case 'currentRuleType':
        UI.updateRuleByName(value)
        break;
      default: break;
    }
  }

  // Redraw the canvas.
  UI.clickRedrawButton();

  // Load the cell states to the canvas.
  let cellStateString = String( states[0].split('=')[1] );

  // Loop through all the cells.
  let state;
  let cc = CELLS.cellCount();
  for (let i = 0; i < cc.x; i++) {
    for (let j = 0; j < cc.y; j++) {

      // Set the state.
      state = parseInt( cellStateString.charAt(0) );
      CELLS.cells(i, j).state(state);

      // Remove the first character of the string.
      cellStateString = cellStateString.substring(1)
    }
  }

  CELLS.render({force: true});
}

// https://gist.github.com/revolunet/843889
// LZW-compress a string
function lzw_encode(s) {
  let dict = {};
  let data = (s + "").split("");
  let currChar;
  let phrase = data[0];
  let out = [];
  let code = 256;
  for (let i = 1; i < data.length; i++) {
    currChar = data[i];
    if (dict['_' + phrase + currChar] != null) {
      phrase += currChar;
    } else {
      out.push(phrase.length > 1 ? dict['_'+phrase] : phrase.charCodeAt(0));
      dict['_' + phrase + currChar] = code;
      code++;
      phrase = currChar;
    }
  }
  out.push(phrase.length > 1 ? dict['_'+phrase] : phrase.charCodeAt(0));
  for (let i = 0; i < out.length; i++) {
    out[i] = String.fromCharCode(out[i]);
  }
  return out.join("");
}

// Decompress an LZW-encoded string
function lzw_decode(s) {
  let dict = {};
  let data = (s + "").split("");
  let currChar = data[0];
  let oldPhrase = currChar;
  let out = [currChar];
  let code = 256;
  let phrase;
  for (let i = 1; i < data.length; i++) {
    let currCode = data[i].charCodeAt(0);
    if (currCode < 256) {
      phrase = data[i];
    } else {
      phrase = dict['_'+currCode] ? dict['_'+currCode] : (oldPhrase + currChar);
    }
    out.push(phrase);
    currChar = phrase.charAt(0);
    dict['_'+code] = oldPhrase + currChar;
    code++;
    oldPhrase = phrase;
  }
  return out.join("");
}

//##############################################################################
