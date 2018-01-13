
//##############################################################################
// Class to describe a single cell.
//##############################################################################

// OOP-similar behavior in JavaScript.
// https://stackoverflow.com/a/1114121/139299
var Cell = (function () {

  // Private static variables.
  var cellCount  = {x: 99, y: 99};
  var cellPixels = {x: 8,  y: 8};
  var centreCell = {x: 49, y: 49};
  var fillColourDead  = '#000000';
  var fillColourAlive = '#E0B0FF';

  // Instance constructor.
  var klass = function (_x, _y) {

    // Private variables.
    var x = _x * cellPixels.x;
    var y = _y * cellPixels.y;
    var stateNow = 0;
    var stateNext = 0;

    // Public functions.
    this.get_xy = function () {
      return [x, y];
    };

    // Render the cell to the canvas.
    this.render = function(c) {
      stateNow = stateNext;
      // Don't render dead cells, to preserve the blur effect.
      if (stateNow != 0) {
        CANVAS.c.fillStyle = fillColourAlive;
        CANVAS.c.fillRect(x, y, cellPixels.x, cellPixels.y);
      }
    }

    // 'state' should be 0 or 1 for alive or dead.
    this.setState = function(c, state) {
      CANVAS.c.fillStyle = (state == 0) ? fillColourDead : fillColourAlive;
      CANVAS.c.fillRect(x, y, cellPixels.x, cellPixels.y);
      stateNext = state;
      this.render(c);
    }
    this.getState = function() {
      return stateNow;
    }
    this.setStateNext = function(state) {
      stateNext = state;
    }
    this.getStateNext = function() {
      return stateNext;
    }
  };

  // Public static functions.
  klass.set_cellCount = function (val) { cellCount = val; };
  klass.get_cellCount = function () { return cellCount; };
  klass.set_cellPixels = function (val) { cellPixels = val; };
  klass.get_cellPixels = function () { return cellPixels; };
  klass.set_centreCell = function (val) { centreCell = val; };
  klass.get_centreCell = function () { return centreCell; };
  klass.set_fillColourDead = function (val) { fillColourDead = val; };
  klass.get_fillColourDead = function () { return fillColourDead; };
  klass.set_fillColourAlive = function (val) { fillColourAlive = val; };
  klass.get_fillColourAlive = function () { return fillColourAlive; };

  // Public (shared across instances).
  klass.prototype = {
    announce: function () {
      var example = 'Hi there! My id is ' + this.get_xy();
      console.log(example);
    }
  };

  return klass;
})();


//##############################################################################
// Module to store all the Cell objects.
//##############################################################################

var CELLS = ( function(mod) {

  // A 2D array-of-arrays containing Cell instances.
  var cells;
  mod.cells = function(x, y) {
    if ((typeof x !== 'undefined') && (typeof x !== 'undefined')) {
      return cells[x][y];
    } else {
      return cells;
    }
  }

  // cellCount should be in the format e.g. {x: 99, y: 99}
  mod.initialise = function(cellCount) {
    cells = [cellCount.x];
    for (var i = 0; i < cellCount.x; i++) {
      cells[i] = new Array(cellCount.y);
    }
    for (var i = 0; i < cellCount.x; i++) {
      for (var j = 0; j < cellCount.y; j++) {
        cells[i][j] = new Cell(i,j);
      }
    }
  }

  // Run the neighbor check on each cell.
  mod.calcNextState = function(_x, _y) {
    let cc = Cell.get_cellCount();

    var neighbours = [8];
    neighbours[0] = cells[ (_x-1+cc.x) % cc.x ][ (_y-1+cc.y) % cc.y ];
    neighbours[1] = cells[ (_x-1+cc.x) % cc.x ][ _y ];
    neighbours[2] = cells[ (_x-1+cc.x) % cc.x ][ (_y+1) % cc.y ];
    neighbours[3] = cells[ _x                 ][ (_y-1+cc.y) % cc.y ];
    neighbours[4] = cells[ _x                 ][ (_y+1) % cc.y ];
    neighbours[5] = cells[ (_x+1) % cc.x      ][ (_y-1+cc.y) % cc.y ];
    neighbours[6] = cells[ (_x+1) % cc.x      ][ _y ];
    neighbours[7] = cells[ (_x+1) % cc.x      ][ (_y+1) % cc.y ];
    var n = 0;
    for(var i=0; i<8; i++) {
      if(neighbours[i].getState() != 0) { n++; }
    }

    // Survival
    var booFound = false;
    var rt = STATE.currentRuleType();
    for(var i=0; i<RULES.rules[rt]['survival'].length; i++) {
      if(n==RULES.rules[rt]['survival'][i]) { booFound = true; }
    }
    if(!booFound) { return false; }

    // Birth
    if (cells[_x][_y].getState() == 0) {
      booFound = false;
      for(var i=0; i<RULES.rules[rt]['birth'].length; i++) {
        if(n==RULES.rules[rt]['birth'][i]) { booFound = true; }
      }
      if(!booFound) { return false; }
    }

    return true;
  }

  return mod;
}(CELLS || {}));

//##############################################################################
