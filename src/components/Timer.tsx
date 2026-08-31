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

  // How much of the run is left, for the progress rail.
  const fraction = running && seconds > 0 ? Math.max(0, Math.min(1, remaining / seconds)) : 0;
  // The rail warms toward red over the last fifth.
  const low = running && fraction <= 0.2;

  return (
    <div
      className={cx(
        "relative flex shrink-0 items-center gap-1 overflow-hidden rounded-xl border pl-1 pr-1 transition-colors",
        finished
          ? "border-tone-negative/50 bg-tone-negative/10"
          : running
            ? "border-accent/40 bg-accent/8"
            : "border-line bg-fill-1",
      )}
      title={finished ? "Time's up" : running ? "Timer running" : "Countdown timer"}
    >
      {!endsAt && (
        <Step
          label="Less time"
          disabled={seconds <= TIMER_LIMITS.min}
          onClick={() => adjust(-1)}
        >
          <path d="M4 8h8" />
        </Step>
      )}

      <span
        aria-live={finished ? "assertive" : "off"}
        className={cx(
          "min-w-[3.4rem] px-1 text-center font-mono text-[17px] font-semibold leading-none tabular-nums tracking-tight",
          finished
            ? "text-tone-negative"
            : low
              ? "text-tone-idea"
              : running
                ? "text-mist-100"
                : "text-mist-300",
          finished && "animate-pulse",
        )}
      >
        {clock(endsAt ? remaining : seconds)}
      </span>

      {!endsAt && (
        <Step
          label="More time"
          disabled={seconds >= TIMER_LIMITS.max}
          onClick={() => adjust(1)}
        >
          <path d="M8 4v8M4 8h8" />
        </Step>
      )}

      <button
        type="button"
        onClick={toggle}
        aria-label={finished ? "Reset timer" : endsAt ? "Stop timer" : "Start timer"}
        className={cx(
          "ml-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-colors",
          finished
            ? "bg-tone-negative text-ink-fixed hover:opacity-90"
            : endsAt
              ? "bg-fill-2 text-mist-300 hover:bg-fill-3 hover:text-mist-100"
              : "bg-accent text-white hover:bg-accent-soft",
        )}
      >
        {finished ? (
          <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
            <path d="M13 8a5 5 0 1 1-1.6-3.7" />
            <path d="M13 2.5V5h-2.5" />
          </svg>
        ) : endsAt ? (
          <svg viewBox="0 0 16 16" className="h-3 w-3" fill="currentColor" aria-hidden="true">
            <rect x="3.5" y="3.5" width="9" height="9" rx="1.6" />
          </svg>
        ) : (
          <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="currentColor" aria-hidden="true">
            <path d="M5 3.6c0-.5.5-.8.9-.5l6 4.4c.4.3.4.8 0 1l-6 4.4c-.4.3-.9 0-.9-.5z" />
          </svg>
        )}
      </button>

      {/* A rail rather than a number: elapsed time is glanceable, not read. */}
      {running && (
        <span
          aria-hidden="true"
          style={{ transform: `scaleX(${fraction})` }}
          className={cx(
            "absolute inset-x-0 bottom-0 h-[2px] origin-left transition-transform duration-300 ease-linear",
            low ? "bg-tone-idea" : "bg-accent",
          )}
        />
      )}
    </div>
  );
}

/** A round step button for the minute controls. */
function Step({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string;
  disabled: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="flex h-7 w-6 items-center justify-center rounded-lg text-mist-500 transition-colors hover:bg-fill-2 hover:text-mist-100 disabled:opacity-25"
    >
      <svg
        viewBox="0 0 16 16"
        className="h-3.5 w-3.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        aria-hidden="true"
      >
        {children}
      </svg>
    </button>
  );
}
