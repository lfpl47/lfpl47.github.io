import { getCollection, type CollectionEntry } from "astro:content";
import { buildCareer } from "./career.mjs";
import resumeEn from "../data/resume.en.json";
import resumeEs from "../data/resume.es.json";
import { isSlugForLocale, stripLocaleFromSlug } from "../i18n/content";
import type { Locale } from "../i18n/locales";
import { withLocale } from "../i18n/routing";

type Experience = CollectionEntry<"experience">["data"];
export type Phase = "engineering" | "analysis" | "backoffice";

export type CareerRole = {
  slug: string;
  company: string;
  role: string;
  /** English title of the same slug; the phase rule reads it. */
  enRole: string;
  start: Date;
  end?: Date;
  employmentType?: Experience["employmentType"];
  location?: string;
  stack: Experience["stack"];
  highlights: string[];
  summary?: string;
  href: string;
  phase: Phase;
  /** True when the role has no end date. */
  current: boolean;
  /** Bar start and end on the axis, 0 to 1 (4 decimals). An open role ends at the as-of date. */
  a: number;
  b: number;
  /** Chronological index, 0 = oldest. */
  i: number;
};

export type CareerEducation = {
  institution: string;
  area: string;
  startYear: number;
  endYear: number;
  /** Whole years: 1 January of startYear to 1 January after endYear. */
  a: number;
  b: number;
};

export type CareerPhase = { id: Phase; roles: CareerRole[]; start: Date; end?: Date };

export type Career = {
  /** Newest first. */
  roles: CareerRole[];
  /** Newest first; empty with { education: false }. */
  education: CareerEducation[];
  /** Engineering, analysis, back office; a phase with no roles is left out. */
  phases: CareerPhase[];
  /** null when there are no roles. */
  axis: {
    firstYear: number;
    /** Every year from firstYear to the as-of year: a = 1 January, mid = 2 July. */
    years: { year: number; a: number; mid: number }[];
    today: number;
  } | null;
  asOf: Date;
  firstStart: Date | null;
  current: CareerRole | null;
};

/** Roles of one language with phase and axis positions. Education is included unless opts.education is false. */
export async function getCareer(locale: Locale, opts: { education?: boolean } = {}): Promise<Career> {
  const entries = await getCollection("experience");
  const enRoles = new Map(
    entries.filter((e) => isSlugForLocale(e.slug, "en")).map((e) => [stripLocaleFromSlug(e.slug, "en"), e.data.role]),
  );
  const roles = entries
    .filter((e) => isSlugForLocale(e.slug, locale))
    .map((e) => {
      const slug = stripLocaleFromSlug(e.slug, locale);
      const d = e.data;
      return {
        slug,
        company: d.company,
        role: d.role,
        enRole: enRoles.get(slug) ?? d.role,
        start: d.start,
        end: d.end,
        employmentType: d.employmentType,
        location: d.location,
        stack: d.stack,
        highlights: d.highlights,
        summary: d.summary,
        href: withLocale(`/experience/${slug}/`, locale),
      };
    });
  const resume = locale === "es" ? resumeEs : resumeEn;
  const education =
    opts.education === false
      ? []
      : resume.education.map((e) => ({
          institution: e.institution,
          area: e.area,
          startYear: Number(e.startDate),
          endYear: Number(e.endDate),
        }));
  return buildCareer({ roles, education, asOf: new Date() }) as Career;
}
