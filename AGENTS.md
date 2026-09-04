# KHARG / HORMUZ

Sandbox voxel in un HTML. **Non è Ocra. Non è ABAP. Non è Blender.**

## Runtime

- Mondo + sim + vista: `index.html` (un file WebGL)
- Bus: `node server.mjs` → `http://127.0.0.1:8765/` (`avvia.cmd` apre anche il browser)
- Catalogo comandi: `ops.mjs` — unica fonte. Server, MCP e `applyCmd` devono restare allineati.
- Voce: `parse-voice.mjs` → `POST /voice`

## MCP (progetto)

- Loop generico: `mcp-stdio/` (copiabile in altri repo — vedi `mcp-stdio/CONNECTOR.md`)
- Adattatore Kharg: `mcp-hormuz.mjs` (tool + bus). Non mescolare le op nel loop.
- Config: `.grok/config.toml` scope **progetto**. Non copiare in `~/.grok/config.toml`.
- Tool: `hormuz_status` · `hormuz_cmd` · `hormuz_voice`. `ensure` alza il bus se è giù.

## Vincoli

- Cubetti MagicaVoxel, non mesh PBR. Classi mezzo = giocattoli.
- Niente versus, niente punteggio, niente targeting reale.
- Diff minimo. Fuori da `index.html` / bus / MCP non esiste un secondo motore.
