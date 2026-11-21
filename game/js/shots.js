// Staged play scenes for the entry's screenshots. These are not fake overlays: each stage runs
// the real level builder, finds real differences through the game's own API, and leaves the game
// in the state a player would be in at that moment. ?shot=cover|harbor|orbit|hint.

const PLANS = {
  cover: { level: 1, found: 3, clock: 47, score: 1180, hint: false },
  harbor: { level: 0, found: 3, clock: 66, score: 760, hint: false },
  orbit: { level: 2, found: 4, clock: 36, score: 1760, hint: false },
  hint: { level: 1, found: 4, clock: 12, score: 2050, hint: true },
  clear: { level: 2, found: 7, clock: 38, score: 3120, hint: false },
};

export function stageShot({ state, api, params }) {
  const name = params.get('shot');
  const plan = PLANS[name];
  if (!plan) return false;

  state.staging = true;
  api.startLevel(plan.level, { intro: false });
  state.time = 5;
  state.introUntil = 0;

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
    api.discoverIndex(order[position], state.time - (recent ? 0.12 : 1.1 + pick * 0.35));
  }

  api.setClock(plan.clock);
  state.score = plan.score;
  state.scoreFinds = plan.found;
  state.levelStartScore = Math.max(0, plan.score - plan.found * 120);
  state.wrongCount = 0;
  state.wrongs = [];
  state.shake = 0;
  if (plan.hint && state.screen === 'play') {
    api.revealHint();
    state.hints = Math.max(0, state.hints - 1);
    state.hintPulse = 0.6;
  }

  if (name === 'clear' && state.screen === 'clear') {
    state.clear.at = state.time - 0.4;
  }

  state.staging = false;
  state.introUntil = 0;
  return true;
}
