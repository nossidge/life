
//##############################################################################

// Change the loop rules.
function updateLoopRule(index, value) {
  let lr = STATE.loopRules();
  lr[index] = value;
  STATE.loopRules(lr);

  document.getElementById('loop_rule_' + index).value = value;
  FUNCTIONS.puts('updateLoopRule -- index:' + index + '  value:' + value);

  // Grab from the HTML selection.
  loopRule_0 = document.getElementById('loop_rule_0').value;
  loopRule_1 = document.getElementById('loop_rule_1').value;
  arrLoopRules = [loopRule_0, loopRule_1];
  arrLoopRules.sort();
  strLoopRules = JSON.stringify(arrLoopRules);

  // Loop to find a match.
  var loopTypeMatched = false;
  for (var loopName in RULES.loops) {
    if (RULES.loops.hasOwnProperty(loopName)) {

      rules = RULES.loops[loopName]['rules'];
      rules.sort();
      rules = JSON.stringify(rules);
      FUNCTIONS.puts(rules);

      if (rules == strLoopRules) {
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
function updateLoopRate(index, value) {
  let lr = STATE.loopRates();
  lr[index] = value;
  STATE.loopRates(lr);
  document.getElementById('span_loop_rate_' + index).innerHTML = value;
  FUNCTIONS.puts('updateLoopRate -- index:' + index + '  value:' + value);
}

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

// Draw the first scene.
function initCanvas() {
  cancelAnimationFrame(ANIMATION);
  then = Date.now();
  STATE.frameCountReset();

  UI.resizeCanvas();

  // Create empty cell object.
  let cellCount = Cell.get_cellCount();
  cells = [cellCount.x];
  for (var i = 0; i < cellCount.x; i++) {
    cells[i] = new Array(cellCount.y);
  }
  for (var i = 0; i < cellCount.x; i++) {
    for (var j = 0; j < cellCount.y; j++) {
      cells[i][j] = new Cell(i,j);
    }
  }

  // Co-ords of central cell.
  centreCell = {
    x: Math.floor(cellCount.x/2),
    y: Math.floor(cellCount.y/2)
  };

  CANVAS.randomiseCentralBlock();
  drawScene();
  FUNCTIONS.puts('ANIMATION='+ANIMATION);
}

//functionality
// http://codetheory.in/controlling-the-frame-rate-with-requestanimationframe/
function drawScene() {
  ANIMATION = requestAnimationFrame(drawScene);

  now = Date.now();
  delta = now - then;
  if (!STATE.paused() && delta > interval || STATE.stepToNextFrame()) {
    then = now - (delta % interval);
    STATE.stepToNextFrame(false);

    dead = FUNCTIONS.hexToRgb(Cell.get_fillColourDead());
    STATE.c().fillStyle = 'rgba(' + dead.r + ', ' + dead.g + ', ' + dead.b + ', ' + STATE.blur() + ')';
    STATE.c().fillRect(0,0,w,h);

    // Display cells.
    for(var i = 0; i < Cell.get_cellCount().x; i++) {
      for(var j = 0; j < Cell.get_cellCount().y; j++) {
        cells[i][j].render(STATE.c());
      }
    }

    // Calculate next state.
    globalStateStatic = true;
    for(var i = 0; i < Cell.get_cellCount().x; i++) {
      for(var j = 0; j < Cell.get_cellCount().y; j++) {
        var state = !nextStateAccordingToNeighbours(i,j) ? 0 : 1;
        if (cells[i][j].getStateNext() != state) {
          cells[i][j].setStateNext(state);
          globalStateStatic = false;
        }
      }
    }

    // Have we reached a no-change state?
    // (Might use this in the future...)
    if (globalStateStatic == true) {
      FUNCTIONS.puts('dead');
    }

    // Move to next rule in the loop, if necessary.
    STATE.frameCountTick();
  }
}

//##############################################################################

// Init function.
(function() {
  let cellCount  = Cell.get_cellCount();
  let cellPixels = Cell.get_cellPixels();

  STATE.a().width  = cellCount.x * cellPixels.x;
  STATE.a().height = cellCount.y * cellPixels.y;
  UI.updateRuleByName(STATE.currentRuleType());
  UI.updateBlur(0);
  UI.updateFramerate();
  initCanvas();
  EPILEPSY.epilepsyToggle();
  UI.HtmlLifeRulesDropDowns();
  UI.HtmlLoopTypeDropDown();
  FUNCTIONS.updateDOMInnerHTML('span_width', cellCount.x);
  FUNCTIONS.updateDOMInnerHTML('span_height', cellCount.y);
  UI.setColourLiveIsBackground(true);
  UI.setColourDeadIsText(true);
  UI.toggleHtmlLoopTypeDesc();
  UI.toggleHtmlRulesDesc();
  updateLoopRate(0, 20);
  updateLoopRate(1, 20);
  updateLoopRule(0, 'Conway');
  updateLoopRule(1, 'Conway');
  UI.updateLoopType('(none)');
  UI.toggleMirrorNS();
  UI.toggleMirrorEW();
  UI.toggleMirrorNESW();
  UI.toggleMirrorNWSE();
//  addEventListener('resize', initCanvas, false);
})();

//##############################################################################

// Get state of all cells.
function stateSave() {
  let cellCount  = Cell.get_cellCount();
  let cellPixels = Cell.get_cellPixels();

  states = 'cellState=';
  for(var i = 0; i < cellCount.x; i++) {
    for(var j = 0; j < cellCount.y; j++) {
      states += cells[i][j].getState();
    }
  }

  states += ',cellCount.x=' + cellCount.x;
  states += ',cellCount.y=' + cellCount.y;
  states += ',cellPixels.x=' + cellPixels.x;
  states += ',cellPixels.y=' + cellPixels.y;
  states += ',frameRate=' + STATE.frameRate();
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
        STATE.frameRate(value);
        break;
      case 'blurPercent':
        UI.updateBlur(value);
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
  for(var i = 0; i < Cell.get_cellCount().x; i++) {
    for(var j = 0; j < Cell.get_cellCount().y; j++) {

      // Set the state.
      state = parseInt( cellStateString.charAt(0) );
      cells[i][j].setState(STATE.c(), state);

      // Remove the first character of the string.
      cellStateString = cellStateString.substring(1)
    }
  }
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
