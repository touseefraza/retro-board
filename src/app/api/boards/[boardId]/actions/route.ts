import { addActionItem } from "@/lib/repo";
import { fail, ok, readJson, route } from "@/lib/http";

type Ctx = { params: Promise<{ boardId: string }> };

/** POST /api/boards/:id/actions — add an action item. */
export const POST = route(async (request: Request, ctx: Ctx) => {
  const { boardId } = await ctx.params;
  const body = await readJson<{ text?: string; owner?: string }>(request);
  if (!body.text?.trim()) return fail(400, "text is required");

  const item = await addActionItem({ boardId, text: body.text, owner: body.owner });
  if (!item) return fail(404, "Board not found");
  return ok({ item }, { status: 201 });
});
