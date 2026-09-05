/** Point-in-polygon (lon/lat rings). Toy geography, not a legal boundary. */
export function pointInPoly(poly, lon, lat) {
  if (!poly || poly.length < 3) return false;
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const xi = poly[i][0], yi = poly[i][1];
    const xj = poly[j][0], yj = poly[j][1];
    if (yi === yj) continue;
    const hit = ((yi > lat) !== (yj > lat)) &&
      (lon < (xj - xi) * (lat - yi) / (yj - yi) + xi);
    if (hit) inside = !inside;
  }
  return inside;
}

export function layerAt(theater, lon, lat) {
  const p = theater.polys;
  if (!p) return "sea";
  if (p.strip && pointInPoly(p.strip, lon, lat)) return "strip";
  if (p.egypt && pointInPoly(p.egypt, lon, lat)) return "egypt";
  if (p.israel && pointInPoly(p.israel, lon, lat)) return "israel";
  return "sea";
}
