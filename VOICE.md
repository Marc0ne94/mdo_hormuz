# Voce → Kharg

Il tuo STT (occhiali) parla **testo**. Il bus parla **JSON**. Niente audio qui.

```
POST http://127.0.0.1:8765/voice
{ "text": "spara missile", "src": "glasses" }
```

O MCP `hormuz_voice` con lo stesso `text`. I comandi già JSON vanno in `hormuz_cmd`.

## Frasi che il parser capisce

| Di' | Diventa |
|---|---|
| spara missile / nave spara / ship attack | `fire` weapon=missile |
| spara bomba / bombarda | `fire` bomb **o** `bomb` |
| cannone / carro spara | `fire` cannon |
| carro dal cielo / paradrop / paracadute | `paradrop` |
| prendi portaerei / impersona SEA-CVN 1 | `possess` |
| lascia / esci | `possess` who="" |
| chiama la marina | `navy` |
| artiglieria / barrage | `artillery` / `barrage` |
| radar | `radar` |
| apri il fuoco / battaglia | `battle` n=1 |
| irn dal terreno / iraniani | `navy` side=irn |
| farm in fiamme / civili | `oilfire` zone=farm |

Testo non in tabella (e non nelle altre frasi del parser): **rifiutato** (`error: unrecognized`). Non diventa `bomb`. `POST /voice` risponde 400 e non accoda. `hormuz_voice` non torna successo.

Coordinate opzionali: `80 90` nel testo.

Memoria loop: `memory/loop.jsonl` (ogni comando + heartbeat 60s).
