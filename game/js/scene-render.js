// Painting one picture: the scene's own background, animated props and ambient layer, then the
// marks the player has earned — found rings, the sparkle burst, the hint pulse and wrong-click
// ripples. Both pictures receive the same clock, so ambient motion stays identical. The game
// logic never draws; this module never changes state.

import { TAU, hash01, radial, roundRect, sparkle, withAlpha } from './draw.js';
import { SCENE } from './config.js';

const W = SCENE.width;
const H = SCENE.height;

export function paintPicture(ctx, scene, props, picture) {
  ctx.save();
  roundRect(ctx, 0, 0, W, H, 10);
  ctx.clip();

  scene.backdrop(ctx, picture.time);
  for (const prop of props) scene.drawProp(ctx, prop, picture.time);
  if (scene.ambient) scene.ambient(ctx, picture.time);

  // Fine film grain, identical in both pictures, ties every scene to one hand-made look.
  for (let index = 0; index < 90; index += 1) {
    const x = hash01(index * 4.7) * W;
    const y = hash01(index * 9.3) * H;
    const alpha = 0.018 + hash01(index * 2.9) * 0.032;
    ctx.fillStyle = `rgba(255, 244, 220, ${alpha})`;
    ctx.fillRect(x, y, 1.2, 1.2);
  }

  // A soft vignette settles the artwork into its frame.
  ctx.fillStyle = radial(ctx, W / 2, H / 2, H * 0.34, W * 0.72, [
    [0, 'rgba(0, 0, 0, 0)'],
    [0.78, 'rgba(0, 0, 0, 0.06)'],
    [1, 'rgba(0, 0, 0, 0.32)'],
  ]);
  ctx.fillRect(0, 0, W, H);

  // Marks sit above the artwork but below nothing else.
  for (let index = 0; index < picture.differences.length; index += 1) {
    const difference = picture.differences[index];
    if (difference.found) drawFoundRing(ctx, difference, index, picture.time);
  }

  if (picture.hint && !picture.hint.found) drawHintRing(ctx, picture.hint, picture.time);

  for (const wrong of picture.wrongs) {
    drawWrongRipple(ctx, wrong, picture.time);
  }

  ctx.restore();
}

function drawFoundRing(ctx, difference, index, time) {
  const age = Math.max(0, time - difference.foundAt);
  const pop = age < 0.45 ? 1 + Math.sin(age * 11) * 0.18 * (1 - age / 0.45) : 1;
  const radius = 25 * pop;

  ctx.save();
  ctx.translate(difference.x, difference.y);

  // A dark seat so the ring reads over bright coral or pale metal.
  ctx.fillStyle = 'rgba(4, 12, 20, 0.34)';
  ctx.beginPath();
  ctx.arc(0, 0, radius - 2, 0, TAU);
  ctx.fill();

  // Outer glow and ring.
  ctx.shadowColor = 'rgba(95, 242, 194, 0.85)';
  ctx.shadowBlur = 14;
  ctx.strokeStyle = '#5ff2c2';
  ctx.lineWidth = 3.2;
  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, TAU);
  ctx.stroke();
  ctx.shadowBlur = 0;

  // Thin second ring gives the badge a target feel.
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.55)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(0, 0, radius - 5, 0, TAU);
  ctx.stroke();

  // Number badge.
  ctx.fillStyle = '#062018';
  ctx.beginPath();
  ctx.arc(0, 0, 11, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = 'rgba(95, 242, 194, 0.8)';
  ctx.lineWidth = 1.4;
  ctx.stroke();
  ctx.fillStyle = '#eafff8';
  ctx.font = '700 13px "Trebuchet MS", "Segoe UI", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(String(difference.order ?? index + 1), 0, 1);

  // Burst: a shockwave ring, fourteen sparks in two colours and four twinkles, fading over
  // the first 0.9 s. The angles are seeded from the find, so a still frame always looks alive.
  if (age < 0.9) {
    const fade = 1 - age / 0.9;
    ctx.globalAlpha = fade * 0.8;
    ctx.strokeStyle = '#a7ffe1';
    ctx.lineWidth = 2.4 * fade + 0.4;
    ctx.beginPath();
    ctx.arc(0, 0, 26 + age * 70, 0, TAU);
    ctx.stroke();
    for (let spark = 0; spark < 14; spark += 1) {
      const angle = (spark / 14) * TAU + difference.x * 0.017;
      const distance = 22 + age * (54 + (spark % 4) * 12);
      const size = (2.4 + (spark % 3) * 1.6) * fade;
      const curl = Math.sin(age * 8 + spark) * 4;
      ctx.globalAlpha = fade;
      ctx.fillStyle = spark % 3 === 0 ? '#ffd98a' : spark % 3 === 1 ? '#c9fff0' : '#8be6ff';
      ctx.beginPath();
      ctx.arc(
        Math.cos(angle) * distance + curl,
        Math.sin(angle) * distance + curl,
        Math.max(0.2, size),
        0,
        TAU,
      );
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    sparkle(ctx, 0, 0, 30 + age * 52, '#eafff6', fade * 0.95);
    sparkle(ctx, 0, 0, 18 + age * 30, '#ffd98a', fade * 0.7);
  }

  // A settled twinkle keeps found marks alive without distracting.
  const pulse = 0.5 + 0.5 * Math.sin(time * 2.4 + index * 1.7);
  sparkle(ctx, radius * 0.72, -radius * 0.72, 4 + pulse * 1.6, '#ffd98a', 0.55 + pulse * 0.3);
  ctx.restore();
}

function drawHintRing(ctx, difference, time) {
  const pulse = 0.5 + 0.5 * Math.sin(time * 6.2);
  const radius = 28 + pulse * 5;
  ctx.save();
  ctx.translate(difference.x, difference.y);
  ctx.strokeStyle = withAlpha('#ffd166', 0.55 + pulse * 0.4);
  ctx.lineWidth = 2.4;
  ctx.setLineDash([5, 6]);
  ctx.lineDashOffset = -time * 22;
  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, TAU);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.fillStyle = withAlpha('#ffd166', 0.1 + pulse * 0.08);
  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, TAU);
  ctx.fill();

  // A small tag makes the hint unmistakable in motion and in a still frame.
  const tagY = Math.max(-radius - 22, -difference.y + 9);
  ctx.font = '700 9px "Trebuchet MS", "Segoe UI", sans-serif';
  const tagWidth = 38;
  ctx.fillStyle = 'rgba(24, 18, 6, 0.82)';
  roundRect(ctx, -tagWidth / 2, tagY, tagWidth, 15, 7);
  ctx.fill();
  ctx.strokeStyle = withAlpha('#ffd166', 0.7);
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.fillStyle = '#ffe7a8';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('HINT', 0, tagY + 8);

  for (let index = 0; index < 4; index += 1) {
    const angle = time * 1.4 + (index / 4) * TAU;
    sparkle(
      ctx,
      Math.cos(angle) * (radius + 4),
      Math.sin(angle) * (radius + 4),
      4,
      '#ffe7a8',
      0.7,
    );
  }
  ctx.restore();
}

function drawWrongRipple(ctx, wrong, time) {
  const age = time - wrong.at;
  if (age > 0.7) return;
  const fade = 1 - age / 0.7;
  ctx.save();
  ctx.translate(wrong.x, wrong.y);
  ctx.strokeStyle = `rgba(255, 107, 122, ${fade * 0.9})`;
  ctx.lineWidth = 2.6;
  ctx.beginPath();
  ctx.arc(0, 0, 8 + age * 42, 0, TAU);
  ctx.stroke();
  ctx.strokeStyle = `rgba(255, 180, 188, ${fade})`;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-7, -7);
  ctx.lineTo(7, 7);
  ctx.moveTo(7, -7);
  ctx.lineTo(-7, 7);
  ctx.stroke();
  ctx.restore();
}

/** Draw a soft highlight across a panel's top edge, used only by the HUD frame. */
export function paintGlass(ctx, w, h) {
  const sheen = ctx.createLinearGradient(0, 0, w * 0.9, h * 0.6);
  sheen.addColorStop(0, 'rgba(255, 255, 255, 0.055)');
  sheen.addColorStop(0.35, 'rgba(255, 255, 255, 0)');
  sheen.addColorStop(1, 'rgba(255, 255, 255, 0.02)');
  ctx.fillStyle = sheen;
  ctx.fillRect(0, 0, w, h);
}

/** Deterministic little confetti pieces for the clear screen, keyed by index. */
export function confettiPiece(index) {
  return {
    x: hash01(index * 1.7) * 1200,
    y: hash01(index * 3.1) * 700,
    size: 3 + hash01(index * 5.3) * 6,
    hue: Math.floor(hash01(index * 7.9) * 4),
  };
}
