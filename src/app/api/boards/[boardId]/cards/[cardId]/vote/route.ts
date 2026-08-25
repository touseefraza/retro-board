import { toggleVote } from "@/lib/repo";
import { fail, ok, participant, readJson, route } from "@/lib/http";

type Ctx = { params: Promise<{ boardId: string; cardId: string }> };

/** POST /api/boards/:id/cards/:cardId/vote — toggles this participant's vote. */
export const POST = route(async (request: Request, ctx: Ctx) => {
  const { boardId, cardId } = await ctx.params;
  const body = await readJson<{ participantId?: string }>(request);
  const voter = participant(request, body);

  const result = await toggleVote(boardId, cardId, voter.id);
  if (!result) return fail(409, "Out of votes, or card not found");
  return ok(result);
});
