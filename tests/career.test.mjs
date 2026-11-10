import test from "node:test";
import assert from "node:assert/strict";
import { buildCareer, phaseOf } from "../src/lib/career.mjs";

// Fixture copied from src/content/experience/en/*.md lines 2-5 and src/data/resume.en.json:28-41.
const d = (s) => new Date(`${s}T00:00:00Z`);
const roles = [
  ["stefanini-latam", "Stefanini Latam", "Data Engineer", "2024-12-01"],
  ["adl-digital-lab", "ADL Digital Lab", "Data Engineer", "2024-04-22", "2024-12-01"],
  ["avvale", "Avvale", "Specialized Consultant — Cloud Data Engineering (Contract)", "2023-09-27", "2024-03-01"],
  ["havas-media-group", "Havas Media Group", "Data Engineer - Developer", "2022-03-07", "2023-08-25"],
  ["konecta", "Konecta", "Data Analyst and Digital Strategy", "2021-09-16", "2022-03-04"],
  ["teleperformance", "Teleperformance", "Data Analyst / Jr. WFM Analyst", "2020-08-03", "2021-06-29"],
  ["atento", "Atento", "Back Office / Web Master Jr.", "2019-11-03", "2020-07-27"],
  ["unisono-colombia", "Unísono Colombia", "Backoffice Analyst", "2016-02-08", "2019-07-22"],
].map(([slug, company, role, s, e]) => ({ slug, company, role, enRole: role, start: d(s), end: e ? d(e) : undefined }));
const education = [
  { institution: "SENA", area: "Information Systems Analysis and Development", startYear: 2015, endYear: 2018 },
  { institution: "Politécnico Grancolombiano", area: "Software Engineering", startYear: 2018, endYear: 2021 },
];
const asOf = d("2026-11-08");

test("phase rule gives 4 / 2 / 2", () => {
  const c = buildCareer({ roles, education, asOf });
  const count = (id) => c.roles.filter((r) => r.phase === id).length;
  assert.deepEqual([count("engineering"), count("analysis"), count("backoffice")], [4, 2, 2]);
  assert.equal(phaseOf("Data Engineering / Developer"), "engineering");
});

test("phase spans, current role and first start come from the dates", () => {
  const c = buildCareer({ roles, education, asOf });
  const span = (id) => c.phases.find((p) => p.id === id);
  assert.equal(span("engineering").start.toISOString().slice(0, 10), "2022-03-07");
  assert.equal(span("engineering").end, undefined);
  assert.equal(span("analysis").end.toISOString().slice(0, 10), "2022-03-04");
  assert.equal(span("backoffice").start.toISOString().slice(0, 10), "2016-02-08");
  assert.equal(span("backoffice").end.toISOString().slice(0, 10), "2020-07-27");
  assert.equal(c.current.slug, "stefanini-latam");
  assert.equal(c.firstStart.toISOString().slice(0, 10), "2016-02-08");
});

test("axis runs from Jan 1 of the first year to Jan 1 after the build year", () => {
  const c = buildCareer({ roles, education, asOf });
  assert.equal(c.axis.firstYear, 2015);
  assert.equal(c.education.find((e) => e.institution === "SENA").a, 0);
  assert.ok(c.axis.today > 0.98 && c.axis.today < 1);
  const stef = c.roles.find((r) => r.slug === "stefanini-latam");
  assert.equal(stef.b, c.axis.today);
  assert.equal(c.roles.find((r) => r.slug === "unisono-colombia").i, 0); // oldest draws first
});

test("roles only: axis starts in 2016", () => {
  const c = buildCareer({ roles, asOf });
  assert.equal(c.axis.firstYear, 2016);
});
