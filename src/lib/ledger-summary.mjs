// The collapsed groups of the Home ledger (C8). Pure, no Astro imports, so node --test can load it.

/**
 * One summary row from the rows of a group (newest first): the span, the names without repeats, and one bar
 * from the first start to the last end. An open row (no end) makes the span open.
 * @param {Array<{ name: string, start: Date, end?: Date, a: number, b: number }>} rows
 */
export function groupSummary(rows) {
  if (!rows.length) throw new Error("ledger: a group needs at least one row");
  const open = rows.some((r) => !r.end);
  return {
    start: new Date(Math.min(...rows.map((r) => r.start.getTime()))),
    end: open ? undefined : new Date(Math.max(...rows.map((r) => r.end.getTime()))),
    names: [...new Set(rows.map((r) => r.name))],
    a: Math.min(...rows.map((r) => r.a)),
    b: Math.max(...rows.map((r) => r.b)),
  };
}

/** Several stacks as one, category by category, in row order. */
export function mergeStacks(stacks) {
  const out = {};
  for (const stack of stacks) {
    for (const [key, items] of Object.entries(stack ?? {})) out[key] = [...(out[key] ?? []), ...(items ?? [])];
  }
  return out;
}

/** The items of `ordered` that one of `shownLists` lists (compared without case), kept in the order of `ordered`. */
export function keepShown(ordered, shownLists) {
  const shown = new Set(shownLists.flat().map((s) => s.trim().toLowerCase()));
  return ordered.filter((s) => shown.has(s.trim().toLowerCase()));
}
