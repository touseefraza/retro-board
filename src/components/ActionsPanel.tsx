"use client";

import { useState } from "react";
import { cx } from "./ui";
import type { ActionItem } from "@/lib/types";

/**
 * Structurally a board column: a plain header outside the card, then the card.
 * That's what puts its top edge on the same line as the columns' composers
 * instead of 32px above them, where a Panel's own title row used to sit.
 */
export function ActionsPanel({
  label = "Action items",
  items,
  onAdd,
  onToggle,
  onDelete,
}: {
  label?: string;
  items: ActionItem[];
  onAdd: (text: string) => void;
  onToggle: (itemId: string, done: boolean) => void;
  onDelete: (itemId: string) => void;
}) {
  const [draft, setDraft] = useState("");

  const submit = () => {
    const text = draft.trim();
    if (!text) return;
    onAdd(text);
    setDraft("");
  };

  const open = items.filter((item) => !item.done).length;

  return (
    <section className="flex flex-col gap-3">
      <header className="flex items-center gap-2.5 px-1">
        <span className="h-2 w-2 rounded-full bg-accent shadow-[0_0_28px_-12px_var(--color-accent)]" />
        <h2 className="text-sm font-semibold tracking-tight text-mist-100">
          {label}
        </h2>
        <span className="ml-auto text-xs tabular-nums text-mist-700">
          {open} open / {items.length}
        </span>
      </header>

      <div className="surface rounded-xl p-1.5 transition-colors focus-within:border-line-strong">
        <input
          value={draft}
          placeholder={items.length ? "Add another…" : "What will we actually do?"}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => event.key === "Enter" && submit()}
          aria-label="Add an action item"
          className="w-full bg-transparent px-2.5 py-1.5 text-sm leading-relaxed text-mist-100 placeholder:text-mist-700 outline-none"
        />
        {draft.trim() && (
          <div className="flex items-center justify-between gap-2 px-2.5 pb-1.5">
            <span className="text-[11px] text-mist-700">Enter to add</span>
            <button
              type="button"
              onClick={submit}
              className="rounded-md bg-accent px-2.5 py-1 text-[11px] font-semibold text-white transition-colors hover:bg-accent-soft"
            >
              Add
            </button>
          </div>
        )}
      </div>

      <ul className="flex flex-col gap-1.5">
        {items.map((item) => (
          <li
            key={item.id}
            className="group flex items-start gap-2.5 rounded-card border border-line bg-fill-1 px-3 py-2.5"
          >
            <button
              type="button"
              role="checkbox"
              aria-checked={item.done}
              aria-label={item.done ? "Mark as not done" : "Mark as done"}
              onClick={() => onToggle(item.id, !item.done)}
              className={cx(
                "mt-[3px] flex h-4 w-4 shrink-0 items-center justify-center rounded-[5px] border transition-colors",
                item.done
                  ? "border-tone-positive bg-tone-positive text-ink-fixed"
                  : "border-line-strong hover:border-accent",
              )}
            >
              {item.done && (
                <svg viewBox="0 0 12 12" className="h-2.5 w-2.5" aria-hidden="true">
                  <path
                    d="M2.5 6.2 5 8.6l4.5-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </button>

            <span
              className={cx(
                "min-w-0 flex-1 break-words text-sm leading-relaxed",
                item.done ? "text-mist-700 line-through" : "text-mist-300",
              )}
            >
              {item.text}
              {item.source === "ai" && (
                <span className="ml-1.5 align-middle text-[10px] font-semibold uppercase tracking-wide text-accent-soft/70">
                  ai
                </span>
              )}
            </span>

            <button
              type="button"
              onClick={() => onDelete(item.id)}
              aria-label="Delete action item"
              className="mt-[3px] shrink-0 rounded p-0.5 text-mist-700 opacity-0 transition-opacity hover:text-tone-negative focus-visible:opacity-100 group-hover:opacity-100"
            >
              <svg viewBox="0 0 12 12" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" aria-hidden="true">
                <path d="M3 3l6 6M9 3l-6 6" />
              </svg>
            </button>
          </li>
        ))}

        {!items.length && (
          <li className="rounded-card border border-dashed border-line px-3.5 py-6 text-center text-xs text-mist-700">
            Nothing here yet
          </li>
        )}
      </ul>
    </section>
  );
}
