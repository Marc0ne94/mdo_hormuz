/**
 * Strait of Hormuz square: Dubai (Jebel Ali) to Kahnuj.
 * Covers Qeshm, Musandam, Bandar Abbas, TSS. Overview scale.
 */
export const hormuz = {
  id: "hormuz",
  title: "Hormuz",
  kicker: "Situation room · sandbox",
  bootLine: "Stretto di Hormuz…",
  generator: "mask",
  hud: { labels: ["US", "IRN", "CIV"], counts: ["sea", "irnland", "civ"] },
  stations: { sea: "US station", irn: "IRN station", land: "Coast" },
  bounds: { lon0: 54.36, lon1: 57.71, latS: 24.95, latN: 27.95 },
  grid: { w: 256, d: 256, h: 64, cs: 32, waterY: 12 },
  lanes: { mainlandX: 0.55, channelZ: 0.52 },
  spots: {
    us: { lon: 55.27, lat: 25.35, name: "US GULF", army: "us" },
    irn: { lon: 56.27, lat: 27.18, name: "BANDAR ABBAS", army: "irn" }
  },
  places: {
    dubai: { lon: 55.271, lat: 25.205, name: "Dubai", kind: "city" },
    jebelAli: { lon: 55.027, lat: 24.985, name: "Jebel Ali", kind: "city" },
    sharjah: { lon: 55.391, lat: 25.346, name: "Sharjah", kind: "city" },
    rasAlKhaimah: { lon: 55.943, lat: 25.789, name: "Ras Al Khaimah", kind: "city" },
    fujairah: { lon: 56.342, lat: 25.128, name: "Fujairah", kind: "city" },
    khasab: { lon: 56.248, lat: 26.180, name: "Khasab", kind: "city" },
    musandam: { lon: 56.38, lat: 26.22, name: "Musandam", kind: "island" },
    bandarAbbas: { lon: 56.266, lat: 27.183, name: "Bandar Abbas", kind: "city" },
    qeshm: { lon: 55.92, lat: 26.75, name: "Qeshm", kind: "island" },
    hormuzIsland: { lon: 56.452, lat: 27.067, name: "Hormuz", kind: "island" },
    larak: { lon: 56.356, lat: 26.853, name: "Larak", kind: "island" },
    hengam: { lon: 55.883, lat: 26.651, name: "Hengam", kind: "island" },
    abuMusa: { lon: 55.032, lat: 25.873, name: "Abu Musa", kind: "island" },
    tunb: { lon: 55.139, lat: 26.264, name: "Tunb", kind: "island" },
    kahnuj: { lon: 57.699, lat: 27.941, name: "Kahnuj", kind: "city" },
    minab: { lon: 57.087, lat: 27.147, name: "Minab", kind: "city" },
    tss: { lon: 56.35, lat: 26.55, name: "TSS Hormuz", kind: "city" },
    kharg: { lon: 56.452, lat: 27.067, name: "Hormuz", kind: "island" },
    mainland: { lon: 56.27, lat: 27.18, name: "Costa Iran", kind: "city" },
    seJetty: { lon: 56.30, lat: 27.10, name: "Rajaee", kind: "city" },
    tankFarm: { lon: 56.22, lat: 27.20, name: "Abbas tanks", kind: "city" },
    runway: { lon: 56.37, lat: 27.22, name: "Pista Abbas", kind: "city" },
    hormuz: { lon: 56.452, lat: 27.067, name: "Hormuz", kind: "island" }
  },
  land: [
    { lon: 56.40, lat: 27.35, rxKm: 95, rzKm: 42, h: 16 },
    { lon: 55.85, lat: 26.78, rxKm: 62, rzKm: 16, h: 9 },
    { lon: 56.452, lat: 27.067, rxKm: 5, rzKm: 5, h: 8 },
    { lon: 56.356, lat: 26.853, rxKm: 4, rzKm: 3, h: 6 },
    { lon: 55.883, lat: 26.651, rxKm: 5, rzKm: 3, h: 6 },
    { lon: 56.32, lat: 26.20, rxKm: 22, rzKm: 28, h: 18 },
    { lon: 55.40, lat: 25.25, rxKm: 55, rzKm: 18, h: 8 },
    { lon: 56.00, lat: 25.75, rxKm: 28, rzKm: 14, h: 10 },
    { lon: 56.34, lat: 25.16, rxKm: 14, rzKm: 10, h: 9 },
    { lon: 57.70, lat: 27.94, rxKm: 18, rzKm: 16, h: 12 },
    { lon: 55.03, lat: 25.87, rxKm: 3, rzKm: 3, h: 5 },
    { lon: 55.14, lat: 26.26, rxKm: 3, rzKm: 2, h: 5 }
  ]
};
