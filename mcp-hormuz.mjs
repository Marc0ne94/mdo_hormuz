#!/usr/bin/env node
import { createInterface } from "readline";

const BASE = process.env.HORMUZ_URL || "http://127.0.0.1:8765";

const TOOLS = [
  {
    name: "hormuz_status",
    description: "Kharg sandbox status: last commands and SSE client count.",
    inputSchema: { type: "object", properties: {} }
  },
  {
    name: "hormuz_bomb",
    description: "Drop a stylized voxel blast at map coordinates x,z (0-191, 0-159).",
    inputSchema: {
      type: "object",
      properties: {
        x: { type: "number" },
        z: { type: "number" },
        r: { type: "number", description: "radius 1-5, default 3.2" }
      },
      required: ["x", "z"]
    }
  },
  {
    name: "hormuz_navy",
    description: "Spawn a sea group. side=sea (gulf) | land | irn. n=1..8.",
    inputSchema: {
      type: "object",
      properties: {
        side: { type: "string", enum: ["sea", "land", "irn"] },
        n: { type: "number" }
      }
    }
  },
  {
    name: "hormuz_artillery",
    description: "Land artillery pattern around x,z.",
    inputSchema: {
      type: "object",
      properties: { x: { type: "number" }, z: { type: "number" } },
      required: ["x", "z"]
    }
  },
  {
    name: "hormuz_air",
    description: "Spawn jets for a side (sea|land|irn).",
    inputSchema: {
      type: "object",
      properties: { side: { type: "string", enum: ["sea", "land", "irn"] } }
    }
  },
  {
    name: "hormuz_radar",
    description: "Pulse island radars (visual only).",
    inputSchema: { type: "object", properties: {} }
  },
  {
    name: "hormuz_voice",
    description: "Raw voice/text command. e.g. 'spara missile', 'carro dal cielo', 'prendi portaerei'.",
    inputSchema: { type: "object", properties: { text: { type: "string" } }, required: ["text"] }
  },
  {
    name: "hormuz_possess",
    description: "Impersonate a unit by name fragment (SEA-CVN, IRN-SAM, TANK-DROP).",
    inputSchema: { type: "object", properties: { who: { type: "string" } } }
  },
  {
    name: "hormuz_fire",
    description: "Fire from possessed or named unit. weapon=missile|bomb|cannon.",
    inputSchema: {
      type: "object",
      properties: {
        who: { type: "string" },
        weapon: { type: "string", enum: ["missile", "bomb", "cannon"] },
        x: { type: "number" },
        z: { type: "number" }
      }
    }
  },
  {
    name: "hormuz_paradrop",
    description: "Paradrop a toy tank onto x,z (defaults Kharg).",
    inputSchema: {
      type: "object",
      properties: { x: { type: "number" }, z: { type: "number" }, side: { type: "string" } }
    }
  }
];

async function post(body) {
  const r = await fetch(BASE + "/cmd", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body)
  });
  const t = await r.text();
  try { return JSON.parse(t); } catch { return { ok: false, raw: t }; }
}

async function getStatus() {
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

async function callTool(name, args) {
  args = args || {};
  switch (name) {
    case "hormuz_status": return getStatus();
    case "hormuz_bomb": return post({ op: "bomb", x: args.x, z: args.z, r: args.r, src: "mcp" });
    case "hormuz_navy": return post({ op: "navy", side: args.side || "sea", n: args.n || 3, src: "mcp" });
    case "hormuz_artillery": return post({ op: "artillery", x: args.x, z: args.z, src: "mcp" });
    case "hormuz_air": return post({ op: "air", side: args.side || "sea", src: "mcp" });
    case "hormuz_radar": return post({ op: "radar", src: "mcp" });
    case "hormuz_voice": {
      const r = await fetch(BASE + "/voice", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ text: args.text, src: "mcp" })
      });
      return r.json();
    }
    case "hormuz_possess": return post({ op: "possess", who: args.who || "", src: "mcp" });
    case "hormuz_fire": return post({ op: "fire", who: args.who, weapon: args.weapon || "missile", x: args.x, z: args.z, src: "mcp" });
    case "hormuz_paradrop": return post({ op: "paradrop", x: args.x, z: args.z, side: args.side || "land", src: "mcp" });
    default: throw new Error("unknown tool " + name);
  }
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
      process.stdout.write(JSON.stringify({
        jsonrpc: "2.0",
        id,
        result: {
          protocolVersion: "2024-11-05",
          serverInfo: { name: "hormuz", version: "0.1.0" },
          capabilities: { tools: {} }
        }
      }) + "\n");
      return;
    }
    if (method === "notifications/initialized") return;
    if (method === "tools/list") {
      process.stdout.write(JSON.stringify({ jsonrpc: "2.0", id, result: { tools: TOOLS } }) + "\n");
      return;
    }
    if (method === "tools/call") {
      const out = await callTool(params.name, params.arguments || {});
      process.stdout.write(JSON.stringify(ok(id, out)) + "\n");
      return;
    }
    process.stdout.write(JSON.stringify({ jsonrpc: "2.0", id, error: { code: -32601, message: method } }) + "\n");
  } catch (e) {
    process.stdout.write(JSON.stringify(fail(id, e.message)) + "\n");
  }
});
