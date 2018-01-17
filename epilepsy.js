
//##############################################################################
// Module for epilepsy functions.
//##############################################################################

var EPILEPSY = (function (mod) {

  var epilepsySafe = true;

  // Toggle value of 'epilepsySafe' boolean.
  mod.toggleEpilepsy = function() {
    EPILEPSY.setEpilepsy( !epilepsySafe );
  }
  mod.setEpilepsy = function(value) {
    epilepsySafe = value;
    var domObj = document.getElementById('button_epilepsy');
    if (epilepsySafe) {
      domObj.value = 'Epilepsy: Safe(ish)';
      domObj.style.background = '#BAD696'; // Green

      // Switch to a safe rule if current is unsafe.
      let rt = STATE.currentRuleType();
      let lr = STATE.loopRules();
      if (RULES.rules[rt].hasOwnProperty('epilepsy')) {
        UI.updateRuleByName('Conway');
      }
      if (RULES.rules[lr[0]].hasOwnProperty('epilepsy')) {
        STATE.updateLoopRule(0, 'Conway');
      }
      if (RULES.rules[lr[1]].hasOwnProperty('epilepsy')) {
        STATE.updateLoopRule(1, 'Conway');
      }

      document.getElementById('range_framerate').max = 10;
      if (ANIMATION.frameRate() > 10) { ANIMATION.frameRate(10); }

    } else {
      domObj.value = 'Epilepsy: Unsafe';
      domObj.style.background = '#E94E77'; // Red

      document.getElementById('survival_0').style.display = 'block';
      document.getElementById('survival_1').style.display = 'block';

      document.getElementById('range_framerate').max = 60;

      // Just a QOL thing.
      // Since a safe 8 is the default, immediately switch to 20 if unchanged.
      if (ANIMATION.frameRate() == 8) { ANIMATION.frameRate(20); }
    }

    // Reload the rules to the UI.
    UI.HtmlLoopTypeDropDown();
    UI.HtmlLifeRulesDropDowns();
    UI.HtmlLoopTypeDropDown();
  }

  //########################################

  // If epilepsySafe is on, then make sure birth and survival are not both 0.
  mod.zeroNeighboursB = function() {
    if (epilepsySafe) {
      if (document.getElementById('birth_0').checked) {
        FUNCTIONS.puts('epilepsySafe = ' + epilepsySafe);
        document.getElementById('survival_0').checked = false;
        document.getElementById('survival_0').style.display = 'none';
      } else {
        document.getElementById('survival_0').style.display = 'block';
      }
    }
  }

  mod.zeroNeighboursS = function() {
    if (epilepsySafe) {
      if (document.getElementById('survival_0').checked) {
        FUNCTIONS.puts('epilepsySafe = ' + epilepsySafe);
        document.getElementById('birth_0').checked = false;
        document.getElementById('birth_0').style.display = 'none';
      } else {
        document.getElementById('birth_0').style.display = 'block';
      }
    }
  }

  //########################################

  // Filter the rules according to what's valid.
  // Mostly just to remove epileptic rules.
  // This should be used instead of the raw [RULES.rules].
  mod.validLifeRules = function() {
    var outputHash = {};

    // If not epilepsy, then don't worry about flashing rules.
    if (!epilepsySafe) {
      outputHash = RULES.rules;

    // If we are worried about epilepsy, filter out rules with 'epilepsy' tag.
    } else {
      for (var ruleName in RULES.rules) {
        if (RULES.rules.hasOwnProperty(ruleName)) {
          if (!RULES.rules[ruleName].hasOwnProperty('epilepsy')) {
            outputHash[ruleName] = RULES.rules[ruleName];
          }
        }
      }
    }
    return outputHash;
  }

  // Filter the loop types according to what's valid.
  // Removes any with rules that are epileptic.
  // This should be used instead of the raw [RULES.loops].
  mod.validLoopTypes = function() {
    var outputHash = {};

    // If not epilepsy, then don't worry about flashing rules.
    if (!epilepsySafe) {
      outputHash = RULES.loops;

    // If we are worried about epilepsy, filter out rules with 'epilepsy' tag.
    } else {
      for (var loopName in RULES.loops) {
        if (RULES.loops.hasOwnProperty(loopName)) {
          epil_0 = RULES.rules[ RULES.loops[loopName]['rules'][0] ].hasOwnProperty('epilepsy');
          epil_1 = RULES.rules[ RULES.loops[loopName]['rules'][1] ].hasOwnProperty('epilepsy');
          if (!epil_0 && !epil_1) {
            outputHash[loopName] = RULES.loops[loopName];
          }
        }
      }
    }
    return outputHash;
  }

  return mod;
}(EPILEPSY || {}));

//##############################################################################
