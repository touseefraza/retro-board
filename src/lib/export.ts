import type { BoardState, Card } from "./types";

export type ExportFormat = "confluence" | "markdown" | "text";

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
 * `html` is set only for the Confluence format. Confluence Cloud converts
 * pasted HTML into real headings, tables and lists, which is why that format
 * is copied as a rich clipboard flavour rather than as characters — its legacy
 * `h1.`/`||` wiki markup is Server/DC only and pastes literally on Cloud.
 */
export type ExportResult = { text: string; html?: string };

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

export function render(state: BoardState, options: ExportOptions): ExportResult {
  if (options.format === "confluence") {
    return { html: html(state, options), text: markdown(state, options) };
  }
  if (options.format === "markdown") return { text: markdown(state, options) };
  return { text: plain(state, options) };
}

export function filename(state: BoardState, format: ExportFormat): string {
  const slug =
    state.board.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 60) || "retro";
  const ext = format === "confluence" ? "html" : format === "markdown" ? "md" : "txt";
  return `${slug}.${ext}`;
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

function sorted(state: BoardState) {
  return [...state.columns].sort((a, b) => a.position - b.position);
}

/** Most-voted first: the export should lead with what the room cared about. */
function byVotes(cards: Card[]): Card[] {
  return [...cards].sort((a, b) => b.votes - a.votes);
}

/* -------------------------------------------------------------------------
   HTML — the Confluence Cloud paste target.
------------------------------------------------------------------------- */

function esc(text: string): string {
  return oneLine(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function html(state: BoardState, options: ExportOptions): string {
  const out: string[] = [];
  out.push(`<h1>${esc(state.board.title)}</h1>`);
  out.push(`<p><em>Exported from Retro Board on ${stamp()}.</em></p>`);

  if (options.actions) {
    const items = state.actionItems;
    out.push(`<h2>Action items</h2>`);
    if (!items.length) {
      out.push(`<p><em>No action items.</em></p>`);
    } else {
      const done = items.filter((item) => item.done).length;
      out.push(`<p><em>${done} of ${items.length} done.</em></p>`);
      out.push(
        `<table><tbody><tr><th>Done</th><th>Action</th><th>Owner</th></tr>`,
        ...items.map(
          (item) =>
            `<tr><td>${item.done ? "&#9989;" : "&#11036;"}</td>` +
            `<td>${esc(item.text)}</td><td>${esc(item.owner ?? "")}</td></tr>`,
        ),
        `</tbody></table>`,
      );
    }
  }

  if (options.cards) {
    const cards = visibleCards(state);
    for (const column of sorted(state)) {
      const mine = byVotes(cards.filter((card) => card.columnId === column.id));
      out.push(`<h2>${esc(column.title)}</h2>`);
      if (!mine.length) {
        out.push(`<p><em>Nothing here.</em></p>`);
        continue;
      }
      out.push(
        `<ul>`,
        ...mine.map((card) => `<li>${esc(card.text)}${suffixHtml(card, options)}</li>`),
        `</ul>`,
      );
    }
  }

  return out.join("\n");
}

function suffixHtml(card: Card, options: ExportOptions): string {
  const parts: string[] = [];
  if (options.authors && card.authorName) parts.push(`<em>${esc(card.authorName)}</em>`);
  if (options.votes && card.votes > 0) {
    parts.push(`${card.votes} ${card.votes === 1 ? "vote" : "votes"}`);
  }
  return parts.length ? ` &mdash; ${parts.join(", ")}` : "";
}

/* -------------------------------------------------------------------------
   Markdown — also the plain-text flavour that rides along with a rich copy,
   so pasting into a plain editor still yields something structured.
------------------------------------------------------------------------- */

/** Escapes the pipe, which is the only character that breaks a MD table. */
function cell(text: string): string {
  return oneLine(text).replace(/\|/g, "\\|") || " ";
}

function markdown(state: BoardState, options: ExportOptions): string {
  const out: string[] = [];
  out.push(`# ${oneLine(state.board.title)}`, "");
  out.push(`_Exported from Retro Board on ${stamp()}._`, "");

  if (options.actions) {
    const items = state.actionItems;
    out.push(`## Action items`, "");
    if (!items.length) {
      out.push("_No action items._", "");
    } else {
      const done = items.filter((item) => item.done).length;
      out.push(`_${done} of ${items.length} done._`, "");
      out.push("| Done | Action | Owner |", "| --- | --- | --- |");
      for (const item of items) {
        out.push(
          `| ${item.done ? "x" : ""} | ${cell(item.text)} | ${cell(item.owner ?? "")} |`,
        );
      }
      out.push("");
    }
  }

  if (options.cards) {
    const cards = visibleCards(state);
    for (const column of sorted(state)) {
      const mine = byVotes(cards.filter((card) => card.columnId === column.id));
      out.push(`## ${oneLine(column.title)}`, "");
      if (!mine.length) {
        out.push("_Nothing here._", "");
        continue;
      }
      for (const card of mine) {
        out.push(`- ${oneLine(card.text)}${suffixText(card, options, true)}`);
      }
      out.push("");
    }
  }

  return out.join("\n").replace(/\n{3,}/g, "\n\n").trim() + "\n";
}

function plain(state: BoardState, options: ExportOptions): string {
  const out: string[] = [];
  const title = oneLine(state.board.title);
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
    for (const column of sorted(state)) {
      const mine = byVotes(cards.filter((card) => card.columnId === column.id));
      out.push(oneLine(column.title).toUpperCase(), "");
      if (!mine.length) {
        out.push("  (nothing here)", "");
        continue;
      }
      for (const card of mine) {
        out.push(`  - ${oneLine(card.text)}${suffixText(card, options, false)}`);
      }
      out.push("");
    }
  }

  return out.join("\n").replace(/\n{3,}/g, "\n\n").trim() + "\n";
}

function suffixText(card: Card, options: ExportOptions, md: boolean): string {
  const parts: string[] = [];
  if (options.authors && card.authorName) {
    parts.push(md ? `_${oneLine(card.authorName)}_` : oneLine(card.authorName));
  }
  if (options.votes && card.votes > 0) {
    parts.push(`${card.votes} ${card.votes === 1 ? "vote" : "votes"}`);
  }
  return parts.length ? ` — ${parts.join(", ")}` : "";
}
