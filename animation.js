
//##############################################################################
// Module to store animation state.
//##############################################################################

var ANIMATION = ( function(mod) {

  var animation;
  var paused = false;
  var frameRate = 8;
  var stepToNextFrame = false;
  var globalStateStatic;
  var now, then, delta;
  var interval = 1000 / frameRate;

  // Interfaces to AnimationFrame.
  mod.cancelAnimationFrame = function() {
    window.cancelAnimationFrame(animation);
  }
  mod.requestAnimationFrame = function(callback) {
    animation = window.requestAnimationFrame(callback);
  }

  // Draw the first scene, and initialise the animation loop.
  mod.initCanvas = function() {
    ANIMATION.cancelAnimationFrame();
    then = Date.now();
    STATE.frameCountReset();

    UI.resizeCanvas();

    // Create empty cell object.
    let cellCount = Cell.cellCount();
    CELLS.initialise(cellCount);

    // Co-ords of central cell.
    centreCell = {
      x: Math.floor(cellCount.x/2),
      y: Math.floor(cellCount.y/2)
    };

    CANVAS.randomiseCentralBlock();
    ANIMATION.drawScene();
  }

  // Iterate the animation loop based on time delta.
  mod.drawScene = function() {
    ANIMATION.requestAnimationFrame(ANIMATION.drawScene);
    now = Date.now();
    delta = now - then;
    if (!paused && delta > interval || stepToNextFrame) {
      then = now - (delta % interval);
      stepToNextFrame = false;

      // Blur or clear the whole canvas.
      let dead = FUNCTIONS.hexToRgb(Cell.fillColourDead());
      let rgb = dead.r + ', ' + dead.g + ', ' + dead.b;
      CANVAS.c.fillStyle = 'rgba(' + rgb + ', ' + STATE.blurAbsolute() + ')';
      CANVAS.c.fillRect(0,0,w,h);

      // Draw all the non-dead cells.
      CELLS.render();

      // Calculate next state.
      globalStateStatic = true;
      for(var i = 0; i < Cell.cellCount().x; i++) {
        for(var j = 0; j < Cell.cellCount().y; j++) {
          var state = !CELLS.calcNextState(i, j) ? 0 : 1;
          if (CELLS.cells(i, j).getStateNext() != state) {
            CELLS.cells(i, j).setStateNext(state);
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

  // Frame rate functions.
  mod.frameRate = function(value) {
    if (typeof value !== 'undefined') {
      let fr = parseInt(value);
      frameRate = fr;
      interval = 1000 / fr;
      if (UI.enabled) { UI.updateFramerate(); }
    }
    return frameRate;
  }
  mod.stepToNextFrame = function(value) {
    if (typeof value !== 'undefined') { stepToNextFrame = value; }
    return stepToNextFrame;
  }

  // Paused functions.
  mod.paused = function(value) {
    if (typeof value !== 'undefined') {
      paused = value;
      if (UI.enabled) { UI.updatePaused(); }
    }
    return paused;
  }
  mod.pausedToggle = function() {
    return ANIMATION.paused( !paused );
  }

  return mod;

}(ANIMATION || {}));

//##############################################################################
