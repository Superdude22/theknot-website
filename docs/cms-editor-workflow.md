# The Knot CMS Editor Workflow

This guide is for staff who update content in Keystatic without touching front-end code.

## Open the CMS
- Local dev: `http://127.0.0.1:4325/keystatic`
- Production: `https://dev.climbtheknot.com/keystatic`

Local uses `storage.kind: local` (no GitHub login flow). Production uses GitHub auth.

## Image Workflow (Canva-style)
- All CMS image fields point to one media library: `public/images/canva-final`
- Pages, Team, Events, Products, and Not-ready cards include searchable **Media Library** selectors (`...LibraryPath`) for existing files.
- If an image is already connected, it should appear selected in the Media Library field.
- To replace an image:
1. Open the entry.
2. Prefer the Media Library field to select an existing file.
3. If needed, use the Upload field for a new file.
4. Save and publish.

## Shared Media Library
- Open `Media Assets` to browse a centralized index of files used across the site.
- Each media entry includes:
1. `Media File (Library)` path
2. Category (Home, About, Team, Events, etc.)
3. Optional alt text, tags, and notes
- Refresh this index any time new files are added:
`npm run cms:sync-media-assets`

## Brand Colors
- Brand colors now use palette pickers (dropdowns) instead of free-typed hex values.
- Colors are still stored as hex values behind the scenes for frontend CSS variables.

## Most Common Tasks
- Team member photo/title/order:
1. Open `Team Members`.
2. Select staff member.
3. Set `Team Section` (Leadership, Coordinators, or Desk Staff).
4. Update `Photo (Media Library)` or `Upload New Photo`.
5. Update `Role/Title`, `Display Order`.
6. Save.

- Event image workflow:
1. Open `Events`.
2. Set `Event Image (Media Library)` to choose an existing asset.
3. Use `Upload New Event Image` only when adding a new file.
4. Save.

- Team placement tip:
- Use `Team Section` for placement on the About page.
- `Role/Title` is display text only (it no longer controls placement).
- `Leadership Team (legacy)` exists for backward compatibility and can usually be left as-is.

- Event updates:
1. Open `Events`.
2. Edit `title`, `date`, `time`, `description`, `image`, and `registrationLink`.
3. Save.

- Home/About copy and hero images:
1. Open `Home Page` or `About Page`.
2. Update text fields and image fields.
3. Save.

## Safe Editing Rules
- Do not rename slugs unless you intend to change URLs/identifiers.
- Keep image files in the Canva media library unless there is a specific exception.
- Use `Display Order` fields for ordering instead of renaming files.
- Make one page/section change at a time, then verify on the live preview.

## Quick Verification
After saving content, check:
- Site: `http://127.0.0.1:4325/`
- Changed page renders correctly.
- Images and buttons still load.

## See What Is Connected
- Run `npm run cms:media-map` from `TheKnot/astro-site`.
- Review `TheKnot/astro-site/docs/cms-media-map.md` to see each content entry and its connected image file.

## Useful CMS Commands
- `npm run cms:fix-collection-images`: normalizes collection image paths so Keystatic detects connected files.
- `npm run cms:sync-library-paths`: backfills Media Library selector fields from existing image values.
- `npm run cms:sync-media-assets`: populates/refreshes the `Media Assets` collection from files in `public/images/canva-final`.
- `npm run cms:media-map`: generates a full content-to-image mapping report.
- `npm run cms:audit`: verifies key CMS connectivity (including About Core Values and FAQ list population).
