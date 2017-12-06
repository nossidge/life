
//##############################################################################
// Module for UI functions.
//##############################################################################

var UI = (function (mod) {

  var loopTypeDesc = true;
  var rulesDesc = true;

  mod.resizeCanvas = function() {
    a.width  = Cell.get_cellCount().x * Cell.get_cellPixels().x;
    a.height = Cell.get_cellCount().y * Cell.get_cellPixels().y;
    w = a.width;
    h = a.height;
  }

  // Toggle pause on or off.
  mod.togglePause = function() {
    UI.setPause(!paused);
  }
  mod.setPause = function(value) {
    paused = value;
    var domObj = document.getElementById('button_pause');
    if (paused) {
      domObj.style.background = '#E94E77'; // Red
    } else {
      domObj.style.background = ''; // Off
    }
  }

  // Load JSON stuff to html objects.
  mod.HtmlLifeRulesDropDowns = function() {
    var finalHtml = '';
    for (var property in validLifeRules()) {
      if (RULES.rules.hasOwnProperty(property)) {
        finalHtml += '<option value="' + property + '">' + property + '</option>';
      }
    }
    document.getElementById('rules_select').innerHTML = finalHtml;
    document.getElementById('loop_rule_0').innerHTML = finalHtml;
    document.getElementById('loop_rule_1').innerHTML = finalHtml;

    document.getElementById('rules_select').value = currentRuleType;
    document.getElementById('loop_rule_0').value = loopRules[0];
    document.getElementById('loop_rule_1').value = loopRules[1];
  }
  mod.HtmlLoopTypeDropDown = function() {
    var finalHtml = '<option value="(none)">(none)</option>';
    finalHtml += '<option value="(custom)">(custom)</option>';
    for (var property in validLoopTypes()) {
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

  mod.updateRuleByName = function(name) {
    currentRuleType = name;
    document.getElementById('rules_select').value = currentRuleType;

    // If it's a custom rule, then set the global variable.
    if (RULES.rules[currentRuleType].hasOwnProperty('custom')) {
      lastCustomRuleName = currentRuleType;
    }

    // Reset the checkboxes to false.
    for (var i = 0; i <= 8; i++) {
      document.getElementById('birth_' + i).checked = false;
      document.getElementById('survival_' + i).checked = false;
    }

    // Turn checkboxes on if needed.
    for (var i = 0; i < RULES.rules[currentRuleType]['birth'].length; i++) {
      document.getElementById(
        'birth_' + RULES.rules[currentRuleType]['birth'][i]
      ).checked = true;
    }
    for (var i = 0; i < RULES.rules[currentRuleType]['survival'].length; i++) {
      document.getElementById(
        'survival_' + RULES.rules[currentRuleType]['survival'][i]
      ).checked = true;
    }

    // Show the description, if it has one.
    let elem = document.getElementById('rules_desc');
    if (RULES.rules[currentRuleType].hasOwnProperty('description')) {
      elem.innerHTML = RULES.rules[currentRuleType]['description'];
    } else {
      elem.innerHTML = '';
    }

    // Epilepsy Life Rules checkboxes.
    zeroNeighboursS();
    zeroNeighboursB();

    FUNCTIONS.puts('Rule = ' + currentRuleType);
  }

  //######################################

  mod.updateLoopType = function(value) {
    loopType = value;
    document.getElementById('loop_type').value = loopType;

    // Reset the loop frame counter.
    frameCount = 0;

    if (loopType != '(none)' && loopType != '(custom)') {
      loopRules[0] = RULES.loops[loopType]['rules'][0];
      loopRules[1] = RULES.loops[loopType]['rules'][1];
      document.getElementById('loop_rule_0').value = loopRules[0];
      document.getElementById('loop_rule_1').value = loopRules[1];

      // Show the description, if it has one.
      let elem = document.getElementById('loop_type_desc');
      if (RULES.loops[loopType].hasOwnProperty('description')) {
        elem.innerHTML = RULES.loops[loopType]['description'];
      } else {
        elem.innerHTML = '';
      }

      // Change the rule, if it is not one of the loop rules.
      if (currentRuleType != loopRules[0] && currentRuleType != loopRules[1]) {
        UI.updateRuleByName(loopRules[0]);
      }
      FUNCTIONS.puts('Loop Type = ' + loopType);
    }
  }

  mod.updateBlur = function(inputBlur) {
    blurPercent = parseInt(inputBlur);
    document.getElementById('range_blur').value = blurPercent;
    document.getElementById('span_blur').innerHTML = blurPercent + '%';
    var blurMax = 0.6;
    blur = blurMax - (blurMax * blurPercent / 100);
    if (blur == blurMax) { blur = 1; }
  }
  mod.updateFramerate = function(inputFramerate) {
    frameRate = parseInt(inputFramerate);
    interval = 1000/frameRate;
    document.getElementById('range_framerate').value = frameRate;
    document.getElementById('span_framerate').innerHTML = frameRate;
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
    paused = false;
    UI.togglePause();
    stepToNextFrame = true;
  }

  return mod;
}(UI || {}));

//##############################################################################
