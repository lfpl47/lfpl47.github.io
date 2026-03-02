import { defineCollection, z } from "astro:content";

const stackSchema = z
  .object({
    cloud: z.array(z.string()).optional(),
    data: z.array(z.string()).optional(),
    orchestration: z.array(z.string()).optional(),
    iac: z.array(z.string()).optional(),
    languages: z.array(z.string()).optional(),
    db: z.array(z.string()).optional(),
    streaming: z.array(z.string()).optional(),
    observability: z.array(z.string()).optional(),
    cicd: z.array(z.string()).optional(),
    misc: z.array(z.string()).optional(),
  })
  .default({});

const impactMetricSchema = z.object({
  label: z.string(),
  value: z.string(),
});

const experience = defineCollection({
  type: "content",
  schema: z.object({
    company: z.string(),
    role: z.string(),
    start: z.coerce.date(),
    end: z.coerce.date().optional(),
    location: z.string().optional(),
    employmentType: z
      .enum(["Full-time", "Part-time", "Contract", "Freelance", "Internship"])
      .optional(),
    summary: z.string().optional(),
    stack: stackSchema,
    highlights: z.array(z.string()).min(1),
    impact: z.array(impactMetricSchema).optional(),
    tags: z.array(z.string()).optional(),
    featured: z.boolean().optional(),
  }),
});

const projects = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    type: z.enum(["Case Study", "Project", "Open Source", "Talk"]).optional(),
    status: z.enum(["Active", "Completed", "Paused"]).optional(),
    stack: stackSchema,
    repo: z.string().url().optional(),
    nda: z.boolean().optional(),
    cover: z.string().optional(),
    highlights: z.array(z.string()).min(1),
    results: z.array(z.string()).optional(),
    learnings: z.array(z.string()).optional(),
    tags: z.array(z.string()).optional(),
    featured: z.boolean().optional(),
  }),
});

export const collections = { experience, projects };
