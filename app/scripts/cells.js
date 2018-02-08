
//##############################################################################
// Class to describe a single cell.
//##############################################################################

// OOP-similar behavior in JavaScript.
// https://stackoverflow.com/a/1114121/139299
var Cell = ( function() {

  // Instance constructor.
  let me = function(_x, _y, _cellPixels) {

    // Private variables.
    let cellPixels = _cellPixels;
    let x = _x * _cellPixels.x;
    let y = _y * _cellPixels.y;
    let states = [0, 0];

    // Render the cell to the canvas.
    // {args} has two properties:
    //   args.force
    //     Force the render, even on dead cells.
    //   args.canvasContext
    //     Render to a canvas other than the main CANVAS element.
    //   args.colour
    //     What colour to draw with.
    this.render = function(args) {

      // Don't render dead cells, to preserve the blur effect.
      // Or force write, if necessary.
      if ( (states[0] != 0) || (args && args.force) ) {
        let canvas = args.canvasContext;
        let colour = args.colour;
        canvas.fillStyle = colour[states[0]];
        canvas.fillRect(x, y, cellPixels.x, cellPixels.y);
      }
    }

    // State value should be 0 or 1.
    this.state = function(index, value) {
      if ((typeof index !== 'undefined') && (typeof value !== 'undefined')) {
        states[index] = value;
      } else if (typeof index !== 'undefined') {
        return states[index];
      } else {
        return states;
      }
    }

    // Return the state array as a string.
    this.stateAsString = function() {
      return states.toString().replace(/\,/g,'');
    }

    // Move the values of the states downwards in the array.
    // Unshift an empty value, and pop the oldest value.
    this.stateUnshift = function() {
      states.unshift(null);
      states.pop();
    }
  };

  return me;
})();


//##############################################################################
// Class to describe an automata grid of cell objects.
//##############################################################################

var Cells = ( function() {

  // Instance constructor.
  let me = function() {

    let cells;  // 2D array-of-arrays containing Cell instances.
    let cellCount  = {x: 99, y: 99};  // Size of the grid.
    let cellPixels = {x: 8,  y: 8};   // Size of each cell.
    let centreCell = {x: 49, y: 49};  // Co-ords of central cell.
    let colour = ['#000000', '#E0B0FF'];  // Colours of the cells, by state.
    let canvasContext = CANVAS.c;  // Canvas DOM object to render to.

    // 'cellCount' value should be in the format e.g. {x: 99, y: 99}
    this.initialise = function() {
      cells = [cellCount.x];
      for (let i = 0; i < cellCount.x; i++) {
        cells[i] = new Array(cellCount.y);
      }
      for (let i = 0; i < cellCount.x; i++) {
        for (let j = 0; j < cellCount.y; j++) {
          cells[i][j] = new Cell(i, j, cellPixels);
        }
      }
    }

    // Getters and setters.
    this.cells = function(x, y) {
      if ((typeof x !== 'undefined') && (typeof x !== 'undefined')) {
        return cells[x][y];
      } else {
        return cells;
      }
    }
    this.cellCount = function(value) {
      if (typeof value !== 'undefined') {
        cellCount = value;
        centreCell = {
          x: Math.floor(cellCount.x / 2),
          y: Math.floor(cellCount.y / 2)
        };
      }
      return cellCount;
    }
    this.cellPixels = function(value) {
      if (typeof value !== 'undefined') cellPixels = value;
      return cellPixels;
    }
    this.centreCell = function() {
      return centreCell;
    }
    this.colour = function(state, value) {
      if ((typeof state !== 'undefined') && (typeof value !== 'undefined')) {
        colour[state] = value;
      } else if (typeof state !== 'undefined') {
        return colour[state];
      } else {
        return colour;
      }
    }
    this.canvasContext = function(value) {
      if (typeof value !== 'undefined') canvasContext = value;
      return canvasContext;
    }

    // Render a specific cell to the canvas.
    this.renderCell = function(x, y, args) {
      if (!args) args = {};
      if (typeof args.canvasContext === 'undefined') {
        args.canvasContext = canvasContext;
      }
      if (typeof args.colour === 'undefined') {
        args.colour = colour;
      }
      cells[x][y].render(args);
    }

    // Render all cells to the canvas.
    this.render = function(args) {
      for (let i = 0; i < cellCount.x; i++) {
        for (let j = 0; j < cellCount.y; j++) {
          this.renderCell(i, j, args);
        }
      }
    }

    // Run the neighbour check on a given cell.
    // Considers the 8 surrounding cells.
    //   (Moore neighbourhood, Chebyshev distance 1)
    // Returns 0 or 1, for off or on.
    this.calcNextState = function(_x, _y) {
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
        if (neighbours[i].state(1) != 0) n++;
      }

      // Survival
      let booFound = false;
      let rt = STATE.currentRuleType();
      for (let i = 0; i < RULES.rules[rt]['survival'].length; i++) {
        if (n==RULES.rules[rt]['survival'][i]) booFound = true;
      }
      if (!booFound) { return 0; }

      // Birth
      if (cells[_x][_y].state(1) == 0) {
        booFound = false;
        for (let i = 0; i < RULES.rules[rt]['birth'].length; i++) {
          if (n==RULES.rules[rt]['birth'][i]) booFound = true;
        }
        if (!booFound) return 0;
      }

      return 1;
    }

    // Move every cell to the next permutation.
    this.nextPermutation = function() {
      for (let x = 0; x < cellCount.x; x++) {
        for (let y = 0; y < cellCount.y; y++) {
          cells[x][y].stateUnshift();
        }
      }
      for (let x = 0; x < cellCount.x; x++) {
        for (let y = 0; y < cellCount.y; y++) {
          let nextState = this.calcNextState(x, y);
          cells[x][y].state(0, nextState);
        }
      }
    }

    // Output state to console, for dev purposes.
    this.console = function() {
      let width = cellCount.y.toString().length;
      for (let i = 0; i < cellCount.x; i++) {
        let row = FUNCTIONS.pad(i, width, ' ') + ') ';
        for (let j = 0; j < cellCount.y; j++) {
          row += cells[i][j].state(0);
        }
        console.log(row);
      }
    }
  }

  return me;
})();


//##############################################################################
// Module to store the main automata.
//##############################################################################

var CELLS = ( function(mod) {
  let cells = new Cells();
  mod.cells = function(x, y) { return cells.cells(x, y); }
  mod.initialise = function() { return cells.initialise(); }
  mod.cellCount = function(value) { return cells.cellCount(value); }
  mod.cellPixels = function(value) { return cells.cellPixels(value); }
  mod.centreCell = function() { return cells.centreCell(); }
  mod.colour = function(state, value) { return cells.colour(state, value); }
  mod.canvasContext = function(value) { return cells.canvasContext(value); }
  mod.render = function(args) { return cells.render(args); }
  mod.renderCell = function(x, y, args) { return cells.renderCell(x, y, args); }
  mod.calcNextState = function(_x, _y) { return cells.calcNextState(_x, _y); }
  mod.nextPermutation = function() { return cells.nextPermutation(); }
  mod.console = function() { return cells.console(); }

  return mod;
}(CELLS || {}));

//##############################################################################
