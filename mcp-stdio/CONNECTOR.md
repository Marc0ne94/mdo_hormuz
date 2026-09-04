# mcp-stdio — connettore MCP stdio

**Capacità**: far parlare un adattatore di prodotto con Grok (e qualsiasi client MCP) su stdin/stdout JSON-RPC.

Non è Hormuz, non è HANA, non è Obscura. È il loop. Il prodotto porta `tools` + `call` + eventuale `ensure`.

Nato dalla fucina `M2V_AI_TOOLS` (`connectors/` + proposta MCP-3: connettore sottile, voce di superficie a parte). Qui vive distillato, copiabile in altri repo MDO. Non va in `~/.grok/config.toml`.

## Come si invoca

```js
import { runStdioMcp } from "./mcp-stdio/stdio.mjs";

runStdioMcp({
  name: "mio-prodotto",
  version: "0.1.0",
  tools: [ /* { name, description, inputSchema } */ ],
  call: async (name, args) => { /* valore JSON */ },
  ensure: async () => { /* alza il backend se serve */ }
});
```

Grok, **scope progetto** (mai user globale):

```toml
# .grok/config.toml
[mcp_servers.mio-prodotto]
command = "node"
args = ["mcp-<prodotto>.mjs"]
enabled = true
startup_timeout_sec = 25
tool_timeout_sec = 20
```

Stdout = solo NDJSON JSON-RPC. Log su stderr (`~/.grok/logs/mcp/<server>.stderr.log`).

## Cosa NON garantisce

- **Nessun tool di dominio.** Se vedi `hormuz_*` o SQL, sei nell’adattatore, non qui.
- **Nessun valore di macchina.** Path, porte, token: env del prodotto o `${VAR}` in TOML.
- **Nessuna API key.** Se lo strumento la pretende, l’adattatore si ferma e lo dichiara.
- **Non registra MCP utente.** `grok mcp add --scope project` o file `.grok/config.toml` del repo consumer.
- **Non è il toolkit.** `M2V_AI_TOOLS` resta fucina. Questo file si copia; non si importa il toolkit intero.

## Riuso

Copia la cartella `mcp-stdio/` in un altro prodotto. Non copiare `mcp-hormuz.mjs`.
