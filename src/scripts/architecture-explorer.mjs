import { DEFAULT, describe, pathOf, scene, svgMarkup, trips } from "../lib/architectures.mjs";

const EASE = "cubic-bezier(.2, .7, .2, 1)";
// One step of the flow is one packet crossing one link; requests and responses are quicker than data loads.
const STEP = { data: 760, software: 560 };
const SVG_NS = "http://www.w3.org/2000/svg";

/** Wires one explorer: the three toggle groups, both SVG layouts, the live description and the replay. */
export function initArchitectureExplorer(root) {
  const locale = root.dataset.locale;
  const svgs = [...root.querySelectorAll("[data-ax-svg]")];
  const stage = root.querySelector("[data-ax-stage]");
  const name = root.querySelector("[data-ax-name]");
  const summary = root.querySelector("[data-ax-summary]");
  const desc = root.querySelector("[data-ax-desc]");
  const replay = root.querySelector("[data-ax-replay]");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)");
  const state = { ...DEFAULT };
  const last = { data: DEFAULT.pattern, software: "rest" };
  const scenes = new Map();
  const buttons = [...root.querySelectorAll("[data-ax-family], [data-ax-cloud], [data-ax-pattern]")].map((el) => {
    const field = "axFamily" in el.dataset ? "family" : "axCloud" in el.dataset ? "cloud" : "pattern";
    return { el, field, value: el.dataset[{ family: "axFamily", cloud: "axCloud", pattern: "axPattern" }[field]] };
  });
  let running = [];

  const stop = () => {
    for (const a of running) a.cancel();
    running = [];
    for (const g of root.querySelectorAll(".ax-packets")) g.replaceChildren();
  };

  const draw = (render) => {
    stop();
    const text = describe(state, locale);
    for (const svg of svgs) {
      const layout = svg.dataset.axSvg;
      const sc = scene(state, locale, layout);
      scenes.set(svg, sc);
      svg.setAttribute("viewBox", sc.natural.join(" "));
      if (!render) continue;
      svg.innerHTML = svgMarkup(sc, { title: `ax-${layout}-title`, desc: `ax-${layout}-desc` }, text);
    }
    if (!render) return;
    name.textContent = text.label;
    summary.textContent = text.summary;
    desc.textContent = text.desc;
    for (const b of buttons) b.el.setAttribute("aria-pressed", String(state[b.field] === b.value));
    for (const g of root.querySelectorAll("[data-ax-patterns]")) g.hidden = g.dataset.axPatterns !== state.family;
  };

  const animate = (el, frames, options) => {
    const a = el.animate(frames, { easing: EASE, fill: "backwards", ...options });
    running.push(a);
    return a;
  };

  // Plates settle, then packets cross the links step by step; a node pulses when a packet reaches it.
  const play = () => {
    stop();
    if (reduce.matches) return;
    const D = STEP[state.family];
    for (const svg of svgs) {
      if (!svg.getBoundingClientRect().width) continue; // the layout the container query hides
      const nodes = new Map([...svg.querySelectorAll(".ax-node")].map((el) => [el.dataset.node, el]));
      [...nodes.values()].forEach((el, i) =>
        animate(el, [{ opacity: 0, transform: "translateY(-10px)" }, { opacity: 1, transform: "none" }], { duration: 420, delay: i * 60 }),
      );
      for (const el of svg.querySelectorAll(".ax-link, .ax-group")) animate(el, [{ opacity: 0 }, { opacity: 1 }], { duration: 360, delay: 160 });
      const t0 = 420 + nodes.size * 60;
      const pulse = (id, at) => {
        const el = nodes.get(id);
        const lift = [{ transform: "none" }, { transform: "translateY(-5px)", offset: 0.4 }, { transform: "none" }];
        animate(el.querySelector(".ax-body"), lift, { duration: 480, delay: at, fill: "none" });
        animate(el.querySelector(".ax-hit"), [{ opacity: 0 }, { opacity: 0.3, offset: 0.3 }, { opacity: 0 }], { duration: 640, delay: at, fill: "none" });
      };
      const layer = svg.querySelector(".ax-packets");
      const list = trips(scenes.get(svg));
      for (const id of new Set(list.filter((tr) => tr.step === 0).map((tr) => tr.from))) pulse(id, t0 - 140);
      for (const tr of list) {
        const d = pathOf(tr.pts);
        const dur = D - 80;
        for (let k = 0; k < tr.burst; k++) {
          const start = t0 + tr.step * D + k * 150;
          // A response is a ring: the accent dot with a paper dot inside.
          for (const cls of tr.back ? ["ax-pk", "ax-pk ax-pk--hole"] : ["ax-pk"]) {
            const pk = document.createElementNS(SVG_NS, "path");
            pk.setAttribute("class", cls);
            pk.setAttribute("d", d);
            pk.setAttribute("pathLength", "100");
            layer.append(pk);
            const frames = [
              { strokeDashoffset: "0", opacity: 0 },
              { strokeDashoffset: "-6", opacity: 1, offset: 0.08 },
              { strokeDashoffset: "-94", opacity: 1, offset: 0.92 },
              { strokeDashoffset: "-100", opacity: 0 },
            ];
            animate(pk, frames, { duration: dur, delay: start, easing: "linear", fill: "none" }).finished.then(() => pk.remove(), () => {});
          }
        }
        pulse(tr.to, t0 + tr.step * D + (tr.burst - 1) * 150 + dur - 40);
      }
    }
  };

  // Each scheme plays once where it can be seen. The first one, and one chosen while the stage is wholly out of view
  // (phones: the controls sit above it), waits with its plates hidden, screen only, until a third of the stage is in
  // view; one chosen while any part of the stage shows plays at once, so the drawing never vanishes from view.
  let visible = false;
  const go = () => {
    delete root.dataset.play;
    play();
  };
  const io = "IntersectionObserver" in window
    ? new IntersectionObserver((entries) => {
        const e = entries.at(-1);
        visible = e.isIntersecting;
        if (root.dataset.play && e.intersectionRatio >= 0.3) go();
      }, { threshold: [0, 0.3] })
    : null;
  io?.observe(stage);
  const owe = () => {
    if (reduce.matches) return;
    if (visible || !io) go();
    else root.dataset.play = "pending"; // at load `visible` is still false, so the first scheme always waits
  };

  const select = (field, value) => {
    if (state[field] === value) return;
    if (field === "family") state.pattern = last[value];
    if (field === "pattern") last[state.family] = value;
    state[field] = value;
    draw(true);
    owe();
  };
  for (const b of buttons) b.el.addEventListener("click", () => select(b.field, b.value));
  replay.addEventListener("click", go);
  // Reduced motion turned on mid-visit: stop and show the scheme at once (CSS hides the replay).
  reduce.addEventListener("change", () => reduce.matches && go());
  draw(false); // the build drew the default scheme; this reads its geometry
  owe();
}
