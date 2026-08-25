"use client";

import { useEffect, useRef, useState } from "react";
import { cx, TONE } from "./ui";
import type { Card, Phase, Tone } from "@/lib/types";

export function CardTile({
  card,
  tone,
  phase,
  isMine,
  canVote,
  themeLabel,
  onVote,
  onEdit,
  onDelete,
}: {
  card: Card;
  tone: Tone;
  phase: Phase;
  isMine: boolean;
  canVote: boolean;
  themeLabel?: string;
  onVote: () => void;
  onEdit: (text: string) => void;
  onDelete: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(card.text);
  const textarea = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (editing) {
      textarea.current?.focus();
      textarea.current?.select();
    }
  }, [editing]);

  if (card.masked) {
    return (
      <li className="animate-rise rounded-card border border-line border-l-2 border-l-line-strong bg-fill-1 px-3.5 py-3">
        <div className="space-y-1.5" aria-label="Hidden until reveal">
          <div className="h-2.5 w-full rounded-full bg-fill-3" />
          <div className="h-2.5 w-4/5 rounded-full bg-fill-3" />
        </div>
      </li>
    );
  }

  const commit = () => {
    const next = draft.trim();
    setEditing(false);
    if (next && next !== card.text) onEdit(next);
    else setDraft(card.text);
  };

  return (
    <li
      className={cx(
        "group animate-rise rounded-card border border-line border-l-2 bg-fill-2 px-3.5 py-3",
        "transition-colors hover:border-line-strong hover:bg-fill-2",
        TONE[tone].border,
      )}
    >
      {editing ? (
        <textarea
          ref={textarea}
          value={draft}
          rows={3}
          onChange={(event) => setDraft(event.target.value)}
          onBlur={commit}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              commit();
            }
            if (event.key === "Escape") {
              setDraft(card.text);
              setEditing(false);
            }
          }}
          className="w-full resize-none rounded-md bg-scrim p-2 text-sm leading-relaxed text-mist-100 outline-none"
        />
      ) : (
        <p className="text-sm leading-relaxed whitespace-pre-wrap text-mist-100">
          {card.text}
        </p>
      )}

      {themeLabel && (
        <span className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-accent/12 px-2 py-0.5 text-[11px] text-accent-soft ring-1 ring-accent/25">
          {themeLabel}
        </span>
      )}

      <div className="mt-2.5 flex items-center justify-between gap-2">
        <span className="truncate text-[11px] text-mist-700">{card.authorName}</span>

        <div className="flex items-center gap-1">
          {isMine && !editing && (
            <>
              <IconButton label="Edit card" onClick={() => setEditing(true)}>
                <path d="M11.5 2.5a1.6 1.6 0 0 1 2.3 2.3l-7.4 7.4-3 .7.7-3 7.4-7.4Z" />
              </IconButton>
              <IconButton label="Delete card" onClick={onDelete}>
                <path d="M3 4.5h10M6.5 4.5V3h3v1.5M5 4.5l.6 8h4.8l.6-8" />
              </IconButton>
            </>
          )}

          <button
            type="button"
            onClick={onVote}
            disabled={!canVote && !card.votedByMe}
            aria-pressed={card.votedByMe}
            aria-label={card.votedByMe ? "Remove vote" : "Vote for this card"}
            className={cx(
              "inline-flex h-6 min-w-11 items-center justify-center gap-1 rounded-full px-2",
              "text-[11px] font-semibold ring-1 transition-all duration-150 active:scale-95",
              card.votedByMe
                ? TONE[tone].chip
                : "bg-fill-2 text-mist-500 ring-line hover:bg-fill-3 hover:text-mist-300",
              !canVote && !card.votedByMe && "cursor-not-allowed opacity-40",
              phase === "collect" && "opacity-60",
            )}
          >
            <svg viewBox="0 0 16 16" className="h-3 w-3" aria-hidden="true">
              <path
                d="M8 3.5 3.5 8h2.6v4.5h3.8V8h2.6L8 3.5Z"
                fill={card.votedByMe ? "currentColor" : "none"}
                stroke="currentColor"
                strokeWidth="1.3"
                strokeLinejoin="round"
              />
            </svg>
            {card.votes}
          </button>
        </div>
      </div>
    </li>
  );
}

function IconButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="rounded-md p-1 text-mist-700 opacity-0 transition-opacity hover:bg-fill-3 hover:text-mist-300 focus-visible:opacity-100 group-hover:opacity-100"
    >
      <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        {children}
      </svg>
    </button>
  );
}
