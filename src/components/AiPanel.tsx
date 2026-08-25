"use client";

import { useState } from "react";
import { Markdown } from "./Markdown";
import { Button, Label, Panel, Shimmer, cx } from "./ui";
import type { BoardState } from "@/lib/types";

type Proposal = { text: string; rationale: string };
type Nudge = { observation: string; prompts: string[] };

/** What `POST /api/boards/:id/ai` returns, narrowed to what this panel reads. */
export type AiPayload = {
  action: string;
  proposals?: Proposal[];
  nudge?: Nudge;
  /** Present when the pass wrote its result to the board. */
  state?: unknown;
};

const PASSES = [
  {
    id: "themes",
    label: "Find themes",
    hint: "Group similar cards",
    icon: "M2.5 4h11M2.5 8h7M2.5 12h4",
  },
  {
    id: "summary",
    label: "Summarize",
    hint: "Write the retro read-out",
    icon: "M4 2.5h8v11l-4-2.5-4 2.5v-11Z",
  },
  {
    id: "actions",
    label: "Draft actions",
    hint: "Propose next steps",
    icon: "M3 8.5 6.5 12 13 4.5",
  },
  {
    id: "nudge",
    label: "Unstick us",
    hint: "Prompts for a quiet room",
    icon: "M8 2.5a4 4 0 0 0-2.5 7.1V12h5V9.6A4 4 0 0 0 8 2.5ZM6.5 14h3",
  },
] as const;

type PassId = (typeof PASSES)[number]["id"];

export function AiPanel({
  state,
  aiEnabled,
  run,
  onAcceptAction,
}: {
  state: BoardState;
  aiEnabled: boolean;
  run: (action: PassId, options?: { apply?: boolean }) => Promise<AiPayload | null>;
  onAcceptAction: (text: string) => void;
}) {
  const [busy, setBusy] = useState<PassId | null>(null);
  const [proposals, setProposals] = useState<Proposal[] | null>(null);
  const [nudge, setNudge] = useState<Nudge | null>(null);
  const [failure, setFailure] = useState<string | null>(null);

  const invoke = async (action: PassId) => {
    setBusy(action);
    setFailure(null);
    if (action === "actions") setProposals(null);
    if (action === "nudge") setNudge(null);

    try {
      const payload = await run(action);
      if (!payload) return;
      if (action === "actions") setProposals(payload.proposals ?? []);
      if (action === "nudge") setNudge(payload.nudge ?? null);
    } catch (error) {
      setFailure(error instanceof Error ? error.message : "That pass failed");
    } finally {
      setBusy(null);
    }
  };

  const cardCount = state.cards.length;

  return (
    <Panel
      title={
        <span className="flex items-center gap-2">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-60" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent" />
          </span>
          Claude
        </span>
      }
      action={<span className="text-[11px] text-mist-700">{cardCount} cards</span>}
      className="overflow-hidden"
    >
      {!aiEnabled && (
        <p className="mb-3 rounded-lg border border-tone-idea/20 bg-tone-idea/8 px-3 py-2 text-xs text-tone-idea">
          Set <code className="font-mono">ANTHROPIC_API_KEY</code> in{" "}
          <code className="font-mono">.env.local</code> to turn these on.
        </p>
      )}

      <div className="grid grid-cols-2 gap-2">
        {PASSES.map((pass) => (
          <button
            key={pass.id}
            type="button"
            disabled={!aiEnabled || busy !== null || (cardCount === 0 && pass.id !== "nudge")}
            onClick={() => invoke(pass.id)}
            className={cx(
              "group flex flex-col gap-1 rounded-xl border border-line bg-fill-1 p-3 text-left",
              "transition-all duration-150 hover:border-accent/40 hover:bg-accent/8",
              "disabled:pointer-events-none disabled:opacity-35",
              busy === pass.id && "border-accent/50 bg-accent/10",
            )}
          >
            <span className="flex items-center gap-2 text-[13px] font-medium text-mist-100">
              <svg
                viewBox="0 0 16 16"
                className={cx(
                  "h-3.5 w-3.5 text-mist-500 transition-colors group-hover:text-accent-soft",
                  busy === pass.id && "animate-pulse text-accent-soft",
                )}
                fill="none"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d={pass.icon} />
              </svg>
              {pass.label}
            </span>
            <span className="text-[11px] leading-snug text-mist-700">{pass.hint}</span>
          </button>
        ))}
      </div>

      {busy && (
        <div className="mt-4">
          <Shimmer lines={3} />
        </div>
      )}

      {failure && (
        <p className="mt-3 rounded-lg border border-tone-negative/25 bg-tone-negative/8 px-3 py-2 text-xs text-tone-negative">
          {failure}
        </p>
      )}

      {nudge && !busy && (
        <div className="mt-4 animate-rise space-y-2.5 rounded-xl border border-line bg-fill-1 p-3.5">
          <Label>Facilitator</Label>
          <p className="text-sm leading-relaxed text-mist-300">{nudge.observation}</p>
          <ul className="space-y-2 border-t border-line pt-2.5">
            {nudge.prompts.map((prompt, index) => (
              <li key={index} className="flex gap-2.5 text-sm text-mist-100">
                <span className="shrink-0 font-mono text-[11px] text-accent-soft">
                  {String(index + 1).padStart(2, "0")}
                </span>
                {prompt}
              </li>
            ))}
          </ul>
        </div>
      )}

      {proposals && !busy && (
        <div className="mt-4 animate-rise space-y-2">
          <Label>Proposed actions</Label>
          {proposals.map((proposal, index) => (
            <div
              key={index}
              className="rounded-xl border border-line bg-fill-1 p-3 transition-colors hover:border-line-strong"
            >
              <p className="text-sm leading-relaxed text-mist-100">{proposal.text}</p>
              <p className="mt-1 text-[11px] leading-snug text-mist-700">
                {proposal.rationale}
              </p>
              <Button
                size="sm"
                variant="quiet"
                className="mt-2 -ml-1.5"
                onClick={() => {
                  onAcceptAction(proposal.text);
                  setProposals((current) =>
                    current ? current.filter((_, i) => i !== index) : current,
                  );
                }}
              >
                + Add to board
              </Button>
            </div>
          ))}
          {!proposals.length && (
            <p className="text-xs text-mist-700">Nothing worth acting on yet.</p>
          )}
        </div>
      )}

      {state.board.summary && !busy && (
        <div className="mt-4 animate-rise rounded-xl border border-accent/20 bg-accent/6 p-3.5">
          <Label>Retro summary</Label>
          <div className="mt-2">
            <Markdown text={state.board.summary} />
          </div>
        </div>
      )}

      {state.themes.length > 0 && !busy && (
        <div className="mt-4 space-y-2">
          <Label>Themes</Label>
          {state.themes.map((theme) => (
            <div key={theme.id} className="rounded-xl border border-line bg-fill-1 p-3">
              <p className="text-[13px] font-medium text-mist-100">{theme.label}</p>
              {theme.summary && (
                <p className="mt-0.5 text-[11px] leading-snug text-mist-700">
                  {theme.summary}
                </p>
              )}
              <p className="mt-1.5 text-[11px] text-mist-700">
                {state.cards.filter((card) => card.themeId === theme.id).length} cards
              </p>
            </div>
          ))}
        </div>
      )}
    </Panel>
  );
}
