# lfpl47.github.io

Professional portfolio for a Data Engineer.

## Stack

- Hosting: GitHub Pages (via GitHub Actions)
- Frontend: Astro + Tailwind
- Content (“repo as DB”): Markdown + YAML frontmatter in `src/content/*`
- Admin UI: Decap CMS at `/admin` (optional, needs OAuth proxy)

## Local development

Prereqs: Node.js `>=22`

- Install: `npm install`
- Dev server: `npm run dev`
- Build: `npm run build`
- Preview: `npm run preview`

## Content model

- Experience: `src/content/experience/*.md`
- Projects: `src/content/projects/*.md`
- Blog posts: `src/content/posts/*.md` (optional)
- CV data: `src/data/resume.json`

## Admin (/admin) with Decap CMS

This repo includes Decap CMS at `public/admin/`, but GitHub Pages requires an OAuth helper.

1. Deploy the Cloudflare Worker in `cms-oauth-proxy/` (see `cms-oauth-proxy/README.md`)
2. Update `public/admin/config.yml` and set `backend.base_url` to your Worker URL
3. Open: `/admin/`
