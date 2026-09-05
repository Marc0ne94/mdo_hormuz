import { test } from "node:test";
import assert from "node:assert/strict";
import { THEATERS, DEFAULT_THEATER, getTheater, listTheaters, contains, spanKm } from "../engine/theater.mjs";
import { weather } from "../engine/plugins/weather.mjs";
import { pointInPoly, layerAt } from "../engine/geo.mjs";

test("three locked theater models", () => {
  assert.deepEqual(listTheaters().sort(), ["gaza", "hormuz", "kharg"]);
  assert.equal(DEFAULT_THEATER, "kharg");
  for (const id of listTheaters()) {
    const t = getTheater(id);
    assert.equal(t.id, id);
    assert.ok(t.grid.w % t.grid.cs === 0);
    assert.ok(t.grid.d % t.grid.cs === 0);
    assert.ok(t.places.kharg);
    assert.ok(t.spots.us.x > 0 && t.spots.irn.z > 0);
  }
});

test("gaza is smaller than hormuz; kharg is the smallest", () => {
  const k = spanKm(THEATERS.kharg);
  const g = spanKm(THEATERS.gaza);
  const h = spanKm(THEATERS.hormuz);
  assert.ok(k.kmE < 70 && k.kmN < 45, JSON.stringify(k));
  assert.ok(g.kmE > 60 && g.kmE < 110, JSON.stringify(g));
  assert.ok(h.kmE > 280 && h.kmN > 280, JSON.stringify(h));
  assert.ok(k.kmE * k.kmN < g.kmE * g.kmN);
  assert.ok(g.kmE * g.kmN < h.kmE * h.kmN * 0.12);
});

test("gaza box is the strip plus a rim of Israel", () => {
  const t = THEATERS.gaza;
  assert.equal(contains(t, 34.466, 31.501), true); // Gaza City
  assert.equal(contains(t, 34.250, 31.287), true); // Rafah
  assert.equal(contains(t, 34.571, 31.669), true); // Ashkelon
  assert.equal(contains(t, 34.596, 31.525), true); // Sderot
  assert.equal(contains(t, 34.655, 31.804), true); // Ashdod
  assert.equal(contains(t, 34.791, 31.253), true); // Be'er Sheva
  assert.equal(contains(t, 34.764, 31.610), true); // Kiryat Gat
  assert.equal(contains(t, 34.781, 32.085), false); // Tel Aviv
  assert.equal(contains(t, 35.214, 31.768), false); // Jerusalem
});

test("hormuz box includes Dubai and Kahnuj and the strait", () => {
  const t = THEATERS.hormuz;
  assert.equal(contains(t, 55.271, 25.205), true); // Dubai
  assert.equal(contains(t, 57.699, 27.941), true); // Kahnuj
  assert.equal(contains(t, 56.27, 27.18), true); // Bandar Abbas
  assert.equal(contains(t, 56.45, 27.07), true); // Hormuz island
  assert.equal(contains(t, 50.310, 29.245), false); // Kharg is west
});

test("gaza strip polygon is the strip, not Ashkelon or the Med", () => {
  const t = THEATERS.gaza;
  assert.equal(layerAt(t, 34.466, 31.501), "strip"); // Gaza City
  assert.equal(layerAt(t, 34.250, 31.287), "strip"); // Rafah
  assert.equal(layerAt(t, 34.571, 31.669), "israel"); // Ashkelon
  assert.equal(layerAt(t, 34.596, 31.525), "israel"); // Sderot
  assert.equal(layerAt(t, 34.655, 31.804), "israel"); // Ashdod
  assert.equal(layerAt(t, 34.791, 31.253), "israel"); // Be'er Sheva
  assert.equal(layerAt(t, 34.16, 31.48), "sea"); // US fleet water
  assert.equal(pointInPoly(t.polys.strip, 34.466, 31.501), true);
  assert.equal(pointInPoly(t.polys.strip, 34.571, 31.669), false);
  assert.ok(t.dome.length >= 4);
  assert.deepEqual(t.hud.labels, ["US", "ISR", "GZA"]);
});

test("weather plugin is off on the optimized core", () => {
  assert.equal(weather.enabled, false);
  assert.equal(weather.setLook("night"), false);
  assert.equal(weather.look, "brief");
  assert.equal(weather.setRain(true), false);
  assert.equal(weather.rain, false);
});
