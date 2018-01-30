
//##############################################################################
// Module for mouse events.
//##############################################################################

var MOUSE = ( function(mod) {

  let pos = {x: 0, y: 0};
  let mouseDown = false;
  let clickType = 'LEFT';

  // Set mouse down bool.
  mod.mouseDown = function(value) {
    mouseDown = value;
  }

  // Determine which mouse click was performed.
  // http://www.javascripter.net/faq/leftvsrightmousebutton.htm
  mod.setClickType = function(e) {
    let evt = (e == null ? event : e);
    clickType = 'LEFT';
    if (evt.which) {
      if (evt.which == 3) clickType = 'RIGHT';
      if (evt.which == 2) clickType = 'MIDDLE';
    } else if (evt.button) {
      if (evt.button == 2) clickType = 'RIGHT';
      if (evt.button == 4) clickType = 'MIDDLE';
    }
  }

  // Draw a cell to the canvas if the mouse is pressed.
  mod.drawCellFromMousePos = function(e) {
    if (mouseDown) {

      // Left click for live, middle click for dead.
      let state = (clickType == 'LEFT') ? 1 : 0;

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
  MOUSE.mouseDown(true);
  MOUSE.setClickType(e);
  MOUSE.drawCellFromMousePos(e);
}, false);

CANVAS.a.addEventListener('mouseup', function(e) {
  MOUSE.mouseDown(false);
}, false);

CANVAS.a.addEventListener('mousemove', function(e) {
  MOUSE.drawCellFromMousePos(e);
}, false);

// Disable canvas doubleclick selection.
CANVAS.a.onmousedown = function() {
  return false;
};

//##############################################################################
