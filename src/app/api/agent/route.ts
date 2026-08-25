import { TOOL_MANIFEST } from "@/lib/mcp";
import { TEMPLATES } from "@/lib/types";

/**
 * GET /api/agent — a self-describing index for AI agents and humans wiring up
 * an integration. Lists the REST surface and the MCP tool manifest in one place.
 */
export async function GET(request: Request) {
  const origin = new URL(request.url).origin;

  return Response.json({
    name: "retro-board",
    description:
      "A retrospective board with a Claude-powered facilitator. No accounts, no setup — " +
      "create a board, share the link, run the retro.",
    mcp: {
      transport: "streamable-http (stateless)",
      endpoint: `${origin}/api/mcp`,
      tools: TOOL_MANIFEST,
    },
    rest: {
      "POST   /api/boards": "Create a board. Body: { title?, template?, votesPerParticipant? }",
      "GET    /api/boards/:id": "Full board state. Add ?since=<version> to poll cheaply.",
      "PATCH  /api/boards/:id": "Facilitator controls: { title?, phase?, masked?, votesPerParticipant? }",
      "POST   /api/boards/:id/cards": "Add a card. Body: { columnId, text, participantName? }",
      "PATCH  /api/boards/:id/cards/:cardId": "Edit or move a card: { text?, columnId?, themeId? }",
      "DELETE /api/boards/:id/cards/:cardId": "Remove a card",
      "POST   /api/boards/:id/cards/:cardId/vote": "Toggle a vote",
      "POST   /api/boards/:id/actions": "Add an action item: { text, owner? }",
      "PATCH  /api/boards/:id/actions/:itemId": "Update: { text?, owner?, done? }",
      "DELETE /api/boards/:id/actions/:itemId": "Remove an action item",
      "POST   /api/boards/:id/ai": "Run Claude. Body: { action: 'themes'|'summary'|'actions'|'nudge', apply? }",
    },
    identity:
      "There are no accounts. Send x-participant-id and x-participant-name headers, or " +
      "participantId/participantName in the body, to attribute cards and track votes.",
    templates: Object.fromEntries(
      Object.entries(TEMPLATES).map(([id, template]) => [
        id,
        { name: template.name, columns: template.columns.map((column) => column.title) },
      ]),
    ),
  });
}
