import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { buildGraph, layout, radius } from "../src/lib/course-graph.mjs";

const data = JSON.parse(readFileSync(new URL("../src/data/certifications.json", import.meta.url), "utf8"));
const g = buildGraph(data.items, data.folders, "en", (k) => k);
const byKind = (kind) => g.nodes.filter((n) => n.kind === kind);

test("every course is a node linked to its area, and a topic without a logo has two courses or more", () => {
  assert.equal(byKind("course").length, data.items.length);
  assert.equal(byKind("area").length, data.folders.length);
  for (const c of byKind("course")) assert.ok(g.links.some((l) => l.a === c.id && l.b === c.area), c.title);
  for (const t of byKind("topic")) assert.ok(t.count >= (t.logo ? 1 : 2) && g.links.filter((l) => l.b === t.id).length === t.count, t.id);
  assert.equal(byKind("area").reduce((n, a) => n + a.count, 0), data.items.length);
});

test("the layout is the same on every build, stays inside the frame and keeps the hubs apart", () => {
  for (const [W, H] of [[880, 560], [340, 760]]) {
    const pos = layout(g, W, H);
    assert.deepEqual(layout(g, W, H), pos);
    for (const n of g.nodes) {
      const [x, y] = pos[n.id], r = radius(n);
      assert.ok(x >= r && x <= W - r && y >= r && y <= H - r, `${n.id} is outside ${W}x${H}`);
    }
    const hubs = g.nodes.filter((n) => n.kind !== "course");
    for (const a of hubs) for (const b of hubs) {
      if (a === b) continue;
      const gap = Math.hypot(pos[a.id][0] - pos[b.id][0], pos[a.id][1] - pos[b.id][1]) - radius(a) - radius(b);
      assert.ok(gap > 4, `${a.id} and ${b.id} overlap at ${W}x${H}`);
    }
  }
});

test("every course has an English title, without a colon", () => {
  const en = JSON.parse(readFileSync(new URL("../src/data/certification-titles.en.json", import.meta.url), "utf8"));
  const missing = data.items.filter((i) => !en[i.title]).map((i) => i.title);
  assert.deepEqual(missing, [], "add these titles to src/data/certification-titles.en.json");
  for (const title of Object.values(en)) assert.doesNotMatch(title, /:/, title);
});
