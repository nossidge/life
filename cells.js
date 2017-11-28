
//##############################################################################

function Cell(_x, _y) {
  this.x = _x * cellPixels.x;
  this.y = _y * cellPixels.y;
  this.stateNow = 0;
  this.stateNext = 0;
}

Cell.prototype.render = function() {
  this.stateNow = this.stateNext;
  // Don't render dead cells, to preserve the blur effect.
  if (this.stateNow != 0) {
    c.fillStyle = fillColourAlive;
    c.fillRect(this.x, this.y, cellPixels.x, cellPixels.y);
  }
}

// 'state' should be 0 or 1 for alive or dead.
Cell.prototype.setState = function(state) {
  c.fillStyle = (state == 0) ? fillColourDead : fillColourAlive;
  c.fillRect(this.x, this.y, cellPixels.x, cellPixels.y);
  this.stateNext = state;
  this.render();
}

//##############################################################################

// Run the neighbor check on each cell.
function nextStateAccordingToNeighbours(_x, _y) {
  var neighbors = [8];
  neighbors[0] = cells[(_x-1+cellCount.x)%cellCount.x][(_y-1+cellCount.y)%cellCount.y];
  neighbors[1] = cells[(_x-1+cellCount.x)%cellCount.x][_y];
  neighbors[2] = cells[(_x-1+cellCount.x)%cellCount.x][(_y+1)%cellCount.y];
  neighbors[3] = cells[_x][(_y-1+cellCount.y)%cellCount.y];
  neighbors[4] = cells[_x][(_y+1)%cellCount.y];
  neighbors[5] = cells[(_x+1)%cellCount.x][(_y-1+cellCount.y)%cellCount.y];
  neighbors[6] = cells[(_x+1)%cellCount.x][_y];
  neighbors[7] = cells[(_x+1)%cellCount.x][(_y+1)%cellCount.y];
  var n = 0;
  for(var i=0; i<8; i++) {
    if(neighbors[i].stateNow != 0) { n++; }
  }

  // Survival
  var booFound = false;
  for(var i=0; i<lifeRules[currentRuleType]['survival'].length; i++) {
    if(n==lifeRules[currentRuleType]['survival'][i]) { booFound = true; }
  }
  if(!booFound) { return false; }

  // Birth
  if (cells[_x][_y].stateNow == 0) {
    booFound = false;
    for(var i=0; i<lifeRules[currentRuleType]['birth'].length; i++) {
      if(n==lifeRules[currentRuleType]['birth'][i]) { booFound = true; }
    }
    if(!booFound) { return false; }
  }

  return true;
}

//##############################################################################
