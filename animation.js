
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

  // Draw the first scene.
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
    drawScene();
  }

  return mod;

}(ANIMATION || {}));

//##############################################################################
