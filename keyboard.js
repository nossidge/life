
//##############################################################################
// Module for keyboard events.
//##############################################################################

var KEYBOARD = ( function(mod) {

  // Get the button being pressed.
  // http://javascript.info/tutorial/keyboard-events
  mod.getChar = function(e) {
    if (e.which == null) {
      return String.fromCharCode(e.keyCode); // IE
    } else if (e.which!=0 && e.charCode!=0) {
      return String.fromCharCode(e.which);   // the rest
    } else {
      return null; // special key
    }
  }

  // Perform different functions based on the key pressed.
  mod.onkeypress = function(e) {
    var char = KEYBOARD.getChar(e || window.event);
    if (!char) return;
    switch( char.toUpperCase() ) {

      case 'P': ANIMATION.pausedToggle(); break;

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
    }
  }

  return mod;
}(KEYBOARD || {}));


//##############################################################################
// Add keyboard events to the window.
//##############################################################################

// Handle most of the key press functions.
// (All except spacebar).
window.onkeypress = function(e) {
  KEYBOARD.onkeypress(e);
}

// Disable the spacebar's default scroll down behaviour.
window.onkeydown = function(e) {
  return !(e.keyCode == 32);
};

// Instead, step to the next frame.
window.addEventListener('keydown', function(e) {
  if (e.keyCode == 32) { UI.stepFrame(); }
});

//##############################################################################
