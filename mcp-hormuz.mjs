#!/usr/bin/env node
/**
 * Adattatore Kharg: tool + bus HTTP.
 * Il loop JSON-RPC sta in mcp-stdio/ — non mescolarlo con le op.
 */
import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";
import { runStdioMcp } from "./mcp-stdio/stdio.mjs";
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
      process.stderr.write("hormuz: avvio server.mjs\n");
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
  const r = await fetch(BASE + pathname, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body)
  });
  const t = await r.text();
  let parsed;
  try { parsed = JSON.parse(t); }
  catch { parsed = { ok: false, raw: t, http: r.status }; }
  if (!r.ok || parsed.ok === false) {
    throw new Error(parsed.error || parsed.raw || ("http " + r.status));
  }
  return parsed;
}

async function call(name, args) {
  args = args || {};
  if (name === "hormuz_status") {
    const r = await fetch(BASE + "/status", { signal: AbortSignal.timeout(4000) });
    if (!r.ok) throw new Error("status http " + r.status);
    const j = await r.json();
    if (!j || j.ok === false) throw new Error("status not ok");
    return j;
  }
  if (name === "hormuz_voice") return post("/voice", { text: args.text, src: "mcp" });
  if (name === "hormuz_cmd") return post("/cmd", { ...args, src: "mcp" });
  throw new Error("unknown tool " + name);
}

runStdioMcp({
  name: "hormuz",
  version: VERSION,
  title: PRODUCT,
  tools: TOOLS,
  ensure: ensureBus,
  call
});
