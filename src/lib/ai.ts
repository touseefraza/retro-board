import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod";
import { getCardsForAnalysis } from "./repo";
import type { Board } from "./types";

const MODEL = "claude-opus-5";

export class AiNotConfiguredError extends Error {
  constructor() {
    super("ANTHROPIC_API_KEY is not set");
    this.name = "AiNotConfiguredError";
  }
}

export function isAiConfigured(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_AUTH_TOKEN);
}

let client: Anthropic | null = null;
function anthropic(): Anthropic {
  if (!isAiConfigured()) throw new AiNotConfiguredError();
  client ??= new Anthropic();
  return client;
}

const FACILITATOR = `You are an experienced agile facilitator running a team retrospective.
You read the board's raw sticky notes and help the team see what actually matters.

Rules you always follow:
- Ground everything in what the cards actually say. Never invent events, names, or metrics.
- Be specific and concrete. "Deploys are slow" beats "improve process".
- Stay neutral about people. Critique systems and workflows, never individuals.
- Prefer plain language. No corporate filler, no praise sandwiches, no emoji.`;

type AnalysisCard = Awaited<ReturnType<typeof getCardsForAnalysis>>[number];

/** One compact, stable rendering of the board that every prompt shares. */
function renderBoard(board: Board, cards: AnalysisCard[]): string {
  const byColumn = new Map<string, AnalysisCard[]>();
  for (const card of cards) {
    const bucket = byColumn.get(card.column);
    if (bucket) bucket.push(card);
    else byColumn.set(card.column, [card]);
  }

  const sections = [...byColumn].map(([column, items]) => {
    const lines = items.map(
      (card) => `  - [${card.id}] (${card.votes} votes) ${card.text}`,
    );
    return `Column "${column}" (tone: ${items[0].tone}):\n${lines.join("\n")}`;
  });

  return [
    `Retro board: ${board.title}`,
    `Phase: ${board.phase}`,
    `Total cards: ${cards.length}`,
    "",
    sections.join("\n\n") || "(no cards yet)",
  ].join("\n");
}

async function loadContext(board: Board) {
  const cards = await getCardsForAnalysis(board.id);
  return { cards, context: renderBoard(board, cards) };
}

const ThemesSchema = z.object({
  themes: z
    .array(
      z.object({
        label: z
          .string()
          .describe("Short theme name, 2-5 words, in the team's own vocabulary"),
        summary: z
          .string()
          .describe("One sentence on what the grouped cards have in common"),
        cardIds: z
          .array(z.string())
          .describe("Ids of the cards in this theme, copied exactly from the board"),
      }),
    )
    .describe("Themes ordered by importance, most significant first"),
});

export type ThemeResult = z.infer<typeof ThemesSchema>["themes"];

/** Groups the board's cards into named themes. */
export async function clusterThemes(board: Board): Promise<ThemeResult> {
  const { cards, context } = await loadContext(board);
  if (cards.length < 2) return [];

  const response = await anthropic().messages.parse({
    model: MODEL,
    max_tokens: 16000,
    system: FACILITATOR,
    thinking: { type: "adaptive" },
    output_config: { format: zodOutputFormat(ThemesSchema), effort: "medium" },
    messages: [
      {
        role: "user",
        content: `${context}

Group these cards into themes. Aim for 3-6 themes for a board this size — fewer if the
board is small. Every card id must appear in exactly one theme; if a card doesn't fit
anywhere, give it its own theme rather than forcing it. Use only card ids that appear
above.`,
      },
    ],
  });

  return response.parsed_output?.themes ?? [];
}

const SummarySchema = z.object({
  headline: z.string().describe("One line capturing the sprint's real story"),
  summary: z
    .string()
    .describe(
      "3-6 short markdown paragraphs or bullets covering what went well, what hurt, and the tensions between them",
    ),
  signals: z
    .array(z.string())
    .describe("2-4 things worth watching that the team may not have named explicitly"),
});

export type SummaryResult = z.infer<typeof SummarySchema>;

export async function summarizeBoard(board: Board): Promise<SummaryResult | null> {
  const { cards, context } = await loadContext(board);
  if (!cards.length) return null;

  const response = await anthropic().messages.parse({
    model: MODEL,
    max_tokens: 16000,
    system: FACILITATOR,
    thinking: { type: "adaptive" },
    output_config: { format: zodOutputFormat(SummarySchema), effort: "high" },
    messages: [
      {
        role: "user",
        content: `${context}

Write the retro summary the team would actually read tomorrow. Weight cards by their
vote counts — heavily voted cards are what the team cares about. Name the tension the
board reveals, even when it's uncomfortable. Do not list every card back.`,
      },
    ],
  });

  return response.parsed_output ?? null;
}

const ActionsSchema = z.object({
  actions: z
    .array(
      z.object({
        text: z
          .string()
          .describe("A concrete action starting with a verb, doable within one sprint"),
        rationale: z.string().describe("The card or pattern this action responds to"),
      }),
    )
    .describe("Ordered by expected impact, highest first"),
});

export type ActionResult = z.infer<typeof ActionsSchema>["actions"];

export async function proposeActions(board: Board): Promise<ActionResult> {
  const { cards, context } = await loadContext(board);
  if (!cards.length) return [];

  const response = await anthropic().messages.parse({
    model: MODEL,
    max_tokens: 16000,
    system: FACILITATOR,
    thinking: { type: "adaptive" },
    output_config: { format: zodOutputFormat(ActionsSchema), effort: "high" },
    messages: [
      {
        role: "user",
        content: `${context}

Propose 3-5 action items. Each one must be small enough to finish in a single sprint and
specific enough that the team would know whether it happened. Prioritise the highest-voted
pain. Skip anything that is really a wish rather than an action.`,
      },
    ],
  });

  return response.parsed_output?.actions ?? [];
}

const NudgeSchema = z.object({
  observation: z.string().describe("One sentence on what the board currently looks like"),
  prompts: z
    .array(z.string())
    .describe("2-3 questions the facilitator can read aloud to unstick the room"),
});

export type NudgeResult = z.infer<typeof NudgeSchema>;

/**
 * A live facilitator nudge — cheap and fast, because it runs while people are
 * sitting in silence looking at a thin column.
 */
export async function facilitatorNudge(board: Board): Promise<NudgeResult | null> {
  const { context } = await loadContext(board);

  const response = await anthropic().messages.parse({
    model: MODEL,
    max_tokens: 4000,
    system: FACILITATOR,
    thinking: { type: "adaptive" },
    output_config: { format: zodOutputFormat(NudgeSchema), effort: "low" },
    messages: [
      {
        role: "user",
        content: `${context}

The room has gone quiet. Look at which columns are thin, which are crowded, and what
nobody has mentioned yet. Give me prompts that open up the gap — specific to this board,
not generic retro questions.`,
      },
    ],
  });

  return response.parsed_output ?? null;
}
