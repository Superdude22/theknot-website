import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const siteRoot = path.resolve(__dirname, '..');
const projectRoot = path.resolve(siteRoot, '..');

const failures = [];
const warnings = [];

function fail(message) {
  failures.push(message);
}

function warn(message) {
  warnings.push(message);
}

async function fileExists(targetPath) {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

async function listFilesRecursive(dirPath) {
  const output = [];
  const entries = await fs.readdir(dirPath, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      output.push(...(await listFilesRecursive(fullPath)));
    } else {
      output.push(fullPath);
    }
  }
  return output;
}

function hasPrefix(buffer, prefix) {
  if (buffer.length < prefix.length) return false;
  for (let index = 0; index < prefix.length; index += 1) {
    if (buffer[index] !== prefix[index]) return false;
  }
  return true;
}

function isLikelyHtml(buffer) {
  const head = buffer.slice(0, 256).toString('utf8').toLowerCase();
  return head.includes('<!doctype html') || head.includes('<html');
}

function looksLikePng(buffer) {
  return hasPrefix(buffer, [0x89, 0x50, 0x4e, 0x47]);
}

function looksLikeJpeg(buffer) {
  return hasPrefix(buffer, [0xff, 0xd8, 0xff]);
}

function looksLikeMp4(buffer) {
  return buffer.length > 12 && buffer.toString('ascii', 4, 8) === 'ftyp';
}

async function validateAssetFile(assetPath) {
  const ext = path.extname(assetPath).toLowerCase();
  const stats = await fs.stat(assetPath);
  const data = await fs.readFile(assetPath);

  if (isLikelyHtml(data)) {
    fail(`Asset appears to be HTML, not binary media: ${assetPath}`);
    return;
  }

  if (ext === '.png' && !looksLikePng(data)) {
    fail(`Invalid PNG signature: ${assetPath}`);
  }
  if ((ext === '.jpg' || ext === '.jpeg') && !looksLikeJpeg(data)) {
    fail(`Invalid JPEG signature: ${assetPath}`);
  }
  if (ext === '.mp4' && !looksLikeMp4(data)) {
    fail(`Invalid MP4 signature: ${assetPath}`);
  }

  if ((ext === '.png' || ext === '.jpg' || ext === '.jpeg') && stats.size < 1024) {
    warn(`Suspiciously small image file (${stats.size} bytes): ${assetPath}`);
  }
}

async function validateRoutesAndSource() {
  const canonicalPagePath = path.join(siteRoot, 'src', 'pages', 'new-climbers.astro');
  const legacyPagePath = path.join(siteRoot, 'src', 'pages', 'new-climber.astro');

  if (!(await fileExists(canonicalPagePath))) {
    fail('Missing canonical new climbers page: src/pages/new-climbers.astro');
  } else {
    const canonicalSource = await fs.readFile(canonicalPagePath, 'utf8');
    if (!canonicalSource.includes('/images/canva-final/newclimbers-hero-photo.jpg')) {
      fail('src/pages/new-climbers.astro must use /images/canva-final/newclimbers-hero-photo.jpg for the hero image.');
    }
  }

  if (!(await fileExists(legacyPagePath))) {
    fail('Missing legacy compatibility route: src/pages/new-climber.astro');
  } else {
    const legacySource = await fs.readFile(legacyPagePath, 'utf8');
    if (!legacySource.includes('/new-climbers')) {
      fail('Legacy route src/pages/new-climber.astro does not redirect to /new-climbers.');
    }
    if (legacySource.includes('<BaseLayout') || legacySource.includes('newclimbers-hero')) {
      fail('Legacy route src/pages/new-climber.astro contains full page content. It must be redirect-only.');
    }
  }

  const srcRoot = path.join(siteRoot, 'src');
  const srcFiles = await listFilesRecursive(srcRoot);
  const forbiddenChecks = [
    {
      pattern: 'hero-design-slide.png',
      message: 'Design-note screenshot asset is still referenced in production source.',
    },
    {
      pattern: 'OPTIONAL ANNOUNCEMENT BANNER',
      message: 'Red-note annotation text leaked into source content.',
    },
    {
      pattern: '/images/canva-final/newclimbers-facility-staff.png',
      message: 'Legacy black placeholder logo file still referenced.',
    },
    {
      pattern: '/images/canva-final/newclimbers-hero.png',
      message: 'Deprecated new climbers hero asset is still referenced. Use newclimbers-hero-photo.jpg.',
    },
  ];

  for (const filePath of srcFiles) {
    if (!filePath.endsWith('.astro') && !filePath.endsWith('.tsx') && !filePath.endsWith('.ts') && !filePath.endsWith('.json')) {
      continue;
    }

    const relPath = path.relative(siteRoot, filePath).replace(/\\/g, '/');
    if (relPath.startsWith('src/content/media-assets/')) {
      continue;
    }
    const source = await fs.readFile(filePath, 'utf8');

    const legacyRoutePattern = /\/new-climber(?!s)(?=[/"'#?]|$)/;
    if (relPath !== 'src/pages/new-climber.astro' && legacyRoutePattern.test(source)) {
      fail(`Legacy route token "/new-climber" found outside redirect page: ${relPath}`);
    }

    for (const check of forbiddenChecks) {
      if (source.includes(check.pattern)) {
        fail(`${check.message} (${relPath})`);
      }
    }
  }
}

async function validateCanvaAssets() {
  const canvaFinalDir = path.join(siteRoot, 'public', 'images', 'canva-final');
  if (!(await fileExists(canvaFinalDir))) {
    fail('Missing Canva asset directory: public/images/canva-final');
    return;
  }

  const requiredAssets = [
    'canva-hills-background.jpg',
    'newclimbers-hero-photo.jpg',
    'newclimbers-welcome.jpg',
    'newclimbers-daypass.jpg',
    'newclimbers-shoes.jpg',
  ];

  for (const fileName of requiredAssets) {
    const target = path.join(canvaFinalDir, fileName);
    if (!(await fileExists(target))) {
      fail(`Missing required Canva placeholder asset: public/images/canva-final/${fileName}`);
    }
  }

  const files = await fs.readdir(canvaFinalDir);
  for (const fileName of files) {
    const ext = path.extname(fileName).toLowerCase();
    if (!['.png', '.jpg', '.jpeg', '.mp4'].includes(ext)) continue;
    await validateAssetFile(path.join(canvaFinalDir, fileName));
  }
}

async function validateCanvaReports() {
  const summaryPath = path.join(projectRoot, 'reports', 'canva-api-exports', 'summary.json');
  if (!(await fileExists(summaryPath))) {
    warn('Missing Canva API export summary report: reports/canva-api-exports/summary.json');
    return;
  }

  try {
    const summary = JSON.parse(await fs.readFile(summaryPath, 'utf8'));
    const designCount = Array.isArray(summary.designs) ? summary.designs.length : 0;
    if (designCount < 8) {
      warn(`Canva summary has fewer than 8 designs (${designCount}).`);
    }
  } catch (error) {
    fail(`Unable to parse Canva export summary: ${error.message}`);
  }
}

async function validateHomeLayoutLock() {
  const homePagePath = path.join(siteRoot, 'src', 'pages', 'index.astro');
  if (!(await fileExists(homePagePath))) {
    fail('Missing Home page route: src/pages/index.astro');
    return;
  }

  const homeSource = await fs.readFile(homePagePath, 'utf8');
  const requiredHomeMarkers = [
    '<section class="membership-section">',
    '<section class="policies-section">',
    '<section class="not-ready-section">',
    '<section class="coc-section">',
    'RATES & POLICIES',
  ];
  for (const marker of requiredHomeMarkers) {
    if (!homeSource.includes(marker)) {
      fail(`Home page is missing required Canva section marker: ${marker}`);
    }
  }

  if (homeSource.includes('<ThreeCardSection')) {
    fail('Home page still uses ThreeCardSection abstraction. Use the locked Canva card layout markup.');
  }

  const footerPath = path.join(siteRoot, 'src', 'components', 'Footer.astro');
  if (!(await fileExists(footerPath))) {
    fail('Missing footer component: src/components/Footer.astro');
  } else {
    const footerSource = await fs.readFile(footerPath, 'utf8');
    if (!footerSource.includes('/images/canva-final/logo.png')) {
      fail('Footer is not using the Canva white logo asset (/images/canva-final/logo.png).');
    }
    if (footerSource.includes('var(--color-deep-water')) {
      fail('Footer background is still tied to deep-water token. Footer must stay locked to black for Canva fidelity.');
    }
  }

  const cardsDir = path.join(siteRoot, 'src', 'content', 'not-ready-cards');
  if (!(await fileExists(cardsDir))) {
    fail('Missing not-ready-cards content directory.');
    return;
  }

  const entries = (await fs.readdir(cardsDir)).filter((name) => name.endsWith('.json'));
  if (entries.length < 3) {
    fail(`Expected at least 3 not-ready card entries; found ${entries.length}.`);
    return;
  }

  for (const entryName of entries) {
    const entryPath = path.join(cardsDir, entryName);
    const entry = JSON.parse(await fs.readFile(entryPath, 'utf8'));
    if (!entry.image && !entry.imageLibraryPath) {
      fail(`Not-ready card entry is missing an image reference: src/content/not-ready-cards/${entryName}`);
    }
  }
}

async function run() {
  await validateRoutesAndSource();
  await validateCanvaAssets();
  await validateCanvaReports();
  await validateHomeLayoutLock();

  if (warnings.length > 0) {
    console.log('Canva fidelity warnings:');
    for (const message of warnings) {
      console.log(`  - ${message}`);
    }
  }

  if (failures.length > 0) {
    console.error('Canva fidelity validation failed:');
    for (const message of failures) {
      console.error(`  - ${message}`);
    }
    process.exit(1);
  }

  console.log('Canva fidelity validation passed.');
}

await run();
