// Level two: "Coral Cove". A bright reef scene with layered water, swaying kelp, curious fish
// and a little yellow submarine. Every shape is drawn here with canvas paths and gradients.

import { TAU, dot, ellipse, gradient, hash01, radial, starPath } from '../draw.js';

const W = 560;
const H = 440;
const FLOOR = 372;

function makeMotes(random) {
  const motes = [];
  for (let index = 0; index < 38; index += 1) {
    motes.push({
      x: random() * W,
      y: 30 + random() * 320,
      r: 0.6 + random() * 1.8,
      a: 0.1 + random() * 0.28,
    });
  }
  return motes;
}

export function buildReef(random) {
  const motes = makeMotes(random);
  const props = [];

  const backdrop = (ctx) => {
    ctx.fillStyle = gradient(ctx, 0, 0, 0, H, [
      [0, '#43c4cc'],
      [0.32, '#1593b0'],
      [0.68, '#0a5c7d'],
      [1, '#06344f'],
    ]);
    ctx.fillRect(0, 0, W, H);

    // Sunbeams falling through the surface.
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (let index = 0; index < 4; index += 1) {
      const x = 60 + index * 128;
      const width = 34 + index * 12;
      const beam = ctx.createLinearGradient(x, 0, x + 60, FLOOR + 40);
      beam.addColorStop(0, 'rgba(180, 255, 235, 0.2)');
      beam.addColorStop(0.7, 'rgba(180, 255, 235, 0.045)');
      beam.addColorStop(1, 'rgba(180, 255, 235, 0)');
      ctx.fillStyle = beam;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x + width, 0);
      ctx.lineTo(x + 120 + width, FLOOR + 40);
      ctx.lineTo(x + 74, FLOOR + 40);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();

    // Surface shimmer near the top.
    for (let line = 0; line < 5; line += 1) {
      ctx.strokeStyle = `rgba(210, 255, 245, ${0.1 - line * 0.015})`;
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      for (let x = 0; x <= W; x += 14) {
        const y = 17 + line * 8 + Math.sin(x * 0.06 + line) * 3;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }

    // Suspended particles.
    for (const mote of motes) {
      ctx.globalAlpha = mote.a;
      dot(ctx, mote.x, mote.y, mote.r, '#d9fff7');
    }
    ctx.globalAlpha = 1;

    // Seabed: two dunes so the floor is not a straight line.
    ctx.fillStyle = gradient(ctx, 0, FLOOR - 26, 0, H, [
      [0, '#e3cb98'],
      [0.55, '#c8a974'],
      [1, '#a8885b'],
    ]);
    ctx.beginPath();
    ctx.moveTo(0, FLOOR + 12);
    ctx.quadraticCurveTo(76, FLOOR - 24, 168, FLOOR + 2);
    ctx.quadraticCurveTo(258, FLOOR - 26, 348, FLOOR + 3);
    ctx.quadraticCurveTo(440, FLOOR - 20, 560, FLOOR + 6);
    ctx.lineTo(W, H);
    ctx.lineTo(0, H);
    ctx.closePath();
    ctx.fill();

    // Sand ripples and speckles.
    for (let index = 0; index < 16; index += 1) {
      const x = 14 + index * 34;
      const y = FLOOR + 16 + hash01(index * 2.3) * 48;
      ctx.strokeStyle = `rgba(120, 92, 56, ${0.1 + hash01(index) * 0.1})`;
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.quadraticCurveTo(x + 16, y - 4, x + 34, y);
      ctx.stroke();
    }
    for (let index = 0; index < 40; index += 1) {
      dot(
        ctx,
        8 + hash01(index * 1.7) * (W - 16),
        FLOOR + 10 + hash01(index * 3.9) * 55,
        0.8 + hash01(index * 5.1) * 1.2,
        'rgba(245, 232, 200, 0.4)',
      );
    }

    // Distant reef rocks, soft in the water haze.
    ctx.fillStyle = 'rgba(20, 70, 92, 0.5)';
    ctx.beginPath();
    ctx.moveTo(430, FLOOR + 4);
    ctx.quadraticCurveTo(452, FLOOR - 54, 492, FLOOR - 24);
    ctx.quadraticCurveTo(520, FLOOR - 48, 552, FLOOR - 6);
    ctx.lineTo(560, FLOOR + 8);
    ctx.closePath();
    ctx.fill();
  };

  // --- Props ---------------------------------------------------------------------------------
  props.push({ id: 'rock', type: 'rock', x: 62, y: 396, z: 3, s: 1, c: '#33566b' });
  props.push({ id: 'kelp1', type: 'kelp', x: 24, y: 424, z: 2.6, h: 156, s: 1, c: '#2f8f68' });
  props.push({ id: 'kelp2', type: 'kelp', x: 96, y: 420, z: 2.4, h: 112, s: 1, c: '#49a978' });
  props.push({ id: 'kelp3', type: 'kelp', x: 520, y: 428, z: 2.4, h: 128, s: 0.9, c: '#3d9d72' });
  props.push({ id: 'coralfan', type: 'coralfan', x: 172, y: 352, z: 3.4, s: 1, c: '#ff7fa8' });
  props.push({ id: 'anemone', type: 'anemone', x: 252, y: 390, z: 3.2, s: 1, c: '#c38cff' });
  props.push({ id: 'tube', type: 'tube', x: 492, y: 370, z: 3.3, s: 1, c: '#ff9b5e' });
  props.push({ id: 'starfish', type: 'starfish', x: 198, y: 418, z: 4, s: 1, c: '#ff7a5c' });
  props.push({ id: 'shell', type: 'shell', x: 94, y: 420, z: 4, s: 1, c: '#ffd9c9' });
  props.push({ id: 'urchin', type: 'urchin', x: 430, y: 422, z: 4, s: 1, c: '#3c2c55' });
  props.push({ id: 'anchor', type: 'anchor', x: 512, y: 322, z: 3.8, s: 1, c: '#7f8a96' });
  props.push({ id: 'chest', type: 'chest', x: 330, y: 380, z: 3.9, s: 1, open: false, c: '#8a5a33', a: '#ffd166' });

  props.push({ id: 'seahorse', type: 'seahorse', x: 362, y: 278, z: 4, s: 1, c: '#ffc46b' });
  props.push({ id: 'puffer', type: 'puffer', x: 418, y: 226, z: 4, s: 1, c: '#f2c94c' });
  props.push({ id: 'jelly', type: 'jelly', x: 118, y: 134, z: 4, s: 1, c: '#b78cff' });
  props.push({ id: 'turtle', type: 'turtle', x: 435, y: 124, z: 3.8, s: 1, c: '#63b98b' });
  props.push({ id: 'sub', type: 'sub', x: 486, y: 76, z: 4, s: 1, c: '#ffcc55' });

  // Fish.
  props.push({ id: 'fish1', type: 'fish', x: 206, y: 148, z: 3.6, s: 1, c: '#ffd166', a: '#ff9f43', dir: 1 });
  props.push({ id: 'fish2', type: 'fish', x: 256, y: 180, z: 3.6, s: 0.8, c: '#8fe3ff', a: '#5bc4ef', dir: 1 });
  props.push({ id: 'fish3', type: 'fish', x: 170, y: 196, z: 3.6, s: 0.72, c: '#c8a2ff', a: '#9a7af0', dir: 1 });
  props.push({ id: 'fish4', type: 'fish', x: 300, y: 122, z: 3.6, s: 0.62, c: '#7de2a8', a: '#4ec288', dir: -1 });
  props.push({ id: 'fish5', type: 'fish', x: 336, y: 206, z: 3.6, s: 0.9, c: '#ff9db5', a: '#ef7194', dir: -1 });
  props.push({ id: 'fish6', type: 'fish', x: 148, y: 88, z: 3.6, s: 0.66, c: '#ffb86b', a: '#f08b4f', dir: 1, side: 'right' });
  props.push({ id: 'ray', type: 'ray', x: 300, y: 62, z: 3.5, s: 1, c: '#2d5f77', side: 'right' });

  // Clownfish pair near the anemone.
  props.push({ id: 'clown1', type: 'clown', x: 248, y: 334, z: 4.4, s: 1, c: '#ff8b45', a: '#fff4e2', dir: 1 });
  props.push({ id: 'clown2', type: 'clown', x: 214, y: 306, z: 4.4, s: 0.72, c: '#ff8b45', a: '#fff4e2', dir: -1 });

  props.push({ id: 'bubbles1', type: 'bubbles', x: 306, y: 332, z: 5, s: 1, c: '#c9f6ff' });
  props.push({ id: 'bubbles2', type: 'bubbles', x: 66, y: 300, z: 5, s: 0.8, c: '#c9f6ff', side: 'right' });

  const centres = {
    kelp1: [48, 330],
    coralfan: [172, 340],
    anemone: [252, 376],
    tube: [492, 352],
    starfish: [198, 418],
    shell: [94, 420],
    urchin: [430, 422],
    anchor: [512, 316],
    chest: [330, 370],
    seahorse: [362, 280],
    puffer: [418, 226],
    jelly: [118, 136],
    turtle: [435, 126],
    sub: [486, 76],
    fish1: [206, 148],
    fish2: [256, 180],
    fish3: [170, 196],
    fish4: [300, 122],
    fish5: [336, 206],
    fish6: [148, 88],
    ray: [300, 62],
    clown1: [248, 334],
    clown2: [214, 306],
    bubbles1: [306, 318],
    bubbles2: [66, 300],
  };
  for (const prop of props) {
    const centre = centres[prop.id];
    prop.cx = centre ? centre[0] : (prop.x ?? 0) + 20;
    prop.cy = centre ? centre[1] : prop.y ?? 0;
  }

  const pool = [
    { prop: 'jelly', op: 'color', value: '#ffb0e0', tier: 1, r: 1.2 },
    { prop: 'jelly', op: 'scale', value: 1.24, tier: 2, r: 1.2 },
    { prop: 'puffer', op: 'color', value: '#ff8f4a', tier: 1, r: 1.1 },
    { prop: 'puffer', op: 'shift', value: { dx: -15, dy: 9 }, tier: 3, r: 1.25 },
    { prop: 'fish6', op: 'show', tier: 1, r: 1.1 },
    { prop: 'fish2', op: 'color', value: '#ffe08a', tier: 2, r: 1.1 },
    { prop: 'turtle', op: 'hide', tier: 1, r: 1.2 },
    { prop: 'chest', op: 'open', tier: 2, r: 1.1 },
    { prop: 'anchor', op: 'hide', tier: 1, r: 1.2 },
    { prop: 'starfish', op: 'color', value: '#ffd166', tier: 2, r: 1 },
    { prop: 'coralfan', op: 'scale', value: 1.26, tier: 2, r: 1.1 },
    { prop: 'seahorse', op: 'shift', value: { dx: -16, dy: 10 }, tier: 2, r: 1.2 },
    { prop: 'sub', op: 'hide', tier: 1, r: 1.2 },
    { prop: 'bubbles2', op: 'show', tier: 1, r: 1.1 },
    { prop: 'clown1', op: 'color', value: '#7de2ff', tier: 2, r: 1.1 },
    { prop: 'kelp1', op: 'scale', value: 1.28, tier: 2, r: 1.1 },
    { prop: 'shell', op: 'color', value: '#b7f0ff', tier: 3, r: 1 },
    { prop: 'urchin', op: 'shift', value: { dx: 14, dy: -6 }, tier: 3, r: 1.1 },
    { prop: 'tube', op: 'hide', tier: 1, r: 1.2 },
    { prop: 'ray', op: 'show', tier: 1, r: 1.3 },
  ];

  // Bubbles drift up through the reef, the same on both copies.
  const ambient = (ctx, time) => {
    for (let index = 0; index < 18; index += 1) {
      const speed = 9 + hash01(index * 3.7) * 20;
      const x = 18 + hash01(index * 5.1) * (W - 36) + Math.sin(time * 0.8 + index) * 5;
      const y = H - ((time * speed + hash01(index * 7.3) * 420) % 430);
      if (y < 24) continue;
      const r = 1 + hash01(index * 2.9) * 2.2;
      ctx.strokeStyle = 'rgba(220, 255, 250, 0.42)';
      ctx.lineWidth = 0.9;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, TAU);
      ctx.stroke();
      dot(ctx, x - r * 0.35, y - r * 0.35, r * 0.28, 'rgba(255, 255, 255, 0.7)');
    }
  };

  return {
    key: 'reef',
    name: 'Coral Cove',
    tint: '#54e7d2',
    props,
    pool,
    backdrop,
    ambient,
    drawProp: drawReefProp,
  };
}

function drawReefProp(ctx, p) {
  switch (p.type) {
    case 'rock': return drawRock(ctx, p);
    case 'kelp': return drawKelp(ctx, p);
    case 'coralfan': return drawCoralFan(ctx, p);
    case 'anemone': return drawAnemone(ctx, p);
    case 'tube': return drawTubeCoral(ctx, p);
    case 'starfish': return drawStarfish(ctx, p);
    case 'shell': return drawShell(ctx, p);
    case 'urchin': return drawUrchin(ctx, p);
    case 'anchor': return drawAnchor(ctx, p);
    case 'chest': return drawChest(ctx, p);
    case 'seahorse': return drawSeahorse(ctx, p);
    case 'puffer': return drawPuffer(ctx, p);
    case 'jelly': return drawJelly(ctx, p);
    case 'turtle': return drawTurtle(ctx, p);
    case 'sub': return drawSub(ctx, p);
    case 'fish': return drawFish(ctx, p);
    case 'clown': return drawClown(ctx, p);
    case 'ray': return drawRay(ctx, p);
    case 'bubbles': return drawBubbles(ctx, p);
    default: return undefined;
  }
}

function drawRock(ctx, p) {
  ctx.save();
  ctx.translate(p.x, p.y);
  const s = p.s ?? 1;
  ctx.scale(s, s);
  ctx.fillStyle = 'rgba(6, 30, 44, 0.35)';
  ellipse(ctx, 4, 20, 46, 14);
  ctx.fill();
  ctx.fillStyle = p.c;
  ctx.beginPath();
  ctx.moveTo(-48, 30);
  ctx.quadraticCurveTo(-50, -8, -24, -20);
  ctx.quadraticCurveTo(-6, -34, 16, -18);
  ctx.quadraticCurveTo(42, -14, 46, 14);
  ctx.quadraticCurveTo(48, 32, 26, 36);
  ctx.lineTo(-36, 36);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = 'rgba(140, 190, 200, 0.18)';
  ctx.beginPath();
  ctx.moveTo(-26, -17);
  ctx.quadraticCurveTo(-8, -30, 12, -16);
  ctx.quadraticCurveTo(-4, -12, -26, -17);
  ctx.fill();
  // Algae patch.
  ctx.fillStyle = 'rgba(74, 156, 108, 0.5)';
  ctx.beginPath();
  ctx.arc(-18, 22, 7, 0, TAU);
  ctx.arc(-8, 25, 5, 0, TAU);
  ctx.arc(30, 24, 6, 0, TAU);
  ctx.fill();
  ctx.restore();
}

function drawKelp(ctx, p) {
  const height = p.h;
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.scale(p.s ?? 1, p.s ?? 1);
  const strands = 3;
  for (let strand = 0; strand < strands; strand += 1) {
    const offset = (strand - 1) * 7;
    const lean = (strand % 2 === 0 ? 1 : -1) * 9;
    ctx.strokeStyle = strand === 1 ? p.c : withShade(p.c, strand === 0 ? -18 : 22);
    ctx.lineWidth = 5 - strand;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(offset, 0);
    ctx.bezierCurveTo(
      offset + lean * 2, -height * 0.3,
      offset + lean * 3, -height * 0.62,
      offset + lean * 1.6, -height,
    );
    ctx.stroke();
    // Leaves.
    ctx.fillStyle = withShade(p.c, strand % 2 === 0 ? 10 : -8);
    for (let leaf = 1; leaf <= 4; leaf += 1) {
      const t = leaf / 5;
      const lx = offset + Math.sin(t * 2.4) * 8 * lean * 0.4 + lean * t;
      const ly = -height * t;
      const side = leaf % 2 === 0 ? 1 : -1;
      ellipse(ctx, lx + side * 6, ly, 8, 2.8, side * 0.5);
      ctx.fill();
    }
  }
  ctx.restore();
}

function withShade(hex, amount) {
  const value = hex.replace('#', '');
  const r = Math.max(0, Math.min(255, parseInt(value.slice(0, 2), 16) + amount));
  const g = Math.max(0, Math.min(255, parseInt(value.slice(2, 4), 16) + amount));
  const b = Math.max(0, Math.min(255, parseInt(value.slice(4, 6), 16) + amount));
  return `rgb(${r}, ${g}, ${b})`;
}

function drawCoralFan(ctx, p) {
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.scale(p.s ?? 1, p.s ?? 1);
  ctx.strokeStyle = p.c;
  ctx.lineCap = 'round';
  const branches = [
    [-0.55, 1.0, 0.95], [-0.3, 0.8, 1.15], [-0.08, 1.0, 1.32],
    [0.18, 0.9, 1.2], [0.42, 1.0, 1.0], [0.62, 0.8, 0.78],
  ];
  for (let index = 0; index < branches.length; index += 1) {
    const [lean, reach, tall] = branches[index];
    ctx.lineWidth = 5.5 - index * 0.3;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(lean * 26, -42 * tall, lean * 52, -62 * reach);
    ctx.stroke();
    ctx.lineWidth = 2.4;
    for (let twig = 1; twig <= 2; twig += 1) {
      const t = twig * 0.32 + 0.28;
      const bx = lean * 52 * t;
      const by = -62 * reach * t;
      ctx.beginPath();
      ctx.moveTo(bx, by);
      ctx.lineTo(bx + (twig === 1 ? -14 : 14) * lean * 0.8 + 8, by - 12);
      ctx.stroke();
    }
    dot(ctx, lean * 52, -62 * reach, 3.4, '#ffd0e0');
  }
  // Base.
  ctx.fillStyle = withShade(p.c, -40);
  ellipse(ctx, 0, 2, 20, 7);
  ctx.fill();
  ctx.restore();
}

function drawAnemone(ctx, p) {
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.scale(p.s ?? 1, p.s ?? 1);
  ctx.fillStyle = withShade(p.c, -60);
  ellipse(ctx, 0, 4, 24, 9);
  ctx.fill();
  for (let index = 0; index < 17; index += 1) {
    const spread = (index / 16 - 0.5) * 1.9;
    const sway = Math.sin(index * 1.7) * 5;
    ctx.strokeStyle = index % 3 === 0 ? withShade(p.c, 28) : p.c;
    ctx.lineWidth = 2.6;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(spread * 18, 0);
    ctx.quadraticCurveTo(spread * 26 + sway, -18, spread * 30 + sway, -32 - (index % 4) * 3);
    ctx.stroke();
    dot(ctx, spread * 30 + sway, -33 - (index % 4) * 3, 2, '#f0d4ff');
  }
  ctx.restore();
}

function drawTubeCoral(ctx, p) {
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.scale(p.s ?? 1, p.s ?? 1);
  const tubes = [
    [-16, 34, 8], [-2, 48, 9], [12, 39, 8], [24, 28, 7],
  ];
  for (const [x, h, w] of tubes) {
    ctx.fillStyle = p.c;
    ctx.beginPath();
    ctx.moveTo(x - w, 6);
    ctx.quadraticCurveTo(x - w, -h, x, -h);
    ctx.quadraticCurveTo(x + w, -h, x + w, 6);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = withShade(p.c, -55);
    ellipse(ctx, x, -h + 2, w * 0.62, w * 0.32);
    ctx.fill();
    ctx.fillStyle = 'rgba(255, 240, 200, 0.28)';
    ellipse(ctx, x + 2, -h + 2, w * 0.3, w * 0.16);
    ctx.fill();
  }
  ctx.restore();
}

function drawStarfish(ctx, p) {
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.scale(p.s ?? 1, p.s ?? 1);
  ctx.rotate(-0.25);
  ctx.fillStyle = 'rgba(90, 70, 40, 0.25)';
  starPath(ctx, 2, 3, 19, 8, 5);
  ctx.fill();
  ctx.fillStyle = p.c;
  starPath(ctx, 0, 0, 19, 7.5, 5);
  ctx.fill();
  ctx.fillStyle = 'rgba(255, 240, 210, 0.5)';
  for (let index = 0; index < 5; index += 1) {
    const angle = -Math.PI / 2 + (index * TAU) / 5;
    dot(ctx, Math.cos(angle) * 10, Math.sin(angle) * 10, 1.5, 'rgba(255, 245, 220, 0.8)');
  }
  ctx.restore();
}

function drawShell(ctx, p) {
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.scale(p.s ?? 1, p.s ?? 1);
  ctx.fillStyle = p.c;
  ctx.beginPath();
  ctx.moveTo(0, 2);
  ctx.quadraticCurveTo(-20, -4, -15, -15);
  ctx.quadraticCurveTo(0, -24, 15, -15);
  ctx.quadraticCurveTo(20, -4, 0, 2);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = 'rgba(170, 110, 100, 0.5)';
  ctx.lineWidth = 1.2;
  for (let index = -2; index <= 2; index += 1) {
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(index * 6, -12, index * 9, -18);
    ctx.stroke();
  }
  ctx.restore();
}

function drawUrchin(ctx, p) {
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.scale(p.s ?? 1, p.s ?? 1);
  ctx.strokeStyle = p.c;
  ctx.lineWidth = 1.6;
  for (let index = 0; index < 18; index += 1) {
    const angle = (index / 18) * TAU;
    ctx.beginPath();
    ctx.moveTo(Math.cos(angle) * 8, Math.sin(angle) * 8);
    ctx.lineTo(Math.cos(angle) * 16, Math.sin(angle) * 16);
    ctx.stroke();
  }
  ctx.fillStyle = withShade(p.c, 30);
  ctx.beginPath();
  ctx.arc(0, 0, 9, 0, TAU);
  ctx.fill();
  ctx.fillStyle = 'rgba(200, 160, 255, 0.35)';
  dot(ctx, -2, -3, 3, 'rgba(200, 160, 255, 0.35)');
  ctx.restore();
}

function drawAnchor(ctx, p) {
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.scale(p.s ?? 1, p.s ?? 1);
  ctx.rotate(0.12);
  ctx.strokeStyle = p.c;
  ctx.lineWidth = 5;
  ctx.lineCap = 'round';
  // Shank and ring.
  ctx.beginPath();
  ctx.moveTo(0, -22);
  ctx.lineTo(0, 24);
  ctx.stroke();
  ctx.lineWidth = 3.4;
  ctx.beginPath();
  ctx.arc(0, -27, 6, 0, TAU);
  ctx.stroke();
  // Arms.
  ctx.beginPath();
  ctx.moveTo(-22, 8);
  ctx.quadraticCurveTo(-20, 28, 0, 30);
  ctx.quadraticCurveTo(20, 28, 22, 8);
  ctx.stroke();
  // Flukes.
  ctx.fillStyle = p.c;
  ctx.beginPath();
  ctx.moveTo(-24, 6);
  ctx.lineTo(-14, 10);
  ctx.lineTo(-22, 16);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(24, 6);
  ctx.lineTo(14, 10);
  ctx.lineTo(22, 16);
  ctx.closePath();
  ctx.fill();
  // Rust.
  ctx.fillStyle = 'rgba(180, 100, 70, 0.4)';
  ellipse(ctx, -4, -6, 3, 5);
  ctx.fill();
  ellipse(ctx, 3, 14, 4, 3);
  ctx.fill();
  ctx.restore();
}

function drawChest(ctx, p) {
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.scale(p.s ?? 1, p.s ?? 1);
  ctx.fillStyle = 'rgba(60, 40, 20, 0.28)';
  ellipse(ctx, 2, 16, 34, 7);
  ctx.fill();
  // Box.
  ctx.fillStyle = p.c;
  ctx.fillRect(-30, -4, 60, 26);
  ctx.fillStyle = 'rgba(50, 30, 16, 0.45)';
  ctx.fillRect(-30, 12, 60, 10);
  // Bands.
  ctx.fillStyle = '#c9a24b';
  ctx.fillRect(-24, -4, 5, 26);
  ctx.fillRect(19, -4, 5, 26);
  ctx.fillRect(-30, 2, 60, 3);

  if (p.open) {
    // Open lid leaning back, with a heap of coins catching the light.
    ctx.fillStyle = '#6e4728';
    ctx.beginPath();
    ctx.moveTo(-30, -4);
    ctx.quadraticCurveTo(-32, -30, 0, -32);
    ctx.quadraticCurveTo(32, -30, 30, -4);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#c9a24b';
    ctx.fillRect(-26, -27, 52, 3);
    ctx.fillStyle = radial(ctx, 0, -6, 2, 34, [
      [0, 'rgba(255, 226, 130, 0.95)'],
      [1, 'rgba(255, 190, 70, 0.1)'],
    ]);
    ctx.fillRect(-34, -24, 68, 30);
    for (let index = 0; index < 8; index += 1) {
      dot(ctx, -18 + index * 5.2, -8 - (index % 3) * 2.4, 3.6, index % 2 ? '#ffe08a' : '#ffc84f');
    }
    dot(ctx, -3, 5, 4.4, '#ffd166');
    dot(ctx, 9, 6, 3.6, '#ffe6a0');
    starPath(ctx, 12, -16, 7, 2, 4);
    ctx.fillStyle = '#fff3c0';
    ctx.fill();
  } else {
    // Closed lid.
    ctx.fillStyle = '#8a5a33';
    ctx.beginPath();
    ctx.moveTo(-30, -4);
    ctx.quadraticCurveTo(-30, -24, 0, -24);
    ctx.quadraticCurveTo(30, -24, 30, -4);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#c9a24b';
    ctx.fillRect(-24, -22, 5, 18);
    ctx.fillRect(19, -22, 5, 18);
    ctx.beginPath();
    ctx.moveTo(-30, -10);
    ctx.quadraticCurveTo(0, -28, 30, -10);
    ctx.lineTo(30, -7);
    ctx.quadraticCurveTo(0, -25, -30, -7);
    ctx.closePath();
    ctx.fill();
    // Lock plate.
    ctx.fillStyle = '#e0b35a';
    ctx.fillRect(-6, -8, 12, 12);
    ctx.fillStyle = '#5d3a1d';
    dot(ctx, 0, -3, 2, '#5d3a1d');
    ctx.fillRect(-1, -3, 2, 5);
  }
  ctx.restore();
}

function drawSeahorse(ctx, p) {
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.scale((p.s ?? 1) * 0.9, (p.s ?? 1) * 0.9);
  ctx.fillStyle = p.c;
  ctx.beginPath();
  ctx.moveTo(-2, -34);
  ctx.quadraticCurveTo(12, -38, 12, -24);
  ctx.quadraticCurveTo(12, -12, 2, -6);
  ctx.quadraticCurveTo(-4, 0, 0, 8);
  ctx.quadraticCurveTo(10, 20, 2, 28);
  ctx.quadraticCurveTo(-6, 34, -8, 24);
  ctx.quadraticCurveTo(-10, 16, -2, 14);
  ctx.quadraticCurveTo(4, 12, 0, 4);
  ctx.quadraticCurveTo(-8, -6, -6, -18);
  ctx.quadraticCurveTo(-5, -30, -2, -34);
  ctx.closePath();
  ctx.fill();
  // Snout.
  ctx.beginPath();
  ctx.moveTo(-2, -32);
  ctx.lineTo(-18, -28);
  ctx.lineTo(-18, -24);
  ctx.lineTo(-3, -25);
  ctx.closePath();
  ctx.fill();
  // Dorsal fin.
  ctx.fillStyle = 'rgba(255, 245, 210, 0.65)';
  ctx.beginPath();
  ctx.moveTo(8, -18);
  ctx.quadraticCurveTo(20, -14, 8, -6);
  ctx.closePath();
  ctx.fill();
  dot(ctx, 4, -28, 1.8, '#3a2a15');
  // Belly ridges.
  ctx.strokeStyle = 'rgba(160, 100, 40, 0.45)';
  ctx.lineWidth = 1.1;
  for (let index = 0; index < 4; index += 1) {
    ctx.beginPath();
    ctx.moveTo(-4, -18 + index * 5);
    ctx.quadraticCurveTo(2, -16 + index * 5, 6, -18 + index * 5);
    ctx.stroke();
  }
  ctx.restore();
}

function drawPuffer(ctx, p) {
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.scale(p.s ?? 1, p.s ?? 1);
  ctx.strokeStyle = withShade(p.c, -35);
  ctx.lineWidth = 2;
  for (let index = 0; index < 12; index += 1) {
    const angle = (index / 12) * TAU;
    ctx.beginPath();
    ctx.moveTo(Math.cos(angle) * 20, Math.sin(angle) * 20);
    ctx.lineTo(Math.cos(angle) * 27, Math.sin(angle) * 27);
    ctx.stroke();
  }
  ctx.fillStyle = p.c;
  ctx.beginPath();
  ctx.arc(0, 0, 22, 0, TAU);
  ctx.fill();
  ctx.fillStyle = 'rgba(255, 255, 255, 0.22)';
  ctx.beginPath();
  ctx.arc(-6, -7, 12, 0, TAU);
  ctx.fill();
  // Belly.
  ctx.fillStyle = 'rgba(255, 250, 220, 0.6)';
  ctx.beginPath();
  ctx.ellipse(2, 8, 15, 9, 0, 0, TAU);
  ctx.fill();
  // Face.
  dot(ctx, 6, -5, 4.2, '#fffdf2');
  dot(ctx, 7, -5, 2, '#2b2416');
  dot(ctx, -5, -4, 3, '#fffdf2');
  dot(ctx, -4.4, -4, 1.5, '#2b2416');
  ctx.strokeStyle = '#5c4a25';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(1, 1, 4, 0.25, Math.PI - 0.25);
  ctx.stroke();
  // Tail fin.
  ctx.fillStyle = withShade(p.c, -25);
  ctx.beginPath();
  ctx.moveTo(-20, 2);
  ctx.quadraticCurveTo(-32, -8, -32, 10);
  ctx.quadraticCurveTo(-26, 6, -20, 10);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawJelly(ctx, p) {
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.scale(p.s ?? 1, p.s ?? 1);
  // Tendrils.
  ctx.strokeStyle = p.c;
  ctx.lineWidth = 2;
  ctx.globalAlpha = 0.75;
  for (let index = 0; index < 7; index += 1) {
    const x = -18 + index * 6;
    ctx.beginPath();
    ctx.moveTo(x, 8);
    ctx.bezierCurveTo(x - 5, 24, x + 6, 36, x - 2, 52 + (index % 3) * 5);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
  // Bell.
  const bell = radial(ctx, 0, -6, 2, 44, [
    [0, 'rgba(255, 240, 255, 0.95)'],
    [0.55, p.c],
    [1, 'rgba(120, 80, 190, 0.7)'],
  ]);
  ctx.fillStyle = bell;
  ctx.beginPath();
  ctx.moveTo(-28, 4);
  ctx.quadraticCurveTo(-28, -30, 0, -32);
  ctx.quadraticCurveTo(28, -30, 28, 4);
  ctx.quadraticCurveTo(18, 18, 10, 5);
  ctx.quadraticCurveTo(2, 17, -6, 5);
  ctx.quadraticCurveTo(-16, 17, -28, 4);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.arc(0, -8, 16, Math.PI * 1.15, Math.PI * 1.9);
  ctx.stroke();
  dot(ctx, -10, -14, 2.4, 'rgba(255, 255, 255, 0.7)');
  dot(ctx, 8, -18, 1.8, 'rgba(255, 255, 255, 0.5)');
  ctx.restore();
}

function drawTurtle(ctx, p) {
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.scale(p.s ?? 1, p.s ?? 1);
  // Flippers.
  ctx.fillStyle = withShade(p.c, 18);
  ellipse(ctx, -24, 6, 15, 7, 0.5);
  ctx.fill();
  ellipse(ctx, 24, -4, 13, 6, -0.5);
  ctx.fill();
  ellipse(ctx, 16, 12, 11, 5, 0.9);
  ctx.fill();
  // Head.
  ctx.fillStyle = withShade(p.c, 32);
  ellipse(ctx, 31, -9, 9, 7);
  ctx.fill();
  dot(ctx, 34, -11, 1.6, '#22331f');
  // Shell.
  ctx.fillStyle = p.c;
  ellipse(ctx, 0, 0, 26, 20);
  ctx.fill();
  ctx.fillStyle = 'rgba(30, 70, 50, 0.55)';
  ctx.strokeStyle = 'rgba(30, 70, 50, 0.7)';
  ctx.lineWidth = 1.6;
  ellipse(ctx, 0, 0, 18, 13);
  ctx.stroke();
  for (let index = 0; index < 6; index += 1) {
    const angle = (index / 6) * TAU;
    ctx.beginPath();
    ctx.arc(Math.cos(angle) * 12, Math.sin(angle) * 8, 3.2, 0, TAU);
    ctx.stroke();
  }
  dot(ctx, -8, -6, 4, 'rgba(220, 255, 220, 0.25)');
  ctx.restore();
}

function drawSub(ctx, p) {
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.scale(p.s ?? 1, p.s ?? 1);
  // Headlight.
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  const light = ctx.createLinearGradient(-6, 0, -78, 0);
  light.addColorStop(0, 'rgba(255, 244, 180, 0.3)');
  light.addColorStop(1, 'rgba(255, 244, 180, 0)');
  ctx.fillStyle = light;
  ctx.beginPath();
  ctx.moveTo(-8, -4);
  ctx.lineTo(-78, -26);
  ctx.lineTo(-78, 24);
  ctx.lineTo(-8, 6);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
  // Hull.
  ctx.fillStyle = p.c;
  ellipse(ctx, 0, 0, 30, 15);
  ctx.fill();
  ctx.fillStyle = 'rgba(255, 255, 255, 0.28)';
  ellipse(ctx, -3, -5, 22, 7);
  ctx.fill();
  ctx.fillStyle = '#e0a53a';
  ctx.fillRect(-26, -2, 52, 4);
  // Bubble canopy.
  ctx.fillStyle = '#7de3ff';
  ctx.beginPath();
  ctx.arc(2, -13, 10, Math.PI, 0);
  ctx.fill();
  ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
  ctx.beginPath();
  ctx.arc(-1, -16, 4, Math.PI, 0);
  ctx.fill();
  dot(ctx, 2, -8, 3.4, '#274059');
  // Propeller.
  ctx.strokeStyle = '#5c4a2a';
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.moveTo(30, 0);
  ctx.lineTo(38, -9);
  ctx.moveTo(30, 0);
  ctx.lineTo(38, 9);
  ctx.stroke();
  dot(ctx, 30, 0, 2, '#3c3320');
  // Fins.
  ctx.fillStyle = '#e0a53a';
  ctx.beginPath();
  ctx.moveTo(-20, 10);
  ctx.lineTo(-30, 20);
  ctx.lineTo(-12, 14);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawFish(ctx, p) {
  const s = p.s ?? 1;
  const dir = p.dir ?? 1;
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.scale(s * dir, s);
  // Tail.
  ctx.fillStyle = p.a;
  ctx.beginPath();
  ctx.moveTo(-18, 0);
  ctx.quadraticCurveTo(-30, -11, -34, -2);
  ctx.quadraticCurveTo(-30, 1, -34, 9);
  ctx.quadraticCurveTo(-26, 9, -18, 3);
  ctx.closePath();
  ctx.fill();
  // Body.
  ctx.fillStyle = p.c;
  ellipse(ctx, 0, 0, 20, 11);
  ctx.fill();
  ctx.fillStyle = 'rgba(255, 255, 255, 0.24)';
  ellipse(ctx, -2, -4, 12, 4.5);
  ctx.fill();
  // Dorsal fin.
  ctx.fillStyle = p.a;
  ctx.beginPath();
  ctx.moveTo(-8, -10);
  ctx.quadraticCurveTo(0, -18, 8, -8);
  ctx.closePath();
  ctx.fill();
  // Pectoral fin.
  ctx.beginPath();
  ctx.moveTo(-2, 4);
  ctx.quadraticCurveTo(-10, 13, 3, 10);
  ctx.closePath();
  ctx.fill();
  // Eye.
  dot(ctx, 11, -3, 3.2, '#fffdf4');
  dot(ctx, 12, -3, 1.7, '#20242f');
  ctx.restore();
}

function drawClown(ctx, p) {
  const s = p.s ?? 1;
  const dir = p.dir ?? 1;
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.scale(s * dir, s);
  // Tail.
  ctx.fillStyle = p.a;
  ctx.beginPath();
  ctx.moveTo(-16, 0);
  ctx.quadraticCurveTo(-25, -8, -27, 0);
  ctx.quadraticCurveTo(-25, 8, -16, 3);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = p.c;
  ellipse(ctx, 0, 0, 18, 10);
  ctx.fill();
  // White bands.
  ctx.fillStyle = p.a;
  ctx.save();
  ellipse(ctx, 0, 0, 18, 10);
  ctx.clip();
  ctx.fillRect(-7, -11, 4.5, 22);
  ctx.fillRect(6, -11, 4, 22);
  ctx.fillRect(-17, -11, 3, 22);
  ctx.restore();
  ctx.strokeStyle = 'rgba(50, 30, 20, 0.55)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.ellipse(0, 0, 18, 10, 0, 0, TAU);
  ctx.stroke();
  dot(ctx, 10, -3, 2.8, '#fffdf4');
  dot(ctx, 11, -3, 1.4, '#20242f');
  ctx.restore();
}

function drawRay(ctx, p) {
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.scale(p.s ?? 1, p.s ?? 1);
  ctx.fillStyle = p.c;
  ctx.beginPath();
  ctx.moveTo(0, -6);
  ctx.quadraticCurveTo(-34, -22, -58, -2);
  ctx.quadraticCurveTo(-30, 6, 0, 4);
  ctx.quadraticCurveTo(30, 6, 58, -2);
  ctx.quadraticCurveTo(34, -22, 0, -6);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = p.c;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, 3);
  ctx.quadraticCurveTo(6, 18, 2, 34);
  ctx.stroke();
  dot(ctx, -34, -6, 1.5, 'rgba(220, 245, 255, 0.5)');
  dot(ctx, 34, -6, 1.5, 'rgba(220, 245, 255, 0.5)');
  ctx.restore();
}

function drawBubbles(ctx, p) {
  const bubbles = [
    [0, 0, 7], [12, -14, 4.5], [-8, -24, 3.4], [6, -34, 5.5],
    [-14, -42, 2.8], [16, -50, 3.6], [-3, -60, 4.2],
  ];
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.scale(p.s ?? 1, p.s ?? 1);
  for (const [x, y, r] of bubbles) {
    ctx.strokeStyle = 'rgba(210, 250, 255, 0.6)';
    ctx.lineWidth = 1.1;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, TAU);
    ctx.stroke();
    ctx.fillStyle = 'rgba(230, 255, 255, 0.12)';
    ctx.fill();
    dot(ctx, x - r * 0.3, y - r * 0.3, r * 0.25, 'rgba(255, 255, 255, 0.75)');
  }
  ctx.restore();
}
