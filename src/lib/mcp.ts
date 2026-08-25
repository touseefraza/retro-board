import {
  clusterThemes,
  facilitatorNudge,
  proposeActions,
  summarizeBoard,
} from "./ai";
import {
  addActionItem,
  addCard,
  createBoard,
  getBoardState,
  replaceAiThemes,
  toggleVote,
  updateBoard,
} from "./repo";
import { PHASES, TEMPLATES, type Phase } from "./types";

type JsonSchema = {
  type: "object";
  properties: Record<string, unknown>;
  required?: string[];
  additionalProperties: false;
};

type ToolInput = Record<string, unknown>;

type Tool = {
  name: string;
  description: string;
  inputSchema: JsonSchema;
  run: (input: ToolInput) => Promise<unknown>;
};

const str = (description: string) => ({ type: "string", description });

/*
 * Agents send arbitrary JSON, so tool arguments are read through these rather
 * than trusted. A missing required field is a clear message, not a crash.
 */
function need(input: ToolInput, key: string): string {
  const value = input[key];
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`"${key}" is required and must be a non-empty string`);
  }
  return value.trim();
}

function text(input: ToolInput, key: string): string | undefined {
  const value = input[key];
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function flag(input: ToolInput, key: string): boolean | undefined {
  const value = input[key];
  return typeof value === "boolean" ? value : undefined;
}

function count(input: ToolInput, key: string): number | undefined {
  const value = input[key];
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

/** The agent-facing surface. Kept deliberately small and verb-shaped. */
export const TOOLS: Tool[] = [
  {
    name: "create_board",
    description:
      "Create a new retrospective board and return its id and shareable URL. " +
      `Templates: ${Object.keys(TEMPLATES).join(", ")}.`,
    inputSchema: {
      type: "object",
      properties: {
        title: str("Board title, e.g. 'Sprint 42 Retro'"),
        template: str("Template id. Defaults to 'classic' (Start/Stop/Continue)."),
        votesPerParticipant: {
          type: "integer",
          description: "Vote budget per person. Defaults to 5. Use 0 for unlimited.",
        },
      },
      additionalProperties: false,
    },
    run: async (input) => {
      const boardId = await createBoard({
        title: text(input, "title"),
        template: text(input, "template"),
        votesPerParticipant: count(input, "votesPerParticipant"),
      });
      return { boardId, path: `/b/${boardId}` };
    },
  },
  {
    name: "get_board",
    description:
      "Read the full board: columns, every card with its vote count, themes, and action items. " +
      "Card masking never applies to this tool.",
    inputSchema: {
      type: "object",
      properties: { boardId: str("The board id") },
      required: ["boardId"],
      additionalProperties: false,
    },
    run: async (input) => {
      const boardId = need(input, "boardId");
      const state = await getBoardState(boardId, "__agent__", { ignoreMasking: true });
      if (!state) throw new Error(`No board with id "${boardId}"`);
      return {
        board: state.board,
        columns: state.columns,
        cards: state.cards.map((card) => ({
          id: card.id,
          columnId: card.columnId,
          themeId: card.themeId,
          text: card.text,
          author: card.authorName,
          votes: card.votes,
        })),
        themes: state.themes,
        actionItems: state.actionItems,
      };
    },
  },
  {
    name: "add_card",
    description:
      "Post a sticky note to a column. Call get_board first to find the column id you want.",
    inputSchema: {
      type: "object",
      properties: {
        boardId: str("The board id"),
        columnId: str("Target column id, from get_board"),
        text: str("The card text. One idea per card."),
        author: str("Display name to attribute the card to. Defaults to 'Agent'."),
      },
      required: ["boardId", "columnId", "text"],
      additionalProperties: false,
    },
    run: async (input) => {
      const author = text(input, "author") ?? "Agent";
      const card = await addCard({
        boardId: need(input, "boardId"),
        columnId: need(input, "columnId"),
        text: need(input, "text"),
        authorId: `agent:${author}`,
        authorName: author,
      });
      if (!card) throw new Error("Column not found on that board");
      return { cardId: card.id };
    },
  },
  {
    name: "vote_card",
    description:
      "Toggle a vote on a card. Votes are per voter id, so pass a stable voterId.",
    inputSchema: {
      type: "object",
      properties: {
        boardId: str("The board id"),
        cardId: str("The card id"),
        voterId: str("Stable identifier for the voter. Defaults to 'agent'."),
      },
      required: ["boardId", "cardId"],
      additionalProperties: false,
    },
    run: async (input) => {
      const result = await toggleVote(
        need(input, "boardId"),
        need(input, "cardId"),
        text(input, "voterId") ?? "agent",
      );
      if (!result) throw new Error("Out of votes, or card not found");
      return result;
    },
  },
  {
    name: "set_phase",
    description:
      `Move the board through the retro. Phases: ${PHASES.join(" → ")}. ` +
      "Optionally toggle masking, which hides other people's cards during collection.",
    inputSchema: {
      type: "object",
      properties: {
        boardId: str("The board id"),
        phase: { type: "string", enum: [...PHASES], description: "Target phase" },
        masked: { type: "boolean", description: "Hide other participants' card text" },
      },
      required: ["boardId"],
      additionalProperties: false,
    },
    run: async (input) => {
      const phase = text(input, "phase");
      if (phase && !PHASES.includes(phase as Phase)) {
        throw new Error(`phase must be one of: ${PHASES.join(", ")}`);
      }
      const updated = await updateBoard(need(input, "boardId"), {
        phase: phase as Phase | undefined,
        masked: flag(input, "masked"),
      });
      if (!updated) throw new Error("Board not found, or nothing to update");
      return { updated: true };
    },
  },
  {
    name: "add_action_item",
    description: "Record a follow-up action on the board.",
    inputSchema: {
      type: "object",
      properties: {
        boardId: str("The board id"),
        text: str("The action, starting with a verb"),
        owner: str("Who owns it, if known"),
      },
      required: ["boardId", "text"],
      additionalProperties: false,
    },
    run: async (input) => {
      const item = await addActionItem({
        boardId: need(input, "boardId"),
        text: need(input, "text"),
        owner: text(input, "owner"),
        source: "ai",
      });
      if (!item) throw new Error("Board not found");
      return { itemId: item.id };
    },
  },
  {
    name: "group_cards",
    description:
      "Run Claude's clustering pass: groups the board's cards into named themes and saves them.",
    inputSchema: {
      type: "object",
      properties: { boardId: str("The board id") },
      required: ["boardId"],
      additionalProperties: false,
    },
    run: async (input) => {
      const boardId = need(input, "boardId");
      const state = await getBoardState(boardId, "__agent__", { ignoreMasking: true });
      if (!state) throw new Error("Board not found");
      const themes = await clusterThemes(state.board);
      if (!themes.length) throw new Error("Not enough cards to find themes yet");
      await replaceAiThemes(boardId, themes);
      return { themes };
    },
  },
  {
    name: "summarize_board",
    description:
      "Run Claude's retro summary and save it to the board. Returns the headline, summary, and signals.",
    inputSchema: {
      type: "object",
      properties: { boardId: str("The board id") },
      required: ["boardId"],
      additionalProperties: false,
    },
    run: async (input) => {
      const boardId = need(input, "boardId");
      const state = await getBoardState(boardId, "__agent__", { ignoreMasking: true });
      if (!state) throw new Error("Board not found");
      const summary = await summarizeBoard(state.board);
      if (!summary) throw new Error("The board is empty");
      await updateBoard(boardId, {
        summary: `**${summary.headline}**\n\n${summary.summary}`,
      });
      return summary;
    },
  },
  {
    name: "suggest_actions",
    description:
      "Ask Claude for action items based on the board. Set apply=true to write them to the board.",
    inputSchema: {
      type: "object",
      properties: {
        boardId: str("The board id"),
        apply: { type: "boolean", description: "Save the proposals to the board" },
      },
      required: ["boardId"],
      additionalProperties: false,
    },
    run: async (input) => {
      const boardId = need(input, "boardId");
      const state = await getBoardState(boardId, "__agent__", { ignoreMasking: true });
      if (!state) throw new Error("Board not found");
      const proposals = await proposeActions(state.board);
      const apply = flag(input, "apply") ?? false;
      if (apply) {
        for (const proposal of proposals) {
          await addActionItem({ boardId, text: proposal.text, source: "ai" });
        }
      }
      return { proposals, applied: apply };
    },
  },
  {
    name: "facilitator_nudge",
    description:
      "Ask Claude what to say next when the room has gone quiet. Returns prompts to read aloud. Never modifies the board.",
    inputSchema: {
      type: "object",
      properties: { boardId: str("The board id") },
      required: ["boardId"],
      additionalProperties: false,
    },
    run: async (input) => {
      const state = await getBoardState(need(input, "boardId"), "__agent__", { ignoreMasking: true });
      if (!state) throw new Error("Board not found");
      return (await facilitatorNudge(state.board)) ?? {};
    },
  },
];

export const TOOL_MANIFEST = TOOLS.map(({ name, description, inputSchema }) => ({
  name,
  description,
  inputSchema,
}));
