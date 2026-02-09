import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const CONTENT_ROOT = path.join(ROOT, 'src', 'content');
const OUTPUT_PATH = path.join(ROOT, 'docs', 'cms-media-map.md');

function collectJsonFiles(dir, files = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      collectJsonFiles(fullPath, files);
      continue;
    }
    if (entry.isFile() && entry.name.endsWith('.json')) {
      files.push(fullPath);
    }
  }
  return files;
}

function addMediaHit(hits, filePath, keyPath, value) {
  const relFile = path.relative(ROOT, filePath).replace(/\\/g, '/');
  if (typeof value !== 'string') return;

  if (value.startsWith('/images/')) {
    hits.push({ file: relFile, field: keyPath, image: value });
    return;
  }

  if (value.startsWith('public/images/')) {
    hits.push({ file: relFile, field: keyPath, image: `/${value.slice('public/'.length)}` });
  }
}

function walkValue(hits, filePath, keyPath, value) {
  if (typeof value === 'string') {
    addMediaHit(hits, filePath, keyPath, value);
    return;
  }

  if (Array.isArray(value)) {
    value.forEach((item, index) => {
      walkValue(hits, filePath, `${keyPath}[${index}]`, item);
    });
    return;
  }

  if (value && typeof value === 'object') {
    for (const [childKey, childValue] of Object.entries(value)) {
      const nextPath = keyPath ? `${keyPath}.${childKey}` : childKey;
      walkValue(hits, filePath, nextPath, childValue);
    }
  }
}

const files = collectJsonFiles(CONTENT_ROOT);
const hits = [];

for (const filePath of files) {
  const raw = fs.readFileSync(filePath, 'utf8');
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    continue;
  }
  walkValue(hits, filePath, '', parsed);
}

hits.sort((a, b) => {
  if (a.file !== b.file) return a.file.localeCompare(b.file);
  if (a.field !== b.field) return a.field.localeCompare(b.field);
  return a.image.localeCompare(b.image);
});

const lines = [];
lines.push('# CMS Media Map');
lines.push('');
lines.push('Generated from `src/content/**/*.json`.');
lines.push('');
lines.push(`Total image references: **${hits.length}**`);
lines.push('');
lines.push('| Content File | Field | Connected Image |');
lines.push('|---|---|---|');

for (const hit of hits) {
  lines.push(`| \`${hit.file}\` | \`${hit.field}\` | \`${hit.image}\` |`);
}

lines.push('');
lines.push('## Notes');
lines.push('- This report helps confirm which CMS entries are wired to which image files.');
lines.push('- Regenerate after content updates: `npm run cms:media-map`.');

fs.writeFileSync(OUTPUT_PATH, `${lines.join('\n')}\n`, 'utf8');
console.log(`Wrote media map: ${path.relative(ROOT, OUTPUT_PATH).replace(/\\/g, '/')}`);
