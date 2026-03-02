export function toTagId(label: string): string {
  const normalized = label
    .trim()
    .toLowerCase()
    .replaceAll("&", " and ")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "");

  return normalized
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/--+/g, "-");
}

