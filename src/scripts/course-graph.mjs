const SVG_NS = "http://www.w3.org/2000/svg";

/** Wires one course graph: the nodes float around their built position, and a pointed or selected node lights its neighbors and fills the card. */
export function initCourseGraph(root) {
  const stage = root.querySelector("[data-cg-stage]");
  const card = root.querySelector("[data-cg-card]");
  const part = (name) => card.querySelector(`[data-cg-${name}]`);
  const kicker = part("kicker"), badge = part("badge"), title = part("title"), hint = part("hint"), counter = part("count"), chips = part("chips"), list = part("list");
  const text = root.dataset;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)");
  const count = (n) => (n === 1 ? text.one : text.many.replace("{n}", String(n)));

  const views = [...root.querySelectorAll("[data-cg-svg]")].map((svg) => {
    const nodes = new Map([...svg.querySelectorAll(".cg-node")].map((el, i) => {
      const hub = el.classList.contains("cg-hub");
      // The golden angle spreads the phases, so neighbors never move together.
      return [el.dataset.id, { el, id: el.dataset.id, hub, x: +el.dataset.x, y: +el.dataset.y, cx: +el.dataset.x, cy: +el.dataset.y, p: i * 2.399963, w: 0.35 + (i % 7) * 0.05, amp: hub ? 3 : 6 }];
    }));
    const links = [...svg.querySelectorAll(".cg-links line")].map((el) => ({ el, a: nodes.get(el.dataset.a), b: nodes.get(el.dataset.b) }));
    for (const n of nodes.values()) {
      if (!n.hub) continue;
      n.el.setAttribute("role", "button");
      n.el.setAttribute("tabindex", "0");
      n.el.setAttribute("aria-pressed", "false");
      n.el.setAttribute("aria-label", n.el.dataset.title);
    }
    return { svg, nodes, links };
  });
  if (!views.length) return;

  // Links are the same in every layout: a course joins its area and its topics.
  const pairs = views[0].links.map((l) => [l.a.id, l.b.id]);
  const info = (id) => views[0].nodes.get(id);
  const neighbors = (id) => pairs.flatMap(([a, b]) => (a === id ? [b] : b === id ? [a] : []));
  const make = (tag, props, ...children) => {
    const el = Object.assign(document.createElement(tag), props);
    el.append(...children);
    return el;
  };
  const pdf = (href, label) =>
    make("li", {}, make("a", { href, target: "_blank", rel: "noreferrer" }, make("span", { textContent: label }), make("span", { className: "cg__go", ariaHidden: "true", textContent: "↗" })));

  let active = null;
  const activate = (id) => {
    if (id === active) return;
    active = id;
    const near = new Set(neighbors(id));
    for (const v of views) {
      v.svg.classList.add("is-active");
      for (const n of v.nodes.values()) {
        n.el.classList.toggle("on", n.id === id || near.has(n.id));
        if (n.hub) n.el.setAttribute("aria-pressed", String(n.id === id));
      }
      for (const l of v.links) l.el.classList.toggle("on", l.a.id === id || l.b.id === id);
    }

    // The card: a hub shows its mark and lists its courses; a course names its area and topics and links its PDF.
    const { el, hub } = info(id);
    const around = [...near].map((n) => info(n).el);
    card.dataset.area = el.dataset.area;
    kicker.textContent = !hub ? text.kCourse : el.classList.contains("cg-hub--area") ? text.kArea : text.kTopic;
    title.textContent = el.dataset.title;
    kicker.hidden = false;
    hint.hidden = true;
    badge.hidden = counter.hidden = !hub;
    chips.hidden = hub;
    badge.replaceChildren();
    if (hub) {
      const body = el.querySelector(".cg-body").cloneNode(true);
      body.querySelector(".cg-halo").remove();
      const r = +body.querySelector(".cg-plate").getAttribute("r") + 3;
      const svg = document.createElementNS(SVG_NS, "svg");
      svg.setAttribute("viewBox", `${-r} ${-r} ${2 * r} ${2 * r}`);
      svg.dataset.area = el.dataset.area;
      svg.append(body);
      badge.append(svg);
      const n = String(around.length);
      counter.replaceChildren(make("b", { textContent: n }), count(around.length).replace(n, "").trim());
      list.replaceChildren(...around.sort((a, b) => a.dataset.title.localeCompare(b.dataset.title)).map((c) => pdf(c.getAttribute("href"), c.dataset.title)));
    } else {
      chips.replaceChildren(...around.map((h) => {
        const chip = make("button", { type: "button", className: "cg__chip", textContent: h.dataset.title });
        chip.dataset.go = h.dataset.id;
        chip.dataset.area = h.dataset.area;
        return chip;
      }));
      list.replaceChildren(pdf(el.getAttribute("href"), text.open));
    }
    // Restart the entrance of the card's content.
    card.classList.remove("is-in");
    void card.offsetWidth;
    card.classList.add("is-in");
  };

  // The last node pointed at stays chosen, so the pointer can go to the card and open a course.
  const pick = (e) => {
    const el = e.target.closest?.(".cg-node");
    if (el) activate(el.dataset.id);
  };
  root.addEventListener("pointerover", pick);
  root.addEventListener("focusin", pick);
  root.addEventListener("click", (e) => {
    const go = e.target.closest?.("[data-go]");
    if (!go) return pick(e);
    // A chip of a course goes to that area or topic. The chip is gone after it, so focus moves to the node.
    const id = go.dataset.go;
    activate(id);
    views.find((v) => v.svg.clientWidth)?.nodes.get(id).el.focus();
  });
  root.addEventListener("keydown", (e) => {
    if ((e.key === "Enter" || e.key === " ") && e.target.closest?.(".cg-hub")) { e.preventDefault(); pick(e); }
  });

  // Floating: each node circles its built position. It rests while the pointer is over the graph (small targets), off
  // screen, in a hidden tab, with reduced motion and while the header's background pause is on.
  let seen = false, over = false, raf = 0, t = 0, last = 0;
  const frame = (now) => {
    raf = requestAnimationFrame(frame);
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    if (over || window.siteBg?.paused) return;
    t += dt;
    for (const v of views) {
      if (!v.svg.clientWidth) continue; // the layout the container query hides
      for (const n of v.nodes.values()) {
        n.cx = n.x + n.amp * Math.sin(t * n.w + n.p);
        n.cy = n.y + n.amp * Math.cos(t * n.w * 0.8 + n.p * 1.7);
        n.el.setAttribute("transform", `translate(${n.cx.toFixed(1)} ${n.cy.toFixed(1)})`);
      }
      for (const l of v.links) {
        l.el.setAttribute("x1", l.a.cx.toFixed(1));
        l.el.setAttribute("y1", l.a.cy.toFixed(1));
        l.el.setAttribute("x2", l.b.cx.toFixed(1));
        l.el.setAttribute("y2", l.b.cy.toFixed(1));
      }
    }
  };
  const sync = () => {
    const run = seen && !reduce.matches && !document.hidden;
    if (run && !raf) { last = performance.now(); raf = requestAnimationFrame(frame); }
    else if (!run && raf) { cancelAnimationFrame(raf); raf = 0; }
  };
  stage.addEventListener("pointerenter", () => { over = true; });
  stage.addEventListener("pointerleave", () => { over = false; });
  if ("IntersectionObserver" in window) new IntersectionObserver((entries) => { seen = entries.at(-1).isIntersecting; sync(); }).observe(stage);
  else seen = true;
  reduce.addEventListener("change", sync);
  document.addEventListener("visibilitychange", sync);
  sync();
}
