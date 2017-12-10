
//##############################################################################
// Module to the state of the program.
//##############################################################################

var STATE = ( function() {
  var mod = {};

  return mod;
}());

//##############################################################################

var a = document.getElementById('canvas');
var c = a.getContext('2d');
var ANIMATION;
var frameRate = 8;
var frameCount = 0;

var blur = 1;

var currentRuleType = 'Conway';
var loopType = '(none)';
var paused = false;

var cells;

var loopState = 0;

var lastCustomRuleName = '(custom 1)';

var paused = false;
var stepToNextFrame = false;
var epilepsySafe = true;

var blurPercent;
var colourLiveIsBackground = true;
var colourDeadIsText = true;

var loopRules = ['Conway','Conway'];
var loopRates = [];

var mirrorNS = false;
var mirrorEW = false;
var mirrorNESW = false;
var mirrorNWSE = false;

var mouse = {x: 0, y: 0};
var mouseDown = false;

var now, then, delta, interval = 1000/frameRate;
var globalStateStatic;

//##############################################################################
