# KHARG — piano e motore (slice 1, chiuso)

Sandbox voxel. Non è un wargame con vincitore. Non è un aiuto al targeting.
Geografia pubblica. Classi mezzo = giocattoli MagicaVoxel, non loadout reali.

Voce di MDO (prompt −1 e −2): [MDO.MD](MDO.MD).

## Cattura del brief (niente versus)

| MDO ha detto | Cosa è in questo slice |
|---|---|
| Kharg come modello | Isola 8×4.5 km, Khargu, costa Bushehr, Sea Island, T-jetty, pista, tank farm |
| SEA dal mare | fazione `sea`, spawn golfo ovest |
| LAND dal continente | fazione `land`, spawn costa est |
| IRN dal terreno | fazione `irn`, spawn isola |
| Battaglia infinita terra/mare/aria | onde di spawn se i conti calano |
| Comandi bomb / navy / artillery via MCP | bus JSON + SSE + tool stdio |
| Occhiali / duello 1v1 | stesso bus, due mittenti, **niente punteggio** |
| Versus dopo | **fuori scope**. Non indovinare. |
| Mondo scalabile | chunk 32 già lì; W×D resta 192×160 finché il bus è verde |

Stretto di Hormuz (~480 km a SE): **fuori da questa scacchiera**.

## Geografica (pubblica)

| Fatto | Uso voxel |
|---|---|
| 29.245°N 50.310°E | centro isola |
| ~8 km N–S, ~4.5 km E–W, ~20 km² | ellipse N–S |
| cima ~70 m | plateau + tank farm |
| Khargu ~3 km a nord | dito di sabbia |
| costa ~25 km est | mainlandX(z) |
| ovest/sud profondi | Sea Island (gioco) |
| porto SE | T-jetty + causeway |
| pista N–S | asfalto + soglie oro |
| faro | nord isola |
| pipeline sottomarina (gioco) | linea STEEL isola↔costa |

## Due rami

```
WORLD  voxel + props Kharg          ENGINE  bus + HTTP/SSE + MCP
  │                                   │
  └──── SIM (fazioni, onde, fisica) ──┘
                 │
              VIEW Three.js
```

## Bus

```
{ "op":"bomb",      "x":80, "z":90, "r":3.2, "src":"mcp" }
{ "op":"navy",      "side":"sea"|"land"|"irn", "n":1..8, "src":"mcp" }
{ "op":"artillery", "x":160, "z":80, "src":"mcp" }
{ "op":"air",       "side":"sea"|"land"|"irn", "src":"mcp" }
{ "op":"radar",     "src":"mcp" }
{ "op":"status" }
```

POST `/cmd` → coda + broadcast. GET `/events` SSE. GET `/status`.
MCP `mcp-hormuz.mjs` wrappa POST. UI bottoni wrappano POST.
`window.HORMUZ.cmd(obj)` in console.

## Processi

```
node server.mjs          # :8765
node mcp-hormuz.mjs      # stdio → 8765
```

Snippet Grok: `mcp-grok.toml`. Serve **sessione nuova** dopo il paste in config.

## File

| File | Ruolo |
|---|---|
| `index.html` | mondo + sim + vista |
| `server.mjs` | static + bus |
| `mcp-hormuz.mjs` | tool MCP |
| `ARCH.md` | questo piano |
| `MDO.MD` | voce, non riassunto |
| `avvia.cmd` | alza il bus e il browser |

## Verde di questo slice

- [x] Kharg come scacchiera (non lo stretto)
- [x] tre fazioni, spawn infinito
- [x] carrier / DDG / colonna / artiglieria / SAM / jet (gioco)
- [x] bus bomb navy artillery air radar
- [x] MCP stdio
- [x] niente versus

## Voce (slice 1b)

STT tuo → testo → `POST /voice` o MCP `hormuz_voice`.
Parser: `parse-voice.mjs`. Contratto: `VOICE.md`.
Possess / fire / paradrop / barrage / lock.
Memoria: `memory/loop.jsonl` + heartbeat 60s.

## Non ora

W/D più grande, streaming chunk, classi mezzo extra, versus, punteggio.
