"use client";

import { useState } from "react";
import { Panel, cx } from "./ui";
import type { ActionItem } from "@/lib/types";

export function ActionsPanel({
  items,
  onAdd,
  onToggle,
  onDelete,
}: {
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
    <Panel
      title="Action items"
      action={
        <span className="text-[11px] tabular-nums text-mist-700">
          {open} open / {items.length}
        </span>
      }
    >
      <ul className="space-y-1.5">
        {items.map((item) => (
          <li key={item.id} className="group flex items-start gap-2.5">
            <button
              type="button"
              role="checkbox"
              aria-checked={item.done}
              aria-label={item.done ? "Mark as not done" : "Mark as done"}
              onClick={() => onToggle(item.id, !item.done)}
              className={cx(
                "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-[5px] border transition-colors",
                item.done
                  ? "border-tone-positive bg-tone-positive text-ink-950"
                  : "border-white/18 hover:border-accent",
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
                "min-w-0 flex-1 break-words text-[13px] leading-relaxed",
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
              className="mt-0.5 shrink-0 rounded p-0.5 text-mist-700 opacity-0 transition-opacity hover:text-tone-negative focus-visible:opacity-100 group-hover:opacity-100"
            >
              <svg viewBox="0 0 12 12" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" aria-hidden="true">
                <path d="M3 3l6 6M9 3l-6 6" />
              </svg>
            </button>
          </li>
        ))}
      </ul>

      <input
        value={draft}
        placeholder={items.length ? "Add another…" : "What will we actually do?"}
        onChange={(event) => setDraft(event.target.value)}
        onKeyDown={(event) => event.key === "Enter" && submit()}
        className={cx(
          "w-full rounded-lg border border-white/7 bg-white/3 px-3 py-2 text-[13px]",
          "text-mist-100 placeholder:text-mist-700 outline-none transition-colors",
          "focus:border-accent/50",
          items.length > 0 && "mt-3",
        )}
      />
    </Panel>
  );
}
