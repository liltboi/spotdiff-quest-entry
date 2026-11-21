// Level six: "Clockwork Workshop". A tinkerer's room at night: brick wall, a round window onto
// the stars, shelves of jars and books, a brass clock, turning gears, a workbench of tools and
// a copper kettle breathing steam. Gears, clock hands, the pendulum and the candle all move on
// the shared game clock, so both copies animate in step.

import { TAU, dot, ellipse, gradient, hash01, radial, roundRect, withAlpha } from '../draw.js';

const W = 560;
const H = 440;
const FLOOR = 372;

export function buildWorkshop(random) {
  const stars = [];
  for (let index = 0; index < 26; index += 1) {
    stars.push({ x: 48 + random() * 88, y: 52 + random() * 82, r: 0.5 + random() * 1.1, phase: random() * TAU });
  }
  const dust = [];
  for (let index = 0; index < 42; index += 1) {
    dust.push({
      x: random() * W,
      y: 40 + random() * 300,
      r: 0.5 + random() * 1.3,
      phase: random() * TAU,
      speed: 0.4 + random() * 0.8,
    });
  }
  const props = [];

  // --- Backdrop: brick wall, window, pipes and the plank floor --------------------------------
  const backdrop = (ctx, time = 0) => {
    ctx.fillStyle = gradient(ctx, 0, 0, 0, FLOOR, [
      [0, '#1c1414'],
      [0.45, '#2b1e19'],
      [0.8, '#3a271e'],
      [1, '#2a1b16'],
    ]);
    ctx.fillRect(0, 0, W, FLOOR);

    // Brick courses, irregular in tone.
    const rowH = 26;
    for (let row = 0; row < 15; row += 1) {
      const y = row * rowH;
      const offset = (row % 2) * 34;
      for (let col = -1; col < 9; col += 1) {
        const x = offset + col * 68;
        const tone = hash01(row * 7.1 + col * 3.7);
        ctx.fillStyle = `rgba(255, 186, 130, ${0.018 + tone * 0.05})`;
        ctx.fillRect(x + 1, y + 1, 66, rowH - 2);
        ctx.strokeStyle = 'rgba(12, 8, 8, 0.22)';
        ctx.lineWidth = 1;
        ctx.strokeRect(x + 0.5, y + 0.5, 67, rowH - 1);
        if (tone > 0.82) {
          ctx.fillStyle = 'rgba(8, 6, 6, 0.18)';
          ctx.fillRect(x + 10, y + 8, 30, 10);
        }
      }
    }
    // A warm wash from the ceiling bulbs.
    ctx.fillStyle = radial(ctx, 300, 30, 20, 320, [
      [0, 'rgba(255, 180, 100, 0.14)'],
      [1, 'rgba(255, 180, 100, 0)'],
    ]);
    ctx.fillRect(0, 0, W, 340);

    // Round window onto the night.
    drawWindow(ctx, stars, time);

    // A shaft of cool moonlight from the window.
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const shaft = ctx.createLinearGradient(80, 120, 230, 400);
    shaft.addColorStop(0, 'rgba(150, 190, 255, 0.14)');
    shaft.addColorStop(0.6, 'rgba(150, 190, 255, 0.045)');
    shaft.addColorStop(1, 'rgba(150, 190, 255, 0)');
    ctx.fillStyle = shaft;
    ctx.beginPath();
    ctx.moveTo(50, 150);
    ctx.lineTo(130, 150);
    ctx.lineTo(250, 440);
    ctx.lineTo(170, 440);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // Ceiling pipe run with a patina valve body.
    ctx.strokeStyle = '#4e4a44';
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.moveTo(0, 34);
    ctx.lineTo(W, 30);
    ctx.stroke();
    ctx.strokeStyle = 'rgba(255, 230, 190, 0.12)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, 31);
    ctx.lineTo(W, 27);
    ctx.stroke();
    ctx.fillStyle = '#3c3833';
    for (let joint = 40; joint < W; joint += 96) {
      ctx.fillRect(joint, 25, 8, 15);
    }

    // Floor: wide planks in perspective, polished by years of boots.
    ctx.fillStyle = gradient(ctx, 0, FLOOR - 10, 0, H, [
      [0, '#4a3123'],
      [0.45, '#3a2519'],
      [1, '#20140f'],
    ]);
    ctx.fillRect(0, FLOOR - 8, W, H - FLOOR + 8);
    for (let plank = 0; plank < 9; plank += 1) {
      const y = FLOOR - 6 + plank * 8;
      ctx.strokeStyle = `rgba(20, 12, 8, ${0.22 + plank * 0.02})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(W, y + plank * 0.6);
      ctx.stroke();
      ctx.strokeStyle = `rgba(255, 210, 160, ${0.05 - plank * 0.004})`;
      ctx.beginPath();
      ctx.moveTo(0, y + 1.2);
      ctx.lineTo(W, y + 1.2 + plank * 0.6);
      ctx.stroke();
    }
    // Warm reflections on the floorboards.
    ctx.fillStyle = gradient(ctx, 0, FLOOR, 0, H, [
      [0, 'rgba(255, 180, 100, 0.12)'],
      [1, 'rgba(255, 180, 100, 0)'],
    ]);
    ctx.fillRect(0, FLOOR, W, 68);
  };

  // --- Props ---------------------------------------------------------------------------------
  props.push({
    id: 'clock', type: 'clock', x: 462, y: 122, r: 54, z: 3.3,
    c: '#8a6a36', a: '#f1e2c2',
  });
  props.push({ id: 'hands', type: 'hands', x: 462, y: 122, rot: 0, z: 3.6, c: '#2b2119' });
  props.push({
    id: 'gearBig', type: 'gear', x: 342, y: 120, r: 38, n: 14, rot: 0, phase: 0.4,
    z: 3.0, c: '#a9743a', a: '#e0aa62',
  });
  props.push({
    id: 'gearMid', type: 'gear', x: 266, y: 158, r: 26, n: 10, rot: 0, phase: 1.6,
    z: 2.9, c: '#6f8e81', a: '#a9c9b9',
  });
  props.push({
    id: 'gearSmall', type: 'gear', x: 396, y: 174, r: 17, n: 8, rot: 0, phase: 2.4,
    z: 3.1, c: '#c29a52', a: '#f0c87c',
  });
  props.push({ id: 'pendulum', type: 'pendulum', x: 462, y: 182, z: 3.4, c: '#b8873f', a: '#e8be74' });

  props.push({ id: 'frame', type: 'frame', x: 530, y: 88, z: 2.5, c: '#6e5526' });
  props.push({ id: 'sillPlant', type: 'sillPlant', x: 136, y: 158, z: 2.6, c: '#3f7d5c', a: '#b06a3d' });
  props.push({ id: 'pegboard', type: 'pegboard', x: 250, y: 252, w: 168, h: 78, z: 2.8, c: '#4a3127', a: '#9aa7b4' });

  props.push({ id: 'shelves', type: 'shelves', x: 18, y: 196, w: 198, h: 132, z: 3.6, c: '#4a3127', a: '#2a1b14' });
  props.push({ id: 'jars', type: 'jars', x: 64, y: 190, n: 4, z: 3.8, c: '#9fd8c8', a: '#e6c48a' });
  props.push({ id: 'books', type: 'books', x: 142, y: 190, n: 5, z: 3.8, c: '#b04b4f', a: '#e6c48a' });
  props.push({ id: 'owl', type: 'owl', x: 170, y: 252, s: 1, z: 3.9, c: '#b98a45', a: '#7fe8d8' });

  props.push({ id: 'bulbA', type: 'bulb', x: 150, y: 64, z: 4.2, c: '#ffcf7a' });
  props.push({ id: 'bulbB', type: 'bulb', x: 322, y: 58, z: 4.2, c: '#ffd98a' });
  props.push({ id: 'valve', type: 'valve', x: 232, y: 196, rot: 0, z: 4.0, c: '#7f9c8c' });
  props.push({ id: 'anchor', type: 'anchor', x: 232, y: 196, z: 4.0, c: '#5b6f64' });

  props.push({ id: 'bench', type: 'bench', x: 232, y: 338, w: 320, h: 34, z: 5, c: '#5a3a2a', a: '#7d5335' });
  props.push({ id: 'blueprint', type: 'blueprint', x: 282, y: 332, w: 82, h: 48, z: 5.4, c: '#e8d9b4', a: '#7c5a3a' });
  props.push({ id: 'magnifier', type: 'magnifier', x: 380, y: 322, s: 1, z: 5.6, c: '#c9a25a', a: '#bfe6ff' });
  props.push({ id: 'candle', type: 'candle', x: 418, y: 320, s: 1, z: 5.5, c: '#f2e4c6', a: '#ffb45e' });
  props.push({ id: 'kettle', type: 'kettle', x: 484, y: 312, z: 5.5, c: '#b06a3d', a: '#e2a466' });
  props.push({ id: 'toolbox', type: 'toolbox', x: 526, y: 324, w: 46, h: 28, z: 5.6, c: '#3f6f7a', a: '#d9b26a' });
  props.push({ id: 'spring', type: 'spring', x: 350, y: 350, z: 5.8, c: '#c9d3dc' });
  props.push({ id: 'wrench', type: 'wrench', x: 316, y: 350, z: 5.8, c: '#b9c4cf' });

  props.push({ id: 'stool', type: 'stool', x: 258, y: 398, z: 6.4, c: '#5a3a2a', a: '#7d5335' });
  props.push({ id: 'crate', type: 'crate', x: 512, y: 394, w: 54, h: 40, z: 6.2, c: '#6b472f', a: '#e2b567' });
  props.push({ id: 'crateL', type: 'crate', x: 42, y: 388, w: 58, h: 42, z: 6.0, c: '#6b472f', a: '#e2b567' });
  props.push({ id: 'bucket2', type: 'bucket2', x: 152, y: 426, z: 6.1, c: '#4e5a60', a: '#aab6c4' });
  props.push({ id: 'gearPile', type: 'gearPile', x: 196, y: 422, z: 6.3, c: '#a9743a', a: '#e0aa62' });
  props.push({ id: 'sawdust', type: 'sawdust', x: 300, y: 420, z: 6.6, c: '#a88b62' });

  const centres = {
    clock: [462, 122],
    hands: [462, 108],
    gearBig: [342, 120],
    gearMid: [266, 158],
    gearSmall: [396, 174],
    pendulum: [462, 232],
    jars: [64, 188],
    books: [142, 186],
    owl: [170, 242],
    pegboard: [334, 290],
    sillPlant: [136, 154],
    bulbA: [150, 84],
    bulbB: [322, 78],
    valve: [232, 196],
    blueprint: [282, 332],
    magnifier: [380, 318],
    candle: [418, 310],
    kettle: [484, 306],
    toolbox: [526, 322],
    spring: [350, 348],
    wrench: [316, 348],
    stool: [258, 392],
    crate: [539, 414],
  };
  for (const prop of props) {
    const centre = centres[prop.id];
    if (centre) {
      prop.cx = centre[0];
      prop.cy = centre[1];
    } else {
      prop.cx = prop.x + (prop.w ?? 0) / 2;
      prop.cy = prop.y + (prop.h ?? 0) / 2;
    }
  }

  const pool = [
    { prop: 'bulbB', op: 'hide', tier: 1, r: 1.1 },
    { prop: 'pendulum', op: 'hide', tier: 1, r: 1.15 },
    { prop: 'blueprint', op: 'hide', tier: 1, r: 1.2 },
    { prop: 'spring', op: 'hide', tier: 2, r: 1.1 },
    { prop: 'wrench', op: 'hide', tier: 2, r: 1.1 },
    { prop: 'gearMid', op: 'hide', tier: 2, r: 1.15 },
    { prop: 'kettle', op: 'hide', tier: 2, r: 1.2 },
    { prop: 'candle', op: 'hide', tier: 2, r: 1.15 },
    { prop: 'jars', op: 'count', value: 6, tier: 3, r: 1.25 },
    { prop: 'books', op: 'count', value: 7, tier: 3, r: 1.25 },
    { prop: 'gearBig', op: 'rotate', value: 0.42, tier: 3, r: 1.25 },
    { prop: 'gearBig', op: 'count', value: 18, tier: 3, r: 1.3 },
    { prop: 'hands', op: 'rotate', value: 1.1, tier: 3, r: 1.2 },
    { prop: 'valve', op: 'rotate', value: 1.1, tier: 3, r: 1.2 },
    { prop: 'bulbA', op: 'color', value: '#7fe4ff', tier: 2, r: 1.15 },
    { prop: 'gearSmall', op: 'color', value: '#c95a4f', tier: 3, r: 1.15 },
    { prop: 'jars', op: 'color', value: '#f0a8c8', tier: 2, r: 1.2 },
    { prop: 'books', op: 'color', value: '#3f7dde', tier: 2, r: 1.2 },
    { prop: 'clock', op: 'color', value: '#cfe3ff', tier: 2, r: 1.2 },
    { prop: 'owl', op: 'accent', value: '#ffd166', tier: 3, r: 1.2 },
    { prop: 'candle', op: 'scale', value: 1.32, tier: 3, r: 1.15 },
    { prop: 'magnifier', op: 'shift', value: { dx: 15, dy: -8 }, tier: 3, r: 1.2 },
    { prop: 'toolbox', op: 'color', value: '#a34b3f', tier: 2, r: 1.2 },
    { prop: 'stool', op: 'shift', value: { dx: -16, dy: 2 }, tier: 2, r: 1.25 },
    { prop: 'pegboard', op: 'hide', tier: 2, r: 1.25 },
    { prop: 'sillPlant', op: 'hide', tier: 1, r: 1.1 },
    { prop: 'pegboard', op: 'accent', value: '#c9a25a', tier: 3, r: 1.25 },
  ];

  const ambient = (ctx, time = 0) => {
    // Dust suspended in the moonlight, drifting very slowly.
    for (const mote of dust) {
      const x = mote.x + Math.sin(time * mote.speed * 0.6 + mote.phase) * 6;
      const y = mote.y + Math.cos(time * mote.speed * 0.4 + mote.phase) * 8
        + Math.sin(time * 0.2) * 6;
      ctx.globalAlpha = 0.1 + hash01(mote.x + mote.y) * 0.16;
      dot(ctx, x, y, mote.r, '#ffe6bd');
    }
    ctx.globalAlpha = 1;
    // The ceiling bulbs breathe.
    for (const lamp of [{ x: 150, y: 84 }, { x: 322, y: 78 }]) {
      const pulse = 0.06 + 0.03 * Math.sin(time * 2.1 + lamp.x);
      ctx.fillStyle = radial(ctx, lamp.x, lamp.y, 2, 60, [
        [0, `rgba(255, 208, 130, ${pulse})`],
        [1, 'rgba(255, 208, 130, 0)'],
      ]);
      ctx.fillRect(lamp.x - 64, lamp.y - 64, 128, 128);
    }
  };

  return {
    key: 'workshop',
    name: 'Clockwork Workshop',
    tint: '#f0b269',
    props,
    pool,
    backdrop,
    ambient,
    drawProp: drawWorkshopProp,
  };
}

// --- Backdrop details ------------------------------------------------------------------------

function drawWindow(ctx, stars, time) {
  const x = 86;
  const y = 104;
  const r = 58;
  ctx.save();
  // Brass frame.
  ctx.fillStyle = '#6e5526';
  ctx.beginPath();
  ctx.arc(x, y, r + 8, 0, TAU);
  ctx.fill();
  ctx.fillStyle = '#917436';
  ctx.beginPath();
  ctx.arc(x, y, r + 4, 0, TAU);
  ctx.fill();
  // Night beyond.
  ctx.fillStyle = gradient(ctx, x - r, y - r, x + r, y + r, [
    [0, '#0a1430'],
    [0.6, '#132347'],
    [1, '#274466'],
  ]);
  ctx.beginPath();
  ctx.arc(x, y, r, 0, TAU);
  ctx.fill();
  // Stars.
  for (const star of stars) {
    const twinkle = 0.5 + 0.5 * Math.sin(time * 1.5 + star.phase);
    ctx.globalAlpha = 0.4 + twinkle * 0.55;
    dot(ctx, star.x, star.y, star.r, '#eef4ff');
  }
  ctx.globalAlpha = 1;
  // A small crescent moon.
  ctx.fillStyle = '#e9eefc';
  ctx.beginPath();
  ctx.arc(62, 76, 11, 0, TAU);
  ctx.fill();
  ctx.fillStyle = '#132347';
  ctx.beginPath();
  ctx.arc(57, 72, 10, 0, TAU);
  ctx.fill();
  // Mullions.
  ctx.strokeStyle = '#7c6430';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(x, y - r);
  ctx.lineTo(x, y + r);
  ctx.moveTo(x - r, y);
  ctx.lineTo(x + r, y);
  ctx.stroke();
  ctx.strokeStyle = 'rgba(255, 232, 180, 0.25)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(x, y, r - 3, Math.PI * 1.05, Math.PI * 1.7);
  ctx.stroke();
  // Rivets.
  for (let rivet = 0; rivet < 8; rivet += 1) {
    const angle = (rivet / 8) * TAU + 0.2;
    dot(ctx, x + Math.cos(angle) * (r + 6), y + Math.sin(angle) * (r + 6), 1.4, '#c9a25a');
  }
  // Sill.
  ctx.fillStyle = '#7a5a34';
  roundRect(ctx, x - r - 12, y + r + 5, (r + 12) * 2, 7, 3);
  ctx.fill();
  ctx.fillStyle = 'rgba(255, 225, 170, 0.14)';
  ctx.fillRect(x - r - 10, y + r + 5, (r + 10) * 2, 1.5);
  ctx.restore();
}

// --- Prop painters ---------------------------------------------------------------------------

function drawWorkshopProp(ctx, p, time = 0) {
  switch (p.type) {
    case 'clock': return drawClock(ctx, p);
    case 'hands': return drawHands(ctx, p, time);
    case 'gear': return drawGear(ctx, p, time);
    case 'pendulum': return drawPendulum(ctx, p, time);
    case 'shelves': return drawShelves(ctx, p);
    case 'jars': return drawJars(ctx, p);
    case 'books': return drawBooks(ctx, p);
    case 'owl': return drawOwl(ctx, p, time);
    case 'bulb': return drawBulb(ctx, p, time);
    case 'valve': return drawValve(ctx, p);
    case 'anchor': return drawAnchor(ctx, p);
    case 'bench': return drawBench(ctx, p);
    case 'blueprint': return drawBlueprint(ctx, p);
    case 'magnifier': return drawMagnifier(ctx, p);
    case 'candle': return drawCandle(ctx, p, time);
    case 'kettle': return drawKettle(ctx, p, time);
    case 'toolbox': return drawToolbox(ctx, p);
    case 'spring': return drawSpring(ctx, p);
    case 'wrench': return drawWrench(ctx, p);
    case 'stool': return drawStool(ctx, p);
    case 'crate': return drawCrate(ctx, p);
    case 'sawdust': return drawSawdust(ctx, p);
    case 'frame': return drawFrame(ctx, p);
    case 'sillPlant': return drawSillPlant(ctx, p);
    case 'pegboard': return drawPegboard(ctx, p);
    case 'bucket2': return drawBucket2(ctx, p);
    case 'gearPile': return drawGearPile(ctx, p, time);
    default: return undefined;
  }
}

function drawClock(ctx, p) {
  const r = p.r;
  ctx.save();
  // Shadow on the wall.
  ctx.fillStyle = 'rgba(0, 0, 0, 0.28)';
  ctx.beginPath();
  ctx.arc(p.x + 5, p.y + 7, r + 6, 0, TAU);
  ctx.fill();
  // Brass rim.
  const rim = gradient(ctx, p.x - r, p.y - r, p.x + r, p.y + r, [
    [0, '#d9b46a'],
    [0.5, '#8a6a36'],
    [1, '#e6c27a'],
  ]);
  ctx.fillStyle = rim;
  ctx.beginPath();
  ctx.arc(p.x, p.y, r + 6, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = 'rgba(40, 28, 16, 0.5)';
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.arc(p.x, p.y, r + 3, 0, TAU);
  ctx.stroke();
  // Face.
  ctx.fillStyle = p.a;
  ctx.beginPath();
  ctx.arc(p.x, p.y, r, 0, TAU);
  ctx.fill();
  ctx.fillStyle = 'rgba(150, 120, 80, 0.09)';
  ctx.beginPath();
  ctx.arc(p.x + r * 0.25, p.y + r * 0.2, r * 0.8, 0, TAU);
  ctx.fill();
  // Hour marks.
  for (let mark = 0; mark < 12; mark += 1) {
    const angle = (mark / 12) * TAU - Math.PI / 2;
    const inner = mark % 3 === 0 ? r * 0.72 : r * 0.82;
    ctx.strokeStyle = mark % 3 === 0 ? '#4a3420' : 'rgba(74, 52, 32, 0.55)';
    ctx.lineWidth = mark % 3 === 0 ? 2.4 : 1.2;
    ctx.beginPath();
    ctx.moveTo(p.x + Math.cos(angle) * inner, p.y + Math.sin(angle) * inner);
    ctx.lineTo(p.x + Math.cos(angle) * r * 0.9, p.y + Math.sin(angle) * r * 0.9);
    ctx.stroke();
  }
  // Inner ring and maker's mark.
  ctx.strokeStyle = 'rgba(120, 92, 54, 0.4)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(p.x, p.y, r * 0.58, 0, TAU);
  ctx.stroke();
  ctx.fillStyle = 'rgba(110, 82, 48, 0.55)';
  ctx.font = '700 7px "Trebuchet MS", "Segoe UI", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('No. 7', p.x, p.y + r * 0.3);
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  // Glass sheen.
  ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
  ctx.beginPath();
  ctx.ellipse(p.x - r * 0.3, p.y - r * 0.35, r * 0.42, r * 0.26, -0.5, 0, TAU);
  ctx.fill();
  ctx.restore();
}

function drawHands(ctx, p, time) {
  ctx.save();
  ctx.translate(p.x, p.y);
  // Time moves, plus the difference's own offset.
  const minute = (time * 0.06) % TAU;
  const hour = (time * 0.006) % TAU;
  const extra = p.rot ?? 0;
  ctx.strokeStyle = p.c;
  ctx.lineCap = 'round';
  // Hour hand, short and broad.
  ctx.save();
  ctx.rotate(hour - Math.PI / 2 + extra);
  ctx.lineWidth = 4.5;
  ctx.beginPath();
  ctx.moveTo(0, 6);
  ctx.lineTo(0, -p.r * 0.44);
  ctx.stroke();
  ctx.restore();
  // Minute hand.
  ctx.save();
  ctx.rotate(minute - Math.PI / 2 + extra);
  ctx.lineWidth = 2.6;
  ctx.beginPath();
  ctx.moveTo(0, 8);
  ctx.lineTo(0, -p.r * 0.72);
  ctx.stroke();
  ctx.restore();
  // Pin.
  dot(ctx, 0, 0, 3, '#b48a42');
  dot(ctx, -0.8, -0.8, 1.2, 'rgba(255, 240, 200, 0.8)');
  ctx.restore();
}

function drawGear(ctx, p, time) {
  const r = p.r;
  const teeth = Math.max(6, p.n ?? 12);
  const spin = time * (0.12 + 6 / teeth) * (p.phase % 2 < 1 ? 1 : -1) + (p.rot ?? 0) + p.phase;
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.rotate(spin);
  // Teeth ring.
  ctx.beginPath();
  for (let index = 0; index < teeth * 2; index += 1) {
    const radius = index % 2 === 0 ? r : r * 0.84;
    const angle = (index / (teeth * 2)) * TAU;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    if (index === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fillStyle = p.c;
  ctx.fill();
  ctx.strokeStyle = 'rgba(40, 26, 14, 0.6)';
  ctx.lineWidth = 1.2;
  ctx.stroke();
  // Inner rim.
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.72, 0, TAU);
  ctx.fillStyle = p.a;
  ctx.fill();
  ctx.fillStyle = p.c;
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.5, 0, TAU);
  ctx.fill();
  // Spokes / cut-outs.
  for (let hole = 0; hole < 4; hole += 1) {
    const angle = (hole / 4) * TAU + 0.4;
    ctx.fillStyle = 'rgba(20, 14, 10, 0.5)';
    ctx.beginPath();
    ctx.arc(Math.cos(angle) * r * 0.38, Math.sin(angle) * r * 0.38, r * 0.13, 0, TAU);
    ctx.fill();
  }
  // Hub.
  dot(ctx, 0, 0, r * 0.14, '#3a2a1a');
  dot(ctx, -r * 0.04, -r * 0.04, r * 0.05, 'rgba(255, 230, 180, 0.7)');
  // Sheen along the upper left.
  ctx.strokeStyle = 'rgba(255, 240, 200, 0.28)';
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.92, Math.PI * 1.05, Math.PI * 1.55);
  ctx.stroke();
  ctx.restore();
}

function drawPendulum(ctx, p, time) {
  const swing = Math.sin(time * 1.7) * 0.16;
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.rotate(swing);
  ctx.strokeStyle = '#8a6a36';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(0, 72);
  ctx.stroke();
  // Brass bob.
  const bob = gradient(ctx, -11, 60, 11, 84, [
    [0, p.a],
    [1, p.c],
  ]);
  ctx.fillStyle = bob;
  ctx.beginPath();
  ctx.arc(0, 78, 12, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = 'rgba(60, 40, 20, 0.5)';
  ctx.lineWidth = 1.2;
  ctx.stroke();
  ctx.fillStyle = 'rgba(255, 255, 230, 0.45)';
  ctx.beginPath();
  ctx.arc(-4, 74, 3.2, 0, TAU);
  ctx.fill();
  ctx.restore();
}

function drawShelves(ctx, p) {
  const { x, y, w } = p;
  ctx.save();
  // Back shadow.
  ctx.fillStyle = 'rgba(10, 6, 4, 0.25)';
  ctx.fillRect(x, y, w, p.h);
  for (let board = 0; board < 2; board += 1) {
    const by = y + board * 62;
    ctx.fillStyle = p.a;
    ctx.fillRect(x, by, w, 4);
    ctx.fillStyle = p.c;
    ctx.fillRect(x, by + 4, w, 7);
    ctx.fillStyle = 'rgba(255, 212, 150, 0.16)';
    ctx.fillRect(x, by, w, 1.4);
    // Brackets.
    ctx.strokeStyle = '#3a261c';
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(x + 18, by + 11);
    ctx.lineTo(x + 30, by + 26);
    ctx.lineTo(x + 42, by + 11);
    ctx.moveTo(x + w - 42, by + 11);
    ctx.lineTo(x + w - 30, by + 26);
    ctx.lineTo(x + w - 18, by + 11);
    ctx.stroke();
  }
  // Board sides.
  ctx.fillStyle = '#3a261c';
  ctx.fillRect(x, y, 4, p.h);
  ctx.fillRect(x + w - 4, y, 4, p.h);
  ctx.restore();
}

function drawJars(ctx, p) {
  const n = p.n ?? 4;
  ctx.save();
  for (let index = 0; index < n; index += 1) {
    const x = p.x + (index - (n - 1) / 2) * 19;
    const h = 20 + hash01(index * 3.1) * 12;
    const y = p.y - h;
    // Jar body.
    ctx.fillStyle = withAlpha(p.c, 0.45);
    roundRect(ctx, x - 7, y, 14, h, 5);
    ctx.fill();
    ctx.strokeStyle = withAlpha(p.c, 0.8);
    ctx.lineWidth = 1;
    ctx.stroke();
    // Contents.
    ctx.fillStyle = withAlpha(p.a, 0.55);
    roundRect(ctx, x - 5, y + h * 0.45, 10, h * 0.5, 3);
    ctx.fill();
    // Lid.
    ctx.fillStyle = '#5a4630';
    ctx.fillRect(x - 7, y - 3, 14, 4);
    // Highlight.
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.fillRect(x - 4, y + 4, 1.6, h * 0.45);
    // Little bubbles.
    dot(ctx, x + 2, y + h * 0.6, 1, 'rgba(255, 255, 255, 0.4)');
  }
  ctx.restore();
}

function drawBooks(ctx, p) {
  const n = p.n ?? 5;
  const palette = [p.c, '#3f6f7a', '#8a6a36', '#5a6b3f', '#7a4b63', '#a9743a', '#4a5f8a'];
  ctx.save();
  let cursor = p.x - (n - 1) * 5;
  for (let index = 0; index < n; index += 1) {
    const w = 7 + hash01(index * 2.7) * 4;
    const h = 24 + hash01(index * 5.3) * 10;
    ctx.save();
    ctx.translate(cursor, p.y);
    ctx.rotate(index === n - 1 ? 0.16 : 0);
    ctx.fillStyle = palette[index % palette.length];
    ctx.fillRect(-w / 2, -h, w, h);
    ctx.fillStyle = 'rgba(255, 220, 160, 0.35)';
    ctx.fillRect(-w / 2, -h + 4, w, 1);
    ctx.fillRect(-w / 2, -9, w, 1);
    ctx.restore();
    cursor += w + 2;
  }
  ctx.restore();
}

function drawOwl(ctx, p, time) {
  const s = p.s ?? 1;
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.scale(s, s);
  // Body.
  const body = gradient(ctx, -10, -30, 10, 0, [
    [0, '#d8a85c'],
    [1, p.c],
  ]);
  ctx.fillStyle = body;
  ctx.beginPath();
  ctx.ellipse(0, -14, 12, 15, 0, 0, TAU);
  ctx.fill();
  // Wing plates.
  ctx.strokeStyle = 'rgba(70, 46, 20, 0.55)';
  ctx.lineWidth = 1;
  for (let plate = 0; plate < 3; plate += 1) {
    ctx.beginPath();
    ctx.arc(0, -12, 8 - plate * 2, 0.2, Math.PI - 0.2);
    ctx.stroke();
  }
  // Head cap.
  ctx.fillStyle = '#c9a25a';
  ctx.beginPath();
  ctx.arc(0, -30, 9, 0, TAU);
  ctx.fill();
  // Ear tufts.
  ctx.fillStyle = p.c;
  ctx.beginPath();
  ctx.moveTo(-9, -34);
  ctx.lineTo(-11, -42);
  ctx.lineTo(-4, -37);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(9, -34);
  ctx.lineTo(11, -42);
  ctx.lineTo(4, -37);
  ctx.closePath();
  ctx.fill();
  // Eyes, blinking on the game clock.
  const blink = Math.sin(time * 1.3 + 1.2) > 0.93;
  const eyeGlow = 0.7 + 0.3 * Math.sin(time * 2.4);
  for (const eye of [-4.4, 4.4]) {
    ctx.fillStyle = '#2a2018';
    ctx.beginPath();
    ctx.ellipse(eye, -31, 4.6, blink ? 0.7 : 4.6, 0, 0, TAU);
    ctx.fill();
    if (!blink) {
      ctx.fillStyle = withAlpha(p.a, eyeGlow);
      dot(ctx, eye, -31, 2.2, p.a);
      dot(ctx, eye - 0.8, -31.8, 0.8, '#ffffff');
    }
  }
  // Beak and feet.
  ctx.fillStyle = '#8a5b2c';
  ctx.beginPath();
  ctx.moveTo(-2, -27);
  ctx.lineTo(2, -27);
  ctx.lineTo(0, -23);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#7a5424';
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(-5, 0);
  ctx.lineTo(-5, 3);
  ctx.moveTo(5, 0);
  ctx.lineTo(5, 3);
  ctx.stroke();
  // Small glow of a working automaton.
  ctx.fillStyle = withAlpha(p.a, 0.08 * eyeGlow);
  ctx.beginPath();
  ctx.arc(0, -22, 18, 0, TAU);
  ctx.fill();
  ctx.restore();
}

function drawBulb(ctx, p, time) {
  const flicker = 0.82 + 0.18 * Math.sin(time * 3.1 + p.x) * Math.sin(time * 1.7 + p.x * 0.2);
  ctx.save();
  // Cord.
  ctx.strokeStyle = '#1a1512';
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(p.x, 30);
  ctx.quadraticCurveTo(p.x + 3, (30 + p.y) / 2, p.x, p.y - 10);
  ctx.stroke();
  // Socket.
  ctx.fillStyle = '#5a4a34';
  ctx.fillRect(p.x - 5, p.y - 12, 10, 8);
  ctx.strokeStyle = 'rgba(220, 190, 130, 0.4)';
  ctx.lineWidth = 1;
  for (let ring = 0; ring < 2; ring += 1) {
    ctx.beginPath();
    ctx.moveTo(p.x - 5, p.y - 10 + ring * 3);
    ctx.lineTo(p.x + 5, p.y - 10 + ring * 3);
    ctx.stroke();
  }
  // Glow.
  ctx.fillStyle = radial(ctx, p.x, p.y + 2, 2, 42, [
    [0, withAlpha(p.c, 0.4 * flicker)],
    [1, withAlpha(p.c, 0)],
  ]);
  ctx.fillRect(p.x - 46, p.y - 40, 92, 92);
  // Glass.
  ctx.fillStyle = withAlpha(p.c, 0.9);
  ctx.beginPath();
  ctx.ellipse(p.x, p.y + 2, 7, 9, 0, 0, TAU);
  ctx.fill();
  ctx.fillStyle = 'rgba(255, 255, 240, 0.7)';
  ctx.beginPath();
  ctx.ellipse(p.x - 2, p.y - 1, 2.2, 4.4, -0.3, 0, TAU);
  ctx.fill();
  // Filament.
  ctx.strokeStyle = 'rgba(120, 70, 30, 0.7)';
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.moveTo(p.x - 2, p.y + 6);
  ctx.quadraticCurveTo(p.x - 3, p.y, p.x, p.y + 1);
  ctx.quadraticCurveTo(p.x + 3, p.y + 2, p.x + 2, p.y + 6);
  ctx.stroke();
  ctx.restore();
}

function drawValve(ctx, p) {
  ctx.save();
  ctx.translate(p.x, p.y);
  // Pipe body behind the wheel.
  ctx.fillStyle = '#4e4a44';
  roundRect(ctx, -7, -8, 14, 16, 3);
  ctx.fill();
  ctx.rotate(p.rot ?? 0);
  // Brass wheel.
  ctx.strokeStyle = p.c;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(0, 0, 14, 0, TAU);
  ctx.stroke();
  ctx.lineWidth = 2;
  for (let spoke = 0; spoke < 4; spoke += 1) {
    const angle = (spoke / 4) * TAU;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(Math.cos(angle) * 14, Math.sin(angle) * 14);
    ctx.stroke();
  }
  dot(ctx, 0, 0, 3.4, '#c9a25a');
  dot(ctx, -1, -1, 1.2, 'rgba(255, 240, 200, 0.75)');
  ctx.restore();
}

function drawAnchor(ctx, p) {
  // A little wall mount for the valve wheel.
  ctx.save();
  ctx.fillStyle = '#3c3833';
  ctx.fillRect(p.x - 11, p.y - 2, 22, 5);
  dot(ctx, p.x - 9, p.y, 1.4, '#8a8478');
  dot(ctx, p.x + 9, p.y, 1.4, '#8a8478');
  ctx.restore();
}

function drawBench(ctx, p) {
  const { x, y, w, h } = p;
  ctx.save();
  // Shadow.
  ctx.fillStyle = 'rgba(0, 0, 0, 0.32)';
  ctx.fillRect(x - 4, y + h + 8, w + 8, 10);
  // Legs.
  ctx.fillStyle = '#3a261c';
  ctx.fillRect(x + 14, y + h, 12, 34);
  ctx.fillRect(x + w - 26, y + h, 12, 34);
  // Apron.
  ctx.fillStyle = '#4a3024';
  ctx.fillRect(x + 8, y + h - 6, w - 16, 12);
  // Top with a worn sheen.
  ctx.fillStyle = p.a;
  ctx.fillRect(x - 4, y, w + 8, 7);
  ctx.fillStyle = p.c;
  ctx.fillRect(x - 4, y + 7, w + 8, h - 7);
  ctx.strokeStyle = 'rgba(30, 18, 12, 0.4)';
  ctx.lineWidth = 1;
  for (let plank = 1; plank < 3; plank += 1) {
    ctx.beginPath();
    ctx.moveTo(x - 4, y + 7 + plank * 9);
    ctx.lineTo(x + w + 4, y + 7 + plank * 9);
    ctx.stroke();
  }
  // Front face: plank seams, a shallow drawer and a brass pull.
  ctx.strokeStyle = 'rgba(34, 20, 12, 0.35)';
  ctx.lineWidth = 1;
  for (let seam = 1; seam < 3; seam += 1) {
    ctx.beginPath();
    ctx.moveTo(x + 8, y + 7 + seam * 9);
    ctx.lineTo(x + w - 8, y + 7 + seam * 9);
    ctx.stroke();
  }
  ctx.fillStyle = 'rgba(30, 18, 10, 0.28)';
  roundRect(ctx, x + 58, y + 12, 146, 17, 3);
  ctx.fill();
  ctx.strokeStyle = 'rgba(230, 196, 140, 0.2)';
  ctx.stroke();
  ctx.fillStyle = '#c9a25a';
  roundRect(ctx, x + 122, y + 19, 18, 3.4, 1.6);
  ctx.fill();
  dot(ctx, x + 122, y + 20.7, 1.4, '#e8c880');

  // A rag hanging off the apron.
  ctx.fillStyle = 'rgba(180, 70, 60, 0.55)';
  ctx.beginPath();
  ctx.moveTo(x + w - 90, y + h - 4);
  ctx.lineTo(x + w - 74, y + h - 4);
  ctx.lineTo(x + w - 77, y + h + 22);
  ctx.quadraticCurveTo(x + w - 83, y + h + 26, x + w - 87, y + h + 18);
  ctx.closePath();
  ctx.fill();

  // Scattered wood shavings.
  ctx.strokeStyle = 'rgba(220, 190, 140, 0.4)';
  ctx.lineWidth = 1;
  for (let curl = 0; curl < 5; curl += 1) {
    const cx = x + 20 + hash01(curl * 3.7) * (w - 40);
    ctx.beginPath();
    ctx.arc(cx, y + 16, 2 + hash01(curl) * 2, 0.4, 4.2);
    ctx.stroke();
  }
  ctx.restore();
}

function drawBlueprint(ctx, p) {
  const { x, y, w, h } = p;
  ctx.save();
  // Rolled parchment.
  ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
  roundRect(ctx, x + 3, y + 4, w, h, 3);
  ctx.fill();
  ctx.fillStyle = p.c;
  roundRect(ctx, x, y, w, h, 3);
  ctx.fill();
  ctx.strokeStyle = 'rgba(120, 90, 60, 0.35)';
  ctx.lineWidth = 1;
  ctx.stroke();
  // Curled corner.
  ctx.fillStyle = '#d4c19a';
  ctx.beginPath();
  ctx.moveTo(x + w - 16, y);
  ctx.lineTo(x + w, y);
  ctx.lineTo(x + w, y + 12);
  ctx.quadraticCurveTo(x + w - 4, y + 4, x + w - 16, y);
  ctx.closePath();
  ctx.fill();
  // Gear sketch.
  ctx.strokeStyle = 'rgba(80, 90, 130, 0.65)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(x + w * 0.36, y + h * 0.48, 11, 0, TAU);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(x + w * 0.36, y + h * 0.48, 4, 0, TAU);
  ctx.stroke();
  for (let tooth = 0; tooth < 8; tooth += 1) {
    const angle = (tooth / 8) * TAU;
    ctx.beginPath();
    ctx.moveTo(
      x + w * 0.36 + Math.cos(angle) * 11,
      y + h * 0.48 + Math.sin(angle) * 11,
    );
    ctx.lineTo(
      x + w * 0.36 + Math.cos(angle) * 14,
      y + h * 0.48 + Math.sin(angle) * 14,
    );
    ctx.stroke();
  }
  // Dimension lines and a note.
  ctx.beginPath();
  ctx.moveTo(x + 10, y + h - 10);
  ctx.lineTo(x + w - 12, y + h - 10);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x + w * 0.62, y + 12);
  ctx.lineTo(x + w - 10, y + 12);
  ctx.lineTo(x + w - 10, y + 26);
  ctx.stroke();
  ctx.fillStyle = 'rgba(90, 70, 50, 0.5)';
  ctx.font = '500 5px "Trebuchet MS", "Segoe UI", sans-serif';
  ctx.fillText('MARK IV', x + w * 0.62, y + 10);
  ctx.restore();
}

function drawMagnifier(ctx, p) {
  const s = p.s ?? 1;
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.rotate(-0.42);
  ctx.scale(s, s);
  // Handle.
  ctx.strokeStyle = p.c;
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(14, 14);
  ctx.lineTo(30, 30);
  ctx.stroke();
  ctx.strokeStyle = 'rgba(255, 230, 180, 0.4)';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(16, 14);
  ctx.lineTo(30, 28);
  ctx.stroke();
  // Lens.
  ctx.fillStyle = withAlpha(p.a, 0.24);
  ctx.beginPath();
  ctx.arc(0, 0, 15, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = p.c;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(0, 0, 15, 0, TAU);
  ctx.stroke();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.arc(-3, -3, 10, Math.PI * 1.05, Math.PI * 1.5);
  ctx.stroke();
  ctx.restore();
}

function drawCandle(ctx, p, time) {
  const s = p.s ?? 1;
  const flicker = 0.82 + 0.18 * Math.sin(time * 7.3) * Math.sin(time * 3.1 + 0.7);
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.scale(s, s);
  // Glow.
  ctx.fillStyle = radial(ctx, 0, -14, 2, 42, [
    [0, `rgba(255, 186, 100, ${0.24 * flicker})`],
    [1, 'rgba(255, 186, 100, 0)'],
  ]);
  ctx.fillRect(-46, -58, 92, 80);
  // Holder.
  ctx.fillStyle = '#7a5a34';
  ctx.beginPath();
  ctx.ellipse(0, 1, 12, 3.4, 0, 0, TAU);
  ctx.fill();
  // Wax.
  ctx.fillStyle = p.c;
  ctx.fillRect(-5, -20, 10, 20);
  ctx.fillStyle = 'rgba(255, 235, 190, 0.5)';
  ctx.fillRect(-4, -19, 2, 18);
  // Drips.
  ctx.fillStyle = p.c;
  ctx.beginPath();
  ctx.ellipse(-6, -8, 2, 5, 0.2, 0, TAU);
  ctx.fill();
  // Wick.
  ctx.strokeStyle = '#3a2a1a';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(0, -20);
  ctx.lineTo(0, -23);
  ctx.stroke();
  // Flame.
  ctx.fillStyle = p.a;
  ctx.beginPath();
  ctx.moveTo(0, -34 - flicker * 2);
  ctx.quadraticCurveTo(5, -27, 0, -22);
  ctx.quadraticCurveTo(-5, -27, 0, -34 - flicker * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(255, 250, 220, 0.85)';
  ctx.beginPath();
  ctx.moveTo(0, -31);
  ctx.quadraticCurveTo(2.2, -27, 0, -24);
  ctx.quadraticCurveTo(-2.2, -27, 0, -31);
  ctx.fill();
  ctx.restore();
}

function drawKettle(ctx, p, time) {
  ctx.save();
  // Steam first, so it rises from behind the spout.
  ctx.globalCompositeOperation = 'lighter';
  for (let index = 0; index < 4; index += 1) {
    const age = (time * 0.22 + index * 0.26) % 1;
    ctx.fillStyle = `rgba(230, 226, 215, ${(1 - age) * 0.12})`;
    ctx.beginPath();
    ctx.ellipse(
      p.x + 16 + Math.sin(age * 5 + index) * (3 + age * 8),
      p.y - 18 - age * 46,
      4 + age * 9,
      3 + age * 6,
      0.3,
      0,
      TAU,
    );
    ctx.fill();
  }
  ctx.globalCompositeOperation = 'source-over';
  // Body.
  const body = gradient(ctx, p.x - 20, p.y - 20, p.x + 20, p.y, [
    [0, p.a],
    [0.6, p.c],
    [1, '#7a4526'],
  ]);
  ctx.fillStyle = body;
  ctx.beginPath();
  ctx.ellipse(p.x, p.y - 2, 20, 16, 0, 0, TAU);
  ctx.fill();
  // Lid.
  ctx.fillStyle = '#8a5a30';
  ctx.beginPath();
  ctx.ellipse(p.x, p.y - 18, 9, 3.4, 0, 0, TAU);
  ctx.fill();
  dot(ctx, p.x, p.y - 22, 2.4, '#c9a25a');
  // Spout.
  ctx.strokeStyle = p.c;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(p.x + 16, p.y - 6);
  ctx.quadraticCurveTo(p.x + 28, p.y - 12, p.x + 26, p.y - 22);
  ctx.stroke();
  ctx.strokeStyle = 'rgba(255, 220, 170, 0.4)';
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.arc(p.x - 4, p.y - 4, 12, Math.PI * 1.05, Math.PI * 1.6);
  ctx.stroke();
  // Handle.
  ctx.strokeStyle = '#4a3020';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(p.x, p.y - 20, 13, Math.PI * 1.05, Math.PI * 1.95);
  ctx.stroke();
  ctx.restore();
}

function drawToolbox(ctx, p) {
  const { x, y, w, h } = p;
  ctx.save();
  ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
  ctx.fillRect(x + 3, y + 4, w, h);
  ctx.fillStyle = p.c;
  roundRect(ctx, x, y, w, h, 3);
  ctx.fill();
  ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
  ctx.fillRect(x, y, w, 3);
  // Handle.
  ctx.strokeStyle = p.a;
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.arc(x + w / 2, y, 10, Math.PI, TAU);
  ctx.stroke();
  // Latch.
  ctx.fillStyle = p.a;
  ctx.fillRect(x + w / 2 - 3, y + h - 7, 6, 4);
  ctx.strokeStyle = 'rgba(20, 30, 34, 0.5)';
  ctx.lineWidth = 1;
  ctx.strokeRect(x + 3, y + 6, w - 6, h - 12);
  ctx.restore();
}

function drawSpring(ctx, p) {
  ctx.save();
  ctx.strokeStyle = p.c;
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  for (let turn = 0; turn < 7; turn += 1) {
    const y = p.y - turn * 2.6;
    ctx.moveTo(p.x - 8, y);
    ctx.quadraticCurveTo(p.x, y - 3, p.x + 8, y);
  }
  ctx.stroke();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.55)';
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  for (let turn = 0; turn < 7; turn += 1) {
    const y = p.y - turn * 2.6 - 1;
    ctx.moveTo(p.x - 6, y);
    ctx.lineTo(p.x + 6, y);
  }
  ctx.stroke();
  ctx.restore();
}

function drawWrench(ctx, p) {
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.rotate(-0.5);
  ctx.strokeStyle = p.c;
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-22, 12);
  ctx.lineTo(14, -14);
  ctx.stroke();
  // Open jaw.
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(18, -18, 6.5, Math.PI * 0.15, Math.PI * 1.4);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(15, -24);
  ctx.lineTo(15, -12);
  ctx.stroke();
  // Box end.
  ctx.beginPath();
  ctx.arc(-24, 13, 7, 0, TAU);
  ctx.stroke();
  dot(ctx, -24, 13, 2.2, '#5c6870');
  ctx.restore();
}

function drawStool(ctx, p) {
  ctx.save();
  ctx.strokeStyle = '#3a261c';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(p.x - 15, p.y + 26);
  ctx.lineTo(p.x - 8, p.y);
  ctx.moveTo(p.x + 15, p.y + 26);
  ctx.lineTo(p.x + 8, p.y);
  ctx.moveTo(p.x, p.y + 26);
  ctx.lineTo(p.x, p.y + 2);
  ctx.stroke();
  ctx.fillStyle = p.c;
  ctx.beginPath();
  ctx.ellipse(p.x, p.y, 20, 6, 0, 0, TAU);
  ctx.fill();
  ctx.fillStyle = p.a;
  ctx.beginPath();
  ctx.ellipse(p.x, p.y - 1.5, 18, 4.5, 0, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255, 220, 170, 0.25)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.ellipse(p.x, p.y - 1.5, 18, 4.5, 0, 0, Math.PI);
  ctx.stroke();
  ctx.restore();
}

function drawCrate(ctx, p) {
  const { x, y, w, h } = p;
  ctx.save();
  ctx.fillStyle = 'rgba(0, 0, 0, 0.32)';
  ctx.fillRect(x + 3, y + 4, w, h);
  ctx.fillStyle = p.c;
  ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = 'rgba(30, 18, 10, 0.55)';
  ctx.lineWidth = 1.2;
  for (let index = 1; index < 3; index += 1) {
    ctx.beginPath();
    ctx.moveTo(x + 2, y + (h / 3) * index);
    ctx.lineTo(x + w - 2, y + (h / 3) * index);
    ctx.stroke();
  }
  ctx.fillStyle = '#2e2b34';
  ctx.fillRect(x, y, w, 3);
  ctx.fillRect(x, y + h - 3, w, 3);
  ctx.fillRect(x, y, 3, h);
  ctx.fillRect(x + w - 3, y, 3, h);
  ctx.strokeStyle = p.a;
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.arc(x + w / 2, y + h / 2, 7, 0.4, Math.PI * 1.5);
  ctx.stroke();
  ctx.fillStyle = p.a;
  ctx.globalAlpha = 0.7;
  ctx.fillRect(x + w * 0.42, y + h * 0.44, w * 0.16, 2);
  ctx.globalAlpha = 1;
  ctx.restore();
}

function drawSawdust(ctx, p) {
  ctx.save();
  for (let speck = 0; speck < 18; speck += 1) {
    const x = p.x + (hash01(speck * 3.1) - 0.5) * 140;
    const y = p.y + (hash01(speck * 7.7) - 0.5) * 18;
    ctx.fillStyle = `rgba(220, 190, 140, ${0.12 + hash01(speck) * 0.18})`;
    ctx.beginPath();
    ctx.ellipse(x, y, 1 + hash01(speck * 2.3) * 2, 0.6, 0.3, 0, TAU);
    ctx.fill();
  }
  ctx.restore();
}

function drawFrame(ctx, p) {
  const x = p.x;
  const y = p.y;
  ctx.save();
  // Frame shadow and brass border.
  ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
  ctx.fillRect(x - 17, y + 3, 36, 48);
  ctx.fillStyle = p.c;
  ctx.fillRect(x - 19, y - 1, 38, 50);
  ctx.fillStyle = 'rgba(255, 230, 180, 0.22)';
  ctx.fillRect(x - 19, y - 1, 38, 2);
  // Parchment.
  ctx.fillStyle = '#e4d3ad';
  ctx.fillRect(x - 15, y + 3, 30, 42);
  // A small technical drawing.
  ctx.strokeStyle = 'rgba(90, 74, 48, 0.6)';
  ctx.lineWidth = 0.9;
  ctx.beginPath();
  ctx.arc(x, y + 18, 7, 0, TAU);
  ctx.stroke();
  for (let tooth = 0; tooth < 6; tooth += 1) {
    const angle = (tooth / 6) * TAU;
    ctx.beginPath();
    ctx.moveTo(x + Math.cos(angle) * 7, y + 18 + Math.sin(angle) * 7);
    ctx.lineTo(x + Math.cos(angle) * 9, y + 18 + Math.sin(angle) * 9);
    ctx.stroke();
  }
  ctx.beginPath();
  ctx.moveTo(x - 10, y + 32);
  ctx.lineTo(x + 10, y + 32);
  ctx.stroke();
  ctx.fillStyle = 'rgba(90, 74, 48, 0.55)';
  ctx.font = '500 3.6px "Trebuchet MS", "Segoe UI", sans-serif';
  ctx.fillText('GEAR 7/12', x - 10, y + 39);
  ctx.restore();
}

function drawSillPlant(ctx, p) {
  ctx.save();
  // Pot.
  ctx.fillStyle = p.a;
  ctx.beginPath();
  ctx.moveTo(p.x - 7, p.y);
  ctx.lineTo(p.x + 7, p.y);
  ctx.lineTo(p.x + 5, p.y + 10);
  ctx.lineTo(p.x - 5, p.y + 10);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = 'rgba(255, 225, 190, 0.3)';
  ctx.fillRect(p.x - 7, p.y, 14, 2);
  // Leaves, reaching for the window light.
  ctx.strokeStyle = p.c;
  ctx.lineWidth = 2.6;
  ctx.lineCap = 'round';
  for (let leaf = 0; leaf < 5; leaf += 1) {
    const angle = -Math.PI / 2 + (leaf - 2) * 0.42;
    const length = 10 + hash01(leaf * 2.3) * 8;
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
    ctx.quadraticCurveTo(
      p.x + Math.cos(angle) * length * 0.5,
      p.y + Math.sin(angle) * length * 0.8,
      p.x + Math.cos(angle) * length,
      p.y + Math.sin(angle) * length,
    );
    ctx.stroke();
  }
  dot(ctx, p.x + 5, p.y - 12, 1.8, '#ffcf7a');
  ctx.restore();
}

function drawPegboard(ctx, p) {
  const { x, y, w, h } = p;
  ctx.save();
  // Board, with a dark border and a soft shadow.
  ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
  roundRect(ctx, x + 3, y + 4, w, h, 5);
  ctx.fill();
  ctx.fillStyle = p.c;
  roundRect(ctx, x, y, w, h, 5);
  ctx.fill();
  ctx.strokeStyle = 'rgba(20, 12, 8, 0.55)';
  ctx.lineWidth = 1.4;
  ctx.stroke();
  ctx.fillStyle = 'rgba(255, 220, 170, 0.09)';
  for (let hole = 0; hole < 5; hole += 1) {
    for (let row = 0; row < 2; row += 1) {
      dot(ctx, x + 12 + hole * 36, y + 12 + row * 16, 1.2, 'rgba(12, 8, 6, 0.5)');
    }
  }

  // Hanging tools, loosely sketched in the same steel tone.
  ctx.strokeStyle = p.a;
  ctx.fillStyle = p.a;
  ctx.lineWidth = 2;
  ctx.lineCap = 'round';
  ctx.globalAlpha = 0.85;
  // Hammer.
  ctx.beginPath();
  ctx.moveTo(x + 22, y + 24);
  ctx.lineTo(x + 22, y + 60);
  ctx.stroke();
  ctx.fillRect(x + 15, y + 22, 15, 5);
  // Pliers.
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.moveTo(x + 52, y + 28);
  ctx.lineTo(x + 60, y + 56);
  ctx.moveTo(x + 60, y + 28);
  ctx.lineTo(x + 52, y + 56);
  ctx.stroke();
  dot(ctx, x + 56, y + 26, 2.4, p.a);
  // Small saw.
  ctx.beginPath();
  ctx.moveTo(x + 78, y + 26);
  ctx.lineTo(x + 96, y + 28);
  ctx.lineTo(x + 92, y + 50);
  ctx.lineTo(x + 80, y + 48);
  ctx.closePath();
  ctx.stroke();
  ctx.lineWidth = 0.8;
  for (let tooth = 0; tooth < 5; tooth += 1) {
    ctx.beginPath();
    ctx.moveTo(x + 82 + tooth * 3, y + 48 - tooth * 0.4);
    ctx.lineTo(x + 83 + tooth * 3, y + 51 - tooth * 0.4);
    ctx.stroke();
  }
  // Two screwdrivers.
  ctx.lineWidth = 2.2;
  for (let driver = 0; driver < 2; driver += 1) {
    const dx = x + 116 + driver * 13;
    ctx.beginPath();
    ctx.moveTo(dx, y + 25);
    ctx.lineTo(dx, y + 52);
    ctx.stroke();
    ctx.fillStyle = driver === 0 ? '#c9594f' : '#c9a25a';
    ctx.fillRect(dx - 2.4, y + 22, 4.8, 9);
    ctx.fillStyle = p.a;
    ctx.fillRect(dx - 0.8, y + 52, 1.6, 8);
  }
  // A short measuring rule.
  ctx.globalAlpha = 0.6;
  ctx.fillStyle = p.a;
  ctx.fillRect(x + 144, y + 30, 3, 32);
  ctx.fillStyle = 'rgba(20, 14, 8, 0.5)';
  for (let tick = 0; tick < 4; tick += 1) {
    ctx.fillRect(x + 144, y + 34 + tick * 7, 3, 0.8);
  }
  ctx.restore();
}

function drawBucket2(ctx, p) {
  ctx.save();
  ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
  ctx.beginPath();
  ctx.ellipse(p.x + 2, p.y + 3, 14, 4.5, 0, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = p.a;
  ctx.lineWidth = 1.3;
  ctx.beginPath();
  ctx.arc(p.x, p.y - 18, 12, Math.PI * 1.05, Math.PI * 1.95);
  ctx.stroke();
  ctx.fillStyle = p.c;
  ctx.beginPath();
  ctx.moveTo(p.x - 12, p.y - 20);
  ctx.lineTo(p.x + 12, p.y - 20);
  ctx.lineTo(p.x + 9, p.y);
  ctx.lineTo(p.x - 9, p.y);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
  ctx.fillRect(p.x - 7, p.y - 18, 2, 16);
  ctx.strokeStyle = '#2c3138';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(p.x - 11.5, p.y - 13);
  ctx.lineTo(p.x + 11.5, p.y - 13);
  ctx.stroke();
  // An oily rag draped over the rim.
  ctx.fillStyle = 'rgba(170, 138, 88, 0.7)';
  ctx.beginPath();
  ctx.moveTo(p.x - 6, p.y - 21);
  ctx.quadraticCurveTo(p.x + 2, p.y - 27, p.x + 9, p.y - 20);
  ctx.lineTo(p.x + 6, p.y - 14);
  ctx.quadraticCurveTo(p.x, p.y - 19, p.x - 5, p.y - 15);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawGearPile(ctx, p, time) {
  ctx.save();
  ctx.fillStyle = 'rgba(0, 0, 0, 0.28)';
  ctx.beginPath();
  ctx.ellipse(p.x, p.y + 3, 30, 5, 0, 0, TAU);
  ctx.fill();
  const gears = [
    { x: -14, y: -2, r: 12, n: 8, tilt: 0.2, spin: 0.15 },
    { x: 6, y: -5, r: 9, n: 7, tilt: -0.3, spin: -0.2 },
    { x: 20, y: 0, r: 6.5, n: 6, tilt: 0.7, spin: 0.3 },
  ];
  for (const gear of gears) {
    ctx.save();
    ctx.translate(p.x + gear.x, p.y + gear.y);
    ctx.rotate(gear.tilt + Math.sin(time * 0.2 + gear.x) * 0.03);
    ctx.beginPath();
    for (let index = 0; index < gear.n * 2; index += 1) {
      const radius = index % 2 === 0 ? gear.r : gear.r * 0.78;
      const angle = (index / (gear.n * 2)) * TAU;
      if (index === 0) ctx.moveTo(Math.cos(angle) * radius, Math.sin(angle) * radius);
      else ctx.lineTo(Math.cos(angle) * radius, Math.sin(angle) * radius);
    }
    ctx.closePath();
    ctx.fillStyle = gear.r > 10 ? p.c : p.a;
    ctx.fill();
    ctx.strokeStyle = 'rgba(60, 40, 20, 0.6)';
    ctx.lineWidth = 1;
    ctx.stroke();
    dot(ctx, 0, 0, gear.r * 0.28, '#3a2a1a');
    ctx.restore();
  }
  // Loose bolts and a nut.
  for (let bolt = 0; bolt < 4; bolt += 1) {
    const bx = p.x + 26 + hash01(bolt * 3.1) * 16;
    const by = p.y + 2 + hash01(bolt * 7.7) * 6;
    ctx.fillStyle = 'rgba(160, 175, 190, 0.65)';
    ctx.fillRect(bx, by, 4, 1.4);
    dot(ctx, bx + 4, by + 0.7, 1.3, '#9aa7b4');
  }
  ctx.restore();
}
