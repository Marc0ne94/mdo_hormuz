# KHARG — look, performance, pioggia

> Slice superata. Notte/pioggia = plugin. Fotografia attuale: `docs/CONSIDERAZIONI.txt`.

> Piano operativo 1–2 giorni. Motore = `index.html`. Bus/MCP non si toccano. Voxel MagicaVoxel, niente PBR, niente versus.

**Goal:** Lo show resta leggibile (tattica HOLD e FREE) su Surface; la notte è un **look dedicato**; la pioggia è un effetto a basso costo; il giorno da briefing non deriva più nel buio.

**Architecture:** Un enum `look` (`brief` | `live` | `night`) guida luce, nebbia, esposizione e FX. `dayPhase` resta l’orologio, ma `brief` lo **blocca** su un sole alto. Qualità (`PERF.quality` + cap FX) è un profilo, non un adattamento cieco. Pioggia = instanced streaks, non voxel.

**Tech stack:** `index.html` (Three r170), `test/` esistente, verifica browser 127.0.0.1:8765 tattica.

## Global constraints

- Un HTML, un bus, tre tool MCP. Niente secondo motore.
- Cubetti MagicaVoxel, non mesh PBR.
- Niente punteggio / targeting reale.
- Surface iGPU è il target; Android è lo stesso profilo `android` (non un port).
- Budget: ~1–2 giorni, ~1M token — **slice sequenziali in questa sessione**, no storm di subagent.
- Verifica: screen tattica HOLD + FREE + look Night; fps/ms in sitmap.

## Perché è buio (fatto, non opinione)

`updateSky` in `index.html`:

```js
dayPhase = (dayPhase + dt * timeScale / 160) % 1;  // giorno intero = 160 s a 1×
const ang = (dayPhase - 0.25) * Math.PI * 2;
const day = Math.max(0, Math.sin(ang));            // sole sopra l’orizzonte
sun.intensity = 0.28 + day * 1.28;
```

| Bottone | `dayPhase` | ora etichetta | `sin(ang)` | luce reale |
|---|---|---|---|---|
| Night | 0.00 | 00h Mezzanotte | negativo | notte |
| Dawn | **0.22** | 05h Alba | **ancora negativo** | **ancora notte** |
| default | 0.34 | 08h Mattino | ~0.54 | mezzo sole |
| Noon | 0.50 | 12h | 1.0 | unico look davvero chiaro |
| Dusk | 0.74 | 18h | ~0 | quasi notte |

In più: `KeyT` accelera 1→4→12× (giorno in ~13 s); FogExp2 + ACES; tattica da quota 128 su terreno bruno. Senza Noon lo show **è** buio. Alba è un bug di mapping, non “manca atmosfera”.

Notte da presidente ≠ `dayPhase = 0` sulla stessa curva. È un **set**: buio, lampade, flash di esplosione che *illuminano* l’isola, sitrep rossa se FREE.

---

### Task 1: Look lock + luce da briefing

**Files:** Modify `index.html` (`updateSky`, bottoni VIEW, `HORMUZ.look`)

**Produces:** `look` ∈ `brief` | `live` | `night`. `brief` default in tattica.

- [x] **Look**
  - `brief`: `dayPhase` bloccato a **0.50** (Noon). Sole alto, fog basso, esposizione ≥ 1.15. Orologio può ancora scorrere in etichetta *oppure* mostrare “BRIEF · NOON” — scegliere etichetta fissa `BRIEF` per non mentire.
  - `live`: giorno lento, **pavimento** `day = max(day, 0.35)` così non scende in “Buio 03h” da solo. T ancora accelera, ma il pavimento resta.
  - `night`: set dedicato (Task 4). Non è Dawn.
- [ ] **Bottoni**
  - Dawn → `look=live`, `dayPhase=0.32` (sole già sopra: ~08h). Oggi 0.22 è sbagliato.
  - Noon → `look=brief`, `dayPhase=0.50`
  - Dusk → `look=live`, `dayPhase=0.62` (sole ancora visibile)
  - Night → `look=night`
- [ ] **Verifica browser:** tattica, Dawn, Dusk, 30 s senza toccare Noon: isola **leggibile**. Screen.

---

### Task 2: Profilo qualità + tetto esplosioni

**Files:** Modify `index.html` (`PERF`, `explode`, `burstFromTerrain`, `spawnPart`, `animate`)

**Produces:** HOLD tattica ≥ ~30 fps; FREE non supera ~200 ms/frame di picco a lungo.

- [ ] Cap: `MAX_PART` effettivo `min(2200, 400 + quality*800)`; debris `min(320, 80 + quality*120)`.
- [ ] `explode`: raggio invariato visivo; debris spawn **≤ 24** per scoppio; `collapseRegion` skip se `quality < 0.55`.
- [ ] `burstFromTerrain` / civ: 1–2 `explode`, non 3–4 in catena nello stesso frame.
- [ ] `remeshDirty`: budget 1 chunk; **non** alzare il budget (peggiora lo stutter).
- [ ] Grade: off in tattica (`camMode==='tac'`).
- [ ] Verifica: HOLD screen + fps; FREE 20 s, sitmap ms; niente schermo nero.

---

### Task 3: Pioggia (effetto, non meteo-sim)

**Files:** Modify `index.html` (dopo `updateSpots` / parti)

**Produces:** Toggle VIEW `Rain`. Streaks instanced, fog leggermente più denso, sitrep `RAIN`.

- [ ] `InstancedMesh` di 400–800 streak (box sottili, `MeshBasicMaterial`, `fog: true`), caduta in view, wrap Y.
- [ ] Intensità 0 in `brief` di default; in `live`/`night` il bottone accende.
- [ ] Niente voxel bagnati, niente puddles. Costo: un draw call.
- [ ] Verifica: Rain on/off in brief e night; fps non crolla >15%.

---

### Task 4: Set Night (buio + flash)

**Files:** Modify `index.html` (`updateSky` branch `look==='night'`, `explode`)

**Produces:** Isola scura ma **contornata**; ogni bomba è una luce breve.

- [ ] Luce: sun ~0.08, moon 0.7, hemi 0.18, fog scuro ma density **più bassa** in tattica (altrimenti fango).
- [ ] `PointLight` pool (4 luci): `explode` le piazza, intensity decade in 0.4–0.8 s. FREE = isolette di luce.
- [ ] Lampade esistenti già in `lampLights` — alzarle in night, non in brief.
- [ ] Banner/sitrep già rossi su FREE: restano.
- [ ] Verifica: Night + HOLD (buio leggibile, spot US/IRN visibili); Night + FREE (flash). Due screen.

---

### Task 5 (se avanza tempo): corsie, non ping-pong

**Files:** Modify `index.html` (`updateShips`, `updateJets`, `updateHelis`)

- [ ] US: DDG restano nel golfo ovest (clamp x 8–40), CVN quasi ferma sullo spot.
- [ ] IRN patrol: anello isola, non `z=12…D-12` su tutta la mappa.
- [ ] Jet: da spot US verso isola e **rientro**, non wrap `x=-10`.
- [ ] Solo se Task 1–4 verdi. Altrimenti stop.

---

## Fuori scope (questo giro)

Replay bus, audio sitrep, Android touch, moto “AI” da wargame, PBR, bind LAN.

## Ordine e token

1. Task 1 (luce) — sblocca lo show.  
2. Task 2 (fps) — sblocca FX.  
3. Task 3 pioggia.  
4. Task 4 night set.  
5. Task 5 solo residuo.

Verifica **in browser dopo ogni task**, non alla fine. Un solo agente in linea; niente fan-out.

## Deviations

(vuota in partenza)
