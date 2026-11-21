// Browser input, kept separate from the game rules: pointer presses arrive as logical canvas
// coordinates, key presses as short action words. Keyboard play is first-class: arrows move a
// cursor, Tab switches picture, Enter finds, P pauses.

export function createInput(canvas, handlers) {
  const { toLogical, onPointer, onKey } = handlers;

  function pointerDown(event) {
    const rect = canvas.getBoundingClientRect();
    const point = toLogical(event.clientX - rect.left, event.clientY - rect.top);
    onPointer(point.x, point.y, event);
  }

  function actionFor(event) {
    switch (event.code) {
      case 'KeyH': return 'hint';
      case 'KeyM': return 'sound';
      case 'KeyR': return 'retry';
      case 'KeyP':
      case 'Escape': return 'pause';
      case 'Tab': return 'cycle';
      case 'ArrowLeft':
      case 'KeyA': return 'left';
      case 'ArrowRight':
      case 'KeyD': return 'right';
      case 'ArrowUp':
      case 'KeyW': return 'up';
      case 'ArrowDown':
      case 'KeyS': return 'down';
      case 'Enter':
      case 'Space': return 'confirm';
      default: return null;
    }
  }

  function keyDown(event) {
    const action = actionFor(event);
    if (!action) return;
    if (event.code === 'Space' && event.target instanceof HTMLButtonElement) return;
    event.preventDefault();
    if (!event.repeat) onKey(action, event);
  }

  canvas.addEventListener('pointerdown', pointerDown);
  window.addEventListener('keydown', keyDown);

  return {
    dispose() {
      canvas.removeEventListener('pointerdown', pointerDown);
      window.removeEventListener('keydown', keyDown);
    },
  };
}
