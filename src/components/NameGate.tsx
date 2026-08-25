"use client";

import { useState } from "react";
import { Button } from "./ui";
import { hue, initials, VISITOR_NAME } from "@/lib/names";
import type { Participant } from "@/lib/useParticipant";

/**
 * Asks who you are before the board is revealed.
 *
 * Everyone is asked, but nobody is trapped: leaving the field blank joins as
 * "Visitor", and the cursor colour still tells two visitors apart. The point is
 * that the question is put, not that an answer is compelled.
 */
export function NameGate({
  participant,
  boardTitle,
  onSubmit,
}: {
  participant: Participant;
  boardTitle?: string;
  onSubmit: (name: string) => void;
}) {
  const [name, setName] = useState("");
  const named = name.trim().length > 0;

  const submit = () => onSubmit(name.trim() || VISITOR_NAME);

  const colour = `hsl(${hue(participant.id)} 85% 62%)`;

  return (
    <div className="flex flex-1 items-center justify-center px-6 py-16">
      <div className="surface w-full max-w-sm rounded-3xl p-6">
        <div className="flex items-center gap-3">
          <span
            style={{ backgroundColor: colour }}
            className="flex h-9 w-9 items-center justify-center rounded-full text-[11px] font-bold text-ink-950"
          >
            {initials(named ? name : VISITOR_NAME)}
          </span>
          <div className="min-w-0">
            <h1 className="text-base font-semibold tracking-tight text-mist-100">
              Join the retro
            </h1>
            {boardTitle && (
              <p className="truncate text-[12px] text-mist-700">{boardTitle}</p>
            )}
          </div>
        </div>

        <label
          htmlFor="participant-name"
          className="mt-5 block text-[11px] font-semibold uppercase tracking-[0.14em] text-mist-500"
        >
          Your name
        </label>
        <input
          id="participant-name"
          autoFocus
          value={name}
          maxLength={60}
          placeholder="Enter your name"
          onChange={(event) => setName(event.target.value)}
          onKeyDown={(event) => event.key === "Enter" && submit()}
          className="mt-2 h-11 w-full rounded-xl border border-white/8 bg-white/3 px-3.5 text-sm text-mist-100 placeholder:text-mist-700 outline-none transition-colors focus:border-accent/50"
        />

        <Button variant="primary" onClick={submit} className="mt-3 h-11 w-full">
          {named ? "Continue →" : `Continue as ${VISITOR_NAME} →`}
        </Button>

        <p className="mt-3 text-[11px] leading-relaxed text-mist-700">
          {named
            ? "This is the name on your cards and cursor. You can change it later."
            : `Leave it blank to join as ${VISITOR_NAME}. You can add a name later.`}
        </p>
      </div>
    </div>
  );
}
