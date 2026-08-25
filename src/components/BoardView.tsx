"use client";

import { useCallback } from "react";
import { ActionsPanel } from "./ActionsPanel";
import { AiPanel, type AiPayload } from "./AiPanel";
import { BoardColumn } from "./BoardColumn";
import { BoardHeader } from "./BoardHeader";
import { Shimmer } from "./ui";
import { useBoard } from "@/lib/useBoard";
import { participantHeaders, useParticipant } from "@/lib/useParticipant";
import type { BoardState, Phase } from "@/lib/types";

export function BoardView({
  boardId,
  aiEnabled,
}: {
  boardId: string;
  aiEnabled: boolean;
}) {
  const { participant, setName } = useParticipant();
  const { state, error, refresh, mutate } = useBoard(boardId, participant);

  const runAi = useCallback(
    async (action: string, options?: { apply?: boolean }) => {
      const response = await fetch(`/api/boards/${boardId}/ai`, {
        method: "POST",
        headers: participantHeaders(participant),
        body: JSON.stringify({ action, ...options }),
      });
      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(payload?.fix ?? payload?.error ?? "The request failed");
      }
      // Passes that persist their result need the board re-read for everyone.
      if (payload?.state) await refresh({ force: true });
      return payload as AiPayload | null;
    },
    [boardId, participant, refresh],
  );

  if (error) {
    return (
      <Notice title={error.error}>
        {error.fix ?? "Try reloading the page."}
      </Notice>
    );
  }

  if (!state || !participant) {
    return (
      <div className="mx-auto w-full max-w-md px-6 py-24">
        <Shimmer lines={4} />
      </div>
    );
  }

  const budget = state.board.votesPerParticipant;
  const canVote = budget === 0 || state.votesUsed < budget;

  const patchBoard = (patch: Record<string, unknown>) =>
    mutate("", { method: "PATCH", body: JSON.stringify(patch) });

  return (
    <>
      <BoardHeader
        board={state.board}
        votesUsed={state.votesUsed}
        participantName={participant.name}
        onRename={(title) => patchBoard({ title })}
        onPhase={(phase: Phase) => patchBoard({ phase })}
        onMask={(masked) => patchBoard({ masked })}
        onName={setName}
      />

      <main className="mx-auto flex w-full max-w-[110rem] flex-1 flex-col gap-6 px-4 py-6 sm:px-6 lg:flex-row lg:items-start">
        <div className="min-w-0 flex-1 overflow-x-auto pb-4">
          <div className="flex gap-4">
            {state.columns.map((column) => (
              <BoardColumn
                key={column.id}
                column={column}
                cards={state.cards.filter((card) => card.columnId === column.id)}
                themes={state.themes}
                phase={state.board.phase}
                participantId={participant.id}
                canVote={canVote}
                onAdd={(text) =>
                  mutate(
                    "/cards",
                    {
                      method: "POST",
                      body: JSON.stringify({ columnId: column.id, text }),
                    },
                    // Paint the card immediately; the refresh replaces the temp id.
                    (current) => ({
                      ...current,
                      cards: [
                        ...current.cards,
                        {
                          id: `pending-${Math.random()}`,
                          columnId: column.id,
                          themeId: null,
                          text,
                          authorId: participant.id,
                          authorName: participant.name || "Anonymous",
                          votes: 0,
                          votedByMe: false,
                          masked: false,
                          createdAt: new Date().toISOString(),
                        },
                      ],
                    }),
                  )
                }
                onVote={(cardId) =>
                  mutate(`/cards/${cardId}/vote`, { method: "POST" }, (current) =>
                    toggleVoteLocally(current, cardId),
                  )
                }
                onEdit={(cardId, text) =>
                  mutate(`/cards/${cardId}`, {
                    method: "PATCH",
                    body: JSON.stringify({ text }),
                  })
                }
                onDelete={(cardId) =>
                  mutate(`/cards/${cardId}`, { method: "DELETE" }, (current) => ({
                    ...current,
                    cards: current.cards.filter((card) => card.id !== cardId),
                  }))
                }
              />
            ))}
          </div>
        </div>

        <aside className="flex w-full shrink-0 flex-col gap-4 lg:sticky lg:top-20 lg:w-[20rem]">
          <AiPanel
            state={state}
            aiEnabled={aiEnabled}
            run={runAi}
            onAcceptAction={(text) =>
              mutate("/actions", { method: "POST", body: JSON.stringify({ text }) })
            }
          />

          <ActionsPanel
            items={state.actionItems}
            onAdd={(text) =>
              mutate("/actions", { method: "POST", body: JSON.stringify({ text }) })
            }
            onToggle={(itemId, done) =>
              mutate(
                `/actions/${itemId}`,
                { method: "PATCH", body: JSON.stringify({ done }) },
                (current) => ({
                  ...current,
                  actionItems: current.actionItems.map((item) =>
                    item.id === itemId ? { ...item, done } : item,
                  ),
                }),
              )
            }
            onDelete={(itemId) =>
              mutate(`/actions/${itemId}`, { method: "DELETE" }, (current) => ({
                ...current,
                actionItems: current.actionItems.filter((item) => item.id !== itemId),
              }))
            }
          />

          {!canVote && (
            <p className="px-1 text-[11px] text-mist-700">
              You&rsquo;ve spent all {budget} votes. Remove one to move it elsewhere.
            </p>
          )}
        </aside>
      </main>
    </>
  );
}

/** Local mirror of the server's toggle, so a vote feels instant. */
function toggleVoteLocally(current: BoardState, cardId: string): BoardState {
  const card = current.cards.find((candidate) => candidate.id === cardId);
  if (!card) return current;

  const budget = current.board.votesPerParticipant;
  if (!card.votedByMe && budget > 0 && current.votesUsed >= budget) return current;

  return {
    ...current,
    votesUsed: current.votesUsed + (card.votedByMe ? -1 : 1),
    cards: current.cards.map((candidate) =>
      candidate.id === cardId
        ? {
            ...candidate,
            votedByMe: !candidate.votedByMe,
            votes: candidate.votes + (candidate.votedByMe ? -1 : 1),
          }
        : candidate,
    ),
  };
}

function Notice({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-md rounded-2xl border border-tone-idea/20 bg-tone-idea/6 px-5 py-4">
      <p className="text-sm font-semibold text-tone-idea">{title}</p>
      <p className="mt-1 text-[13px] leading-relaxed text-mist-300">{children}</p>
    </div>
  );
}
