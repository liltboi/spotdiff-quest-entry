// A deterministic random stream (mulberry32). Each level is built from its own seed, so the same
// seed always paints the same scene and the same set of differences — repeatable screenshots,
// fresh arrangements between plays.

export function createRandom(seed) {
  let state = seed | 0;
  return function random() {
    state = (state + 0x6d2b79f5) | 0;
    let value = Math.imul(state ^ (state >>> 15), 1 | state);
    value = (value + Math.imul(value ^ (value >>> 7), 61 | value)) ^ value;
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

export function shuffle(random, items) {
  const copy = items.slice();
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(random() * (index + 1));
    [copy[index], copy[swap]] = [copy[swap], copy[index]];
  }
  return copy;
}

/** A seed in [1, 2^32) from the clock, for a fresh arrangement each run. */
export function randomSeed() {
  return 1 + Math.floor(Math.random() * 4294967294);
}
