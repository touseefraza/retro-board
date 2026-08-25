import { NextResponse } from "next/server";
import { AiNotConfiguredError } from "./ai";
import { DatabaseNotConfiguredError } from "./db";

export function ok<T>(data: T, init?: ResponseInit) {
  return NextResponse.json(data, init);
}

export function fail(status: number, message: string, extra?: Record<string, unknown>) {
  return NextResponse.json({ error: message, ...extra }, { status });
}

/**
 * Turns the two "you haven't finished setup yet" errors into actionable 503s and
 * everything else into a 500, so no route needs its own try/catch boilerplate.
 */
export function handleError(error: unknown) {
  if (error instanceof DatabaseNotConfiguredError) {
    return fail(503, "No database configured.", {
      fix: "Set DATABASE_URL in .env.local to a Postgres connection string (Neon, Supabase, or local).",
    });
  }
  if (error instanceof AiNotConfiguredError) {
    return fail(503, "No Anthropic API key configured.", {
      fix: "Set ANTHROPIC_API_KEY in .env.local to enable the AI features.",
    });
  }
  console.error("[retro]", error);
  const message = error instanceof Error ? error.message : "Unexpected error";
  return fail(500, message);
}

/** Wraps a route handler so thrown errors become structured responses. */
export function route<Args extends unknown[]>(
  handler: (...args: Args) => Promise<Response>,
) {
  return async (...args: Args): Promise<Response> => {
    try {
      return await handler(...args);
    } catch (error) {
      return handleError(error);
    }
  };
}

/**
 * Who is making this request. Browsers send a locally generated id via headers;
 * agents pass `participantId` in the body. Anonymous readers still get a stable
 * placeholder so vote state renders sensibly.
 */
export function participant(
  request: Request,
  body?: Record<string, unknown>,
): { id: string; name: string } {
  const url = new URL(request.url);
  const id =
    str(body?.participantId) ||
    request.headers.get("x-participant-id") ||
    url.searchParams.get("viewer") ||
    "anonymous";
  const name =
    str(body?.participantName) ||
    request.headers.get("x-participant-name") ||
    url.searchParams.get("name") ||
    "Anonymous";
  return { id: id.slice(0, 64), name: decodeURIComponent(name).slice(0, 60) };
}

function str(value: unknown): string {
  return typeof value === "string" && value.trim() ? value.trim() : "";
}

export async function readJson<T = Record<string, unknown>>(request: Request): Promise<T> {
  try {
    return (await request.json()) as T;
  } catch {
    return {} as T;
  }
}
