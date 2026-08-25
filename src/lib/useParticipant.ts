"use client";

import { useCallback, useSyncExternalStore } from "react";
import { defaultName } from "./names";

const ID_KEY = "retro:participant-id";
const NAME_KEY = "retro:participant-name";

export type Participant = { id: string; name: string };

/**
 * Identity without accounts: a random id in localStorage plus a display name.
 *
 * localStorage is an external store, so it's read through `useSyncExternalStore`
 * rather than an effect — the server snapshot is `null`, which is what keeps the
 * first paint identical on both sides of hydration.
 */
let snapshot: Participant | null = null;
const listeners = new Set<() => void>();

function readSnapshot(): Participant {
  if (snapshot) return snapshot;
  let id = localStorage.getItem(ID_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(ID_KEY, id);
  }

  // Everyone gets a readable name on arrival, so cards and cursors are never
  // attributed to "Anonymous". Persisted so it survives a rename back to blank.
  let name = localStorage.getItem(NAME_KEY);
  if (!name) {
    name = defaultName(id);
    localStorage.setItem(NAME_KEY, name);
  }

  snapshot = { id, name };
  return snapshot;
}

function subscribe(onChange: () => void): () => void {
  listeners.add(onChange);
  return () => listeners.delete(onChange);
}

export function useParticipant(): {
  participant: Participant | null;
  setName: (name: string) => void;
} {
  const participant = useSyncExternalStore(subscribe, readSnapshot, () => null);

  const setName = useCallback((name: string) => {
    const current = readSnapshot();
    // Clearing the field hands the name back to the generated one rather than
    // leaving a nameless participant on the board.
    const next = name.trim() ? name.slice(0, 60) : defaultName(current.id);
    localStorage.setItem(NAME_KEY, next);
    snapshot = { ...current, name: next };
    for (const listener of listeners) listener();
  }, []);

  return { participant, setName };
}

/** Headers that attribute a request to this participant. */
export function participantHeaders(participant: Participant | null): HeadersInit {
  if (!participant) return { "content-type": "application/json" };
  return {
    "content-type": "application/json",
    "x-participant-id": participant.id,
    "x-participant-name": encodeURIComponent(participant.name || "Anonymous"),
  };
}
