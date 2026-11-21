// Tiny synthesised sound effects, made with the Web Audio API — no audio
// files, no network. Everything is a short oscillator blip, created lazily
// on the first user gesture so browsers never complain. Mute is a world
// flag the main loop checks before playing anything.

/** Make the sound player. `isMuted` is read fresh on every play. */
export function createAudio(isMuted) {
  let context = null;

  function ensure() {
    if (!context) {
      try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        context = new AudioContext();
      } catch {
        context = null;
      }
    }
    if (context && context.state === 'suspended') context.resume().catch(() => {});
    return context;
  }

  /** Play one tone: frequency, start delay, length, waveform, volume. */
  function tone(frequency, delay, length, type, volume) {
    const audio = ensure();
    if (!audio || isMuted()) return;
    const start = audio.currentTime + delay;
    const oscillator = audio.createOscillator();
    const gain = audio.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, start);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(volume, start + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + length);
    oscillator.connect(gain);
    gain.connect(audio.destination);
    oscillator.start(start);
    oscillator.stop(start + length + 0.05);
  }

  return {
    /** Two-note chime when a difference is found. */
    found() {
      tone(660, 0, 0.14, 'sine', 0.16);
      tone(990, 0.09, 0.2, 'sine', 0.16);
    },
    /** Low buzz for a wrong tap. */
    miss() {
      tone(140, 0, 0.22, 'sawtooth', 0.08);
    },
    /** Soft shimmer when a hint reveals a difference. */
    hint() {
      tone(520, 0, 0.12, 'triangle', 0.12);
      tone(780, 0.08, 0.16, 'triangle', 0.12);
    },
    /** Rising arpeggio when a level is cleared. */
    clear() {
      [523, 659, 784, 1047].forEach((frequency, i) => tone(frequency, i * 0.09, 0.22, 'triangle', 0.14));
    },
    /** Descending notes when the run ends. */
    over() {
      [392, 330, 262].forEach((frequency, i) => tone(frequency, i * 0.14, 0.3, 'triangle', 0.12));
    },
    /** A short tick for the last ten seconds. */
    tick() {
      tone(880, 0, 0.06, 'square', 0.05);
    },
    /** Warm-up so the first real sound is never late. */
    unlock() {
      ensure();
    },
  };
}
