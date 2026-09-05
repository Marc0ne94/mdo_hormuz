/**
 * Connettore MCP stdio generico.
 * Nessuna op di prodotto. stdout = JSON-RPC NDJSON. stderr = log.
 *
 * spec = {
 *   name, version, title?,
 *   tools: [{ name, description, inputSchema }],
 *   call(name, args): Promise<any>,
 *   ensure?: () => Promise<void>,  // backend up; optional; tools/call awaits it
 *   input?, output?, log?          // default stdin/stdout/stderr
 * }
 */
import { createInterface } from "readline";

const PROTOCOL = "2024-11-05";

function wrapOk(id, obj) {
  const text = typeof obj === "string" ? obj : JSON.stringify(obj, null, 2);
  return {
    jsonrpc: "2.0",
    id,
    result: { content: [{ type: "text", text }] }
  };
}

function wrapFail(id, msg) {
  return { jsonrpc: "2.0", id, error: { code: -32000, message: String(msg) } };
}

export function runStdioMcp(spec) {
  const name = spec.name || "mcp";
  const version = spec.version || "0.0.0";
  const title = spec.title || name;
  const tools = spec.tools || [];
  const call = spec.call;
  const ensure = spec.ensure;
  const input = spec.input || process.stdin;
  const output = spec.output || process.stdout;
  const log = spec.log || process.stderr;

  function reply(obj) {
    output.write(JSON.stringify(obj) + "\n");
  }

  const rl = createInterface({ input });
  rl.on("line", async (line) => {
    if (!line.trim()) return;
    let msg;
    try { msg = JSON.parse(line); }
    catch { return; }
    const { id, method, params } = msg;
    try {
      if (method === "initialize") {
        reply({
          jsonrpc: "2.0",
          id,
          result: {
            protocolVersion: PROTOCOL,
            serverInfo: { name, version, title },
            capabilities: { tools: {} }
          }
        });
        if (ensure) ensure().catch((e) => log.write(name + ": " + e.message + "\n"));
        return;
      }
      if (method === "notifications/initialized" || method === "notifications/cancelled") return;
      if (method === "ping") {
        if (id != null) reply({ jsonrpc: "2.0", id, result: {} });
        return;
      }
      if (method === "tools/list") {
        reply({ jsonrpc: "2.0", id, result: { tools } });
        return;
      }
      if (method === "tools/call") {
        if (ensure) await ensure();
        const out = await call(params.name, params.arguments || {});
        reply(wrapOk(id, out));
        return;
      }
      if (id != null) reply({ jsonrpc: "2.0", id, error: { code: -32601, message: String(method) } });
    } catch (e) {
      if (id != null) reply(wrapFail(id, e.message));
    }
  });

  return {
    close() {
      rl.close();
    }
  };
}
