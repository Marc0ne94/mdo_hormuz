import http from "http";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { parseVoice } from "./parse-voice.mjs";
import { OPS, SIDES, WEAPONS, VERSION, PRODUCT } from "./ops.mjs";

const __dir = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.HORMUZ_PORT || 8765);
const HOST = process.env.HORMUZ_HOST || "127.0.0.1";
const sse = new Set();
const log = [];
let seq = 0;

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".md": "text/markdown; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".ico": "image/x-icon"
};

function send(res, code, body, type) {
  res.writeHead(code, {
    "content-type": type || "text/plain; charset=utf-8",
    "access-control-allow-origin": "*",
    "cache-control": "no-store"
  });
  res.end(body);
}

function broadcast(evt) {
  const line = `data: ${JSON.stringify(evt)}\n\n`;
  for (const res of sse) {
    try { res.write(line); } catch { sse.delete(res); }
  }
}

function normalize(raw) {
  const op = String(raw.op || "").toLowerCase();
  const src = String(raw.src || "http").slice(0, 40);
  const n = Math.max(1, Math.min(8, Number(raw.n) || 1));
  const x = Number(raw.x);
  const z = Number(raw.z);
  const r = Math.max(1, Math.min(5, Number(raw.r) || 3.2));
  const side = SIDES.includes(raw.side) ? raw.side : "sea";
  const weapon = WEAPONS.includes(raw.weapon) ? raw.weapon : "missile";
  const who = raw.who != null ? String(raw.who).slice(0, 80) : "";
  const zone = raw.zone != null ? String(raw.zone).slice(0, 24) : "";
  if (!OPS.includes(op)) return { error: "unknown op", op };
  const cmd = { op, src, n, x, z, r, side, weapon, who, zone, ts: Date.now() };
  if (op !== "status") cmd.id = ++seq;
  else cmd.id = seq;
  return cmd;
}

const memDir = path.join(__dir, "memory");
const memFile = path.join(memDir, "loop.jsonl");
function remember(cmd) {
  try {
    fs.mkdirSync(memDir, { recursive: true });
    fs.appendFileSync(memFile, JSON.stringify(cmd) + "\n");
  } catch (_) {}
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (c) => chunks.push(c));
    req.on("end", () => {
      try { resolve(JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}")); }
      catch (e) { reject(e); }
    });
    req.on("error", reject);
  });
}

const server = http.createServer(async (req, res) => {
  const u = new URL(req.url, "http://127.0.0.1");
  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      "access-control-allow-origin": "*",
      "access-control-allow-methods": "GET,POST,OPTIONS",
      "access-control-allow-headers": "content-type"
    });
    res.end();
    return;
  }

  if (req.method === "GET" && u.pathname === "/events") {
    res.writeHead(200, {
      "content-type": "text/event-stream; charset=utf-8",
      "cache-control": "no-store",
      "connection": "keep-alive",
      "access-control-allow-origin": "*"
    });
    res.write("retry: 1500\n\n");
    sse.add(res);
    req.on("close", () => sse.delete(res));
    return;
  }

  if (req.method === "GET" && u.pathname === "/status") {
    send(res, 200, JSON.stringify({
      ok: true, product: PRODUCT, version: VERSION,
      seq, clients: sse.size, last: log.slice(-8), ops: OPS
    }, null, 2), MIME[".json"]);
    return;
  }

  if (req.method === "GET" && u.pathname === "/memory") {
    const n = Math.max(1, Math.min(80, Number(u.searchParams.get("n") || 24)));
    send(res, 200, JSON.stringify({ ok: true, last: log.slice(-n) }), MIME[".json"]);
    return;
  }

  if (req.method === "POST" && (u.pathname === "/cmd" || u.pathname === "/voice")) {
    let raw;
    try { raw = await readBody(req); }
    catch { send(res, 400, JSON.stringify({ error: "bad json" }), MIME[".json"]); return; }
    if (u.pathname === "/voice") {
      const parsed = parseVoice(raw.text || raw.q || "", raw.src || "voice");
      if (parsed.error) {
        send(res, 400, JSON.stringify({ ok: false, error: parsed.error, text: parsed.text }), MIME[".json"]);
        return;
      }
      raw = { ...raw, ...parsed, src: raw.src || parsed.src };
    }
    const cmd = normalize(raw);
    if (cmd.error) { send(res, 400, JSON.stringify({ ok: false, ...cmd }), MIME[".json"]); return; }
    if (cmd.op !== "status") {
      log.push(cmd);
      if (log.length > 200) log.shift();
      remember(cmd);
      broadcast(cmd);
    }
    send(res, 200, JSON.stringify({ ok: true, cmd, queued: cmd.op !== "status" }), MIME[".json"]);
    return;
  }

  let rel = u.pathname === "/" ? "/index.html" : u.pathname;
  rel = path.normalize(rel).replace(/^(\.\.[/\\])+/, "");
  const file = path.join(__dir, rel);
  if (!file.startsWith(__dir)) { send(res, 403, "no"); return; }
  fs.readFile(file, (err, buf) => {
    if (err) { send(res, 404, "not found"); return; }
    send(res, 200, buf, MIME[path.extname(file)] || "application/octet-stream");
  });
});

setInterval(() => {
  remember({ op: "heartbeat", ts: Date.now(), clients: sse.size, seq });
}, 60000);

server.listen(PORT, HOST, () => {
  process.stderr.write(`${PRODUCT} ${VERSION}  http://${HOST}:${PORT}/\n`);
});
