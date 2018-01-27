
//##############################################################################
// Module for mouse events.
//##############################################################################

var MOUSE = ( function(mod) {

  let pos = {x: 0, y: 0};

  // Draw a cell to the canvas if the mouse is pressed.
  mod.drawCellFromMousePos = function(e) {
    if (e.which != 0) {

      // Left click for live, middle click for dead.
      let state = (e.which == 2) ? 0 : 1;

      // Determine cell x/y from mouse x/y
      pos.x = e.pageX - CANVAS.a.offsetLeft;
      pos.y = e.pageY - CANVAS.a.offsetTop;
      _x = Math.max(0, Math.floor(pos.x / CELLS.cellPixels().x));
      _y = Math.max(0, Math.floor(pos.y / CELLS.cellPixels().y));

      // Change based on mirror variables.
      let coords = UI.getMirrorCellCoords(_x, _y);
      for (let i = 0; i < coords.length; i++) {
        let x = coords[i][0];
        let y = coords[i][1];
        CELLS.cells(x, y).state(state, true);
      }
    }
  }

  return mod;
}(MOUSE || {}));


//##############################################################################
// Add events to the canvas element.
//##############################################################################

// Draw if clicked, or if mouse dragged while clicked.
CANVAS.a.addEventListener('mousedown', function(e) {
  MOUSE.drawCellFromMousePos(e);
}, false);
CANVAS.a.addEventListener('mousemove', function(e) {
  MOUSE.drawCellFromMousePos(e);
}, false);

// Disable canvas doubleclick selection.
CANVAS.a.onmousedown = function() {
  return false;
};

//##############################################################################
