"use client";

import { useCallback, useSyncExternalStore } from "react";
import { cx } from "./ui";

const KEY = "retro:theme";

export type Theme = "dark" | "light";

/**
 * Theme lives on `document.documentElement`, set by the inline script in the
 * root layout before first paint. Reading it through `useSyncExternalStore`
 * keeps the server snapshot null — the button renders inert until hydration
 * rather than guessing a theme and flipping on the client.
 */
let snapshot: Theme | null = null;
const listeners = new Set<() => void>();

function read(): Theme {
  if (snapshot) return snapshot;
  snapshot = document.documentElement.dataset.theme === "light" ? "light" : "dark";
  return snapshot;
}

function subscribe(onChange: () => void): () => void {
  listeners.add(onChange);
  return () => listeners.delete(onChange);
}

export function ThemeToggle({ className }: { className?: string }) {
  const theme = useSyncExternalStore(subscribe, read, () => null);

  const toggle = useCallback(() => {
    const next: Theme = read() === "light" ? "dark" : "light";
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem(KEY, next);
    } catch {
      // Private mode: the theme still applies, it just won't be remembered.
    }
    snapshot = next;
    for (const listener of listeners) listener();
  }, []);

  const light = theme === "light";

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={light ? "Switch to dark theme" : "Switch to light theme"}
      title={light ? "Switch to dark theme" : "Switch to light theme"}
      className={cx(
        "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-line",
        "bg-fill-1 text-mist-500 transition-colors hover:bg-fill-2 hover:text-mist-100",
        className,
      )}
    >
      {/* Before hydration the theme is unknown, so neither icon is asserted. */}
      {theme === null ? (
        <span className="h-4 w-4" />
      ) : light ? (
        <svg viewBox="0 0 16 16" className="h-4 w-4" fill="currentColor" aria-hidden="true">
          <path d="M6.2 1.4a6.4 6.4 0 1 0 8.4 8.4A5.2 5.2 0 0 1 6.2 1.4z" />
        </svg>
      ) : (
        <svg
          viewBox="0 0 16 16"
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          aria-hidden="true"
        >
          <circle cx="8" cy="8" r="3.1" />
          <path d="M8 1v1.6M8 13.4V15M15 8h-1.6M2.6 8H1M12.9 3.1l-1.1 1.1M4.2 11.8l-1.1 1.1M12.9 12.9l-1.1-1.1M4.2 4.2 3.1 3.1" />
        </svg>
      )}
    </button>
  );
}
