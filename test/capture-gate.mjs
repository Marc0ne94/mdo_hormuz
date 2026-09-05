import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { ROOT, withBus, httpScenario, assertHttpScenario, mcpScenario, assertMcpScenario, jsonReq, startMcp, attachStreams, parseToolBody, killTree } from "./helpers.mjs";

const scratch = process.argv[2];
if (!scratch) {
  process.stderr.write("usage: node test/capture-gate.mjs <scratch-dir>\n");
  process.exit(1);
}
fs.mkdirSync(scratch, { recursive: true });

function dump(name, obj) {
  fs.writeFileSync(path.join(scratch, name), typeof obj === "string" ? obj : JSON.stringify(obj, null, 2), "utf8");
}

const unit = spawnSync(process.execPath, ["--test", path.join(ROOT, "test", "voice-stdio.test.mjs")], {
  cwd: ROOT,
  encoding: "utf8"
});
dump("unit.log", (unit.stdout || "") + (unit.stderr || ""));
if (unit.status !== 0) {
  process.stderr.write("unit tests failed\n");
  process.exit(unit.status || 1);
}

for (const n of [1, 2]) {
  await withBus(async (bus) => {
    const s = await httpScenario(bus.url);
    assertHttpScenario(s);
    dump("http-" + n + ".log", { url: bus.url, ...s });
  });
}

for (const n of [1, 2]) {
  await withBus(async (bus) => {
    const s = await mcpScenario(bus.url);
    assertMcpScenario(s);
    dump("mcp-" + n + ".log", { url: bus.url, ...s });
  });
}

try {
  const live = await jsonReq("http://127.0.0.1:8765/status", { signal: AbortSignal.timeout(800) });
  let hormuz_status = null;
  let tools = null;
  if (live.ok) {
    const child = startMcp("http://127.0.0.1:8765");
    const rpc = attachStreams(child.stdin, child.stdout);
    try {
      await rpc.send({
        jsonrpc: "2.0", id: 1, method: "initialize",
        params: { protocolVersion: "2024-11-05", capabilities: {}, clientInfo: { name: "live", version: "0" } }
      });
      const list = await rpc.send({ jsonrpc: "2.0", id: 2, method: "tools/list" });
      tools = (list.result?.tools || []).map((t) => t.name);
      const status = await rpc.send({
        jsonrpc: "2.0", id: 3, method: "tools/call",
        params: { name: "hormuz_status", arguments: {} }
      });
      hormuz_status = parseToolBody(status);
    } finally {
      try { child.stdin.end(); } catch { /* closed */ }
      killTree(child);
    }
  }
  dump("live-8765.log", { get: live, tools, hormuz_status });
} catch (e) {
  dump("live-8765.log", { absent: true, error: e.message });
}

process.stdout.write("gate ok " + scratch + "\n");
