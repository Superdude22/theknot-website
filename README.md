# The Knot (Astro + Keystatic)

Astro 5 site for The Knot climbing gym, deployed on Cloudflare Pages. Content is managed via Keystatic at `/keystatic`.

## Prerequisites
- Node.js (project builds on Node 22)
- npm

## Local Development
```bash
cd TheKnot/astro-site
npm ci
npm run dev
```

- Site: `http://127.0.0.1:4325/`
- Keystatic: `http://127.0.0.1:4325/keystatic`
- If Keystatic loads blank in dev, use `npm run dev:keystatic` (clears `.astro` and Vite optimize cache, then starts on `http://127.0.0.1:4325/`).

Local Keystatic uses `storage.kind: 'local'` unless `NODE_ENV=production` (see `keystatic.config.ts`).

## Production (Cloudflare Pages)
- Build command: `npm run build`
- Output dir: `dist`
- Pages project: `theknot-website` (see `wrangler.toml`)

Keystatic uses GitHub storage/auth in production and requires the env vars listed in `.env.example` to be set in Cloudflare Pages (Production + Preview).

## Docs
- Setup + troubleshooting: `TheKnot/astro-site/docs/keystatic-cloudflare-pages.md`
- Staff editing workflow: `TheKnot/astro-site/docs/cms-editor-workflow.md`
- Generated media map: `TheKnot/astro-site/docs/cms-media-map.md` (run `npm run cms:media-map`)
- Media sync helpers: `npm run cms:fix-collection-images`, `npm run cms:sync-library-paths`, `npm run cms:sync-media-assets`
- CMS connectivity audit: `npm run cms:audit`
- Project handoff/status: `TheKnot/astro-site/HANDOFF.md`

## Canva Connect Media Utility
Use Canva Connect API to search assets, pull files by name/ID, and wire file paths into Keystatic JSON fields.

```bash
# 1) Search Canva uploads
npm run canva:assets -- --query "logo"

# 2) Download + wire using preset
npm run canva:pull -- --name "Logo Square (Manatee).png" --preset footer-logo --overwrite true

# 3) Download + custom wire target
npm run canva:pull -- --name "home-card-private-belayer.jpg" \
  --out public/images/canva-final/home-card-private-belayer.jpg \
  --wire src/content/not-ready-cards/private-belayer.json:imageLibraryPath

# 4) Get export URLs or download Canva page exports
npm run canva:export -- --design DAG_oE5IAGg --format png --pages 1 --out tmp/canva-exports/home-1.png

# 5) List available presets
npm run canva:presets
```

Notes:
- The utility auto-refreshes Canva access tokens when possible.
- `pull-asset` can auto-run CMS sync scripts so new files are discoverable in Keystatic.
- Signed Canva URLs expire; the script downloads and stores a local copy for stable use.
