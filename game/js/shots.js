// Staged play scenes for the entry's screenshots. These are not fake overlays: each stage runs
// the real level builder, finds real differences through the game's own API, and leaves the game
// in the state a player would be in at that moment. ?shot=cover|cabin|workshop|harbor|victory|clear.

const PLANS = {
  cover: { level: 2, found: 3, clock: 63, score: 1480, hint: false, combo: true, best: 9840 },
  cabin: { level: 4, found: 3, clock: 47, score: 2380, hint: true, hintIndex: 0, combo: false, best: 9840 },
  workshop: { level: 5, found: 4, clock: 12, score: 3120, hint: false, combo: true, best: 9840 },
  victory: { level: 5, found: 8, clock: 30, score: 8120, hint: false, combo: false, best: 8120, victory: true },
};

export function stageShot({ state, api, params }) {
  const name = params.get('shot');
  const plan = PLANS[name];
  if (!plan) return false;

  state.staging = true;
  api.startLevel(plan.level, { intro: false });
  state.time = 5;
  state.introUntil = 0;
  if (plan.best > 0) state.best = { score: plan.best, stars: 3 };

  // Spread the found marks across the picture instead of clustering them, so a screenshot
  // shows marks at several depths and on both halves of the scene.
  const order = state.differences
    .map((difference, index) => ({ index, x: difference.x }))
    .sort((a, b) => a.x - b.x)
    .map((item) => item.index);
  for (let pick = 0; pick < plan.found; pick += 1) {
    const position = plan.found === 1
      ? 0
      : Math.round((pick * (order.length - 1)) / (plan.found - 1));
    const recent = pick === plan.found - 1;
    api.discoverIndex(order[position], state.time - (recent ? 0.14 : 0.9 + (plan.found - 1 - pick) * 0.4));
  }

  // Stills read more cleanly without floating score text; the burst on the newest find and
  // the combo badge already tell the story.
  state.popups = [];

  if (!plan.combo) {
    state.streak = 0;
    state.comboUntil = 0;
    state.comboBonus = 0;
  }

  api.setClock(plan.clock);
  state.score = plan.score;
  state.scoreFinds = plan.found;
  state.levelStartScore = Math.max(0, plan.score - plan.found * 120);
  state.wrongCount = 0;
  state.wrongs = [];
  state.shake = 0;

  if (plan.hint && state.screen === 'play') {
    const unfound = state.differences.filter((difference) => !difference.found);
    const target = unfound[Math.min(plan.hintIndex ?? 0, Math.max(0, unfound.length - 1))];
    if (target) {
      state.hintTarget = target;
      state.hintUntil = state.time + 4;
      state.hintPulse = 0.6;
      state.hints = Math.max(0, state.level.hints - 1);
    }
  }

  if (plan.clear && state.screen === 'clear') {
    state.clear.at = state.time - 0.8;
  }

  if (plan.victory) {
    state.screen = 'victory';
    state.results = state.levels.map((level, index) => ({
      name: level.name,
      score: [1150, 1280, 1420, 1210, 1560, 1500][index] ?? 1200,
    }));
    state.stars = 3;
    state.victoryAt = state.time - 1.2;
    state.newBest = true;
    state.best = { score: state.score, stars: 3 };
    state.hintTarget = null;
    state.popups = [];
    state.streak = 0;
    state.comboUntil = 0;
  }

  state.staging = false;
  state.introUntil = 0;
  state.transitionAt = -99;
  return true;
}
