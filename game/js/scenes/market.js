// Level three: "Night Market". A lantern-lit street of food stalls at dusk: striped awnings,
// hanging paper lanterns, strings of bulbs, wet cobbles and drifting steam. Layered back to
// front so the picture has real depth, and a handful of tiny animations that run identically
// on both copies: bulbs breathe, steam rises, embers float.

import { TAU, dot, ellipse, gradient, hash01, radial, roundRect, sparkle, withAlpha } from '../draw.js';

const W = 560;
const H = 440;
const GROUND = 292;

function makeStars(random, count) {
  const stars = [];
  for (let index = 0; index < count; index += 1) {
    stars.push({
      x: 6 + random() * (W - 12),
      y: 6 + random() * 150,
      r: 0.4 + random() * 1.4,
      a: 0.25 + random() * 0.6,
      phase: random() * TAU,
    });
  }
  return stars;
}

function makeSkyline(random) {
  const rows = [];
  let x = -12;
  while (x < W + 20) {
    const width = 24 + random() * 36;
    const height = 26 + random() * 64;
    rows.push({ x, w: width, h: height, pagoda: random() > 0.55, seed: Math.floor(random() * 999) });
    x += width + 2 + random() * 8;
  }
  return rows;
}

export function buildMarket(random) {
  const stars = makeStars(random, 44);
  const skyline = makeSkyline(random);
  const props = [];

  // --- Backdrop: dusk sky, distant roofs, wet cobblestone street ---------------------------
  const backdrop = (ctx, time = 0) => {
    ctx.fillStyle = gradient(ctx, 0, 0, 0, 250, [
      [0, '#090b23'],
      [0.42, '#1c1a42'],
      [0.72, '#42305a'],
      [1, '#7b4a58'],
    ]);
    ctx.fillRect(0, 0, W, 260);

    // Warm haze over the market, as if the lanterns lit the air itself.
    ctx.fillStyle = radial(ctx, 300, 210, 20, 250, [
      [0, 'rgba(255, 166, 96, 0.3)'],
      [0.5, 'rgba(255, 140, 90, 0.1)'],
      [1, 'rgba(255, 140, 90, 0)'],
    ]);
    ctx.fillRect(30, 80, 520, 200);

    for (const star of stars) {
      const twinkle = 0.6 + 0.4 * Math.sin(time * 1.7 + star.phase);
      ctx.globalAlpha = star.a * twinkle * (1 - star.y / 240);
      dot(ctx, star.x, star.y, star.r, '#eef1ff');
    }
    ctx.globalAlpha = 1;

    // Moon halo; the moon disc is a prop so one copy can change it.
    ctx.fillStyle = radial(ctx, 470, 62, 18, 84, [
      [0, 'rgba(255, 236, 190, 0.46)'],
      [0.45, 'rgba(255, 224, 170, 0.12)'],
      [1, 'rgba(255, 224, 170, 0)'],
    ]);
    ctx.fillRect(370, -20, 200, 190);

    // Distant skyline: black roofs with tiny lit windows and pagoda eaves.
    ctx.fillStyle = '#0a0c20';
    for (const row of skyline) {
      const top = 186 - row.h;
      ctx.fillRect(row.x, top, row.w, row.h + 24);
      ctx.fillStyle = '#0a0c20';
      if (row.pagoda) {
        ctx.beginPath();
        ctx.moveTo(row.x - 8, top + 2);
        ctx.quadraticCurveTo(row.x + row.w / 2, top - 18, row.x + row.w + 8, top + 2);
        ctx.lineTo(row.x + row.w + 2, top + 8);
        ctx.quadraticCurveTo(row.x + row.w / 2, top - 7, row.x - 2, top + 8);
        ctx.closePath();
        ctx.fill();
      }
      // A few warm windows.
      for (let window = 0; window < 4; window += 1) {
        if (hash01(row.seed + window * 13) > 0.55) {
          ctx.fillStyle = 'rgba(255, 193, 110, 0.5)';
          ctx.fillRect(row.x + 4 + window * ((row.w - 8) / 4), top + 8 + (window % 3) * 9, 3, 4);
          ctx.fillStyle = '#0a0c20';
        }
      }
    }

    // Overhead wires with pinprick bulbs, a second layer of depth behind the market strings.
    for (let wire = 0; wire < 2; wire += 1) {
      const y = 60 + wire * 26;
      ctx.strokeStyle = 'rgba(10, 12, 30, 0.75)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.quadraticCurveTo(W / 2, y + 22, W, y - 4);
      ctx.stroke();
      for (let bulb = 1; bulb < 9; bulb += 1) {
        const at = bulb / 9;
        const bx = at * W;
        const by = y + 22 * (1 - Math.pow(2 * at - 1, 2));
        const blink = 0.55 + 0.45 * Math.sin(time * 2.1 + bulb + wire * 3);
        ctx.globalAlpha = blink * 0.75;
        dot(ctx, bx, by, 1.3, '#ffd28c');
      }
      ctx.globalAlpha = 1;
    }

    // The street: deep blue cobbles that warm toward the stalls.
    ctx.fillStyle = gradient(ctx, 0, GROUND - 28, 0, H, [
      [0, '#221c2c'],
      [0.45, '#181524'],
      [1, '#0c0b16'],
    ]);
    ctx.fillRect(0, GROUND - 28, W, H - GROUND + 28);

    // Cobblestone texture in perspective: rows widen as they come forward.
    for (let row = 0; row < 9; row += 1) {
      const y = GROUND - 4 + row * 17;
      const stoneW = 22 + row * 3.4;
      const offset = (row % 2) * stoneW * 0.5 - stoneW * 0.5;
      for (let col = -1; col < W / stoneW + 1; col += 1) {
        const x = offset + col * (stoneW + 2);
        const shade = 0.03 + hash01(row * 17 + col * 7) * 0.07;
        ctx.fillStyle = `rgba(150, 170, 210, ${shade})`;
        roundRect(ctx, x, y, stoneW - 2, 13, 4);
        ctx.fill();
        ctx.strokeStyle = 'rgba(90, 100, 140, 0.06)';
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }

    // Wet reflections: warm vertical smears beneath the two stalls and the lantern post.
    for (const smear of [
      { x: 110, y: 310, w: 150, color: '255, 160, 90' },
      { x: 440, y: 306, w: 160, color: '255, 120, 90' },
      { x: 280, y: 300, w: 90, color: '255, 200, 130' },
    ]) {
      ctx.fillStyle = gradient(ctx, smear.x, smear.y, smear.x, H, [
        [0, `rgba(${smear.color}, 0.16)`],
        [0.5, `rgba(${smear.color}, 0.07)`],
        [1, `rgba(${smear.color}, 0)`],
      ]);
      ctx.fillRect(smear.x - smear.w / 2, smear.y, smear.w, H - smear.y);
    }
    for (let index = 0; index < 26; index += 1) {
      const x = 20 + hash01(index * 3.3) * (W - 40);
      const y = 306 + hash01(index * 7.1) * 120;
      const width = 6 + hash01(index * 1.7) * 30;
      ctx.fillStyle = `rgba(255, 186, 120, ${0.03 + hash01(index) * 0.06})`;
      ellipse(ctx, x, y, width, 1.6);
      ctx.fill();
    }

    // A runoff channel with a grate, and petals blown across the stones.
    ctx.fillStyle = 'rgba(8, 8, 16, 0.65)';
    roundRect(ctx, 318, 408, 66, 9, 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(150, 170, 210, 0.18)';
    ctx.lineWidth = 1;
    for (let bar = 0; bar < 7; bar += 1) {
      ctx.beginPath();
      ctx.moveTo(322 + bar * 9, 409);
      ctx.lineTo(322 + bar * 9, 416);
      ctx.stroke();
    }
    for (let petal = 0; petal < 14; petal += 1) {
      const x = 12 + hash01(petal * 4.3) * (W - 24);
      const y = 320 + hash01(petal * 8.1) * 104;
      ctx.fillStyle = `rgba(255, 150, 170, ${0.1 + hash01(petal) * 0.15})`;
      ellipse(ctx, x, y, 2 + hash01(petal * 2.7) * 2, 1.1, hash01(petal) * 2);
      ctx.fill();
    }

    // Soft ground mist so the foreground does not end abruptly.
    ctx.fillStyle = radial(ctx, 280, 430, 40, 260, [
      [0, 'rgba(120, 120, 170, 0.08)'],
      [1, 'rgba(120, 120, 170, 0)'],
    ]);
    ctx.fillRect(0, 340, W, 100);

    // A moon gate arch frames the alley at the back of the market.
    drawArch(ctx);
  };

  // --- Props -------------------------------------------------------------------------------
  props.push({ id: 'moon', type: 'moon', x: 470, y: 62, r: 26, z: 1, s: 1, c: '#f8e7b8' });
  props.push({ id: 'cluster', type: 'cluster', x: 148, y: 54, z: 1.2, s: 1, c: '#d9e6ff', side: 'right' });

  props.push({ id: 'awningL', type: 'awning', x: 22, y: 158, w: 192, c: '#2f9c9a', a: '#f2e5c5', z: 4 });
  props.push({ id: 'awningR', type: 'awning', x: 350, y: 148, w: 194, c: '#c2534f', a: '#ffd9a0', z: 4 });
  props.push({ id: 'stallL', type: 'stall', x: 30, y: 186, w: 176, h: 112, c: '#291c2b', a: '#ffce7a', variant: 0, z: 3.8 });
  props.push({ id: 'stallR', type: 'stall', x: 360, y: 176, w: 176, h: 112, c: '#2b1a24', a: '#ffc46e', variant: 1, z: 3.8 });

  props.push({ id: 'sign', type: 'sign', x: 62, y: 201, w: 108, h: 30, t: 'NOODLES', c: '#3a2920', a: '#ffd27a', z: 5.2 });

  props.push({
    id: 'stringA', type: 'lights', x0: -8, y0: 82, x1: 278, y1: 96, sag: 26, n: 12,
    c: '#ffcf6b', z: 6.5,
  });
  props.push({
    id: 'stringB', type: 'lights', x0: 280, y0: 96, x1: 566, y1: 76, sag: 18, n: 11,
    c: '#ffd98a', z: 6.5,
  });
  props.push({ id: 'bunting', type: 'bunting', x0: -4, y0: 134, x1: 564, y1: 124, n: 17, c: '#6fe0d3', z: 6 });
  props.push({ id: 'lanterns', type: 'lanterns', x: 280, y: 122, n: 3, c: '#ffb46b', z: 5 });
  props.push({ id: 'lanternPost', type: 'lanternPost', x: 544, y: 326, c: '#ffcf7a', z: 7 });
  props.push({ id: 'fish', type: 'fish', x: 420, y: 250, z: 5, c: '#c9d3dc' });
  props.push({ id: 'umbrella', type: 'umbrella', x: 498, y: 228, rot: 0, s: 1, c: '#e86a5a', a: '#f6dfba', z: 5.1 });
  props.push({ id: 'steam', type: 'steam', x: 392, y: 246, c: '#ffe8c9', z: 5.5 });

  props.push({ id: 'barrel', type: 'barrel', x: 54, y: 384, c: '#7a4b2e', a: '#d9a765', z: 7.5 });
  props.push({ id: 'crate', type: 'crate', x: 92, y: 356, w: 58, h: 42, c: '#6b472f', a: '#f2c178', z: 7.4 });
  props.push({ id: 'plant', type: 'plant', x: 168, y: 350, c: '#2f7d5c', a: '#ffcf6b', z: 7.4 });
  props.push({ id: 'cat', type: 'cat', x: 124, y: 349, s: 0.85, c: '#171b28', z: 8 });
  props.push({ id: 'stool', type: 'stool', x: 236, y: 376, c: '#5a3a2a', z: 8 });
  props.push({ id: 'bicycle', type: 'bicycle', x: 442, y: 365, c: '#2c3a50', a: '#e9ddc2', z: 8 });
  props.push({ id: 'sacks', type: 'sacks', x: 26, y: 425, z: 7.2, c: '#b9925f', a: '#8a6a42' });
  props.push({ id: 'bucket', type: 'bucket', x: 288, y: 425, z: 7.6, c: '#6b4a33', a: '#aab6c4' });
  props.push({ id: 'basket', type: 'basket', x: 494, y: 415, z: 7.7, c: '#8a5a34', a: '#ff9f4a' });
  props.push({ id: 'patron', type: 'patron', x: 518, y: 370, z: 7.9, s: 1.05, c: '#171320', a: '#ffc97a' });

  const centres = {
    moon: [470, 62],
    cluster: [148, 54],
    awningL: [118, 168],
    awningR: [447, 158],
    sign: [116, 216],
    stringA: [130, 113],
    bunting: [280, 131],
    lanterns: [280, 126],
    lanternPost: [544, 292],
    fish: [420, 252],
    umbrella: [498, 228],
    steam: [392, 238],
    barrel: [54, 382],
    crate: [121, 377],
    plant: [168, 346],
    cat: [126, 340],
    bicycle: [442, 362],
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
    { prop: 'cluster', op: 'show', tier: 1, r: 1.1 },
    { prop: 'steam', op: 'hide', tier: 1, r: 1.15 },
    { prop: 'crate', op: 'hide', tier: 1, r: 1.15 },
    { prop: 'cat', op: 'color', value: '#f4f6fb', tier: 2, r: 1.2 },
    { prop: 'lanterns', op: 'hide', tier: 2, r: 1.2 },
    { prop: 'lanterns', op: 'color', value: '#8fe8d6', tier: 2, r: 1.2 },
    { prop: 'awningL', op: 'color', value: '#d06a94', tier: 2, r: 1.2 },
    { prop: 'awningR', op: 'color', value: '#3c9c8c', tier: 2, r: 1.2 },
    { prop: 'bunting', op: 'hide', tier: 2, r: 1.15 },
    { prop: 'fish', op: 'hide', tier: 2, r: 1.2 },
    { prop: 'plant', op: 'hide', tier: 1, r: 1.15 },
    { prop: 'barrel', op: 'color', value: '#3f7d84', tier: 3, r: 1.2 },
    { prop: 'lanternPost', op: 'color', value: '#7fe4ff', tier: 3, r: 1.15 },
    { prop: 'moon', op: 'color', value: '#c6e2ff', tier: 3, r: 1.2 },
    { prop: 'moon', op: 'scale', value: 1.24, tier: 2, r: 1.2 },
    { prop: 'sign', op: 'text', value: 'DUMPLINGS', tier: 3, r: 1.25 },
    { prop: 'stringA', op: 'count', value: 15, tier: 3, r: 1.3 },
    { prop: 'umbrella', op: 'rotate', value: 0.55, tier: 3, r: 1.2 },
    { prop: 'umbrella', op: 'color', value: '#7fc6e8', tier: 2, r: 1.2 },
    { prop: 'bicycle', op: 'shift', value: { dx: 16, dy: -5 }, tier: 3, r: 1.3 },
    { prop: 'bicycle', op: 'hide', tier: 1, r: 1.2 },
  ];

  // Floating embers and a thin drift of smoke: the market's quiet animation.
  const ambient = (ctx, time = 0) => {
    for (let index = 0; index < 16; index += 1) {
      const phase = hash01(index * 2.7) * TAU;
      const speed = 5 + hash01(index * 5.1) * 8;
      const x = hash01(index * 3.3) * W + Math.sin(time * 0.5 + phase) * 10;
      const y = ((index * 39 + time * speed) % (H + 30)) - 15;
      const alpha = 0.12 + hash01(index * 7.7) * 0.3;
      ctx.globalAlpha = alpha * (0.6 + 0.4 * Math.sin(time * 3 + phase));
      ctx.fillStyle = index % 3 === 0 ? '#9ff4e2' : '#ffc97a';
      ctx.beginPath();
      ctx.arc(x, H - y, 1 + hash01(index * 9.1) * 1.4, 0, TAU);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    ctx.fillStyle = radial(ctx, 300, 260, 10, 180, [
      [0, 'rgba(255, 190, 130, 0.05)'],
      [1, 'rgba(255, 190, 130, 0)'],
    ]);
    ctx.fillRect(100, 150, 400, 180);
  };

  return {
    key: 'market',
    name: 'Night Market',
    tint: '#ffa86b',
    props,
    pool,
    backdrop,
    ambient,
    drawProp: drawMarketProp,
  };
}

// --- Backdrop details ------------------------------------------------------------------------

function drawArch(ctx) {
  ctx.save();
  ctx.fillStyle = '#120d1d';
  // Posts.
  ctx.fillRect(236, 112, 12, 92);
  ctx.fillRect(312, 112, 12, 92);
  // Curved roof with upturned ends.
  ctx.beginPath();
  ctx.moveTo(222, 116);
  ctx.quadraticCurveTo(280, 84, 338, 116);
  ctx.lineTo(332, 124);
  ctx.quadraticCurveTo(280, 100, 228, 124);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = 'rgba(255, 190, 110, 0.28)';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(228, 118);
  ctx.quadraticCurveTo(280, 89, 332, 118);
  ctx.stroke();
  // Lattice under the arch, faintly lit.
  ctx.strokeStyle = 'rgba(255, 190, 110, 0.12)';
  for (let index = 0; index < 5; index += 1) {
    ctx.beginPath();
    ctx.moveTo(240 + index * 16, 124);
    ctx.lineTo(240 + index * 16, 168);
    ctx.stroke();
  }
  ctx.restore();
}

// --- Prop painters ---------------------------------------------------------------------------

function drawMarketProp(ctx, p, time = 0) {
  switch (p.type) {
    case 'moon': return drawMoon(ctx, p);
    case 'cluster': return drawCluster(ctx, p, time);
    case 'awning': return drawAwning(ctx, p);
    case 'stall': return drawStall(ctx, p, time);
    case 'sign': return drawSign(ctx, p);
    case 'lights': return drawLights(ctx, p, time);
    case 'bunting': return drawBunting(ctx, p);
    case 'lanterns': return drawLanterns(ctx, p, time);
    case 'lanternPost': return drawLanternPost(ctx, p, time);
    case 'fish': return drawFish(ctx, p);
    case 'umbrella': return drawUmbrella(ctx, p);
    case 'steam': return drawSteam(ctx, p, time);
    case 'barrel': return drawBarrel(ctx, p);
    case 'crate': return drawCrate(ctx, p);
    case 'plant': return drawPlant(ctx, p);
    case 'cat': return drawCat(ctx, p);
    case 'stool': return drawStool(ctx, p);
    case 'bicycle': return drawBicycle(ctx, p);
    case 'sacks': return drawSacks(ctx, p);
    case 'bucket': return drawBucket(ctx, p);
    case 'basket': return drawBasket(ctx, p);
    case 'patron': return drawPatron(ctx, p, time);
    default: return undefined;
  }
}

function drawMoon(ctx, p) {
  const r = p.r * (p.s ?? 1);
  ctx.save();
  ctx.fillStyle = p.c;
  ctx.beginPath();
  ctx.arc(p.x, p.y, r, 0, TAU);
  ctx.fill();
  ctx.fillStyle = 'rgba(170, 150, 120, 0.24)';
  for (let index = 0; index < 5; index += 1) {
    const angle = hash01(index + 2) * TAU;
    const distance = hash01(index + 8) * r * 0.6;
    ctx.beginPath();
    ctx.arc(
      p.x + Math.cos(angle) * distance,
      p.y + Math.sin(angle) * distance,
      r * (0.07 + hash01(index + 1) * 0.13),
      0,
      TAU,
    );
    ctx.fill();
  }
  ctx.strokeStyle = 'rgba(255, 250, 228, 0.5)';
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.arc(p.x, p.y, r - 1, Math.PI * 1.02, Math.PI * 1.55);
  ctx.stroke();
  ctx.restore();
}

function drawCluster(ctx, p, time) {
  ctx.save();
  for (let index = 0; index < 6; index += 1) {
    const x = p.x + (hash01(index * 3.1) - 0.5) * 54;
    const y = p.y + (hash01(index * 7.3) - 0.5) * 32;
    const size = 2.4 + hash01(index * 5.7) * 4.4;
    const twinkle = 0.55 + 0.45 * Math.sin(time * 2.4 + index * 1.9);
    sparkle(ctx, x, y, size * twinkle + 0.6, index % 3 === 0 ? '#ffd98a' : p.c, 0.62 + twinkle * 0.3);
  }
  ctx.restore();
}

function drawAwning(ctx, p) {
  const { x, w } = p;
  const y = p.y;
  const stripe = 14;
  ctx.save();
  // Top board.
  ctx.fillStyle = '#1a1220';
  ctx.fillRect(x - 2, y - 4, w + 4, 5);
  // Stripes.
  for (let index = 0; index * stripe < w; index += 1) {
    ctx.fillStyle = index % 2 === 0 ? p.c : p.a;
    ctx.fillRect(x + index * stripe, y, Math.min(stripe, w - index * stripe), 24);
  }
  // Scalloped fringe.
  for (let index = 0; index * stripe < w; index += 1) {
    ctx.fillStyle = index % 2 === 0 ? p.c : p.a;
    ctx.beginPath();
    ctx.arc(x + index * stripe + stripe / 2, y + 24, stripe / 2 - 0.5, 0, Math.PI);
    ctx.fill();
  }
  // Shade under the canvas.
  ctx.fillStyle = 'rgba(6, 8, 16, 0.28)';
  ctx.fillRect(x, y + 25, w, 7);
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.16)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x, y + 0.5);
  ctx.lineTo(x + w, y + 0.5);
  ctx.stroke();
  ctx.restore();
}

function drawStall(ctx, p, time) {
  const { x, y, w, h } = p;
  ctx.save();
  // Back interior.
  ctx.fillStyle = p.c;
  ctx.fillRect(x, y + 26, w, h - 26);
  ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
  ctx.fillRect(x + 6, y + 30, w - 12, h - 34);

  // A short cloth valance under the awning.
  for (let stripe = 0; stripe * 16 < w; stripe += 1) {
    ctx.fillStyle = stripe % 2 === 0 ? withAlpha(p.a, 0.42) : withAlpha(p.a, 0.16);
    ctx.fillRect(x + stripe * 16, y + 26, Math.min(16, w - stripe * 16), 13);
  }
  for (let scallop = 0; scallop * 16 < w; scallop += 1) {
    ctx.fillStyle = withAlpha(p.a, scallop % 2 === 0 ? 0.38 : 0.18);
    ctx.beginPath();
    ctx.arc(x + scallop * 16 + 8, y + 39, 8, 0, Math.PI);
    ctx.fill();
  }

  // Vertical plank seams in the back wall.
  ctx.strokeStyle = 'rgba(12, 8, 14, 0.2)';
  ctx.lineWidth = 1;
  for (let seam = 1; seam * 10 < w - 12; seam += 1) {
    ctx.beginPath();
    ctx.moveTo(x + 6 + seam * 10, y + 30);
    ctx.lineTo(x + 6 + seam * 10, y + h - 36);
    ctx.stroke();
  }

  // A low string of tiny bulbs under the valance.
  for (let bulb = 0; bulb * 26 < w - 20; bulb += 1) {
    const bx = x + 14 + bulb * 26;
    const by = y + 51;
    ctx.fillStyle = radial(ctx, bx, by, 0.5, 9, [
      [0, withAlpha(p.a, 0.28)],
      [1, withAlpha(p.a, 0)],
    ]);
    ctx.fillRect(bx - 9, by - 9, 18, 18);
    dot(ctx, bx, by, 1.6, '#ffe7b0');
  }

  // Shelves and goods.
  for (let shelf = 0; shelf < 2; shelf += 1) {
    const sy = y + 48 + shelf * 32;
    ctx.fillStyle = '#38241f';
    ctx.fillRect(x + 12, sy, w - 24, 3);
    for (let item = 0; item < 6; item += 1) {
      const ix = x + 20 + item * ((w - 42) / 6) + (shelf * 3);
      const kind = (item + shelf + p.variant) % 3;
      if (kind === 0) {
        // Jar.
        ctx.fillStyle = 'rgba(160, 220, 210, 0.5)';
        roundRect(ctx, ix, sy - 13, 8, 12, 2);
        ctx.fill();
        ctx.fillStyle = '#5b3b2a';
        ctx.fillRect(ix, sy - 15, 8, 2);
      } else if (kind === 1) {
        // Bowl of food.
        ctx.fillStyle = '#b9603f';
        ctx.beginPath();
        ctx.ellipse(ix + 5, sy - 2, 7, 4, 0, 0, TAU);
        ctx.fill();
        ctx.fillStyle = 'rgba(255, 213, 150, 0.85)';
        ctx.beginPath();
        ctx.ellipse(ix + 5, sy - 4, 5, 2, 0, 0, TAU);
        ctx.fill();
      } else {
        // Hanging skewer.
        ctx.strokeStyle = '#c7a06a';
        ctx.beginPath();
        ctx.moveTo(ix + 5, sy - 16);
        ctx.lineTo(ix + 5, sy - 5);
        ctx.stroke();
        dot(ctx, ix + 5, sy - 8, 2.8, '#d9743f');
        dot(ctx, ix + 5, sy - 12, 2.4, '#e0a45c');
      }
    }
  }

  // Goods resting on the counter: bowls, bottles and a little teapot.
  const counterY = y + h - 40;
  for (let item = 0; item < 5; item += 1) {
    const ix = x + 20 + item * 31;
    if (item % 2 === 0) {
      ctx.fillStyle = p.a;
      ctx.beginPath();
      ctx.ellipse(ix, counterY, 7, 3, 0, 0, TAU);
      ctx.fill();
      ctx.fillStyle = 'rgba(255, 240, 210, 0.3)';
      ctx.beginPath();
      ctx.ellipse(ix - 1, counterY - 1, 4.5, 1.4, 0, 0, TAU);
      ctx.fill();
    } else {
      ctx.fillStyle = 'rgba(160, 220, 210, 0.6)';
      roundRect(ctx, ix - 2.5, counterY - 12, 5, 12, 1.5);
      ctx.fill();
      ctx.fillStyle = p.a;
      ctx.fillRect(ix - 2, counterY - 14, 4, 2);
    }
  }

  // A stack of bowls and a steaming pot anchor the counter.
  const stackX = x + w * 0.17;
  for (let bowl = 0; bowl < 3; bowl += 1) {
    ctx.fillStyle = bowl % 2 === 0 ? p.a : '#c98a55';
    ctx.beginPath();
    ctx.ellipse(stackX, counterY - bowl * 3.4, 8 - bowl * 0.8, 2.6, 0, 0, TAU);
    ctx.fill();
  }
  const potX = x + w * 0.58;
  ctx.fillStyle = '#3c2a25';
  ctx.beginPath();
  ctx.ellipse(potX, counterY - 8, 13, 9, 0, 0, TAU);
  ctx.fill();
  ctx.fillStyle = '#5a3f33';
  ctx.beginPath();
  ctx.ellipse(potX, counterY - 15, 12, 4, 0, 0, TAU);
  ctx.fill();
  ctx.fillStyle = 'rgba(255, 200, 130, 0.5)';
  ctx.beginPath();
  ctx.ellipse(potX, counterY - 15, 8, 2.4, 0, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = 'rgba(240, 220, 190, 0.2)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(potX, counterY - 8, 12, Math.PI * 0.9, Math.PI * 1.6);
  ctx.stroke();
  // Steam curls above the pot.
  for (let curl = 0; curl < 3; curl += 1) {
    const age = (time * 0.4 + curl * 0.3) % 1;
    ctx.strokeStyle = `rgba(255, 235, 205, ${(1 - age) * 0.18})`;
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(potX + Math.sin(curl * 2) * 3, counterY - 18 - age * 2);
    ctx.quadraticCurveTo(
      potX + Math.sin(age * 5 + curl) * 6,
      counterY - 26 - age * 18,
      potX + Math.sin(age * 4 + curl * 2) * 9,
      counterY - 34 - age * 22,
    );
    ctx.stroke();
  }

  // Counter front with planks.
  ctx.fillStyle = '#4c3025';
  ctx.fillRect(x - 2, y + h - 32, w + 4, 34);
  ctx.fillStyle = '#6b4632';
  ctx.fillRect(x - 2, y + h - 34, w + 4, 5);
  ctx.strokeStyle = 'rgba(30, 18, 12, 0.5)';
  ctx.lineWidth = 1.1;
  for (let plank = 1; plank < 4; plank += 1) {
    ctx.beginPath();
    ctx.moveTo(x, y + h - 32 + plank * 8);
    ctx.lineTo(x + w, y + h - 32 + plank * 8);
    ctx.stroke();
  }

  // A small warm paper lantern inside the stall.
  const lampX = x + (p.variant === 0 ? w - 26 : 26);
  const lampY = y + 40;
  ctx.fillStyle = radial(ctx, lampX, lampY, 2, 30, [
    [0, 'rgba(255, 214, 140, 0.7)'],
    [1, 'rgba(255, 214, 140, 0)'],
  ]);
  ctx.fillRect(lampX - 34, lampY - 34, 68, 68);
  ctx.strokeStyle = 'rgba(40, 26, 24, 0.8)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(lampX, y + 26);
  ctx.lineTo(lampX, lampY - 8);
  ctx.stroke();
  ctx.fillStyle = '#ffcf7a';
  ctx.beginPath();
  ctx.ellipse(lampX, lampY, 6.5, 8, 0, 0, TAU);
  ctx.fill();
  ctx.fillStyle = 'rgba(255, 250, 225, 0.5)';
  ctx.beginPath();
  ctx.ellipse(lampX - 1.8, lampY - 2, 2.4, 4, -0.2, 0, TAU);
  ctx.fill();

  // Vendor silhouette on the left stall.
  if (p.variant === 0) {
    ctx.fillStyle = 'rgba(14, 10, 18, 0.9)';
    ctx.beginPath();
    ctx.ellipse(x + 44, y + h - 46, 15, 20, 0, 0, TAU);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x + 44, y + h - 70, 9, 0, TAU);
    ctx.fill();
    // Conical hat.
    ctx.beginPath();
    ctx.moveTo(x + 28, y + h - 77);
    ctx.quadraticCurveTo(x + 44, y + h - 94, x + 60, y + h - 77);
    ctx.closePath();
    ctx.fill();
    // Warm rim light so the vendor reads against the dark stall.
    ctx.strokeStyle = 'rgba(255, 196, 130, 0.42)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(x + 44, y + h - 70, 9, Math.PI * 1.1, Math.PI * 1.9);
    ctx.moveTo(x + 60, y + h - 77);
    ctx.quadraticCurveTo(x + 44, y + h - 93, x + 30, y + h - 78);
    ctx.stroke();
    // Steam bowl in front.
    ctx.fillStyle = 'rgba(255, 200, 140, 0.14)';
    ctx.beginPath();
    ctx.ellipse(x + 68, y + h - 40, 14, 4, 0, 0, TAU);
    ctx.fill();
  } else {
    // Dried goods hanging from the right stall's beam.
    for (let item = 0; item < 3; item += 1) {
      const ix = x + w - 34 - item * 22;
      ctx.strokeStyle = '#a97c53';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(ix, y + 30);
      ctx.lineTo(ix, y + 48 + item * 3);
      ctx.stroke();
      ctx.fillStyle = 'rgba(214, 122, 76, 0.85)';
      ctx.beginPath();
      ctx.ellipse(ix, y + 55 + item * 3, 4, 9, 0, 0, TAU);
      ctx.fill();
    }
  }

  // Support poles that tie the awning to the counter.
  ctx.fillStyle = '#291d1a';
  ctx.fillRect(x + 5, y + 24, 4, h - 22);
  ctx.fillRect(x + w - 9, y + 24, 4, h - 22);
  ctx.fillStyle = 'rgba(255, 220, 170, 0.14)';
  ctx.fillRect(x + 9, y + 26, 1, h - 26);
  ctx.fillRect(x + w - 5, y + 26, 1, h - 26);

  // Warm glow spilling over the counter.
  ctx.fillStyle = radial(ctx, x + w / 2, y + h, 10, 80, [
    [0, 'rgba(255, 180, 110, 0.16)'],
    [1, 'rgba(255, 180, 110, 0)'],
  ]);
  ctx.fillRect(x - 30, y + h - 20, w + 60, 70);
  ctx.restore();
}

function drawSign(ctx, p) {
  ctx.save();
  ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
  roundRect(ctx, p.x + 3, p.y + 4, p.w, p.h, 4);
  ctx.fill();
  ctx.fillStyle = p.c;
  roundRect(ctx, p.x, p.y, p.w, p.h, 4);
  ctx.fill();
  ctx.strokeStyle = p.a;
  ctx.lineWidth = 1.4;
  ctx.stroke();
  ctx.fillStyle = p.a;
  ctx.font = '700 14px "Trebuchet MS", "Segoe UI", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(p.t ?? 'NOODLES', p.x + p.w / 2, p.y + p.h / 2 + 1);
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  // Hanging chains.
  ctx.strokeStyle = 'rgba(180, 150, 110, 0.5)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(p.x + 14, p.y);
  ctx.lineTo(p.x + 14, p.y - 12);
  ctx.moveTo(p.x + p.w - 14, p.y);
  ctx.lineTo(p.x + p.w - 14, p.y - 12);
  ctx.stroke();
  ctx.restore();
}

function drawLights(ctx, p, time) {
  const n = p.n ?? 12;
  const points = [];
  for (let index = 0; index < n; index += 1) {
    const at = n === 1 ? 0.5 : index / (n - 1);
    const x = p.x0 + (p.x1 - p.x0) * at;
    const y = p.y0 + (p.y1 - p.y0) * at + p.sag * 4 * at * (1 - at);
    points.push([x, y]);
  }
  ctx.strokeStyle = 'rgba(12, 10, 24, 0.85)';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(p.x0, p.y0);
  for (let index = 0; index < points.length - 1; index += 1) {
    const [x0, y0] = points[index];
    const [x1, y1] = points[index + 1];
    ctx.quadraticCurveTo((x0 + x1) / 2, (y0 + y1) / 2 + 3, x1, y1);
  }
  ctx.stroke();
  for (let index = 0; index < n; index += 1) {
    const [x, y] = points[index];
    const phase = index * 1.6;
    const twinkle = 0.66 + 0.34 * Math.sin(time * 2.6 + phase);
    ctx.fillStyle = radial(ctx, x, y + 5, 0.5, 13, [
      [0, withAlpha(p.c, 0.5 * twinkle)],
      [1, withAlpha(p.c, 0)],
    ]);
    ctx.fillRect(x - 14, y - 8, 28, 28);
    ctx.strokeStyle = 'rgba(30, 22, 30, 0.8)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x, y + 3);
    ctx.stroke();
    dot(ctx, x, y + 5.5, 2.3, '#fff2cf');
    ctx.fillStyle = withAlpha(p.c, 0.9 * twinkle);
    dot(ctx, x, y + 5.5, 1.6, p.c);
  }
}

function drawBunting(ctx, p) {
  const n = p.n ?? 16;
  ctx.strokeStyle = 'rgba(18, 12, 24, 0.7)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(p.x0, p.y0);
  ctx.quadraticCurveTo((p.x0 + p.x1) / 2, (p.y0 + p.y1) / 2 + 18, p.x1, p.y1);
  ctx.stroke();
  for (let index = 0; index < n; index += 1) {
    const at = (index + 0.5) / n;
    const x = p.x0 + (p.x1 - p.x0) * at;
    const y = p.y0 + (p.y1 - p.y0) * at + 18 * 2 * at * (1 - at) * 1.02;
    ctx.fillStyle = index % 3 === 0 ? '#ffd98a' : index % 3 === 1 ? p.c : '#ff9db5';
    ctx.beginPath();
    ctx.moveTo(x - 5, y);
    ctx.lineTo(x + 5, y);
    ctx.lineTo(x, y + 9 + (index % 2));
    ctx.closePath();
    ctx.fill();
  }
}

function drawLanterns(ctx, p, time) {
  const n = p.n ?? 3;
  ctx.save();
  // Hanging bar.
  ctx.strokeStyle = '#2a1b1c';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(p.x - 34, p.y - 30);
  ctx.lineTo(p.x + 34, p.y - 30);
  ctx.stroke();
  for (let index = 0; index < n; index += 1) {
    const offset = (index - (n - 1) / 2) * 26;
    const swing = Math.sin(time * 1.3 + index * 0.9) * 0.055;
    ctx.save();
    ctx.translate(p.x + offset, p.y - 28);
    ctx.rotate(swing);
    ctx.strokeStyle = 'rgba(40, 28, 26, 0.9)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, 10);
    ctx.stroke();
    // Glow.
    ctx.fillStyle = radial(ctx, 0, 26, 2, 26, [
      [0, withAlpha(p.c, 0.4)],
      [1, withAlpha(p.c, 0)],
    ]);
    ctx.fillRect(-28, 2, 56, 56);
    // Body.
    ctx.fillStyle = p.c;
    ctx.beginPath();
    ctx.ellipse(0, 24, 9.5, 12, 0, 0, TAU);
    ctx.fill();
    ctx.fillStyle = 'rgba(255, 250, 220, 0.4)';
    ctx.beginPath();
    ctx.ellipse(-2.5, 21, 3.5, 8, -0.2, 0, TAU);
    ctx.fill();
    // Ribs.
    ctx.strokeStyle = 'rgba(120, 50, 30, 0.35)';
    ctx.lineWidth = 0.8;
    for (let rib = -1; rib <= 1; rib += 1) {
      ctx.beginPath();
      ctx.ellipse(0, 24, 9.5 - Math.abs(rib) * 2.5, 12, 0, 0, TAU);
      ctx.stroke();
    }
    ctx.fillStyle = '#3a2418';
    ctx.fillRect(-4, 11.5, 8, 3);
    ctx.fillRect(-4, 34, 8, 3);
    ctx.strokeStyle = p.c;
    ctx.beginPath();
    ctx.moveTo(0, 37);
    ctx.lineTo(0, 44);
    ctx.stroke();
    ctx.restore();
  }
  ctx.restore();
}

function drawLanternPost(ctx, p, time) {
  ctx.save();
  ctx.fillStyle = '#1a1420';
  ctx.fillRect(p.x - 2.5, p.y - 96, 5, 96);
  ctx.strokeStyle = '#1a1420';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(p.x, p.y - 94);
  ctx.quadraticCurveTo(p.x, p.y - 108, p.x + 16, p.y - 108);
  ctx.stroke();
  const flicker = 0.85 + 0.15 * Math.sin(time * 6.1) * Math.sin(time * 2.3);
  // Cone of light.
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  const cone = ctx.createLinearGradient(p.x + 18, p.y - 104, p.x + 18, p.y - 10);
  cone.addColorStop(0, withAlpha(p.c, 0.3 * flicker));
  cone.addColorStop(1, withAlpha(p.c, 0));
  ctx.fillStyle = cone;
  ctx.beginPath();
  ctx.moveTo(p.x + 10, p.y - 108);
  ctx.lineTo(p.x + 48, p.y - 8);
  ctx.lineTo(p.x - 24, p.y - 8);
  ctx.lineTo(p.x + 6, p.y - 108);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
  // Lantern housing.
  ctx.fillStyle = '#241a24';
  ctx.beginPath();
  ctx.moveTo(p.x + 8, p.y - 112);
  ctx.lineTo(p.x + 26, p.y - 112);
  ctx.lineTo(p.x + 22, p.y - 94);
  ctx.lineTo(p.x + 12, p.y - 94);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = withAlpha(p.c, 0.9 * flicker);
  ctx.beginPath();
  ctx.moveTo(p.x + 11, p.y - 109);
  ctx.lineTo(p.x + 23, p.y - 109);
  ctx.lineTo(p.x + 20, p.y - 97);
  ctx.lineTo(p.x + 14, p.y - 97);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawFish(ctx, p) {
  ctx.save();
  ctx.strokeStyle = 'rgba(50, 40, 34, 0.8)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(p.x - 18, p.y - 22);
  ctx.lineTo(p.x - 18, p.y - 6);
  ctx.moveTo(p.x + 2, p.y - 22);
  ctx.lineTo(p.x + 2, p.y - 4);
  ctx.stroke();
  for (let index = 0; index < 2; index += 1) {
    ctx.save();
    ctx.translate(p.x - 18 + index * 20, p.y - 4);
    ctx.rotate(-0.12 + index * 0.25);
    ctx.fillStyle = index === 0 ? p.c : 'rgba(190, 170, 140, 0.9)';
    ctx.beginPath();
    ctx.ellipse(0, 10, 5.5, 14, 0, 0, TAU);
    ctx.fill();
    ctx.fillStyle = 'rgba(80, 70, 60, 0.7)';
    dot(ctx, -1.5, 5, 1, '#2d2620');
    ctx.strokeStyle = 'rgba(90, 90, 100, 0.5)';
    ctx.lineWidth = 0.8;
    for (let line = 0; line < 3; line += 1) {
      ctx.beginPath();
      ctx.moveTo(-4, 9 + line * 3);
      ctx.lineTo(4, 9 + line * 3);
      ctx.stroke();
    }
    ctx.restore();
  }
  ctx.restore();
}

function drawUmbrella(ctx, p) {
  const s = p.s ?? 1;
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.rotate(p.rot ?? 0);
  ctx.scale(s, s);
  // Handle.
  ctx.strokeStyle = '#6b4d34';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, 40);
  ctx.lineTo(0, -2);
  ctx.stroke();
  ctx.strokeStyle = '#8b6a48';
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(0, 40);
  ctx.quadraticCurveTo(4, 46, 10, 42);
  ctx.stroke();
  // Canopy, a shallow cone seen from below.
  ctx.fillStyle = p.c;
  ctx.beginPath();
  ctx.moveTo(-34, 0);
  ctx.quadraticCurveTo(0, -28, 34, 0);
  ctx.quadraticCurveTo(0, 10, -34, 0);
  ctx.closePath();
  ctx.fill();
  // Ribs and alternating panels.
  ctx.strokeStyle = withAlpha(p.a, 0.7);
  ctx.lineWidth = 1;
  for (let rib = -3; rib <= 3; rib += 1) {
    ctx.beginPath();
    ctx.moveTo(0, 2);
    ctx.lineTo(rib * 10, -14 + Math.abs(rib) * 1.6);
    ctx.stroke();
  }
  ctx.fillStyle = withAlpha(p.a, 0.45);
  ctx.beginPath();
  ctx.moveTo(-34, 0);
  ctx.quadraticCurveTo(-18, -16, 0, -20);
  ctx.quadraticCurveTo(-16, -10, -18, 5);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = 'rgba(255, 250, 230, 0.5)';
  ctx.beginPath();
  ctx.arc(0, -2, 1.8, 0, TAU);
  ctx.fill();
  ctx.restore();
}

function drawSteam(ctx, p, time) {
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  for (let index = 0; index < 4; index += 1) {
    const age = ((time * 0.32 + index * 0.27) % 1);
    const rise = age * 62;
    const sway = Math.sin(age * 6 + index * 2.1) * (5 + age * 9);
    const alpha = (1 - age) * 0.15;
    ctx.fillStyle = `rgba(255, 236, 210, ${alpha})`;
    ctx.beginPath();
    ctx.ellipse(p.x + sway, p.y - rise, 7 + age * 14, 5 + age * 9, 0.2, 0, TAU);
    ctx.fill();
  }
  ctx.restore();
  // A little pot under the steam.
  ctx.fillStyle = '#3a2a2a';
  ctx.beginPath();
  ctx.ellipse(p.x, p.y + 7, 15, 5, 0, 0, TAU);
  ctx.fill();
  ctx.fillStyle = '#5a4038';
  ctx.beginPath();
  ctx.ellipse(p.x, p.y + 5, 13, 4, 0, 0, TAU);
  ctx.fill();
  ctx.fillStyle = 'rgba(255, 190, 120, 0.4)';
  ctx.beginPath();
  ctx.ellipse(p.x, p.y + 4, 9, 2.4, 0, 0, TAU);
  ctx.fill();
}

function drawBarrel(ctx, p) {
  ctx.save();
  ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
  ctx.beginPath();
  ctx.ellipse(p.x + 3, p.y + 3, 16, 6, 0, 0, TAU);
  ctx.fill();
  ctx.fillStyle = p.c;
  ctx.beginPath();
  ctx.moveTo(p.x - 15, p.y - 26);
  ctx.quadraticCurveTo(p.x - 19, p.y - 10, p.x - 15, p.y);
  ctx.lineTo(p.x + 15, p.y);
  ctx.quadraticCurveTo(p.x + 19, p.y - 10, p.x + 15, p.y - 26);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = p.a;
  ctx.beginPath();
  ctx.ellipse(p.x, p.y - 26, 15, 5, 0, 0, TAU);
  ctx.fill();
  ctx.fillStyle = 'rgba(60, 34, 20, 0.5)';
  ctx.beginPath();
  ctx.ellipse(p.x, p.y - 26, 10, 3, 0, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = '#3c3a42';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(p.x - 17, p.y - 18);
  ctx.quadraticCurveTo(p.x, p.y - 14, p.x + 17, p.y - 18);
  ctx.moveTo(p.x - 16, p.y - 7);
  ctx.quadraticCurveTo(p.x, p.y - 3, p.x + 16, p.y - 7);
  ctx.stroke();
  ctx.strokeStyle = 'rgba(255, 220, 160, 0.18)';
  ctx.lineWidth = 1;
  for (let stave = -2; stave <= 2; stave += 1) {
    ctx.beginPath();
    ctx.moveTo(p.x + stave * 5, p.y - 25);
    ctx.lineTo(p.x + stave * 5.6, p.y - 1);
    ctx.stroke();
  }
  ctx.restore();
}

function drawCrate(ctx, p) {
  const { x, y, w, h } = p;
  ctx.save();
  ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
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
  ctx.restore();
}

function drawPlant(ctx, p) {
  ctx.save();
  // Pot.
  ctx.fillStyle = '#8c5338';
  ctx.beginPath();
  ctx.moveTo(p.x - 12, p.y);
  ctx.lineTo(p.x + 12, p.y);
  ctx.lineTo(p.x + 9, p.y + 18);
  ctx.lineTo(p.x - 9, p.y + 18);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#a36643';
  ctx.fillRect(p.x - 13, p.y - 2, 26, 4);
  // Leaves.
  for (let leaf = 0; leaf < 7; leaf += 1) {
    const angle = -Math.PI / 2 + (leaf - 3) * 0.38;
    const length = 18 + hash01(leaf * 2.1) * 14;
    ctx.strokeStyle = leaf % 2 === 0 ? p.c : '#3f9a72';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(p.x, p.y - 2);
    ctx.quadraticCurveTo(
      p.x + Math.cos(angle) * length * 0.5,
      p.y - 12 + Math.sin(angle) * length * 0.5,
      p.x + Math.cos(angle) * length,
      p.y - 6 + Math.sin(angle) * length,
    );
    ctx.stroke();
  }
  dot(ctx, p.x + 6, p.y - 20, 2.6, p.a);
  ctx.restore();
}

function drawCat(ctx, p) {
  const s = p.s ?? 1;
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.scale(s, s);
  ctx.strokeStyle = p.c;
  ctx.fillStyle = p.c;
  ctx.lineWidth = 4.5;
  ctx.lineCap = 'round';
  // Tail.
  ctx.beginPath();
  ctx.moveTo(9, -3);
  ctx.quadraticCurveTo(26, -2, 22, -18);
  ctx.quadraticCurveTo(20, -27, 27, -29);
  ctx.stroke();
  // Body and head.
  ellipse(ctx, 0, -7, 11, 14);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(-2, -24, 8, 0, TAU);
  ctx.fill();
  // Ears.
  ctx.beginPath();
  ctx.moveTo(-9, -28);
  ctx.lineTo(-7, -38);
  ctx.lineTo(-2, -31);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(4, -31);
  ctx.lineTo(8, -37);
  ctx.lineTo(8, -26);
  ctx.closePath();
  ctx.fill();
  // Eyes catch the lanterns.
  dot(ctx, -5, -25, 1.4, '#ffd873');
  dot(ctx, 2, -25, 1.4, '#ffd873');
  ctx.restore();
}

function drawStool(ctx, p) {
  ctx.save();
  ctx.strokeStyle = p.c;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(p.x - 12, p.y + 18);
  ctx.lineTo(p.x - 6, p.y);
  ctx.moveTo(p.x + 12, p.y + 18);
  ctx.lineTo(p.x + 6, p.y);
  ctx.stroke();
  ctx.fillStyle = '#7a5036';
  ctx.beginPath();
  ctx.ellipse(p.x, p.y, 15, 4.5, 0, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255, 220, 170, 0.3)';
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.restore();
}

function drawBicycle(ctx, p) {
  ctx.save();
  ctx.translate(p.x, p.y);
  // Wheels.
  ctx.strokeStyle = p.c;
  ctx.lineWidth = 2.4;
  for (const wx of [-24, 24]) {
    ctx.beginPath();
    ctx.arc(wx, 0, 15, 0, TAU);
    ctx.stroke();
    ctx.strokeStyle = 'rgba(190, 205, 220, 0.5)';
    ctx.lineWidth = 0.8;
    for (let spoke = 0; spoke < 6; spoke += 1) {
      const angle = (spoke / 6) * TAU;
      ctx.beginPath();
      ctx.moveTo(wx, 0);
      ctx.lineTo(wx + Math.cos(angle) * 14, Math.sin(angle) * 14);
      ctx.stroke();
    }
    ctx.strokeStyle = p.c;
    ctx.lineWidth = 2.4;
  }
  // Frame.
  ctx.strokeStyle = p.a;
  ctx.lineWidth = 2.6;
  ctx.beginPath();
  ctx.moveTo(-24, 0);
  ctx.lineTo(-4, -18);
  ctx.lineTo(10, 0);
  ctx.closePath();
  ctx.moveTo(-4, -18);
  ctx.lineTo(24, 0);
  ctx.moveTo(10, 0);
  ctx.lineTo(14, -22);
  ctx.lineTo(22, -24);
  ctx.stroke();
  // Seat and basket.
  ctx.fillStyle = '#2a2a34';
  ctx.fillRect(-8, -22, 9, 3);
  ctx.strokeStyle = p.a;
  ctx.lineWidth = 1.6;
  ctx.strokeRect(26, -20, 11, 9);
  // Flowers in the basket.
  dot(ctx, 29, -22, 2, '#ff9db5');
  dot(ctx, 34, -23, 2, '#ffd98a');
  dot(ctx, 31, -25, 1.6, '#a7ffd8');
  ctx.restore();
}

function drawSacks(ctx, p) {
  ctx.save();
  ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
  ctx.beginPath();
  ctx.ellipse(p.x + 20, p.y + 4, 38, 7, 0, 0, TAU);
  ctx.fill();
  for (let index = 0; index < 2; index += 1) {
    const x = p.x + index * 25;
    const lean = index === 0 ? -0.12 : 0.1;
    ctx.save();
    ctx.translate(x, p.y);
    ctx.rotate(lean);
    // Sack body, cinched at the neck.
    ctx.fillStyle = index === 0 ? p.c : '#a88255';
    ctx.beginPath();
    ctx.moveTo(-16, 0);
    ctx.bezierCurveTo(-22, -14, -17, -30, -7, -34);
    ctx.lineTo(7, -34);
    ctx.bezierCurveTo(18, -29, 22, -12, 16, 0);
    ctx.closePath();
    ctx.fill();
    // Neck tie and spilling grain.
    ctx.fillStyle = p.a;
    ctx.beginPath();
    ctx.ellipse(0, -34, 9, 3.4, 0, 0, TAU);
    ctx.fill();
    ctx.strokeStyle = 'rgba(70, 48, 28, 0.65)';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(-8, -30);
    ctx.quadraticCurveTo(0, -27, 8, -30);
    ctx.stroke();
    // Fold lines and patch.
    ctx.strokeStyle = 'rgba(80, 56, 34, 0.3)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-12, -20);
    ctx.quadraticCurveTo(-2, -14, 10, -20);
    ctx.moveTo(-10, -10);
    ctx.quadraticCurveTo(0, -5, 11, -11);
    ctx.stroke();
    ctx.fillStyle = 'rgba(225, 195, 150, 0.28)';
    ctx.fillRect(-6, -20, 7, 6);
    ctx.restore();
  }
  ctx.restore();
}

function drawBucket(ctx, p) {
  ctx.save();
  ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
  ctx.beginPath();
  ctx.ellipse(p.x + 2, p.y + 3, 15, 4.5, 0, 0, TAU);
  ctx.fill();
  // Handle.
  ctx.strokeStyle = p.a;
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.arc(p.x, p.y - 18, 12, Math.PI * 1.04, Math.PI * 1.96);
  ctx.stroke();
  // Bucket body.
  ctx.fillStyle = p.c;
  ctx.beginPath();
  ctx.moveTo(p.x - 13, p.y - 20);
  ctx.lineTo(p.x + 13, p.y - 20);
  ctx.lineTo(p.x + 10, p.y);
  ctx.lineTo(p.x - 10, p.y);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = 'rgba(255, 220, 170, 0.14)';
  ctx.fillRect(p.x - 8, p.y - 18, 2.4, 16);
  ctx.strokeStyle = '#3c3a42';
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(p.x - 12.4, p.y - 14);
  ctx.lineTo(p.x + 12.4, p.y - 14);
  ctx.moveTo(p.x - 11, p.y - 6);
  ctx.lineTo(p.x + 11, p.y - 6);
  ctx.stroke();
  // Dark water inside.
  ctx.fillStyle = 'rgba(20, 30, 46, 0.9)';
  ctx.beginPath();
  ctx.ellipse(p.x, p.y - 20, 13, 4, 0, 0, TAU);
  ctx.fill();
  ctx.fillStyle = 'rgba(150, 200, 255, 0.25)';
  ctx.beginPath();
  ctx.ellipse(p.x - 3, p.y - 21, 5, 1.4, 0, 0, TAU);
  ctx.fill();
  ctx.restore();
}

function drawBasket(ctx, p) {
  ctx.save();
  ctx.fillStyle = 'rgba(0, 0, 0, 0.32)';
  ctx.beginPath();
  ctx.ellipse(p.x + 2, p.y + 3, 24, 6, 0, 0, TAU);
  ctx.fill();
  // Fruit glow.
  ctx.fillStyle = radial(ctx, p.x, p.y - 22, 2, 40, [
    [0, withAlpha(p.a, 0.18)],
    [1, withAlpha(p.a, 0)],
  ]);
  ctx.fillRect(p.x - 42, p.y - 62, 84, 66);
  // Basket body, woven.
  ctx.fillStyle = p.c;
  ctx.beginPath();
  ctx.moveTo(p.x - 22, p.y - 20);
  ctx.lineTo(p.x + 22, p.y - 20);
  ctx.quadraticCurveTo(p.x + 17, p.y + 2, p.x + 12, p.y + 2);
  ctx.lineTo(p.x - 12, p.y + 2);
  ctx.quadraticCurveTo(p.x - 17, p.y + 2, p.x - 22, p.y - 20);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = 'rgba(60, 38, 20, 0.45)';
  ctx.lineWidth = 1;
  for (let weave = -2; weave <= 2; weave += 1) {
    ctx.beginPath();
    ctx.moveTo(p.x + weave * 8, p.y - 19);
    ctx.lineTo(p.x + weave * 5, p.y + 1);
    ctx.stroke();
  }
  ctx.beginPath();
  ctx.ellipse(p.x, p.y - 20, 22, 6, 0, 0, TAU);
  ctx.stroke();
  // Fruit.
  for (let fruit = 0; fruit < 6; fruit += 1) {
    const fx = p.x - 13 + fruit * 5.4 + (fruit % 2) * 2;
    const fy = p.y - 24 - (fruit % 3) * 3;
    dot(ctx, fx, fy, 3.6, fruit % 2 === 0 ? '#ff9f4a' : '#ffd166');
    dot(ctx, fx - 1, fy - 1, 1, 'rgba(255, 240, 200, 0.65)');
  }
  // Handle.
  ctx.strokeStyle = '#a9784a';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(p.x, p.y - 20, 19, Math.PI, TAU);
  ctx.stroke();
  ctx.restore();
}

function drawPatron(ctx, p, time) {
  const s = p.s ?? 1;
  const sway = Math.sin(time * 0.8) * 0.6;
  ctx.save();
  ctx.translate(p.x + sway, p.y);
  ctx.scale(s, s);
  // Shadow.
  ctx.fillStyle = 'rgba(0, 0, 0, 0.32)';
  ctx.beginPath();
  ctx.ellipse(0, 2, 15, 4, 0, 0, TAU);
  ctx.fill();
  // Cloak.
  ctx.fillStyle = p.c;
  ctx.beginPath();
  ctx.moveTo(-14, 0);
  ctx.quadraticCurveTo(-13, -30, -8, -46);
  ctx.quadraticCurveTo(0, -53, 8, -46);
  ctx.quadraticCurveTo(13, -28, 14, 0);
  ctx.closePath();
  ctx.fill();
  // Warm rim light from the stalls.
  ctx.strokeStyle = withAlpha(p.a, 0.4);
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(8, -44);
  ctx.quadraticCurveTo(12, -24, 13, 0);
  ctx.moveTo(-8, -44);
  ctx.quadraticCurveTo(-11, -26, -12, 0);
  ctx.stroke();
  // Head and conical hat.
  ctx.fillStyle = p.c;
  ctx.beginPath();
  ctx.arc(0, -52, 7, 0, TAU);
  ctx.fill();
  ctx.fillStyle = '#241d24';
  ctx.beginPath();
  ctx.moveTo(-15, -57);
  ctx.quadraticCurveTo(0, -70, 15, -57);
  ctx.quadraticCurveTo(0, -61, -15, -57);
  ctx.closePath();
  ctx.fill();
  // Arm and a little paper lantern.
  ctx.strokeStyle = p.c;
  ctx.lineWidth = 3.4;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(7, -34);
  ctx.quadraticCurveTo(13, -28, 17, -24);
  ctx.stroke();
  ctx.strokeStyle = 'rgba(60, 44, 34, 0.8)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(18, -24);
  ctx.lineTo(18, -19);
  ctx.stroke();
  ctx.fillStyle = radial(ctx, 18, -14, 1, 15, [
    [0, withAlpha(p.a, 0.5)],
    [1, withAlpha(p.a, 0)],
  ]);
  ctx.fillRect(2, -30, 32, 32);
  ctx.fillStyle = p.a;
  ctx.beginPath();
  ctx.ellipse(18, -14, 3.6, 4.6, 0, 0, TAU);
  ctx.fill();
  ctx.fillStyle = 'rgba(255, 250, 225, 0.6)';
  ctx.beginPath();
  ctx.ellipse(17, -15, 1.2, 2.2, -0.2, 0, TAU);
  ctx.fill();
  ctx.restore();
}
