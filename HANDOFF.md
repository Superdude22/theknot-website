# The Knot — Astro + Keystatic (Cloudflare Pages) Handoff

## Current Status
- Astro site builds and deploys to Cloudflare Pages.
- Keystatic admin UI is available at `/keystatic`.
- Production Keystatic uses GitHub storage for `Superdude22/theknot-website`.
- Staff access on dev is gated by Cloudflare Access + GitHub repo permissions.

## Repo Layout (key files)
- `astro.config.mjs` — Astro config (Cloudflare adapter + SSR route include for Keystatic)
- `keystatic.config.ts` — Keystatic schemas + storage switch by `NODE_ENV`
- `wrangler.toml` — Cloudflare Pages project + KV binding for sessions
- `src/content/` — Keystatic content lives here (JSON, plus images in `public/`)
- `src/layouts/BaseLayout.astro` — Brand CSS variables injection
- `src/styles/global.css` — Fonts + Tailwind + CSS variables

## Run Locally
```bash
cd TheKnot/astro-site
npm ci
npm run dev
```
- Site: `http://127.0.0.1:4321/`
- Keystatic: `http://127.0.0.1:4321/keystatic`

Local Keystatic uses `storage.kind: 'local'` unless `NODE_ENV=production`.

## Build / Deploy
- Build: `npm run build`
- Output: `dist/`
- Cloudflare Pages project: `theknot-website` (see `wrangler.toml`)

## Keystatic Schemas
Defined in `keystatic.config.ts`.

**Singletons**
- `brand` — Brand colors (CSS variables)
- `announcement` — Banner content
- `homePage`, `aboutPage`, `membershipPage`, `newClimberPage`, `amenitiesPage`, `shopPage`

**Collections**
- `team`
- `events`
- `policies`
- `products`
- `notReadyCards`

## Production Requirements (Cloudflare)
### KV binding
Keystatic auth uses sessions, which require a KV binding named `SESSION` (declared in `wrangler.toml`).

### Environment variables
Set in Cloudflare Pages for **Production** and **Preview**:
- `NODE_ENV=production`
- `KEYSTATIC_SECRET`
- `KEYSTATIC_GITHUB_CLIENT_ID`
- `KEYSTATIC_GITHUB_CLIENT_SECRET`
- `PUBLIC_KEYSTATIC_GITHUB_APP_SLUG`

See `.env.example` for the list (do not commit real values).

## GitHub App Requirements (Keystatic GitHub auth)
GitHub App settings must match:
- Callback URL: `https://dev.climbtheknot.com/api/keystatic/github/oauth/callback`
- “Expire user authorization tokens” enabled (refresh tokens)
- Repo permissions: Contents read/write
- App installed on `Superdude22/theknot-website`

## Staff Onboarding (dev)
For a staff member to successfully use `https://dev.climbtheknot.com/keystatic`:
1) Cloudflare Access policy must allow them onto `dev.climbtheknot.com` (or at least `/keystatic` + `/api/keystatic/*`)
2) They must have GitHub access to `Superdude22/theknot-website` (write or higher)
3) They must authorize the correct GitHub App

## Notes / Pitfalls
- Do not add manual Keystatic routes under `src/pages/keystatic/*` or `src/pages/api/keystatic/*`. Routes are provided by `@keystatic/astro`.
- Avoid `wrangler pages download config --force` unless you intend to review/merge overwrites to `wrangler.toml`.

