
//##############################################################################

// Init function.
(function() {
  let cc = {x: 99, y: 99};
  let cp = {x: 5,  y: 5};
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
  FUNCTIONS.updateDOMInnerHTML('span_width', cc.x);
  FUNCTIONS.updateDOMInnerHTML('span_height', cc.y);
  FUNCTIONS.updateDOMInnerHTML('span_pixels', cp.x);
  FUNCTIONS.updateDOMValue('range_pixels', cp.x);
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
