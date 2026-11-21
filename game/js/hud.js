// All chrome around the pictures: the header, the two framed canvases, the remaining counter,
// the timer, hint and sound buttons, and the clear/timeout/victory cards. Painting only.

import { COLORS, FONT, PANELS, SCENE, TITLE } from './config.js';
import {
  TAU, clamp, dot, ellipse, gradient, hash01, radial, roundRect, sparkle, starPath, withAlpha,
} from './draw.js';
import { paintPicture } from './scene-render.js';

const HIT = {
  hint: { x: 950, y: 596, w: 158, h: 48 },
  sound: { x: 1126, y: 600, w: 42, h: 42 },
  retry: { x: 1178, y: 600, w: 42, h: 42 },
};

const CARD_BUTTON = { x: 540, y: 506, w: 200, h: 50 };

export function render(ctx, state) {
  drawBackdrop(ctx, state);
  drawHeader(ctx, state);
  drawPictures(ctx, state);
  drawFooter(ctx, state);
  if (state.screen === 'play' && state.time < state.introUntil) drawIntro(ctx, state);
  if (state.screen === 'clear') drawClear(ctx, state);
  if (state.screen === 'timeout') drawTimeout(ctx, state);
  if (state.screen === 'victory') drawVictory(ctx, state);
}

export function hitAction(state, x, y) {
  if (inside(HIT.hint, x, y)) return 'hint';
  if (inside(HIT.sound, x, y)) return 'sound';
  if (inside(HIT.retry, x, y)) return 'retry';
  if (state.screen === 'clear' && inside(CARD_BUTTON, x, y)) return 'next';
  if (state.screen === 'victory' && inside(CARD_BUTTON, x, y)) return 'playAgain';
  if (state.screen === 'timeout' && inside(CARD_BUTTON, x, y)) return 'retry';
  return null;
}

function inside(box, x, y) {
  return x >= box.x && x <= box.x + box.w && y >= box.y && y <= box.y + box.h;
}

/** Which picture, if any, a logical point is over, and its local scene coordinates. */
export function panelAt(x, y) {
  for (let index = 0; index < PANELS.length; index += 1) {
    const panel = PANELS[index];
    if (x >= panel.x && x <= panel.x + SCENE.width && y >= panel.y && y <= panel.y + SCENE.height) {
      return { index, x: x - panel.x, y: y - panel.y };
    }
  }
  return null;
}

function drawBackdrop(ctx, state) {
  ctx.fillStyle = gradient(ctx, 0, 0, 0, 720, [
    [0, '#0a1020'],
    [0.5, '#070b16'],
    [1, '#050810'],
  ]);
  ctx.fillRect(0, 0, 1280, 720);

  // Two huge, soft colour fields tinted by the current scene.
  const tint = state.scene?.tint ?? '#7bdcff';
  ctx.fillStyle = radial(ctx, 220, 40, 20, 420, [
    [0, withAlpha(tint, 0.1)],
    [1, withAlpha(tint, 0)],
  ]);
  ctx.fillRect(0, 0, 700, 500);
  ctx.fillStyle = radial(ctx, 1120, 620, 20, 400, [
    [0, 'rgba(120, 100, 255, 0.07)'],
    [1, 'rgba(120, 100, 255, 0)'],
  ]);
  ctx.fillRect(700, 300, 580, 420);

  // Sparse dust stars, fixed by position so they do not crawl.
  for (let index = 0; index < 34; index += 1) {
    const x = hash01(index * 3.1) * 1280;
    const y = hash01(index * 7.7) * 720;
    dot(ctx, x, y, 0.6 + hash01(index * 1.3) * 1.1, 'rgba(190, 210, 255, 0.14)');
  }

  // A faint grid floor line at the very bottom.
  ctx.strokeStyle = 'rgba(100, 130, 190, 0.06)';
  ctx.lineWidth = 1;
  for (let row = 0; row < 3; row += 1) {
    ctx.beginPath();
    ctx.moveTo(0, 690 + row * 14);
    ctx.lineTo(1280, 690 + row * 14);
    ctx.stroke();
  }
}

function drawHeader(ctx, state) {
  // Brand: a dark plaque with a magnifier catching a sparkle.
  const plaque = { x: 40, y: 22, w: 48, h: 48 };
  const plaqueFill = gradient(ctx, plaque.x, plaque.y, plaque.x + plaque.w, plaque.y + plaque.h, [
    [0, '#f5c96d'],
    [1, '#e08b3c'],
  ]);
  ctx.fillStyle = plaqueFill;
  roundRect(ctx, plaque.x, plaque.y, plaque.w, plaque.h, 13);
  ctx.fill();
  ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
  roundRect(ctx, plaque.x + 3, plaque.y + 3, plaque.w - 6, plaque.h * 0.4, 10);
  ctx.fill();

  ctx.strokeStyle = '#141a2b';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(plaque.x + 21, plaque.y + 21, 10, 0, TAU);
  ctx.stroke();
  ctx.lineWidth = 3.4;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(plaque.x + 28, plaque.y + 28);
  ctx.lineTo(plaque.x + 36, plaque.y + 36);
  ctx.stroke();
  sparkle(ctx, plaque.x + 34, plaque.y + 13, 5, '#141a2b', 0.9);

  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = COLORS.ink;
  ctx.font = `700 25px ${FONT.display}`;
  ctx.fillText(TITLE, 102, 51);
  ctx.fillStyle = COLORS.dim;
  ctx.font = `500 11px ${FONT.ui}`;
  ctx.fillText('A HAND-DRAWN SPOT THE DIFFERENCE', 103, 69);

  // Level chip.
  const level = state.level;
  const chip = { x: 398, y: 20, w: 452, h: 54 };
  ctx.fillStyle = 'rgba(17, 25, 44, 0.72)';
  roundRect(ctx, chip.x, chip.y, chip.w, chip.h, 15);
  ctx.fill();
  ctx.strokeStyle = 'rgba(94, 120, 170, 0.35)';
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.fillStyle = COLORS.gold;
  ctx.font = `700 10px ${FONT.ui}`;
  ctx.fillText(`LEVEL ${state.levelIndex + 1} OF ${state.levels.length}`, chip.x + 18, chip.y + 21);
  ctx.textAlign = 'right';
  ctx.fillStyle = COLORS.dim;
  ctx.font = `500 10px ${FONT.ui}`;
  ctx.fillText(level.note, chip.x + chip.w - 18, chip.y + 21);
  ctx.textAlign = 'left';
  ctx.fillStyle = COLORS.ink;
  ctx.font = `700 22px ${FONT.display}`;
  ctx.fillText(level.name, chip.x + 18, chip.y + 45);

  // Three tiny scene pips at the chip's right edge show progress through the run.
  for (let index = 0; index < state.levels.length; index += 1) {
    const x = chip.x + chip.w - 30 - (state.levels.length - 1 - index) * 15;
    const done = index < state.levelIndex;
    const active = index === state.levelIndex;
    dot(ctx, x, chip.y + 47, 3.2, done ? COLORS.gold : active ? COLORS.cyan : 'rgba(120, 140, 180, 0.35)');
  }

  // Timer block.
  const seconds = Math.max(0, Math.ceil(state.secondsLeft));
  const mm = String(Math.floor(seconds / 60)).padStart(2, '0');
  const ss = String(seconds % 60).padStart(2, '0');
  const danger = seconds <= 15;
  const timerColor = danger ? COLORS.danger : COLORS.ink;

  ctx.textAlign = 'right';
  ctx.fillStyle = COLORS.dim;
  ctx.font = `700 10px ${FONT.ui}`;
  ctx.fillText('TIME LEFT', 1238, 33);
  ctx.fillStyle = timerColor;
  ctx.font = `700 30px ${FONT.ui}`;
  ctx.fillText(`${mm}:${ss}`, 1238, 64);
  ctx.textAlign = 'left';

  // A clock ring whose arc drains.
  const clockX = 963;
  const clockY = 52;
  const fraction = clamp(state.secondsLeft / (level.seconds || 1), 0, 1);
  ctx.strokeStyle = 'rgba(110, 135, 180, 0.22)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(clockX, clockY, 12, 0, TAU);
  ctx.stroke();
  ctx.strokeStyle = danger ? COLORS.danger : COLORS.cyan;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(clockX, clockY, 12, -Math.PI / 2, -Math.PI / 2 + fraction * TAU);
  ctx.stroke();
  ctx.strokeStyle = timerColor;
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.moveTo(clockX, clockY);
  ctx.lineTo(clockX, clockY - 6);
  ctx.moveTo(clockX, clockY);
  ctx.lineTo(clockX + 4, clockY + 2);
  ctx.stroke();

  // Timer bar under the number.
  ctx.fillStyle = 'rgba(90, 110, 150, 0.24)';
  roundRect(ctx, 1002, 74, 236, 5, 3);
  ctx.fill();
  if (fraction > 0) {
    ctx.fillStyle = danger ? COLORS.danger : withAlpha(COLORS.cyan, 0.85);
    roundRect(ctx, 1002, 74, 236 * fraction, 5, 3);
    ctx.fill();
  }

  // Header rule.
  ctx.strokeStyle = 'rgba(110, 135, 180, 0.14)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(40, 92.5);
  ctx.lineTo(1240, 92.5);
  ctx.stroke();
}

function drawPictures(ctx, state) {
  const shakeX = state.shake > 0 ? Math.sin(state.time * 62) * state.shake : 0;
  const shakeY = state.shake > 0 ? Math.cos(state.time * 51) * state.shake * 0.55 : 0;

  // A magnifier floating between the pictures.
  ctx.save();
  ctx.globalAlpha = 0.5;
  ctx.strokeStyle = 'rgba(255, 207, 107, 0.35)';
  ctx.lineWidth = 1;
  ctx.setLineDash([3, 6]);
  ctx.beginPath();
  ctx.moveTo(640, 180);
  ctx.lineTo(640, 530);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.strokeStyle = '#e8b45d';
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.arc(640, 350, 13, 0, TAU);
  ctx.stroke();
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(649, 359);
  ctx.lineTo(658, 368);
  ctx.stroke();
  sparkle(ctx, 651, 338, 5, '#ffd98a', 0.8);
  ctx.restore();

  for (let index = 0; index < PANELS.length; index += 1) {
    const panel = PANELS[index];
    const x = panel.x + shakeX;
    const y = panel.y + shakeY;

    // The label above each picture.
    ctx.textAlign = 'left';
    ctx.fillStyle = index === 0 ? COLORS.dim : COLORS.gold;
    ctx.font = `700 10px ${FONT.ui}`;
    ctx.fillText(index === 0 ? 'PICTURE A' : 'PICTURE B', panel.x + 2, 128);
    ctx.fillStyle = index === 0 ? 'rgba(123, 220, 255, 0.5)' : 'rgba(255, 207, 107, 0.5)';
    dot(ctx, panel.x + 74, 124, 3, index === 0 ? 'rgba(123, 220, 255, 0.5)' : 'rgba(255, 207, 107, 0.5)');
    ctx.textAlign = 'right';
    ctx.fillStyle = 'rgba(140, 158, 190, 0.55)';
    ctx.font = `500 10px ${FONT.ui}`;
    ctx.fillText(index === 0 ? 'spot it here or in B' : 'changed copy', panel.x + SCENE.width, 128);
    ctx.textAlign = 'left';

    // Frame: a dark seat, then the painted scene.
    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = 24;
    ctx.shadowOffsetY = 8;
    ctx.fillStyle = '#111a2c';
    roundRect(ctx, x - 4, y - 4, SCENE.width + 8, SCENE.height + 8, 13);
    ctx.fill();
    ctx.restore();

    ctx.save();
    ctx.translate(x, y);
    paintPicture(ctx, state.scene, index === 0 ? state.variants.left : state.variants.right, {
      differences: state.differences,
      time: state.time,
      hint: state.hintTarget,
      wrongs: state.wrongs.filter((wrong) => wrong.panel === index),
    });
    ctx.restore();

    // Inner edge highlight.
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    roundRect(ctx, x + 0.5, y + 0.5, SCENE.width - 1, SCENE.height - 1, 10);
    ctx.stroke();
  }
}

function drawFooter(ctx, state) {
  const found = state.differences.filter((difference) => difference.found).length;
  const remaining = state.differences.length - found;
  const card = { x: 40, y: 594, w: 1200, h: 104 };
  ctx.fillStyle = 'rgba(13, 21, 38, 0.7)';
  roundRect(ctx, card.x, card.y, card.w, card.h, 16);
  ctx.fill();
  ctx.strokeStyle = 'rgba(94, 120, 170, 0.28)';
  ctx.lineWidth = 1;
  ctx.stroke();

  // Score.
  ctx.textAlign = 'left';
  ctx.fillStyle = COLORS.dim;
  ctx.font = `700 9px ${FONT.ui}`;
  ctx.fillText('SCORE', 66, 618);
  ctx.fillStyle = COLORS.ink;
  ctx.font = `700 27px ${FONT.ui}`;
  ctx.fillText(state.score.toLocaleString('en-US'), 66, 646);
  // Find credit line.
  ctx.fillStyle = 'rgba(140, 158, 190, 0.7)';
  ctx.font = `500 10px ${FONT.ui}`;
  ctx.fillText(`${state.scoreFinds} found · ${state.wrongCount} missed clicks`, 66, 666);

  // Remaining counter.
  const counterX = 430;
  ctx.fillStyle = COLORS.dim;
  ctx.font = `700 9px ${FONT.ui}`;
  ctx.textAlign = 'left';
  ctx.fillText('DIFFERENCES LEFT', counterX, 616);
  const counterText = remaining === 0 ? 'ALL FOUND' : `FIND ${remaining} MORE`;
  const pulse = state.findPulse > 0 ? 1 + state.findPulse * 0.08 : 1;
  ctx.save();
  ctx.translate(counterX, 646);
  ctx.scale(pulse, pulse);
  ctx.fillStyle = remaining === 0 ? COLORS.found : COLORS.gold;
  ctx.font = `700 30px ${FONT.display}`;
  ctx.fillText(counterText, 0, 0);
  ctx.restore();

  // One pip per difference, filled from the left as finds come in.
  for (let index = 0; index < state.differences.length; index += 1) {
    const done = index < found;
    const x = counterX + 9 + index * 24;
    if (done) {
      ctx.fillStyle = COLORS.found;
      ctx.beginPath();
      ctx.arc(x, 662, 7.5, 0, TAU);
      ctx.fill();
      ctx.strokeStyle = '#062018';
      ctx.lineWidth = 1.7;
      ctx.beginPath();
      ctx.moveTo(x - 3.2, 662);
      ctx.lineTo(x - 0.8, 664.6);
      ctx.lineTo(x + 3.4, 659.4);
      ctx.stroke();
    } else {
      ctx.strokeStyle = 'rgba(255, 207, 107, 0.45)';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.arc(x, 662, 7, 0, TAU);
      ctx.stroke();
      dot(ctx, x, 662, 2, 'rgba(255, 207, 107, 0.3)');
    }
  }

  // Instructions.
  ctx.fillStyle = 'rgba(160, 178, 208, 0.75)';
  ctx.font = `500 12px ${FONT.ui}`;
  ctx.textAlign = 'center';
  ctx.fillText('Click a difference in either picture  ·  wrong clicks cost 3 seconds  ·  H for a hint', 640, 689);

  // Hint button.
  drawHintButton(ctx, state);

  // Sound and retry chips.
  drawRoundButton(ctx, HIT.sound, state.soundOn ? 'sound' : 'muted');
  drawRoundButton(ctx, HIT.retry, 'retry');
  ctx.textAlign = 'left';
}

function drawHintButton(ctx, state) {
  const box = HIT.hint;
  const enabled = state.hints > 0 && state.screen === 'play';
  const flash = state.hintPulse > 0 ? state.hintPulse : 0;
  ctx.save();
  ctx.fillStyle = enabled ? withAlpha(COLORS.gold, 0.15 + flash * 0.1) : 'rgba(70, 84, 112, 0.18)';
  roundRect(ctx, box.x, box.y, box.w, box.h, 13);
  ctx.fill();
  ctx.strokeStyle = enabled ? withAlpha(COLORS.gold, 0.7) : 'rgba(110, 130, 165, 0.3)';
  ctx.lineWidth = 1.4;
  ctx.stroke();

  // Lightbulb.
  const iconX = box.x + 27;
  const iconY = box.y + box.h / 2;
  ctx.strokeStyle = enabled ? COLORS.gold : 'rgba(130, 150, 180, 0.5)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(iconX, iconY - 4, 7.5, Math.PI * 0.85, Math.PI * 0.15, false);
  ctx.lineTo(iconX + 6, iconY + 5);
  ctx.lineTo(iconX - 6, iconY + 5);
  ctx.closePath();
  ctx.stroke();
  ctx.fillStyle = enabled ? COLORS.gold : 'rgba(130, 150, 180, 0.5)';
  ctx.fillRect(iconX - 3, iconY + 6, 6, 3);
  if (enabled) {
    ctx.strokeStyle = withAlpha(COLORS.gold, 0.55);
    ctx.lineWidth = 1.2;
    for (let ray = 0; ray < 3; ray += 1) {
      const angle = -Math.PI / 2 + (ray - 1) * 0.55;
      ctx.beginPath();
      ctx.moveTo(iconX + Math.cos(angle) * 12, iconY - 4 + Math.sin(angle) * 12);
      ctx.lineTo(iconX + Math.cos(angle) * 16, iconY - 4 + Math.sin(angle) * 16);
      ctx.stroke();
    }
  }

  ctx.textAlign = 'left';
  ctx.fillStyle = enabled ? COLORS.gold : 'rgba(140, 158, 190, 0.55)';
  ctx.font = `700 12px ${FONT.ui}`;
  ctx.fillText('HINT', box.x + 47, box.y + 21);
  ctx.fillStyle = enabled ? 'rgba(255, 235, 190, 0.85)' : 'rgba(130, 150, 180, 0.5)';
  ctx.font = `600 10px ${FONT.ui}`;
  ctx.fillText(`${state.hints} left  ·  -40 pts`, box.x + 47, box.y + 35);
  ctx.textAlign = 'right';
  ctx.fillStyle = enabled ? 'rgba(255, 235, 190, 0.5)' : 'rgba(130, 150, 180, 0.35)';
  ctx.font = `700 10px ${FONT.ui}`;
  ctx.fillText('H', box.x + box.w - 12, box.y + 21);
  ctx.textAlign = 'left';
  ctx.restore();
}

function drawRoundButton(ctx, box, kind) {
  ctx.save();
  ctx.fillStyle = 'rgba(30, 42, 66, 0.7)';
  ctx.beginPath();
  ctx.arc(box.x + box.w / 2, box.y + box.h / 2, box.w / 2, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = 'rgba(110, 130, 170, 0.35)';
  ctx.lineWidth = 1.2;
  ctx.stroke();
  const cx = box.x + box.w / 2;
  const cy = box.y + box.h / 2;

  ctx.strokeStyle = 'rgba(220, 232, 255, 0.8)';
  ctx.fillStyle = 'rgba(220, 232, 255, 0.8)';
  ctx.lineWidth = 1.8;
  if (kind === 'sound') {
    ctx.beginPath();
    ctx.moveTo(cx - 8, cy - 2);
    ctx.lineTo(cx - 4, cy - 2);
    ctx.lineTo(cx + 1, cy - 6);
    ctx.lineTo(cx + 1, cy + 6);
    ctx.lineTo(cx - 4, cy + 2);
    ctx.lineTo(cx - 8, cy + 2);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cx + 2, cy, 6, -0.8, 0.8);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cx + 2, cy, 9.5, -0.7, 0.7);
    ctx.stroke();
  } else if (kind === 'muted') {
    ctx.beginPath();
    ctx.moveTo(cx - 8, cy - 2);
    ctx.lineTo(cx - 4, cy - 2);
    ctx.lineTo(cx + 1, cy - 6);
    ctx.lineTo(cx + 1, cy + 6);
    ctx.lineTo(cx - 4, cy + 2);
    ctx.lineTo(cx - 8, cy + 2);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = COLORS.danger;
    ctx.beginPath();
    ctx.moveTo(cx + 4, cy - 4);
    ctx.lineTo(cx + 10, cy + 4);
    ctx.moveTo(cx + 10, cy - 4);
    ctx.lineTo(cx + 4, cy + 4);
    ctx.stroke();
  } else {
    // Retry arrow.
    ctx.beginPath();
    ctx.arc(cx, cy, 8, -0.35, Math.PI * 1.45);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx + 4, cy - 10);
    ctx.lineTo(cx + 10, cy - 7);
    ctx.lineTo(cx + 5, cy - 2);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
}

function drawIntro(ctx, state) {
  const age = state.time - (state.introUntil - 1.7);
  const fadeIn = clamp(age / 0.3, 0, 1);
  const fadeOut = clamp((state.introUntil - state.time) / 0.4, 0, 1);
  const alpha = Math.min(fadeIn, fadeOut);
  ctx.save();
  ctx.globalAlpha = alpha;
  const width = 470;
  const x = 640 - width / 2;
  const y = 178;
  ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
  ctx.shadowBlur = 25;
  ctx.fillStyle = 'rgba(9, 15, 28, 0.92)';
  roundRect(ctx, x, y, width, 74, 18);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.strokeStyle = withAlpha(COLORS.gold, 0.65);
  ctx.lineWidth = 1.4;
  ctx.stroke();
  ctx.fillStyle = COLORS.gold;
  ctx.font = `700 10px ${FONT.ui}`;
  ctx.textAlign = 'center';
  ctx.fillText(`LEVEL ${state.levelIndex + 1}`, 640, y + 24);
  ctx.fillStyle = COLORS.ink;
  ctx.font = `700 25px ${FONT.display}`;
  ctx.fillText(state.level.name, 640, y + 50);
  ctx.fillStyle = COLORS.dim;
  ctx.font = `500 11px ${FONT.ui}`;
  ctx.fillText(`Find ${state.differences.length} differences`, 640, y + 65);
  ctx.textAlign = 'left';
  ctx.restore();
}

function drawClear(ctx, state) {
  ctx.fillStyle = 'rgba(4, 8, 17, 0.55)';
  ctx.fillRect(0, 0, 1280, 720);

  const card = { x: 370, y: 170, w: 540, h: 400 };
  softCard(ctx, card);
  ctx.textAlign = 'center';

  // Crown of sparkles.
  for (let index = 0; index < 7; index += 1) {
    const angle = -Math.PI / 2 + (index - 3) * 0.26;
    sparkle(
      ctx,
      640 + Math.cos(angle) * 168,
      card.y + 52 + Math.sin(angle) * 30,
      6 + (index % 3) * 2,
      index % 2 ? COLORS.gold : COLORS.found,
      0.75,
    );
  }

  ctx.fillStyle = COLORS.gold;
  ctx.font = `700 10px ${FONT.ui}`;
  ctx.fillText(`LEVEL ${state.levelIndex + 1} OF ${state.levels.length}`, 640, card.y + 42);
  ctx.fillStyle = COLORS.ink;
  ctx.font = `700 40px ${FONT.display}`;
  ctx.fillText('LEVEL CLEAR', 640, card.y + 86);
  ctx.fillStyle = COLORS.dim;
  ctx.font = `500 12px ${FONT.ui}`;
  ctx.fillText(`All ${state.differences.length} differences found in ${state.level.name}`, 640, card.y + 110);

  // Stats.
  const rows = [
    ['Find bonus', `+${state.clear.finds * 120}`],
    ['Time bonus', `+${state.clear.timeBonus}`],
    ['Level bonus', `+250`],
  ];
  for (let index = 0; index < rows.length; index += 1) {
    const y = card.y + 150 + index * 30;
    ctx.textAlign = 'left';
    ctx.fillStyle = COLORS.dim;
    ctx.font = `500 12px ${FONT.ui}`;
    ctx.fillText(rows[index][0], card.x + 100, y);
    ctx.textAlign = 'right';
    ctx.fillStyle = COLORS.ink;
    ctx.font = `700 13px ${FONT.ui}`;
    ctx.fillText(rows[index][1], card.x + card.w - 100, y);
  }
  ctx.strokeStyle = 'rgba(120, 140, 180, 0.2)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(card.x + 100, card.y + 216);
  ctx.lineTo(card.x + card.w - 100, card.y + 216);
  ctx.stroke();
  ctx.textAlign = 'left';
  ctx.fillStyle = COLORS.dim;
  ctx.font = `600 12px ${FONT.ui}`;
  ctx.fillText('SCORE', card.x + 100, card.y + 244);
  ctx.textAlign = 'right';
  ctx.fillStyle = COLORS.gold;
  ctx.font = `700 22px ${FONT.ui}`;
  ctx.fillText(state.score.toLocaleString('en-US'), card.x + card.w - 100, card.y + 246);

  // Auto-advance bar.
  const remaining = clamp(1 - (state.time - state.clear.at) / state.clear.hold, 0, 1);
  ctx.fillStyle = 'rgba(90, 110, 150, 0.28)';
  roundRect(ctx, card.x + 100, card.y + 314, card.w - 200, 5, 3);
  ctx.fill();
  ctx.fillStyle = COLORS.found;
  roundRect(ctx, card.x + 100, card.y + 314, (card.w - 200) * remaining, 5, 3);
  ctx.fill();
  if (state.levelIndex < state.levels.length - 1) {
    cardButton(ctx, 'NEXT PICTURE', false);
  } else {
    cardButton(ctx, 'SEE THE RESULTS', false);
  }
  ctx.textAlign = 'left';
}

function drawTimeout(ctx, state) {
  ctx.fillStyle = 'rgba(4, 8, 17, 0.6)';
  ctx.fillRect(0, 0, 1280, 720);
  const card = { x: 400, y: 196, w: 480, h: 380 };
  softCard(ctx, card);
  ctx.textAlign = 'center';
  ctx.fillStyle = COLORS.danger;
  ctx.font = `700 10px ${FONT.ui}`;
  ctx.fillText('THE CLOCK RAN OUT', 640, card.y + 46);
  ctx.fillStyle = COLORS.ink;
  ctx.font = `700 38px ${FONT.display}`;
  ctx.fillText("TIME'S UP", 640, card.y + 90);
  const remaining = state.differences.filter((difference) => !difference.found).length;
  ctx.fillStyle = COLORS.dim;
  ctx.font = `500 12px ${FONT.ui}`;
  ctx.fillText(`${remaining} difference${remaining === 1 ? '' : 's'} still hiding in ${state.level.name}`, 640, card.y + 116);
  ctx.fillStyle = COLORS.ink;
  ctx.font = `700 30px ${FONT.ui}`;
  ctx.fillText(state.score.toLocaleString('en-US'), 640, card.y + 166);
  ctx.fillStyle = COLORS.dim;
  ctx.font = `600 10px ${FONT.ui}`;
  ctx.fillText('SCORE', 640, card.y + 184);
  cardButton(ctx, 'TRY AGAIN', false);
  ctx.textAlign = 'left';
}

function drawVictory(ctx, state) {
  // Confetti in the scene's colours.
  for (let index = 0; index < 46; index += 1) {
    const x = hash01(index * 1.7) * 1280;
    const y = hash01(index * 3.1) * 720;
    const sway = Math.sin(state.time * 1.4 + index) * 12;
    const colors = [COLORS.gold, COLORS.found, COLORS.cyan, '#ff9db5'];
    ctx.save();
    ctx.translate(x + sway, y);
    ctx.rotate(state.time * 0.8 + index);
    ctx.fillStyle = withAlpha(colors[index % colors.length], 0.7);
    ctx.fillRect(-3, -1.5, 6, 3);
    ctx.restore();
  }
  ctx.fillStyle = 'rgba(4, 8, 17, 0.62)';
  ctx.fillRect(0, 0, 1280, 720);
  const card = { x: 340, y: 140, w: 600, h: 440 };
  softCard(ctx, card);
  ctx.textAlign = 'center';

  for (let index = 0; index < 9; index += 1) {
    const angle = -Math.PI / 2 + (index - 4) * 0.22;
    sparkle(
      ctx,
      640 + Math.cos(angle) * 210,
      card.y + 50 + Math.sin(angle) * 34,
      6 + (index % 3) * 2.5,
      index % 2 ? COLORS.gold : COLORS.cyan,
      0.85,
    );
  }

  ctx.fillStyle = COLORS.gold;
  ctx.font = `700 10px ${FONT.ui}`;
  ctx.fillText('ALL THREE PICTURES CLEARED', 640, card.y + 40);
  ctx.fillStyle = COLORS.ink;
  ctx.font = `700 42px ${FONT.display}`;
  ctx.fillText('QUEST COMPLETE', 640, card.y + 86);
  ctx.fillStyle = COLORS.dim;
  ctx.font = `500 12px ${FONT.ui}`;
  ctx.fillText('Every changed detail found. The harbor, the cove and the outpost are spotless.', 640, card.y + 112);

  ctx.fillStyle = COLORS.ink;
  ctx.font = `700 54px ${FONT.ui}`;
  ctx.fillText(state.score.toLocaleString('en-US'), 640, card.y + 178);
  ctx.fillStyle = COLORS.dim;
  ctx.font = `600 10px ${FONT.ui}`;
  ctx.fillText('FINAL SCORE', 640, card.y + 198);

  // Per-level rows.
  for (let index = 0; index < state.results.length; index += 1) {
    const row = state.results[index];
    const y = card.y + 234 + index * 28;
    ctx.textAlign = 'left';
    ctx.fillStyle = COLORS.dim;
    ctx.font = `500 11px ${FONT.ui}`;
    ctx.fillText(`${index + 1}. ${row.name}`, card.x + 120, y);
    ctx.textAlign = 'right';
    ctx.fillStyle = index === 2 ? COLORS.found : COLORS.ink;
    ctx.font = `700 12px ${FONT.ui}`;
    ctx.fillText(`${row.score.toLocaleString('en-US')} pts`, card.x + card.w - 120, y);
  }

  cardButton(ctx, 'PLAY AGAIN', false);
  ctx.textAlign = 'left';
}

function softCard(ctx, card) {
  ctx.save();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
  ctx.shadowBlur = 40;
  ctx.fillStyle = 'rgba(11, 18, 33, 0.97)';
  roundRect(ctx, card.x, card.y, card.w, card.h, 24);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.strokeStyle = withAlpha(COLORS.gold, 0.4);
  ctx.lineWidth = 1.4;
  ctx.stroke();
  ctx.fillStyle = gradient(ctx, card.x, card.y, card.x, card.y + card.h, [
    [0, 'rgba(255, 207, 107, 0.07)'],
    [1, 'rgba(255, 207, 107, 0)'],
  ]);
  roundRect(ctx, card.x, card.y, card.w, card.h, 24);
  ctx.fill();
  ctx.restore();
}

function cardButton(ctx, label, primary) {
  const box = CARD_BUTTON;
  ctx.save();
  ctx.fillStyle = primary ? COLORS.gold : withAlpha(COLORS.gold, 0.14);
  roundRect(ctx, box.x, box.y, box.w, box.h, 13);
  ctx.fill();
  ctx.strokeStyle = withAlpha(COLORS.gold, 0.7);
  ctx.lineWidth = 1.4;
  ctx.stroke();
  ctx.fillStyle = primary ? '#1a1206' : COLORS.gold;
  ctx.font = `700 12px ${FONT.ui}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, box.x + box.w / 2, box.y + box.h / 2 + 1);
  ctx.textBaseline = 'alphabetic';
  ctx.textAlign = 'left';
  ctx.restore();
}
