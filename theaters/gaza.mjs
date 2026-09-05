/**
 * Gaza Strip + ~15 km Israel rim. Flat coastal plain.
 * Factions (same MCP tokens): sea=US Med, land=ISR envelope, irn=strip.
 * Toy sandbox. No score, no real targeting.
 */
export const gaza = {
  id: "gaza",
  title: "Gaza",
  kicker: "Situation room · sandbox",
  bootLine: "Striscia sul Mediterraneo…",
  generator: "mask",
  bounds: { lon0: 34.05, lon1: 34.95, latS: 31.06, latN: 31.88 },
  grid: { w: 256, d: 256, h: 64, cs: 32, waterY: 12 },
  lanes: { mainlandX: 0.70, channelZ: 0.50 },
  hud: {
    labels: ["US", "ISR", "GZA"],
    counts: ["sea", "land", "irn"]
  },
  stations: { sea: "US station", irn: "STRIP", land: "ISR station" },
  spots: {
    us: { lon: 34.16, lat: 31.48, name: "US FLEET", army: "us" },
    irn: { lon: 34.466, lat: 31.501, name: "GAZA CITY", army: "irn" }
  },
  dome: [
    { lon: 34.571, lat: 31.669, name: "DOME Ashkelon" },
    { lon: 34.596, lat: 31.525, name: "DOME Sderot" },
    { lon: 34.679, lat: 31.423, name: "DOME Netivot" },
    { lon: 34.521, lat: 31.607, name: "DOME Zikim" },
    { lon: 34.655, lat: 31.804, name: "DOME Ashdod" },
    { lon: 34.791, lat: 31.253, name: "DOME Beersheva" }
  ],
  places: {
    gazaCity: { lon: 34.466, lat: 31.501, name: "Gaza", kind: "city" },
    jabalia: { lon: 34.483, lat: 31.527, name: "Jabalia", kind: "city" },
    beitLahiya: { lon: 34.503, lat: 31.548, name: "Beit Lahiya", kind: "city" },
    beitHanoun: { lon: 34.536, lat: 31.538, name: "Beit Hanoun", kind: "city" },
    nuseirat: { lon: 34.392, lat: 31.447, name: "Nuseirat", kind: "city" },
    deir: { lon: 34.351, lat: 31.417, name: "Deir al-Balah", kind: "city" },
    khanYunis: { lon: 34.306, lat: 31.346, name: "Khan Yunis", kind: "city" },
    rafah: { lon: 34.250, lat: 31.287, name: "Rafah", kind: "city" },
    ashkelon: { lon: 34.571, lat: 31.669, name: "Ashkelon", kind: "city" },
    sderot: { lon: 34.596, lat: 31.525, name: "Sderot", kind: "city" },
    netivot: { lon: 34.679, lat: 31.423, name: "Netivot", kind: "city" },
    zikim: { lon: 34.521, lat: 31.607, name: "Zikim", kind: "city" },
    keremShalom: { lon: 34.284, lat: 31.228, name: "Kerem Shalom", kind: "city" },
    erez: { lon: 34.544, lat: 31.558, name: "Erez", kind: "city" },
    ashdod: { lon: 34.655, lat: 31.804, name: "Ashdod", kind: "city" },
    beerSheva: { lon: 34.791, lat: 31.253, name: "Be'er Sheva", kind: "city" },
    kiryatGat: { lon: 34.764, lat: 31.610, name: "Kiryat Gat", kind: "city" },
    ofakim: { lon: 34.620, lat: 31.314, name: "Ofakim", kind: "city" },
    kharg: { lon: 34.466, lat: 31.501, name: "Gaza", kind: "island" },
    mainland: { lon: 34.65, lat: 31.48, name: "Negev ovest", kind: "city" },
    seJetty: { lon: 34.431, lat: 31.526, name: "Porto Gaza", kind: "city" },
    tankFarm: { lon: 34.48, lat: 31.51, name: "Gaza nord", kind: "city" },
    runway: { lon: 34.276, lat: 31.246, name: "Pista Rafah", kind: "city" },
    tss: { lon: 34.16, lat: 31.45, name: "Mediterraneo", kind: "city" },
    hormuz: { lon: 34.466, lat: 31.501, name: "Gaza", kind: "island" }
  },
  land: [],
  /* Simplified public outline (not a legal border). Coast west, Israel east, Rafah south. */
  polys: {
    strip: [
      [34.489, 31.594],
      [34.539, 31.575],
      [34.546, 31.543],
      [34.546, 31.523],
      [34.508, 31.504],
      [34.452, 31.457],
      [34.416, 31.427],
      [34.375, 31.384],
      [34.366, 31.359],
      [34.369, 31.330],
      [34.358, 31.286],
      [34.313, 31.253],
      [34.268, 31.224],
      [34.248, 31.217],
      [34.218, 31.260],
      [34.225, 31.310],
      [34.250, 31.355],
      [34.280, 31.400],
      [34.330, 31.455],
      [34.390, 31.505],
      [34.431, 31.525],
      [34.470, 31.560],
      [34.489, 31.594]
    ],
    israel: [
      [34.28, 31.88],
      [34.95, 31.88],
      [34.95, 31.06],
      [34.28, 31.06],
      [34.28, 31.88]
    ],
    egypt: [
      [34.05, 31.08],
      [34.30, 31.08],
      [34.26, 31.22],
      [34.05, 31.18],
      [34.05, 31.08]
    ]
  }
};
