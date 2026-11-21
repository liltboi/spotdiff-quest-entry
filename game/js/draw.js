// Shared canvas drawing primitives. No game rules live here: just shapes, gradients and glow
// helpers the three scene painters and the HUD all use.

export const TAU = Math.PI * 2;

export function clamp(value, low, high) {
  return value < low ? low : value > high ? high : value;
}

export function lerp(a, b, t) {
  return a + (b - a) * t;
}

export function gradient(ctx, x0, y0, x1, y1, stops) {
  const fill = ctx.createLinearGradient(x0, y0, x1, y1);
  for (const [at, color] of stops) fill.addColorStop(at, color);
  return fill;
}

export function radial(ctx, x, y, r0, r1, stops) {
  const fill = ctx.createRadialGradient(x, y, r0, x, y, r1);
  for (const [at, color] of stops) fill.addColorStop(at, color);
  return fill;
}

export function roundRect(ctx, x, y, w, h, radius) {
  const r = Math.min(radius, Math.abs(w) / 2, Math.abs(h) / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

export function ellipse(ctx, x, y, rx, ry, rotation = 0) {
  ctx.beginPath();
  ctx.ellipse(x, y, Math.abs(rx), Math.abs(ry), rotation, 0, TAU);
}

export function starPath(ctx, x, y, outer, inner, points, rotation = -Math.PI / 2) {
  ctx.beginPath();
  for (let index = 0; index < points * 2; index += 1) {
    const radius = index % 2 === 0 ? outer : inner;
    const angle = rotation + (index * Math.PI) / points;
    const px = x + Math.cos(angle) * radius;
    const py = y + Math.sin(angle) * radius;
    if (index === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
}

/** Fill a path while emitting a soft halo behind it. */
export function glow(ctx, color, blur, paint) {
  ctx.save();
  ctx.shadowColor = color;
  ctx.shadowBlur = blur;
  paint();
  ctx.restore();
}

/** A four-point twinkle, the game's signature mark. */
export function sparkle(ctx, x, y, size, color, alpha = 1) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x, y - size);
  ctx.quadraticCurveTo(x + size * 0.16, y - size * 0.16, x + size, y);
  ctx.quadraticCurveTo(x + size * 0.16, y + size * 0.16, x, y + size);
  ctx.quadraticCurveTo(x - size * 0.16, y + size * 0.16, x - size, y);
  ctx.quadraticCurveTo(x - size * 0.16, y - size * 0.16, x, y - size);
  ctx.fill();
  ctx.restore();
}

export function dot(ctx, x, y, radius, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, TAU);
  ctx.fill();
}

/** Draw something twice: a dark offset shadow first, then the bright shape. Gives flat art depth. */
export function lifted(ctx, color, offset, paint) {
  ctx.save();
  ctx.translate(offset, offset);
  ctx.fillStyle = color;
  ctx.strokeStyle = color;
  paint(true);
  ctx.restore();
  paint(false);
}

/** Seed-stable hash in [0,1): lets a prop scatter texture without new random draws per frame. */
export function hash01(value) {
  const sine = Math.sin(value * 127.1 + 311.7) * 43758.5453;
  return sine - Math.floor(sine);
}

export function withAlpha(hex, alpha) {
  const value = hex.replace('#', '');
  const full = value.length === 3 ? value.split('').map((c) => c + c).join('') : value;
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
