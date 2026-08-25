import postgres from "postgres";

/**
 * Thrown when the app is running without a database. Routes turn this into a
 * 503 with setup instructions rather than a stack trace.
 */
export class DatabaseNotConfiguredError extends Error {
  constructor() {
    super("DATABASE_URL is not set");
    this.name = "DatabaseNotConfiguredError";
  }
}

export function isDatabaseConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL);
}

let client: postgres.Sql | null = null;
let ready: Promise<void> | null = null;

function connect(): postgres.Sql {
  const url = process.env.DATABASE_URL;
  if (!url) throw new DatabaseNotConfiguredError();

  const isLocal = /@(localhost|127\.0\.0\.1|\[::1\])/.test(url);
  return postgres(url, {
    // Neon/Supabase require TLS; a local dev server usually has none.
    ssl: isLocal ? false : "require",
    // PGlite (see scripts/pg-dev-server.mjs) serves one connection at a time.
    max: Number(process.env.DATABASE_POOL_MAX ?? 5),
    idle_timeout: 20,
    // Required for transaction-mode poolers (Supabase 6543, PgBouncer).
    prepare: false,
  });
}

const SCHEMA = /* sql */ `
create table if not exists boards (
  id                    text primary key,
  title                 text        not null,
  template              text        not null default 'classic',
  phase                 text        not null default 'collect',
  masked                boolean     not null default false,
  votes_per_participant integer     not null default 5,
  summary               text,
  version               integer     not null default 0,
  created_at            timestamptz not null default now()
);

create table if not exists columns (
  id        text primary key,
  board_id  text    not null references boards(id) on delete cascade,
  title     text    not null,
  tone      text    not null default 'neutral',
  position  integer not null default 0
);
create index if not exists columns_board_idx on columns(board_id);

create table if not exists themes (
  id       text primary key,
  board_id text not null references boards(id) on delete cascade,
  label    text not null,
  summary  text,
  source   text not null default 'ai'
);
create index if not exists themes_board_idx on themes(board_id);

create table if not exists cards (
  id          text primary key,
  board_id    text        not null references boards(id) on delete cascade,
  column_id   text        not null references columns(id) on delete cascade,
  theme_id    text        references themes(id) on delete set null,
  text        text        not null,
  author_id   text        not null,
  author_name text        not null,
  created_at  timestamptz not null default now()
);
create index if not exists cards_board_idx on cards(board_id);

create table if not exists votes (
  card_id  text not null references cards(id) on delete cascade,
  board_id text not null references boards(id) on delete cascade,
  voter_id text not null,
  primary key (card_id, voter_id)
);
create index if not exists votes_board_voter_idx on votes(board_id, voter_id);

create table if not exists action_items (
  id         text primary key,
  board_id   text        not null references boards(id) on delete cascade,
  text       text        not null,
  owner      text,
  done       boolean     not null default false,
  source     text        not null default 'human',
  created_at timestamptz not null default now()
);
create index if not exists action_items_board_idx on action_items(board_id);

create table if not exists presence (
  board_id       text        not null references boards(id) on delete cascade,
  participant_id text        not null,
  name           text        not null,
  cursor_x       real,
  cursor_y       real,
  seen_at        timestamptz not null default now(),
  primary key (board_id, participant_id)
);
create index if not exists presence_board_seen_idx on presence(board_id, seen_at);
`;

/**
 * Returns the pooled client, creating the schema on first use.
 *
 * Migration is idempotent (`create ... if not exists`) and guarded by a session
 * advisory lock so concurrent cold starts can't race each other.
 */
export async function db(): Promise<postgres.Sql> {
  if (!client) client = connect();
  const sql = client;

  ready ??= (async () => {
    await sql.unsafe(`select pg_advisory_lock(4021763)`);
    try {
      await sql.unsafe(SCHEMA);
    } finally {
      await sql.unsafe(`select pg_advisory_unlock(4021763)`);
    }
  })().catch((error) => {
    // Let the next request retry instead of caching a failed bootstrap.
    ready = null;
    throw error;
  });

  await ready;
  return sql;
}
