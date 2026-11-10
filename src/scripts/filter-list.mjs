import { matches } from "./filter-match.mjs";

/** Wires one FilterList root: toggles, search, counter, empty text and Clear. */
export function initFilterList(root) {
  const mode = root.dataset.mode === "all" ? "all" : "any";
  const search = root.querySelector("[data-filter-search]");
  const toggles = [...root.querySelectorAll("[data-filter-tag]")];
  const count = root.querySelector("[data-filter-count]");
  const empty = root.querySelector("[data-filter-empty]");
  const items = [...root.querySelectorAll("[data-filter-item]")].map((el) => ({
    el,
    tags: (el.dataset.tags ?? "").split(" ").filter(Boolean),
    text: el.dataset.text ?? "",
  }));

  const update = () => {
    const state = {
      mode,
      query: search?.value ?? "",
      selected: toggles.filter((b) => b.getAttribute("aria-pressed") === "true").map((b) => b.dataset.filterTag),
    };
    let shown = 0;
    for (const item of items) {
      const ok = matches(item, state);
      item.el.hidden = !ok;
      if (ok) shown++;
    }
    if (count) count.textContent = count.dataset.template.replace("{n}", String(shown));
    if (empty) empty.hidden = shown > 0;
  };

  for (const b of toggles) {
    b.addEventListener("click", () => {
      b.setAttribute("aria-pressed", String(b.getAttribute("aria-pressed") !== "true"));
      update();
    });
  }
  search?.addEventListener("input", update);
  root.querySelector("[data-filter-clear]")?.addEventListener("click", () => {
    for (const b of toggles) b.setAttribute("aria-pressed", "false");
    if (search) search.value = "";
    update();
  });
  // The browser can restore a typed query on back navigation.
  if (search?.value) update();
}
