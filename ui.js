
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
    let cc = CELLS.cellCount();
    CANVAS.a.width  = cc.x * CELLS.cellPixels().x;
    CANVAS.a.height = cc.y * CELLS.cellPixels().y;
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
    Cell.fillColourAlive(fillColourAlive);
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
    Cell.fillColourDead(fillColourDead);
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
  var mirrorNS = false;
  var mirrorEW = false;
  var mirrorNESW = false;
  var mirrorNWSE = false;

  mod.mirrorNS = mirrorNS;
  mod.mirrorEW = mirrorEW;

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
    return [_x , (CELLS.cellCount().y - 1) - _y];
  }
  // Same left as right. (Y is the same)
  mod.getMirrorEW = function(_x, _y) {
    return [(CELLS.cellCount().x - 1) - _x , _y];
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
    var centre = CELLS.centreCell();

    // Difference between the central cell and input.
    var xDiff = centre.x - _x;
    var yDiff = centre.y - _y;

    // Add the other co-ordinate's value.
    var xVal = centre.x + (yDiff * posOrNeg);
    var yVal = centre.y + (xDiff * posOrNeg);

    // If it's not in a drawable region, then just return the original.
    var cc = CELLS.cellCount();
    if (xVal >= 0 && xVal < cc.x && yVal >= 0 && yVal < cc.y) {
      return [xVal, yVal];
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

  mod.updateLoopRule = function(index) {
    let val = STATE.loopRules()[index];
    document.getElementById('loop_rule_' + index).value = val;
  }
  mod.updateLoopRules = function() {
    let len = STATE.loopRules().length;
    for (var i = 0; i < len; i++) {
      UI.updateLoopRule(i);
    }
  }

  mod.updateBlur = function() {
    let bp = STATE.blurPercent();
    document.getElementById('range_blur').value = bp;
    document.getElementById('span_blur').innerHTML = bp + '%';
  }

  mod.updateFramerate = function() {
    let fr = ANIMATION.frameRate();
    document.getElementById('range_framerate').value = fr;
    document.getElementById('span_framerate').innerHTML = fr;
  }

  mod.updatePaused = function() {
    let colour = ANIMATION.paused() ? '#E94E77' : '';
    document.getElementById('button_pause').style.background = colour;
  }

  //############################################################################

  // Redraw the whole canvas.
  mod.clickRedrawButton = function() {
    let width  = parseInt(document.getElementById('range_width').value);
    let height = parseInt(document.getElementById('range_height').value);
    let pixels = parseInt(document.getElementById('range_pixels').value);
    CELLS.cellCount({
      x: width,
      y: height
    });
    CELLS.cellPixels({
      x: pixels,
      y: pixels
    });
    ANIMATION.initCanvas();
  }

  // Step frames individually.
  mod.stepFrame = function() {
    ANIMATION.paused(true);
    ANIMATION.stepToNextFrame(true);
  }

  return mod;
}(UI || {}));

//##############################################################################
