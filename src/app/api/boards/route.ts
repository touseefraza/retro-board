import { createBoard } from "@/lib/repo";
import { ok, readJson, route } from "@/lib/http";

/** POST /api/boards — create a board. Everything is optional. */
export const POST = route(async (request: Request) => {
  const body = await readJson<{
    title?: string;
    template?: string;
    votesPerParticipant?: number;
  }>(request);

  const boardId = await createBoard(body);
  const url = new URL(`/b/${boardId}`, request.url).toString();
  return ok({ boardId, url }, { status: 201 });
});
