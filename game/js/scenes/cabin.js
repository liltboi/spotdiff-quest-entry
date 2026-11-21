// Level five: "Alpine Cabin". A still winter night: aurora ribbons over snowy peaks, a pine
// forest in silhouette, and one warm log cabin with smoke climbing from its chimney. Falling
// snow and the aurora shimmer are ambient layers, drawn with the same clock on both copies.

import { TAU, dot, ellipse, gradient, hash01, radial, roundRect, sparkle, withAlpha } from '../draw.js';

const W = 560;
const H = 440;

function makeStars(random) {
  const stars = [];
  for (let index = 0; index < 58; index += 1) {
    stars.push({
      x: 6 + random() * (W - 12),
      y: 4 + random() * 200,
      r: 0.4 + random() * 1.3,
      a: 0.25 + random() * 0.6,
      phase: random() * TAU,
    });
  }
  return stars;
}

export function buildCabin(random) {
  const stars = makeStars(random);
  const props = [];

  // --- Backdrop: aurora, peaks, forest and snowfield -----------------------------------------
  const backdrop = (ctx, time = 0) => {
    ctx.fillStyle = gradient(ctx, 0, 0, 0, 330, [
      [0, '#040718'],
      [0.38, '#0b1732'],
      [0.7, '#17304d'],
      [1, '#2c4a63'],
    ]);
    ctx.fillRect(0, 0, W, 336);

    for (const star of stars) {
      const twinkle = 0.62 + 0.38 * Math.sin(time * 1.4 + star.phase);
      ctx.globalAlpha = star.a * twinkle;
      dot(ctx, star.x, star.y, star.r, '#eaf2ff');
    }
    ctx.globalAlpha = 1;

    // Aurora: soft ribbons that breathe slowly.
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const ribbons = [
      { y: 92, amp: 30, color: '90, 255, 196', alpha: 0.16, width: 26, speed: 0.22 },
      { y: 126, amp: 24, color: '120, 200, 255', alpha: 0.12, width: 18, speed: -0.16 },
      { y: 68, amp: 18, color: '190, 140, 255', alpha: 0.09, width: 14, speed: 0.12 },
    ];
    for (let band = 0; band < ribbons.length; band += 1) {
      const ribbon = ribbons[band];
      for (let pass = 0; pass < 2; pass += 1) {
        ctx.strokeStyle = `rgba(${ribbon.color}, ${ribbon.alpha * (pass === 0 ? 1 : 0.45)})`;
        ctx.lineWidth = ribbon.width * (pass === 0 ? 1 : 0.5);
        ctx.beginPath();
        for (let x = -20; x <= W + 20; x += 12) {
          const wave = Math.sin(x * 0.012 + time * ribbon.speed + band) * ribbon.amp;
          const ripple = Math.sin(x * 0.033 - time * 0.4 + band * 2) * 8;
          const y = ribbon.y + wave + ripple + pass * 10;
          if (x === -20) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
    }
    ctx.restore();

    // Moon halo; disc is a prop.
    ctx.fillStyle = radial(ctx, 86, 66, 16, 80, [
      [0, 'rgba(220, 236, 255, 0.34)'],
      [0.5, 'rgba(200, 220, 255, 0.1)'],
      [1, 'rgba(200, 220, 255, 0)'],
    ]);
    ctx.fillRect(0, -20, 220, 190);

    // Far mountain ridge with snow caps.
    ctx.fillStyle = '#22375c';
    ctx.beginPath();
    ctx.moveTo(0, 268);
    ctx.lineTo(46, 214);
    ctx.lineTo(88, 244);
    ctx.lineTo(148, 178);
    ctx.lineTo(196, 230);
    ctx.lineTo(248, 200);
    ctx.lineTo(306, 248);
    ctx.lineTo(366, 190);
    ctx.lineTo(424, 234);
    ctx.lineTo(482, 206);
    ctx.lineTo(540, 250);
    ctx.lineTo(560, 244);
    ctx.lineTo(560, 330);
    ctx.lineTo(0, 330);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = 'rgba(196, 220, 250, 0.55)';
    for (const peak of [
      [148, 178, 26], [248, 200, 18], [366, 190, 24], [482, 206, 16], [46, 214, 16],
    ]) {
      ctx.beginPath();
      ctx.moveTo(peak[0], peak[1]);
      ctx.lineTo(peak[0] + peak[2], peak[1] + peak[2] * 0.95);
      ctx.lineTo(peak[0] + peak[2] * 0.24, peak[1] + peak[2] * 0.6);
      ctx.lineTo(peak[0] - peak[2] * 0.1, peak[1] + peak[2] * 0.8);
      ctx.lineTo(peak[0] - peak[2] * 0.8, peak[1] + peak[2] * 0.9);
      ctx.closePath();
      ctx.fill();
    }

    // Mid ridge, darker, with a thin moonlit rim.
    ctx.fillStyle = '#172642';
    ctx.beginPath();
    ctx.moveTo(0, 298);
    ctx.quadraticCurveTo(70, 236, 138, 282);
    ctx.quadraticCurveTo(200, 236, 262, 284);
    ctx.quadraticCurveTo(330, 230, 396, 282);
    ctx.quadraticCurveTo(468, 240, 560, 286);
    ctx.lineTo(560, 340);
    ctx.lineTo(0, 340);
    ctx.closePath();
    ctx.fill();

    // Pine forest silhouette, several rows for depth.
    for (let row = 0; row < 2; row += 1) {
      ctx.fillStyle = row === 0 ? 'rgba(9, 20, 32, 0.85)' : '#081420';
      const baseY = 306 + row * 22;
      const scale = 0.7 + row * 0.3;
      for (let tree = 0; tree < 14; tree += 1) {
        const x = -10 + tree * 44 + (row % 2) * 18;
        const height = (34 + hash01(tree * 3.7 + row * 11) * 34) * scale;
        const width = height * 0.42;
        for (let tier = 0; tier < 3; tier += 1) {
          const ty = baseY - height * 0.8 + tier * height * 0.3;
          const tw = width * (0.5 + tier * 0.26);
          ctx.beginPath();
          ctx.moveTo(x, ty - height * 0.36);
          ctx.lineTo(x + tw, ty + height * 0.22);
          ctx.lineTo(x - tw, ty + height * 0.22);
          ctx.closePath();
          ctx.fill();
        }
      }
    }

    // Snowfield, brighter where the cabin light will fall.
    ctx.fillStyle = gradient(ctx, 0, 328, 0, H, [
      [0, '#c8dbf2'],
      [0.4, '#aac4e0'],
      [1, '#6f8cad'],
    ]);
    ctx.beginPath();
    ctx.moveTo(0, 342);
    ctx.quadraticCurveTo(110, 326, 230, 338);
    ctx.quadraticCurveTo(350, 350, 452, 334);
    ctx.quadraticCurveTo(510, 326, 560, 336);
    ctx.lineTo(560, H);
    ctx.lineTo(0, H);
    ctx.closePath();
    ctx.fill();

    // Blue shadow dunes and wind-polished streaks.
    for (let dune = 0; dune < 5; dune += 1) {
      const y = 352 + dune * 18;
      ctx.fillStyle = `rgba(96, 130, 176, ${0.1 + dune * 0.015})`;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.quadraticCurveTo(140 + dune * 20, y - 8, 300, y + 2);
      ctx.quadraticCurveTo(430, y + 10, 560, y - 2);
      ctx.lineTo(560, y + 8);
      ctx.lineTo(0, y + 8);
      ctx.closePath();
      ctx.fill();
    }
    for (let streak = 0; streak < 10; streak += 1) {
      const y = 352 + hash01(streak * 3.1) * 70;
      ctx.strokeStyle = `rgba(230, 244, 255, ${0.08 + hash01(streak * 7.3) * 0.12})`;
      ctx.lineWidth = 1 + hash01(streak) * 1.2;
      ctx.beginPath();
      ctx.moveTo(30 + hash01(streak * 1.7) * 240, y);
      ctx.quadraticCurveTo(150 + streak * 12, y - 3, 260 + hash01(streak * 5.1) * 180, y + 2);
      ctx.stroke();
    }
    // Sparkling snow crystals.
    for (let crystal = 0; crystal < 34; crystal += 1) {
      const x = 10 + hash01(crystal * 1.9) * (W - 20);
      const y = 344 + hash01(crystal * 4.3) * 92;
      const glow = 0.35 + 0.65 * Math.abs(Math.sin(time * 1.8 + crystal));
      dot(ctx, x, y, 0.6 + hash01(crystal * 8.1) * 0.9, `rgba(255, 255, 255, ${0.3 * glow})`);
    }

    // A trail of footprints wandering from the fence to the cabin door.
    for (let step = 0; step < 9; step += 1) {
      const at = step / 8;
      const x = 120 + at * 104 + Math.sin(at * 6 + 1) * 8;
      const y = 392 - at * 12 + (step % 2 === 0 ? -4 : 4);
      ctx.fillStyle = 'rgba(88, 118, 160, 0.28)';
      ctx.beginPath();
      ctx.ellipse(x, y, 4.6 - at * 1.2, 2.2, step % 2 === 0 ? -0.3 : 0.3, 0, TAU);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.28)';
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.ellipse(x, y - 0.6, 4.6 - at * 1.2, 2.2, step % 2 === 0 ? -0.3 : 0.3, Math.PI, TAU);
      ctx.stroke();
    }

    // Cold haze along the treeline.
    ctx.fillStyle = gradient(ctx, 0, 300, 0, 350, [
      [0, 'rgba(170, 200, 240, 0)'],
      [1, 'rgba(170, 200, 240, 0.12)'],
    ]);
    ctx.fillRect(0, 300, W, 50);
  };

  // --- Props ---------------------------------------------------------------------------------
  props.push({ id: 'moon', type: 'moon', x: 86, y: 66, r: 24, z: 1, s: 1, c: '#eaf2ff' });
  props.push({ id: 'cluster', type: 'cluster', x: 168, y: 44, z: 1.2, s: 1, c: '#d9e6ff', side: 'right' });

  props.push({ id: 'cabin', type: 'cabin', x: 190, y: 380, w: 200, h: 78, peak: 236, z: 4, c: '#3b2a22', a: '#f6c879' });
  props.push({ id: 'chimney', type: 'chimney', x: 348, y: 296, z: 4.4, c: '#5b5f70' });
  props.push({ id: 'smoke', type: 'smoke', x: 352, y: 244, c: '#dfe8f4', z: 4.6 });
  props.push({ id: 'windowA', type: 'window', x: 300, y: 330, w: 26, h: 22, s: 1, z: 4.7, c: '#ffcf7a' });
  props.push({ id: 'windowB', type: 'window', x: 348, y: 330, w: 26, h: 22, s: 1, z: 4.7, c: '#ffcf7a' });
  props.push({ id: 'wreath', type: 'wreath', x: 242, y: 350, s: 1, z: 4.8, c: '#2f7d5c', a: '#e3565b' });
  props.push({ id: 'icicles', type: 'icicles', x: 190, y: 304, w: 200, z: 4.9, c: '#cfe8ff' });
  props.push({ id: 'weathervane', type: 'weathervane', x: 300, y: 238, rot: 0, z: 5.1, c: '#2a2f3c' });

  props.push({ id: 'snowman', type: 'snowman', x: 486, y: 388, s: 1.2, z: 6, c: '#eef6ff', a: '#c1453f' });
  props.push({ id: 'sled', type: 'sled', x: 98, y: 392, s: 1, rot: 0, z: 6.2, c: '#9b3f3a', a: '#d8b57c' });
  props.push({ id: 'skiis', type: 'skiis', x: 398, y: 364, z: 5.8, c: '#c97a3f', a: '#5c6878' });
  props.push({ id: 'lantern', type: 'lantern', x: 422, y: 330, z: 6.4, c: '#ffcf7a' });
  props.push({ id: 'fence', type: 'fence', x0: -6, x1: 158, y: 370, n: 7, z: 6.5, c: '#6b5a4a' });
  props.push({ id: 'pineFront', type: 'pine', x: 34, y: 350, s: 1, z: 6.8, c: '#0d1a24', a: '#dcecff' });
  props.push({ id: 'pineEdge', type: 'pine', x: 546, y: 358, s: 0.78, z: 6.6, c: '#0d1a24', a: '#dcecff' });

  const centres = {
    moon: [86, 66],
    cluster: [168, 44],
    chimney: [348, 268],
    smoke: [352, 232],
    windowA: [300, 330],
    windowB: [348, 330],
    wreath: [242, 350],
    icicles: [290, 308],
    weathervane: [300, 230],
    snowman: [486, 372],
    sled: [98, 388],
    skiis: [398, 356],
    lantern: [422, 300],
    fence: [76, 362],
    pineFront: [34, 310],
    pineEdge: [546, 318],
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
    { prop: 'smoke', op: 'hide', tier: 1, r: 1.2 },
    { prop: 'chimney', op: 'hide', tier: 1, r: 1.1 },
    { prop: 'icicles', op: 'hide', tier: 1, r: 1.15 },
    { prop: 'skiis', op: 'hide', tier: 2, r: 1.2 },
    { prop: 'lantern', op: 'hide', tier: 1, r: 1.15 },
    { prop: 'windowA', op: 'color', value: '#8fd8ff', tier: 2, r: 1.2 },
    { prop: 'windowB', op: 'scale', value: 1.34, tier: 3, r: 1.2 },
    { prop: 'wreath', op: 'color', value: '#7fe8c0', tier: 3, r: 1.15 },
    { prop: 'snowman', op: 'scale', value: 1.24, tier: 2, r: 1.25 },
    { prop: 'snowman', op: 'accent', value: '#3f7dde', tier: 2, r: 1.25 },
    { prop: 'sled', op: 'shift', value: { dx: -18, dy: -7 }, tier: 2, r: 1.2 },
    { prop: 'sled', op: 'rotate', value: 0.34, tier: 3, r: 1.2 },
    { prop: 'fence', op: 'count', value: 10, tier: 3, r: 1.35 },
    { prop: 'weathervane', op: 'rotate', value: 1.25, tier: 3, r: 1.2 },
    { prop: 'weathervane', op: 'hide', tier: 2, r: 1.1 },
    { prop: 'moon', op: 'color', value: '#ffe0a8', tier: 3, r: 1.2 },
    { prop: 'moon', op: 'scale', value: 1.25, tier: 2, r: 1.2 },
    { prop: 'lantern', op: 'color', value: '#8fe8ff', tier: 2, r: 1.15 },
    { prop: 'pineFront', op: 'scale', value: 1.18, tier: 2, r: 1.2 },
  ];

  const ambient = (ctx, time = 0) => {
    // Falling snow, drifting with a slow crosswind. It wraps seamlessly around the frame.
    for (let index = 0; index < 68; index += 1) {
      const speed = 10 + hash01(index * 3.9) * 22;
      const drift = Math.sin(time * 0.55 + index) * 7;
      const x = (hash01(index * 1.7) * (W + 30) + drift + time * 3) % (W + 30) - 15;
      const y = (hash01(index * 5.3) * (H + 20) + time * speed) % (H + 20) - 10;
      const size = 0.7 + hash01(index * 7.7) * 1.8;
      ctx.globalAlpha = 0.25 + hash01(index * 9.1) * 0.45;
      ctx.fillStyle = '#eef7ff';
      ctx.beginPath();
      ctx.arc(x, y, size, 0, TAU);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    // A few larger foreground flakes with a soft halo.
    for (let index = 0; index < 7; index += 1) {
      const x = (hash01(index * 2.3) * (W + 40) + time * (6 + index)) % (W + 40) - 20;
      const y = (hash01(index * 6.1) * (H + 30) + time * (26 + index * 3)) % (H + 30) - 15;
      ctx.fillStyle = 'rgba(235, 246, 255, 0.16)';
      ctx.beginPath();
      ctx.arc(x, y, 4 + hash01(index) * 2.5, 0, TAU);
      ctx.fill();
      dot(ctx, x, y, 1.3 + hash01(index * 4.4), 'rgba(255, 255, 255, 0.75)');
    }
  };

  return {
    key: 'cabin',
    name: 'Alpine Cabin',
    tint: '#8fc8ff',
    props,
    pool,
    backdrop,
    ambient,
    drawProp: drawCabinProp,
  };
}

// --- Prop painters ---------------------------------------------------------------------------

function drawCabinProp(ctx, p, time = 0) {
  switch (p.type) {
    case 'moon': return drawMoon(ctx, p);
    case 'cluster': return drawCluster(ctx, p, time);
    case 'cabin': return drawCabin(ctx, p);
    case 'chimney': return drawChimney(ctx, p);
    case 'smoke': return drawSmoke(ctx, p, time);
    case 'window': return drawWindow(ctx, p);
    case 'wreath': return drawWreath(ctx, p);
    case 'icicles': return drawIcicles(ctx, p, time);
    case 'weathervane': return drawWeathervane(ctx, p);
    case 'snowman': return drawSnowman(ctx, p);
    case 'sled': return drawSled(ctx, p);
    case 'skiis': return drawSkiis(ctx, p);
    case 'lantern': return drawLantern(ctx, p, time);
    case 'fence': return drawFence(ctx, p);
    case 'pine': return drawPine(ctx, p);
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
  ctx.fillStyle = 'rgba(150, 170, 200, 0.24)';
  for (let index = 0; index < 5; index += 1) {
    const angle = hash01(index + 4) * TAU;
    const distance = hash01(index + 7) * r * 0.55;
    ctx.beginPath();
    ctx.arc(
      p.x + Math.cos(angle) * distance,
      p.y + Math.sin(angle) * distance,
      r * (0.08 + hash01(index + 2) * 0.11),
      0,
      TAU,
    );
    ctx.fill();
  }
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.55)';
  ctx.lineWidth = 1.3;
  ctx.beginPath();
  ctx.arc(p.x, p.y, r - 1, Math.PI * 1.05, Math.PI * 1.55);
  ctx.stroke();
  ctx.restore();
}

function drawCluster(ctx, p, time) {
  for (let index = 0; index < 6; index += 1) {
    const x = p.x + (hash01(index * 2.3) - 0.5) * 62;
    const y = p.y + (hash01(index * 5.9) - 0.5) * 34;
    const size = 3 + hash01(index * 4.1) * 4.5;
    const twinkle = 0.55 + 0.45 * Math.sin(time * 2.2 + index * 1.7);
    sparkle(ctx, x, y, size * twinkle + 0.8, index % 3 === 0 ? '#ffe7a8' : p.c, 0.65 + twinkle * 0.3);
  }
}

function drawCabin(ctx, p) {
  const x = p.x;
  const w = p.w;
  const base = p.y;
  const eave = base - p.h;
  const peak = p.peak;
  ctx.save();

  // Warm pool of light on the snow in front of the door.
  ctx.fillStyle = radial(ctx, x + w * 0.42, base + 8, 6, 80, [
    [0, 'rgba(255, 198, 120, 0.22)'],
    [1, 'rgba(255, 198, 120, 0)'],
  ]);
  ctx.fillRect(x - 40, base - 10, w + 80, 56);

  // Stone foundation.
  ctx.fillStyle = '#4a4e5e';
  ctx.fillRect(x + 4, base - 10, w - 8, 10);
  ctx.strokeStyle = 'rgba(20, 22, 30, 0.45)';
  ctx.lineWidth = 1;
  for (let stone = 0; stone < 7; stone += 1) {
    const sx = x + 8 + stone * 26;
    ctx.strokeRect(sx, base - 9, 22, 8);
  }

  // Log walls: layered rounded beams with a soft top highlight.
  ctx.fillStyle = p.c;
  ctx.fillRect(x, eave, w, base - eave);
  for (let row = 0; row < 6; row += 1) {
    const y = eave + row * ((base - eave) / 6);
    ctx.fillStyle = row % 2 === 0 ? '#463127' : '#3d2a22';
    roundRect(ctx, x, y, w, (base - eave) / 6 - 1, 3);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 220, 180, 0.07)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x + 3, y + 1.5);
    ctx.lineTo(x + w - 3, y + 1.5);
    ctx.stroke();
  }
  // Vertical log ends at the corners.
  ctx.fillStyle = '#2c1d18';
  ctx.fillRect(x - 3, eave, 3, base - eave);
  ctx.fillRect(x + w, eave, 3, base - eave);

  // Roof: a dark timber gable under a thick quilt of snow.
  ctx.fillStyle = '#20181a';
  ctx.beginPath();
  ctx.moveTo(x - 18, eave + 4);
  ctx.lineTo(x + w / 2, peak);
  ctx.lineTo(x + w + 18, eave + 4);
  ctx.lineTo(x + w + 10, eave + 12);
  ctx.lineTo(x + w / 2, peak + 12);
  ctx.lineTo(x - 10, eave + 12);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#e9f3ff';
  ctx.beginPath();
  ctx.moveTo(x - 22, eave + 2);
  ctx.lineTo(x + w / 2, peak - 8);
  ctx.lineTo(x + w + 22, eave + 2);
  ctx.quadraticCurveTo(x + w * 0.76, eave + 12, x + w / 2, eave + 5);
  ctx.quadraticCurveTo(x + w * 0.24, eave + 12, x - 22, eave + 2);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = 'rgba(160, 190, 225, 0.5)';
  ctx.beginPath();
  ctx.moveTo(x - 22, eave + 2);
  ctx.quadraticCurveTo(x + w * 0.24, eave + 12, x + w / 2, eave + 5);
  ctx.quadraticCurveTo(x + w * 0.76, eave + 12, x + w + 22, eave + 2);
  ctx.quadraticCurveTo(x + w * 0.7, eave + 17, x + w / 2, eave + 11);
  ctx.quadraticCurveTo(x + w * 0.3, eave + 17, x - 22, eave + 2);
  ctx.closePath();
  ctx.fill();
  // Wind-carved drifts and soft blue shadows on the snow quilt.
  ctx.strokeStyle = 'rgba(150, 180, 218, 0.4)';
  ctx.lineWidth = 1.2;
  for (let drift = 0; drift < 3; drift += 1) {
    ctx.beginPath();
    ctx.moveTo(x - 4 + drift * 14, eave - 3 - drift * 8);
    ctx.quadraticCurveTo(x + w / 2, peak - 16 + drift * 6, x + w + 6 - drift * 16, eave - 4 - drift * 9);
    ctx.stroke();
  }
  ctx.fillStyle = 'rgba(190, 214, 245, 0.55)';
  for (let clump = 0; clump < 5; clump += 1) {
    const cx = x - 6 + clump * (w + 12) / 4;
    ctx.beginPath();
    ctx.ellipse(cx, eave + 3, 10 + hash01(clump * 3.1) * 6, 4, 0, 0, TAU);
    ctx.fill();
  }
  // Ridge highlight.
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.75)';
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(x + w / 2, peak - 8);
  ctx.lineTo(x + w / 2 + 7, peak - 2);
  ctx.stroke();

  // Door with planks, a small window and a warm edge.
  const doorX = x + 34;
  const doorW = 34;
  const doorTop = base - 50;
  ctx.fillStyle = '#241a16';
  ctx.fillRect(doorX, doorTop, doorW, 50);
  ctx.strokeStyle = 'rgba(150, 110, 80, 0.35)';
  ctx.lineWidth = 1;
  for (let plank = 1; plank < 4; plank += 1) {
    ctx.beginPath();
    ctx.moveTo(doorX + (doorW / 4) * plank, doorTop);
    ctx.lineTo(doorX + (doorW / 4) * plank, base);
    ctx.stroke();
  }
  ctx.fillStyle = p.a;
  dot(ctx, doorX + doorW - 7, doorTop + 27, 1.6, p.a);
  ctx.fillStyle = '#3b2d24';
  ctx.fillRect(doorX - 4, doorTop - 4, doorW + 8, 4);
  // Warm light leaking under the door.
  ctx.fillStyle = 'rgba(255, 198, 120, 0.4)';
  ctx.fillRect(doorX + 1, base - 3, doorW - 2, 2);

  // Small porch step.
  ctx.fillStyle = '#5a5148';
  ctx.fillRect(doorX - 7, base, doorW + 14, 4);
  ctx.fillStyle = '#e9f3ff';
  ctx.fillRect(doorX - 7, base - 1, doorW + 14, 2);
  ctx.restore();
}

function drawChimney(ctx, p) {
  ctx.save();
  ctx.fillStyle = '#4c505e';
  roundRect(ctx, p.x - 9, p.y - 26, 18, 30, 2);
  ctx.fill();
  ctx.strokeStyle = 'rgba(20, 22, 30, 0.4)';
  ctx.lineWidth = 1;
  for (let brick = 0; brick < 4; brick += 1) {
    ctx.beginPath();
    ctx.moveTo(p.x - 9, p.y - 24 + brick * 7);
    ctx.lineTo(p.x + 9, p.y - 24 + brick * 7);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(p.x + (brick % 2 ? -3 : 3), p.y - 24 + brick * 7);
    ctx.lineTo(p.x + (brick % 2 ? -3 : 3), p.y - 17 + brick * 7);
    ctx.stroke();
  }
  ctx.fillStyle = '#dbe9fb';
  roundRect(ctx, p.x - 11, p.y - 29, 22, 5, 2);
  ctx.fill();
  ctx.fillStyle = '#1a1b22';
  ctx.fillRect(p.x - 6, p.y - 30, 12, 2);
  ctx.restore();
}

function drawSmoke(ctx, p, time) {
  ctx.save();
  for (let index = 0; index < 7; index += 1) {
    const age = (time * 0.13 + index * 0.14) % 1;
    const rise = age * 104;
    const sway = Math.sin(age * 4.5 + index * 1.3) * (4 + age * 20);
    const radius = 4 + age * 20;
    ctx.fillStyle = `rgba(220, 232, 248, ${(1 - age) * 0.32})`;
    ctx.beginPath();
    ctx.arc(p.x + sway, p.y - rise, radius, 0, TAU);
    ctx.fill();
    ctx.fillStyle = `rgba(255, 246, 232, ${(1 - age) * 0.08})`;
    ctx.beginPath();
    ctx.arc(p.x + sway - radius * 0.3, p.y - rise - radius * 0.3, radius * 0.5, 0, TAU);
    ctx.fill();
  }
  ctx.restore();
}

function drawWindow(ctx, p) {
  const s = p.s ?? 1;
  const w = p.w * s;
  const h = p.h * s;
  const x = p.x - w / 2;
  const y = p.y - h / 2;
  ctx.save();
  // Light thrown onto the snow.
  ctx.fillStyle = radial(ctx, p.x, p.y + 22, 4, 54, [
    [0, withAlpha(p.c, 0.3)],
    [1, withAlpha(p.c, 0)],
  ]);
  ctx.fillRect(p.x - 64, p.y - 20, 128, 100);
  // Frame.
  ctx.fillStyle = '#241a16';
  ctx.fillRect(x - 3, y - 3, w + 6, h + 6);
  // Glass.
  ctx.fillStyle = p.c;
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = 'rgba(255, 255, 230, 0.45)';
  ctx.beginPath();
  ctx.moveTo(x, y + h);
  ctx.lineTo(x + w * 0.55, y);
  ctx.lineTo(x + w, y);
  ctx.lineTo(x + w, y + h * 0.35);
  ctx.lineTo(x + w * 0.35, y + h);
  ctx.closePath();
  ctx.fill();
  // Mullions.
  ctx.strokeStyle = '#2b1d17';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(p.x, y);
  ctx.lineTo(p.x, y + h);
  ctx.moveTo(x, y + h / 2);
  ctx.lineTo(x + w, y + h / 2);
  ctx.stroke();
  // Snowy sill.
  ctx.fillStyle = '#e9f3ff';
  roundRect(ctx, x - 4, y + h, w + 8, 4, 2);
  ctx.fill();
  ctx.restore();
}

function drawWreath(ctx, p) {
  const s = p.s ?? 1;
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.scale(s, s);
  ctx.strokeStyle = p.c;
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.arc(0, 0, 9, 0, TAU);
  ctx.stroke();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(-2, -2, 7, Math.PI * 0.9, Math.PI * 1.5);
  ctx.stroke();
  for (let berry = 0; berry < 5; berry += 1) {
    const angle = (berry / 5) * TAU + 0.4;
    dot(ctx, Math.cos(angle) * 9, Math.sin(angle) * 9, 1.4, p.a);
  }
  ctx.fillStyle = p.a;
  ctx.beginPath();
  ctx.moveTo(-4, 9);
  ctx.lineTo(0, 12);
  ctx.lineTo(4, 9);
  ctx.lineTo(2, 6);
  ctx.lineTo(-2, 6);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawIcicles(ctx, p, time) {
  ctx.save();
  ctx.strokeStyle = 'rgba(30, 40, 55, 0.4)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(p.x - 6, p.y);
  ctx.lineTo(p.x + p.w + 6, p.y);
  ctx.stroke();
  for (let index = 0; index < 12; index += 1) {
    const x = p.x + 8 + index * ((p.w - 16) / 11) + (hash01(index * 3.1) - 0.5) * 8;
    const length = 6 + hash01(index * 5.7) * 17;
    const shimmer = 0.55 + 0.45 * Math.sin(time * 2.2 + index * 1.7);
    ctx.fillStyle = withAlpha(p.c, 0.55 + shimmer * 0.3);
    ctx.beginPath();
    ctx.moveTo(x - 2.2, p.y);
    ctx.lineTo(x + 2.2, p.y);
    ctx.lineTo(x + 0.2, p.y + length);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
    ctx.beginPath();
    ctx.moveTo(x - 0.8, p.y + 1);
    ctx.lineTo(x + 0.2, p.y + 1);
    ctx.lineTo(x + 0.1, p.y + length * 0.7);
    ctx.closePath();
    ctx.fill();
    dot(ctx, x - 0.4, p.y + length * 0.35, 0.7, 'rgba(255, 255, 255, 0.85)');
  }
  ctx.restore();
}

function drawWeathervane(ctx, p) {
  ctx.save();
  ctx.translate(p.x, p.y + 18);
  ctx.strokeStyle = p.c;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(0, -20);
  ctx.stroke();
  ctx.rotate(p.rot ?? 0);
  // Arrow.
  ctx.strokeStyle = '#c9b48a';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-22, -20);
  ctx.lineTo(20, -20);
  ctx.stroke();
  ctx.fillStyle = '#c9b48a';
  ctx.beginPath();
  ctx.moveTo(20, -20);
  ctx.lineTo(14, -24);
  ctx.lineTo(14, -16);
  ctx.closePath();
  ctx.fill();
  // Little rooster silhouette.
  ctx.fillStyle = p.c;
  ctx.beginPath();
  ctx.ellipse(-8, -25, 6, 4.5, -0.2, 0, TAU);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(-13, -29, 3, 0, TAU);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(-15, -31);
  ctx.lineTo(-13, -35);
  ctx.lineTo(-11, -31);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(-3, -25);
  ctx.lineTo(1, -31);
  ctx.lineTo(-1, -23);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawSnowman(ctx, p) {
  const s = p.s ?? 1;
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.scale(s, s);
  // Shadow.
  ctx.fillStyle = 'rgba(70, 100, 140, 0.35)';
  ctx.beginPath();
  ctx.ellipse(2, 5, 30, 6, 0, 0, TAU);
  ctx.fill();
  // Twig arms behind the body.
  ctx.strokeStyle = '#4a3a2e';
  ctx.lineWidth = 1.8;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-13, -34);
  ctx.lineTo(-30, -44);
  ctx.moveTo(-27, -41);
  ctx.lineTo(-31, -48);
  ctx.moveTo(13, -34);
  ctx.lineTo(29, -45);
  ctx.moveTo(26, -42);
  ctx.lineTo(31, -48);
  ctx.stroke();
  // Body.
  ctx.fillStyle = p.c;
  ctx.beginPath();
  ctx.arc(0, -14, 15, 0, TAU);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(0, -32, 11, 0, TAU);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(0, -46, 8, 0, TAU);
  ctx.fill();
  // Shading.
  ctx.fillStyle = 'rgba(150, 180, 215, 0.35)';
  ctx.beginPath();
  ctx.arc(4, -13, 12, 0.2, 2.2);
  ctx.fill();
  // Scarf.
  ctx.fillStyle = p.a;
  ctx.fillRect(-9, -39, 18, 5);
  ctx.beginPath();
  ctx.moveTo(5, -37);
  ctx.lineTo(10, -26);
  ctx.lineTo(6, -24);
  ctx.lineTo(2, -35);
  ctx.closePath();
  ctx.fill();
  // Hat.
  ctx.fillStyle = '#242a36';
  ctx.fillRect(-9, -55, 18, 3);
  ctx.fillRect(-6, -66, 12, 11);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.18)';
  ctx.fillRect(-6, -66, 12, 2);
  // Face and buttons.
  dot(ctx, -3, -48, 1.1, '#22262e');
  dot(ctx, 3, -48, 1.1, '#22262e');
  ctx.fillStyle = '#e58a3f';
  ctx.beginPath();
  ctx.moveTo(0, -45);
  ctx.lineTo(8, -43.5);
  ctx.lineTo(0, -42);
  ctx.closePath();
  ctx.fill();
  dot(ctx, 0, -34, 1, '#2a2e38');
  dot(ctx, 0, -28, 1, '#2a2e38');
  // Snow dusting.
  dot(ctx, -6, -52, 1, 'rgba(255, 255, 255, 0.75)');
  ctx.restore();
}

function drawSled(ctx, p) {
  const s = p.s ?? 1;
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.rotate(p.rot ?? 0);
  ctx.scale(s, s);
  ctx.fillStyle = 'rgba(70, 100, 140, 0.3)';
  ctx.beginPath();
  ctx.ellipse(4, 6, 30, 4.5, 0, 0, TAU);
  ctx.fill();
  // Runners.
  ctx.strokeStyle = p.a;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(-28, 4);
  ctx.lineTo(24, 4);
  ctx.quadraticCurveTo(32, 4, 32, -4);
  ctx.moveTo(-28, 10);
  ctx.lineTo(24, 10);
  ctx.quadraticCurveTo(32, 10, 32, 2);
  ctx.stroke();
  // Slats.
  ctx.fillStyle = p.c;
  for (let slat = 0; slat < 4; slat += 1) {
    ctx.fillRect(-24 + slat * 13, -6, 9, 12);
  }
  ctx.strokeStyle = 'rgba(255, 230, 200, 0.35)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(-24, -5);
  ctx.lineTo(22, -5);
  ctx.stroke();
  // Rope.
  ctx.strokeStyle = '#c9b48a';
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(30, -2);
  ctx.quadraticCurveTo(42, -8, 48, 0);
  ctx.stroke();
  ctx.restore();
}

function drawSkiis(ctx, p) {
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.rotate(-0.16);
  for (let ski = 0; ski < 2; ski += 1) {
    const dx = ski * 7;
    ctx.strokeStyle = ski === 0 ? p.c : '#e4a95e';
    ctx.lineWidth = 3.4;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(dx, 0);
    ctx.lineTo(dx + 2, -52);
    ctx.quadraticCurveTo(dx + 2, -58, dx + 7, -58);
    ctx.stroke();
    ctx.strokeStyle = 'rgba(255, 230, 190, 0.5)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(dx - 0.8, -4);
    ctx.lineTo(dx + 1.2, -50);
    ctx.stroke();
  }
  // Poles.
  ctx.strokeStyle = p.a;
  ctx.lineWidth = 1.4;
  for (let pole = 0; pole < 2; pole += 1) {
    const dx = 16 + pole * 7;
    ctx.beginPath();
    ctx.moveTo(dx, -18);
    ctx.lineTo(dx + 3, -50);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(dx + 3, -51, 2.4, 0, TAU);
    ctx.stroke();
  }
  ctx.restore();
}

function drawLantern(ctx, p, time) {
  const flicker = 0.82 + 0.18 * Math.sin(time * 5.3) * Math.sin(time * 2.1);
  ctx.save();
  // Post.
  ctx.fillStyle = '#1c2028';
  ctx.fillRect(p.x - 2, p.y - 46, 4, 74);
  ctx.strokeStyle = '#1c2028';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(p.x, p.y - 44);
  ctx.quadraticCurveTo(p.x, p.y - 56, p.x + 14, p.y - 56);
  ctx.stroke();
  // Warm cone.
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  const cone = ctx.createLinearGradient(p.x + 16, p.y - 52, p.x + 16, p.y + 30);
  cone.addColorStop(0, withAlpha(p.c, 0.24 * flicker));
  cone.addColorStop(1, withAlpha(p.c, 0));
  ctx.fillStyle = cone;
  ctx.beginPath();
  ctx.moveTo(p.x + 8, p.y - 56);
  ctx.lineTo(p.x + 40, p.y + 28);
  ctx.lineTo(p.x - 10, p.y + 28);
  ctx.lineTo(p.x + 4, p.y - 56);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
  // Lantern.
  ctx.fillStyle = '#262b36';
  roundRect(ctx, p.x + 8, p.y - 58, 13, 15, 3);
  ctx.fill();
  ctx.fillStyle = withAlpha(p.c, 0.92 * flicker);
  roundRect(ctx, p.x + 10, p.y - 56, 9, 10, 2);
  ctx.fill();
  ctx.restore();
}

function drawFence(ctx, p) {
  const n = p.n ?? 7;
  ctx.save();
  // Two rails behind the pickets.
  ctx.strokeStyle = p.c;
  ctx.lineWidth = 2.4;
  for (const offset of [-16, -7]) {
    ctx.beginPath();
    ctx.moveTo(p.x0, p.y + offset + 4);
    ctx.lineTo(p.x1, p.y + offset);
    ctx.stroke();
  }
  for (let index = 0; index < n; index += 1) {
    const at = n === 1 ? 0.5 : index / (n - 1);
    const x = p.x0 + (p.x1 - p.x0) * at;
    const y = p.y + (hash01(index * 3.7) - 0.5) * 3;
    ctx.fillStyle = '#4a3d32';
    ctx.fillRect(x - 2.4, y - 26, 4.8, 30);
    ctx.fillStyle = '#6b5a4a';
    ctx.fillRect(x - 2.4, y - 26, 2, 30);
    // Snow cap.
    ctx.fillStyle = '#e9f3ff';
    roundRect(ctx, x - 3.4, y - 28, 6.8, 3.4, 1.6);
    ctx.fill();
  }
  ctx.restore();
}

function drawPine(ctx, p) {
  const s = p.s ?? 1;
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.scale(s, s);
  // Trunk.
  ctx.fillStyle = '#201812';
  ctx.fillRect(-4, -18, 8, 26);
  for (let tier = 0; tier < 4; tier += 1) {
    const y = -18 - tier * 26;
    const half = 44 - tier * 8;
    ctx.fillStyle = p.c;
    ctx.beginPath();
    ctx.moveTo(0, y - 46);
    ctx.lineTo(half, y);
    ctx.quadraticCurveTo(half * 0.4, y - 6, -half, y);
    ctx.closePath();
    ctx.fill();
    // Snow on the upper branches.
    ctx.fillStyle = withAlpha(p.a, 0.85);
    ctx.beginPath();
    ctx.moveTo(0, y - 46);
    ctx.lineTo(half * 0.72, y - 12);
    ctx.quadraticCurveTo(half * 0.2, y - 18, -half * 0.55, y - 6);
    ctx.quadraticCurveTo(-half * 0.12, y - 20, 0, y - 46);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
}
