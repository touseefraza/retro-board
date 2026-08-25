import { TOOLS, TOOL_MANIFEST } from "@/lib/mcp";

/**
 * Model Context Protocol endpoint (stateless Streamable HTTP).
 *
 * Point any MCP client at `POST /api/mcp`. There is no session to maintain:
 * every request carries its own board id, so requests are independent and this
 * works unchanged on serverless.
 */

const PROTOCOL_VERSION = "2025-06-18";
const SUPPORTED_VERSIONS = new Set([PROTOCOL_VERSION, "2025-03-26", "2024-11-05"]);

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "content-type, mcp-protocol-version, authorization",
} as const;

type JsonRpcRequest = {
  jsonrpc: "2.0";
  id?: string | number | null;
  method: string;
  params?: Record<string, unknown>;
};

function result(id: JsonRpcRequest["id"], value: unknown) {
  return { jsonrpc: "2.0" as const, id, result: value };
}

function error(id: JsonRpcRequest["id"], code: number, message: string) {
  return { jsonrpc: "2.0" as const, id, error: { code, message } };
}

async function dispatch(message: JsonRpcRequest) {
  const { id, method, params = {} } = message;

  switch (method) {
    case "initialize": {
      const requested = params.protocolVersion as string | undefined;
      return result(id, {
        protocolVersion:
          requested && SUPPORTED_VERSIONS.has(requested) ? requested : PROTOCOL_VERSION,
        capabilities: { tools: { listChanged: false } },
        serverInfo: { name: "retro-board", version: "1.0.0" },
        instructions:
          "Tools for running a team retrospective. Call get_board before add_card or " +
          "vote_card — you need real column and card ids. The AI tools (group_cards, " +
          "summarize_board, suggest_actions) read the whole board themselves.",
      });
    }

    case "ping":
      return result(id, {});

    case "tools/list":
      return result(id, { tools: TOOL_MANIFEST });

    case "tools/call": {
      const name = typeof params.name === "string" ? params.name : "";
      const tool = TOOLS.find((candidate) => candidate.name === name);
      if (!tool) return error(id, -32602, `Unknown tool: ${name || "(unnamed)"}`);

      const args =
        params.arguments && typeof params.arguments === "object"
          ? (params.arguments as Record<string, unknown>)
          : {};

      try {
        const output = await tool.run(args);
        return result(id, {
          content: [{ type: "text", text: JSON.stringify(output, null, 2) }],
          structuredContent: output,
        });
      } catch (cause) {
        // Tool failures are results, not transport errors — the model should see them.
        const text = cause instanceof Error ? cause.message : "Tool failed";
        return result(id, { content: [{ type: "text", text }], isError: true });
      }
    }

    default:
      return error(id, -32601, `Method not found: ${method}`);
  }
}

export async function POST(request: Request) {
  let body: JsonRpcRequest | JsonRpcRequest[];
  try {
    body = await request.json();
  } catch {
    return Response.json(error(null, -32700, "Parse error"), {
      status: 400,
      headers: CORS,
    });
  }

  const batch = Array.isArray(body) ? body : [body];
  const responses = [];

  for (const message of batch) {
    // Notifications ("initialized", "cancelled", …) carry no id and get no reply.
    if (message?.id === undefined || message.id === null) continue;
    responses.push(await dispatch(message));
  }

  if (!responses.length) return new Response(null, { status: 202, headers: CORS });

  return Response.json(Array.isArray(body) ? responses : responses[0], {
    headers: { ...CORS, "mcp-protocol-version": PROTOCOL_VERSION },
  });
}

/** Stateless server: no server-initiated stream to open. */
export async function GET() {
  return new Response("This MCP endpoint is stateless — use POST.", {
    status: 405,
    headers: { ...CORS, Allow: "POST, OPTIONS" },
  });
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS });
}
