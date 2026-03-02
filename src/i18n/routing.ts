import { defaultLocale, type Locale } from "./locales";

export function getLocaleFromPathname(pathname: string): Locale {
  return pathname === "/es" || pathname.startsWith("/es/") ? "es" : defaultLocale;
}

export function stripLocalePrefix(pathname: string): string {
  if (pathname === "/es") return "/";
  if (pathname.startsWith("/es/")) return pathname.slice("/es".length);
  return pathname;
}

export function withLocale(pathname: string, locale: Locale): string {
  const stripped = stripLocalePrefix(pathname);
  if (locale === "es") return stripped === "/" ? "/es/" : `/es${stripped}`;
  return stripped;
}

export function otherLocale(locale: Locale): Locale {
  return locale === "en" ? "es" : "en";
}

