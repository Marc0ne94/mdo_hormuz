/** Kharg island board. First theater. ~30×25 km. */
export const kharg = {
  id: "kharg",
  title: "Kharg",
  kicker: "Situation room · sandbox",
  bootLine: "Alba su Kharg…",
  generator: "kharg",
  hud: { labels: ["US", "IRN", "CIV"], counts: ["sea", "irnland", "civ"] },
  stations: { sea: "US station", irn: "IRN station", land: "Coast" },
  bounds: { lon0: 50.05, lon1: 50.62, latS: 29.08, latN: 29.40 },
  grid: { w: 192, d: 160, h: 64, cs: 32, waterY: 12 },
  lanes: { mainlandX: null, channelZ: null },
  spots: {
    us: { lon: 50.116, lat: 29.227, name: "US FLEET", army: "us" },
    irn: { lon: 50.310, lat: 29.245, name: "IRN TERRAIN", army: "irn" }
  },
  places: {
    kharg: { lon: 50.310, lat: 29.245, name: "Kharg", kind: "island" },
    khargu: { lon: 50.310, lat: 29.30, name: "Khargu", kind: "island" },
    seaIsland: { lon: 50.27, lat: 29.245, name: "Sea Island", kind: "city" },
    seJetty: { lon: 50.34, lat: 29.22, name: "T-Jetty SE", kind: "city" },
    tankFarm: { lon: 50.31, lat: 29.25, name: "Tank farm", kind: "city" },
    runway: { lon: 50.318, lat: 29.24, name: "Pista", kind: "city" },
    ganaveh: { lon: 50.52, lat: 29.58, name: "Ganaveh", kind: "city" },
    bushehr: { lon: 50.84, lat: 28.97, name: "verso Bushehr", kind: "city" },
    mainland: { lon: 50.55, lat: 29.24, name: "Costa Bushehr", kind: "city" },
    tss: { lon: 50.22, lat: 29.20, name: "Golfo ovest", kind: "city" },
    hormuz: { lon: 50.310, lat: 29.245, name: "Kharg", kind: "island" }
  },
  land: [
    { lon: 50.310, lat: 29.245, rxKm: 4.5, rzKm: 8, h: 11 },
    { lon: 50.310, lat: 29.30, rxKm: 1.6, rzKm: 3.2, h: 5 },
    { lon: 50.55, lat: 29.24, rxKm: 12, rzKm: 18, h: 14 }
  ]
};
