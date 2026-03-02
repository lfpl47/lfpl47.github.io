# lfpl47.github.io

Professional portfolio for a Data Engineer.

## Stack

- Hosting: GitHub Pages (via GitHub Actions)
- Frontend: Astro + Tailwind
- Content (“repo as DB”): Markdown + YAML frontmatter in `src/content/*`
- Admin UI: Decap CMS at `/admin` (optional, needs OAuth proxy)

## GitHub Pages settings

In GitHub: **Settings → Pages → Build and deployment → Source = GitHub Actions**.

## Local development

Prereqs: Node.js `>=22`

- Install: `npm install`
- Dev server: `npm run dev`
- Build: `npm run build`
- Preview: `npm run preview`

## Content model

- Languages:
  - English (default): `/`
  - Español: `/es/`

- Experience:
  - `src/content/experience/en/*.md`
  - `src/content/experience/es/*.md`
- Projects:
  - `src/content/projects/en/*.md`
  - `src/content/projects/es/*.md`
- Blog posts (optional):
  - `src/content/posts/en/*.md`
  - `src/content/posts/es/*.md`
- CV data:
  - `src/data/resume.en.json`
  - `src/data/resume.es.json`
- CV PDFs (optional):
  - `public/cv/*`

## Admin (/admin) with Decap CMS

This repo includes Decap CMS at `public/admin/`, but GitHub Pages requires an OAuth helper.

1. Deploy the Cloudflare Worker in `cms-oauth-proxy/` (see `cms-oauth-proxy/README.md`)
2. Update `public/admin/config.yml` and set `backend.base_url` to your Worker URL
3. Open: `/admin/`
