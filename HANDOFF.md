# The Knot - Astro + Keystatic Migration Handoff

## Project Status: Phase 1 Complete

The foundation for the new Astro + Keystatic website has been built. The dev server runs and the Keystatic admin UI is accessible.

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

1. **Output Mode**: `static` with `prerender = false` on Keystatic routes
2. **Brand Colors**: CSS variables in `:root`, Tailwind references them via `var(--color-*)`
3. **React Islands**: HeaderMobile.tsx and Accordion.tsx use `client:load` / `client:visible`
4. **Fonts**: Loaded via @font-face in global.css

---

## How to Run

```bash
cd TheKnot/astro-site
npm run dev
```

- **Site**: http://127.0.0.1:4321/
- **Admin**: http://127.0.0.1:4321/keystatic

---

## What's Next (Phase 2 - Ralph PRD)

Create a Ralph PRD to migrate remaining pages:

### Page Migration Stories
- `KNOT-010`: Migrate About page
- `KNOT-011`: Migrate Membership page
- `KNOT-012`: Migrate New Climber page
- `KNOT-013`: Migrate Amenities page
- `KNOT-014`: Migrate Events listing page
- `KNOT-015`: Migrate Event detail page ([slug])
- `KNOT-016`: Migrate Shop page
- `KNOT-017`: Migrate Classes page

### Content Extraction Stories
- `KNOT-020`: Extract team member data from existing About page to `content/team/*.json`
- `KNOT-021`: Extract policies/accordion content to `content/policies/*.json`
- `KNOT-022`: Create sample event entries in `content/events/*.json`

### Acceptance Criteria Pattern
Each page story should:
1. Create the `.astro` page file
2. Use BaseLayout with appropriate title
3. Pull content from hardcoded defaults (Keystatic content optional)
4. Match visual structure of existing Next.js page
5. Be mobile responsive
6. Return 200 on dev server

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
