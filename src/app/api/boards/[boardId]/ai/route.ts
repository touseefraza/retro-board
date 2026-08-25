import {
  clusterThemes,
  facilitatorNudge,
  proposeActions,
  summarizeBoard,
} from "@/lib/ai";
import { addActionItem, getBoardState, replaceAiThemes, updateBoard } from "@/lib/repo";
import { fail, ok, participant, readJson, route } from "@/lib/http";

type Ctx = { params: Promise<{ boardId: string }> };

const ACTIONS = ["themes", "summary", "actions", "nudge"] as const;
type AiAction = (typeof ACTIONS)[number];

/**
 * POST /api/boards/:id/ai — run one of the four Claude passes.
 *
 * `themes` and `summary` persist their result to the board so every participant
 * sees it. `actions` returns proposals for the facilitator to accept, unless
 * `apply: true` is passed. `nudge` is ephemeral and never written.
 */
export const POST = route(async (request: Request, ctx: Ctx) => {
  const { boardId } = await ctx.params;
  const body = await readJson<{ action?: string; apply?: boolean }>(request);
  const action = body.action as AiAction | undefined;

  if (!action || !ACTIONS.includes(action)) {
    return fail(400, `action must be one of: ${ACTIONS.join(", ")}`);
  }

  const viewer = participant(request, body);
  const state = await getBoardState(boardId, viewer.id);
  if (!state) return fail(404, "Board not found");

  switch (action) {
    case "themes": {
      const themes = await clusterThemes(state.board);
      if (!themes.length) return fail(422, "Not enough cards to find themes yet");
      await replaceAiThemes(boardId, themes);
      return ok({ action, state: await getBoardState(boardId, viewer.id) });
    }

    case "summary": {
      const summary = await summarizeBoard(state.board);
      if (!summary) return fail(422, "The board is empty");
      const text = `**${summary.headline}**\n\n${summary.summary}\n\n**Worth watching**\n${summary.signals
        .map((signal) => `- ${signal}`)
        .join("\n")}`;
      await updateBoard(boardId, { summary: text });
      return ok({ action, summary, state: await getBoardState(boardId, viewer.id) });
    }

    case "actions": {
      const proposals = await proposeActions(state.board);
      if (!proposals.length) return fail(422, "The board is empty");
      if (body.apply) {
        for (const proposal of proposals) {
          await addActionItem({ boardId, text: proposal.text, source: "ai" });
        }
        return ok({ action, proposals, state: await getBoardState(boardId, viewer.id) });
      }
      return ok({ action, proposals });
    }

    case "nudge": {
      const nudge = await facilitatorNudge(state.board);
      if (!nudge) return fail(422, "Could not read the board");
      return ok({ action, nudge });
    }
  }
});
