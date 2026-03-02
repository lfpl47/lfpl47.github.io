export type Stack = Record<string, string[] | undefined>;

const CATEGORY_LABELS: Record<string, string> = {
  iac: "IaC",
  cicd: "CI/CD",
  db: "Databases",
};

export function formatStackCategory(key: string): string {
  return CATEGORY_LABELS[key] ?? key.charAt(0).toUpperCase() + key.slice(1);
}

export function flattenStack(stack?: Stack): string[] {
  if (!stack) return [];
  return Object.values(stack)
    .flatMap((items) => items ?? [])
    .filter((item) => typeof item === "string" && item.trim().length > 0);
}

export function stackEntries(stack?: Stack): Array<{ category: string; items: string[] }> {
  if (!stack) return [];

  return Object.entries(stack)
    .map(([category, items]) => ({
      category,
      items: (items ?? []).filter(Boolean),
    }))
    .filter((entry) => entry.items.length > 0);
}

