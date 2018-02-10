
//##############################################################################

// Init function.
(function() {
  let cc = {x: 99, y: 99};
  let cp = {x: 8,  y: 8};
  CELLS.cellCount(cc);
  CELLS.cellPixels(cp);

  CANVAS.a.width  = cc.x * cp.x;
  CANVAS.a.height = cc.y * cp.y;
  UI.updateRuleByName(STATE.currentRuleType());
  STATE.blurPercent(0);
  UI.updateFramerate();
  ANIMATION.initCanvas();
  EPILEPSY.setEpilepsy(true);
  UI.HtmlLifeRulesDropDowns();
  UI.HtmlLoopTypeDropDown();
  UI.updateCanvasSize();
  UI.updatePixelSize();
  UI.setColourLiveIsBackground(true);
  UI.setColourDeadIsText(true);
  UI.toggleHtmlLoopTypeDesc();
  UI.toggleHtmlRulesDesc();
  STATE.updateLoopRate(0, 20);
  STATE.updateLoopRate(1, 20);
  STATE.updateLoopRule(0, 'Conway');
  STATE.updateLoopRule(1, 'Conway');
  UI.updateLoopType('(none)');
  UI.toggleMirrorNS();
  UI.toggleMirrorEW();
  UI.toggleMirrorNESW();
  UI.toggleMirrorNWSE();
  UI.drawButtonsAll();
})();

//##############################################################################
