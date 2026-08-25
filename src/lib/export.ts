import type { BoardState, Card } from "./types";

export type ExportFormat = "confluence" | "text";

export type ExportOptions = {
  format: ExportFormat;
  /** The action items, with their done state and owner. */
  actions: boolean;
  /** What people wrote, grouped under their column. */
  cards: boolean;
  /** Attribute each card to whoever wrote it. */
  authors: boolean;
  /** Include the vote tally next to each card. */
  votes: boolean;
};

export const DEFAULT_EXPORT: ExportOptions = {
  format: "confluence",
  actions: true,
  cards: true,
  authors: true,
  votes: true,
};

/**
 * Cards hidden by the facilitator arrive with their text stripped by the
 * server, so they can't be exported even by accident — the dialog counts these
 * to explain the gap rather than silently dropping rows.
 */
export function visibleCards(state: BoardState): Card[] {
  return state.cards.filter((card) => !card.masked && card.text.trim());
}

export function maskedCount(state: BoardState): number {
  return state.cards.filter((card) => card.masked).length;
}

export function render(state: BoardState, options: ExportOptions): string {
  return options.format === "confluence"
    ? confluence(state, options)
    : plain(state, options);
}

/** A sensible filename for the download. */
export function filename(state: BoardState, format: ExportFormat): string {
  const slug =
    state.board.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 60) || "retro";
  return `${slug}.${format === "confluence" ? "confluence.txt" : "txt"}`;
}

function stamp(): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date());
}

function oneLine(text: string): string {
  return text.replace(/\s*\n\s*/g, " ").trim();
}

/* -------------------------------------------------------------------------
   Confluence wiki markup.

   Paste target is the editor's markup dialog (/markup, or ⌘⇧D on Cloud),
   which takes exactly this dialect: `h2.` headings, `*` bullets, `||` header
   rows, and `(/)`/`(x)` status icons.
------------------------------------------------------------------------- */

/** Backslash-escapes the characters that would otherwise start markup. */
function esc(text: string): string {
  return oneLine(text).replace(/([\\{}[\]])/g, "\\$1");
}

/** Table cells additionally can't contain a bare pipe. */
function cell(text: string): string {
  return esc(text).replace(/\|/g, "\\|") || " ";
}

function confluence(state: BoardState, options: ExportOptions): string {
  const out: string[] = [];
  out.push(`h1. ${esc(state.board.title)}`, "");
  out.push(`_Exported from Retro Board on ${stamp()}._`, "");

  if (options.actions) {
    const items = state.actionItems;
    const done = items.filter((item) => item.done).length;
    out.push(`h2. Action items`, "");
    if (!items.length) {
      out.push("_No action items._", "");
    } else {
      out.push(`_${done} of ${items.length} done._`, "");
      out.push("|| Done || Action || Owner ||");
      for (const item of items) {
        out.push(
          `| ${item.done ? "(/)" : "(x)"} | ${cell(item.text)} | ${cell(item.owner ?? "")} |`,
        );
      }
      out.push("");
    }
  }

  if (options.cards) {
    const cards = visibleCards(state);
    for (const column of [...state.columns].sort((a, b) => a.position - b.position)) {
      const mine = cards.filter((card) => card.columnId === column.id);
      out.push(`h2. ${esc(column.title)}`, "");
      if (!mine.length) {
        out.push("_Nothing here._", "");
        continue;
      }
      for (const card of byVotes(mine)) {
        out.push(`* ${esc(card.text)}${suffix(card, options, true)}`);
      }
      out.push("");
    }
  }

  return out.join("\n").replace(/\n{3,}/g, "\n\n").trim() + "\n";
}

/* -------------------------------------------------------------------------
   Plain text — for a message, an email, or anywhere markup would be noise.
------------------------------------------------------------------------- */

function plain(state: BoardState, options: ExportOptions): string {
  const out: string[] = [];
  const title = state.board.title;
  out.push(title, "=".repeat(Math.min(title.length, 72)));
  out.push(`Exported from Retro Board · ${stamp()}`, "");

  if (options.actions) {
    const items = state.actionItems;
    const done = items.filter((item) => item.done).length;
    out.push(`ACTION ITEMS (${done} of ${items.length} done)`, "");
    if (!items.length) {
      out.push("  (none)", "");
    } else {
      for (const item of items) {
        const owner = item.owner ? ` — ${item.owner}` : "";
        out.push(`  [${item.done ? "x" : " "}] ${oneLine(item.text)}${owner}`);
      }
      out.push("");
    }
  }

  if (options.cards) {
    const cards = visibleCards(state);
    for (const column of [...state.columns].sort((a, b) => a.position - b.position)) {
      const mine = cards.filter((card) => card.columnId === column.id);
      out.push(column.title.toUpperCase(), "");
      if (!mine.length) {
        out.push("  (nothing here)", "");
        continue;
      }
      for (const card of byVotes(mine)) {
        out.push(`  - ${oneLine(card.text)}${suffix(card, options, false)}`);
      }
      out.push("");
    }
  }

  return out.join("\n").replace(/\n{3,}/g, "\n\n").trim() + "\n";
}

/** Most-voted first: the export should lead with what the room cared about. */
function byVotes(cards: Card[]): Card[] {
  return [...cards].sort((a, b) => b.votes - a.votes);
}

function suffix(card: Card, options: ExportOptions, wiki: boolean): string {
  const parts: string[] = [];
  if (options.authors && card.authorName) {
    parts.push(wiki ? `_${esc(card.authorName)}_` : card.authorName);
  }
  if (options.votes && card.votes > 0) {
    parts.push(`${card.votes} ${card.votes === 1 ? "vote" : "votes"}`);
  }
  return parts.length ? ` — ${parts.join(", ")}` : "";
}
