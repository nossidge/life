
//##############################################################################
// Class to describe a single cell.
//##############################################################################

// OOP-similar behavior in JavaScript.
// https://stackoverflow.com/a/1114121/139299
var Cell = (function () {

  // Instance constructor.
  let klass = function (_x, _y) {

    // Private variables.
    let x = _x * CELLS.cellPixels().x;
    let y = _y * CELLS.cellPixels().y;
    let stateNow = 0;
    let stateNext = 0;

    // Render the cell to the canvas.
    this.render = function(force) {
      stateNow = stateNext;

      // Don't render dead cells, to preserve the blur effect.
      // Or force write, if necessary.
      if ( (stateNow != 0) || (force) ) {
        let cp = CELLS.cellPixels();
        CANVAS.c.fillStyle = CELLS.colour(stateNow);
        CANVAS.c.fillRect(x, y, cp.x, cp.y);
      }
    }

    // 'state' should be 0 or 1 for alive or dead.
    this.state = function(value, render) {
      if (typeof value !== 'undefined') {
        stateNext = value;
        if (render) { this.render(true); }
      }
      return stateNow;
    }
    this.stateNext = function(value) {
      if (typeof value !== 'undefined') {
        stateNext = value;
      }
      return stateNext;
    }
  };

  return klass;
})();


//##############################################################################
// Module to store all the Cell objects.
//##############################################################################

var CELLS = ( function(mod) {

  let cells;  // 2D array-of-arrays containing Cell instances.
  let cellCount  = {x: 99, y: 99};  // Size of the grid.
  let cellPixels = {x: 8,  y: 8};   // Size of each cell.
  let centreCell = {x: 49, y: 49};  // Co-ords of central cell.
  let colour = ['#000000', '#E0B0FF'];  // Colours of the cells, by state.

  // 'cellCount' value should be in the format e.g. {x: 99, y: 99}
  mod.initialise = function() {
    cells = [cellCount.x];
    for (let i = 0; i < cellCount.x; i++) {
      cells[i] = new Array(cellCount.y);
    }
    for (let i = 0; i < cellCount.x; i++) {
      for (let j = 0; j < cellCount.y; j++) {
        cells[i][j] = new Cell(i,j);
      }
    }
  }

  // Getters and setters.
  mod.cells = function(x, y) {
    if ((typeof x !== 'undefined') && (typeof x !== 'undefined')) {
      return cells[x][y];
    } else {
      return cells;
    }
  }
  mod.cellCount = function(value) {
    if (typeof value !== 'undefined') {
      cellCount = value;
      centreCell = {
        x: Math.floor(cellCount.x / 2),
        y: Math.floor(cellCount.y / 2)
      };
    }
    return cellCount;
  }
  mod.cellPixels = function(value) {
    if (typeof value !== 'undefined') { cellPixels = value; }
    return cellPixels;
  }
  mod.centreCell = function() {
    return centreCell;
  }
  mod.colour = function(state, value) {
    if ((typeof state !== 'undefined') && (typeof value !== 'undefined')) {
      colour[state] = value;
    } else if (typeof state !== 'undefined') {
      return colour[state];
    } else {
      return colour;
    }
  }

  // Render all cells to the canvas.
  mod.render = function(force = false) {
    for (let i = 0; i < cellCount.x; i++) {
      for (let j = 0; j < cellCount.y; j++) {
        CELLS.cells(i, j).render(force);
      }
    }
  }

  // Run the neighbour check on a given cell.
  // Considers the 8 surrounding cells.
  //   (Moore neighbourhood, Chebyshev distance 1)
  mod.calcNextState = function(_x, _y) {
    let cc = cellCount;

    let neighbours = [8];
    neighbours[0] = cells[ (_x-1+cc.x) % cc.x ][ (_y-1+cc.y) % cc.y ];
    neighbours[1] = cells[ (_x-1+cc.x) % cc.x ][ _y ];
    neighbours[2] = cells[ (_x-1+cc.x) % cc.x ][ (_y+1) % cc.y ];
    neighbours[3] = cells[ _x                 ][ (_y-1+cc.y) % cc.y ];
    neighbours[4] = cells[ _x                 ][ (_y+1) % cc.y ];
    neighbours[5] = cells[ (_x+1) % cc.x      ][ (_y-1+cc.y) % cc.y ];
    neighbours[6] = cells[ (_x+1) % cc.x      ][ _y ];
    neighbours[7] = cells[ (_x+1) % cc.x      ][ (_y+1) % cc.y ];
    let n = 0;
    for (let i = 0; i < 8; i++) {
      if (neighbours[i].state() != 0) { n++; }
    }

    // Survival
    let booFound = false;
    let rt = STATE.currentRuleType();
    for (let i = 0; i < RULES.rules[rt]['survival'].length; i++) {
      if (n==RULES.rules[rt]['survival'][i]) { booFound = true; }
    }
    if (!booFound) { return false; }

    // Birth
    if (cells[_x][_y].state() == 0) {
      booFound = false;
      for (let i = 0; i < RULES.rules[rt]['birth'].length; i++) {
        if (n==RULES.rules[rt]['birth'][i]) { booFound = true; }
      }
      if (!booFound) { return false; }
    }

    return true;
  }

  return mod;
}(CELLS || {}));

//##############################################################################
