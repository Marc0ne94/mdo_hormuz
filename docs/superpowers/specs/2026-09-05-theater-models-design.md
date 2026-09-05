# Theater models — Kharg, Hormuz, Gaza

Geographic boards for the same voxel engine. Toy sandbox. No score, no real targeting.

## Models (locked)

| id | Title | Bounds (lon E, lat N) | Side | Grid | m/voxel |
|---|---|---|---|---|---|
| `kharg` | Kharg | 50.05–50.62, 29.08–29.40 | ~30 × 25 km | 192×160×64 | ~160 |
| `gaza` | Gaza | 34.05–34.95, 31.06–31.88 | ~85 × 91 km | 256×256×64 | ~350 |
| `hormuz` | Hormuz | 54.36–57.71, 24.95–27.95 | ~333 × 333 km | 256×256×64 | ~1300 |

Default: `kharg` (`?t=kharg`). Switch: `?t=gaza` · `?t=hormuz`.

## Gaza framing

Strip + cornice (Ashkelon, Sderot, Netivot, Zikim, Ashdod, Be’er Sheva, Kiryat Gat, Ofakim). Tel Aviv e Gerusalemme fuori da questo inquadramento. Mediterraneo ovest.

## Hormuz framing

Square that includes Dubai (Jebel Ali) and Kahnuj, covering the strait, Qeshm, Musandam, Bandar Abbas, TSS.

## Engine

- `theaters/*.mjs` = data only (bounds, places, land masks, spots).
- `engine/theater.mjs` = load, xz, km span.
- `engine/plugins/weather.mjs` = night / rain / meteo. **Default off** (tests run the optimized core).
- One bus, three MCP tools, same navigation (tac / orbit / possess).
- Craft prefabs to be instanced next (3× units). Voxel MagicaVoxel, not PBR.

## Generator

- `kharg`: existing detailed island.
- `gaza` / `hormuz`: land-mask blobs from the model (playable stub), refine later.
