"use client";

import { useState } from "react";
import { CardTile } from "./CardTile";
import { cx, TONE } from "./ui";
import type { Card, Column, Phase, Theme } from "@/lib/types";

export function BoardColumn({
  column,
  cards,
  themes,
  phase,
  participantId,
  canVote,
  onAdd,
  onVote,
  onEdit,
  onDelete,
}: {
  column: Column;
  cards: Card[];
  themes: Theme[];
  phase: Phase;
  participantId: string;
  canVote: boolean;
  onAdd: (text: string) => void;
  onVote: (cardId: string) => void;
  onEdit: (cardId: string, text: string) => void;
  onDelete: (cardId: string) => void;
}) {
  const [draft, setDraft] = useState("");
  const tone = TONE[column.tone];

  // In the discuss phase the highest-voted cards should lead the column.
  const ordered =
    phase === "discuss" || phase === "vote"
      ? [...cards].sort((a, b) => b.votes - a.votes)
      : cards;

  const submit = () => {
    const text = draft.trim();
    if (!text) return;
    onAdd(text);
    setDraft("");
  };

  return (
    <section className="flex w-[19rem] shrink-0 flex-col gap-3 sm:w-[21rem]">
      <header className="flex items-center gap-2.5 px-1">
        <span className={cx("h-2 w-2 rounded-full", tone.dot, tone.glow)} />
        <h2 className="text-sm font-semibold tracking-tight text-mist-100">
          {column.title}
        </h2>
        <span className="ml-auto text-xs tabular-nums text-mist-700">{cards.length}</span>
      </header>

      <div className="surface rounded-xl p-1.5 transition-colors focus-within:border-line-strong">
        <textarea
          value={draft}
          rows={2}
          placeholder={`Add to ${column.title.toLowerCase()}…`}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              submit();
            }
          }}
          className="w-full resize-none bg-transparent px-2.5 py-1.5 text-sm leading-relaxed text-mist-100 placeholder:text-mist-700 outline-none"
        />
        {draft.trim() && (
          <div className="flex items-center justify-between gap-2 px-2.5 pb-1.5">
            <span className="text-[11px] text-mist-700">Enter to post</span>
            <button
              type="button"
              onClick={submit}
              className="rounded-md bg-accent px-2.5 py-1 text-[11px] font-semibold text-white transition-colors hover:bg-accent-soft"
            >
              Post
            </button>
          </div>
        )}
      </div>

      <ul className="flex flex-col gap-2">
        {ordered.map((card) => (
          <CardTile
            key={card.id}
            card={card}
            tone={column.tone}
            phase={phase}
            isMine={card.authorId === participantId}
            canVote={canVote}
            themeLabel={themes.find((theme) => theme.id === card.themeId)?.label}
            onVote={() => onVote(card.id)}
            onEdit={(text) => onEdit(card.id, text)}
            onDelete={() => onDelete(card.id)}
          />
        ))}

        {!cards.length && (
          <li className="rounded-card border border-dashed border-line px-3.5 py-6 text-center text-xs text-mist-700">
            Nothing here yet
          </li>
        )}
      </ul>
    </section>
  );
}
