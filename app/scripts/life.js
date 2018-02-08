
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
  UI.drawButtonsAll();
})();

//##############################################################################

// Get state of all cells.
function stateSave() {
  let cc = CELLS.cellCount();
  let cp = CELLS.cellPixels();

  let variables = 'cellState=';
  for (let i = 0; i < cc.x; i++) {
    for (let j = 0; j < cc.y; j++) {
      variables += CELLS.cells(i, j).stateAsString() + ';';
    }
  }
  variables = variables.slice(0, -1);

  variables += ',cellCount.x=' + cc.x;
  variables += ',cellCount.y=' + cc.y;
  variables += ',cellPixels.x=' + cp.x;
  variables += ',cellPixels.y=' + cp.y;
  variables += ',frameRate=' + ANIMATION.frameRate();
  variables += ',blurPercent=' + STATE.blurPercent();
  variables += ',fillColourDead=' + CELLS.colour(0);
  variables += ',fillColourAlive=' + CELLS.colour(1);
  variables += ',currentRuleType=' + STATE.currentRuleType();

  variables = lzw_encode(variables);

  document.getElementById('state_text').value = variables;
  document.getElementById('state_text').select();
}


// Get state of all cells.
function stateLoad() {
  let fullState = document.getElementById('state_text').value;
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

  // Load the cell states from the variables array.
  let cellStates = variables[0].split('=')[1].split(';');

  // Loop through all the cells.
  let counter = 0, cc = CELLS.cellCount();
  for (let i = 0; i < cc.x; i++) {
    for (let j = 0; j < cc.y; j++) {

      // Set the state at each index.
      let cellState = cellStates[counter];
      for (let k = 0; k < cellState.length; k++) {
        let state = parseInt( cellState.charAt(0) );
        CELLS.cells(i, j).state(0, state);
      }
      counter++;
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
