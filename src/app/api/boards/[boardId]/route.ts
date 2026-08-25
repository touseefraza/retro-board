import { getBoardState, getBoardVersion, updateBoard } from "@/lib/repo";
import { fail, ok, participant, readJson, route } from "@/lib/http";
import { PHASES, type Phase } from "@/lib/types";

type Ctx = { params: Promise<{ boardId: string }> };

/**
 * GET /api/boards/:id — the whole board state.
 *
 * Pass `?since=<version>` to poll: unchanged boards come back as a tiny
 * `{ unchanged: true }` instead of the full payload.
 */
export const GET = route(async (request: Request, ctx: Ctx) => {
  const { boardId } = await ctx.params;
  const viewer = participant(request);
  const since = new URL(request.url).searchParams.get("since");

  if (since !== null) {
    const version = await getBoardVersion(boardId);
    if (version === null) return fail(404, "Board not found");
    if (version === Number(since)) return ok({ unchanged: true, version });
  }

  const state = await getBoardState(boardId, viewer.id);
  if (!state) return fail(404, "Board not found");
  return ok(state);
});

/** PATCH /api/boards/:id — facilitator controls: phase, masking, votes, title. */
export const PATCH = route(async (request: Request, ctx: Ctx) => {
  const { boardId } = await ctx.params;
  const body = await readJson<{
    title?: string;
    phase?: string;
    masked?: boolean;
    votesPerParticipant?: number;
  }>(request);

  if (body.phase !== undefined && !PHASES.includes(body.phase as Phase)) {
    return fail(400, `phase must be one of: ${PHASES.join(", ")}`);
  }

  const updated = await updateBoard(boardId, {
    title: body.title,
    phase: body.phase as Phase | undefined,
    masked: body.masked,
    votesPerParticipant: body.votesPerParticipant,
  });
  if (!updated) return fail(404, "Board not found, or nothing to update");

  const viewer = participant(request, body);
  return ok(await getBoardState(boardId, viewer.id));
});
