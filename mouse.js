
//##############################################################################
// Module for mouse events.
//##############################################################################

var MOUSE = ( function(mod) {

  // Where is the mouse, and is it pressed?
  var mouse = {x: 0, y: 0};
  var mouseDown = false;

  // Getters and setters.
  mod.mouseDown = function(value) {
    if (typeof value !== 'undefined') { mouseDown = value; }
    return mouseDown;
  }

  // Call this on events 'mousedown' and 'mousemove'.
  mod.drawCellFromMousePos = function(e) {
    if (mouseDown) {

      // Left click for live, middle click for dead.
      var state = (e.which == 2) ? 0 : 1;

      // Determine cell x/y from mouse x/y
      mouse.x = e.pageX - CANVAS.a.offsetLeft;
      mouse.y = e.pageY - CANVAS.a.offsetTop;
      _x = Math.max(0,Math.floor(mouse.x / Cell.get_cellPixels().x));
      _y = Math.max(0,Math.floor(mouse.y / Cell.get_cellPixels().y));

      // Change based on mirror variables.
      var coords = UI.getMirrorCellCoords(_x, _y);
      for (var i = 0; i < coords.length; i++) {
        cells[ coords[i][0] ][ coords[i][1] ].setState(CANVAS.c, state);
      }
    }
  }

  return mod;
}(MOUSE || {}));


//##############################################################################
// Add events to the canvas element.
//##############################################################################

// Really simple way of determining if mousedown.
CANVAS.a.addEventListener('mousedown', function(e) {
  MOUSE.mouseDown(true);
  MOUSE.drawCellFromMousePos(e);
}, false);
CANVAS.a.addEventListener('mouseup', function(e) {
  MOUSE.mouseDown(false);
}, false);

CANVAS.a.addEventListener('mousemove', function(e) {
  MOUSE.drawCellFromMousePos(e);
}, false);

// Disable canves doubleclick selection.
// http://stackoverflow.com/a/3799700/139299
CANVAS.a.onmousedown = function() {
  return false;
};

//##############################################################################
