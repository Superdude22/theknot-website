# CMS Enhancement Options

## 1. Media Library (WordPress-like selectable library)

**Current state:** `fields.pathReference()` — file browser filtered by glob pattern. Functional but not visual.

**Options:**

- **Custom Keystatic field component** — Use `fields.custom()` to build a React component showing a grid of image thumbnails from the `media-assets` collection, with search/filter by category and tags. Closest to a WordPress media modal. Meaningful custom React code but stays within Keystatic ecosystem.

- **External media management** — Tools like Cloudinary or Uploadcare have Keystatic-compatible integrations and provide full media library UIs. Adds external dependency.

## 2. Visual Color Picker

**Current state:** `fields.select()` with color name + hex dropdown list.

**Options:**

- **Custom field via `fields.custom()`** — Build a React component wrapping `react-colorful` (tiny, dependency-free). Renders brand color swatches plus free-pick option, stores hex value.

- Keystatic has no native color picker widget, so custom component is the only path.

## 3. Rich Text Editor (formatted text)

**Current state:** Mix of `fields.text({multiline: true})` (plain text) and `fields.document()` (full rich text for policies).

**Options:**

- **`fields.document()`** — Keystatic's built-in rich text editor. Supports bold, italic, links, headings, lists, dividers. Control formatting options per field.

- For fields needing basic formatting: `fields.document({ formatting: { inlineMarks: { bold: true, italic: true } }, links: true })` gives a constrained WYSIWYG editor.

- Simplest upgrade — just field type swaps from `text` to `document` with chosen formatting marks.

## Effort Assessment

- Rich text: simplest (field type swaps)
- Color picker: moderate (one custom component)
- Media library: most involved (custom React component with thumbnail grid, search, filtering)
