import { db } from "./db";
import { newId } from "./ids";
import {
  COLUMN_LIMITS,
  TEMPLATES,
  TONES,
  type ActionItem,
  type Board,
  type BoardState,
  type Card,
  type Column,
  type Peer,
  type Phase,
  type TemplateColumn,
  type Theme,
  type Tone,
} from "./types";

/** Every mutation bumps `version` so pollers can skip unchanged boards. */
async function bump(boardId: string): Promise<void> {
  const sql = await db();
  await sql`update boards set version = version + 1 where id = ${boardId}`;
}

export async function createBoard(input: {
  title?: string;
  template?: string;
  votesPerParticipant?: number;
  /** A hand-built column set. Overrides `template` when present. */
  columns?: { title?: string; tone?: string }[];
  actionsLabel?: string;
  showActions?: boolean;
}): Promise<string> {
  const sql = await db();
  const templateId =
    input.template && input.template in TEMPLATES ? input.template : "classic";
  const template = TEMPLATES[templateId];

  const custom = normaliseColumns(input.columns);
  const columns = custom ?? template.columns;

  const boardId = newId();
  const title = input.title?.trim() || (custom ? "Retro" : template.name);
  const votes = clampVotes(input.votesPerParticipant ?? 5);
  const actionsLabel =
    input.actionsLabel?.trim().slice(0, 40) || "Action items";
  const showActions = input.showActions !== false;

  await sql.begin(async (tx) => {
    await tx`
      insert into boards (
        id, title, template, votes_per_participant, actions_label, show_actions
      )
      values (
        ${boardId}, ${title}, ${custom ? "custom" : templateId}, ${votes},
        ${actionsLabel}, ${showActions}
      )
    `;
    await tx`
      insert into columns ${tx(
        columns.map((column, index) => ({
          id: newId(),
          board_id: boardId,
          title: column.title,
          tone: column.tone,
          position: index,
        })),
      )}
    `;
  });

  return boardId;
}

/**
 * Trims a hand-built column set to something the board can render: named,
 * within bounds, and with a tone the UI has a colour for. Returns null when
 * nothing usable was supplied, which falls back to the chosen template.
 */
function normaliseColumns(
  input: { title?: string; tone?: string }[] | undefined,
): TemplateColumn[] | null {
  if (!Array.isArray(input)) return null;

  const columns = input
    .map((column, index) => ({
      title: (column.title ?? "").trim().slice(0, COLUMN_LIMITS.titleLength),
      tone: (TONES as string[]).includes(column.tone ?? "")
        ? (column.tone as Tone)
        : TONES[index % TONES.length],
    }))
    .filter((column) => column.title.length > 0)
    .slice(0, COLUMN_LIMITS.max);

  return columns.length >= COLUMN_LIMITS.min ? columns : null;
}

function clampVotes(value: number): number {
  if (!Number.isFinite(value)) return 5;
  return Math.min(20, Math.max(0, Math.trunc(value)));
}

/** Cheap existence + freshness check used by the polling endpoint. */
export async function getBoardVersion(boardId: string): Promise<number | null> {
  const sql = await db();
  const rows = await sql<{ version: number }[]>`
    select version from boards where id = ${boardId}
  `;
  return rows.length ? rows[0].version : null;
}

export async function getBoardState(
  boardId: string,
  viewerId: string,
  options?: { ignoreMasking?: boolean },
): Promise<BoardState | null> {
  const sql = await db();

  const boards = await sql<
    {
      id: string;
      title: string;
      phase: Phase;
      masked: boolean;
      votes_per_participant: number;
      summary: string | null;
      actions_label: string;
      show_actions: boolean;
      version: number;
      created_at: Date;
    }[]
  >`select * from boards where id = ${boardId}`;
  if (!boards.length) return null;
  const b = boards[0];

  const [columnRows, cardRows, themeRows, actionRows, votesUsedRows] =
    await Promise.all([
      sql<{ id: string; title: string; tone: Column["tone"]; position: number }[]>`
        select id, title, tone, position from columns
        where board_id = ${boardId} order by position asc
      `,
      sql<
        {
          id: string;
          column_id: string;
          theme_id: string | null;
          text: string;
          author_id: string;
          author_name: string;
          created_at: Date;
          votes: number;
          voted_by_me: boolean;
        }[]
      >`
        select c.id, c.column_id, c.theme_id, c.text, c.author_id, c.author_name,
               c.created_at,
               count(v.voter_id)::int as votes,
               bool_or(v.voter_id = ${viewerId}) is true as voted_by_me
        from cards c
        left join votes v on v.card_id = c.id
        where c.board_id = ${boardId}
        group by c.id
        order by c.created_at asc
      `,
      sql<{ id: string; label: string; summary: string | null; source: Theme["source"] }[]>`
        select id, label, summary, source from themes where board_id = ${boardId}
      `,
      sql<
        {
          id: string;
          text: string;
          owner: string | null;
          done: boolean;
          source: ActionItem["source"];
          created_at: Date;
        }[]
      >`
        select id, text, owner, done, source, created_at from action_items
        where board_id = ${boardId} order by created_at asc
      `,
      sql<{ count: number }[]>`
        select count(*)::int as count from votes
        where board_id = ${boardId} and voter_id = ${viewerId}
      `,
    ]);

  const board: Board = {
    id: b.id,
    title: b.title,
    phase: b.phase,
    masked: b.masked,
    votesPerParticipant: b.votes_per_participant,
    summary: b.summary,
    actionsLabel: b.actions_label,
    showActions: b.show_actions,
    version: b.version,
    createdAt: b.created_at.toISOString(),
  };

  const cards: Card[] = cardRows.map((row) => {
    // Masking happens here, not in the client — hidden text never leaves the
    // server. Agent surfaces opt out: masking hides cards from *people in the
    // room* during collection, and an agent is never one of them.
    const hidden =
      board.masked && !options?.ignoreMasking && row.author_id !== viewerId;
    return {
      id: row.id,
      columnId: row.column_id,
      themeId: row.theme_id,
      text: hidden ? "" : row.text,
      authorId: hidden ? "" : row.author_id,
      authorName: hidden ? "" : row.author_name,
      votes: row.votes,
      votedByMe: row.voted_by_me,
      masked: hidden,
      createdAt: row.created_at.toISOString(),
    };
  });

  return {
    board,
    columns: columnRows,
    cards,
    themes: themeRows,
    actionItems: actionRows.map((row) => ({
      id: row.id,
      text: row.text,
      owner: row.owner,
      done: row.done,
      source: row.source,
      createdAt: row.created_at.toISOString(),
    })),
    votesUsed: votesUsedRows[0]?.count ?? 0,
  };
}

/** Unmasked card text for the AI and MCP surfaces, which are never masked. */
export async function getCardsForAnalysis(boardId: string): Promise<
  {
    id: string;
    text: string;
    column: string;
    tone: string;
    votes: number;
  }[]
> {
  const sql = await db();
  return sql`
    select c.id, c.text, col.title as column, col.tone,
           (select count(*)::int from votes v where v.card_id = c.id) as votes
    from cards c
    join columns col on col.id = c.column_id
    where c.board_id = ${boardId}
    order by col.position asc, c.created_at asc
  `;
}

export async function addCard(input: {
  boardId: string;
  columnId: string;
  text: string;
  authorId: string;
  authorName: string;
}): Promise<Card | null> {
  const sql = await db();
  const text = input.text.trim();
  if (!text) return null;

  const owns = await sql<{ id: string }[]>`
    select id from columns where id = ${input.columnId} and board_id = ${input.boardId}
  `;
  if (!owns.length) return null;

  const id = newId();
  const rows = await sql<{ created_at: Date }[]>`
    insert into cards (id, board_id, column_id, text, author_id, author_name)
    values (${id}, ${input.boardId}, ${input.columnId}, ${text.slice(0, 2000)},
            ${input.authorId}, ${input.authorName.slice(0, 60) || "Anonymous"})
    returning created_at
  `;
  await bump(input.boardId);

  return {
    id,
    columnId: input.columnId,
    themeId: null,
    text,
    authorId: input.authorId,
    authorName: input.authorName,
    votes: 0,
    votedByMe: false,
    masked: false,
    createdAt: rows[0].created_at.toISOString(),
  };
}

export async function updateCard(
  boardId: string,
  cardId: string,
  patch: { text?: string; columnId?: string; themeId?: string | null },
): Promise<boolean> {
  const sql = await db();
  const sets: Record<string, unknown> = {};
  if (patch.text !== undefined) sets.text = patch.text.trim().slice(0, 2000);
  if (patch.columnId !== undefined) sets.column_id = patch.columnId;
  if (patch.themeId !== undefined) sets.theme_id = patch.themeId;
  if (!Object.keys(sets).length) return false;

  const rows = await sql`
    update cards set ${sql(sets)}
    where id = ${cardId} and board_id = ${boardId}
    returning id
  `;
  if (rows.length) await bump(boardId);
  return rows.length > 0;
}

export async function deleteCard(boardId: string, cardId: string): Promise<boolean> {
  const sql = await db();
  const rows = await sql`
    delete from cards where id = ${cardId} and board_id = ${boardId} returning id
  `;
  if (rows.length) await bump(boardId);
  return rows.length > 0;
}

/**
 * Toggles a vote. Returns `null` when the voter is out of votes, so the caller
 * can surface that instead of silently doing nothing.
 */
export async function toggleVote(
  boardId: string,
  cardId: string,
  voterId: string,
): Promise<{ voted: boolean } | null> {
  const sql = await db();

  const removed = await sql`
    delete from votes where card_id = ${cardId} and voter_id = ${voterId} returning card_id
  `;
  if (removed.length) {
    await bump(boardId);
    return { voted: false };
  }

  const [budgetRow] = await sql<{ votes_per_participant: number }[]>`
    select votes_per_participant from boards where id = ${boardId}
  `;
  if (!budgetRow) return null;

  const [usedRow] = await sql<{ count: number }[]>`
    select count(*)::int as count from votes where board_id = ${boardId} and voter_id = ${voterId}
  `;
  if (budgetRow.votes_per_participant > 0 && usedRow.count >= budgetRow.votes_per_participant) {
    return null;
  }

  const inserted = await sql`
    insert into votes (card_id, board_id, voter_id)
    select ${cardId}, ${boardId}, ${voterId}
    where exists (select 1 from cards where id = ${cardId} and board_id = ${boardId})
    on conflict do nothing
    returning card_id
  `;
  if (!inserted.length) return null;

  await bump(boardId);
  return { voted: true };
}

export async function updateBoard(
  boardId: string,
  patch: {
    title?: string;
    phase?: Phase;
    masked?: boolean;
    votesPerParticipant?: number;
    summary?: string | null;
  },
): Promise<boolean> {
  const sql = await db();
  const sets: Record<string, unknown> = {};
  if (patch.title !== undefined) sets.title = patch.title.trim().slice(0, 120) || "Retro";
  if (patch.phase !== undefined) sets.phase = patch.phase;
  if (patch.masked !== undefined) sets.masked = patch.masked;
  if (patch.votesPerParticipant !== undefined) {
    sets.votes_per_participant = clampVotes(patch.votesPerParticipant);
  }
  if (patch.summary !== undefined) sets.summary = patch.summary;
  if (!Object.keys(sets).length) return false;

  const rows = await sql`
    update boards set ${sql(sets)}, version = version + 1
    where id = ${boardId} returning id
  `;
  return rows.length > 0;
}

/**
 * Replaces the AI-generated grouping wholesale. Human-made themes and any card
 * a human moved into one are left alone, so re-running never undoes manual work.
 */
export async function replaceAiThemes(
  boardId: string,
  groups: { label: string; summary?: string; cardIds: string[] }[],
): Promise<Theme[]> {
  const sql = await db();
  const created: Theme[] = [];

  await sql.begin(async (tx) => {
    await tx`delete from themes where board_id = ${boardId} and source = 'ai'`;

    for (const group of groups) {
      const id = newId();
      const summary = group.summary?.trim() || null;
      await tx`
        insert into themes (id, board_id, label, summary, source)
        values (${id}, ${boardId}, ${group.label.slice(0, 80)}, ${summary}, 'ai')
      `;
      if (group.cardIds.length) {
        await tx`
          update cards set theme_id = ${id}
          where board_id = ${boardId} and id in ${tx(group.cardIds)} and theme_id is null
        `;
      }
      created.push({ id, label: group.label, summary, source: "ai" });
    }
  });

  await bump(boardId);
  return created;
}

export async function addActionItem(input: {
  boardId: string;
  text: string;
  owner?: string | null;
  source?: ActionItem["source"];
}): Promise<ActionItem | null> {
  const sql = await db();
  const text = input.text.trim();
  if (!text) return null;

  const id = newId();
  const owner = input.owner?.trim() || null;
  const source = input.source ?? "human";
  const rows = await sql<{ created_at: Date }[]>`
    insert into action_items (id, board_id, text, owner, source)
    select ${id}, ${input.boardId}, ${text.slice(0, 500)}, ${owner}, ${source}
    where exists (select 1 from boards where id = ${input.boardId})
    returning created_at
  `;
  if (!rows.length) return null;
  await bump(input.boardId);

  return {
    id,
    text,
    owner,
    done: false,
    source,
    createdAt: rows[0].created_at.toISOString(),
  };
}

export async function updateActionItem(
  boardId: string,
  itemId: string,
  patch: { text?: string; owner?: string | null; done?: boolean },
): Promise<boolean> {
  const sql = await db();
  const sets: Record<string, unknown> = {};
  if (patch.text !== undefined) sets.text = patch.text.trim().slice(0, 500);
  if (patch.owner !== undefined) sets.owner = patch.owner?.trim() || null;
  if (patch.done !== undefined) sets.done = patch.done;
  if (!Object.keys(sets).length) return false;

  const rows = await sql`
    update action_items set ${sql(sets)}
    where id = ${itemId} and board_id = ${boardId} returning id
  `;
  if (rows.length) await bump(boardId);
  return rows.length > 0;
}

export async function deleteActionItem(boardId: string, itemId: string): Promise<boolean> {
  const sql = await db();
  const rows = await sql`
    delete from action_items where id = ${itemId} and board_id = ${boardId} returning id
  `;
  if (rows.length) await bump(boardId);
  return rows.length > 0;
}

export async function boardExists(boardId: string): Promise<boolean> {
  return (await getBoardVersion(boardId)) !== null;
}

/** A peer is considered present if they've reported in this recently. */
const PRESENCE_TTL = "15 seconds";

/** Postgres foreign-key violation — the board id doesn't exist. */
const FK_VIOLATION = "23503";

/**
 * Records where this participant is pointing and returns everyone else who is
 * currently on the board, in one round trip.
 *
 * Deliberately does not `bump()` the board version: cursors move constantly and
 * must not force every client to re-fetch the whole board.
 *
 * Returns null when the board doesn't exist.
 */
export async function syncPresence(input: {
  boardId: string;
  participantId: string;
  name: string;
  x: number | null;
  y: number | null;
}): Promise<Peer[] | null> {
  const sql = await db();
  const { boardId, participantId, name, x, y } = input;

  try {
    await sql`
      insert into presence (board_id, participant_id, name, cursor_x, cursor_y, seen_at)
      values (${boardId}, ${participantId}, ${name}, ${x}, ${y}, now())
      on conflict (board_id, participant_id) do update set
        name     = excluded.name,
        cursor_x = excluded.cursor_x,
        cursor_y = excluded.cursor_y,
        seen_at  = now()
    `;
  } catch (error) {
    if ((error as { code?: string }).code === FK_VIOLATION) return null;
    throw error;
  }

  return await readPeers(sql, boardId, participantId);
}

/** Drops this participant's marker — sent on unload so cursors vanish at once. */
export async function leavePresence(
  boardId: string,
  participantId: string,
): Promise<void> {
  const sql = await db();
  await sql`
    delete from presence where board_id = ${boardId} and participant_id = ${participantId}
  `;
}

async function readPeers(
  sql: Awaited<ReturnType<typeof db>>,
  boardId: string,
  participantId: string,
): Promise<Peer[]> {
  const rows = await sql`
    select
      participant_id,
      name,
      cursor_x,
      cursor_y,
      extract(epoch from (now() - seen_at)) * 1000 as idle_ms
    from presence
    where board_id = ${boardId}
      and participant_id <> ${participantId}
      and seen_at > now() - ${PRESENCE_TTL}::interval
    order by seen_at desc
    limit 40
  `;

  return rows.map((row) => ({
    id: row.participant_id as string,
    name: row.name as string,
    x: row.cursor_x === null ? null : Number(row.cursor_x),
    y: row.cursor_y === null ? null : Number(row.cursor_y),
    idleMs: Math.max(0, Math.round(Number(row.idle_ms))),
  }));
}

/**
 * Clears markers left behind by tabs that closed without sending a beacon.
 * Called opportunistically so it costs nothing on the common path.
 */
export async function sweepPresence(): Promise<void> {
  const sql = await db();
  await sql`delete from presence where seen_at < now() - interval '5 minutes'`;
}
