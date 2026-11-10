// Pure matching rule shared by Training (mode "any") and Projects (mode "all").
/**
 * @param {{ tags: string[], text: string }} item  tags = data-tags split on spaces; text = lower-case haystack
 * @param {{ selected: string[], query: string, mode: "any" | "all" }} state
 */
export function matches(item, { selected, query, mode }) {
  const q = query.trim().toLowerCase();
  const okText = !q || item.text.includes(q);
  const okTags =
    selected.length === 0 ||
    (mode === "any" ? selected.some((t) => item.tags.includes(t)) : selected.every((t) => item.tags.includes(t)));
  return okText && okTags; // OR (or AND) across tags, always AND with the search text
}
