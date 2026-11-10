import type { Locale } from "../i18n/locales";
import { t, type UiKey } from "../i18n/ui";

export type Stack = Record<string, string[] | undefined>;

export const STACK_ORDER = [
  "cloud",
  "iac",
  "languages",
  "db",
  "streaming",
  "observability",
  "orchestration",
  "cicd",
  "data",
  "misc",
] as const;
export type StackCategory = (typeof STACK_ORDER)[number];

/** Items per category in STACK_ORDER, deduplicated case-insensitively; the first spelling wins. */
function dedupedGroups(stack?: Stack): { key: StackCategory; items: string[] }[] {
  const seen = new Set<string>();
  return STACK_ORDER.map((key) => {
    const items: string[] = [];
    for (const raw of stack?.[key] ?? []) {
      const item = raw.trim();
      const id = item.toLowerCase();
      if (!item || seen.has(id)) continue;
      seen.add(id);
      items.push(item);
    }
    return { key, items };
  });
}

/** The stack as one list in category order, deduplicated: «GCP, Terraform, ETL/ELT, Data Lakes, …». */
export function orderedStack(stack?: Stack): string[] {
  return dedupedGroups(stack).flatMap((group) => group.items);
}

/** The same items grouped by category with localized labels; empty categories are omitted. */
export function stackGroups(
  stack: Stack | undefined,
  locale: Locale,
): { key: StackCategory; label: string; items: string[] }[] {
  return dedupedGroups(stack)
    .filter((group) => group.items.length > 0)
    .map((group) => ({ ...group, label: t(locale, `cat_${group.key}` as UiKey) }));
}
