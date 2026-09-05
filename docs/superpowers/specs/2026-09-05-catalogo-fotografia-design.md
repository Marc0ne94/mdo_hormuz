# Catalogo e fotografia

Quadro lungo, tono aperto: [docs/CONSIDERAZIONI.txt](../../CONSIDERAZIONI.txt).

## Scelta

Inventario come elenco eseguibile (`engine/catalog.mjs`). Runtime attuale: cubetti in `index.html`. `assets/vox` e `assets/gltf` come posto per MagicaVoxel / Blender. Un tag su questa working copy dopo carta allineata. Mesh gltf = stesso catalogo, altro file — non un secondo mondo.

## Unità

- `theaters/*.mjs` + `engine/theater.mjs` — geografia (già in test)
- `ops.mjs` — comandi bus
- `engine/catalog.mjs` — mezzi/compositi (l,w,h voxel, mesh boxes|gltf, asset, reuse)
- `assets/` — file modello, loader quando serve
- `docs/CONSIDERAZIONI.txt` — ragionamento e numeri di fotografia

## Test

`npm test` include confronti su: teatri noti, ordine di grandezza CVN > DDG > patrol > carro > persona, `mesh:gltf` solo se il file c’è. I metri/teatro restano calcolati da `spanKm`, non copiati a mano nel catalogo.

## Fuori da questo giro

Loader GLTF, split di `index.html`, instancing di massa, pubblicazione store. Restano strade aperte, descritte in CONSIDERAZIONI §6–7.

## Carta

README, ARCH, AGENTS descrivono tre teatri, Gaza allargata, plugin meteo, catalogo. Il piano look/pioggia resta in `plans/` come slice superata.
