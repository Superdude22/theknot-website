import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const PUBLIC_DIR = path.join(ROOT, 'public');
const IMAGE_PREFIX = '/images/canva-final/';

const COLLECTIONS = [
  {
    dir: path.join(ROOT, 'src', 'content', 'team'),
    fields: [{ type: 'single', key: 'photo' }],
  },
  {
    dir: path.join(ROOT, 'src', 'content', 'events'),
    fields: [{ type: 'single', key: 'image' }],
  },
  {
    dir: path.join(ROOT, 'src', 'content', 'products'),
    fields: [{ type: 'array', key: 'images' }],
  },
  {
    dir: path.join(ROOT, 'src', 'content', 'not-ready-cards'),
    fields: [{ type: 'single', key: 'image' }],
  },
];

function toAbsoluteFromPublicPath(publicPathValue) {
  return path.join(PUBLIC_DIR, publicPathValue.replace(/^\//, ''));
}

function ensureDirFor(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

function migratePathForSlug(currentPath, slug) {
  if (typeof currentPath !== 'string') return { changed: false, value: currentPath };
  if (!currentPath.startsWith(IMAGE_PREFIX)) return { changed: false, value: currentPath };

  const slugPrefix = `${IMAGE_PREFIX}${slug}/`;
  if (currentPath.startsWith(slugPrefix)) return { changed: false, value: currentPath };

  const sourceAbsolute = toAbsoluteFromPublicPath(currentPath);
  if (!fs.existsSync(sourceAbsolute)) {
    return { changed: false, value: currentPath, warning: `Missing source asset: ${currentPath}` };
  }

  const filename = path.basename(currentPath);
  const targetPublicPath = `${slugPrefix}${filename}`;
  const targetAbsolute = toAbsoluteFromPublicPath(targetPublicPath);

  ensureDirFor(targetAbsolute);
  if (!fs.existsSync(targetAbsolute)) {
    fs.copyFileSync(sourceAbsolute, targetAbsolute);
  }

  return { changed: true, value: targetPublicPath };
}

let changedFiles = 0;
const warnings = [];

for (const collection of COLLECTIONS) {
  if (!fs.existsSync(collection.dir)) continue;

  const files = fs.readdirSync(collection.dir).filter((name) => name.endsWith('.json'));
  for (const fileName of files) {
    const filePath = path.join(collection.dir, fileName);
    const slug = path.basename(fileName, '.json');
    const raw = fs.readFileSync(filePath, 'utf8');

    let data;
    try {
      data = JSON.parse(raw);
    } catch {
      warnings.push(`Invalid JSON skipped: ${path.relative(ROOT, filePath).replace(/\\/g, '/')}`);
      continue;
    }

    let fileChanged = false;

    for (const field of collection.fields) {
      if (!(field.key in data)) continue;

      if (field.type === 'single') {
        const result = migratePathForSlug(data[field.key], slug);
        if (result.warning) warnings.push(`${path.relative(ROOT, filePath).replace(/\\/g, '/')} :: ${result.warning}`);
        if (result.changed) {
          data[field.key] = result.value;
          fileChanged = true;
        }
      }

      if (field.type === 'array' && Array.isArray(data[field.key])) {
        const next = [];
        for (const value of data[field.key]) {
          const result = migratePathForSlug(value, slug);
          if (result.warning) warnings.push(`${path.relative(ROOT, filePath).replace(/\\/g, '/')} :: ${result.warning}`);
          next.push(result.value);
          if (result.changed) fileChanged = true;
        }
        data[field.key] = next;
      }
    }

    if (fileChanged) {
      fs.writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
      changedFiles += 1;
    }
  }
}

console.log(`Updated collection entries: ${changedFiles}`);
if (warnings.length) {
  console.log('Warnings:');
  for (const warning of warnings) console.log(`- ${warning}`);
}
