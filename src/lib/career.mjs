// Pure career math for the ledger and the overview. No Astro imports, so node --test can load it.
// All dates are UTC; content dates are "YYYY-MM-DD" strings parsed by z.coerce.date() as UTC midnight.

/** @typedef {"engineering" | "analysis" | "backoffice"} Phase */
export const PHASES = /** @type {const} */ (["engineering", "analysis", "backoffice"]);

/** Phase from the ENGLISH role title. shortcut: title rule; add a `phase` field to the schema if a future title breaks it. */
export function phaseOf(enRole) {
  const r = enRole.toLowerCase();
  if (r.includes("data engineer")) return "engineering"; // also matches "Data Engineering"
  if (r.includes("data analyst")) return "analysis";
  return "backoffice";
}

const round4 = (n) => Math.round(n * 1e4) / 1e4;

/**
 * @param {{ roles: Array<{slug:string, company:string, role:string, enRole:string, start:Date, end?:Date, employmentType?:string}>,
 *           education?: Array<{institution:string, area:string, startYear:number, endYear:number}>,
 *           asOf: Date }} input
 */
export function buildCareer({ roles, education = [], asOf }) {
  if (!roles.length) return { roles: [], education: [], phases: [], axis: null, asOf, firstStart: null, current: null };
  const firstYear = Math.min(
    ...roles.map((r) => r.start.getUTCFullYear()),
    ...education.map((e) => e.startYear),
  );
  const axisStart = Date.UTC(firstYear, 0, 1);
  const axisEnd = Date.UTC(asOf.getUTCFullYear() + 1, 0, 1); // Jan 1 after the build year
  const pos = (t) => round4((t - axisStart) / (axisEnd - axisStart));

  const newestFirst = [...roles].sort((a, b) => b.start - a.start);
  const chrono = [...newestFirst].reverse();
  const out = newestFirst.map((r) => ({
    ...r,
    phase: phaseOf(r.enRole),
    current: !r.end,
    a: pos(r.start.getTime()),
    b: pos((r.end ?? asOf).getTime()),
    i: chrono.indexOf(r), // chronological index: drives the draw-in stagger (oldest first)
  }));

  const phases = PHASES.map((id) => {
    const rs = out.filter((r) => r.phase === id);
    if (!rs.length) return null;
    const start = new Date(Math.min(...rs.map((r) => r.start.getTime())));
    const end = rs.some((r) => r.current) ? undefined : new Date(Math.max(...rs.map((r) => r.end.getTime())));
    return { id, roles: rs, start, end };
  }).filter(Boolean);

  const edu = [...education]
    .sort((x, y) => y.startYear - x.startYear)
    .map((e) => ({ ...e, a: pos(Date.UTC(e.startYear, 0, 1)), b: pos(Date.UTC(e.endYear + 1, 0, 1)) })); // whole years, inclusive

  const years = [];
  for (let y = firstYear; y <= asOf.getUTCFullYear(); y++) years.push({ year: y, a: pos(Date.UTC(y, 0, 1)), mid: pos(Date.UTC(y, 6, 2)) });

  const current = out.filter((r) => r.current).sort((x, y) => y.start - x.start)[0] ?? null;
  const firstStart = chrono[0].start;

  for (const r of out) if (!(0 <= r.a && r.a <= r.b && r.b <= 1)) throw new Error(`career: bad position for ${r.slug}`);
  return { roles: out, education: edu, phases, axis: { firstYear, years, today: pos(asOf.getTime()) }, asOf, firstStart, current };
}
