// Copyright Matt Coughlin, 2013
// https://stackoverflow.com/a/15071347/139299

// Detect which browser prefix to use for the specified CSS value
// (e.g., background-image: -moz-linear-gradient(...);
//        background-image:   -o-linear-gradient(...); etc).
function getCssValuePrefix() {
  var rtrnVal = ''; //default to standard syntax
  var prefixes = ['-o-', '-ms-', '-moz-', '-webkit-'];

  // Create a temporary DOM object for testing
  var dom = document.createElement('div');

  for (var i = 0; i < prefixes.length; i++) {
    // Attempt to set the style
    dom.style.background = prefixes[i] + 'linear-gradient(#000000, #ffffff)';

    // Detect if the style was successfully set
    if (dom.style.background) {
      rtrnVal = prefixes[i];
    }
  }

  dom = null;
  delete dom;

  return rtrnVal;
}

// Create a global to cache this value.
var cssValuePrefix = getCssValuePrefix();
