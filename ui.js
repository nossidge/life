
//##############################################################################
// Module for UI functions.
//##############################################################################

var UI = (function (mod) {

  var loopTypeDesc = true;
  var rulesDesc = true;
  var colourLiveIsBackground = true;
  var colourDeadIsText = true;

  mod.enabled = true;

  mod.resizeCanvas = function() {
    STATE.a().width  = Cell.get_cellCount().x * Cell.get_cellPixels().x;
    STATE.a().height = Cell.get_cellCount().y * Cell.get_cellPixels().y;
    w = STATE.a().width;
    h = STATE.a().height;
  }

  // Load JSON stuff to html objects.
  mod.HtmlLifeRulesDropDowns = function() {
    var finalHtml = '';
    for (var property in EPILEPSY.validLifeRules()) {
      if (RULES.rules.hasOwnProperty(property)) {
        finalHtml += '<option value="' + property + '">' + property + '</option>';
      }
    }
    document.getElementById('rules_select').innerHTML = finalHtml;
    document.getElementById('loop_rule_0').innerHTML = finalHtml;
    document.getElementById('loop_rule_1').innerHTML = finalHtml;

    document.getElementById('rules_select').value = STATE.currentRuleType();
    document.getElementById('loop_rule_0').value = STATE.loopRules()[0];
    document.getElementById('loop_rule_1').value = STATE.loopRules()[1];
  }
  mod.HtmlLoopTypeDropDown = function() {
    var finalHtml = '<option value="(none)">(none)</option>';
    finalHtml += '<option value="(custom)">(custom)</option>';
    for (var property in EPILEPSY.validLoopTypes()) {
      if (RULES.loops.hasOwnProperty(property)) {
        finalHtml += '<option value="' + property + '">' + property + '</option>';
      }
    }
    document.getElementById('loop_type').innerHTML = finalHtml;
    document.getElementById('loop_type').value = '(none)';
  }

  // Colour options.
  mod.updateColourLive = function(inputColour) {
    let fillColourAlive = String(inputColour);
    if (fillColourAlive.charAt(0) != '#') {
      fillColourAlive = '#' + fillColourAlive;
    }
    Cell.set_fillColourAlive(fillColourAlive);
    document.getElementById('jscolor_live').jscolor.fromString(fillColourAlive);
    if (colourLiveIsBackground) {
      document.body.style.backgroundColor = fillColourAlive;
    }
  }
  mod.updateColourDead = function(inputColour) {
    let fillColourDead = String(inputColour);
    if (fillColourDead.charAt(0) != '#') {
      fillColourDead = '#' + fillColourDead;
    }
    Cell.set_fillColourDead(fillColourDead);
    document.getElementById('jscolor_dead').jscolor.fromString(fillColourDead);
    if (colourDeadIsText) {
      document.body.style.color = fillColourDead;
      FUNCTIONS.css('.border', 'border', '2px solid ' + fillColourDead);
    }
  }
  mod.setColourLiveIsBackground = function(value) {
    colourLiveIsBackground = value;
    document.getElementById('colour_live').checked = value;
  }
  mod.setColourDeadIsText = function(value) {
    colourDeadIsText = value;
    document.getElementById('colour_dead').checked = value;
  }

  // Show/hide the description of the loop type and rules.
  mod.toggleHtmlLoopTypeDesc = function() {
    loopTypeDesc = !loopTypeDesc;
    if (loopTypeDesc) {
      document.getElementById('loop_type_desc_toggle').innerHTML = '&nbsp;▼&nbsp;';
      document.getElementById('loop_type_desc').style.display = 'block';
    } else {
      document.getElementById('loop_type_desc_toggle').innerHTML = '&nbsp;▶&nbsp;';
      document.getElementById('loop_type_desc').style.display = 'none';
    }
  }
  mod.toggleHtmlRulesDesc = function() {
    rulesDesc = !rulesDesc;
    if (rulesDesc) {
      document.getElementById('rules_desc_toggle').innerHTML = '&nbsp;▼&nbsp;';
      document.getElementById('rules_desc').style.display = 'block';
    } else {
      document.getElementById('rules_desc_toggle').innerHTML = '&nbsp;▶&nbsp;';
      document.getElementById('rules_desc').style.display = 'none';
    }
  }

  //############################################################################

  // Mirrored drawing.
  mod.toggleMirrorNS = function() {
    mirrorNS = !mirrorNS;
    document.getElementById('mirror_NS').checked = mirrorNS;
  }
  mod.toggleMirrorEW = function() {
    mirrorEW = !mirrorEW;
    document.getElementById('mirror_EW').checked = mirrorEW;
  }
  mod.toggleMirrorNESW = function() {
    mirrorNESW = !mirrorNESW;
    document.getElementById('mirror_NESW').checked = mirrorNESW;
  }
  mod.toggleMirrorNWSE = function() {
    mirrorNWSE = !mirrorNWSE;
    document.getElementById('mirror_NWSE').checked = mirrorNWSE;
  }

  //######################################

  // Same above as below. (X is the same)
  mod.getMirrorNS = function(_x, _y) {
    return [_x , (Cell.get_cellCount().y - 1) - _y];
  }
  // Same left as right. (Y is the same)
  mod.getMirrorEW = function(_x, _y) {
    return [(Cell.get_cellCount().x - 1) - _x , _y];
  }

  //######################################

  // Diagonals - Works best with square canvas. Will cut off sides if longer.
  mod.getMirrorNESW = function(_x, _y) {
    return UI.getMirrorDiagonal(_x, _y, 1);
  }
  mod.getMirrorNWSE = function(_x, _y) {
    return UI.getMirrorDiagonal(_x, _y, -1);
  }

  // posOrNeg is 1 if NESW, -1 if NWSE.
  mod.getMirrorDiagonal = function(_x, _y, posOrNeg) {

    // Difference between the central cell and input.
    var xDiff = centreCell.x - _x;
    var yDiff = centreCell.y - _y;

    // Add the other co-ordinate's value.
    var xValue = centreCell.x + (yDiff * posOrNeg);
    var yValue = centreCell.y + (xDiff * posOrNeg);

    // If it's not in a drawable region, then just return the original.
    cellCount = Cell.get_cellCount();
    if (xValue >= 0 && xValue < cellCount.x && yValue >= 0 && yValue < cellCount.y) {
      return [xValue, yValue];
    } else {
      return [_x, _y];
    }
  }

  //######################################

  // This will return an array of cell addresses.
  mod.getMirrorCellCoords = function(_x, _y) {
    var coords = new Array();
    coords[0] = [_x, _y];

    if (mirrorNS) {
      coords.push( UI.getMirrorNS(_x, _y) );
    }

    // There might now be two values in [coords], so loop through.
    if (mirrorEW) {
      var loopMax = coords.length;
      for (var i = 0; i < loopMax; i++) {
        coords.push( UI.getMirrorEW(coords[i][0], coords[i][1]) );
      }
    }

    // Same again for the diagonal mirrors.
    if (mirrorNESW) {
      var loopMax = coords.length;
      for (var i = 0; i < loopMax; i++) {
        coords.push( UI.getMirrorNESW(coords[i][0], coords[i][1]) );
      }
    }
    if (mirrorNWSE) {
      var loopMax = coords.length;
      for (var i = 0; i < loopMax; i++) {
        coords.push( UI.getMirrorNWSE(coords[i][0], coords[i][1]) );
      }
    }

    return coords;
  }

  //############################################################################

  mod.updateRuleByIndex = function(index) {
    UI.updateRuleByName( Object.keys(RULES.rules)[index] );
  }

  mod.updateRuleByName = function(rt) {
    STATE.currentRuleType(rt);
    document.getElementById('rules_select').value = rt;

    // If it's a custom rule, then set the global variable.
    if (RULES.rules[rt].hasOwnProperty('custom')) {
      STATE.lastCustomRuleName(rt);
    }

    // Reset the checkboxes to false.
    for (var i = 0; i <= 8; i++) {
      document.getElementById('birth_' + i).checked = false;
      document.getElementById('survival_' + i).checked = false;
    }

    // Turn checkboxes on if needed.
    for (var i = 0; i < RULES.rules[rt]['birth'].length; i++) {
      document.getElementById(
        'birth_' + RULES.rules[rt]['birth'][i]
      ).checked = true;
    }
    for (var i = 0; i < RULES.rules[rt]['survival'].length; i++) {
      document.getElementById(
        'survival_' + RULES.rules[rt]['survival'][i]
      ).checked = true;
    }

    // Show the description, if it has one.
    let elem = document.getElementById('rules_desc');
    if (RULES.rules[rt].hasOwnProperty('description')) {
      elem.innerHTML = RULES.rules[rt]['description'];
    } else {
      elem.innerHTML = '';
    }

    // Epilepsy Life Rules checkboxes.
    EPILEPSY.zeroNeighboursS();
    EPILEPSY.zeroNeighboursB();

    FUNCTIONS.puts('Rule = ' + rt);
  }

  //######################################

  mod.updateLoopType = function(loopType) {
    STATE.loopType(loopType);
    document.getElementById('loop_type').value = loopType;

    // Reset the loop frame counter.
    STATE.frameCountReset();

    if (loopType != '(none)' && loopType != '(custom)') {
      let lr = [];
      lr[0] = RULES.loops[loopType]['rules'][0];
      lr[1] = RULES.loops[loopType]['rules'][1];
      document.getElementById('loop_rule_0').value = lr[0];
      document.getElementById('loop_rule_1').value = lr[1];
      STATE.loopRules(lr);

      // Show the description, if it has one.
      let elem = document.getElementById('loop_type_desc');
      if (RULES.loops[loopType].hasOwnProperty('description')) {
        elem.innerHTML = RULES.loops[loopType]['description'];
      } else {
        elem.innerHTML = '';
      }

      // Change the rule, if it is not one of the loop rules.
      let rt = STATE.currentRuleType();
      if (rt != lr[0] && rt != lr[1]) {
        UI.updateRuleByName( lr[0] );
      }
      FUNCTIONS.puts('Loop Type = ' + loopType);
    }
  }

  mod.updateBlur = function(inputBlur) {
    let bp = parseInt(inputBlur);
    STATE.blurPercent(bp);
    document.getElementById('range_blur').value = bp;
    document.getElementById('span_blur').innerHTML = bp + '%';
    let blurMax = 0.6;
    STATE.blur(blurMax - (blurMax * bp / 100));
    if (STATE.blur() == blurMax) { STATE.blur(1); }
  }
  mod.updateFramerate = function() {
    let fr = STATE.frameRate();
    document.getElementById('range_framerate').value = fr;
    document.getElementById('span_framerate').innerHTML = fr;
  }

  //############################################################################

  // Redraw the whole canvas.
  mod.clickRedrawButton = function() {
    Cell.set_cellCount({
      x: parseInt(document.getElementById('range_width').value),
      y: parseInt(document.getElementById('range_height').value)
    });
    Cell.set_cellPixels({
      x: parseInt(document.getElementById('range_pixels').value),
      y: parseInt(document.getElementById('range_pixels').value)
    });
    initCanvas();
  }

  // Step frames individually.
  mod.stepFrame = function() {
    STATE.paused(true);
    STATE.stepToNextFrame(true);
  }

  return mod;
}(UI || {}));

//##############################################################################
// Mouse event functions.
//##############################################################################

// Call this on events 'mousedown' and 'mousemove'.
function drawCellFromMousePos(e) {
  if (mouseDown) {

    // Left click for live, middle click for dead.
    var state = (e.which == 2) ? 0 : 1;

    // Determine cell x/y from mouse x/y
    mouse.x = e.pageX - STATE.a().offsetLeft;
    mouse.y = e.pageY - STATE.a().offsetTop;
    _x = Math.max(0,Math.floor(mouse.x / Cell.get_cellPixels().x));
    _y = Math.max(0,Math.floor(mouse.y / Cell.get_cellPixels().y));

    // Change based on mirror variables.
    var coords = UI.getMirrorCellCoords(_x, _y);
    for (var i = 0; i < coords.length; i++) {
      cells[ coords[i][0] ][ coords[i][1] ].setState(STATE.c(), state);
    }
  }
}

// Really simple way of determining if mousedown.
STATE.a().addEventListener('mousedown', function(e) {
  mouseDown = true;
  drawCellFromMousePos(e);
}, false);
STATE.a().addEventListener('mouseup', function(e) {
  mouseDown = false;
}, false);

STATE.a().addEventListener('mousemove', function(e) {
  drawCellFromMousePos(e);
}, false);

// Disable canves doubleclick selection.
// http://stackoverflow.com/a/3799700/139299
STATE.a().onmousedown = function() {
  return false;
};

//##############################################################################
// Keyboard event functions.
//##############################################################################

// http://javascript.info/tutorial/keyboard-events
function getChar(event) {
  if (event.which == null) {
    return String.fromCharCode(event.keyCode) // IE
  } else if (event.which!=0 && event.charCode!=0) {
    return String.fromCharCode(event.which)   // the rest
  } else {
    return null // special key
  }
}
document.onkeypress = function(event) {
  var char = getChar(event || window.event);
  if (!char) return;
  keys = Object.keys(RULES.rules);
  switch( char.toUpperCase() ) {
    case 'P': STATE.pausedToggle(); break;
    case '1': UI.updateRuleByIndex(0); break;
    case '2': UI.updateRuleByIndex(1); break;
    case '3': UI.updateRuleByIndex(2); break;
    case '4': UI.updateRuleByIndex(3); break;
    case '5': UI.updateRuleByIndex(4); break;
    case '6': UI.updateRuleByIndex(5); break;
    case '7': UI.updateRuleByIndex(6); break;
    case '8': UI.updateRuleByIndex(7); break;
    case '9': UI.updateRuleByIndex(8); break;
    case '0': UI.updateRuleByIndex(9); break;

    case 'Q': CANVAS.randomise(); break;
    case 'W': CANVAS.randomiseCentralBlock(); break;

    case 'Z': CANVAS.setAllCellsToState(1); break;
    case 'X': CANVAS.setAllCellsToState(0); break;

    default: break;
  }
  return false;
}

// Step frame on spacebar press.
window.addEventListener('keydown', function(e) {
  if (e.keyCode == 32) {
    UI.stepFrame();
  }
});

// Disable default space scroll down behaviour.
window.onkeydown = function(e) {
  return !(e.keyCode == 32);
};

// Pause and get a blank screen.
function clearCanvas() {
  STATE.paused(true);
  CANVAS.setAllCellsToState(1);
}

//##############################################################################
