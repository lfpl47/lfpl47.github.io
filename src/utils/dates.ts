import type { Locale } from "../i18n/locales";

const monthYearFormatters: Record<Locale, Intl.DateTimeFormat> = {
  en: new Intl.DateTimeFormat("en-US", { month: "short", year: "numeric" }),
  es: new Intl.DateTimeFormat("es-ES", { month: "short", year: "numeric" }),
};

export function formatMonthYear(date: Date, locale: Locale = "en"): string {
  return monthYearFormatters[locale].format(date);
}

export function formatDateRange(start: Date, end: Date | undefined, locale: Locale = "en"): string {
  const startLabel = formatMonthYear(start, locale);
  const endLabel = end ? formatMonthYear(end, locale) : locale === "es" ? "Actual" : "Present";
  return `${startLabel} — ${endLabel}`;
}
