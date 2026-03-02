import type { Locale } from "./locales";

export function slugPrefix(locale: Locale): string {
  return `${locale}/`;
}

export function isSlugForLocale(slug: string, locale: Locale): boolean {
  return slug.startsWith(slugPrefix(locale));
}

export function stripLocaleFromSlug(slug: string, locale: Locale): string {
  return isSlugForLocale(slug, locale) ? slug.slice(slugPrefix(locale).length) : slug;
}

