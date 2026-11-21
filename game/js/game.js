// The game's rules and loop: which level is running, the countdown, scoring, hints, find
// detection, and the transitions between playing, clearing a picture, timing out and winning.
// Painting is delegated to hud.js and scene-render.js; sound to audio.js.

import { FIELD, LEVELS, SCORE, TIMING } from './config.js';
import { createRandom, randomSeed } from './random.js';
import { buildScene } from './scenes/index.js';
import { buildVariants, chooseDifferences, differenceAt, hintTarget as pickHint } from './differences.js';
import { createAudio } from './audio.js';
import { createInput } from './input.js';
import { hitAction, panelAt, render } from './hud.js';
import { stageShot } from './shots.js';

export function startGame(canvas, status) {
  const context = canvas.getContext('2d');
  const params = new URLSearchParams(window.location.search);
  const seedParam = Number.parseInt(params.get('seed') ?? '', 10);
  const baseSeed = Number.isInteger(seedParam) ? seedParam : randomSeed();
  const audio = createAudio();

  const state = {
    time: 0,
    screen: 'play',
    levels: LEVELS,
    levelIndex: 0,
    level: LEVELS[0],
    scene: null,
    differences: [],
    variants: { left: [], right: [] },
    secondsLeft: LEVELS[0].seconds,
    score: 0,
    scoreFinds: 0,
    wrongCount: 0,
    levelStartScore: 0,
    results: [],
    hints: LEVELS[0].hints,
    hintTarget: null,
    hintUntil: 0,
    hintPulse: 0,
    findPulse: 0,
    shake: 0,
    wrongs: [],
    introUntil: 0,
    clear: { at: 0, hold: 3.2, timeBonus: 0, finds: 0 },
    soundOn: true,
    staging: false,
    tickSecond: LEVELS[0].seconds,
  };

  const view = { scale: 1, x: 0, y: 0, ratio: 1 };

  function resize() {
    const ratio = window.devicePixelRatio || 1;
    const width = window.innerWidth;
    const height = window.innerHeight;
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    const scale = Math.min(width / FIELD.width, height / FIELD.height);
    view.scale = scale;
    view.x = (width - FIELD.width * scale) / 2;
    view.y = (height - FIELD.height * scale) / 2;
    view.ratio = ratio;
  }

  function toLogical(clientX, clientY) {
    return { x: (clientX - view.x) / view.scale, y: (clientY - view.y) / view.scale };
  }

  function announce(text) {
    status.textContent = text;
  }

  // --- Level set-up --------------------------------------------------------------------------

  function startLevel(index, options = {}) {
    const level = LEVELS[index];
    const sceneRandom = createRandom((baseSeed + index * 104729) >>> 0);
    const differenceRandom = createRandom((baseSeed ^ 0x9e3779b9 ^ (index * 7919)) >>> 0);
    const scene = buildScene(level.scene, sceneRandom);
    const differences = chooseDifferences(
      scene,
      level.find,
      index,
      differenceRandom,
      level.hitRadius / 40,
    );
    state.levelIndex = index;
    state.level = level;
    state.scene = scene;
    state.differences = differences;
    state.variants = buildVariants(scene, differences);
    state.secondsLeft = level.seconds;
    state.tickSecond = level.seconds;
    state.hints = level.hints;
    state.scoreFinds = 0;
    state.wrongCount = 0;
    state.hintTarget = null;
    state.hintUntil = 0;
    state.hintPulse = 0;
    state.findPulse = 0;
    state.shake = 0;
    state.wrongs = [];
    state.screen = 'play';
    state.levelStartScore = state.score;
    state.introUntil = options.intro === false ? 0 : state.time + TIMING.levelBanner / 1000;
    announce(`Level ${index + 1} of ${LEVELS.length}: ${level.name}. Find ${level.find} differences.`);
  }

  function discover(difference, options = {}) {
    if (!difference || difference.found) return false;
    difference.found = true;
    difference.foundAt = options.foundAt ?? state.time;
    difference.order = state.scoreFinds + 1;
    state.score += SCORE.find;
    state.scoreFinds += 1;
    state.findPulse = 1;
    if (!options.silent && !state.staging) audio.find(state.scoreFinds);
    const remaining = state.differences.filter((item) => !item.found).length;
    if (remaining > 0) {
      announce(`${remaining} difference${remaining === 1 ? '' : 's'} left.`);
    } else {
      announce('All differences found.');
      beginClear();
    }
    return true;
  }

  function beginClear() {
    const finds = state.differences.length;
    const timeBonus = Math.round(Math.max(0, state.secondsLeft)) * SCORE.perSecondLeft;
    state.score += timeBonus + SCORE.levelClear;
    state.clear = { at: state.time, hold: 3.2, timeBonus, finds };
    state.results.push({ name: state.level.name, score: state.score - state.levelStartScore });
    state.screen = 'clear';
    state.hintTarget = null;
    if (!state.staging) audio.levelClear();
    announce(`Level clear. ${finds} differences found. Next picture coming up.`);
  }

  function advance() {
    if (state.screen !== 'clear') return;
    if (state.levelIndex + 1 >= state.levels.length) {
      state.screen = 'victory';
      if (!state.staging) audio.victory();
      announce(`Quest complete. Final score ${state.score}.`);
    } else {
      startLevel(state.levelIndex + 1);
    }
  }

  function timeOut() {
    state.secondsLeft = 0;
    state.screen = 'timeout';
    state.hintTarget = null;
    if (!state.staging) audio.wrong();
    const left = state.differences.filter((item) => !item.found).length;
    announce(`Time's up. ${left} difference${left === 1 ? '' : 's'} stayed hidden.`);
  }

  function retryLevel() {
    state.score = state.levelStartScore;
    startLevel(state.levelIndex);
  }

  function playAgain() {
    state.score = 0;
    state.results = [];
    state.levelStartScore = 0;
    startLevel(0);
  }

  function useHint(free = false) {
    if (state.screen !== 'play' || (!free && state.hints <= 0)) return false;
    const target = pickHint(state.differences, Math.random);
    if (!target) return false;
    state.hintTarget = target;
    state.hintUntil = state.time + TIMING.hintPulse;
    state.hintPulse = 1;
    if (!free) {
      state.hints -= 1;
      state.score = Math.max(0, state.score - SCORE.hintCost);
      if (!state.staging) audio.hint();
      announce(`Hint: look near the sparkle. ${state.hints} hint${state.hints === 1 ? '' : 's'} left.`);
    }
    return true;
  }

  function toggleSound() {
    state.soundOn = !state.soundOn;
    audio.setEnabled(state.soundOn);
    announce(state.soundOn ? 'Sound on.' : 'Sound off.');
  }

  function wrongClick(spot) {
    state.wrongs.push({ panel: spot.index, x: spot.x, y: spot.y, at: state.time });
    if (state.wrongs.length > 8) state.wrongs.shift();
    state.wrongCount += 1;
    state.score = Math.max(0, state.score + SCORE.wrong);
    state.secondsLeft = Math.max(0, state.secondsLeft - 3);
    state.shake = 7;
    if (!state.staging) audio.wrong();
    assertTimerLow();
    if (state.secondsLeft <= 0.001) {
      timeOut();
    } else {
      announce('Not a difference. Three seconds lost.');
    }
  }

  function assertTimerLow() {
    // Keep the tick sound honest after a wrong-click penalty jumps the clock.
    state.tickSecond = Math.ceil(state.secondsLeft);
  }

  // --- Input -----------------------------------------------------------------------------------

  function handlePointer(x, y) {
    audio.unlock();

    const action = hitAction(state, x, y);
    if (action === 'sound') {
      toggleSound();
      return;
    }
    if (action === 'hint' && state.screen === 'play') {
      useHint();
      return;
    }
    if (action === 'retry' && state.screen === 'play') {
      retryLevel();
      return;
    }
    if (state.screen === 'clear') {
      if (action === 'next') advance();
      return;
    }
    if (state.screen === 'victory') {
      if (action === 'playAgain') playAgain();
      return;
    }
    if (state.screen === 'timeout') {
      if (action === 'retry') retryLevel();
      return;
    }
    if (state.screen !== 'play') return;

    const spot = panelAt(x, y);
    if (!spot) return;
    const difference = differenceAt(state.differences, spot.x, spot.y);
    if (difference) discover(difference);
    else wrongClick(spot);
  }

  function handleKey(action) {
    audio.unlock();
    if (action === 'hint') {
      if (state.screen === 'play') useHint();
      return;
    }
    if (action === 'sound') {
      toggleSound();
      return;
    }
    if (action === 'retry') {
      if (state.screen === 'play') retryLevel();
      return;
    }
    if (action === 'confirm') {
      if (state.screen === 'clear') advance();
      else if (state.screen === 'victory') playAgain();
      else if (state.screen === 'timeout') retryLevel();
    }
  }

  // --- Update and draw -------------------------------------------------------------------------

  function update(delta) {
    state.time += delta;
    state.findPulse = Math.max(0, state.findPulse - delta * 2.4);
    state.hintPulse = Math.max(0, state.hintPulse - delta * 1.7);
    state.shake = Math.max(0, state.shake - delta * 22);
    if (state.wrongs.length > 0) {
      state.wrongs = state.wrongs.filter((wrong) => state.time - wrong.at < 0.9);
    }
    if (state.hintTarget && state.hintUntil <= state.time) state.hintTarget = null;

    if (state.screen === 'play') {
      if (state.time >= state.introUntil) {
        state.secondsLeft -= delta;
        const whole = Math.ceil(state.secondsLeft);
        if (whole !== state.tickSecond) {
          state.tickSecond = whole;
          if (whole > 0 && whole <= 5 && !state.staging) audio.tick();
        }
        if (state.secondsLeft <= 0) timeOut();
      }
    } else if (state.screen === 'clear' && state.time - state.clear.at >= state.clear.hold) {
      advance();
    }
  }

  let previous = performance.now();
  function frame(now) {
    const delta = Math.min(0.05, Math.max(0, (now - previous) / 1000));
    previous = now;
    update(delta);

    context.setTransform(1, 0, 0, 1, 0, 0);
    context.fillStyle = '#050810';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.setTransform(
      view.ratio * view.scale,
      0,
      0,
      view.ratio * view.scale,
      view.ratio * view.x,
      view.ratio * view.y,
    );
    render(context, state);
    requestAnimationFrame(frame);
  }

  const api = {
    state,
    startLevel,
    advance,
    playAgain,
    retryLevel,
    revealHint: () => useHint(true),
    discoverNext(foundAt) {
      const next = state.differences.find((item) => !item.found);
      return discover(next, { silent: true, foundAt });
    },
    discoverIndex(index, foundAt) {
      return discover(state.differences[index], { silent: true, foundAt });
    },
    setClock(seconds) {
      state.secondsLeft = seconds;
      state.tickSecond = Math.ceil(seconds);
    },
  };

  startLevel(0);
  stageShot({ state, api, params });
  window.addEventListener('resize', resize);
  resize();
  createInput(canvas, { toLogical, onPointer: handlePointer, onKey: handleKey });
  requestAnimationFrame(frame);

  return api;
}
