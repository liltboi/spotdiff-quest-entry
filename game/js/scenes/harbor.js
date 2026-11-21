// Level one: "Harbor Afterglow". A night harbor painted with gradients, flat silhouettes and
// small warm lights. The scene is built as a list of props; each prop can be changed on one side
// to make a difference (see differences.js), and the pools at the bottom point at those props.

import { TAU, dot, ellipse, gradient, hash01, radial, roundRect, starPath } from '../draw.js';

const W = 560;
const H = 440;
const HORIZON = 268;

function makeStars(random, count) {
  const stars = [];
  for (let index = 0; index < count; index += 1) {
    stars.push({
      x: 8 + random() * (W - 16),
      y: 8 + random() * 210,
      r: 0.5 + random() * 1.5,
      a: 0.25 + random() * 0.6,
    });
  }
  return stars;
}

function makeRipples(random) {
  const ripples = [];
  for (let index = 0; index < 34; index += 1) {
    ripples.push({
      x: 8 + random() * (W - 20),
      y: HORIZON + 10 + random() * 160,
      len: 8 + random() * 46,
      a: 0.04 + random() * 0.13,
    });
  }
  return ripples;
}

export function buildHarbor(random) {
  const stars = makeStars(random, 54);
  const ripples = makeRipples(random);
  const windows = '#ffd489';
  const props = [];

  // --- Sky and water colours ----------------------------------------------------------------
  const backdrop = (ctx) => {
    ctx.fillStyle = gradient(ctx, 0, 0, 0, HORIZON, [
      [0, '#080e27'],
      [0.45, '#15214a'],
      [0.78, '#37355f'],
      [1, '#7a4c5c'],
    ]);
    ctx.fillRect(0, 0, W, HORIZON);

    // A faint warm haze sitting on the horizon behind the town.
    ctx.fillStyle = radial(ctx, 360, HORIZON, 10, 240, [
      [0, 'rgba(255, 168, 112, 0.28)'],
      [1, 'rgba(255, 168, 112, 0)'],
    ]);
    ctx.fillRect(0, HORIZON - 150, W, 160);

    // Stars, brighter near the top of the frame.
    for (const star of stars) {
      ctx.globalAlpha = star.a * (1 - star.y / 300);
      dot(ctx, star.x, star.y, star.r, '#e9f1ff');
    }
    ctx.globalAlpha = 1;

    // Two soft cloud bands.
    ctx.fillStyle = 'rgba(120, 132, 190, 0.09)';
    ellipse(ctx, 150, 128, 105, 13);
    ctx.fill();
    ellipse(ctx, 420, 168, 140, 10);
    ctx.fill();
    ctx.fillStyle = 'rgba(190, 170, 200, 0.07)';
    ellipse(ctx, 280, 78, 150, 16);
    ctx.fill();

    // Moon halo. The moon disc itself is a prop so it can be changed on one side.
    ctx.fillStyle = radial(ctx, 455, 78, 20, 92, [
      [0, 'rgba(255, 240, 195, 0.5)'],
      [0.4, 'rgba(255, 230, 175, 0.14)'],
      [1, 'rgba(255, 230, 175, 0)'],
    ]);
    ctx.fillRect(330, -30, 250, 230);

    // Water.
    ctx.fillStyle = gradient(ctx, 0, HORIZON, 0, H, [
      [0, '#223055'],
      [0.35, '#142142'],
      [1, '#080f24'],
    ]);
    ctx.fillRect(0, HORIZON, W, H - HORIZON);

    // The horizon line glows faintly.
    ctx.fillStyle = 'rgba(255, 178, 122, 0.35)';
    ctx.fillRect(0, HORIZON - 1, W, 2);
    ctx.fillStyle = 'rgba(10, 16, 34, 0.7)';
    ctx.fillRect(0, HORIZON + 2, W, 5);

    // Ripples.
    for (const ripple of ripples) {
      ctx.strokeStyle = `rgba(150, 195, 255, ${ripple.a})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(ripple.x, ripple.y);
      ctx.quadraticCurveTo(ripple.x + ripple.len / 2, ripple.y - 1.5, ripple.x + ripple.len, ripple.y);
      ctx.stroke();
    }

    // Moon reflection: a broken column of light.
    for (let index = 0; index < 11; index += 1) {
      const y = HORIZON + 12 + index * 14;
      const width = 22 + index * 4 + hash01(index + 2) * 16;
      ctx.fillStyle = `rgba(255, 232, 175, ${0.2 - index * 0.013})`;
      ellipse(ctx, 455 + (hash01(index * 3.1) - 0.5) * 18, y, width, 2.4);
      ctx.fill();
    }

    // Town reflection smudge.
    ctx.fillStyle = 'rgba(255, 160, 100, 0.05)';
    ctx.fillRect(60, HORIZON + 6, 300, 70);
  };

  // --- Buildings ------------------------------------------------------------------------------
  let cursor = -14;
  for (let index = 0; index < 9; index += 1) {
    const width = 32 + random() * 40;
    const height = 48 + random() * 100;
    cursor += width - 4;
    const x = cursor - width;
    props.push({
      id: `bld${index}`,
      type: 'building',
      x,
      y: HORIZON - height,
      w: width,
      h: height,
      z: 2,
      seed: 3 + index * 17,
      c: windows,
      tier: 3,
    });
    cursor += 4;
  }

  // The tallest tower gets a blinking antenna.
  const tower = props.reduce((best, prop) => (prop.h > best.h ? prop : best), props[0]);
  props.push({
    id: 'antenna',
    type: 'antenna',
    x: tower.x + tower.w * 0.62,
    y: tower.y,
    z: 3,
    c: '#ff6b6b',
  });

  // Old harbor crane on the left.
  props.push({ id: 'crane', type: 'crane', x: 100, y: HORIZON, z: 2.2, c: '#0c1428' });

  // Lighthouse on the right, with its beam as a separate prop.
  props.push({
    id: 'lighthouse',
    type: 'lighthouse',
    x: 498,
    y: HORIZON,
    z: 3.2,
    c: '#ffd27a',
    cx: 498,
    cy: 160,
  });
  props.push({ id: 'beam', type: 'beam', x: 498, y: 158, z: 1.6, c: '#ffe4a3' });

  // Moon, stars and gulls.
  props.push({ id: 'moon', type: 'moon', x: 455, y: 78, r: 31, z: 1, s: 1, c: '#f7e8be' });
  props.push({ id: 'cluster', type: 'cluster', x: 286, y: 62, z: 1.2, s: 1, c: '#e6dcff', side: 'right' });
  props.push({ id: 'gull1', type: 'gull', x: 352, y: 101, z: 1.4, s: 1, c: '#18203a' });
  props.push({ id: 'gull2', type: 'gull', x: 386, y: 124, z: 1.4, s: 0.72, c: '#18203a' });

  // Boats and floating things.
  props.push({ id: 'sailboat', type: 'sailboat', x: 200, y: 302, z: 4, s: 1, c: '#f3e7c8', a: '#8c3b46' });
  props.push({ id: 'flag', type: 'flag', x: 204, y: 219, z: 4.2, s: 1, c: '#ffcf6b' });
  props.push({ id: 'rowboat', type: 'rowboat', x: 322, y: 342, z: 4, s: 1, c: '#6f4b36', a: '#d8b483' });
  props.push({ id: 'buoy', type: 'buoy', x: 402, y: 318, z: 4, s: 1, c: '#e4555f' });

  // Foreground: pier, lamp, crate, cat.
  props.push({ id: 'pier', type: 'pier', x: 0, y: 386, z: 6, c: '#5d4331' });
  props.push({ id: 'lamppost', type: 'lamppost', x: 48, y: 386, z: 7, c: '#ffce7a' });
  props.push({ id: 'crate', type: 'crate', x: 128, y: 346, z: 6.5, w: 62, h: 42, c: '#6e4c33', a: '#ffd08a' });
  props.push({ id: 'cat', type: 'cat', x: 160, y: 337, z: 7, s: 1, c: '#1d2333' });
  props.push({ id: 'rope', type: 'rope', x: 226, y: 414, z: 6.6, s: 1, c: '#9c7a52' });

  // Marker centres, bottom-up so a pool entry can name a prop and get a sensible click target.
  const centres = {
    moon: [455, 78],
    cluster: [286, 62],
    gull1: [352, 101],
    gull2: [386, 124],
    antenna: [tower.x + tower.w * 0.62, tower.y - 22],
    beam: [405, 162],
    lighthouse: [498, 160],
    sailboat: [200, 268],
    flag: [210, 214],
    rowboat: [322, 344],
    buoy: [402, 312],
    cat: [160, 334],
    crate: [159, 368],
    lamppost: [48, 296],
    bld3: [props[3].x + props[3].w / 2, props[3].y + props[3].h * 0.55],
  };

  for (const prop of props) {
    const centre = centres[prop.id];
    if (centre) {
      prop.cx = centre[0];
      prop.cy = centre[1];
    } else {
      prop.cx = prop.x + (prop.w ?? 0) / 2;
      prop.cy = prop.y;
    }
  }

  const pool = [
    { prop: 'moon', op: 'color', value: '#c6e2ff', tier: 2, r: 1.2 },
    { prop: 'moon', op: 'scale', value: 1.22, tier: 2, r: 1.2 },
    { prop: 'cluster', op: 'show', tier: 1, r: 1.1 },
    { prop: 'gull2', op: 'hide', tier: 1, r: 1.1 },
    { prop: 'gull1', op: 'shift', value: { dx: 17, dy: -10 }, tier: 3, r: 1.2 },
    { prop: 'bld3', op: 'color', value: '#9ef4e0', tier: 2, r: 1.25 },
    { prop: 'antenna', op: 'hide', tier: 1, r: 1.1 },
    { prop: 'beam', op: 'hide', tier: 2, r: 1.2 },
    { prop: 'lighthouse', op: 'color', value: '#7ef1d8', tier: 2, r: 1 },
    { prop: 'sailboat', op: 'color', value: '#ffb194', tier: 1, r: 1.25 },
    { prop: 'flag', op: 'hide', tier: 2, r: 1.1 },
    { prop: 'rowboat', op: 'shift', value: { dx: 15, dy: -3 }, tier: 2, r: 1.3 },
    { prop: 'buoy', op: 'hide', tier: 1, r: 1.1 },
    { prop: 'cat', op: 'color', value: '#f2f5fb', tier: 2, r: 1.2 },
    { prop: 'crate', op: 'color', value: '#7fe4ff', tier: 3, r: 1 },
    { prop: 'lamppost', op: 'color', value: '#8fe8ff', tier: 2, r: 1.1 },
  ];

  return {
    key: 'harbor',
    name: 'Harbor Afterglow',
    tint: '#ffb37a',
    props,
    pool,
    backdrop,
    drawProp: drawHarborProp,
  };
}

// --- Prop painters ---------------------------------------------------------------------------

function drawHarborProp(ctx, p) {
  switch (p.type) {
    case 'building': return drawBuilding(ctx, p);
    case 'antenna': return drawAntenna(ctx, p);
    case 'crane': return drawCrane(ctx, p);
    case 'lighthouse': return drawLighthouse(ctx, p);
    case 'beam': return drawBeam(ctx, p);
    case 'moon': return drawMoon(ctx, p);
    case 'cluster': return drawCluster(ctx, p);
    case 'gull': return drawGull(ctx, p);
    case 'sailboat': return drawSailboat(ctx, p);
    case 'flag': return drawFlag(ctx, p);
    case 'rowboat': return drawRowboat(ctx, p);
    case 'buoy': return drawBuoy(ctx, p);
    case 'pier': return drawPier(ctx, p);
    case 'lamppost': return drawLamppost(ctx, p);
    case 'crate': return drawCrate(ctx, p);
    case 'cat': return drawCat(ctx, p);
    case 'rope': return drawRope(ctx, p);
    default: return undefined;
  }
}

function drawBuilding(ctx, p) {
  const { x, y, w, h, seed } = p;

  ctx.fillStyle = '#0a1226';
  ctx.fillRect(x, y, w, h);

  // Rooftop furniture picked by the seed: water tank, stepped crown, or a plain lip.
  ctx.fillStyle = '#0c152b';
  const style = Math.floor(hash01(seed) * 3);
  if (style === 0) {
    ctx.fillRect(x + w * 0.18, y - 10, w * 0.36, 10);
    ctx.fillRect(x + w * 0.24, y - 16, w * 0.22, 7);
  } else if (style === 1) {
    ctx.fillRect(x + 3, y - 4, w - 6, 4);
  } else {
    ctx.fillRect(x + w * 0.58, y - 14, 3, 14);
  }

  // Rim light along the roof edge: enough to separate the black shapes.
  ctx.strokeStyle = 'rgba(116, 148, 214, 0.4)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x + 0.5, y + 0.5);
  ctx.lineTo(x + w - 0.5, y + 0.5);
  ctx.stroke();
  ctx.strokeStyle = 'rgba(64, 92, 150, 0.22)';
  ctx.beginPath();
  ctx.moveTo(x + w - 0.5, y);
  ctx.lineTo(x + w - 0.5, y + h);
  ctx.stroke();

  // Windows: a handful are lit, the rest are blue glass catching the sky.
  const cols = Math.max(2, Math.floor((w - 8) / 13));
  const rows = Math.max(2, Math.floor((h - 14) / 17));
  const cw = 5;
  const ch = 7;
  const gapX = (w - cols * cw) / (cols + 1);
  const gapY = 10 + (h - 14 - rows * ch) / Math.max(1, rows + 1);
  for (let col = 0; col < cols; col += 1) {
    for (let row = 0; row < rows; row += 1) {
      const lit = hash01(seed * 31 + col * 7 + row * 13) > 0.46;
      const wx = x + gapX + col * (cw + gapX);
      const wy = y + gapY + row * (ch + gapY * 0.7);
      if (lit) {
        ctx.fillStyle = p.c;
        ctx.globalAlpha = 0.82;
        ctx.fillRect(wx, wy, cw, ch);
        ctx.globalAlpha = 0.16;
        ctx.fillRect(wx - 2, wy - 2, cw + 4, ch + 4);
      } else {
        ctx.fillStyle = 'rgba(86, 112, 168, 0.22)';
        ctx.fillRect(wx, wy, cw, ch);
      }
      ctx.globalAlpha = 1;
    }
  }
}

function drawAntenna(ctx, p) {
  ctx.strokeStyle = '#243353';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(p.x, p.y);
  ctx.lineTo(p.x, p.y - 46);
  ctx.moveTo(p.x - 6, p.y - 30);
  ctx.lineTo(p.x + 6, p.y - 30);
  ctx.stroke();
  dot(ctx, p.x, p.y - 48, 3.4, p.c);
  ctx.fillStyle = 'rgba(255, 90, 90, 0.16)';
  ctx.beginPath();
  ctx.arc(p.x, p.y - 48, 9, 0, TAU);
  ctx.fill();
}

function drawCrane(ctx, p) {
  ctx.strokeStyle = p.c;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(p.x - 10, p.y);
  ctx.lineTo(p.x - 6, p.y - 92);
  ctx.moveTo(p.x - 6, p.y - 92);
  ctx.lineTo(p.x - 76, p.y - 92);
  ctx.moveTo(p.x - 6, p.y - 92);
  ctx.lineTo(p.x + 30, p.y - 92);
  ctx.stroke();
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  for (let step = 0; step < 5; step += 1) {
    const start = p.x - 6 - step * 14;
    ctx.moveTo(start, p.y - 92);
    ctx.lineTo(start - 14, p.y - 78);
  }
  ctx.moveTo(p.x - 6, p.y - 92);
  ctx.lineTo(p.x - 4, p.y - 52);
  ctx.stroke();
  ctx.fillStyle = p.c;
  ctx.fillRect(p.x - 62, p.y - 72, 26, 15);
  ctx.strokeStyle = 'rgba(150, 180, 240, 0.2)';
  ctx.beginPath();
  ctx.moveTo(p.x - 49, p.y - 72);
  ctx.lineTo(p.x - 49, p.y - 92);
  ctx.stroke();
}

function drawLighthouse(ctx, p) {
  const base = p.y;
  const top = base - 112;
  const halfBottom = 19;
  const halfTop = 11;
  ctx.save();
  // Glow around the lamp room.
  ctx.fillStyle = radial(ctx, p.x, top + 12, 4, 50, [
    [0, 'rgba(255, 226, 156, 0.55)'],
    [1, 'rgba(255, 226, 156, 0)'],
  ]);
  ctx.fillRect(p.x - 60, top - 40, 120, 100);

  // Tower body with red bands.
  ctx.beginPath();
  ctx.moveTo(p.x - halfBottom, base);
  ctx.lineTo(p.x - halfTop, top);
  ctx.lineTo(p.x + halfTop, top);
  ctx.lineTo(p.x + halfBottom, base);
  ctx.closePath();
  ctx.fillStyle = '#e8ded0';
  ctx.fill();
  ctx.save();
  ctx.clip();
  ctx.fillStyle = '#b04b4f';
  ctx.fillRect(p.x - 22, top + 18, 44, 15);
  ctx.fillRect(p.x - 24, top + 52, 48, 15);
  ctx.fillRect(p.x - 26, base - 16, 52, 16);
  ctx.restore();

  // Gallery and lamp room.
  ctx.fillStyle = '#20293b';
  ctx.fillRect(p.x - 14, top - 3, 28, 4);
  ctx.fillStyle = '#2b3448';
  ctx.fillRect(p.x - 9.5, top - 17, 19, 15);
  ctx.fillStyle = p.c;
  ctx.globalAlpha = 0.95;
  ctx.fillRect(p.x - 6.5, top - 15, 13, 11);
  ctx.globalAlpha = 1;
  ctx.fillStyle = '#1b2335';
  ctx.beginPath();
  ctx.moveTo(p.x - 12, top - 17);
  ctx.lineTo(p.x, top - 26);
  ctx.lineTo(p.x + 12, top - 17);
  ctx.closePath();
  ctx.fill();
  // Little keeper's window on the tower.
  ctx.fillStyle = '#ffd98f';
  ctx.globalAlpha = 0.7;
  ctx.fillRect(p.x - 3, base - 54, 6, 8);
  ctx.globalAlpha = 1;
  ctx.restore();
}

function drawBeam(ctx, p) {
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  const beam = ctx.createLinearGradient(p.x, p.y, p.x - 300, p.y);
  beam.addColorStop(0, 'rgba(255, 230, 160, 0.32)');
  beam.addColorStop(0.55, 'rgba(255, 220, 150, 0.1)');
  beam.addColorStop(1, 'rgba(255, 220, 150, 0)');
  ctx.fillStyle = beam;
  ctx.beginPath();
  ctx.moveTo(p.x - 4, p.y - 4);
  ctx.lineTo(p.x - 300, p.y - 62);
  ctx.lineTo(p.x - 300, p.y + 30);
  ctx.lineTo(p.x - 4, p.y + 5);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawMoon(ctx, p) {
  const r = p.r * (p.s ?? 1);
  ctx.save();
  ctx.fillStyle = p.c;
  ctx.beginPath();
  ctx.arc(p.x, p.y, r, 0, TAU);
  ctx.fill();
  // Craters, seeded to stay put.
  ctx.fillStyle = 'rgba(160, 145, 120, 0.28)';
  for (let index = 0; index < 5; index += 1) {
    const angle = hash01(index + 4) * TAU;
    const distance = hash01(index + 9) * r * 0.6;
    ctx.beginPath();
    ctx.arc(
      p.x + Math.cos(angle) * distance,
      p.y + Math.sin(angle) * distance,
      r * (0.08 + hash01(index + 1) * 0.12),
      0,
      TAU,
    );
    ctx.fill();
  }
  ctx.strokeStyle = 'rgba(255, 250, 230, 0.5)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(p.x, p.y, r - 1, Math.PI * 1.05, Math.PI * 1.55);
  ctx.stroke();
  ctx.restore();
}

function drawCluster(ctx, p) {
  const twinkles = [
    [0, 0, 7],
    [18, 14, 4.5],
    [-14, 18, 4],
    [9, -17, 3.5],
    [-19, -9, 3],
  ];
  for (let index = 0; index < twinkles.length; index += 1) {
    const [dx, dy, size] = twinkles[index];
    ctx.globalAlpha = 0.85 - index * 0.1;
    starPath(ctx, p.x + dx, p.y + dy, size, size * 0.24, 4);
    ctx.fillStyle = p.c;
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

function drawGull(ctx, p) {
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.scale(p.s ?? 1, p.s ?? 1);
  ctx.strokeStyle = p.c;
  ctx.lineWidth = 1.7;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-9, 0);
  ctx.quadraticCurveTo(-4, -5, 0, 0);
  ctx.quadraticCurveTo(4, -5, 9, 0);
  ctx.stroke();
  ctx.restore();
}

function drawSailboat(ctx, p) {
  const s = p.s ?? 1;
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.scale(s, s);
  // Reflection.
  ctx.fillStyle = 'rgba(10, 16, 32, 0.5)';
  ellipse(ctx, 0, 8, 34, 4);
  ctx.fill();
  // Hull.
  ctx.fillStyle = p.a;
  ctx.beginPath();
  ctx.moveTo(-34, 0);
  ctx.quadraticCurveTo(-26, 13, 0, 13);
  ctx.quadraticCurveTo(26, 13, 35, -1);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = 'rgba(255, 255, 255, 0.18)';
  ctx.fillRect(-27, 2, 54, 2);
  // Mast.
  ctx.strokeStyle = '#d9c9a8';
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.moveTo(2, 1);
  ctx.lineTo(2, -80);
  ctx.stroke();
  // Sails.
  ctx.fillStyle = p.c;
  ctx.beginPath();
  ctx.moveTo(5, -74);
  ctx.quadraticCurveTo(34, -35, 29, -7);
  ctx.lineTo(5, -7);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = 'rgba(90, 70, 50, 0.2)';
  ctx.beginPath();
  ctx.moveTo(5, -66);
  ctx.quadraticCurveTo(26, -34, 22, -9);
  ctx.lineTo(5, -9);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = p.c;
  ctx.beginPath();
  ctx.moveTo(-1, -70);
  ctx.quadraticCurveTo(-29, -34, -24, -6);
  ctx.lineTo(-1, -6);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = 'rgba(70, 55, 40, 0.16)';
  ctx.beginPath();
  ctx.moveTo(-1, -64);
  ctx.quadraticCurveTo(-23, -32, -19, -8);
  ctx.lineTo(-1, -8);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawFlag(ctx, p) {
  ctx.fillStyle = 'rgba(20, 28, 50, 0.3)';
  ctx.beginPath();
  ctx.moveTo(p.x - 2, p.y);
  ctx.lineTo(p.x + 15, p.y + 3);
  ctx.lineTo(p.x - 2, p.y + 8);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = p.c;
  ctx.beginPath();
  ctx.moveTo(p.x - 2, p.y - 1);
  ctx.lineTo(p.x + 17, p.y + 2);
  ctx.lineTo(p.x - 2, p.y + 8);
  ctx.closePath();
  ctx.fill();
}

function drawRowboat(ctx, p) {
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.scale(p.s ?? 1, p.s ?? 1);
  ctx.fillStyle = 'rgba(8, 14, 30, 0.55)';
  ellipse(ctx, 0, 4, 36, 4);
  ctx.fill();
  ctx.fillStyle = p.c;
  ctx.beginPath();
  ctx.moveTo(-36, 0);
  ctx.quadraticCurveTo(-30, 15, 0, 15);
  ctx.quadraticCurveTo(30, 15, 37, -2);
  ctx.lineTo(30, -6);
  ctx.quadraticCurveTo(0, -2, -30, -6);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = p.a;
  ellipse(ctx, 0, -1, 28, 4.5);
  ctx.fill();
  // Oars.
  ctx.strokeStyle = '#a58258';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-18, 0);
  ctx.lineTo(-44, 12);
  ctx.moveTo(12, 0);
  ctx.lineTo(-8, 17);
  ctx.stroke();
  // Stern lantern.
  ctx.fillStyle = '#ffd68f';
  ctx.beginPath();
  ctx.arc(28, -8, 3, 0, TAU);
  ctx.fill();
  ctx.fillStyle = 'rgba(255, 200, 120, 0.18)';
  ctx.beginPath();
  ctx.arc(28, -8, 10, 0, TAU);
  ctx.fill();
  ctx.restore();
}

function drawBuoy(ctx, p) {
  ctx.fillStyle = 'rgba(8, 14, 30, 0.5)';
  ellipse(ctx, p.x, p.y + 5, 13, 3.5);
  ctx.fill();
  ctx.fillStyle = p.c;
  ctx.beginPath();
  ctx.ellipse(p.x, p.y, 10, 7, 0, 0, TAU);
  ctx.fill();
  ctx.fillStyle = '#f4efe2';
  ctx.fillRect(p.x - 10, p.y - 3, 20, 4);
  ctx.strokeStyle = '#2a3144';
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(p.x, p.y - 6);
  ctx.lineTo(p.x, p.y - 18);
  ctx.stroke();
  dot(ctx, p.x, p.y - 20, 2.4, '#ffe2a0');
  ctx.fillStyle = 'rgba(255, 226, 160, 0.16)';
  ctx.beginPath();
  ctx.arc(p.x, p.y - 20, 7, 0, TAU);
  ctx.fill();
}

function drawPier(ctx, p) {
  // Deck: a wedge, so the pier feels like it comes toward the viewer.
  ctx.fillStyle = '#2a1f19';
  ctx.beginPath();
  ctx.moveTo(0, p.y + 44);
  ctx.lineTo(268, p.y + 44);
  ctx.lineTo(238, p.y - 10);
  ctx.lineTo(0, p.y - 4);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = p.c;
  ctx.beginPath();
  ctx.moveTo(0, p.y);
  ctx.lineTo(236, p.y - 8);
  ctx.lineTo(268, p.y + 40);
  ctx.lineTo(0, p.y + 40);
  ctx.closePath();
  ctx.fill();

  // Plank seams converging on a vanishing point.
  ctx.strokeStyle = 'rgba(38, 26, 19, 0.55)';
  ctx.lineWidth = 1.1;
  for (let index = 1; index < 8; index += 1) {
    const y = p.y + index * 6;
    ctx.beginPath();
    ctx.moveTo(0, y - 1);
    ctx.lineTo(246 - index * 2, y - 7);
    ctx.stroke();
  }
  ctx.strokeStyle = 'rgba(120, 92, 66, 0.35)';
  for (let index = 0; index < 4; index += 1) {
    const x = 40 + index * 56;
    ctx.beginPath();
    ctx.moveTo(x, p.y - 2 + index * 1.6);
    ctx.lineTo(x + 8, p.y + 39);
    ctx.stroke();
  }

  // Pilings and their dark reflections.
  ctx.fillStyle = '#1b1410';
  ctx.fillRect(232, p.y - 2, 9, 24);
  ctx.fillRect(248, p.y + 3, 8, 22);
  ctx.fillStyle = 'rgba(6, 10, 22, 0.55)';
  ctx.fillRect(232, p.y + 24, 9, 22);
  ctx.fillRect(248, p.y + 27, 8, 18);
}

function drawLamppost(ctx, p) {
  ctx.strokeStyle = '#141a26';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(p.x, p.y);
  ctx.lineTo(p.x, p.y - 78);
  ctx.quadraticCurveTo(p.x, p.y - 90, p.x + 12, p.y - 90);
  ctx.stroke();
  // Light cone.
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  const cone = ctx.createLinearGradient(p.x + 14, p.y - 88, p.x + 14, p.y - 10);
  cone.addColorStop(0, 'rgba(255, 206, 128, 0.34)');
  cone.addColorStop(1, 'rgba(255, 206, 128, 0)');
  ctx.fillStyle = cone;
  ctx.beginPath();
  ctx.moveTo(p.x + 4, p.y - 94);
  ctx.lineTo(p.x + 40, p.y - 4);
  ctx.lineTo(p.x - 30, p.y - 4);
  ctx.lineTo(p.x + 2, p.y - 94);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
  // Lantern.
  ctx.fillStyle = '#1a2130';
  ctx.beginPath();
  ctx.moveTo(p.x + 6, p.y - 96);
  ctx.lineTo(p.x + 24, p.y - 96);
  ctx.lineTo(p.x + 20, p.y - 78);
  ctx.lineTo(p.x + 10, p.y - 78);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = p.c;
  ctx.globalAlpha = 0.95;
  ctx.beginPath();
  ctx.moveTo(p.x + 9, p.y - 93);
  ctx.lineTo(p.x + 21, p.y - 93);
  ctx.lineTo(p.x + 18.5, p.y - 81);
  ctx.lineTo(p.x + 11.5, p.y - 81);
  ctx.closePath();
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.fillStyle = 'rgba(40, 44, 54, 0.45)';
  ellipse(ctx, p.x + 8, p.y + 2, 26, 4);
  ctx.fill();
}

function drawCrate(ctx, p) {
  const { x, y, w, h } = p;
  ctx.fillStyle = 'rgba(8, 10, 18, 0.35)';
  ctx.fillRect(x + 3, y + 4, w, h);
  ctx.fillStyle = p.c;
  ctx.fillRect(x, y, w, h);
  // Planks.
  ctx.strokeStyle = 'rgba(38, 24, 16, 0.55)';
  ctx.lineWidth = 1.2;
  for (let index = 1; index < 3; index += 1) {
    ctx.beginPath();
    ctx.moveTo(x + 2, y + (h / 3) * index);
    ctx.lineTo(x + w - 2, y + (h / 3) * index);
    ctx.stroke();
  }
  // Metal corners.
  ctx.fillStyle = '#313542';
  ctx.fillRect(x, y, w, 3);
  ctx.fillRect(x, y + h - 3, w, 3);
  ctx.fillRect(x, y, 3, h);
  ctx.fillRect(x + w - 3, y, 3, h);
  // Cargo stamp.
  ctx.strokeStyle = p.a;
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(x + w / 2, y + h * 0.3);
  ctx.lineTo(x + w * 0.62, y + h * 0.5);
  ctx.lineTo(x + w / 2, y + h * 0.7);
  ctx.lineTo(x + w * 0.38, y + h * 0.5);
  ctx.closePath();
  ctx.stroke();
  ctx.fillStyle = p.a;
  ctx.globalAlpha = 0.75;
  ctx.fillRect(x + w * 0.44, y + h * 0.46, w * 0.12, 3);
  ctx.globalAlpha = 1;
}

function drawCat(ctx, p) {
  const s = p.s ?? 1;
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.scale(s, s);
  ctx.fillStyle = p.c;
  // Tail: one long curve with a little kink.
  ctx.strokeStyle = p.c;
  ctx.lineWidth = 5;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(10, -4);
  ctx.quadraticCurveTo(30, -4, 26, -22);
  ctx.quadraticCurveTo(24, -32, 31, -34);
  ctx.stroke();
  // Body.
  ellipse(ctx, 0, -8, 14, 17);
  ctx.fill();
  // Head.
  ctx.beginPath();
  ctx.arc(-2, -28, 10, 0, TAU);
  ctx.fill();
  // Ears.
  ctx.beginPath();
  ctx.moveTo(-11, -33);
  ctx.lineTo(-9, -45);
  ctx.lineTo(-3, -37);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(4, -37);
  ctx.lineTo(9, -44);
  ctx.lineTo(9, -31);
  ctx.closePath();
  ctx.fill();
  // Eyes catch the lamp.
  ctx.fillStyle = '#ffd873';
  dot(ctx, -6, -29, 1.5, '#ffd873');
  dot(ctx, 2, -29, 1.5, '#ffd873');
  ctx.restore();
}

function drawRope(ctx, p) {
  ctx.strokeStyle = p.c;
  ctx.lineWidth = 2.2;
  for (let ring = 0; ring < 3; ring += 1) {
    ctx.globalAlpha = 0.6 - ring * 0.12;
    ellipse(ctx, p.x, p.y, 14 - ring * 3, 5 - ring);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
}
