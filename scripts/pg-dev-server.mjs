/**
 * Dev-only Postgres: PGlite (real Postgres, compiled to WASM) exposed over the
 * wire protocol so anything speaking `postgres://` can connect. Lets you run and
 * test the app with no database installed. Not for production.
 *
 *   node scripts/pg-dev-server.mjs [port]
 *   DATABASE_URL="postgresql://postgres@127.0.0.1:5433/postgres" pnpm dev
 *
 * Set DATABASE_POOL_MAX=1 alongside it. PGlite multiplexes every wire
 * connection onto a single engine, so two connections issuing extended-query
 * messages concurrently can clobber each other's unnamed prepared statement
 * (Postgres error 08P01). Real Postgres has no such constraint.
 */
import { PGlite } from "@electric-sql/pglite";
import { PGLiteSocketServer } from "@electric-sql/pglite-socket";

const port = Number(process.argv[2] ?? 5433);
const dataDir = process.env.PGLITE_DIR ?? "./.pglite";

const db = await PGlite.create({ dataDir });
// PGlite defaults to a single connection; Next dev renders pages and route
// handlers in separate workers, so allow a small pool.
const server = new PGLiteSocketServer({ db, port, host: "127.0.0.1", maxConnections: 20 });
await server.start();

console.log(`pglite listening on postgresql://postgres@127.0.0.1:${port}/postgres`);
console.log(`data dir: ${dataDir}`);

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, async () => {
    await server.stop();
    await db.close();
    process.exit(0);
  });
}
