"use client";

import { hue, initials } from "@/lib/names";
import { PRESENCE_INTERVAL } from "@/lib/usePresence";
import type { Peer } from "@/lib/types";
import type { Participant } from "@/lib/useParticipant";

/** A cursor that hasn't moved in this long fades back, so idle tabs stay quiet. */
const IDLE_AFTER = 5000;

function colorOf(id: string): string {
  return `hsl(${hue(id)} 85% 62%)`;
}

/**
 * Other people's cursors, painted over the board surface.
 *
 * Positions arrive once per tick, so each cursor animates to its next spot over
 * exactly one interval — that interpolation is what turns 1 Hz polling into
 * motion that reads as live.
 */
export function Cursors({ peers }: { peers: Peer[] }) {
  const visible = peers.filter((peer) => peer.x !== null && peer.y !== null);

  return (
    <div className="pointer-events-none absolute inset-0 z-30 overflow-hidden">
      {visible.map((peer) => (
        <div
          key={peer.id}
          style={{
            left: `${(peer.x as number) * 100}%`,
            top: `${(peer.y as number) * 100}%`,
            transitionDuration: `${PRESENCE_INTERVAL}ms`,
            opacity: peer.idleMs > IDLE_AFTER ? 0.45 : 1,
          }}
          className="absolute transition-[left,top,opacity] ease-linear"
        >
          <svg
            viewBox="0 0 16 16"
            className="h-4 w-4 drop-shadow-[0_1px_3px_rgba(0,0,0,0.6)]"
            style={{ color: colorOf(peer.id) }}
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M2 1.5 13 7.2 8.2 8.6 6.6 13.5z" stroke="rgba(0,0,0,0.35)" strokeWidth="1" />
          </svg>
          <span
            style={{ backgroundColor: colorOf(peer.id) }}
            className="ml-3 inline-block max-w-[12rem] truncate rounded-md px-1.5 py-0.5 text-[11px] font-semibold text-ink-950 shadow-sm"
          >
            {peer.name}
          </span>
        </div>
      ))}
    </div>
  );
}

/** Avatar stack of everyone on the board, this participant first. */
export function PresenceBar({ self, peers }: { self: Participant; peers: Peer[] }) {
  const everyone = [
    { id: self.id, name: `${self.name} (you)` },
    ...peers.map((peer) => ({ id: peer.id, name: peer.name })),
  ];
  const shown = everyone.slice(0, 5);
  const overflow = everyone.length - shown.length;

  return (
    <div className="flex items-center" title={everyone.map((one) => one.name).join(", ")}>
      <div className="flex -space-x-1.5">
        {shown.map((one) => (
          <span
            key={one.id}
            title={one.name}
            style={{ backgroundColor: colorOf(one.id) }}
            className="flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold text-ink-950 ring-2 ring-ink-950"
          >
            {initials(one.name)}
          </span>
        ))}
      </div>
      {overflow > 0 && (
        <span className="ml-1.5 text-[11px] tabular-nums text-mist-700">+{overflow}</span>
      )}
    </div>
  );
}
