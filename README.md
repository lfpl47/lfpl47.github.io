# lfpl47.github.io

Professional portfolio for a Data Engineer.

## Stack

- Hosting: GitHub Pages (via GitHub Actions)
- Frontend: Astro
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

## Icons in `public/arch/` (architecture explorer)

The service icons in the Home architecture explorer are vendor files, copied unchanged. Their use is limited to diagrams and documentation. Check these terms again before you add, change or reuse an icon. Sources and terms read on 2026-11-09:

- `public/arch/aws/`: AWS Architecture Icons (files with `<title>Icon-Architecture/64/Arch_…`), https://aws.amazon.com/architecture/icons/. Terms: “We allow customers and partners to use these toolkits and assets to create architecture diagrams.” The AWS Trademark Guidelines (https://aws.amazon.com/trademark-guidelines/) do not allow the AWS logo outside a license.
- `public/arch/azure/`: Azure Public Service Icons (https://arch-center.azureedge.net/icons/Azure_Public_Service_Icons_V25.zip), from https://learn.microsoft.com/en-us/azure/architecture/icons/. Terms: “Microsoft permits the use of these icons in architectural diagrams, training materials, or documentation. You can copy, distribute, and display the icons only for the permitted use unless granted explicit permission by Microsoft.” Do not crop, flip, rotate, distort or change the icon shape.
- `public/arch/gcp/`: Google Cloud icons, https://cloud.google.com/icons: the core product icons (bigquery, cloud-run, cloud-sql, cloud-storage) and the legacy console icons (dataflow, pubsub, firestore, api-gateway, cloud-run-functions, managed-spark, which is the Dataproc icon). Terms: “Here you can find the Google Cloud product icons you need for your diagrams, technical documentation, and more.” The page gives no other terms.

The vendor company logos (AWS, Google Cloud, Azure) are not used: the cloud selector shows the text labels only. To use a logo, get written permission from the vendor first.
