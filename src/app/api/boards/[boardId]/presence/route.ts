import { leavePresence, sweepPresence, syncPresence } from "@/lib/repo";
import { fail, ok, participant, readJson, route } from "@/lib/http";

type Ctx = { params: Promise<{ boardId: string }> };

/** How often a sync also clears markers left by tabs that never said goodbye. */
const SWEEP_CHANCE = 0.02;

/**
 * POST /api/boards/:id/presence — report this cursor, receive everyone else's.
 *
 * One request does both halves so a live board costs a single round trip per
 * tick. Send `{ leave: true }` (works with `navigator.sendBeacon`) to disappear
 * immediately instead of waiting for the marker to age out.
 */
export const POST = route(async (request: Request, ctx: Ctx) => {
  const { boardId } = await ctx.params;
  const body = await readJson<{
    x?: number | null;
    y?: number | null;
    leave?: boolean;
    participantId?: string;
    participantName?: string;
  }>(request);

  const viewer = participant(request, body);

  if (body.leave) {
    await leavePresence(boardId, viewer.id);
    return ok({ peers: [] });
  }

  const peers = await syncPresence({
    boardId,
    participantId: viewer.id,
    name: viewer.name,
    x: fraction(body.x),
    y: fraction(body.y),
  });
  if (!peers) return fail(404, "Board not found");

  if (Math.random() < SWEEP_CHANCE) await sweepPresence();

  return ok({ peers });
});

/** Cursors arrive as 0..1 fractions of the board surface; anything else is "no cursor". */
function fraction(value: unknown): number | null {
  if (typeof value !== "number" || !Number.isFinite(value)) return null;
  return Math.min(1, Math.max(0, value));
}
