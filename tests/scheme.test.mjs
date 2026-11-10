import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const css = readFileSync(new URL("../src/styles/global.css", import.meta.url), "utf8").replace(/\/\*[\s\S]*?\*\//g, "");

// The declarations of the one block the pattern matches, as { property: value }.
function declarations(pattern) {
  const found = [...css.matchAll(pattern)];
  assert.equal(found.length, 1, `expected one block for ${pattern}`);
  return Object.fromEntries(
    found[0][1]
      .split(";")
      .map((d) => d.trim())
      .filter(Boolean)
      .map((d) => [d.slice(0, d.indexOf(":")).trim(), d.slice(d.indexOf(":") + 1).trim()]),
  );
}

// Both blocks sit in screen-only media queries, so print keeps the light tokens.
test("night by system setting and night by choice declare the same tokens", () => {
  const system = declarations(/@media screen and \(prefers-color-scheme: dark\)\s*\{\s*:root:not\(\[data-theme="light"\]\)\s*\{([^}]*)\}/g);
  const chosen = declarations(/@media screen\s*\{\s*:root\[data-theme="dark"\]\s*\{([^}]*)\}/g);
  assert.ok(Object.keys(system).length >= 13, "the night block lost its tokens");
  assert.equal(system["color-scheme"], "dark");
  assert.deepEqual(chosen, system);
});
