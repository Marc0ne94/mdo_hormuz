#!/usr/bin/env node
/**
 * MCP stdio → bus HTTP Kharg.
 * Tre tool: status, cmd, voice. Il bus normalizza le op (ops.mjs).
 * Se :8765 è giù, alza server.mjs (niente browser).
 */
import { createInterface } from "readline";
import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";
import { WRITE_OPS, SIDES, WEAPONS, VERSION, PRODUCT } from "./ops.mjs";

const __dir = path.dirname(fileURLToPath(import.meta.url));
const BASE = process.env.HORMUZ_URL || "http://127.0.0.1:8765";
const AUTO = process.env.HORMUZ_NO_AUTOSTART !== "1";

const TOOLS = [
  {
    name: "hormuz_status",
    description: "Stato bus Kharg: seq, client SSE, ultimi comandi.",
    inputSchema: { type: "object", properties: {} }
  },
  {
    name: "hormuz_cmd",
    description:
      "Invia un comando al bus Kharg (stesso JSON di POST /cmd). " +
      "op: " + WRITE_OPS.join(", ") + ". " +
      "side: sea|land|irn. weapon: missile|bomb|cannon. " +
      "zone: island|gulf|jetty|farm|runway|coast|ahead. " +
      "battle: n=1 accende, n=0 pace. possess: who vuoto = esci.",
    inputSchema: {
      type: "object",
      properties: {
        op: { type: "string", enum: WRITE_OPS },
        x: { type: "number" },
        z: { type: "number" },
        r: { type: "number", description: "raggio bomb 1-5" },
        n: { type: "number", description: "quanti / battle 0|1" },
        side: { type: "string", enum: SIDES },
        weapon: { type: "string", enum: WEAPONS },
        who: { type: "string", description: "frammento nome roster (SEA-CVN, TANK-DROP)" },
        zone: { type: "string" }
      },
      required: ["op"]
    }
  },
  {
    name: "hormuz_voice",
    description:
      "Testo vocale/chat → parser → bus. Es. 'prendi portaerei', 'spara missile', 'apri il fuoco', 'carro dal cielo'.",
    inputSchema: {
      type: "object",
      properties: { text: { type: "string" } },
      required: ["text"]
    }
  }
];

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function ping() {
  try {
    const r = await fetch(BASE + "/status", { signal: AbortSignal.timeout(800) });
    return r.ok;
  } catch {
    return false;
  }
}

let starting = null;
async function ensureBus() {
  if (await ping()) return;
  if (!AUTO) throw new Error("bus giù su " + BASE + " (HORMUZ_NO_AUTOSTART=1)");
  if (!starting) {
    starting = (async () => {
      process.stderr.write("hormuz mcp: avvio server.mjs\n");
      const child = spawn(process.execPath, [path.join(__dir, "server.mjs")], {
        cwd: __dir,
        detached: true,
        stdio: "ignore",
        windowsHide: true,
        env: process.env
      });
      child.unref();
      for (let i = 0; i < 30; i++) {
        await sleep(200);
        if (await ping()) return;
      }
      throw new Error("bus non risponde su " + BASE + " — avvia.cmd");
    })().finally(() => { starting = null; });
  }
  await starting;
}

async function post(pathname, body) {
  await ensureBus();
  const r = await fetch(BASE + pathname, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body)
  });
  const t = await r.text();
  try { return JSON.parse(t); } catch { return { ok: false, raw: t, http: r.status }; }
}

async function getStatus() {
  await ensureBus();
  const r = await fetch(BASE + "/status");
  return r.json();
}

function ok(id, obj) {
  return {
    jsonrpc: "2.0",
    id,
    result: { content: [{ type: "text", text: JSON.stringify(obj, null, 2) }] }
  };
}
function fail(id, msg) {
  return { jsonrpc: "2.0", id, error: { code: -32000, message: String(msg) } };
}

function reply(obj) {
  process.stdout.write(JSON.stringify(obj) + "\n");
}

async function callTool(name, args) {
  args = args || {};
  if (name === "hormuz_status") return getStatus();
  if (name === "hormuz_voice") {
    return post("/voice", { text: args.text, src: "mcp" });
  }
  if (name === "hormuz_cmd") {
    const body = { ...args, src: "mcp" };
    return post("/cmd", body);
  }
  throw new Error("unknown tool " + name);
}

const rl = createInterface({ input: process.stdin });
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
          protocolVersion: "2024-11-05",
          serverInfo: { name: "hormuz", version: VERSION, title: PRODUCT },
          capabilities: { tools: {} }
        }
      });
      ensureBus().catch((e) => process.stderr.write("hormuz mcp: " + e.message + "\n"));
      return;
    }
    if (method === "notifications/initialized" || method === "notifications/cancelled") return;
    if (method === "ping") {
      if (id != null) reply({ jsonrpc: "2.0", id, result: {} });
      return;
    }
    if (method === "tools/list") {
      reply({ jsonrpc: "2.0", id, result: { tools: TOOLS } });
      return;
    }
    if (method === "tools/call") {
      const out = await callTool(params.name, params.arguments || {});
      reply(ok(id, out));
      return;
    }
    if (id != null) reply({ jsonrpc: "2.0", id, error: { code: -32601, message: String(method) } });
  } catch (e) {
    if (id != null) reply(fail(id, e.message));
  }
});
