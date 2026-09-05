import { THEATERS, DEFAULT_THEATER } from "../theaters/index.mjs";

export { THEATERS, DEFAULT_THEATER };

export function listTheaters() {
  return Object.keys(THEATERS);
}

export function spanKm(t) {
  const b = t.bounds;
  const mid = ((b.latS + b.latN) / 2) * Math.PI / 180;
  const kmN = (b.latN - b.latS) * 111.2;
  const kmE = (b.lon1 - b.lon0) * 111.2 * Math.cos(mid);
  return { kmE: +kmE.toFixed(1), kmN: +kmN.toFixed(1) };
}

export function contains(t, lon, lat) {
  const b = t.bounds;
  return lon >= b.lon0 && lon <= b.lon1 && lat >= b.latS && lat <= b.latN;
}

export function xzOn(t, lon, lat) {
  const { w, d } = t.grid;
  const b = t.bounds;
  const x = ((lon - b.lon0) / (b.lon1 - b.lon0)) * (w - 1);
  const z = ((b.latN - lat) / (b.latN - b.latS)) * (d - 1);
  return [x, z];
}

function clampSpot(t, p) {
  const [x, z] = xzOn(t, p.lon, p.lat);
  const { w, d } = t.grid;
  return {
    ...p,
    x: Math.max(4, Math.min(w - 5, x)),
    z: Math.max(4, Math.min(d - 5, z))
  };
}

export function getTheater(id) {
  const raw = THEATERS[id] || THEATERS[DEFAULT_THEATER];
  const geo = {};
  for (const [k, p] of Object.entries(raw.places)) geo[k] = clampSpot(raw, p);
  const spots = {
    us: { ...clampSpot(raw, raw.spots.us), kind: "spot" },
    irn: { ...clampSpot(raw, raw.spots.irn), kind: "spot" }
  };
  return { ...raw, geo, spots, span: spanKm(raw) };
}
