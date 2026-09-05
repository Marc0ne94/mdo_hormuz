# KHARG / HORMUZ

Sandbox voxel in un HTML. Non è Ocra, non è ABAP.
Quadro lungo e numeri: `docs/CONSIDERAZIONI.txt`. Indice carta: `docs/README.md`.

## Runtime

- Mondo + sim + vista: `index.html` (WebGL). Si può estrarre in moduli quando serve.
- Teatri: `theaters/` — `kharg` · `gaza` · `hormuz`. Query `?t=`. Default Kharg. Switch = reload, un mondo in RAM.
- Plugin meteo: `engine/plugins/weather.mjs` (off in test). Notte/pioggia come lavoro dedicato.
- Bus: `node server.mjs` → `http://127.0.0.1:8765/` (`avvia.cmd` apre anche il browser). Default loopback. LAN: `HORMUZ_HOST=0.0.0.0` (nessuna auth). MCP è stdio locale.
- Comandi: `ops.mjs`. Server, MCP e `applyCmd` allineati a quell’elenco.
- Voce: `parse-voice.mjs` → `POST /voice`
- Mezzi: oggi `make*` in `index.html`; elenco riusabile previsto in `engine/catalog.mjs`. Asset: `assets/vox`, `assets/gltf`.

## MCP (progetto)

- Loop: `mcp-stdio/` (vedi `mcp-stdio/CONNECTOR.md`)
- Adattatore: `mcp-hormuz.mjs`
- Config: `.grok/config.toml` di progetto (non `~/.grok/config.toml`)
- Tool: `hormuz_status` · `hormuz_cmd` · `hormuz_voice`. `ensure` alza il bus se è giù.

## Carattere attuale

Cubetti MagicaVoxel, classi mezzo da giocattolo, niente punteggio né targeting reale. Mesh più sagomate (Blender/gltf) stanno nello stesso catalogo quando c’è il file. Si scala.
