"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, cx } from "./ui";
import { VISITOR_NAME } from "@/lib/names";
import { useParticipant } from "@/lib/useParticipant";

/**
 * Starts a board on a given format.
 *
 * It asks for the two things every other entry point asks for: a board name,
 * which is required here as it is on the home page, and the person's name,
 * which is optional and falls back to Visitor. Taking the name here means the
 * board doesn't greet its creator with a question they've already answered.
 */
export function StartTemplateButton({
  template,
  defaultTitle,
  cta,
}: {
  template: string;
  /** Prefills the board name so starting is still close to one click. */
  defaultTitle: string;
  cta: string;
}) {
  const router = useRouter();
  const { setName } = useParticipant();
  const [title, setTitle] = useState(defaultTitle);
  const [name, setNameDraft] = useState("");
  const [creating, setCreating] = useState(false);
  const [failure, setFailure] = useState<string | null>(null);

  const named = title.trim().length > 0;

  const start = async () => {
    if (!named) return;
    setCreating(true);
    setFailure(null);
    try {
      const response = await fetch("/api/boards", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ template, title: title.trim() }),
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        setFailure(payload?.fix ?? payload?.error ?? "Could not create the board");
        return;
      }
      setName(name.trim() || VISITOR_NAME);
      router.push(`/b/${payload.boardId}`);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="surface rounded-2xl p-4 text-left">
      <div className="flex flex-col gap-2.5">
        <input
          value={title}
          placeholder="Enter board name"
          maxLength={80}
          aria-label="Board name"
          onChange={(event) => setTitle(event.target.value)}
          onKeyDown={(event) => event.key === "Enter" && start()}
          className={inputClass}
        />
        <div className="flex flex-col gap-2.5 sm:flex-row">
          <input
            value={name}
            placeholder="Your name (optional)"
            maxLength={60}
            aria-label="Your name"
            onChange={(event) => setNameDraft(event.target.value)}
            onKeyDown={(event) => event.key === "Enter" && start()}
            className={cx(inputClass, "sm:flex-1")}
          />
          <Button
            variant="primary"
            onClick={start}
            disabled={creating || !named}
            className="h-11 shrink-0 px-6"
          >
            {creating ? "Creating…" : cta}
          </Button>
        </div>
      </div>

      {failure ? (
        <p className="mt-2.5 text-[12px] text-tone-negative">{failure}</p>
      ) : (
        <p className="mt-2.5 text-[11px] text-mist-700">
          {named
            ? `No sign-up. ${name.trim() ? "" : `You'll join as ${VISITOR_NAME}. `}Share the link and everyone's in.`
            : "Give the board a name to start."}
        </p>
      )}
    </div>
  );
}

const inputClass =
  "h-11 w-full rounded-xl border border-line bg-fill-1 px-3.5 text-sm text-mist-100 placeholder:text-mist-700 outline-none transition-colors focus:border-accent/50";
