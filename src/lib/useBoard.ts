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
  /**
   * Tagged with the board it belongs to, so state from a previous board is
   * never rendered under a new board's URL — see the note on versionRef.
   */
  const [loaded, setLoaded] = useState<{ boardId: string; data: BoardState } | null>(
    null,
  );
  const state = loaded?.boardId === boardId ? loaded.data : null;
  const [error, setError] = useState<ApiError | null>(null);
  const [pending, setPending] = useState(false);

  /**
   * The last version seen, tagged with the board it belongs to.
   *
   * Navigating between two boards reuses this component, so a bare version
   * would survive the change of id — and the next poll would ask the new
   * board `?since=` the old board's version. Two boards that happen to share
   * a version (two fresh ones are both at 0) answer `unchanged`, which would
   * leave the previous board on screen under the new board's URL. Pairing the
   * two means a stale version can be recognised and discarded.
   */
  const versionRef = useRef<{ boardId: string; version: number }>({
    boardId,
    version: -1,
  });

  const refresh = useCallback(
    async (options?: { force?: boolean }) => {
      if (!participant) return;

      // First read after a board change is always a full one, and the
      // previous board's error must not survive the move.
      if (versionRef.current.boardId !== boardId) {
        versionRef.current = { boardId, version: -1 };
        setError(null);
      }
      const since = options?.force ? "" : `&since=${versionRef.current.version}`;
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

      versionRef.current = { boardId, version: payload.board.version };
      setLoaded({ boardId, data: payload as BoardState });
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
      if (optimistic) {
        setLoaded((current) =>
          current?.boardId === boardId
            ? { boardId, data: optimistic(current.data) }
            : current,
        );
      }

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
