"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { participantHeaders, type Participant } from "./useParticipant";
import type { BoardState } from "./types";

const POLL_INTERVAL = 1500;
const IDLE_POLL_INTERVAL = 8000;

type ApiError = { error: string; fix?: string };

/**
 * Keeps board state in sync by polling `?since=<version>`. The server answers an
 * unchanged board with a few bytes, so this stays cheap enough to feel live
 * without needing a websocket — which also means it works on serverless.
 */
export function useBoard(boardId: string, participant: Participant | null) {
  const [state, setState] = useState<BoardState | null>(null);
  const [error, setError] = useState<ApiError | null>(null);
  const [pending, setPending] = useState(false);

  // Read inside the poll loop without making it a dependency.
  const versionRef = useRef<number>(-1);

  const refresh = useCallback(
    async (options?: { force?: boolean }) => {
      if (!participant) return;
      const since = options?.force ? "" : `&since=${versionRef.current}`;
      const response = await fetch(
        `/api/boards/${boardId}?viewer=${encodeURIComponent(participant.id)}${since}`,
        { cache: "no-store" },
      );

      if (!response.ok) {
        setError((await response.json().catch(() => null)) ?? { error: "Request failed" });
        return;
      }

      const payload = await response.json();
      setError(null);
      if (payload.unchanged) return;

      versionRef.current = payload.board.version;
      setState(payload as BoardState);
    },
    [boardId, participant],
  );

  useEffect(() => {
    if (!participant) return;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;

    const tick = async () => {
      if (cancelled) return;
      if (!document.hidden) await refresh();
      if (cancelled) return;
      timer = setTimeout(tick, document.hidden ? IDLE_POLL_INTERVAL : POLL_INTERVAL);
    };

    void tick();
    // A tab coming back to the foreground should catch up immediately.
    const onVisible = () => {
      if (!document.hidden) void refresh();
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      cancelled = true;
      clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [participant, refresh]);

  /**
   * Fire a mutation, optionally painting the result locally first. On failure
   * the optimistic patch is discarded by the refresh that follows.
   */
  const mutate = useCallback(
    async (
      path: string,
      init: RequestInit,
      optimistic?: (current: BoardState) => BoardState,
    ): Promise<boolean> => {
      if (optimistic) setState((current) => (current ? optimistic(current) : current));

      setPending(true);
      try {
        const response = await fetch(`/api/boards/${boardId}${path}`, {
          ...init,
          headers: { ...participantHeaders(participant), ...init.headers },
        });
        if (!response.ok) {
          setError((await response.json().catch(() => null)) ?? { error: "Request failed" });
          await refresh({ force: true });
          return false;
        }
        setError(null);
        await refresh({ force: true });
        return true;
      } finally {
        setPending(false);
      }
    },
    [boardId, participant, refresh],
  );

  return { state, error, pending, refresh, mutate, setError };
}
