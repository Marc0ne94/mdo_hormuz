import { test } from "node:test";
import assert from "node:assert/strict";
import { PassThrough } from "node:stream";
import { parseVoice } from "../parse-voice.mjs";
import { runStdioMcp } from "../mcp-stdio/stdio.mjs";
import { attachStreams } from "./helpers.mjs";

const PHRASES = [
  ["spara missile", "fire"],
  ["prendi portaerei", "possess"],
  ["carro dal cielo", "paradrop"],
  ["radar", "radar"],
  ["apri il fuoco", "battle"]
];

test("VOICE.md phrases map to catalog ops", () => {
  for (const [text, op] of PHRASES) {
    const out = parseVoice(text);
    assert.equal(out.op, op, text);
    assert.equal(out.error, undefined, text);
  }
  const fire = parseVoice("spara missile");
  assert.equal(fire.weapon, "missile");
  assert.equal(parseVoice("apri il fuoco").n, 1);
});

test("unrecognized text is not bomb", () => {
  const out = parseVoice("xyzzy not a command");
  assert.notEqual(out.op, "bomb");
  assert.equal(out.error, "unrecognized");
  const empty = parseVoice("   ");
  assert.notEqual(empty.op, "bomb");
  assert.equal(empty.error, "unrecognized");
});

function stubServer(extra) {
  const input = new PassThrough();
  const output = new PassThrough();
  const log = new PassThrough();
  const logs = [];
  log.setEncoding("utf8");
  log.on("data", (d) => logs.push(d));
  const outChunks = [];
  output.on("data", (d) => outChunks.push(Buffer.isBuffer(d) ? d.toString("utf8") : d));
  const tools = extra.tools || [
    { name: "alpha", description: "a", inputSchema: { type: "object", properties: {} } }
  ];
  const handle = runStdioMcp({
    name: extra.name || "stub",
    version: extra.version || "0.0.0",
    title: extra.title || "STUB",
    tools,
    call: extra.call,
    ensure: extra.ensure,
    input,
    output,
    log
  });
  const rpc = attachStreams(input, output);
  return { input, output, log, logs, outChunks, handle, rpc, tools };
}

test("stdio initialize ping list call are JSON-RPC on stdout only", async () => {
  const catalog = [];
  const { rpc, handle, input, logs, outChunks, tools } = stubServer({
    async call(name, args) {
      catalog.push({ name, args });
      return { ok: true, echo: name, n: args.n };
    }
  });
  const init = await rpc.send({
    jsonrpc: "2.0",
    id: 1,
    method: "initialize",
    params: { protocolVersion: "2024-11-05", capabilities: {}, clientInfo: { name: "t", version: "0" } }
  });
  assert.equal(init.jsonrpc, "2.0");
  assert.ok(init.result.protocolVersion);
  assert.equal(init.result.serverInfo.name, "stub");
  const ping = await rpc.send({ jsonrpc: "2.0", id: 2, method: "ping" });
  assert.equal(ping.jsonrpc, "2.0");
  assert.ok(ping.result);
  assert.equal(ping.error, undefined);
  const list = await rpc.send({ jsonrpc: "2.0", id: 3, method: "tools/list" });
  assert.deepEqual(list.result.tools.map((t) => t.name), tools.map((t) => t.name));
  const called = await rpc.send({
    jsonrpc: "2.0",
    id: 4,
    method: "tools/call",
    params: { name: "alpha", arguments: { n: 7 } }
  });
  assert.equal(called.error, undefined);
  const body = JSON.parse(called.result.content[0].text);
  assert.equal(body.ok, true);
  assert.equal(body.echo, "alpha");
  assert.equal(body.n, 7);
  assert.deepEqual(catalog, [{ name: "alpha", args: { n: 7 } }]);
  const text = outChunks.join("");
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  for (const line of lines) {
    const o = JSON.parse(line);
    assert.equal(o.jsonrpc, "2.0");
  }
  for (const chunk of logs) {
    const trimmed = chunk.trim();
    if (!trimmed) continue;
    try {
      const o = JSON.parse(trimmed);
      assert.notEqual(o.jsonrpc, "2.0");
    } catch {
      /* non-JSON log is expected */
    }
  }
  handle.close();
  input.end();
});

test("tools/call waits for ensure before call and before success", async () => {
  let callAt = 0;
  let release;
  const gate = new Promise((r) => { release = r; });
  const { rpc, handle, input } = stubServer({
    async ensure() { await gate; },
    async call() {
      callAt = Date.now();
      return { ok: true };
    }
  });
  await rpc.send({ jsonrpc: "2.0", id: 1, method: "initialize", params: {} });
  const pending = rpc.send({
    jsonrpc: "2.0",
    id: 2,
    method: "tools/call",
    params: { name: "alpha", arguments: {} }
  });
  await new Promise((r) => setTimeout(r, 60));
  assert.equal(callAt, 0);
  const tRelease = Date.now();
  release();
  const res = await pending;
  assert.ok(callAt >= tRelease);
  assert.equal(res.error, undefined);
  assert.ok(res.result);
  handle.close();
  input.end();
});

test("tools/call does not succeed if ensure throws", async () => {
  let called = false;
  const { rpc, handle, input } = stubServer({
    async ensure() { throw new Error("bus down"); },
    async call() { called = true; return { ok: true }; }
  });
  await rpc.send({ jsonrpc: "2.0", id: 1, method: "initialize", params: {} });
  const res = await rpc.send({
    jsonrpc: "2.0",
    id: 2,
    method: "tools/call",
    params: { name: "alpha", arguments: {} }
  });
  assert.ok(res.error);
  assert.equal(called, false);
  handle.close();
  input.end();
});
