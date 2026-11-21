// Every sound is synthesised on the fly with WebAudio oscillators: no audio files, no network.
// The context is created on the first click or key press, as browsers require.

export function createAudio() {
  let context = null;
  let master = null;
  let enabled = true;

  function unlock() {
    if (!context) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return false;
      try {
        context = new AudioContextClass();
        master = context.createGain();
        master.gain.value = 0.38;
        master.connect(context.destination);
      } catch {
        context = null;
        return false;
      }
    }
    if (context.state === 'suspended') context.resume().catch(() => {});
    return true;
  }

  function setEnabled(value) {
    enabled = value;
    if (master) master.gain.value = value ? 0.38 : 0;
  }

  /** One shaped oscillator note. */
  function note(frequency, at, duration, options = {}) {
    if (!context || !master) return;
    const start = context.currentTime + at;
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = options.type ?? 'sine';
    oscillator.frequency.setValueAtTime(frequency, start);
    if (options.slide) oscillator.frequency.exponentialRampToValueAtTime(options.slide, start + duration);
    const peak = options.gain ?? 0.18;
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(peak, start + (options.attack ?? 0.012));
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    let tail = gain;
    if (options.filter) {
      const filter = context.createBiquadFilter();
      filter.type = options.filter;
      filter.frequency.value = options.cutoff ?? 1200;
      gain.connect(filter);
      tail = filter;
    }
    oscillator.connect(gain);
    tail.connect(master);
    oscillator.start(start);
    oscillator.stop(start + duration + 0.05);
  }

  return {
    unlock,
    isEnabled: () => enabled,
    setEnabled,

    /** Bright three-note chime; rises with the find streak. */
    find(streak = 0) {
      if (!enabled || !unlock()) return;
      const base = 660 * Math.pow(1.0595, Math.min(streak, 6));
      note(base, 0, 0.2, { type: 'triangle', gain: 0.2 });
      note(base * 1.5, 0.055, 0.24, { type: 'sine', gain: 0.15 });
      note(base * 2, 0.11, 0.34, { type: 'sine', gain: 0.1 });
      note(base * 3, 0.11, 0.4, { type: 'sine', gain: 0.035 });
    },

    /** A soft, descending buzz for a wasted click. */
    wrong() {
      if (!enabled || !unlock()) return;
      note(172, 0, 0.24, { type: 'sawtooth', gain: 0.09, slide: 84, filter: 'lowpass', cutoff: 620 });
      note(110, 0.02, 0.2, { type: 'square', gain: 0.035, slide: 70 });
    },

    /** A rising shimmer while the hint ring appears. */
    hint() {
      if (!enabled || !unlock()) return;
      note(720, 0, 0.34, { type: 'sine', gain: 0.09, slide: 1180 });
      note(1080, 0.08, 0.4, { type: 'triangle', gain: 0.06, slide: 1620 });
      note(1560, 0.18, 0.45, { type: 'sine', gain: 0.04 });
    },

    /** Four ascending notes when a picture is cleared. */
    levelClear() {
      if (!enabled || !unlock()) return;
      const notes = [523.25, 659.25, 783.99, 1046.5];
      for (let index = 0; index < notes.length; index += 1) {
        note(notes[index], index * 0.1, 0.42, { type: 'triangle', gain: 0.13 });
        note(notes[index] * 2, index * 0.1 + 0.01, 0.3, { type: 'sine', gain: 0.045 });
      }
    },

    /** A fuller fanfare for finishing all three pictures. */
    victory() {
      if (!enabled || !unlock()) return;
      const melody = [523.25, 659.25, 783.99, 1046.5, 1318.5];
      for (let index = 0; index < melody.length; index += 1) {
        note(melody[index], index * 0.13, 0.55, { type: 'triangle', gain: 0.12 });
      }
      const chord = [523.25, 659.25, 783.99, 1046.5];
      for (const frequency of chord) {
        note(frequency, 0.72, 1.2, { type: 'sine', gain: 0.07, attack: 0.05 });
      }
    },

    /** A small clock tick in the final seconds. */
    tick() {
      if (!enabled || !unlock()) return;
      note(940, 0, 0.06, { type: 'sine', gain: 0.05 });
    },
  };
}
