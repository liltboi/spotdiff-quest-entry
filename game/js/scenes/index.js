// The six hand-built levels, one builder per theme. A builder takes a random stream and
// returns the scene's props, the pool of possible differences, its backdrop painter and an
// optional ambient layer animated on the shared game clock.

import { buildHarbor } from './harbor.js';
import { buildReef } from './reef.js';
import { buildOrbit } from './orbit.js';
import { buildMarket } from './market.js';
import { buildCabin } from './cabin.js';
import { buildWorkshop } from './workshop.js';

const BUILDERS = {
  harbor: buildHarbor,
  reef: buildReef,
  orbit: buildOrbit,
  market: buildMarket,
  cabin: buildCabin,
  workshop: buildWorkshop,
};

export function buildScene(key, random) {
  const builder = BUILDERS[key];
  if (!builder) throw new Error(`unknown scene: ${key}`);
  return builder(random);
}
