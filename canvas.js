
//##############################################################################
// Module to store writing to the canvas element.
//##############################################################################

var CANVAS = (function (mod) {

  // Canvas constants.
  var a = document.getElementById('canvas');
  var c = a.getContext('2d');
  mod.a = a;
  mod.c = c;

  // Initialize a fraction of the cells to start in their "alive" state.
  mod.randomise = function() {
    var limit = {
      x: Cell.cellCount().x,
      y: Cell.cellCount().y
    };
    if (UI.mirrorNS) { limit.y = limit.y / 2; }
    if (UI.mirrorEW) { limit.x = limit.x / 2; }

    for(var i = 0; i < limit.x; i++) {
      for(var j = 0; j < limit.y; j++) {
        var state = FUNCTIONS.rand(0,1,1);

        // Change based on mirror variables.
        var coords = UI.getMirrorCellCoords(i, j);
        for (var k = 0; k < coords.length; k++) {
          let x = coords[k][0];
          let y = coords[k][1];
          CELLS.cells(x, y).setState(state);
        }
      }
    }

    CELLS.render(true);
  }

  // Only works when width & height of the canvas is odd.
  // Currently, use the UI to force an odd value.
  mod.randomiseCentralBlock = function() {

    // Radius of central cells.
    let minR = 2;
    let maxR = Math.min(Cell.cellCount().x,Cell.cellCount().y) / 2 - 10;
    let r = FUNCTIONS.rand(minR, maxR, 1);

    // Set all the cells in the radius to live.
    var theCell = {x: 0,  y: 0};
    for(var i = -r; i <= r; i++) {
      for(var j = -r; j <= r; j++) {
        theCell.x = parseInt(centreCell.x) + parseInt(i);
        theCell.y = parseInt(centreCell.y) + parseInt(j);
        CELLS.cells(theCell.x, theCell.y).setStateNext(1);
        CELLS.cells(theCell.x, theCell.y).render();
      }
    }
  }

  // Kill them all, or revive them all.
  mod.setAllCellsToState = function(state) {
    for(var i = 0; i < Cell.cellCount().x; i++) {
      for(var j = 0; j < Cell.cellCount().y; j++) {
        CELLS.cells(i, j).setStateNext(state);
        CELLS.cells(i, j).render();
      }
    }
    if (state == 0) {
      c.fillStyle = Cell.get_fillColourDead();
      c.fillRect(0,0,w,h);
    }
  }

  // Pause and get a blank screen.
  mod.clearAndPause = function(state) {
    ANIMATION.paused(true);
    CANVAS.setAllCellsToState(0);
  }

  return mod;
}(CANVAS || {}));

//##############################################################################
