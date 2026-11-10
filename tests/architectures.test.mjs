import test from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { CLOUDS, FAMILIES, PATTERNS, TEXT, describe, scene, svgMarkup, trips } from "../src/lib/architectures.mjs";

const publicFile = (path) => new URL(`../public${path}`, import.meta.url);
const patterns = Object.values(FAMILIES).flat();
const every = [];
for (const locale of Object.keys(TEXT))
  for (const cloud of Object.keys(CLOUDS))
    for (const pattern of patterns)
      for (const layout of ["wide", "narrow"]) every.push({ locale, cloud, pattern, layout });
const name = (c) => `${c.pattern} on ${c.cloud}, ${c.layout}, ${c.locale}`;

const overlap = (a, b, m = 1) => a.x + m < b.x + b.w && b.x + m < a.x + a.w && a.y + m < b.y + b.h && b.y + m < a.y + a.h;
// Plate and tile of a node (labels excluded).
const body = (nd) => {
  const top = nd.tile ? nd.y - nd.tile - 2 : nd.y - nd.lift - nd.hh;
  return { x: nd.x - nd.hw, y: top, w: 2 * nd.hw, h: nd.y + nd.hh + nd.t - top };
};
// Does the segment p-q cross the rectangle r (shrunk by 1 unit)?
function crosses([p, q], r) {
  const box = { x: r.x + 1, y: r.y + 1, w: r.w - 2, h: r.h - 2 };
  for (let k = 0; k <= 40; k++) {
    const x = p[0] + ((q[0] - p[0]) * k) / 40;
    const y = p[1] + ((q[1] - p[1]) * k) / 40;
    if (x > box.x && x < box.x + box.w && y > box.y && y < box.y + box.h) return true;
  }
  return false;
}

test("every pattern resolves on every cloud, in both languages and layouts", () => {
  assert.equal(patterns.length, 12);
  for (const c of every) {
    const sc = scene(c, c.locale, c.layout);
    for (const nd of sc.nodes) {
      assert.ok(nd.name && !nd.name.includes("undefined"), `${name(c)}: node ${nd.id} has no name`);
      assert.ok(nd.zone || nd.icon || nd.glyph, `${name(c)}: node ${nd.id} has nothing to draw`);
      if (PATTERNS[c.pattern].nodes.find((n) => n.id === nd.id).r) assert.ok(nd.role, `${name(c)}: node ${nd.id} has no role`);
    }
    const text = describe(c, c.locale);
    for (const s of [text.label, text.summary, text.desc, text.title]) assert.doesNotMatch(s, /\{|\}|undefined/, `${name(c)}: ${s}`);
    const markup = svgMarkup(sc, { title: "t", desc: "d" }, text);
    assert.ok(markup.includes("<title id=\"t\">"));
    assert.doesNotMatch(markup, /NaN|undefined|Infinity/, `${name(c)}: broken markup`);
  }
});

test("every link joins two existing nodes and every flow has packets", () => {
  for (const [id, p] of Object.entries(PATTERNS)) {
    const ids = new Set(p.nodes.map((n) => n.id));
    for (const lk of p.links) {
      assert.ok(ids.has(lk.a) && ids.has(lk.b), `${id}: ${lk.a}-${lk.b}`);
      if (!lk.kind) assert.ok((lk.go ?? []).length > 0, `${id}: ${lk.a}-${lk.b} carries no packet`);
    }
    for (const layout of ["wide", "narrow"]) {
      const L = p[layout];
      for (const n of p.nodes) assert.ok(L.at[n.id], `${id} ${layout}: no position for ${n.id}`);
      for (const key of [...Object.keys(L.ports ?? {}), ...Object.keys(L.via ?? {})])
        assert.ok(p.links.some((lk) => `${lk.a}-${lk.b}` === key), `${id} ${layout}: ${key} is not a link`);
    }
    for (const g of p.groups ?? []) assert.ok(p.nodes.some((n) => n.in === g.id), `${id}: group ${g.id} is empty`);
  }
  for (const c of every) {
    const sc = scene(c, c.locale, c.layout);
    for (const lk of sc.links) for (const pt of lk.pts) assert.ok(pt.every(Number.isFinite), `${name(c)}: ${lk.key}`);
    assert.ok(trips(sc).length > 0);
  }
});

test("every link that carries packets is long enough to show them travel", () => {
  // A packet is a 9-unit dot; on a much shorter link it hops from plate to plate instead of moving along the line.
  for (const c of every) {
    const sc = scene(c, c.locale, c.layout);
    const moving = new Set(trips(sc).map((tr) => tr.key));
    for (const lk of sc.links.filter((l) => moving.has(l.key))) {
      const length = lk.pts.slice(1).reduce((s, [x, y], i) => s + Math.hypot(x - lk.pts[i][0], y - lk.pts[i][1]), 0);
      assert.ok(length >= 48, `${name(c)}: link ${lk.key} is ${Math.round(length)} units long`);
    }
  }
});

test("every node, label and link fits the viewBox", () => {
  for (const c of every) {
    const sc = scene(c, c.locale, c.layout);
    const [vx, vy, vw, vh] = sc.natural;
    const inside = (b, what) =>
      assert.ok(b.x >= vx && b.y >= vy && b.x + b.w <= vx + vw && b.y + b.h <= vy + vh, `${name(c)}: ${what} is outside the viewBox`);
    for (const nd of sc.nodes) inside(nd.box, `node ${nd.id}`);
    for (const g of sc.groups) inside(g, `group ${g.id}`);
    for (const lk of sc.links) for (const [x, y] of lk.pts) inside({ x, y, w: 0, h: 0 }, `link ${lk.key}`);
  }
});

test("labels never collide with other labels, plates or links", () => {
  for (const c of every) {
    const sc = scene(c, c.locale, c.layout);
    const labels = [
      ...sc.nodes.flatMap((nd) => nd.texts.filter((t) => t.cls !== "ax-zone").map((t) => ({ ...t.box, what: `${nd.id} «${t.s}»` }))),
      ...sc.groups.flatMap((g) => g.texts.map((t) => ({ ...t.box, what: `group «${t.s}»` }))),
    ];
    for (let i = 0; i < labels.length; i++)
      for (let j = i + 1; j < labels.length; j++)
        assert.ok(!overlap(labels[i], labels[j]), `${name(c)}: ${labels[i].what} touches ${labels[j].what}`);
    for (const l of labels)
      for (const nd of sc.nodes) assert.ok(!overlap(l, body(nd)), `${name(c)}: ${l.what} covers the plate of ${nd.id}`);
    for (const lk of sc.links)
      for (let k = 1; k < lk.pts.length; k++) {
        const seg = [lk.pts[k - 1], lk.pts[k]];
        for (const l of labels) assert.ok(!crosses(seg, l), `${name(c)}: link ${lk.key} crosses ${l.what}`);
        for (const nd of sc.nodes)
          if (nd.id !== lk.a && nd.id !== lk.b) assert.ok(!crosses(seg, body(nd)), `${name(c)}: link ${lk.key} crosses ${nd.id}`);
      }
  }
});

test("every icon file exists", () => {
  for (const [id, cloud] of Object.entries(CLOUDS)) {
    for (const [key, s] of Object.entries(cloud.services)) assert.ok(existsSync(publicFile(s.icon)), `${id} ${key}: ${s.icon}`);
  }
});
