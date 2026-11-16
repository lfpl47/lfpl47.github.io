// Courses and certifications as a graph. Every course links to its area (its Drive folder, a fact of the data) and to
// each topic its title names (the patterns below). The layout runs at build time, so the page ships a settled graph.

const norm = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

// Inside a topic node goes its `logo` (a file in public/logos), else its `icon` (icons.mjs), else the `mark` text.
// A topic with a logo is a node from one course; the others need two.
export const TOPICS = [
  { id: "aws", mark: "AWS", logo: "/logos/aws.svg", label: "AWS", re: /\baws\b/ },
  { id: "azure", mark: "Az", logo: "/logos/azure.png", label: "Azure", re: /azure/ },
  { id: "gcp", mark: "GC", logo: "/logos/gcp.png", label: "Google Cloud", re: /google cloud|cloud digital leader/ },
  { id: "python", mark: "Py", logo: "/logos/python.svg", label: "Python", re: /python|pandas|numpy|matplotlib|flask|jupyter/ },
  { id: "sql", mark: "SQL", icon: "database", label: { en: "SQL and databases", es: "SQL y bases de datos" }, re: /postgresql|bases de datos|olap/ },
  { id: "excel", mark: "XL", label: "Excel", re: /excel/ },
  { id: "bi", mark: "BI", icon: "reports", label: "Business intelligence", re: /business intelligence|power bi|kpi|visualizacion de datos/ },
  { id: "de", mark: "ETL", icon: "pipeline", label: { en: "Data engineering", es: "Ingeniería de datos" }, re: /ingenieria de datos|\betl\b|airflow|spark|databricks|data warehousing/ },
  { id: "ds", mark: "∑", label: { en: "Data science", es: "Ciencia de datos" }, re: /data science|ciencia de datos|estadistica|regresion|analisis exploratorio/ },
  { id: "ai", mark: { en: "AI", es: "IA" }, label: { en: "Artificial intelligence", es: "Inteligencia artificial" }, re: /chatgpt|prompt|llms?\b|claude|inteligencia artificial/ },
  { id: "postgresql", mark: "PG", logo: "/logos/postgresql.svg", label: "PostgreSQL", re: /postgresql/ },
  { id: "spark", mark: "Sp", logo: "/logos/spark.svg", label: "Apache Spark", re: /\bspark\b/ },
  { id: "airflow", mark: "Af", logo: "/logos/airflow.svg", label: "Apache Airflow", re: /airflow/ },
  { id: "terraform", mark: "Tf", logo: "/logos/terraform.svg", label: "Terraform", re: /terraform/ },
  { id: "docker", mark: "Dk", logo: "/logos/docker.svg", label: "Docker", re: /docker/ },
  { id: "git", mark: "Git", logo: "/logos/git.svg", label: "Git", re: /\bgit\b/ },
  { id: "java", mark: "Jv", logo: "/logos/java.svg", label: "Java", re: /\bjava\b/ },
  { id: "se", mark: "</>", icon: "apps", label: { en: "Software engineering", es: "Ingeniería de software" }, re: /software|poo\b|orientada a objetos|unit testing|estructuras de datos/ },
];

// The icon of each area (icons.mjs), in the graph and on the area toggles of the list.
export const AREA_ICONS = { cloud: "cloud", data_science_bi: "phase-analysis", programming: "code", productivity: "requirements" };

const pick = (v, locale) => (typeof v === "string" ? v : v[locale]);

/** Nodes and links. `areaLabel(key)` gives the area names of the page. */
export function buildGraph(items, folders, locale, areaLabel) {
  const courses = items.map((i) => {
    const t = norm(i.title);
    return { id: i.id, kind: "course", area: i.folderKey, title: i.label ?? i.title, url: i.url, topics: TOPICS.filter((x) => x.re.test(t)).map((x) => x.id) };
  });
  const topics = TOPICS.map((x) => ({ id: x.id, kind: "topic", mark: pick(x.mark, locale), logo: x.logo, icon: x.icon, label: pick(x.label, locale), count: courses.filter((c) => c.topics.includes(x.id)).length }))
    .filter((x) => x.count > (x.logo ? 0 : 1));
  const kept = new Set(topics.map((x) => x.id));
  for (const c of courses) c.topics = c.topics.filter((id) => kept.has(id));
  // A topic takes the area of most of its courses, for its color.
  for (const x of topics) {
    const n = {};
    for (const c of courses) if (c.topics.includes(x.id)) n[c.area] = (n[c.area] ?? 0) + 1;
    x.area = Object.keys(n).sort((a, b) => n[b] - n[a])[0];
  }
  const areas = folders.map((f) => {
    const count = courses.filter((c) => c.area === f.key).length;
    return { id: f.key, kind: "area", area: f.key, mark: String(count), icon: AREA_ICONS[f.key], label: areaLabel(f.key), count };
  });
  const links = courses.flatMap((c) => [{ a: c.id, b: c.area }, ...c.topics.map((id) => ({ a: c.id, b: id }))]);
  return { nodes: [...areas, ...topics, ...courses], links };
}

// A course grows with the topics it joins.
export const radius = (n) => (n.kind === "course" ? 3.5 + Math.min(2, n.topics.length) : n.kind === "area" ? 26 : 13 + 2.2 * Math.sqrt(n.count));

/** Force layout with a fixed seed: the same input gives the same picture. Returns { id: [x, y] }. */
export function layout({ nodes, links }, W, H) {
  let seed = 20261116;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const areas = nodes.filter((n) => n.kind === "area");
  const anchor = Object.fromEntries(areas.map((n, i) => {
    const a = (i / areas.length) * 2 * Math.PI + Math.PI / 4;
    return [n.id, [W / 2 + Math.cos(a) * W * 0.4, H / 2 + Math.sin(a) * H * 0.34]];
  }));
  const P = nodes.map((n) => {
    const [ax, ay] = anchor[n.area], r = radius(n), hub = n.kind !== "course";
    // A hub is a box: its circle and the label under it (about 6.2 units a letter).
    return { n, r, hub, hw: hub ? Math.max(r, n.label.length * 3.1) + 5 : r, hh: hub ? r + 12 : r, x: ax + (rnd() - 0.5) * 120, y: ay + (rnd() - 0.5) * 120, vx: 0, vy: 0 };
  });
  const at = Object.fromEntries(P.map((p) => [p.n.id, p]));
  const pad = 10, steps = 600;
  for (let it = 0; it < steps; it++) {
    const k = 1 - it / steps; // cooling
    for (let i = 0; i < P.length; i++) {
      const a = P[i];
      for (let j = i + 1; j < P.length; j++) {
        const b = P[j];
        let dx = b.x - a.x, dy = b.y - a.y;
        const d2 = dx * dx + dy * dy || 0.01, d = Math.sqrt(d2), both = a.hub && b.hub;
        // Charge, stronger between hubs, and a push when two nodes touch.
        let f = (both ? 5200 : a.hub || b.hub ? 520 : 200) / d2;
        const min = a.r + b.r + (a.hub || b.hub ? 12 : 7);
        if (d < min) f += (min - d) * 0.5;
        let fx = (dx / d) * f, fy = (dy / d) * f;
        // Two hub boxes that overlap part along the shallow axis, so no label covers another.
        const ox = a.hw + b.hw - Math.abs(dx), oy = a.hh + b.hh - Math.abs(dy);
        if (both && ox > 0 && oy > 0) {
          if (ox < oy) fx += (dx < 0 ? -1 : 1) * ox * 0.5;
          else fy += (dy < 0 ? -1 : 1) * oy * 0.5;
        }
        a.vx -= fx; a.vy -= fy; b.vx += fx; b.vy += fy;
      }
      // A pull to the area's corner for hubs, and a weak one to the center for all.
      const [ax, ay] = anchor[a.n.area];
      const g = a.n.kind === "area" ? 0.06 : a.n.kind === "topic" ? 0.01 : 0.003;
      a.vx += (ax - a.x) * g + (W / 2 - a.x) * 0.001;
      a.vy += (ay - a.y) * g + (H / 2 - a.y) * 0.001;
    }
    for (const l of links) {
      const a = at[l.a], b = at[l.b];
      const dx = b.x - a.x, dy = b.y - a.y, d = Math.sqrt(dx * dx + dy * dy) || 0.01;
      const f = (d - (b.r + 40)) * 0.03;
      a.vx += (dx / d) * f; a.vy += (dy / d) * f; b.vx -= (dx / d) * f * 0.2; b.vy -= (dy / d) * f * 0.2;
    }
    for (const p of P) {
      p.x = Math.min(W - p.hw - pad, Math.max(p.hw + pad, p.x + p.vx * k));
      // Hubs keep room below for their label.
      p.y = Math.min(H - p.r - pad - (p.hub ? 18 : 0), Math.max(p.r + pad, p.y + p.vy * k));
      p.vx *= 0.6; p.vy *= 0.6;
    }
  }
  // Last, hub boxes that still overlap move apart by position, so no label covers another.
  const H2 = P.filter((p) => p.hub);
  for (let it = 0; it < 300; it++) {
    for (let i = 0; i < H2.length; i++) for (let j = i + 1; j < H2.length; j++) {
      const a = H2[i], b = H2[j], dx = b.x - a.x, dy = b.y - a.y;
      const ox = a.hw + b.hw + 2 - Math.abs(dx), oy = a.hh + b.hh + 2 - Math.abs(dy);
      if (ox <= 0 || oy <= 0) continue;
      if (ox < oy) { const m = (dx < 0 ? -1 : 1) * ox / 2; a.x -= m; b.x += m; }
      else { const m = (dy < 0 ? -1 : 1) * oy / 2; a.y -= m; b.y += m; }
    }
    for (const p of H2) {
      p.x = Math.min(W - p.hw - pad, Math.max(p.hw + pad, p.x));
      p.y = Math.min(H - p.r - pad - 18, Math.max(p.r + pad, p.y));
    }
  }
  // A course dot that ended on a hub steps out to its edge.
  for (const c of P) {
    if (c.hub) continue;
    for (const h of H2) {
      const dx = c.x - h.x, dy = c.y - h.y, d = Math.sqrt(dx * dx + dy * dy) || 0.01, min = h.r + c.r + 5;
      if (d < min) { c.x = h.x + (dx / d) * min; c.y = h.y + (dy / d) * min; }
    }
  }
  return Object.fromEntries(P.map((p) => [p.n.id, [Math.round(p.x * 10) / 10, Math.round(p.y * 10) / 10]]));
}
