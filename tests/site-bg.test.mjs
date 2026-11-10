import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";

// public/site-bg.js (the background city, C3) runs here against a fake page and canvas, with the real tokens.
const src = readFileSync(new URL("../public/site-bg.js", import.meta.url), "utf8");
const css = readFileSync(new URL("../src/styles/global.css", import.meta.url), "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
const props = (re) => Object.fromEntries([...css.match(re)[1].matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)].map((m) => [m[1], m[2].trim()]));
const day = props(/@layer tokens\s*\{\s*:root\s*\{([^}]*)\}/);
const night = { ...day, ...props(/:root\[data-theme="dark"\]\s*\{([^}]*)\}/) };

// Opaque colors serialize as #rrggbb, as a canvas does; anything else as a non-hex string.
function hex(v) {
  const h = /^#([0-9a-f]{3,8})$/i.exec(v)?.[1];
  if (h) {
    const full = h.length <= 4 ? [...h].map((c) => c + c).join("") : h;
    return full.length === 8 && !/ff$/i.test(full) ? "rgba(0, 0, 0, 0)" : `#${full.slice(0, 6).toLowerCase()}`;
  }
  const m = /^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/.exec(v);
  return m ? `#${m.slice(1).map((n) => Number(n).toString(16).padStart(2, "0")).join("")}` : null;
}
const lum = (h) => [1, 3, 5].reduce((y, i, k) => {
  const v = parseInt(h.slice(i, i + 2), 16) / 255;
  return y + [0.2126, 0.7152, 0.0722][k] * (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
}, 0);
const ratio = (a, b) => (Math.max(lum(a), lum(b)) + 0.05) / (Math.min(lum(a), lum(b)) + 0.05);

function run(tokens, { reduce = false, coarse = false, stored = null } = {}) {
  const drawn = new Set(), frames = [];
  const page = { raf: null };
  // Colors the drawing code sets (rgb() mixes and white); the token reads go through the same setter and are skipped.
  const ctx = (main) => {
    let fill = "#000000";
    const t = {
      get fillStyle() { return fill; },
      set fillStyle(v) { const h = hex(v); if (h) fill = h; if (/^rgb\(|^#fff$/.test(v)) drawn.add(hex(v)); },
      set strokeStyle(v) { if (/^rgb\(|^#fff$/.test(v)) drawn.add(hex(v)); },
      clearRect() { if (main) frames.push(1); },
    };
    return new Proxy(t, { get: (o, k) => (k in o ? o[k] : () => {}), set: (o, k, v) => { if (k in o) o[k] = v; return true; } });
  };
  const main = ctx(true);
  const canvas = { hidden: false, getContext: () => main, get clientWidth() { return this.hidden ? 0 : 1440; }, get clientHeight() { return this.hidden ? 0 : 900; } };
  const g = {
    document: { documentElement: {}, hidden: false, getElementById: () => canvas, createElement: () => ({ getContext: () => ctx(false) }), addEventListener() {} },
    matchMedia: (q) => ({ matches: (reduce && q.includes("reduced-motion")) || (coarse && q.includes("coarse")), addEventListener() {} }),
    getComputedStyle: () => ({ getPropertyValue: (n) => tokens[n] ?? "" }),
    localStorage: { getItem: () => stored },
    requestAnimationFrame: (f) => { page.raf = f; return 1; },
    cancelAnimationFrame: () => { page.raf = null; },
    addEventListener() {},
    setTimeout,
    clearTimeout,
    MutationObserver: class { observe() {} },
  };
  g.window = g;
  vm.runInNewContext(src, g);
  return { g, canvas, page, drawn, frames };
}

for (const [name, tokens] of [["day", day], ["night", night]]) {
  test(`${name}: every color of the city keeps the text and bar contrast`, () => {
    const { drawn } = run(tokens);
    assert.ok(drawn.size > 20, "the city drew too few colors; did the script run?");
    const worst = (token) => Math.min(...[...drawn].map((c) => ratio(c, hex(tokens[token]))));
    // C3: text 4.5:1 at least, body text and links 7:1; metadata (--ink-3) keeps 86 % of its ratio on bare paper.
    assert.ok(worst("--ink-3") >= (name === "day" ? 5.0 : 6.5), `--ink-3 ${worst("--ink-3")}`);
    assert.ok(worst("--ink-2") >= 7, `--ink-2 ${worst("--ink-2")}`);
    assert.ok(worst("--accent") >= 7, `--accent ${worst("--accent")}`);
    // WCAG 1.4.11: the palest phase bars (back office) keep 3:1 over the city.
    assert.ok(worst("--ph-bo") >= 3, `--ph-bo ${worst("--ph-bo")}`);
  });
}

test("a token that is not opaque sRGB hides the canvas, and the pause API still exists", () => {
  const { g, canvas, page } = run({ ...day, "--ink": "oklch(50% 0 0)" });
  assert.equal(canvas.hidden, true);
  assert.equal(page.raf, null);
  assert.equal(typeof g.siteBg.pause, "function");
});

test("pause stops the loop, play starts it, and nothing runs under reduced motion or a stored pause", () => {
  const { g, page, frames } = run(day);
  assert.ok(frames.length === 1 && page.raf, "first frame drawn and the loop running");
  g.siteBg.pause();
  assert.equal(page.raf, null);
  assert.equal(g.siteBg.paused, true);
  g.siteBg.play();
  assert.ok(page.raf);
  for (const opts of [{ reduce: true }, { stored: "paused" }]) {
    const still = run(day, opts);
    assert.equal(still.frames.length, 1, "one static frame");
    assert.equal(still.page.raf, null, "no loop");
  }
});

test("at most 30 frames per second (24 on touch screens) at any display rate", () => {
  for (const coarse of [false, true]) {
    for (const hz of [60, 120, 144]) {
      const { page, frames } = run(day, { coarse });
      frames.length = 0;
      for (let i = 1; i <= 2 * hz; i++) page.raf((i * 1000) / hz);
      const fps = frames.length / 2;
      assert.ok(fps <= (coarse ? 24 : 30) && fps >= 18, `${hz} Hz, coarse ${coarse}: ${fps} fps`);
    }
  }
});

test("the canvas has no view-transition-name and is hidden in forced colors, with more contrast and in print", () => {
  const block = css.match(/#site-bg\s*\{([^}]*)\}/)[1];
  assert.doesNotMatch(block, /view-transition-name/, "a named canvas paints over the text during the page cross-fade");
  assert.match(css, /@media \(forced-colors: active\), \(prefers-contrast: more\), print \{\s*#site-bg \{ display: none; \}/);
  const layout = readFileSync(new URL("../src/layouts/Layout.astro", import.meta.url), "utf8");
  assert.match(layout, /<body>\s*<canvas id="site-bg" aria-hidden="true"><\/canvas>/);
});

test("GitHub and LinkedIn leave the header bar only where the pause button shows", () => {
  // CSS cannot share a media list, so each condition that hides the pause needs its opposite in the profiles rule.
  const hide = css.match(/@media ([^{]+)\{\s*\.view button\[name="motion"\] \{ display: none; \}/)[1].split(",").map((q) => q.trim());
  const keep = css.match(/@media ([^{]+)\{\s*\.site-aux:has\(/)[1];
  const opposite = { "(prefers-reduced-motion: reduce)": "(prefers-reduced-motion: no-preference)", "(forced-colors: active)": "(forced-colors: none)", "(prefers-contrast: more)": "(not (prefers-contrast: more))", print: "screen and" };
  for (const q of hide) assert.ok(keep.includes(opposite[q] ?? "?"), `the pause is hidden with ${q}; the profiles rule needs ${opposite[q] ?? "its opposite"}`);
});
