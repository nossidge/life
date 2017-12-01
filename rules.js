
//##############################################################################
// Module to store all the defined rules and loops.
//   RULES.rules
//   RULES.loops
//##############################################################################

var RULES = ( function() {
  var mod = {};

  mod.rules = {
    "Conway": {
      "description": "Classic.",
      "character": "Chaotic",
      "birth": [3],
      "survival": [2,3]
    },
    "HighLife": {
      "description": 'Similar to life, but "richer in nice things".',
      "character": "Chaotic",
      "birth": [3,6],
      "survival": [2,3]
    },
    "MazeOfficial": {
      "description": "Complex growing maze-like structures with well-defined walls outlining corridors.",
      "character": "Explosive",
      "birth": [3],
      "survival": [1,2,3,4,5]
    },
    "Mazectric": {
      "description": "Maze patterns that tend to have longer and straighter corridors.",
      "character": "Explosive",
      "birth": [3],
      "survival": [1,2,3,4]
    },
    "Flakes": {
      "description": "Life without death. Ever expanding immortality.",
      "character": "Explosive",
      "birth": [3],
      "survival": [0,1,2,3,4,5,6,7,8]
    },
    "34 Life": {
      "birth": [3,4],
      "survival": [3,4]
    },
    "Dry Life": {
      "birth": [3,7],
      "survival": [2,3]
    },
    "Coral": {
      "birth": [3],
      "survival": [4,5,6,7,8]
    },
    "Move": {
      "birth": [3,6,8],
      "survival": [2,4,5]
    },
    "Quick Maze": {
      "description": "Rapidly spreading, loop terminating.",
      "birth": [3],
      "survival": [1,2,3,4,5,8]
    },
    "Static Maze": {
      "description": "Terminating.",
      "birth": [3],
      "survival": [1,2,3,4,5,6]
    },
    "Static Maze 2": {
      "description": "",
      "birth": [0,2],
      "survival": [1,2,3,4,5]
    },
    "Vote": {
      "birth": [5,6,7,8],
      "survival": [4,5,6,7,8]
    },
    "Coagulations": {
      "birth": [3,7,8],
      "survival": [2,3,5,6,7,8]
    },
    "Walled Cities": {
      "birth": [4,5,6,7,8],
      "survival": [2,3,4,5]
    },
    "Spiky Vote": {
      "birth": [5,6,7,8],
      "survival": [3,5,6,7,8]
    },
    "Spiky Shrink": {
      "birth": [5,6,7,8],
      "survival": [2,5,6,7,8]
    },
    "Accumulation": {
      "description": "Fill up the grid with live cells, very gradually.",
      "birth": [2],
      "survival": [2,4,5,6,7,8]
    },
    "Epilepsy1": {
      "epilepsy": true,
      "birth": [0],
      "survival": [0,3,7,8]
    },
    "Epilepsy2": {
      "epilepsy": true,
      "birth": [0],
      "survival": [0,7,8]
    },
    "Epilepsy3": {
      "epilepsy": true,
      "birth": [0],
      "survival": [0,7]
    },
    "Epilepsy4": {
      "epilepsy": true,
      "birth": [0],
      "survival": [0,8]
    },
    "Wiggle Life": {
      "description": "Kind of like worms squiggling?",
      "birth": [3],
      "survival": [1,3]
    },
    "Mould": {
      "description": "It just keeps growing!",
      "birth": [3,7,8],
      "survival": [1,2,3,4,5,6,7,8]
    },
    "2x2 snakes": {
      "description": "Shrink to nice 2-width snakes.",
      "birth": [1,5],
      "survival": [0,3,4,5,7]
    },

    "(custom 1)": {
      "description": "Custom 1.",
      "custom": true,
      "birth": [],
      "survival": []
    },
    "(custom 2)": {
      "description": "Custom 2.",
      "custom": true,
      "birth": [],
      "survival": []
    },
    "(custom 3)": {
      "description": "Custom 3.",
      "custom": true,
      "birth": [],
      "survival": []
    }
  }

  mod.loops = {
    "Maze Cave": {
      "rules": [
        "MazeOfficial",
        "Vote"
      ]
    },
    "Coagulating Cities": {
      "description": "Works best with high loop frame values, a 99x99 size canvas, and a bit of blur.",
      "rules": [
        "Coagulations",
        "Walled Cities"
      ]
    },
    "Mould Cities": {
      "description": "Best with low loop frame value for mould, high frame for cities, and a bit of blur.",
      "rules": [
        "Mould",
        "Walled Cities"
      ]
    },
    "Accumulate/Shrink": {
      "description": "10 Accumulation frames, 5 Spiky Shrink frames. Add some blur. With a small centred initial state of 'on' cells, acts like a pulsing star.",
      "rules": [
        "Accumulation",
        "Spiky Shrink"
      ],
      "frames": [
        10,
        5
      ]
    },
    "Coral Growth": {
      "description": "",
      "rules": [
        "Accumulation",
        "Coral"
      ]
    },
    "Epilepsy Maze": {
      "description": "",
      "rules": [
        "Static Maze 2",
        "Epilepsy2"
      ]
    }
  }

  return mod;
}());

//##############################################################################
