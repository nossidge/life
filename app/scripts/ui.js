
//##############################################################################
// Module for UI functions.
//##############################################################################

var UI = (function (mod) {

  let loopTypeDesc = true;
  let rulesDesc = true;
  let colourLiveIsBackground = true;
  let colourDeadIsText = true;

  mod.enabled = true;

  mod.resizeCanvas = function() {
    let cc = CELLS.cellCount();
    CANVAS.a.width  = cc.x * CELLS.cellPixels().x;
    CANVAS.a.height = cc.y * CELLS.cellPixels().y;
  }

  // Load JSON stuff to html objects.
  mod.HtmlLifeRulesDropDowns = function() {
    let finalHtml = '';
    for (let property in EPILEPSY.validLifeRules()) {
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
    let finalHtml = '<option value="(none)">(none)</option>';
    finalHtml += '<option value="(custom)">(custom)</option>';
    for (let property in EPILEPSY.validLoopTypes()) {
      if (RULES.loops.hasOwnProperty(property)) {
        finalHtml += '<option value="' + property + '">' + property + '</option>';
      }
    }
    document.getElementById('loop_type').innerHTML = finalHtml;
    document.getElementById('loop_type').value = '(none)';
  }

  // Colour options.
  let changeMirrorButtons = function() {
    let col = CELLS.colour();
    let common = ', ' + col[0] + ' 50%, ' + col[1] + ' 50% )';
    changecss('#mirror_buttons #mirror_ns', 'background-image',
      cssValuePrefix + 'linear-gradient(bottom' + common);
    changecss('#mirror_buttons #mirror_ew', 'background-image',
      cssValuePrefix + 'linear-gradient(right' + common);
    changecss('#mirror_buttons #mirror_nesw', 'background-image',
      cssValuePrefix + 'linear-gradient(bottom right' + common);
    changecss('#mirror_buttons #mirror_nwse', 'background-image',
      cssValuePrefix + 'linear-gradient(bottom left' + common);
  }
  mod.updateColourLive = function(inputColour) {
    let strCol = String(inputColour);
    if (strCol.charAt(0) != '#') strCol = '#' + strCol;
    CELLS.colour(1, strCol);
    document.getElementById('jscolor_live').jscolor.fromString(strCol);
    if (colourLiveIsBackground) {
      changeMirrorButtons();
      document.body.style.backgroundColor = strCol;
    }
    UI.drawButtonsAll();
  }
  mod.updateColourDead = function(inputColour) {
    let strCol = String(inputColour);
    if (strCol.charAt(0) != '#') strCol = '#' + strCol;
    CELLS.colour(0, strCol);
    document.getElementById('jscolor_dead').jscolor.fromString(strCol);
    if (colourDeadIsText) {
      changeMirrorButtons();
      document.body.style.color = strCol;
      FUNCTIONS.css('.border', 'border', '2px solid ' + strCol);
    }
    UI.drawButtonsAll();
    changecss('a', 'color', strCol);
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
  let mirrorNS = false;
  let mirrorEW = false;
  let mirrorNESW = false;
  let mirrorNWSE = false;

  mod.mirrorNS = mirrorNS;
  mod.mirrorEW = mirrorEW;

  let toggleMirrorActive = function(elem, bool) {
    if (bool) {
      elem.classList.add('mirror_active');
      elem.classList.remove('mirror_inactive');
    } else {
      elem.classList.remove('mirror_active');
      elem.classList.add('mirror_inactive');
    }
    UI.drawButtonsMirror();
  }

  mod.toggleMirrorNS = function() {
    mirrorNS = !mirrorNS;
    let elem = document.getElementById('mirror_ns');
    toggleMirrorActive(elem, mirrorNS);
  }
  mod.toggleMirrorEW = function() {
    mirrorEW = !mirrorEW;
    let elem = document.getElementById('mirror_ew');
    toggleMirrorActive(elem, mirrorEW);
  }
  mod.toggleMirrorNESW = function() {
    mirrorNESW = !mirrorNESW;
    let elem = document.getElementById('mirror_nesw');
    toggleMirrorActive(elem, mirrorNESW);
  }
  mod.toggleMirrorNWSE = function() {
    mirrorNWSE = !mirrorNWSE;
    let elem = document.getElementById('mirror_nwse');
    toggleMirrorActive(elem, mirrorNWSE);
  }

  //######################################

  // Same above as below. (X is the same)
  mod.getMirrorNS = function(_x, _y, cells = CELLS) {
    return [_x , (cells.cellCount().y - 1) - _y];
  }
  // Same left as right. (Y is the same)
  mod.getMirrorEW = function(_x, _y, cells = CELLS) {
    return [(cells.cellCount().x - 1) - _x , _y];
  }

  //######################################

  // Diagonals - Works best with square canvas. Will cut off sides if longer.
  mod.getMirrorNESW = function(_x, _y, cells = CELLS) {
    return UI.getMirrorDiagonal(_x, _y, 1, cells);
  }
  mod.getMirrorNWSE = function(_x, _y, cells = CELLS) {
    return UI.getMirrorDiagonal(_x, _y, -1, cells);
  }

  // posOrNeg is 1 if NESW, -1 if NWSE.
  mod.getMirrorDiagonal = function(_x, _y, posOrNeg, cells = CELLS) {
    let centre = cells.centreCell();

    // Difference between the central cell and input.
    let xDiff = centre.x - _x;
    let yDiff = centre.y - _y;

    // Add the other co-ordinate's value.
    let xVal = centre.x + (yDiff * posOrNeg);
    let yVal = centre.y + (xDiff * posOrNeg);

    // If it's not in a drawable region, then just return the original.
    let cc = cells.cellCount();
    if (xVal >= 0 && xVal < cc.x && yVal >= 0 && yVal < cc.y) {
      return [xVal, yVal];
    } else {
      return [_x, _y];
    }
  }

  //######################################

  // This will return an array of cell addresses.
  mod.getMirrorCellCoords = function(_x, _y, cells = CELLS) {
    let coords = new Array();
    coords[0] = [_x, _y];

    if (mirrorNS) {
      coords.push( UI.getMirrorNS(_x, _y, cells) );
    }

    // There might now be two values in [coords], so loop through.
    if (mirrorEW) {
      let loopMax = coords.length;
      for (let i = 0; i < loopMax; i++) {
        coords.push( UI.getMirrorEW(coords[i][0], coords[i][1], cells) );
      }
    }

    // Same again for the diagonal mirrors.
    if (mirrorNESW) {
      let loopMax = coords.length;
      for (let i = 0; i < loopMax; i++) {
        coords.push( UI.getMirrorNESW(coords[i][0], coords[i][1], cells) );
      }
    }
    if (mirrorNWSE) {
      let loopMax = coords.length;
      for (let i = 0; i < loopMax; i++) {
        coords.push( UI.getMirrorNWSE(coords[i][0], coords[i][1], cells) );
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
    for (let i = 0; i <= 8; i++) {
      document.getElementById('birth_' + i).checked = false;
      document.getElementById('survival_' + i).checked = false;
    }

    // Turn checkboxes on if needed.
    for (let i = 0; i < RULES.rules[rt]['birth'].length; i++) {
      document.getElementById(
        'birth_' + RULES.rules[rt]['birth'][i]
      ).checked = true;
    }
    for (let i = 0; i < RULES.rules[rt]['survival'].length; i++) {
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
    for (let i = 0; i < len; i++) {
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

  mod.updateCanvasSize = function() {
    let cc = CELLS.cellCount();
    document.getElementById('range_width').value = cc.x;
    document.getElementById('span_width').innerHTML = cc.x;
    document.getElementById('range_height').value = cc.y;
    document.getElementById('span_height').innerHTML = cc.y;
  }

  mod.updatePixelSize = function() {
    let cp = CELLS.cellPixels();
    document.getElementById('range_pixels').value = cp.x;
    document.getElementById('span_pixels').innerHTML = cp.x;
  }

  //############################################################################

  // Check to see if the chosen Birth/Survival options match an existing rule.
  mod.checkLifeRules = function() {

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
    let strBirth    = JSON.stringify(birth);
    let strSurvival = JSON.stringify(survival);

    // Check each in { EPILEPSY.validLifeRules() } for a match.
    let ruleMatched = false;
    for (let ruleName in EPILEPSY.validLifeRules()) {
      if (RULES.rules.hasOwnProperty(ruleName)) {

        // Convert to string for hacky array comparison.
        let thisBirth    = JSON.stringify(RULES.rules[ruleName]['birth']);
        let thisSurvival = JSON.stringify(RULES.rules[ruleName]['survival']);

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
      let ruleName = STATE.lastCustomRuleName();

      // Update custom to the new options.
      RULES.rules[ruleName]['birth'] = birth;
      RULES.rules[ruleName]['survival'] = survival;
      UI.updateRuleByName(ruleName);
    }
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

  //############################################################################

  // Redraw the "Randomise cells" button.
  // Create a temporary Cells instance,
  //   draw a random pattern of cells,
  //   write to a hidden canvas,
  //   then copy the canvas to the img in the button anchor.
  let buttonCells = function(noMirror, mirror) {
    let a = document.getElementById('little_hidden_canvas');
    let c = a.getContext('2d');
    let b;

    // Create a new Cells instance.
    let cc = 11, cp = 4;
    let cells = new Cells();
    cells.cellCount({ x: cc, y: cc });
    cells.cellPixels({ x: cp, y: cp });
    cells.colour(0, CELLS.colour(0));
    cells.colour(1, CELLS.colour(1));
    cells.canvasContext(c);
    cells.initialise();

    // For 'button_central_rectangle'.
    if (noMirror) {

      // Draw a rectangle of cells and write to the hidden canvas.
      let cx = cells.centreCell().x, cy = cells.centreCell().y;
      for (let x = cx - 2; x <= cx + 2; x++) {
        for (let y = cy - 2; y <= cy + 2; y++) {
          cells.cells(x, y).state(0, 1);
        }
      }
      cells.render({ force: true });

      // Write the canvas image to the button background.
      b = document.getElementById('button_central_rectangle');
      b.src = a.toDataURL();
      b.style.border = '2px solid ' + CELLS.colour(1);
    }

    // For 'button_random'.
    if (mirror) {

      // Randomise cells according to symmetry and write to the hidden canvas.
      CANVAS.randomise(cells);
      cells.render({ force: true });

      // Write the canvas image to the button background.
      b = document.getElementById('button_random');
      b.src = a.toDataURL();
      b.style.border = '2px solid ' + CELLS.colour(1);
    }
  }

  // Public functions for the above.
  mod.drawButtonsMirror = function() {
    buttonCells(false, true);
  }
  mod.drawButtonsAll = function() {
    buttonCells(true, true);
  }

  //############################################################################

  return mod;
}(UI || {}));

//##############################################################################
