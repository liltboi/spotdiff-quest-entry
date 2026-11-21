// Level three: "Orbit Outpost". Deep space, a banded ringed planet, and a little survey station
// with solar wings, a botany dome and one astronaut on a tether. Painted entirely with canvas.

import { TAU, dot, ellipse, gradient, hash01, radial, roundRect, starPath } from '../draw.js';

const W = 560;
const H = 440;

function makeStars(random) {
  const stars = [];
  for (let index = 0; index < 96; index += 1) {
    const bright = random() > 0.9;
    stars.push({
      x: random() * W,
      y: random() * H,
      r: bright ? 1.6 + random() : 0.4 + random() * 1,
      a: 0.25 + random() * 0.7,
      cross: bright,
    });
  }
  return stars;
}

export function buildOrbit(random) {
  const stars = makeStars(random);
  const props = [];

  const backdrop = (ctx) => {
    ctx.fillStyle = gradient(ctx, 0, 0, 0, H, [
      [0, '#04050d'],
      [0.5, '#0a1026'],
      [1, '#050810'],
    ]);
    ctx.fillRect(0, 0, W, H);

    // Nebula clouds: low alpha so they never fight the station.
    ctx.fillStyle = radial(ctx, 430, 90, 10, 230, [
      [0, 'rgba(110, 84, 200, 0.22)'],
      [0.55, 'rgba(90, 60, 160, 0.08)'],
      [1, 'rgba(60, 40, 120, 0)'],
    ]);
    ctx.fillRect(160, -80, 400, 400);
    ctx.fillStyle = radial(ctx, 150, 390, 20, 240, [
      [0, 'rgba(40, 150, 170, 0.16)'],
      [1, 'rgba(40, 150, 170, 0)'],
    ]);
    ctx.fillRect(-60, 180, 440, 260);

    for (const star of stars) {
      ctx.globalAlpha = star.a;
      dot(ctx, star.x, star.y, star.r, '#e7eeff');
      if (star.cross) {
        ctx.strokeStyle = 'rgba(210, 225, 255, 0.55)';
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(star.x - star.r * 4, star.y);
        ctx.lineTo(star.x + star.r * 4, star.y);
        ctx.moveTo(star.x, star.y - star.r * 4);
        ctx.lineTo(star.x, star.y + star.r * 4);
        ctx.stroke();
      }
    }
    ctx.globalAlpha = 1;

    // A faint dust band across the lower third.
    ctx.save();
    ctx.translate(W / 2, 390);
    ctx.rotate(-0.12);
    ctx.fillStyle = 'rgba(130, 150, 220, 0.035)';
    ellipse(ctx, 0, 0, 320, 34);
    ctx.fill();
    ctx.restore();
  };

  // --- Planet, moon and sky props ------------------------------------------------------------
  props.push({
    id: 'planet',
    type: 'planet',
    x: 104,
    y: 320,
    r: 150,
    z: 1,
    s: 1,
    c: '#2e7f91',
  });
  props.push({ id: 'ring', type: 'ring', x: 104, y: 320, r: 150, z: 1.2, s: 1, c: '#d9b981' });
  props.push({ id: 'moon', type: 'moon', x: 512, y: 54, r: 22, z: 1.1, s: 1, c: '#cfd6e6' });
  props.push({ id: 'comet', type: 'comet', x: 424, y: 78, z: 1.3, s: 1, c: '#bfe9ff' });
  props.push({ id: 'cluster', type: 'cluster', x: 258, y: 48, z: 1.25, s: 1, c: '#cfe4ff', side: 'right' });

  // --- Station ---------------------------------------------------------------------------------
  props.push({ id: 'panelL', type: 'panel', x: 168, y: 238, z: 3, w: 114, h: 58, s: 1, c: '#2d4a86', a: '#6f9ad8' });
  props.push({ id: 'panelR', type: 'panel', x: 462, y: 238, z: 3, w: 114, h: 58, s: 1, c: '#2d4a86', a: '#6f9ad8' });
  props.push({ id: 'hub', type: 'hub', x: 315, y: 236, z: 3.2, w: 122, h: 66, s: 1, c: '#a9b6c9', a: '#6de3ff' });
  props.push({ id: 'label', type: 'label', x: 315, y: 260, z: 3.7, s: 1, t: 'OUTPOST 7', c: '#e9f2ff' });
  props.push({ id: 'dish', type: 'dish', x: 315, y: 176, z: 3.4, s: 1, c: '#c3cedd' });
  props.push({ id: 'beacon', type: 'beacon', x: 358, y: 198, z: 3.6, s: 1, c: '#ff5c6c' });
  props.push({ id: 'biodome', type: 'biodome', x: 468, y: 138, z: 3.3, s: 1, c: '#73e29a' });

  props.push({ id: 'astro', type: 'astro', x: 438, y: 328, z: 4, s: 1, c: '#e8eef7', a: '#7fe8ff' });
  props.push({ id: 'cargo', type: 'cargo', x: 118, y: 374, z: 3.1, s: 1, c: '#8b6b4c', a: '#ffc868' });
  props.push({ id: 'drone', type: 'drone', x: 204, y: 338, z: 3.8, s: 1, c: '#b8c4d6' });
  props.push({ id: 'toolbox', type: 'toolbox', x: 372, y: 368, z: 3.9, s: 1, c: '#d6854a', side: 'right' });
  props.push({ id: 'asteroid', type: 'asteroid', x: 522, y: 362, z: 3, s: 1, c: '#59647a', side: 'right' });

  const centres = {
    planet: [104, 300],
    ring: [205, 258],
    moon: [512, 54],
    comet: [424, 78],
    cluster: [258, 48],
    panelL: [168, 238],
    panelR: [462, 238],
    hub: [315, 232],
    label: [315, 260],
    dish: [315, 172],
    beacon: [358, 198],
    biodome: [468, 138],
    astro: [438, 326],
    cargo: [118, 374],
    drone: [204, 338],
    toolbox: [372, 368],
    asteroid: [522, 362],
  };
  for (const prop of props) {
    const centre = centres[prop.id];
    prop.cx = centre[0];
    prop.cy = centre[1];
  }

  const pool = [
    { prop: 'ring', op: 'hide', tier: 2, r: 1.2 },
    { prop: 'planet', op: 'color', value: '#4c7f9e', tier: 3, r: 1.3 },
    { prop: 'moon', op: 'scale', value: 1.26, tier: 2, r: 1.2 },
    { prop: 'cluster', op: 'show', tier: 1, r: 1.1 },
    { prop: 'comet', op: 'hide', tier: 1, r: 1.2 },
    { prop: 'hub', op: 'accent', value: '#ffc868', tier: 2, r: 1.1 },
    { prop: 'panelL', op: 'hide', tier: 1, r: 1.2 },
    { prop: 'panelR', op: 'accent', value: '#8be0ff', tier: 3, r: 1.2 },
    { prop: 'dish', op: 'hide', tier: 2, r: 1.1 },
    { prop: 'beacon', op: 'color', value: '#63f5a6', tier: 2, r: 1.1 },
    { prop: 'label', op: 'text', value: 'OUTPOST 9', tier: 3, r: 1.1 },
    { prop: 'biodome', op: 'hide', tier: 1, r: 1.2 },
    { prop: 'astro', op: 'accent', value: '#ffc868', tier: 2, r: 1.1 },
    { prop: 'astro', op: 'shift', value: { dx: 16, dy: 9 }, tier: 2, r: 1.2 },
    { prop: 'cargo', op: 'accent', value: '#7fe4ff', tier: 3, r: 1.1 },
    { prop: 'drone', op: 'hide', tier: 2, r: 1.1 },
    { prop: 'toolbox', op: 'show', tier: 1, r: 1.1 },
    { prop: 'asteroid', op: 'show', tier: 1, r: 1.1 },
  ];

  return {
    key: 'orbit',
    name: 'Orbit Outpost',
    tint: '#8fa8ff',
    props,
    pool,
    backdrop,
    drawProp: drawOrbitProp,
  };
}

function drawOrbitProp(ctx, p) {
  switch (p.type) {
    case 'planet': return drawPlanet(ctx, p);
    case 'ring': return drawRing(ctx, p);
    case 'moon': return drawMoon(ctx, p);
    case 'comet': return drawComet(ctx, p);
    case 'cluster': return drawCluster(ctx, p);
    case 'panel': return drawPanel(ctx, p);
    case 'hub': return drawHub(ctx, p);
    case 'label': return drawLabel(ctx, p);
    case 'dish': return drawDish(ctx, p);
    case 'beacon': return drawBeacon(ctx, p);
    case 'biodome': return drawBiodome(ctx, p);
    case 'astro': return drawAstro(ctx, p);
    case 'cargo': return drawCargo(ctx, p);
    case 'drone': return drawDrone(ctx, p);
    case 'toolbox': return drawToolbox(ctx, p);
    case 'asteroid': return drawAsteroid(ctx, p);
    default: return undefined;
  }
}

function drawPlanet(ctx, p) {
  const r = p.r * (p.s ?? 1);
  ctx.save();
  // Atmosphere.
  ctx.fillStyle = radial(ctx, p.x, p.y, r * 0.9, r * 1.25, [
    [0, 'rgba(110, 230, 220, 0.16)'],
    [1, 'rgba(110, 230, 220, 0)'],
  ]);
  ctx.beginPath();
  ctx.arc(p.x, p.y, r * 1.26, 0, TAU);
  ctx.fill();

  ctx.beginPath();
  ctx.arc(p.x, p.y, r, 0, TAU);
  ctx.clip();

  ctx.fillStyle = p.c;
  ctx.fillRect(p.x - r, p.y - r, r * 2, r * 2);
  // Bands, curved with the sphere.
  const band = (offset, thickness, color, alpha) => {
    ctx.fillStyle = color;
    ctx.globalAlpha = alpha;
    ctx.beginPath();
    ctx.ellipse(p.x, p.y + offset, r * 1.1, thickness, -0.06, 0, Math.PI, true);
    ctx.fill();
    ctx.globalAlpha = 1;
  };
  band(-74, 22, '#3f9eae', 0.8);
  band(-22, 16, '#246878', 0.75);
  band(34, 26, '#54b3bf', 0.5);
  band(88, 18, '#1d5a6c', 0.7);
  band(128, 12, '#63c4c9', 0.3);

  // Storms and little craters of cloud.
  ctx.fillStyle = 'rgba(190, 245, 235, 0.35)';
  ellipse(ctx, p.x - 34, p.y - 18, 26, 10, -0.3);
  ctx.fill();
  ctx.fillStyle = 'rgba(20, 60, 80, 0.4)';
  ellipse(ctx, p.x + 32, p.y + 44, 30, 12, 0.14);
  ctx.fill();
  ctx.fillStyle = 'rgba(210, 255, 250, 0.22)';
  ellipse(ctx, p.x - 10, p.y + 90, 40, 8, -0.08);
  ctx.fill();

  // Day/night terminator.
  ctx.fillStyle = radial(ctx, p.x - 54, p.y - 62, 10, r * 1.7, [
    [0, 'rgba(255, 255, 255, 0.15)'],
    [0.5, 'rgba(255, 255, 255, 0)'],
    [0.82, 'rgba(2, 8, 18, 0.45)'],
    [1, 'rgba(2, 6, 14, 0.85)'],
  ]);
  ctx.fillRect(p.x - r, p.y - r, r * 2, r * 2);
  ctx.restore();

  // Rim light on the sunlit side.
  ctx.strokeStyle = 'rgba(150, 255, 240, 0.5)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(p.x, p.y, r - 1, Math.PI * 0.62, Math.PI * 1.48);
  ctx.stroke();
}

function drawRing(ctx, p) {
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.rotate(-0.32);
  const rx = p.r * 1.62;
  const ry = p.r * 0.36;
  ctx.strokeStyle = p.c;
  ctx.globalAlpha = 0.62;
  ctx.lineWidth = 10;
  ctx.beginPath();
  ctx.ellipse(0, 0, rx, ry, 0, 0, TAU);
  ctx.stroke();
  ctx.globalAlpha = 0.45;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.ellipse(0, 0, rx * 1.12, ry * 1.14, 0, 0, TAU);
  ctx.stroke();
  ctx.globalAlpha = 0.28;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(0, 0, rx * 0.82, ry * 0.84, 0, 0, TAU);
  ctx.stroke();
  ctx.globalAlpha = 1;
  ctx.restore();
}

function drawMoon(ctx, p) {
  const r = p.r * (p.s ?? 1);
  ctx.fillStyle = p.c;
  ctx.beginPath();
  ctx.arc(p.x, p.y, r, 0, TAU);
  ctx.fill();
  ctx.fillStyle = 'rgba(120, 130, 150, 0.35)';
  for (let index = 0; index < 5; index += 1) {
    const angle = hash01(index + 3) * TAU;
    const distance = hash01(index + 7) * r * 0.6;
    ctx.beginPath();
    ctx.arc(p.x + Math.cos(angle) * distance, p.y + Math.sin(angle) * distance, r * 0.14, 0, TAU);
    ctx.fill();
  }
  ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
  ctx.beginPath();
  ctx.arc(p.x - r * 0.3, p.y - r * 0.3, r * 0.6, 0, TAU);
  ctx.fill();
}

function drawComet(ctx, p) {
  ctx.save();
  ctx.translate(p.x, p.y);
  // Tail sweeping up-right.
  ctx.globalCompositeOperation = 'lighter';
  const tail = ctx.createLinearGradient(0, 0, 90, -46);
  tail.addColorStop(0, 'rgba(190, 235, 255, 0.5)');
  tail.addColorStop(1, 'rgba(190, 235, 255, 0)');
  ctx.fillStyle = tail;
  ctx.beginPath();
  ctx.moveTo(0, -4);
  ctx.quadraticCurveTo(46, -8, 96, -50);
  ctx.quadraticCurveTo(55, 2, 2, 4);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#f2fbff';
  ctx.beginPath();
  ctx.arc(0, 0, 3.6, 0, TAU);
  ctx.fill();
  ctx.fillStyle = 'rgba(190, 235, 255, 0.22)';
  ctx.beginPath();
  ctx.arc(0, 0, 11, 0, TAU);
  ctx.fill();
  ctx.restore();
}

function drawCluster(ctx, p) {
  const points = [
    [0, 0, 8], [16, 13, 4], [-13, 15, 3.6], [8, -15, 3],
  ];
  for (let index = 0; index < points.length; index += 1) {
    const [dx, dy, size] = points[index];
    ctx.globalAlpha = 0.9 - index * 0.12;
    starPath(ctx, p.x + dx, p.y + dy, size, size * 0.22, 4);
    ctx.fillStyle = p.c;
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

function drawPanel(ctx, p) {
  const w = p.w;
  const h = p.h;
  ctx.save();
  ctx.translate(p.x, p.y);
  const left = p.id === 'panelL';
  ctx.rotate(left ? -0.05 : 0.05);
  // Truss.
  ctx.strokeStyle = '#5b677a';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(left ? w / 2 - 6 : -w / 2 + 6, 0);
  ctx.lineTo(left ? w / 2 + 20 : -w / 2 - 20, 0);
  ctx.stroke();
  // Frame.
  ctx.fillStyle = '#1a2334';
  roundRect(ctx, -w / 2 - 3, -h / 2 - 3, w + 6, h + 6, 4);
  ctx.fill();
  // Cells.
  const cols = 4;
  const rows = 2;
  const gap = 2.5;
  const cellW = (w - (cols + 1) * gap) / cols;
  const cellH = (h - (rows + 1) * gap) / rows;
  for (let col = 0; col < cols; col += 1) {
    for (let row = 0; row < rows; row += 1) {
      const x = -w / 2 + gap + col * (cellW + gap);
      const y = -h / 2 + gap + row * (cellH + gap);
      ctx.fillStyle = p.c;
      ctx.fillRect(x, y, cellW, cellH);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.16)';
      ctx.fillRect(x, y, cellW, 1.6);
      ctx.fillStyle = 'rgba(6, 12, 24, 0.35)';
      ctx.fillRect(x, y + cellH / 2 - 0.7, cellW, 1.4);
      ctx.fillStyle = p.a;
      dot(ctx, x + cellW / 2, y + cellH / 2, 1.4, p.a);
    }
  }
  // Wing highlights.
  ctx.strokeStyle = 'rgba(190, 220, 255, 0.4)';
  ctx.lineWidth = 1;
  ctx.strokeRect(-w / 2 - 3, -h / 2 - 3, w + 6, h + 6);
  ctx.restore();
}

function drawHub(ctx, p) {
  const w = p.w;
  const h = p.h;
  ctx.save();
  ctx.translate(p.x, p.y);

  // Side arms.
  ctx.strokeStyle = '#68758a';
  ctx.lineWidth = 10;
  ctx.beginPath();
  ctx.moveTo(-w / 2, 0);
  ctx.lineTo(-106, 0);
  ctx.moveTo(w / 2, 0);
  ctx.lineTo(106, 0);
  ctx.stroke();

  // Body: a cylinder lit from the top.
  ctx.fillStyle = gradient(ctx, 0, -h / 2, 0, h / 2, [
    [0, '#d7dfe9'],
    [0.28, '#aab7c9'],
    [0.72, '#7d8ba1'],
    [1, '#4f5a6d'],
  ]);
  roundRect(ctx, -w / 2, -h / 2, w, h, 14);
  ctx.fill();
  ctx.strokeStyle = '#39445a';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Panel seams and rivets.
  ctx.strokeStyle = 'rgba(50, 62, 84, 0.55)';
  ctx.lineWidth = 1.2;
  for (let index = -1; index <= 1; index += 1) {
    ctx.beginPath();
    ctx.moveTo(index * 34, -h / 2 + 5);
    ctx.lineTo(index * 34, h / 2 - 5);
    ctx.stroke();
  }
  ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
  for (let index = 0; index < 6; index += 1) {
    dot(ctx, -w / 2 + 10 + index * 20, -h / 2 + 6, 1.2, 'rgba(255,255,255,0.5)');
  }

  // Three portholes with the station's mood light.
  for (let index = 0; index < 3; index += 1) {
    const px = -30 + index * 30;
    ctx.fillStyle = p.a;
    ctx.globalAlpha = 0.9;
    ctx.beginPath();
    ctx.arc(px, -2, 8.5, 0, TAU);
    ctx.fill();
    ctx.globalAlpha = 0.22;
    ctx.beginPath();
    ctx.arc(px, -2, 14, 0, TAU);
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.strokeStyle = '#4b566b';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(px, -2, 9.5, 0, TAU);
    ctx.stroke();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.beginPath();
    ctx.arc(px - 2.5, -5, 2.2, 0, TAU);
    ctx.fill();
    // Warm cabin glow.
    ctx.fillStyle = 'rgba(255, 225, 150, 0.16)';
    ctx.beginPath();
    ctx.arc(px, 0, 5.5, 0, TAU);
    ctx.fill();
  }

  // Docking collar beneath.
  ctx.fillStyle = '#59657a';
  roundRect(ctx, -18, h / 2 - 2, 36, 12, 4);
  ctx.fill();
  ctx.fillStyle = '#39445a';
  ctx.fillRect(-12, h / 2 + 8, 24, 4);

  // Top mast base.
  ctx.strokeStyle = '#8d99ab';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(0, -h / 2);
  ctx.lineTo(0, -h / 2 - 18);
  ctx.stroke();
  ctx.restore();
}

function drawLabel(ctx, p) {
  ctx.save();
  ctx.font = '700 9px "Courier New", monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const width = ctx.measureText(p.t).width + 14;
  ctx.fillStyle = 'rgba(28, 38, 54, 0.8)';
  roundRect(ctx, p.x - width / 2, p.y - 8, width, 16, 3);
  ctx.fill();
  ctx.strokeStyle = 'rgba(190, 215, 245, 0.22)';
  ctx.lineWidth = 0.8;
  ctx.stroke();
  ctx.fillStyle = p.c;
  ctx.fillText(p.t, p.x, p.y + 0.5);
  ctx.restore();
}

function drawDish(ctx, p) {
  ctx.save();
  ctx.translate(p.x, p.y);
  // Mast.
  ctx.strokeStyle = '#8492a6';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(0, 30);
  ctx.lineTo(0, 0);
  ctx.stroke();
  // Parabolic dish, tilted.
  ctx.rotate(-0.24);
  ctx.fillStyle = 'rgba(90, 105, 128, 0.7)';
  ctx.beginPath();
  ctx.ellipse(0, -8, 30, 17, 0, Math.PI, TAU);
  ctx.fill();
  ctx.fillStyle = p.c;
  ctx.beginPath();
  ctx.ellipse(0, -10, 30, 17, 0, Math.PI, TAU);
  ctx.fill();
  ctx.strokeStyle = '#6d7c92';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(0, -10, 30, 17, 0, Math.PI, TAU);
  ctx.stroke();
  ctx.strokeStyle = '#aab6c8';
  ctx.lineWidth = 1.2;
  for (let index = -2; index <= 2; index += 1) {
    ctx.beginPath();
    ctx.moveTo(index * 8, -10);
    ctx.lineTo(index * 3, -24);
    ctx.stroke();
  }
  // Feed horn.
  ctx.strokeStyle = '#c9d3e2';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, -10);
  ctx.lineTo(0, -34);
  ctx.stroke();
  dot(ctx, 0, -36, 3, '#eef6ff');
  ctx.restore();
}

function drawBeacon(ctx, p) {
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.fillStyle = 'rgba(255, 92, 108, 0.14)';
  ctx.beginPath();
  ctx.arc(0, 0, 20, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = '#5e6b80';
  ctx.lineWidth = 2.6;
  ctx.beginPath();
  ctx.moveTo(0, 20);
  ctx.lineTo(0, 4);
  ctx.stroke();
  ctx.fillStyle = p.c;
  ctx.beginPath();
  ctx.arc(0, 0, 7, 0, TAU);
  ctx.fill();
  ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
  ctx.beginPath();
  ctx.arc(-2, -2.5, 2.4, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.arc(0, 0, 11, 0, TAU);
  ctx.stroke();
  ctx.restore();
}

function drawBiodome(ctx, p) {
  ctx.save();
  ctx.translate(p.x, p.y);
  // Attachment arm.
  ctx.strokeStyle = '#6b778c';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(-28, 6);
  ctx.lineTo(-54, 24);
  ctx.stroke();
  // Glass sphere.
  ctx.fillStyle = 'rgba(120, 220, 200, 0.16)';
  ctx.beginPath();
  ctx.arc(0, 0, 31, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = 'rgba(170, 240, 230, 0.55)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(0, 0, 31, 0, TAU);
  ctx.stroke();
  // Soil and plants.
  ctx.fillStyle = '#6a5a3c';
  ctx.beginPath();
  ctx.ellipse(0, 20, 24, 9, 0, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = p.c;
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  for (let index = 0; index < 5; index += 1) {
    const x = -14 + index * 7;
    ctx.beginPath();
    ctx.moveTo(x, 20);
    ctx.quadraticCurveTo(x - 5 + index * 2, 2, x + (index - 2) * 3, -14 - (index % 2) * 8);
    ctx.stroke();
    ctx.fillStyle = p.c;
    ellipse(ctx, x + (index - 2) * 3 + 3, -10 - (index % 2) * 8, 5, 2.4, 0.5);
    ctx.fill();
  }
  // Warm grow lamp.
  ctx.fillStyle = '#ffe6a8';
  dot(ctx, 0, -20, 2.4, '#ffe6a8');
  ctx.fillStyle = 'rgba(255, 230, 168, 0.18)';
  ctx.beginPath();
  ctx.arc(0, -14, 9, 0, TAU);
  ctx.fill();
  // Glass highlight.
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(-4, -4, 22, Math.PI * 1.1, Math.PI * 1.5);
  ctx.stroke();
  ctx.restore();
}

function drawAstro(ctx, p) {
  const s = p.s ?? 1;
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.scale(s, s);
  // Tether back to the station hub.
  ctx.strokeStyle = 'rgba(220, 235, 255, 0.5)';
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(-48, -10);
  ctx.bezierCurveTo(-92, -40, -122, 20, -123, 36);
  ctx.stroke();
  // Backpack.
  ctx.fillStyle = '#aab7c9';
  roundRect(ctx, -38, -18, 20, 34, 5);
  ctx.fill();
  // Legs and arms.
  ctx.strokeStyle = p.c;
  ctx.lineWidth = 9;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-24, 16);
  ctx.lineTo(-38, 32);
  ctx.moveTo(-8, 16);
  ctx.lineTo(-2, 38);
  ctx.moveTo(-50, 2);
  ctx.lineTo(-66, 10);
  ctx.moveTo(-50, -12);
  ctx.lineTo(-68, -6);
  ctx.stroke();
  // Body.
  ctx.strokeStyle = p.c;
  ctx.lineWidth = 24;
  ctx.beginPath();
  ctx.moveTo(-40, -4);
  ctx.lineTo(-14, -4);
  ctx.stroke();
  // Helmet.
  ctx.fillStyle = p.c;
  ctx.beginPath();
  ctx.arc(-44, -18, 15, 0, TAU);
  ctx.fill();
  // Visor.
  ctx.fillStyle = p.a;
  ctx.beginPath();
  ctx.arc(-47, -19, 10, Math.PI * 0.72, Math.PI * 1.72);
  ctx.fill();
  ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
  ctx.beginPath();
  ctx.arc(-50, -23, 4, 0, TAU);
  ctx.fill();
  // Suit details.
  ctx.fillStyle = '#c86a4e';
  ctx.fillRect(-34, -6, 14, 3);
  ctx.fillStyle = '#8a96a8';
  ctx.fillRect(-34, 4, 14, 3);
  // Boots and gloves.
  ctx.fillStyle = '#dbe4f0';
  dot(ctx, -39, 34, 5, '#dbe4f0');
  dot(ctx, -1, 40, 4.5, '#dbe4f0');
  dot(ctx, -67, 11, 4, '#dbe4f0');
  dot(ctx, -69, -7, 4, '#dbe4f0');
  // Little chest light.
  ctx.fillStyle = '#7fe8ff';
  dot(ctx, -36, -12, 1.8, '#7fe8ff');
  ctx.restore();
}

function drawCargo(ctx, p) {
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.rotate(-0.08);
  ctx.fillStyle = p.c;
  roundRect(ctx, -28, -22, 56, 44, 4);
  ctx.fill();
  ctx.fillStyle = 'rgba(40, 26, 16, 0.4)';
  ctx.fillRect(-28, 14, 56, 8);
  ctx.fillStyle = '#59452f';
  ctx.fillRect(-20, -22, 4, 44);
  ctx.fillRect(16, -22, 4, 44);
  // Hazard stripes.
  ctx.fillStyle = p.a;
  ctx.globalAlpha = 0.85;
  ctx.fillRect(-28, -2, 56, 3);
  ctx.globalAlpha = 1;
  // Label.
  ctx.fillStyle = p.a;
  ctx.fillRect(-9, 3, 18, 8);
  ctx.fillStyle = '#2b2218';
  ctx.fillRect(-6, 5, 12, 1.4);
  ctx.fillRect(-6, 8, 8, 1.4);
  // Thruster puff.
  ctx.fillStyle = 'rgba(160, 220, 255, 0.25)';
  ctx.beginPath();
  ctx.moveTo(28, -6);
  ctx.quadraticCurveTo(42, 0, 28, 8);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawDrone(ctx, p) {
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.rotate(-0.12);
  ctx.strokeStyle = '#59677c';
  ctx.lineWidth = 2.4;
  for (let index = 0; index < 4; index += 1) {
    const angle = (index / 4) * TAU + Math.PI / 4;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(Math.cos(angle) * 15, Math.sin(angle) * 15);
    ctx.stroke();
    ctx.fillStyle = 'rgba(160, 230, 255, 0.28)';
    ctx.beginPath();
    ctx.arc(Math.cos(angle) * 16, Math.sin(angle) * 16, 6, 0, TAU);
    ctx.fill();
    ctx.strokeStyle = 'rgba(200, 240, 255, 0.5)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(Math.cos(angle) * 16, Math.sin(angle) * 16, 6, 0, TAU);
    ctx.stroke();
    ctx.strokeStyle = '#59677c';
    ctx.lineWidth = 2.4;
  }
  ctx.fillStyle = p.c;
  roundRect(ctx, -8, -6, 16, 12, 4);
  ctx.fill();
  ctx.fillStyle = '#7fe8ff';
  dot(ctx, 0, 0, 3, '#7fe8ff');
  ctx.fillStyle = 'rgba(127, 232, 255, 0.22)';
  ctx.beginPath();
  ctx.arc(0, 0, 8, 0, TAU);
  ctx.fill();
  ctx.restore();
}

function drawToolbox(ctx, p) {
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.rotate(0.22);
  ctx.strokeStyle = '#7d8798';
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.arc(0, -10, 7, Math.PI, 0);
  ctx.stroke();
  ctx.fillStyle = p.c;
  roundRect(ctx, -17, -8, 34, 18, 3);
  ctx.fill();
  ctx.fillStyle = 'rgba(40, 20, 10, 0.3)';
  ctx.fillRect(-17, 3, 34, 3);
  ctx.fillStyle = '#ffe2a8';
  ctx.fillRect(-3, -3, 6, 5);
  ctx.restore();
}

function drawAsteroid(ctx, p) {
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.scale(p.s ?? 1, p.s ?? 1);
  ctx.fillStyle = p.c;
  ctx.beginPath();
  ctx.moveTo(-16, 4);
  ctx.lineTo(-9, -12);
  ctx.lineTo(6, -16);
  ctx.lineTo(17, -4);
  ctx.lineTo(13, 11);
  ctx.lineTo(-2, 16);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = 'rgba(180, 195, 220, 0.25)';
  ctx.beginPath();
  ctx.arc(-2, -4, 5, 0, TAU);
  ctx.fill();
  ctx.fillStyle = 'rgba(20, 28, 44, 0.5)';
  ctx.beginPath();
  ctx.arc(6, 6, 3, 0, TAU);
  ctx.fill();
  ctx.restore();
}
