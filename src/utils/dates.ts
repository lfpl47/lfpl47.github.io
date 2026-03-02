const monthYearFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  year: "numeric",
});

export function formatMonthYear(date: Date): string {
  return monthYearFormatter.format(date);
}

export function formatDateRange(start: Date, end?: Date): string {
  const startLabel = formatMonthYear(start);
  const endLabel = end ? formatMonthYear(end) : "Present";
  return `${startLabel} — ${endLabel}`;
}

