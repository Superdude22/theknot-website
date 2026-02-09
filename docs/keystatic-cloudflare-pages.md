# Keystatic on Cloudflare Pages (GitHub Auth)

This repo is configured so:
- Local dev uses Keystatic **local** storage.
- Production uses Keystatic **GitHub** storage for `Superdude22/theknot-website`.

## How it works
- Keystatic routes are provided by `@keystatic/astro` integration (no manual `src/pages/keystatic/*` route files).
- `keystatic.config.ts` switches storage by `NODE_ENV`:
  - Not `production` => `{ kind: 'local' }`
  - `production` => `{ kind: 'github', repo: 'Superdude22/theknot-website' }`

## Required Cloudflare config
### 1) KV binding for sessions
Cloudflare sessions require a KV binding named `SESSION`. This is already declared in `wrangler.toml`.

### 2) Cloudflare Pages environment variables
Set these for **Production** and **Preview**:
- `NODE_ENV=production`
- `KEYSTATIC_SECRET` (random string; used to encrypt session/auth data)
- `KEYSTATIC_GITHUB_CLIENT_ID` (GitHub App OAuth client id)
- `KEYSTATIC_GITHUB_CLIENT_SECRET` (GitHub App OAuth client secret)
- `PUBLIC_KEYSTATIC_GITHUB_APP_SLUG` (GitHub App slug; used by the Keystatic UI)

Do not commit these values; keep them only in Cloudflare Pages and (optionally) local `.env` files.

## GitHub App settings (must match exactly)
In your GitHub App:
- Callback URL: `https://dev.climbtheknot.com/api/keystatic/github/oauth/callback`
- Enable “Expire user authorization tokens” (Keystatic uses refresh tokens)
- Permissions (typical for Keystatic GitHub storage):
  - Repository permissions → Contents: Read & write
- Install the app on the repo `Superdude22/theknot-website`

## Staff onboarding checklist (dev)
If a staff member can see `/keystatic` but fails after GitHub authorization, check these three gates:
1) Cloudflare Access policy allows them onto `dev.climbtheknot.com` (or at least `/keystatic` + `/api/keystatic/*`)
2) They have GitHub repo access to `Superdude22/theknot-website` (write or higher)
3) The GitHub App is installed for that repo and the staff member is authorizing the correct app

## Quick verification commands
From a terminal (no secrets printed):
- Confirm `/api/keystatic/github/login` redirects to GitHub with a client id:
  - PowerShell: `Invoke-WebRequest -MaximumRedirection 0 https://dev.climbtheknot.com/api/keystatic/github/login`

## Common pitfalls
- Adding manual Keystatic route files under `src/pages/keystatic/*` or `src/pages/api/keystatic/*` can break routing/builds; keep routes owned by `@keystatic/astro`.
- `wrangler pages download config --force` can overwrite `wrangler.toml`. Avoid unless you intend to review and merge changes.

