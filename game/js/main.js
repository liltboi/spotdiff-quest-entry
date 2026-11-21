// Entry point: hand the stage canvas to the game and let it run. All game logic lives in
// game.js, all painting in hud.js and the scene files; this file only wires up the page.

import { startGame } from './game.js';

const canvas = document.getElementById('stage');
const status = document.getElementById('status');

if (!(canvas instanceof HTMLCanvasElement)) {
  throw new Error('Spotdiff Quest needs its #stage canvas');
}

const game = startGame(canvas, status);

// A small handle for automated play-testing with ?debug=1; it changes nothing in play.
if (new URLSearchParams(window.location.search).has('debug')) {
  window.__spotdiff = game;
}
