# Decap CMS OAuth proxy (Cloudflare Worker)

Decap CMS needs an OAuth “helper” server to authenticate with GitHub when you are **not** hosting on Netlify.

This folder contains a minimal Cloudflare Worker you can deploy to act as that helper.

## 1) Create a GitHub OAuth App

In GitHub: **Settings → Developer settings → OAuth Apps → New OAuth App**

- **Homepage URL**: your Worker URL (example: `https://decap-proxy.yourdomain.com`)
- **Authorization callback URL**: the Worker URL + `/callback`
  - example: `https://decap-proxy.yourdomain.com/callback`

Save the **Client ID** and **Client Secret**.

## 2) Deploy the Worker

Option A — Cloudflare dashboard:

1. Create a new Worker
2. Paste the contents of `cms-oauth-proxy/src/index.ts`
3. Add secrets:
   - `GITHUB_OAUTH_ID`
   - `GITHUB_OAUTH_SECRET`
   - Optional: `GITHUB_REPO_PRIVATE=1` (uses `repo,user` scope)

Option B — Wrangler (requires Node.js locally):

- Copy `cms-oauth-proxy/wrangler.toml.sample` to `cms-oauth-proxy/wrangler.toml`
- Deploy:
  - `npx wrangler deploy`

## 3) Point Decap to the Worker

Update `public/admin/config.yml`:

- Set `backend.base_url` to your Worker URL (no trailing slash).

Then go to:

- `https://lfpl47.github.io/admin/`

