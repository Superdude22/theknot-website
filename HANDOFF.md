# The Knot - Astro + Keystatic Migration Handoff

## Project Status: Phase 2 Complete (Pages Migrated)

Core site pages have been migrated to Astro, Keystatic is wired up, and `npm run build` succeeds with the Cloudflare adapter.

---

## What's Been Done

### Project Structure Created
```
TheKnot/astro-site/
├── astro.config.mjs          # Astro config (static output + Cloudflare adapter)
├── keystatic.config.ts       # Full content schema definitions
├── tailwind.config.mjs       # Brand colors as CSS variables
├── package.json              # Dependencies installed
│
├── public/
│   ├── fonts/                # Zing Rust, Uniform Pro, Rubik (copied from existing)
│   └── images/               # All images (logos, canva-final, etc.)
│
└── src/
    ├── content/
    │   └── config.ts         # Astro content collection schemas
    ├── layouts/
    │   └── BaseLayout.astro  # Main layout with dynamic brand color injection
    ├── components/
    │   ├── Header.astro      # Static header
    │   ├── HeaderMobile.tsx  # React island for mobile menu
    │   ├── Footer.astro      # Static footer
    │   ├── AnnouncementBanner.astro
    │   ├── HeroSection.astro
    │   ├── ThreeCardSection.astro
    │   └── Accordion.tsx     # React island
    ├── pages/
    │   ├── index.astro       # Home page (working)
    │   └── keystatic/
    │       └── [...path].astro  # Admin UI (SSR enabled)
    └── styles/
        └── global.css        # Font faces, CSS variables, Tailwind
```

Note: Keystatic admin/API routes are now provided by the `@keystatic/astro` integration (the manual `src/pages/keystatic/*` and `src/pages/api/keystatic/*` route files were removed to avoid Astro 5 build issues).

### Keystatic Schemas Defined

**Singletons (one-off content):**
- `brand` - Editable brand colors (rust, manatee, limestone, etc.)
- `announcement` - Banner text, link, background color, enabled toggle
- `homePage` - Hero section, membership section, code of conduct
- `aboutPage` - Hero, mission, story, team headline
- `membershipPage` - Hero, pricing, benefits
- `newClimberPage` - Hero, getting started, day pass info
- `amenitiesPage` - Hero, features list
- `shopPage` - Hero, intro text

**Collections (multiple items):**
- `team` - Name, role, bio, photo, order, isLeadership
- `events` - Title, date, time, description, image, registration link, featured/recurring flags
- `policies` - Title, rich content, button text/link, order
- `products` - Name, price, description, images, sizes, category, inStock
- `notReadyCards` - Label, description, button text/link, image, order

### Key Technical Details

1. **Output Mode**: `output: 'static'` (Astro 5) with Cloudflare adapter
2. **Brand Colors**: CSS variables in `:root`, Tailwind references them via `var(--color-*)`
3. **React Islands**: HeaderMobile.tsx and Accordion.tsx use `client:load` / `client:visible`
4. **Fonts**: Loaded via @font-face in global.css
5. **Keystatic Routes**: Provided by `@keystatic/astro` integration (no manual routes in `src/pages/keystatic` or `src/pages/api/keystatic`)

---

## How to Run

```bash
cd TheKnot/astro-site
npm run dev
```

- **Site**: http://127.0.0.1:4321/
- **Admin**: http://127.0.0.1:4321/keystatic

---

## What's Next (Phase 3 - Production Deployment)

1. Create GitHub OAuth App for Keystatic and set Cloudflare env vars (`KEYSTATIC_GITHUB_CLIENT_ID`, `KEYSTATIC_GITHUB_CLIENT_SECRET`, `KEYSTATIC_SECRET`, `NODE_ENV=production`)
2. Deploy repo to Cloudflare Pages (`npm run build`, output `dist`)
3. Add custom domain (e.g. `dev.climbtheknot.com`) and verify `/keystatic` login + editing

---

## Known Issues / Warnings

1. **Empty content directories** - Warnings about no files in `content/team`, `content/events`, etc. are expected until content is created via Keystatic
2. **Cloudflare SESSION binding** - Can ignore for local dev; needed for production
3. **Sharp warning** - Cloudflare doesn't support sharp at runtime; images work fine for static builds

---

## Reference Files

- **Existing Next.js site**: `TheKnot/website/` (keep for content reference)
- **Brand tokens**: `TheKnot/website/src/lib/brandTokens.ts`
- **Design reference**: `TheKnot/website/design-reference/` (23 Canva slides)
- **Plan file**: `C:\Users\Mike Palmer\.claude\plans\indexed-snacking-patterson.md`

---

## GitHub Setup (Production Deployment)

For production with Keystatic GitHub mode:

1. Create new repo (e.g., `theknot-website`)
2. Update `keystatic.config.ts`:
   ```ts
   storage: {
     kind: 'github',
     repo: 'OWNER/theknot-website',
   }
   ```
3. Create GitHub OAuth app for Keystatic auth
4. Deploy to Cloudflare Pages
5. Configure `dev.climbtheknot.com` DNS

---

## Session Context

- **Branch**: mikes-ai-hub (or create new branch for this work)
- **Approach**: Hybrid - Claude Code built foundation, Ralph PRD handles page migration
- **User preference**: Brand colors editable via Keystatic admin
