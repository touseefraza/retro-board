# Retro Board

A team retrospective board that is ready the moment you open it — and an API that
AI agents can drive. No accounts, no workspace setup, no seat licences.

## What it does

Pick a format, share the link, write cards. Vote. Then hand the messy wall of
stickies to Claude:

| Pass | What it does |
| --- | --- |
| **Find themes** | Clusters every card into named themes and saves the grouping to the board |
| **Draft actions** | Proposes sprint-sized action items from the highest-voted pain, each with its source |
| **Unstick us** | Reads which columns are thin and writes prompts for *this* board when the room goes quiet |
| **Summarize** | Writes the read-out: what happened, what hurt, and the tension between them |

Four templates ship in the box: Start/Stop/Continue, Mad/Sad/Glad, the Four Ls,
and Sailboat.

## Getting started

If you already have a Postgres:

```bash
cp .env.example .env.local   # add DATABASE_URL, and ANTHROPIC_API_KEY for the AI passes
pnpm install
pnpm dev
```

If you don't, there is nothing to install — `pnpm db:dev` starts a throwaway
Postgres in-process ([PGlite](https://pglite.dev), real Postgres compiled to
WASM, served over the wire protocol):

```bash
pnpm install
pnpm db:dev                  # terminal 1 — postgres on 127.0.0.1:5433
cp .env.example .env.local   # uncomment the local DATABASE_URL line
pnpm dev                     # terminal 2
```

`DATABASE_URL` is any Postgres — [Neon](https://neon.tech) and
[Supabase](https://supabase.com) both have a free tier. The schema is created on
the first request, so there is no migration step. Without `ANTHROPIC_API_KEY` the
board works exactly as normal; only the four AI passes are disabled, and the UI
says so instead of failing.

## For agents

Every board is an API, described at `GET /api/agent`.

**MCP** — point any MCP client at `POST /api/mcp` (stateless Streamable HTTP, so
it works on serverless with no session to keep alive):

```jsonc
// Claude Code / Claude Desktop
{
  "mcpServers": {
    "retro-board": {
      "type": "http",
      "url": "http://localhost:3000/api/mcp"
    }
  }
}
```

Ten tools: `create_board`, `get_board`, `add_card`, `vote_card`, `set_phase`,
`add_action_item`, `group_cards`, `summarize_board`, `suggest_actions`,
`facilitator_nudge`.

**REST** — the same surface, if you would rather just use HTTP:

```bash
BOARD=$(curl -sX POST localhost:3000/api/boards \
  -H 'content-type: application/json' \
  -d '{"title":"Sprint 42","template":"classic"}' | jq -r .boardId)

curl -s localhost:3000/api/boards/$BOARD | jq '.columns'

curl -sX POST localhost:3000/api/boards/$BOARD/cards \
  -H 'content-type: application/json' \
  -H 'x-participant-name: Ada' \
  -d '{"columnId":"<id from above>","text":"Deploys take 40 minutes"}'

curl -sX POST localhost:3000/api/boards/$BOARD/ai \
  -H 'content-type: application/json' -d '{"action":"summary"}'
```

There are no accounts: send `x-participant-id` and `x-participant-name` headers
(or `participantId`/`participantName` in the body) to attribute cards and track
votes.

## Architecture

```
src/
  app/
    page.tsx                 Landing + template picker
    b/[boardId]/page.tsx     Board shell (server) → BoardView (client)
    api/
      boards/…               REST surface
      mcp/route.ts           MCP JSON-RPC endpoint
      agent/route.ts         Self-describing API index
  lib/
    db.ts                    Pooled Postgres client + self-applying schema
    repo.ts                  All SQL lives here
    ai.ts                    The four Claude passes, structured output via Zod
    mcp.ts                   Tool definitions shared by MCP and /api/agent
    useBoard.ts              Polling sync + optimistic mutations
  components/                UI
```

**Sync** is polling, not websockets. Every write bumps `boards.version`, and
`GET /api/boards/:id?since=<version>` answers an unchanged board with a few
bytes. It feels live at a 1.5s interval, costs almost nothing, and — unlike a
socket — works on serverless without extra infrastructure.

**AI output is structured.** Each pass uses `client.messages.parse()` with a Zod
schema, so a theme is always `{ label, summary, cardIds }` and never prose that
needs parsing. Card ids in the prompt are the same ids in the database, which is
what lets the clustering pass write itself straight back to the board.

**Masking is server-side.** When a board hides other people's cards during
collection, the text never leaves the server — the client has nothing to reveal
in devtools.

## Deploying

Anything that runs Node works: Vercel, Railway, Fly, a container. Set
`DATABASE_URL` and `ANTHROPIC_API_KEY`, then `pnpm build && pnpm start`. If your
Postgres sits behind a transaction-mode pooler (Supabase port 6543, PgBouncer),
it is already handled — the client runs with `prepare: false`.
