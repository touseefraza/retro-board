"use client";

/**
 * The end-of-timer alarm, synthesised rather than loaded.
 *
 * An audio file would be another asset to ship and another request that can
 * fail; oscillators cost nothing. Browsers only allow audio after a gesture,
 * so the context is opened when the timer is started and reused — which is
 * what lets it sound later with nobody touching the page.
 */
let context: AudioContext | null = null;
let repeat: ReturnType<typeof setInterval> | null = null;
let stopAt: ReturnType<typeof setTimeout> | null = null;
let playing: OscillatorNode[] = [];

type WindowWithAudio = Window & { webkitAudioContext?: typeof AudioContext };

/** How long the alarm rings if nobody stops it. */
const RING_MS = 15000;
/** Gap between bursts. */
const BURST_MS = 1500;

function audioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!context) {
    const Ctor = window.AudioContext ?? (window as WindowWithAudio).webkitAudioContext;
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

/** One rising triad. */
function burst(ctx: AudioContext): void {
  const notes = [660, 880, 1320];
  const start = ctx.currentTime;

  notes.forEach((frequency, index) => {
    const at = start + index * 0.16;
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();

    oscillator.type = "sine";
    oscillator.frequency.value = frequency;

    // Fade each note in and out; a bare start/stop clicks.
    gain.gain.setValueAtTime(0.0001, at);
    gain.gain.exponentialRampToValueAtTime(0.22, at + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, at + 0.4);

    oscillator.connect(gain).connect(ctx.destination);
    oscillator.start(at);
    oscillator.stop(at + 0.42);
    playing.push(oscillator);
    oscillator.onended = () => {
      playing = playing.filter((node) => node !== oscillator);
    };
  });
}

/**
 * Rings until stopped, or for RING_MS if nobody does. A single blip is easy
 * to miss in a room that's mid-conversation, which is exactly when the timer
 * ending matters.
 */
export function startAlarm(): void {
  const ctx = audioContext();
  if (!ctx) return;
  if (ctx.state === "suspended") void ctx.resume();

  stopAlarm();
  burst(ctx);
  repeat = setInterval(() => burst(ctx), BURST_MS);
  stopAt = setTimeout(stopAlarm, RING_MS);
}

/** Silences the alarm — called when anyone stops or resets the timer. */
export function stopAlarm(): void {
  if (repeat) clearInterval(repeat);
  if (stopAt) clearTimeout(stopAt);
  repeat = null;
  stopAt = null;
  for (const oscillator of playing) {
    try {
      oscillator.stop();
    } catch {
      // Already stopped; nothing to do.
    }
  }
  playing = [];
}
