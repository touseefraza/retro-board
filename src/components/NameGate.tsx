"use client";

import { useState } from "react";
import { Button } from "./ui";
import { defaultName, hue, initials } from "@/lib/names";
import type { Participant } from "@/lib/useParticipant";

/**
 * Asks who you are before the board is revealed.
 *
 * Nothing is attributed to "Anonymous" this way: by the time cards and cursors
 * exist, they already carry a name. The field starts on a generated suggestion
 * so joining stays one keystroke, but an empty name can't be submitted.
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
  const [name, setName] = useState(() => defaultName(participant.id));
  const ready = name.trim().length > 0;

  const submit = () => {
    if (ready) onSubmit(name);
  };

  const colour = `hsl(${hue(participant.id)} 85% 62%)`;

  return (
    <div className="flex flex-1 items-center justify-center px-6 py-16">
      <div className="surface w-full max-w-sm rounded-3xl p-6">
        <div className="flex items-center gap-3">
          <span
            style={{ backgroundColor: colour }}
            className="flex h-9 w-9 items-center justify-center rounded-full text-[11px] font-bold text-ink-950"
          >
            {initials(name || "?")}
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
          onFocus={(event) => event.currentTarget.select()}
          onChange={(event) => setName(event.target.value)}
          onKeyDown={(event) => event.key === "Enter" && submit()}
          className="mt-2 h-11 w-full rounded-xl border border-white/8 bg-white/3 px-3.5 text-sm text-mist-100 placeholder:text-mist-700 outline-none transition-colors focus:border-accent/50"
        />

        <Button
          variant="primary"
          onClick={submit}
          disabled={!ready}
          className="mt-3 h-11 w-full"
        >
          Continue →
        </Button>

        <p className="mt-3 text-[11px] leading-relaxed text-mist-700">
          {ready
            ? "This is the name on your cards and cursor. You can change it later."
            : "Enter a name to continue."}
        </p>
      </div>
    </div>
  );
}
