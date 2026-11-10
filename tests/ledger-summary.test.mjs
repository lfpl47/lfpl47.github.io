import test from "node:test";
import assert from "node:assert/strict";
import { buildCareer } from "../src/lib/career.mjs";
import { groupSummary, keepShown, mergeStacks } from "../src/lib/ledger-summary.mjs";

// Fixture copied from src/content/experience/en/*.md lines 2-5 and the stack blocks (konecta.md:6-10, teleperformance.md:6-8,
// atento.md:6-9, unisono-colombia.md:6-9 and the four engineering roles), and src/data/resume.en.json:28-41.
const d = (s) => new Date(`${s}T00:00:00Z`);
const roles = [
  ["stefanini-latam", "Stefanini Latam", "Data Engineer", "2024-12-01", undefined, { cloud: ["GCP"], data: ["ETL/ELT", "Data Lakes"], iac: ["Terraform"], misc: ["Git", "Scrum"] }],
  ["adl-digital-lab", "ADL Digital Lab", "Data Engineer", "2024-04-22", "2024-12-01", { cloud: ["AWS", "GCP"], data: ["ETL", "Big Data"], languages: ["Python", "SQL"], misc: ["APIs", "Scrum"] }],
  ["avvale", "Avvale", "Specialized Consultant — Cloud Data Engineering (Contract)", "2023-09-27", "2024-03-01", { cloud: ["AWS", "Azure"], data: ["Data Pipelines", "ETL"], streaming: ["Event-driven"], iac: ["Terraform"], languages: ["Python", "SQL", "PL/SQL"], db: ["Oracle", "PostgreSQL"], observability: ["CloudWatch"], misc: ["AWS Lambda", "S3", "SQS", "SNS", "Docker", "Git", "Scrum", "IaC"] }],
  ["havas-media-group", "Havas Media Group", "Data Engineer - Developer", "2022-03-07", "2023-08-25", { cloud: ["AWS"], data: ["ETL"], languages: ["Python", "PL/SQL"], streaming: ["Event-driven"], misc: ["AWS Lambda", "Scrum"] }],
  ["konecta", "Konecta", "Data Analyst and Digital Strategy", "2021-09-16", "2022-03-04", { data: ["ETL", "Data Modeling"], languages: ["Python", "SQL", "VBA"], db: ["Databases"], misc: ["RPA", "Power BI"] }],
  ["teleperformance", "Teleperformance", "Data Analyst / Jr. WFM Analyst", "2020-08-03", "2021-06-29", { data: ["Reporting", "Forecasting"], misc: ["Excel", "VBA", "KPIs"] }],
  ["atento", "Atento", "Back Office / Web Master Jr.", "2019-11-03", "2020-07-27", { languages: ["JavaScript", "SQL"], db: ["MySQL", "SQL Server"], misc: ["HTML", "CSS"] }],
  ["unisono-colombia", "Unísono Colombia", "Backoffice Analyst", "2016-02-08", "2019-07-22", { data: ["Reporting"], db: ["Access", "SQL"], misc: ["Excel", "VBA"] }],
].map(([slug, company, role, s, e, stack]) => ({ slug, company, role, enRole: role, start: d(s), end: e ? d(e) : undefined, stack }));
const education = [
  { institution: "SENA", area: "Information Systems Analysis and Development", startYear: 2015, endYear: 2018 },
  { institution: "Politécnico Grancolombiano", area: "Software Engineering", startYear: 2018, endYear: 2021 },
];
const career = buildCareer({ roles, education, asOf: d("2026-11-08") });
const phase = (id) => career.phases.find((p) => p.id === id);
const asRows = (rs) => rs.map((r) => ({ name: r.company, start: r.start, end: r.end, a: r.a, b: r.b }));
const iso = (date) => date.toISOString().slice(0, 10);

test("data engineering collapses to Mar 2022 – open, four companies and one bar over all its roles", () => {
  const p = phase("engineering");
  const s = groupSummary(asRows(p.roles));
  assert.equal(iso(s.start), "2022-03-07");
  assert.equal(s.end, undefined);
  assert.deepEqual(s.names, ["Stefanini Latam", "ADL Digital Lab", "Avvale", "Havas Media Group"]);
  assert.equal(s.a, p.roles.find((r) => r.slug === "havas-media-group").a);
  assert.equal(s.b, career.axis.today); // the open role ends at the as-of date
  // Same span as the phase heading (career.mjs).
  assert.equal(s.start.getTime(), p.start.getTime());
  assert.equal(s.end, p.end);
});

test("a closed phase ends at its last end; its bar spans the gap between roles", () => {
  const p = phase("analysis");
  const s = groupSummary(asRows(p.roles));
  assert.equal(iso(s.start), "2020-08-03");
  assert.equal(iso(s.end), "2022-03-04");
  assert.equal(s.a, p.roles.find((r) => r.slug === "teleperformance").a);
  assert.equal(s.b, p.roles.find((r) => r.slug === "konecta").b);
  assert.ok(s.b - s.a > p.roles.reduce((sum, r) => sum + (r.b - r.a), 0)); // one bar, gaps included
});

test("education collapses by whole years, newest institution first", () => {
  const jan1 = (y) => new Date(Date.UTC(y, 0, 1));
  const s = groupSummary(career.education.map((e) => ({ name: e.institution, start: jan1(e.startYear), end: jan1(e.endYear), a: e.a, b: e.b })));
  assert.equal(s.start.getUTCFullYear(), 2015);
  assert.equal(s.end.getUTCFullYear(), 2021);
  assert.deepEqual(s.names, ["Politécnico Grancolombiano", "SENA"]);
  assert.equal(s.a, 0);
  assert.equal(s.b, career.education[0].b);
});

test("a company with two roles is named once; an empty group is an error", () => {
  const r = { start: d("2020-01-01"), end: d("2020-06-01"), a: 0.1, b: 0.2 };
  assert.deepEqual(groupSummary([{ ...r, name: "Atento" }, { ...r, name: "Atento" }]).names, ["Atento"]);
  assert.throws(() => groupSummary([]), /at least one row/);
});

test("the combined stack keeps the tools the rows show, once, in stack order", () => {
  const stacks = phase("engineering").roles.map((r) => r.stack);
  const merged = mergeStacks(stacks);
  assert.deepEqual(merged.cloud, ["GCP", "AWS", "GCP", "AWS", "Azure", "AWS"]);
  assert.deepEqual(merged.iac, ["Terraform", "Terraform"]);
  // orderedStack(merged) by the rules of src/utils/stack.ts: category order, no repeats, first spelling wins.
  const ordered = ["GCP", "AWS", "Azure", "Terraform", "Python", "SQL", "PL/SQL", "Oracle", "PostgreSQL", "Event-driven", "CloudWatch", "ETL/ELT", "Data Lakes", "ETL", "Big Data", "Data Pipelines", "Git", "Scrum", "APIs", "AWS Lambda", "S3", "SQS", "SNS", "Docker", "IaC"];
  // What each Home row shows: orderedStack(stack).slice(0, 4).
  const shown = [["GCP", "Terraform", "ETL/ELT", "Data Lakes"], ["AWS", "GCP", "Python", "SQL"], ["AWS", "Azure", "Terraform", "Python"], ["AWS", "Python", "PL/SQL", "Event-driven"]];
  assert.deepEqual(keepShown(ordered, shown), ["GCP", "AWS", "Azure", "Terraform", "Python", "SQL", "PL/SQL", "Event-driven", "ETL/ELT", "Data Lakes"]);
  assert.deepEqual(keepShown(["SQL"], [["sql "]]), ["SQL"]);
});

test("data analysis and back office keep the tools their rows show; SQL from languages and from db shows once", () => {
  const analysis = mergeStacks(phase("analysis").roles.map((r) => r.stack));
  assert.deepEqual(analysis.misc, ["RPA", "Power BI", "Excel", "VBA", "KPIs"]);
  // orderedStack(merged) and each row's first four, by the rules of src/utils/stack.ts (as above).
  const analysisOrdered = ["Python", "SQL", "VBA", "Databases", "ETL", "Data Modeling", "Reporting", "Forecasting", "RPA", "Power BI", "Excel", "KPIs"];
  const analysisShown = [["Python", "SQL", "VBA", "Databases"], ["Reporting", "Forecasting", "Excel", "VBA"]];
  assert.deepEqual(keepShown(analysisOrdered, analysisShown), ["Python", "SQL", "VBA", "Databases", "Reporting", "Forecasting", "Excel"]);

  const backoffice = mergeStacks(phase("backoffice").roles.map((r) => r.stack));
  assert.deepEqual(backoffice.languages, ["JavaScript", "SQL"]);
  assert.deepEqual(backoffice.db, ["MySQL", "SQL Server", "Access", "SQL"]);
  const backofficeOrdered = ["JavaScript", "SQL", "MySQL", "SQL Server", "Access", "Reporting", "HTML", "CSS", "Excel", "VBA"];
  const backofficeShown = [["JavaScript", "SQL", "MySQL", "SQL Server"], ["Access", "SQL", "Reporting", "Excel"]];
  assert.deepEqual(keepShown(backofficeOrdered, backofficeShown), ["JavaScript", "SQL", "MySQL", "SQL Server", "Access", "Reporting", "Excel"]);
});
