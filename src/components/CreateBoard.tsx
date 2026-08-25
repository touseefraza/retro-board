"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, cx, TONE } from "./ui";
import { TEMPLATES } from "@/lib/types";
import { VISITOR_NAME } from "@/lib/names";
import { useParticipant } from "@/lib/useParticipant";

const TEMPLATE_IDS = Object.keys(TEMPLATES);

export function CreateBoard() {
  const router = useRouter();
  const { setName } = useParticipant();
  const [template, setTemplate] = useState(TEMPLATE_IDS[0]);
  const [title, setTitle] = useState("");
  const [name, setNameDraft] = useState("");
  const [creating, setCreating] = useState(false);
  const [failure, setFailure] = useState<string | null>(null);

  const named = title.trim().length > 0;

  const create = async () => {
    // The board is named by hand — no falling back to the template's name.
    if (!named) return;
    setCreating(true);
    setFailure(null);
    try {
      const response = await fetch("/api/boards", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ title: title.trim(), template }),
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        setFailure(payload?.fix ?? payload?.error ?? "Could not create the board");
        return;
      }
      // The creator is asked here, so the board doesn't greet them with the
      // same question the moment they land on it.
      setName(name.trim() || VISITOR_NAME);
      router.push(`/b/${payload.boardId}`);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="surface w-full rounded-3xl p-5 sm:p-6">
      <div className="grid gap-2.5 sm:grid-cols-2">
        {TEMPLATE_IDS.map((id) => {
          const option = TEMPLATES[id];
          const selected = template === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => setTemplate(id)}
              aria-pressed={selected}
              className={cx(
                "rounded-2xl border p-4 text-left transition-all duration-150",
                selected
                  ? "border-accent/45 bg-accent/8"
                  : "border-line bg-fill-1 hover:border-line-strong hover:bg-fill-2",
              )}
            >
              <span className="flex items-center gap-1.5">
                {option.columns.map((column) => (
                  <span
                    key={column.title}
                    className={cx("h-1.5 w-1.5 rounded-full", TONE[column.tone].dot)}
                  />
                ))}
              </span>
              <p className="mt-2.5 text-[13px] font-medium text-mist-100">
                {option.name}
              </p>
              <p className="mt-1 text-[11px] leading-snug text-mist-700">
                {option.blurb}
              </p>
            </button>
          );
        })}
      </div>

      <div className="mt-4 flex flex-col gap-2.5">
        <input
          value={title}
          placeholder="Enter board name"
          onChange={(event) => setTitle(event.target.value)}
          onKeyDown={(event) => event.key === "Enter" && create()}
          aria-label="Board name"
          maxLength={80}
          className="h-11 w-full rounded-xl border border-line bg-fill-1 px-3.5 text-sm text-mist-100 placeholder:text-mist-700 outline-none transition-colors focus:border-accent/50"
        />

        <div className="flex flex-col gap-2.5 sm:flex-row">
          <input
            value={name}
            placeholder="Your name (optional)"
            onChange={(event) => setNameDraft(event.target.value)}
            onKeyDown={(event) => event.key === "Enter" && create()}
            aria-label="Your name"
            maxLength={60}
            className="h-11 flex-1 rounded-xl border border-line bg-fill-1 px-3.5 text-sm text-mist-100 placeholder:text-mist-700 outline-none transition-colors focus:border-accent/50"
          />
          <Button
            variant="primary"
            onClick={create}
            disabled={creating || !named}
            className="h-11 px-6"
          >
            {creating ? "Creating…" : "Start retro →"}
          </Button>
        </div>
      </div>

      {failure && (
        <p className="mt-3 text-[12px] leading-relaxed text-tone-negative">{failure}</p>
      )}
      <p className="mt-3 text-[11px] text-mist-700">
        {!named
          ? "Give the board a name to start."
          : name.trim()
            ? "No sign-up. The board lives at a private link you can share."
            : `No sign-up. You'll join as ${VISITOR_NAME} — add a name any time.`}
      </p>
    </div>
  );
}
