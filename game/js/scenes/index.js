// The three hand-built levels, one builder per theme. A builder takes a random stream and
// returns the scene's props, the pool of possible differences, and its backdrop painter.

import { buildHarbor } from './harbor.js';
import { buildReef } from './reef.js';
import { buildOrbit } from './orbit.js';

const BUILDERS = {
  harbor: buildHarbor,
  reef: buildReef,
  orbit: buildOrbit,
};

export function buildScene(key, random) {
  const builder = BUILDERS[key];
  if (!builder) throw new Error(`unknown scene: ${key}`);
  return builder(random);
}
