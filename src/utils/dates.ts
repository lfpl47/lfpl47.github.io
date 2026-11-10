import type { Locale } from "../i18n/locales";
import { t } from "../i18n/ui";

// All getters are UTC: content dates parse as UTC midnight, so a local time zone can shift the month.
const NBSP = " ";
// Intl gives «dic 2024» (es-ES) or «dic de 2024» (es-CO); the site uses this fixed table.
const ES_SHORT = ["ene.", "feb.", "mar.", "abr.", "may.", "jun.", "jul.", "ago.", "sept.", "oct.", "nov.", "dic."];
const ES_LONG = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
const EN = {
  short: new Intl.DateTimeFormat("en-US", { month: "short", year: "numeric", timeZone: "UTC" }),
  long: new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric", timeZone: "UTC" }),
};

/** «Dec 2024» / «dic. 2024»; long: «December 2024» / «diciembre de 2024». Words joined by no-break spaces. */
export function formatMonthYear(date: Date, locale: Locale = "en", style: "short" | "long" = "short"): string {
  if (locale === "es") {
    const month = date.getUTCMonth();
    const year = date.getUTCFullYear();
    return style === "long" ? `${ES_LONG[month]}${NBSP}de${NBSP}${year}` : `${ES_SHORT[month]}${NBSP}${year}`;
  }
  return EN[style].format(date).replace(/\s/g, NBSP);
}

/** «2024-12», for <time datetime>. */
export function toIsoMonth(date: Date): string {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

/** «Dec 2024 – present»; one month when start and end share it. */
export function formatDateRange(start: Date, end: Date | undefined, locale: Locale = "en"): string {
  const from = formatMonthYear(start, locale);
  if (end && toIsoMonth(end) === toIsoMonth(start)) return from;
  return `${from}${NBSP}– ${end ? formatMonthYear(end, locale) : t(locale, "present")}`;
}

/** «2018–2021», «2024» when equal, «2022 – present» when open. */
export function formatYearRange(startYear: number, endYear: number | undefined, locale: Locale = "en"): string {
  if (endYear === undefined) return `${startYear}${NBSP}– ${t(locale, "present")}`;
  return startYear === endYear ? String(startYear) : `${startYear}–${endYear}`;
}
