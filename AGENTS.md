<INSTRUCTIONS>
This folder is an Astro 5 site deployed to Cloudflare Pages with Keystatic CMS.

## Guardrails
- Do not commit secrets. Only commit `.env.example` (blank values).
- Keystatic routes are provided by `@keystatic/astro`. Do not add manual pages under `src/pages/keystatic/*` or `src/pages/api/keystatic/*` (they caused route/build issues previously).
- Verify changes with concrete checks (commands/logs) before suggesting config changes.

## Quick Commands
- Install: `npm ci`
- Dev server (local Keystatic storage): `npm run dev` then open `http://127.0.0.1:4321/keystatic`
- Build (Cloudflare): `npm run build`

## Git Metadata (this workspace)
If `git` commands don’t work normally, the repo metadata may be stored as `.git_disabled`. In that case use:
- `git --git-dir=.git_disabled --work-tree=. <command>`

## Production/Preview (Cloudflare Pages)
- Pages project name: `theknot-website` (see `wrangler.toml`)
- KV binding required for sessions: `SESSION` (see `wrangler.toml`)
- Keystatic GitHub auth requires these environment variables in Cloudflare Pages (Production + Preview):
  - `NODE_ENV=production`
  - `KEYSTATIC_SECRET`
  - `KEYSTATIC_GITHUB_CLIENT_ID`
  - `KEYSTATIC_GITHUB_CLIENT_SECRET`
  - `PUBLIC_KEYSTATIC_GITHUB_APP_SLUG`

## Staff Access (dev)
To use `https://dev.climbtheknot.com/keystatic`, staff typically need:
- Cloudflare Access policy permission for the dev hostname (or the `/keystatic` paths).
- GitHub repo access to `Superdude22/theknot-website` (write or higher), since Keystatic uses GitHub storage in production.
</INSTRUCTIONS>
