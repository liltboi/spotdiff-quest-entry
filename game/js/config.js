// Every fixed number in one place. The game is laid out on a 1280x720 logical canvas that is
// scaled to the window, so these coordinates mean the same thing on any screen.

export const FIELD = { width: 1280, height: 720 };

/** Each picture's logical size: two of them sit side by side. */
export const SCENE = { width: 560, height: 440 };

/** Where the two copies of the scene are painted. */
export const PANELS = [
  { x: 40, y: 138 },
  { x: 680, y: 138 },
];

export const TITLE = 'SPOTDIFF QUEST';

/** Seconds on the clock, differences to find, and hints per level. Difficulty climbs left to right. */
export const LEVELS = [
  { scene: 'harbor', name: 'Harbor Afterglow', note: 'Five small changes in the night harbor', find: 5, seconds: 105, hints: 3, hitRadius: 46 },
  { scene: 'reef', name: 'Coral Cove', note: 'Six changes beneath the lantern-lit reef', find: 6, seconds: 90, hints: 3, hitRadius: 40 },
  { scene: 'orbit', name: 'Orbit Outpost', note: 'Seven changes aboard the last outpost', find: 7, seconds: 75, hints: 2, hitRadius: 34 },
];

export const SCORE = {
  find: 120,
  wrong: -30,
  hintCost: 40,
  perSecondLeft: 5,
  levelClear: 250,
};

/** Milliseconds. */
export const TIMING = {
  findFlash: 700,
  wrongShake: 420,
  hintPulse: 2.6,
  levelBanner: 1700,
  clearScreen: 2600,
};

export const COLORS = {
  page: '#070b16',
  ink: '#f3f6ff',
  dim: '#8b97b8',
  gold: '#ffcf6b',
  goldDeep: '#f39b3d',
  cyan: '#62e6d8',
  danger: '#ff6b7a',
  panel: '#0d1526',
  panelEdge: '#26344f',
  found: '#5ff2c2',
  hint: '#ffd166',
  glow: '#7bdcff',
};

export const FONT = {
  ui: '"Avenir Next", "Segoe UI", "Trebuchet MS", system-ui, sans-serif',
  display: '"Georgia", "Times New Roman", serif',
};
