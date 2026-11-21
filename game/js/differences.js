// Choosing the differences and applying them to one copy of the scene.
//
// A scene offers a pool of possible changes. Each entry names a prop and an operation:
//   color / accent / text  recolor or relabel it on the right-hand picture
//   hide                   it is missing from the right-hand picture
//   show                   it is present only on the right-hand picture
//   shift / scale          nudge or resize it on the right-hand picture
//   open                   open the treasure chest (its specific visual state)
// Choosing respects a minimum distance between click targets, so two changes never share the
// same tiny corner of the picture.

import { shuffle } from './random.js';

const MIN_GAP = 106;
const RELAXED_GAP = 78;

export function chooseDifferences(scene, count, levelIndex, random, hitScale = 1) {
  const targetTier = levelIndex + 1;
  const ranked = shuffle(random, scene.pool)
    .map((entry) => ({
      entry,
      rank: Math.abs((entry.tier ?? 2) - targetTier) * 1.3 + random() * 1.1,
    }))
    .sort((a, b) => a.rank - b.rank)
    .map((item) => item.entry);

  const chosen = [];
  const usedProps = new Set();
  for (const gap of [MIN_GAP, RELAXED_GAP, 0]) {
    for (const entry of ranked) {
      if (chosen.length >= count) break;
      if (usedProps.has(entry.prop)) continue;
      const prop = scene.props.find((candidate) => candidate.id === entry.prop);
      if (!prop) continue;
      const near = chosen.some((existing) => {
        const dx = existing.x - prop.cx;
        const dy = existing.y - prop.cy;
        return Math.hypot(dx, dy) < gap;
      });
      if (near) continue;
      usedProps.add(entry.prop);
      chosen.push({
        key: `${entry.prop}:${entry.op}`,
        prop: entry.prop,
        op: entry.op,
        value: entry.value,
        x: prop.cx,
        y: prop.cy,
        hit: 30 * (entry.r ?? 1) * hitScale,
        found: false,
        foundAt: 0,
      });
    }
  }
  return chosen;
}

/** Two prop lists: the untouched left picture, and the right picture with each change applied. */
export function buildVariants(scene, differences) {
  const left = [];
  const right = [];
  for (const prop of scene.props) {
    let leftCopy = prop.side === 'right' ? null : { ...prop };
    let rightCopy = prop.side === 'left' ? null : { ...prop };
    for (const difference of differences) {
      if (difference.prop !== prop.id) continue;
      if (difference.op === 'hide') rightCopy = null;
      if (!rightCopy) continue;
      switch (difference.op) {
        case 'color':
          rightCopy.c = difference.value;
          break;
        case 'accent':
          rightCopy.a = difference.value;
          break;
        case 'text':
          rightCopy.t = difference.value;
          break;
        case 'open':
          rightCopy.open = true;
          break;
        case 'shift':
          rightCopy.x += difference.value.dx;
          rightCopy.y += difference.value.dy;
          break;
        case 'scale':
          rightCopy.s = (rightCopy.s ?? 1) * difference.value;
          break;
        default:
          break;
      }
    }
    if (leftCopy) left.push(leftCopy);
    if (rightCopy) right.push(rightCopy);
  }
  left.sort((a, b) => a.z - b.z);
  right.sort((a, b) => a.z - b.z);
  return { left, right };
}

/** The closest unfound difference to a click, or null. */
export function differenceAt(differences, x, y) {
  let best = null;
  let bestDistance = Infinity;
  for (const difference of differences) {
    if (difference.found) continue;
    const distance = Math.hypot(difference.x - x, difference.y - y);
    if (distance <= difference.hit && distance < bestDistance) {
      best = difference;
      bestDistance = distance;
    }
  }
  return best;
}

/** Pick an unfound difference for the hint, preferring ones the player has not hovered near. */
export function hintTarget(differences, random) {
  const remaining = differences.filter((difference) => !difference.found);
  if (remaining.length === 0) return null;
  return remaining[Math.floor(random() * remaining.length)];
}
