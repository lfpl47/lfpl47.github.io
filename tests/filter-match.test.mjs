import test from "node:test";
import assert from "node:assert/strict";
import { matches } from "../src/scripts/filter-match.mjs";

const cloud = { tags: ["cloud"], text: "curso de terraform cloud" };
const prog = { tags: ["programming"], text: "curso de python programming" };
const prod = { tags: ["productivity"], text: "microsoft teams productivity" };

test("training: two categories combine with OR (D3: Cloud + Programming is not empty)", () => {
  const s = { selected: ["cloud", "programming"], query: "", mode: "any" };
  assert.deepEqual([cloud, prog, prod].map((i) => matches(i, s)), [true, true, false]);
});

test("search text always narrows (AND)", () => {
  const s = { selected: ["cloud", "programming"], query: "Terraform ", mode: "any" };
  assert.deepEqual([cloud, prog, prod].map((i) => matches(i, s)), [true, false, false]);
});

test("projects: tags combine with AND", () => {
  const p = { tags: ["aws", "python"], text: "x" };
  assert.equal(matches(p, { selected: ["aws", "python"], query: "", mode: "all" }), true);
  assert.equal(matches(p, { selected: ["aws", "gcp"], query: "", mode: "all" }), false);
});

test("nothing selected shows everything", () => {
  assert.equal(matches(prod, { selected: [], query: "", mode: "any" }), true);
});
