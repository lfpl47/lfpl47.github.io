// Home ledger (C8): each group heading becomes a disclosure button, and a collapsed group shows its summary row.
// Without JavaScript nothing here runs: every group stays expanded and no control is shown.

const DURATION = 420; // ms; C8 allows up to 500
const EASE = "cubic-bezier(.4, 0, .2, 1)"; // ease-in-out: the bars start and end on screen, so they start gently

const moves = () =>
  matchMedia("(prefers-reduced-motion: no-preference)").matches &&
  typeof Element.prototype.animate === "function" &&
  CSS.supports("translate", "0 1px");

/** Wires one ledger: a button per group and the control that expands or collapses them all. */
export function initLedger(root) {
  const all = root.querySelector("[data-lg-all]");
  const groups = [...root.querySelectorAll("[data-lg-group]")].map((group) => {
    const label = group.querySelector("[data-lg-label]");
    const body = group.querySelector("[data-lg-body]");
    // The heading text moves into a button; copying the attributes keeps the component's scoped styles.
    const button = document.createElement("button");
    for (const { name, value } of label.attributes) button.setAttribute(name, value);
    button.removeAttribute("data-lg-label");
    button.type = "button";
    button.setAttribute("aria-expanded", "true");
    button.setAttribute("aria-controls", body.id);
    button.append(...label.childNodes);
    label.replaceWith(button);
    const g = { button, body, sum: body.querySelector("[data-lg-sum]"), rows: body.querySelector("[data-lg-rows]"), open: true, anims: [] };
    button.addEventListener("click", () => {
      set(g, !g.open);
      sync();
    });
    // The summary row lights up like the role rows, so a click or tap on it opens the group; the heading button
    // stays the control for keyboards and screen readers.
    g.sum.addEventListener("click", () => {
      if (!getSelection()?.isCollapsed) return; // selecting the names does not open the group
      set(g, true);
      sync();
    });
    return g;
  });
  const sync = () => {
    all.textContent = groups.every((g) => g.open) ? all.dataset.collapse : all.dataset.expand;
  };
  all.addEventListener("click", () => {
    const open = !groups.every((g) => g.open);
    for (const g of groups) set(g, open);
    sync();
  });
}

/** The resting state. On screen, .lg-closed shows the summary row instead of the role rows; print shows the rows. */
function settle(g) {
  g.body.classList.toggle("lg-closed", !g.open);
  g.body.classList.remove("lg-moving");
  g.sum.inert = g.rows.inert = false;
  g.anims = [];
}

/** Opens or closes a group. With motion, the role bars merge into the group bar (or split out of it) as the rows fold. */
function set(g, open) {
  if (g.open === open) return;
  g.open = open;
  g.button.setAttribute("aria-expanded", String(open));
  // What leaves stays on screen until the move ends, but takes no focus or clicks.
  g.rows.inert = !open;
  g.sum.inert = open;
  // A toggle during a move turns it back from where it is (bars, fades and height); its end settles the new state.
  if (g.anims.length) return g.anims.forEach((a) => a.reverse());
  if (!moves()) return settle(g);

  const { body, sum, rows } = g;
  const from = body.getBoundingClientRect().height;
  // During the move both states are on screen; .lg-moving lays the summary row over the first role rows.
  body.classList.add("lg-moving");
  const to = (open ? rows : sum).getBoundingClientRect().height;
  const mid = (el) => {
    const r = el.getBoundingClientRect();
    return r.top + r.height / 2;
  };
  const sumBar = sum.querySelector(".tl-bar");
  const bars = [...rows.querySelectorAll(".tl-bar")];
  const line = mid(sumBar);
  const timing = { duration: DURATION, easing: EASE };
  const linear = { duration: DURATION, easing: "linear" };
  // Opacity from 0 to 1 (or 1 to 0) between two points of the move, on clock time.
  const fade = (el, show, a, b) => el.animate({ opacity: show ? [0, 0, 1, 1] : [1, 1, 0, 0], offset: [0, a, b, 1] }, linear);
  // Below 960 px the track sits under the text, so its gridlines and today line would cross the other state's text.
  const stacked = getComputedStyle(sum).gridTemplateColumns.split(" ").length === 1;
  const rule = getComputedStyle(sum).borderBottomColor;
  const clear = "transparent";
  // A row that leaves or arrives. Its text is gone by 30 % of the move or starts at 40 %, so on phones the bars cross
  // only faded text. Its rule (and its stacked track lines) swap with the other state's between 30 and 40 %, when no text shows.
  const swap = (row, show) => [
    ...[...row.children].filter((el) => !el.classList.contains("tl-track")).map((el) => (show ? fade(el, true, 0.4, 1) : fade(el, false, 0, 0.3))),
    ...(stacked ? [...row.querySelectorAll(".tl-gl, .tl-today")] : []).map((el) => fade(el, show, 0.3, 0.4)),
    row.animate({ borderBottomColor: show ? [clear, clear, rule, rule] : [rule, rule, clear, clear], offset: [0, 0.3, 0.4, 1] }, linear),
  ];

  g.anims = [
    body.animate({ height: [`${from}px`, `${to}px`] }, timing),
    ...bars.map((bar) => {
      const shift = `0 ${line - mid(bar)}px`;
      return bar.animate({ translate: open ? [shift, "0 0"] : ["0 0", shift] }, timing);
    }),
    ...[...rows.children].flatMap((row) => swap(row, open)),
    ...swap(sum, !open),
    // The role bars and the group bar cross-fade on the summary line, late in a merge and early in a split,
    // so a merge ends on the group bar alone and a split starts from it (the hatched bars never snap).
    ...bars.map((bar) => (open ? fade(bar, true, 0, 0.4) : fade(bar, false, 0.6, 1))),
    open ? fade(sumBar, false, 0, 0.4) : fade(sumBar, true, 0.6, 1),
  ];
  // Nothing cancels these animations; if the browser ever does, the group still comes to rest.
  Promise.all(g.anims.map((a) => a.finished)).then(
    () => settle(g),
    () => settle(g),
  );
}
