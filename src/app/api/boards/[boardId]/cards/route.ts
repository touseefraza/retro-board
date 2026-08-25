import { addCard } from "@/lib/repo";
import { fail, ok, participant, readJson, route } from "@/lib/http";

type Ctx = { params: Promise<{ boardId: string }> };

/** POST /api/boards/:id/cards — add a sticky note. */
export const POST = route(async (request: Request, ctx: Ctx) => {
  const { boardId } = await ctx.params;
  const body = await readJson<{
    columnId?: string;
    text?: string;
    participantId?: string;
    participantName?: string;
  }>(request);

  if (!body.columnId) return fail(400, "columnId is required");
  if (!body.text?.trim()) return fail(400, "text is required");

  const author = participant(request, body);
  const card = await addCard({
    boardId,
    columnId: body.columnId,
    text: body.text,
    authorId: author.id,
    authorName: author.name,
  });
  if (!card) return fail(404, "Column not found on this board");

  return ok({ card }, { status: 201 });
});
