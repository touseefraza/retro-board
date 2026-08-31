"use client";

/**
 * A short three-note chime, synthesised rather than loaded.
 *
 * An audio file would be another asset to ship and another request to make;
 * three oscillators cost nothing and can't fail to load. Browsers only allow
 * audio after a gesture, so the context is created on the first interaction
 * (starting the timer) and reused — which is what lets it sound later when
 * the countdown ends with nobody touching the page.
 */
let context: AudioContext | null = null;

type WindowWithAudio = Window & { webkitAudioContext?: typeof AudioContext };

function audioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!context) {
    const Ctor =
      window.AudioContext ?? (window as WindowWithAudio).webkitAudioContext;
    if (!Ctor) return null;
    context = new Ctor();
  }
  return context;
}

/** Call from a click so later playback is permitted. */
export function unlockChime(): void {
  const ctx = audioContext();
  if (ctx?.state === "suspended") void ctx.resume();
}

export function playChime(): void {
  const ctx = audioContext();
  if (!ctx) return;
  if (ctx.state === "suspended") void ctx.resume();

  // A rising major triad — audible over a call without being startling.
  const notes = [660, 880, 1320];
  const start = ctx.currentTime;

  notes.forEach((frequency, index) => {
    const at = start + index * 0.18;
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();

    oscillator.type = "sine";
    oscillator.frequency.value = frequency;

    // Fade each note in and out; a bare start/stop clicks.
    gain.gain.setValueAtTime(0.0001, at);
    gain.gain.exponentialRampToValueAtTime(0.22, at + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, at + 0.42);

    oscillator.connect(gain).connect(ctx.destination);
    oscillator.start(at);
    oscillator.stop(at + 0.45);
  });
}
