"use client";

import { useCallback, useSyncExternalStore } from "react";

const ID_KEY = "retro:participant-id";
const NAME_KEY = "retro:participant-name";

export type Participant = { id: string; name: string };

/**
 * Identity without accounts: a random id in localStorage plus a display name.
 *
 * localStorage is an external store, so it's read through `useSyncExternalStore`
 * rather than an effect — the server snapshot is `null`, which is what keeps the
 * first paint identical on both sides of hydration.
 *
 * The name starts empty on purpose: `NameGate` blocks the board until someone
 * picks one, so cards and cursors always carry a real name.
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
  snapshot = { id, name: localStorage.getItem(NAME_KEY)?.trim() ?? "" };
  return snapshot;
}

function subscribe(onChange: () => void): () => void {
  listeners.add(onChange);
  return () => listeners.delete(onChange);
}

export function useParticipant(): {
  participant: Participant | null;
  /** False until a name has been chosen — the board stays gated until it's true. */
  hasName: boolean;
  setName: (name: string) => void;
} {
  const participant = useSyncExternalStore(subscribe, readSnapshot, () => null);

  const setName = useCallback((name: string) => {
    const trimmed = name.trim().slice(0, 60);
    // A name is required, so an empty submission leaves the current one alone
    // rather than dropping the participant back to nameless.
    if (!trimmed) return;
    localStorage.setItem(NAME_KEY, trimmed);
    snapshot = { ...readSnapshot(), name: trimmed };
    for (const listener of listeners) listener();
  }, []);

  return { participant, hasName: Boolean(participant?.name), setName };
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
