# KHARG 0.2

Sandbox voxel dell’isola di Kharg. Bus di comandi + MCP. **Non è Ocra. Non è ABAP.**

```
avvia.cmd
http://127.0.0.1:8765/
```

O: `npm start` / `node server.mjs`.

## MCP Grok

In questo repo: `.grok/config.toml` (server `hormuz`).
Apri Grok **su `C:\Git\mdo_hormuz`**. Al primo tool il bus parte da solo.

| Tool | Fa |
|---|---|
| `hormuz_status` | seq, SSE, ultimi comandi |
| `hormuz_cmd` | `POST /cmd` — `op` da `ops.mjs` |
| `hormuz_voice` | testo → parser → bus |

Esempi: `{ "op":"navy", "side":"sea", "n":3 }` · `{ "op":"possess", "who":"portaerei" }` · `{ "op":"battle", "n":1 }`.

Voce: `VOICE.md`. Architettura: `ARCH.md`. Contratto agenti: `AGENTS.md`.
