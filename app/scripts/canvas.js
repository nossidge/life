
//##############################################################################
// Module to store writing to the canvas element.
//##############################################################################

var CANVAS = (function (mod) {

  // Canvas constants.
  const a = document.getElementById('canvas');
  const c = a.getContext('2d');
  mod.a = a;
  mod.c = c;

  // Initialize a fraction of the cells to start in their "alive" state.
  mod.randomise = function(cells = CELLS) {
    let limit = {
      x: cells.cellCount().x,
      y: cells.cellCount().y
    };
    if (UI.mirrorNS) limit.y = limit.y / 2;
    if (UI.mirrorEW) limit.x = limit.x / 2;

    for (let i = 0; i < limit.x; i++) {
      for (let j = 0; j < limit.y; j++) {
        let state = FUNCTIONS.rand(0,1,1);

        // Change based on mirror variables.
        let coords = UI.getMirrorCellCoords(i, j, cells);
        for (let k = 0; k < coords.length; k++) {
          let x = coords[k][0];
          let y = coords[k][1];
          cells.cells(x, y).state(0, state);
        }
      }
    }
  }
  mod.randomiseAndRender = function(cells = CELLS) {
    CANVAS.randomise(cells);
    cells.render({force: true});
  }

  // Only works when width & height of the canvas is odd.
  // Currently, use the UI to force an odd value.
  mod.randomiseCentralBlock = function(cells = CELLS) {

    // Radius of central cells.
    let cc = cells.cellCount();
    let minR = 2;
    let maxR = Math.min(cc.x, cc.y) / 2 - 10;
    let r = FUNCTIONS.rand(minR, maxR, 1);

    // Set all the cells in the radius to live.
    let theCell = {x: 0,  y: 0};
    let centre = cells.centreCell();
    for (let i = -r; i <= r; i++) {
      for (let j = -r; j <= r; j++) {
        theCell.x = centre.x + parseInt(i);
        theCell.y = centre.y + parseInt(j);
        cells.cells(theCell.x, theCell.y).state(0, 1);
        cells.cells(theCell.x, theCell.y).render();
      }
    }
  }
  mod.randomiseCentralBlockAndRender = function(cells = CELLS) {
    CANVAS.randomiseCentralBlock(cells);
    cells.render({force: true});
  }

  // Kill them all, or revive them all.
  mod.setAllCellsToState = function(state, cells = CELLS) {
    let cc = cells.cellCount();
    for (let i = 0; i < cc.x; i++) {
      for (let j = 0; j < cc.y; j++) {
        cells.cells(i, j).state(0, state);
        cells.cells(i, j).render();
      }
    }
    if (state == 0) {
      c.fillStyle = cells.colour(0);
      c.fillRect(0, 0, CANVAS.a.width, CANVAS.a.height);
    }
  }

  // Pause and get a blank screen.
  mod.clearAndPause = function(state, cells = CELLS) {
    ANIMATION.paused(true);
    CANVAS.setAllCellsToState(0, cells);
  }

  return mod;
}(CANVAS || {}));

//##############################################################################
