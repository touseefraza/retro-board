"use client";

import { useEffect, useRef, useState } from "react";
import { cx } from "./ui";
import { startAlarm, stopAlarm, unlockChime } from "@/lib/chime";
import { TIMER_LIMITS } from "@/lib/types";

function clock(seconds: number): string {
  const safe = Math.max(0, seconds);
  return `${Math.floor(safe / 60)}:${String(safe % 60).padStart(2, "0")}`;
}

/**
 * The shared countdown, sized for the header.
 *
 * The board stores the instant the run ends rather than a remaining duration,
 * so every client counts down to the same moment and a late joiner picks up a
 * run already in progress. Only start, stop and length changes reach the
 * server; the ticking is local.
 */
export function Timer({
  seconds,
  endsAt,
  onSetSeconds,
  onRun,
}: {
  seconds: number;
  endsAt: string | null;
  onSetSeconds: (seconds: number) => void;
  onRun: (running: boolean) => void;
}) {
  /**
   * The clock is read in the interval callback, never during render, so
   * rendering stays a pure function of props and state. `now` is 0 until the
   * first tick — treated below as "not counting yet".
   */
  const [now, setNow] = useState(0);

  useEffect(() => {
    if (!endsAt) return;
    const update = () => setNow(Date.now());
    // Intervals don't fire immediately; this gets the first value on screen.
    const first = setTimeout(update, 0);
    const id = setInterval(update, 250);
    return () => {
      clearTimeout(first);
      clearInterval(id);
    };
  }, [endsAt]);

  const remaining = endsAt && now ? Math.round((Date.parse(endsAt) - now) / 1000) : seconds;
  const running = Boolean(endsAt) && remaining > 0;
  const finished = Boolean(endsAt) && Boolean(now) && remaining <= 0;

  // One alarm per run, keyed on the end instant so a restart rings again.
  const rangFor = useRef<string | null>(null);

  useEffect(() => {
    if (!endsAt || !now || remaining > 0 || rangFor.current === endsAt) return;
    rangFor.current = endsAt;
    startAlarm();
  }, [endsAt, now, remaining]);

  // Leaving the board shouldn't leave a ringing alarm behind.
  useEffect(() => stopAlarm, []);

  const adjust = (by: number) =>
    onSetSeconds(
      Math.min(TIMER_LIMITS.max, Math.max(TIMER_LIMITS.min, seconds + by * TIMER_LIMITS.step)),
    );

  const toggle = () => {
    // Opening the audio context inside a click is what lets the alarm sound
    // later, when nobody is touching the page.
    unlockChime();
    stopAlarm();
    onRun(!endsAt);
  };

  return (
    <div
      className={cx(
        "flex shrink-0 items-center gap-0.5 rounded-lg border px-1 py-1 transition-colors",
        finished
          ? "border-tone-negative/50 bg-tone-negative/10"
          : running
            ? "border-accent/40 bg-accent/8"
            : "border-line bg-fill-1",
      )}
      title={finished ? "Time's up" : running ? "Timer running" : "Countdown timer"}
    >
      {!endsAt && (
        <button
          type="button"
          aria-label="Less time"
          disabled={seconds <= TIMER_LIMITS.min}
          onClick={() => adjust(-1)}
          className="flex h-6 w-5 items-center justify-center rounded text-mist-500 transition-colors hover:bg-fill-2 hover:text-mist-100 disabled:opacity-30"
        >
          −
        </button>
      )}

      <span
        aria-live={finished ? "assertive" : "off"}
        className={cx(
          "min-w-[2.6rem] px-0.5 text-center font-mono text-[13px] tabular-nums",
          finished ? "text-tone-negative" : running ? "text-mist-100" : "text-mist-300",
          finished && "animate-pulse",
        )}
      >
        {clock(endsAt ? remaining : seconds)}
      </span>

      {!endsAt && (
        <button
          type="button"
          aria-label="More time"
          disabled={seconds >= TIMER_LIMITS.max}
          onClick={() => adjust(1)}
          className="flex h-6 w-5 items-center justify-center rounded text-mist-500 transition-colors hover:bg-fill-2 hover:text-mist-100 disabled:opacity-30"
        >
          +
        </button>
      )}

      <button
        type="button"
        onClick={toggle}
        aria-label={finished ? "Reset timer" : endsAt ? "Stop timer" : "Start timer"}
        className={cx(
          "ml-0.5 flex h-6 items-center justify-center rounded px-2 text-[11px] font-semibold transition-colors",
          finished
            ? "bg-tone-negative text-ink-fixed hover:opacity-90"
            : endsAt
              ? "text-mist-300 hover:bg-fill-2"
              : "bg-accent text-white hover:bg-accent-soft",
        )}
      >
        {finished ? "Reset" : endsAt ? "Stop" : "Start"}
      </button>
    </div>
  );
}
