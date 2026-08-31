/** Shared domain types. Mirrors the SQL schema in `schema.ts`. */

/** Drives the column's accent colour and the AI's read of intent. */
export type Tone = "positive" | "negative" | "neutral" | "idea";

/** Retro phases, in order. The board UI adapts per phase. */
export const PHASES = ["collect", "group", "vote", "discuss"] as const;
export type Phase = (typeof PHASES)[number];

export type Column = {
  id: string;
  title: string;
  tone: Tone;
  position: number;
};

export type Card = {
  id: string;
  columnId: string;
  text: string;
  authorId: string;
  authorName: string;
  themeId: string | null;
  votes: number;
  /** Whether the requesting participant has voted on this card. */
  votedByMe: boolean;
  /** True when the board hides other people's cards and this one isn't yours. */
  masked: boolean;
  createdAt: string;
};

export type Theme = {
  id: string;
  label: string;
  summary: string | null;
  source: "ai" | "human";
};

export type ActionItem = {
  id: string;
  text: string;
  owner: string | null;
  done: boolean;
  source: "ai" | "human";
  createdAt: string;
};

export type Board = {
  id: string;
  title: string;
  phase: Phase;
  /** Cards from other participants stay masked until the facilitator reveals. */
  masked: boolean;
  votesPerParticipant: number;
  summary: string | null;
  /** Countdown length in seconds, kept between runs. */
  timerSeconds: number;
  /** When the running timer fires, or null when it isn't running. */
  timerEndsAt: string | null;
  /** What the actions section is called on this board. */
  actionsLabel: string;
  /** Whether this board tracks actions at all. */
  showActions: boolean;
  /** Monotonic counter bumped on every write; drives cheap client polling. */
  version: number;
  createdAt: string;
};

/**
 * Someone else looking at the board right now. Cursor coordinates are fractions
 * of the board surface (0..1), so they map across differently sized viewports.
 */
export type Peer = {
  id: string;
  name: string;
  x: number | null;
  y: number | null;
  /** Milliseconds since this peer last reported in. */
  idleMs: number;
};

/** The single payload the board UI renders from. */
export type BoardState = {
  board: Board;
  columns: Column[];
  cards: Card[];
  themes: Theme[];
  actionItems: ActionItem[];
  /** Votes the requesting participant has left, across the whole board. */
  votesUsed: number;
};

export type TemplateColumn = { title: string; tone: Tone };

/** Bounds on a hand-built board, enforced on both sides. */
/** Timer bounds, in seconds. One minute steps between them. */
export const TIMER_LIMITS = { min: 60, max: 3600, step: 60, default: 300 } as const;

export const COLUMN_LIMITS = { min: 1, max: 8, titleLength: 40 } as const;

/** The tones a column can take, in the order the builder offers them. */
export const TONES: Tone[] = ["positive", "negative", "neutral", "idea"];

/** Human labels for the tone swatches in the builder. */
export const TONE_LABELS: Record<Tone, string> = {
  positive: "Green",
  negative: "Red",
  neutral: "Blue",
  idea: "Amber",
};

/** Ready-made retro formats — a board is one click, no configuration. */
export const TEMPLATES: Record<
  string,
  { name: string; blurb: string; columns: TemplateColumn[] }
> = {
  classic: {
    name: "Start / Stop / Continue",
    blurb: "The default. Fast to run, hard to get wrong.",
    columns: [
      { title: "Start", tone: "idea" },
      { title: "Stop", tone: "negative" },
      { title: "Continue", tone: "positive" },
    ],
  },
  mad_sad_glad: {
    name: "Mad / Sad / Glad",
    blurb: "Surfaces how the sprint actually felt.",
    columns: [
      { title: "Mad", tone: "negative" },
      { title: "Sad", tone: "neutral" },
      { title: "Glad", tone: "positive" },
    ],
  },
  four_ls: {
    name: "Liked / Learned / Lacked / Longed for",
    blurb: "Deeper reflection for the end of a milestone.",
    columns: [
      { title: "Liked", tone: "positive" },
      { title: "Learned", tone: "idea" },
      { title: "Lacked", tone: "negative" },
      { title: "Longed for", tone: "neutral" },
    ],
  },
  sailboat: {
    name: "Sailboat",
    blurb: "Wind, anchors, rocks, island — good for strategy retros.",
    columns: [
      { title: "Wind", tone: "positive" },
      { title: "Anchors", tone: "negative" },
      { title: "Rocks", tone: "neutral" },
      { title: "Island", tone: "idea" },
    ],
  },
};

export type TemplateId = keyof typeof TEMPLATES;
