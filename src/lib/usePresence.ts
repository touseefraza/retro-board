"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import { participantHeaders, type Participant } from "./useParticipant";
import type { Peer } from "./types";

/** Cursor tick. Fast enough to feel live, slow enough for a serverless budget. */
export const PRESENCE_INTERVAL = 1000;

/**
 * Live cursors over the same polling transport the board itself uses.
 *
 * Each tick posts this participant's cursor and receives everyone else's, so
 * presence costs one request per second per open tab and needs no websocket —
 * which is what lets it run on serverless.
 *
 * Coordinates are fractions of `surfaceRef`'s box rather than screen pixels, so
 * a cursor lands on the same column regardless of window size.
 */
export function usePresence(
  boardId: string,
  participant: Participant | null,
  surfaceRef: RefObject<HTMLElement | null>,
): Peer[] {
  const [peers, setPeers] = useState<Peer[]>([]);

  // Written by pointermove, read by the tick — deliberately not state, so
  // moving the mouse doesn't re-render the board on every frame.
  const cursor = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const surface = surfaceRef.current;
    if (!surface) return;

    const onMove = (event: PointerEvent) => {
      const rect = surface.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      cursor.current = {
        x: (event.clientX - rect.left) / rect.width,
        y: (event.clientY - rect.top) / rect.height,
      };
    };
    const onLeave = () => {
      cursor.current = null;
    };

    surface.addEventListener("pointermove", onMove);
    surface.addEventListener("pointerleave", onLeave);
    return () => {
      surface.removeEventListener("pointermove", onMove);
      surface.removeEventListener("pointerleave", onLeave);
    };
  }, [surfaceRef]);

  useEffect(() => {
    if (!participant) return;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;

    const url = `/api/boards/${boardId}/presence`;

    const tick = async () => {
      if (cancelled) return;
      // A hidden tab stops reporting and ages out of everyone else's board,
      // which is the honest answer to "is this person here?".
      if (!document.hidden) {
        try {
          const response = await fetch(url, {
            method: "POST",
            headers: participantHeaders(participant),
            body: JSON.stringify(cursor.current ?? { x: null, y: null }),
            cache: "no-store",
          });
          if (response.ok) {
            const payload = await response.json();
            if (!cancelled) setPeers(payload.peers ?? []);
          }
        } catch {
          // A dropped tick is not worth surfacing; the next one recovers.
        }
      } else if (!cancelled) {
        setPeers([]);
      }

      if (!cancelled) timer = setTimeout(tick, PRESENCE_INTERVAL);
    };

    void tick();

    /** Leave the board the moment the tab goes away, not 15s later. */
    const leave = () => {
      const body = new Blob(
        [
          JSON.stringify({
            leave: true,
            participantId: participant.id,
            participantName: participant.name,
          }),
        ],
        { type: "application/json" },
      );
      navigator.sendBeacon(url, body);
    };
    window.addEventListener("pagehide", leave);

    return () => {
      cancelled = true;
      clearTimeout(timer);
      window.removeEventListener("pagehide", leave);
      leave();
    };
  }, [boardId, participant]);

  return peers;
}
