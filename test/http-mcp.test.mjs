import { test } from "node:test";
import {
  withBus,
  httpScenario,
  assertHttpScenario,
  mcpScenario,
  assertMcpScenario
} from "./helpers.mjs";

test("HTTP GET /status POST /cmd POST /voice twice on a free port", { timeout: 30000 }, async () => {
  for (let i = 0; i < 2; i++) {
    await withBus(async (bus) => {
      const s = await httpScenario(bus.url);
      assertHttpScenario(s);
    });
  }
});

test("MCP initialize list call against live bus twice", { timeout: 40000 }, async () => {
  for (let i = 0; i < 2; i++) {
    await withBus(async (bus) => {
      const s = await mcpScenario(bus.url);
      assertMcpScenario(s);
    });
  }
});
