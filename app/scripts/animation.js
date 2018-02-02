
//##############################################################################
// Module to store animation state.
//##############################################################################

var ANIMATION = ( function(mod) {

  let animation;
  let paused = false;
  let frameRate = 8;
  let stepToNextFrame = false;
  let now, then, delta;
  let interval = 1000 / frameRate;

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
    CELLS.initialise();
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
      let dead = FUNCTIONS.hexToRgb( CELLS.colour(0) );
      let rgb = dead.r + ', ' + dead.g + ', ' + dead.b;
      CANVAS.c.fillStyle = 'rgba(' + rgb + ', ' + STATE.blurAbsolute() + ')';
      CANVAS.c.fillRect(0, 0, CANVAS.a.width, CANVAS.a.height);

      // Calculate next state of all the cells.
      CELLS.nextPermutation();

      // Draw all the non-dead cells.
      CELLS.render();

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
