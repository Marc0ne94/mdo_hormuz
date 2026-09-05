import { spawn } from "node:child_process";
import net from "node:net";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const HORMUZ_TOOLS = ["hormuz_status", "hormuz_cmd", "hormuz_voice"];

export function freePort() {
  return new Promise((resolve, reject) => {
    const s = net.createServer();
    s.listen(0, "127.0.0.1", () => {
      const { port } = s.address();
      s.close((err) => (err ? reject(err) : resolve(port)));
    });
    s.on("error", reject);
  });
}

export async function waitHttp(url, timeoutMs = 8000) {
  const t0 = Date.now();
  let last = "";
  while (Date.now() - t0 < timeoutMs) {
    try {
      const r = await fetch(url, { signal: AbortSignal.timeout(600) });
      if (r.ok) return r;
      last = String(r.status);
    } catch (e) {
      last = e.message;
    }
    await new Promise((r) => setTimeout(r, 80));
  }
  throw new Error("timeout waiting " + url + " last=" + last);
}

export function killTree(child) {
  if (!child || child.exitCode != null) return;
  if (process.platform === "win32" && child.pid) {
    spawn("taskkill", ["/pid", String(child.pid), "/T", "/F"], { stdio: "ignore" });
  } else {
    try { child.kill("SIGTERM"); } catch { /* already gone */ }
  }
}

function waitExit(child, ms = 2500) {
  return new Promise((resolve) => {
    if (child.exitCode != null) return resolve();
    const t = setTimeout(resolve, ms);
    child.once("exit", () => { clearTimeout(t); resolve(); });
  });
}

export function startBus(port) {
  const child = spawn(process.execPath, [path.join(ROOT, "server.mjs")], {
    cwd: ROOT,
    env: { ...process.env, HORMUZ_PORT: String(port) },
    stdio: ["ignore", "pipe", "pipe"],
    windowsHide: true
  });
  return { child, port, url: "http://127.0.0.1:" + port };
}

export async function withBus(fn) {
  const port = await freePort();
  const bus = startBus(port);
  try {
    await waitHttp(bus.url + "/status");
    return await fn(bus);
  } finally {
    killTree(bus.child);
    await waitExit(bus.child);
  }
}

export async function jsonReq(url, opts = {}) {
  const r = await fetch(url, opts);
  const text = await r.text();
  let body;
  try { body = JSON.parse(text); } catch { body = { raw: text }; }
  return { http: r.status, ok: r.ok, body };
}

export async function httpScenario(base) {
  const post = (pathname, obj) => jsonReq(base + pathname, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(obj)
  });
  const status0 = await jsonReq(base + "/status");
  const cmd = await post("/cmd", { op: "radar", src: "test" });
  const voiceOk = await post("/voice", { text: "spara missile", src: "test" });
  const status1 = await jsonReq(base + "/status");
  const voiceBad = await post("/voice", { text: "xyzzy not a command", src: "test" });
  const status2 = await jsonReq(base + "/status");
  return { status0, cmd, voiceOk, status1, voiceBad, status2 };
}

export function assertHttpScenario(s) {
  if (s.status0.http !== 200 || s.status0.body.ok !== true) {
    throw new Error("GET /status not ok: " + JSON.stringify(s.status0));
  }
  const b0 = s.status0.body;
  if (!b0.product || !b0.version || typeof b0.seq !== "number" || !Array.isArray(b0.ops)) {
    throw new Error("status missing product/version/seq/ops");
  }
  const seq0 = b0.seq;
  if (s.cmd.http !== 200 || s.cmd.body.ok !== true || s.cmd.body.cmd?.op !== "radar") {
    throw new Error("POST /cmd radar: " + JSON.stringify(s.cmd));
  }
  if (s.voiceOk.http !== 200 || s.voiceOk.body.ok !== true || s.voiceOk.body.cmd?.op !== "fire") {
    throw new Error("POST /voice spara missile: " + JSON.stringify(s.voiceOk));
  }
  if (s.status1.body.seq !== seq0 + 2) {
    throw new Error("seq after writes want " + (seq0 + 2) + " got " + s.status1.body.seq);
  }
  if (s.voiceBad.body.ok === true) {
    throw new Error("unrecognized voice accepted: " + JSON.stringify(s.voiceBad));
  }
  if (s.voiceBad.body.cmd?.op === "bomb") {
    throw new Error("unrecognized voice queued as bomb");
  }
  if (s.status2.body.seq !== s.status1.body.seq) {
    throw new Error("seq advanced on rejected voice");
  }
  const lastOps = (s.status2.body.last || []).map((c) => c.op);
  if (lastOps.includes("bomb")) throw new Error("bomb in last: " + lastOps.join(","));
}

export function attachStreams(writableIn, readableOut, timeoutMs = 8000) {
  let buf = "";
  const queue = [];
  const waiters = [];
  readableOut.setEncoding("utf8");
  readableOut.on("data", (d) => {
    buf += d;
    for (;;) {
      const m = buf.match(/\r?\n/);
      if (!m) break;
      const idx = buf.indexOf(m[0]);
      const line = buf.slice(0, idx);
      buf = buf.slice(idx + m[0].length);
      if (!line.trim()) continue;
      const msg = JSON.parse(line);
      if (waiters.length) waiters.shift()(msg);
      else queue.push(msg);
    }
  });
  function recv() {
    if (queue.length) return Promise.resolve(queue.shift());
    return new Promise((resolve, reject) => {
      const t = setTimeout(() => reject(new Error("rpc timeout")), timeoutMs);
      waiters.push((msg) => { clearTimeout(t); resolve(msg); });
    });
  }
  return {
    send(obj) {
      writableIn.write(JSON.stringify(obj) + "\n");
      return recv();
    },
    recv,
    getBuf: () => buf
  };
}

export function startMcp(url) {
  return spawn(process.execPath, [path.join(ROOT, "mcp-hormuz.mjs")], {
    cwd: ROOT,
    env: { ...process.env, HORMUZ_URL: url, HORMUZ_NO_AUTOSTART: "1" },
    stdio: ["pipe", "pipe", "pipe"],
    windowsHide: true
  });
}

export function parseToolBody(msg) {
  if (msg.error) return { error: msg.error };
  const text = msg.result?.content?.[0]?.text;
  try { return JSON.parse(text); } catch { return { raw: text }; }
}

export async function mcpScenario(url) {
  const child = startMcp(url);
  const stderrChunks = [];
  child.stderr.setEncoding("utf8");
  child.stderr.on("data", (d) => stderrChunks.push(d));
  const rpc = attachStreams(child.stdin, child.stdout);
  try {
    const init = await rpc.send({
      jsonrpc: "2.0",
      id: 1,
      method: "initialize",
      params: { protocolVersion: "2024-11-05", capabilities: {}, clientInfo: { name: "gate", version: "0" } }
    });
    const ping = await rpc.send({ jsonrpc: "2.0", id: 2, method: "ping" });
    const list = await rpc.send({ jsonrpc: "2.0", id: 3, method: "tools/list" });
    const status = await rpc.send({
      jsonrpc: "2.0", id: 4, method: "tools/call",
      params: { name: "hormuz_status", arguments: {} }
    });
    const cmd = await rpc.send({
      jsonrpc: "2.0", id: 5, method: "tools/call",
      params: { name: "hormuz_cmd", arguments: { op: "radar" } }
    });
    const voice = await rpc.send({
      jsonrpc: "2.0", id: 6, method: "tools/call",
      params: { name: "hormuz_voice", arguments: { text: "spara missile" } }
    });
    const voiceBad = await rpc.send({
      jsonrpc: "2.0", id: 7, method: "tools/call",
      params: { name: "hormuz_voice", arguments: { text: "xyzzy not a command" } }
    });
    return { init, ping, list, status, cmd, voice, voiceBad, stderr: stderrChunks.join("") };
  } finally {
    try { child.stdin.end(); } catch { /* closed */ }
    killTree(child);
    await waitExit(child);
  }
}

export function assertMcpScenario(s) {
  if (s.init.error || !s.init.result?.protocolVersion || !s.init.result?.serverInfo) {
    throw new Error("initialize: " + JSON.stringify(s.init));
  }
  if (s.ping.error) throw new Error("ping: " + JSON.stringify(s.ping));
  const names = (s.list.result?.tools || []).map((t) => t.name);
  if (names.length !== 3 || HORMUZ_TOOLS.some((n) => !names.includes(n))) {
    throw new Error("tools/list want " + HORMUZ_TOOLS.join(",") + " got " + names.join(","));
  }
  const status = parseToolBody(s.status);
  if (status.error || status.ok !== true || !status.product || !status.version || typeof status.seq !== "number" || !Array.isArray(status.ops)) {
    throw new Error("hormuz_status: " + JSON.stringify(status));
  }
  const cmd = parseToolBody(s.cmd);
  if (cmd.error || cmd.ok !== true || cmd.cmd?.op !== "radar") {
    throw new Error("hormuz_cmd radar: " + JSON.stringify(cmd));
  }
  const voice = parseToolBody(s.voice);
  if (voice.error || voice.ok !== true || voice.cmd?.op !== "fire") {
    throw new Error("hormuz_voice spara missile: " + JSON.stringify(voice));
  }
  if (!s.voiceBad?.error) {
    throw new Error("unrecognized hormuz_voice should be JSON-RPC error: " + JSON.stringify(s.voiceBad));
  }
  for (const line of s.stderr.split(/\r?\n/)) {
    if (!line.trim()) continue;
    try {
      const o = JSON.parse(line);
      if (o && o.jsonrpc) throw new Error("JSON-RPC on stderr: " + line);
    } catch (e) {
      if (String(e.message).startsWith("JSON-RPC on stderr")) throw e;
    }
  }
}
