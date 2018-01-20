
//##############################################################################

// Check to see if the chosen Birth/Survival checkboxes match an existing rule.
function checkLifeRules() {

  // Make arrays of each rule type.
  var birth = [];
  var survival = [];
  for (var i = 0; i <= 8; i++) {
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
  var ruleMatched = false;
  for (var ruleName in EPILEPSY.validLifeRules()) {
    if (RULES.rules.hasOwnProperty(ruleName)) {

      // Convert to string for hacky array comparison.
      thisBirth    = JSON.stringify(RULES.rules[ruleName]['birth']);
      thisSurvival = JSON.stringify(RULES.rules[ruleName]['survival']);

      // Don't match to a 'custom' rule.
      var isCustom = RULES.rules[ruleName].hasOwnProperty('custom');

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
  let cellCount  = Cell.cellCount();
  let cellPixels = Cell.get_cellPixels();

  CANVAS.a.width  = cellCount.x * cellPixels.x;
  CANVAS.a.height = cellCount.y * cellPixels.y;
  UI.updateRuleByName(STATE.currentRuleType());
  STATE.blurPercent(0);
  UI.updateFramerate();
  ANIMATION.initCanvas();
  EPILEPSY.setEpilepsy(true);
  UI.HtmlLifeRulesDropDowns();
  UI.HtmlLoopTypeDropDown();
  FUNCTIONS.updateDOMInnerHTML('span_width', cellCount.x);
  FUNCTIONS.updateDOMInnerHTML('span_height', cellCount.y);
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
  let cellCount  = Cell.cellCount();
  let cellPixels = Cell.get_cellPixels();

  let states = 'cellState=';
  for(var i = 0; i < cellCount.x; i++) {
    for(var j = 0; j < cellCount.y; j++) {
      states += CELLS.cells(i, j).getState();
    }
  }

  states += ',cellCount.x=' + cellCount.x;
  states += ',cellCount.y=' + cellCount.y;
  states += ',cellPixels.x=' + cellPixels.x;
  states += ',cellPixels.y=' + cellPixels.y;
  states += ',frameRate=' + ANIMATION.frameRate();
  states += ',blurPercent=' + STATE.blurPercent();
  states += ',fillColourDead=' + Cell.get_fillColourDead();
  states += ',fillColourAlive=' + Cell.get_fillColourAlive();
  states += ',currentRuleType=' + STATE.currentRuleType();

  states = lzw_encode(states);

  document.getElementById('state_text').value = states;
  document.getElementById('state_text').select();
}


// Get state of all cells.
function stateLoad() {
  fullState = document.getElementById('state_text').value;
  fullState = lzw_decode(fullState);

  document.getElementById('state_text').value = fullState;

  // Load the variables first, before we draw the cells.
  var states = fullState.split(',');
  for (var i=1; i<states.length; i++) {

    // 'states[i]' is in the form 'variable="value"'
    split = states[i].split('=');
    variable = split[0];
    value = split[1];

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
  cellStateString = String( states[0].split('=')[1] );

  // Loop through all the cells.
  for(var i = 0; i < Cell.cellCount().x; i++) {
    for(var j = 0; j < Cell.cellCount().y; j++) {

      // Set the state.
      state = parseInt( cellStateString.charAt(0) );
      CELLS.cells(i, j).setState(state);

      // Remove the first character of the string.
      cellStateString = cellStateString.substring(1)
    }
  }

  CELLS.render(true);
}

// https://gist.github.com/revolunet/843889
// LZW-compress a string
function lzw_encode(s) {
  var dict = {};
  var data = (s + "").split("");
  var currChar;
  var phrase = data[0];
  var out = [];
  var code = 256;
  for (var i=1; i<data.length; i++) {
    currChar=data[i];
    if (dict['_' + phrase + currChar] != null) {
      phrase += currChar;
    }
    else {
      out.push(phrase.length > 1 ? dict['_'+phrase] : phrase.charCodeAt(0));
      dict['_' + phrase + currChar] = code;
      code++;
      phrase=currChar;
    }
  }
  out.push(phrase.length > 1 ? dict['_'+phrase] : phrase.charCodeAt(0));
  for (var i=0; i<out.length; i++) {
    out[i] = String.fromCharCode(out[i]);
  }
  return out.join("");
}

// Decompress an LZW-encoded string
function lzw_decode(s) {
  var dict = {};
  var data = (s + "").split("");
  var currChar = data[0];
  var oldPhrase = currChar;
  var out = [currChar];
  var code = 256;
  var phrase;
  for (var i=1; i<data.length; i++) {
    var currCode = data[i].charCodeAt(0);
    if (currCode < 256) {
      phrase = data[i];
    }
    else {
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
