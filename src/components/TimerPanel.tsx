"use client";

import { useEffect, useRef, useState } from "react";
import { cx } from "./ui";
import { playChime, unlockChime } from "@/lib/chime";
import { TIMER_LIMITS } from "@/lib/types";

function clock(seconds: number): string {
  const safe = Math.max(0, seconds);
  const minutes = Math.floor(safe / 60);
  return `${minutes}:${String(safe % 60).padStart(2, "0")}`;
}

/**
 * A countdown every participant sees.
 *
 * The board stores the instant the timer ends, not a remaining duration, so
 * each client counts down to the same moment and a late joiner picks up the
 * run already in progress. Only start, stop and length changes touch the
 * server — the ticking is local.
 */
export function TimerPanel({
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
   * The clock is read in the interval callback rather than during render, so
   * rendering stays a pure function of props and this state. `now` is 0 until
   * the first tick, which the fallback below treats as "not started counting".
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

  const remaining =
    endsAt && now ? Math.round((Date.parse(endsAt) - now) / 1000) : seconds;

  // One chime per run, keyed on the end time so a restart sounds again.
  const chimedFor = useRef<string | null>(null);

  useEffect(() => {
    if (!endsAt || !now || remaining > 0 || chimedFor.current === endsAt) return;
    chimedFor.current = endsAt;
    playChime();
  }, [endsAt, now, remaining]);

  const running = Boolean(endsAt) && remaining > 0;
  const finished = Boolean(endsAt) && Boolean(now) && remaining <= 0;

  const adjust = (by: number) =>
    onSetSeconds(
      Math.min(
        TIMER_LIMITS.max,
        Math.max(TIMER_LIMITS.min, seconds + by * TIMER_LIMITS.step),
      ),
    );

  return (
    <section className="flex flex-col gap-3">
      <header className="flex items-center gap-2.5 px-1">
        <span
          className={cx(
            "h-2 w-2 rounded-full",
            finished ? "bg-tone-negative" : running ? "bg-tone-positive" : "bg-mist-700",
          )}
        />
        <h2 className="text-sm font-semibold tracking-tight text-mist-100">Timer</h2>
        {finished && (
          <span className="ml-auto text-[11px] font-semibold text-tone-negative">
            Time&rsquo;s up
          </span>
        )}
      </header>

      <div className="surface rounded-xl p-4">
        <div className="flex items-center justify-center gap-3">
          {!endsAt && (
            <button
              type="button"
              aria-label="Less time"
              disabled={seconds <= TIMER_LIMITS.min}
              onClick={() => adjust(-1)}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-line text-mist-300 transition-colors hover:bg-fill-2 disabled:opacity-30"
            >
              −
            </button>
          )}

          <span
            aria-live={finished ? "assertive" : "off"}
            className={cx(
              "min-w-[4.5rem] text-center font-mono text-3xl tabular-nums tracking-tight",
              finished
                ? "text-tone-negative"
                : running
                  ? "text-mist-100"
                  : "text-mist-300",
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
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-line text-mist-300 transition-colors hover:bg-fill-2 disabled:opacity-30"
            >
              +
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={() => {
            // Creating the audio context inside the click is what lets the
            // chime sound later, when nobody is touching the page.
            unlockChime();
            onRun(!endsAt);
          }}
          className={cx(
            "mt-3 h-9 w-full rounded-lg text-[13px] font-medium transition-colors",
            endsAt
              ? "border border-line text-mist-300 hover:bg-fill-2"
              : "bg-accent text-white hover:bg-accent-soft",
          )}
        >
          {finished ? "Reset" : endsAt ? "Stop" : `Start ${clock(seconds)}`}
        </button>
      </div>
    </section>
  );
}
