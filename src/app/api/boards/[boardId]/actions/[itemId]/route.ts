import { deleteActionItem, updateActionItem } from "@/lib/repo";
import { fail, ok, readJson, route } from "@/lib/http";

type Ctx = { params: Promise<{ boardId: string; itemId: string }> };

export const PATCH = route(async (request: Request, ctx: Ctx) => {
  const { boardId, itemId } = await ctx.params;
  const body = await readJson<{ text?: string; owner?: string | null; done?: boolean }>(
    request,
  );

  const updated = await updateActionItem(boardId, itemId, body);
  if (!updated) return fail(404, "Action item not found, or nothing to update");
  return ok({ updated: true });
});

export const DELETE = route(async (_request: Request, ctx: Ctx) => {
  const { boardId, itemId } = await ctx.params;
  const deleted = await deleteActionItem(boardId, itemId);
  if (!deleted) return fail(404, "Action item not found");
  return ok({ deleted: true });
});
