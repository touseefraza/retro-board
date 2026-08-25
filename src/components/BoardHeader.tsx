"use client";

import { useState } from "react";
import Link from "next/link";
import { Button, cx } from "./ui";
import { PHASES, type Board, type Phase } from "@/lib/types";

const PHASE_COPY: Record<Phase, string> = {
  collect: "Everyone writes",
  group: "Cluster the themes",
  vote: "Spend your votes",
  discuss: "Talk it through",
};

export function BoardHeader({
  board,
  votesUsed,
  participantName,
  onRename,
  onPhase,
  onMask,
  onName,
}: {
  board: Board;
  votesUsed: number;
  participantName: string;
  onRename: (title: string) => void;
  onPhase: (phase: Phase) => void;
  onMask: (masked: boolean) => void;
  onName: (name: string) => void;
}) {
  const [copied, setCopied] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);

  const share = async () => {
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const budget = board.votesPerParticipant;

  return (
    <header className="z-20 border-b border-white/6 bg-ink-950/70 backdrop-blur-xl sm:sticky sm:top-0">
      <div className="mx-auto flex max-w-[110rem] flex-wrap items-center gap-x-4 gap-y-3 px-4 py-3 sm:px-6">
        <Link
          href="/"
          aria-label="Retro Board home"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent/15 ring-1 ring-accent/30"
        >
          <svg viewBox="0 0 16 16" className="h-4 w-4 text-accent-soft" fill="currentColor" aria-hidden="true">
            <rect x="2" y="2.5" width="4.5" height="7" rx="1.2" />
            <rect x="8" y="2.5" width="6" height="4.5" rx="1.2" opacity=".55" />
            <rect x="2" y="11" width="4.5" height="2.5" rx="1" opacity=".55" />
            <rect x="8" y="8.5" width="6" height="5" rx="1.2" opacity=".3" />
          </svg>
        </Link>

        {editingTitle ? (
          <input
            autoFocus
            defaultValue={board.title}
            onBlur={(event) => {
              setEditingTitle(false);
              onRename(event.target.value);
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter") event.currentTarget.blur();
              if (event.key === "Escape") setEditingTitle(false);
            }}
            className="min-w-0 flex-1 rounded-md bg-white/6 px-2 py-1 text-base font-semibold text-mist-100 outline-none"
          />
        ) : (
          <button
            type="button"
            onClick={() => setEditingTitle(true)}
            title="Rename board"
            className="min-w-0 truncate rounded-md px-1 text-left text-base font-semibold tracking-tight text-mist-100 hover:bg-white/6"
          >
            {board.title}
          </button>
        )}

        <div className="order-last flex w-full items-center gap-1 overflow-x-auto sm:order-none sm:w-auto">
          {PHASES.map((phase, index) => (
            <button
              key={phase}
              type="button"
              onClick={() => onPhase(phase)}
              title={PHASE_COPY[phase]}
              className={cx(
                "relative shrink-0 rounded-lg px-2.5 py-1.5 text-[12px] font-medium capitalize transition-colors",
                board.phase === phase
                  ? "bg-accent/15 text-accent-soft ring-1 ring-accent/30"
                  : "text-mist-700 hover:bg-white/6 hover:text-mist-300",
              )}
            >
              <span className="mr-1.5 font-mono text-[10px] opacity-60">
                {index + 1}
              </span>
              {phase}
            </button>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-2">
          {budget > 0 && (
            <span
              title="Votes you have left"
              className="hidden rounded-lg border border-white/7 bg-white/3 px-2.5 py-1.5 text-[12px] tabular-nums text-mist-500 sm:block"
            >
              {budget - votesUsed} {budget - votesUsed === 1 ? "vote" : "votes"} left
            </span>
          )}

          <Button
            size="sm"
            variant={board.masked ? "primary" : "ghost"}
            onClick={() => onMask(!board.masked)}
            title="Hide other people's cards until you reveal them"
          >
            {board.masked ? "Reveal" : "Hide"}
          </Button>

          <input
            value={participantName}
            placeholder="Your name"
            onChange={(event) => onName(event.target.value)}
            className="w-24 rounded-lg border border-white/7 bg-white/3 px-2.5 py-1.5 text-[12px] text-mist-100 placeholder:text-mist-700 outline-none transition-colors focus:border-accent/50 sm:w-28"
          />

          <Button size="sm" variant="primary" onClick={share}>
            {copied ? "Copied" : "Share"}
          </Button>
        </div>
      </div>
    </header>
  );
}
