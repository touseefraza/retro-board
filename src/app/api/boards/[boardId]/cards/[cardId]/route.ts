import { deleteCard, updateCard } from "@/lib/repo";
import { fail, ok, readJson, route } from "@/lib/http";

type Ctx = { params: Promise<{ boardId: string; cardId: string }> };

/** PATCH /api/boards/:id/cards/:cardId — edit text, or move between columns/themes. */
export const PATCH = route(async (request: Request, ctx: Ctx) => {
  const { boardId, cardId } = await ctx.params;
  const body = await readJson<{
    text?: string;
    columnId?: string;
    themeId?: string | null;
  }>(request);

  const updated = await updateCard(boardId, cardId, body);
  if (!updated) return fail(404, "Card not found, or nothing to update");
  return ok({ updated: true });
});

export const DELETE = route(async (_request: Request, ctx: Ctx) => {
  const { boardId, cardId } = await ctx.params;
  const deleted = await deleteCard(boardId, cardId);
  if (!deleted) return fail(404, "Card not found");
  return ok({ deleted: true });
});
