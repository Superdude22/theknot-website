import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const CONTENT_ROOT = path.join(ROOT, 'src', 'content');

function toLibraryPath(value) {
  if (typeof value !== 'string' || !value.trim()) return undefined;
  if (value.startsWith('public/')) return value;
  if (value.startsWith('/')) return `public${value}`;
  return value;
}

function isUnset(value) {
  if (value === undefined || value === null) return true;
  if (typeof value === 'string' && !value.trim()) return true;
  if (Array.isArray(value) && value.length === 0) return true;
  return false;
}

function getPathValue(target, dotPath) {
  const keys = dotPath.split('.');
  let current = target;
  for (const key of keys) {
    if (!current || typeof current !== 'object') return undefined;
    current = current[key];
  }
  return current;
}

function setPathValue(target, dotPath, value) {
  const keys = dotPath.split('.');
  let current = target;
  for (let index = 0; index < keys.length - 1; index += 1) {
    const key = keys[index];
    if (!current[key] || typeof current[key] !== 'object') {
      current[key] = {};
    }
    current = current[key];
  }
  current[keys[keys.length - 1]] = value;
}

function syncField(data, sourcePath, targetPath) {
  const sourceValue = toLibraryPath(getPathValue(data, sourcePath));
  const targetValue = getPathValue(data, targetPath);
  if (!sourceValue || !isUnset(targetValue)) return false;
  setPathValue(data, targetPath, sourceValue);
  return true;
}

function syncArrayField(data, sourcePath, targetPath) {
  const sourceValue = getPathValue(data, sourcePath);
  const targetValue = getPathValue(data, targetPath);
  if (!Array.isArray(sourceValue) || !isUnset(targetValue)) return false;

  const mapped = sourceValue
    .map((entry) => toLibraryPath(entry))
    .filter((entry) => typeof entry === 'string' && entry.trim().length > 0);

  if (mapped.length === 0) return false;
  setPathValue(data, targetPath, mapped);
  return true;
}

function syncArrayObjectField(data, arrayPath, sourceKey, targetKey) {
  const arrayValue = getPathValue(data, arrayPath);
  if (!Array.isArray(arrayValue)) return false;

  let changed = false;
  for (const entry of arrayValue) {
    if (!entry || typeof entry !== 'object') continue;
    const sourceValue = toLibraryPath(entry[sourceKey]);
    if (!sourceValue || !isUnset(entry[targetKey])) continue;
    entry[targetKey] = sourceValue;
    changed = true;
  }

  return changed;
}

function collectJsonFiles(dir, output = []) {
  if (!fs.existsSync(dir)) return output;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      collectJsonFiles(fullPath, output);
    } else if (entry.isFile() && entry.name.endsWith('.json')) {
      output.push(fullPath);
    }
  }
  return output;
}

const files = collectJsonFiles(CONTENT_ROOT);
let changedFiles = 0;
const changedByScope = {
  team: 0,
  events: 0,
  pages: 0,
  products: 0,
  cards: 0,
  other: 0,
};

for (const filePath of files) {
  const raw = fs.readFileSync(filePath, 'utf8');
  let data;
  try {
    data = JSON.parse(raw);
  } catch {
    continue;
  }

  let changed = false;

  changed = syncField(data, 'photo', 'photoLibraryPath') || changed;
  changed = syncField(data, 'image', 'imageLibraryPath') || changed;

  changed = syncField(data, 'hero.backgroundImage', 'hero.backgroundImageLibraryPath') || changed;
  changed = syncField(data, 'hero.backgroundVideo', 'hero.backgroundVideoLibraryPath') || changed;
  changed = syncField(data, 'membership.image', 'membership.imageLibraryPath') || changed;
  changed = syncField(data, 'pricing.image', 'pricing.imageLibraryPath') || changed;
  changed = syncField(data, 'benefitsImage', 'benefitsImageLibraryPath') || changed;
  changed = syncField(data, 'welcome.image', 'welcome.imageLibraryPath') || changed;
  changed = syncField(data, 'dayPass.image', 'dayPass.imageLibraryPath') || changed;

  changed = syncArrayObjectField(data, 'activityCards', 'image', 'imageLibraryPath') || changed;
  changed = syncArrayObjectField(data, 'amenityCards', 'image', 'imageLibraryPath') || changed;
  changed = syncArrayField(data, 'images', 'imageLibraryPaths') || changed;

  if (!changed) continue;

  fs.writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
  changedFiles += 1;

  const relPath = path.relative(ROOT, filePath).replace(/\\/g, '/');
  if (relPath.startsWith('src/content/team/')) changedByScope.team += 1;
  else if (relPath.startsWith('src/content/events/')) changedByScope.events += 1;
  else if (relPath.startsWith('src/content/pages/')) changedByScope.pages += 1;
  else if (relPath.startsWith('src/content/products/')) changedByScope.products += 1;
  else if (relPath.startsWith('src/content/not-ready-cards/')) changedByScope.cards += 1;
  else changedByScope.other += 1;
}

console.log(`Synced files: ${changedFiles}`);
console.log(`  Team entries: ${changedByScope.team}`);
console.log(`  Event entries: ${changedByScope.events}`);
console.log(`  Page files: ${changedByScope.pages}`);
console.log(`  Product files: ${changedByScope.products}`);
console.log(`  Not-ready card files: ${changedByScope.cards}`);
