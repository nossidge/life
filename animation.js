
//##############################################################################
// Module to store animation state.
//##############################################################################

var ANIMATION = ( function(mod) {

  var animation;

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
    ANIMATION.drawScene();
  }

  // Iterate the animation loop based on time delta.
  mod.drawScene = function() {
    ANIMATION.requestAnimationFrame(ANIMATION.drawScene);
    now = Date.now();
    delta = now - then;
    if (!STATE.paused() && delta > interval || STATE.stepToNextFrame()) {
      then = now - (delta % interval);
      STATE.stepToNextFrame(false);

      dead = FUNCTIONS.hexToRgb(Cell.get_fillColourDead());
      let rgb = dead.r + ', ' + dead.g + ', ' + dead.b;
      CANVAS.c.fillStyle = 'rgba(' + rgb + ', ' + STATE.blurAbsolute() + ')';
      CANVAS.c.fillRect(0,0,w,h);

      // Display cells.
      for(var i = 0; i < Cell.get_cellCount().x; i++) {
        for(var j = 0; j < Cell.get_cellCount().y; j++) {
          cells[i][j].render(CANVAS.c);
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

  return mod;

}(ANIMATION || {}));

//##############################################################################
