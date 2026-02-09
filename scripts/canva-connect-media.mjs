import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { spawnSync } from 'node:child_process';

const ROOT = process.cwd();
const API_BASE = 'https://api.canva.com/rest/v1';
const OAUTH_TOKEN_URL = `${API_BASE}/oauth/token`;
const DEFAULT_MEDIA_DIR = 'public/images/canva-final';

const TOKEN_PATH_CANDIDATES = ['.canva-tokens.json', '../website/.canva-tokens.json', '../.canva-tokens.json'];
const ENV_PATH_CANDIDATES = ['.env', '../website/.env', '../.env'];

const PRESETS = {
  'footer-logo': {
    description: 'Replace footer logo file used by Footer.astro',
    out: 'public/images/canva-final/logo.png',
    wires: [],
  },
  'home-hero-bg': {
    description: 'Home hero background image',
    out: 'public/images/canva-final/home-hero-bg.jpg',
    wires: ['src/content/pages/home.json:hero.backgroundImageLibraryPath'],
  },
  'home-membership-image': {
    description: 'Home membership section image',
    out: 'public/images/canva-final/home-membership-cta.jpg',
    wires: ['src/content/pages/home.json:membership.imageLibraryPath'],
  },
  'home-card-day-passes': {
    description: 'Home not-ready card: day passes',
    out: 'public/images/canva-final/home-card-day-passes.jpg',
    wires: ['src/content/not-ready-cards/day-passes.json:imageLibraryPath'],
  },
  'home-card-private-belayer': {
    description: 'Home not-ready card: private belayer',
    out: 'public/images/canva-final/home-card-private-belayer.jpg',
    wires: ['src/content/not-ready-cards/private-belayer.json:imageLibraryPath'],
  },
  'home-card-intro-to-climbing': {
    description: 'Home not-ready card: intro to climbing',
    out: 'public/images/canva-final/home-card-intro-climbing.jpg',
    wires: ['src/content/not-ready-cards/intro-to-climbing.json:imageLibraryPath'],
  },
  'new-climbers-hero': {
    description: 'New climbers hero background image',
    out: 'public/images/canva-final/newclimbers-hero-photo.jpg',
    wires: ['src/content/pages/new-climbers.json:hero.backgroundImageLibraryPath'],
  },
  'new-climbers-welcome-image': {
    description: 'New climbers welcome section image',
    out: 'public/images/canva-final/newclimbers-welcome.jpg',
    wires: ['src/content/pages/new-climbers.json:welcome.imageLibraryPath'],
  },
  'new-climbers-day-pass-image': {
    description: 'New climbers day pass section image',
    out: 'public/images/canva-final/newclimbers-daypass.jpg',
    wires: ['src/content/pages/new-climbers.json:dayPass.imageLibraryPath'],
  },
  'membership-hero-bg': {
    description: 'Membership page hero background image',
    out: 'public/images/canva-final/membership-hero-bg.jpg',
    wires: ['src/content/pages/membership.json:hero.backgroundImageLibraryPath'],
  },
  'membership-pricing-image': {
    description: 'Membership page pricing image',
    out: 'public/images/canva-final/membership-wall-gear.jpg',
    wires: ['src/content/pages/membership.json:pricing.imageLibraryPath'],
  },
};

function logHelp() {
  console.log(`
Canva Connect Media Utility

Usage:
  node scripts/canva-connect-media.mjs <command> [options]

Commands:
  search-assets    Search Canva uploaded image assets by name
  pull-asset       Download a Canva uploaded image by --id or --name
  export-design    Create a Canva export job and optionally download result(s)
  presets          List available wiring presets
  help             Show this help

Common options:
  --name <value>                   Asset name (for pull-asset)
  --id <value>                     Asset id (for pull-asset)
  --query <value>                  Search query (for search-assets)
  --folders <uploads,root>         Folders to search (default: uploads,root)
  --limit <number>                 Max results (default: 25)
  --out <path>                     Output file path (or directory for multi-file exports)
  --overwrite <true|false>         Overwrite existing file (default: false)
  --wire <file.json:dot.path>      Set a Keystatic JSON field to downloaded library path (repeatable)
  --preset <preset-name>           Apply preset output path + wire targets
  --sync <true|false>              Run CMS media sync scripts after download (default: true)
  --media-map <true|false>         Regenerate docs/cms-media-map.md after download (default: true)
  --url-only <true|false>          Print signed URL only, skip file download (default: false)
  --mirror-public-field <true|false>
                                   Also set matching non-library field (default: true)

Export options (export-design):
  --design <design-id>             Canva design id (required)
  --format <png|jpg|pdf|gif|mp4|pptx>
                                   Export format (default: png)
  --pages <1,2,3>                  Optional comma-separated page numbers
  --width <px>                     Optional export width for png/jpg/gif
  --height <px>                    Optional export height for png/jpg/gif
  --quality <value>                jpg quality (40-100) or mp4 quality enum
  --download <true|false>          Download export URLs (default: true)

Examples:
  node scripts/canva-connect-media.mjs search-assets --query "logo"
  node scripts/canva-connect-media.mjs pull-asset --name "Logo Square (Manatee).png" --preset footer-logo --overwrite true
  node scripts/canva-connect-media.mjs pull-asset --name "home-card-private-belayer.jpg" --preset home-card-private-belayer
  node scripts/canva-connect-media.mjs export-design --design DAG_oE5IAGg --format png --pages 1 --out tmp/canva-export/home-1.png
`);
}

function parseArgs(argv) {
  const [command = 'help', ...rest] = argv;
  const flags = new Map();
  const positionals = [];

  for (let index = 0; index < rest.length; index += 1) {
    const token = rest[index];
    if (!token.startsWith('--')) {
      positionals.push(token);
      continue;
    }

    const eqIndex = token.indexOf('=');
    const key = token.slice(2, eqIndex === -1 ? undefined : eqIndex);
    let value;

    if (eqIndex !== -1) {
      value = token.slice(eqIndex + 1);
    } else {
      const next = rest[index + 1];
      if (next && !next.startsWith('--')) {
        value = next;
        index += 1;
      } else {
        value = 'true';
      }
    }

    if (!flags.has(key)) {
      flags.set(key, value);
      continue;
    }

    const current = flags.get(key);
    if (Array.isArray(current)) {
      current.push(value);
      continue;
    }
    flags.set(key, [current, value]);
  }

  return { command, flags, positionals };
}

function getFlag(flags, key, defaultValue = undefined) {
  if (!flags.has(key)) return defaultValue;
  const value = flags.get(key);
  return Array.isArray(value) ? value[value.length - 1] : value;
}

function getFlagList(flags, key) {
  if (!flags.has(key)) return [];
  const value = flags.get(key);
  return Array.isArray(value) ? value : [value];
}

function parseBoolean(rawValue, defaultValue) {
  if (rawValue === undefined || rawValue === null) return defaultValue;
  const value = String(rawValue).trim().toLowerCase();
  if (['1', 'true', 'yes', 'on'].includes(value)) return true;
  if (['0', 'false', 'no', 'off'].includes(value)) return false;
  return defaultValue;
}

function parseInteger(rawValue, label) {
  if (rawValue === undefined || rawValue === null || String(rawValue).trim().length === 0) return undefined;
  const parsed = Number.parseInt(String(rawValue), 10);
  if (Number.isNaN(parsed)) {
    throw new Error(`Invalid integer for ${label}: ${rawValue}`);
  }
  return parsed;
}

function parseCsv(rawValue) {
  if (!rawValue || typeof rawValue !== 'string') return [];
  return rawValue
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function toPosix(filePath) {
  return filePath.replace(/\\/g, '/');
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 100);
}

function parseEnvText(text) {
  const output = {};
  const lines = text.split(/\r?\n/);
  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const splitIndex = line.indexOf('=');
    if (splitIndex < 0) continue;
    const key = line.slice(0, splitIndex).trim();
    let value = line.slice(splitIndex + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    output[key] = value;
  }
  return output;
}

function resolveFirstExisting(candidates) {
  for (const candidate of candidates) {
    const absolutePath = path.resolve(ROOT, candidate);
    if (fs.existsSync(absolutePath)) {
      return absolutePath;
    }
  }
  return null;
}

function ensureDirForFile(absoluteFilePath) {
  const dir = path.dirname(absoluteFilePath);
  fs.mkdirSync(dir, { recursive: true });
}

async function downloadToFile(url, absoluteFilePath, overwrite = false) {
  if (fs.existsSync(absoluteFilePath) && !overwrite) {
    throw new Error(`File already exists: ${toPosix(path.relative(ROOT, absoluteFilePath))} (use --overwrite true)`);
  }

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download ${url} (${response.status} ${response.statusText})`);
  }

  const contentType = (response.headers.get('content-type') || '').toLowerCase();
  if (contentType.includes('text/html')) {
    throw new Error(`Received HTML instead of media for URL: ${url}`);
  }

  const payload = Buffer.from(await response.arrayBuffer());
  ensureDirForFile(absoluteFilePath);
  fs.writeFileSync(absoluteFilePath, payload);

  return {
    bytes: payload.length,
    contentType,
  };
}

function tokenizeDotPath(dotPath) {
  const tokens = [];
  const chunks = dotPath.split('.');
  for (const chunk of chunks) {
    const regex = /([^[\]]+)|\[(\d+)\]/g;
    let match;
    while ((match = regex.exec(chunk)) !== null) {
      if (match[1] !== undefined) tokens.push(match[1]);
      if (match[2] !== undefined) tokens.push(Number.parseInt(match[2], 10));
    }
  }
  if (tokens.length === 0) {
    throw new Error(`Invalid dot path: ${dotPath}`);
  }
  return tokens;
}

function setDeepValue(target, dotPath, value) {
  const tokens = tokenizeDotPath(dotPath);
  let current = target;

  for (let index = 0; index < tokens.length - 1; index += 1) {
    const token = tokens[index];
    const nextToken = tokens[index + 1];
    if (typeof token === 'number') {
      if (!Array.isArray(current)) {
        throw new Error(`Path segment expects array but found object at: ${dotPath}`);
      }
      if (current[token] === undefined || current[token] === null) {
        current[token] = typeof nextToken === 'number' ? [] : {};
      }
      current = current[token];
      continue;
    }

    if (current[token] === undefined || current[token] === null) {
      current[token] = typeof nextToken === 'number' ? [] : {};
    }
    current = current[token];
  }

  const lastToken = tokens[tokens.length - 1];
  if (typeof lastToken === 'number') {
    if (!Array.isArray(current)) {
      throw new Error(`Path segment expects array at end of path: ${dotPath}`);
    }
    current[lastToken] = value;
    return;
  }
  current[lastToken] = value;
}

function parseWireTarget(rawTarget) {
  const splitIndex = rawTarget.lastIndexOf(':');
  if (splitIndex <= 0 || splitIndex >= rawTarget.length - 1) {
    throw new Error(`Invalid wire target: ${rawTarget}. Expected <file.json:dot.path>`);
  }
  return {
    filePath: rawTarget.slice(0, splitIndex),
    dotPath: rawTarget.slice(splitIndex + 1),
  };
}

function toPublicUrl(libraryPath) {
  if (!libraryPath.startsWith('public/')) return libraryPath;
  return `/${libraryPath.slice('public/'.length)}`;
}

function runNodeScript(scriptRelPath) {
  const scriptAbsPath = path.resolve(ROOT, scriptRelPath);
  const result = spawnSync('node', [scriptAbsPath], {
    cwd: ROOT,
    stdio: 'inherit',
    windowsHide: true,
  });
  if (result.status !== 0) {
    throw new Error(`Post-sync script failed: ${scriptRelPath}`);
  }
}

class CanvaConnectClient {
  constructor() {
    this.tokensPath = resolveFirstExisting(TOKEN_PATH_CANDIDATES);
    this.envPath = resolveFirstExisting(ENV_PATH_CANDIDATES);

    if (!this.tokensPath) {
      throw new Error(
        `No Canva token file found. Checked: ${TOKEN_PATH_CANDIDATES.join(', ')}. Run Canva OAuth setup first.`
      );
    }

    this.tokens = JSON.parse(fs.readFileSync(this.tokensPath, 'utf8'));
    if (!this.tokens?.access_token) {
      throw new Error(`Token file missing access_token: ${toPosix(this.tokensPath)}`);
    }

    this.env = {};
    if (this.envPath) {
      this.env = parseEnvText(fs.readFileSync(this.envPath, 'utf8'));
    }
  }

  canRefresh() {
    return Boolean(
      this.tokens?.refresh_token && this.env?.CANVA_CLIENT_ID && this.env?.CANVA_CLIENT_SECRET
    );
  }

  async refreshAccessToken() {
    if (!this.canRefresh()) {
      throw new Error(
        `Cannot refresh token. Ensure refresh_token in ${toPosix(
          this.tokensPath
        )} and CANVA_CLIENT_ID/CANVA_CLIENT_SECRET in .env.`
      );
    }

    const params = new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: this.tokens.refresh_token,
      client_id: this.env.CANVA_CLIENT_ID,
      client_secret: this.env.CANVA_CLIENT_SECRET,
    });

    const response = await fetch(OAUTH_TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });
    const payloadText = await response.text();
    let payload = {};
    try {
      payload = JSON.parse(payloadText);
    } catch {
      throw new Error(`Failed to parse token refresh response (${response.status}): ${payloadText}`);
    }

    if (!response.ok) {
      throw new Error(`Token refresh failed (${response.status}): ${payloadText}`);
    }

    this.tokens = {
      ...payload,
      obtained_at: new Date().toISOString(),
    };
    fs.writeFileSync(this.tokensPath, `${JSON.stringify(this.tokens, null, 2)}\n`, 'utf8');
  }

  async apiJson(endpoint, options = {}, retried = false) {
    const method = options.method || 'GET';
    const response = await fetch(`${API_BASE}${endpoint}`, {
      method,
      headers: {
        Authorization: `Bearer ${this.tokens.access_token}`,
        ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
    });

    const rawText = await response.text();
    let payload;
    try {
      payload = rawText.length ? JSON.parse(rawText) : {};
    } catch {
      throw new Error(`Failed to parse Canva response for ${method} ${endpoint}: ${rawText}`);
    }

    if (!response.ok) {
      if (response.status === 401 && !retried && this.canRefresh()) {
        await this.refreshAccessToken();
        return this.apiJson(endpoint, options, true);
      }
      const errorMessage = payload?.message || rawText || `${response.status} ${response.statusText}`;
      throw new Error(`Canva API ${method} ${endpoint} failed (${response.status}): ${errorMessage}`);
    }

    return payload;
  }

  async listFolderImages(folderId, maxResults = 100) {
    const items = [];
    let continuation = null;

    while (items.length < maxResults) {
      const remaining = Math.max(1, Math.min(100, maxResults - items.length));
      const query = new URLSearchParams({
        item_types: 'image',
        limit: String(remaining),
      });
      if (continuation) query.set('continuation', continuation);

      const payload = await this.apiJson(`/folders/${folderId}/items?${query.toString()}`);
      const pageItems = Array.isArray(payload.items) ? payload.items : [];
      for (const item of pageItems) {
        if (!item?.image?.id) continue;
        items.push({
          folderId,
          id: item.image.id,
          name: item.image.name || '',
          type: item.image.type || 'image',
          thumbnailUrl: item.image.thumbnail?.url || '',
          thumbnailWidth: item.image.thumbnail?.width,
          thumbnailHeight: item.image.thumbnail?.height,
          raw: item.image,
        });
      }

      continuation = payload.continuation || null;
      if (!continuation) break;
    }

    return items;
  }

  async searchAssets(query, options = {}) {
    const folders = options.folders?.length ? options.folders : ['uploads', 'root'];
    const perFolder = Math.max(1, Math.min(1000, options.perFolder || 300));
    const requestedLimit = Math.max(1, options.limit || 25);
    const normalizedQuery = (query || '').trim().toLowerCase();

    const merged = [];
    const seenIds = new Set();

    for (const folderId of folders) {
      const folderItems = await this.listFolderImages(folderId, perFolder);
      for (const item of folderItems) {
        if (seenIds.has(item.id)) continue;
        seenIds.add(item.id);
        merged.push(item);
      }
    }

    let filtered = merged;
    if (normalizedQuery) {
      filtered = merged.filter((item) => item.name.toLowerCase().includes(normalizedQuery));
    }

    filtered.sort((a, b) => a.name.localeCompare(b.name));
    return filtered.slice(0, requestedLimit);
  }

  async findAssetByName(name, options = {}) {
    const folders = options.folders?.length ? options.folders : ['uploads', 'root'];
    const normalizedName = name.trim().toLowerCase();
    if (!normalizedName) {
      throw new Error('Asset name cannot be empty.');
    }

    const candidates = await this.searchAssets(name, {
      folders,
      perFolder: 500,
      limit: 1000,
    });

    if (candidates.length === 0) return null;

    const exactMatches = candidates.filter((item) => item.name.toLowerCase() === normalizedName);
    if (exactMatches.length > 0) {
      return {
        chosen: exactMatches[0],
        exactMatches,
        allMatches: candidates,
      };
    }

    return {
      chosen: candidates[0],
      exactMatches: [],
      allMatches: candidates,
    };
  }

  async getAsset(assetId) {
    const payload = await this.apiJson(`/assets/${assetId}`);
    if (!payload?.asset?.id) {
      throw new Error(`Asset response missing asset payload for ${assetId}`);
    }
    return payload.asset;
  }

  async createExportJob(exportBody) {
    const payload = await this.apiJson('/exports', {
      method: 'POST',
      body: exportBody,
    });
    if (!payload?.job?.id) {
      throw new Error('Create export job response missing job id.');
    }
    return payload.job;
  }

  async getExportJob(jobId) {
    const payload = await this.apiJson(`/exports/${jobId}`);
    return payload.job;
  }

  async waitForExport(jobId, options = {}) {
    const maxAttempts = options.maxAttempts || 60;
    const intervalMs = options.intervalMs || 1500;

    let job = null;
    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
      job = await this.getExportJob(jobId);
      if (job.status === 'success' || job.status === 'failed') return job;
      await sleep(intervalMs);
    }

    throw new Error(`Timed out waiting for export job ${jobId} after ${maxAttempts} attempts.`);
  }
}

function printAssets(items) {
  if (!items.length) {
    console.log('No matching image assets found.');
    return;
  }

  console.log(`Found ${items.length} matching image asset(s):`);
  for (const item of items) {
    const dims =
      item.thumbnailWidth && item.thumbnailHeight ? `${item.thumbnailWidth}x${item.thumbnailHeight}` : 'unknown';
    console.log(`- ${item.name}`);
    console.log(`  id: ${item.id}`);
    console.log(`  folder: ${item.folderId}`);
    console.log(`  thumb: ${dims}`);
    console.log(`  url: ${item.thumbnailUrl || '(none)'}`);
  }
}

function resolveOutputPath(outFlag, fallbackFileName) {
  const candidate = outFlag || path.join(DEFAULT_MEDIA_DIR, fallbackFileName);
  const absolute = path.isAbsolute(candidate) ? candidate : path.resolve(ROOT, candidate);

  if (fs.existsSync(absolute) && fs.statSync(absolute).isDirectory()) {
    return path.join(absolute, fallbackFileName);
  }

  if (candidate.endsWith('/') || candidate.endsWith('\\')) {
    return path.join(absolute, fallbackFileName);
  }

  return absolute;
}

function asRelativePosix(absolutePath) {
  return toPosix(path.relative(ROOT, absolutePath));
}

function applyWireTargets(options) {
  const {
    wireTargets,
    libraryPath,
    mirrorPublicField,
  } = options;

  if (!wireTargets.length) return;

  if (!libraryPath.startsWith('public/')) {
    throw new Error(
      `Cannot wire non-public file path (${libraryPath}). Download into public/ first or skip --wire.`
    );
  }

  const publicUrl = toPublicUrl(libraryPath);

  for (const rawWireTarget of wireTargets) {
    const wire = parseWireTarget(rawWireTarget);
    const absoluteFilePath = path.isAbsolute(wire.filePath)
      ? wire.filePath
      : path.resolve(ROOT, wire.filePath);

    if (!fs.existsSync(absoluteFilePath)) {
      throw new Error(`Wire target file does not exist: ${toPosix(absoluteFilePath)}`);
    }

    const raw = fs.readFileSync(absoluteFilePath, 'utf8');
    const parsed = JSON.parse(raw);
    setDeepValue(parsed, wire.dotPath, libraryPath);

    if (mirrorPublicField && wire.dotPath.endsWith('LibraryPath')) {
      const plainField = wire.dotPath.slice(0, -'LibraryPath'.length);
      if (plainField) {
        setDeepValue(parsed, plainField, publicUrl);
      }
    }

    fs.writeFileSync(absoluteFilePath, `${JSON.stringify(parsed, null, 2)}\n`, 'utf8');
    console.log(`Wired ${toPosix(path.relative(ROOT, absoluteFilePath))}:${wire.dotPath}`);
  }
}

function runPostSync(shouldRunMediaMap) {
  runNodeScript('./scripts/sync-media-assets-collection.mjs');
  if (shouldRunMediaMap) {
    runNodeScript('./scripts/generate-cms-media-map.mjs');
  }
}

function collectPresetWires(presetName) {
  if (!presetName) return [];
  const preset = PRESETS[presetName];
  if (!preset) {
    throw new Error(`Unknown preset: ${presetName}. Use "presets" command to list available values.`);
  }
  return preset.wires || [];
}

function collectFolders(flags) {
  const raw = getFlag(flags, 'folders', 'uploads,root');
  const folders = parseCsv(raw)
    .map((folder) => folder.toLowerCase())
    .filter((folder) => folder === 'uploads' || folder === 'root');
  return folders.length ? folders : ['uploads', 'root'];
}

async function commandSearchAssets(flags, client) {
  const query = getFlag(flags, 'query', '');
  const limit = parseInteger(getFlag(flags, 'limit', '25'), '--limit') || 25;
  const folders = collectFolders(flags);
  const items = await client.searchAssets(query, { folders, limit, perFolder: 500 });
  printAssets(items);
}

async function commandPullAsset(flags, client) {
  const presetName = getFlag(flags, 'preset');
  const preset = presetName ? PRESETS[presetName] : null;
  if (presetName && !preset) {
    throw new Error(`Unknown preset: ${presetName}. Use "presets" to list valid values.`);
  }

  const folders = collectFolders(flags);
  const byId = getFlag(flags, 'id');
  const byName = getFlag(flags, 'name');

  if (!byId && !byName) {
    throw new Error('pull-asset requires --id <asset-id> or --name <asset-name>.');
  }

  let chosenId = byId;
  if (!chosenId) {
    const lookup = await client.findAssetByName(byName, { folders });
    if (!lookup) {
      throw new Error(`No Canva image asset found matching name: ${byName}`);
    }
    chosenId = lookup.chosen.id;

    if (lookup.exactMatches.length > 1) {
      console.log(`Note: found ${lookup.exactMatches.length} exact matches for "${byName}". Using first result: ${lookup.chosen.id}`);
    } else if (lookup.exactMatches.length === 0) {
      console.log(`Note: no exact name match for "${byName}". Using closest match: ${lookup.chosen.name} (${lookup.chosen.id})`);
    }
  }

  const asset = await client.getAsset(chosenId);
  const signedUrl = asset?.thumbnail?.url;
  if (!signedUrl) {
    throw new Error(`Asset ${chosenId} does not include a downloadable thumbnail URL.`);
  }

  console.log(`Resolved asset: ${asset.name} (${asset.id})`);
  console.log(`Canva URL (expires quickly): ${signedUrl}`);

  const urlOnly = parseBoolean(getFlag(flags, 'url-only'), false);
  if (urlOnly) return;

  const rawName = asset.name || `asset-${asset.id}`;
  const ext = path.extname(rawName) || '.png';
  const fallbackFileName = `${slugify(path.basename(rawName, ext))}${ext.toLowerCase()}`;
  const outputFlag = getFlag(flags, 'out', preset?.out);
  const outputAbsolute = resolveOutputPath(outputFlag, fallbackFileName);
  const overwrite = parseBoolean(getFlag(flags, 'overwrite'), false);

  const downloadInfo = await downloadToFile(signedUrl, outputAbsolute, overwrite);
  const relativeOutput = asRelativePosix(outputAbsolute);
  console.log(`Downloaded: ${relativeOutput} (${downloadInfo.bytes} bytes, ${downloadInfo.contentType || 'unknown content-type'})`);

  const presetWires = collectPresetWires(presetName);
  const cliWires = getFlagList(flags, 'wire');
  const wireTargets = [...presetWires, ...cliWires];
  const mirrorPublicField = parseBoolean(getFlag(flags, 'mirror-public-field'), true);

  const libraryPath = relativeOutput.startsWith('public/')
    ? relativeOutput
    : toPosix(path.relative(ROOT, outputAbsolute));

  applyWireTargets({
    wireTargets,
    libraryPath,
    mirrorPublicField,
  });

  const shouldSync = parseBoolean(getFlag(flags, 'sync'), true);
  const shouldMediaMap = parseBoolean(getFlag(flags, 'media-map'), true);
  if (shouldSync && libraryPath.startsWith('public/')) {
    runPostSync(shouldMediaMap);
  }
}

function buildExportFormat(flags, formatType) {
  const pages = parseCsv(getFlag(flags, 'pages')).map((value) => Number.parseInt(value, 10)).filter((value) => !Number.isNaN(value));
  const width = parseInteger(getFlag(flags, 'width'), '--width');
  const height = parseInteger(getFlag(flags, 'height'), '--height');
  const qualityFlag = getFlag(flags, 'quality');

  const format = { type: formatType };
  if (pages.length > 0) format.pages = pages;

  if (formatType === 'png' || formatType === 'jpg' || formatType === 'gif') {
    if (width) format.width = width;
    if (height) format.height = height;
  }

  if (formatType === 'jpg') {
    const quality = qualityFlag ? Number.parseInt(qualityFlag, 10) : 90;
    if (Number.isNaN(quality) || quality < 40 || quality > 100) {
      throw new Error('--quality for jpg must be an integer between 40 and 100.');
    }
    format.quality = quality;
  }

  if (formatType === 'mp4') {
    format.quality = qualityFlag || 'horizontal_1080p';
  }

  return format;
}

async function commandExportDesign(flags, client) {
  const designId = getFlag(flags, 'design');
  if (!designId) {
    throw new Error('export-design requires --design <design-id>.');
  }

  const formatType = getFlag(flags, 'format', 'png').toLowerCase();
  const supportedFormats = new Set(['png', 'jpg', 'pdf', 'gif', 'mp4', 'pptx']);
  if (!supportedFormats.has(formatType)) {
    throw new Error(`Unsupported --format "${formatType}". Expected one of: ${Array.from(supportedFormats).join(', ')}`);
  }

  const format = buildExportFormat(flags, formatType);
  const job = await client.createExportJob({
    design_id: designId,
    format,
  });

  console.log(`Created export job: ${job.id} (status: ${job.status})`);
  const completed = await client.waitForExport(job.id, {
    intervalMs: parseInteger(getFlag(flags, 'poll-ms'), '--poll-ms') || 1500,
    maxAttempts: parseInteger(getFlag(flags, 'max-polls'), '--max-polls') || 80,
  });

  if (completed.status !== 'success') {
    const code = completed?.error?.code || 'unknown_error';
    const message = completed?.error?.message || 'Export failed without details.';
    throw new Error(`Export failed (${code}): ${message}`);
  }

  const urls = Array.isArray(completed.urls) ? completed.urls : [];
  if (urls.length === 0) {
    throw new Error('Export completed but no URLs were returned.');
  }

  console.log(`Export URLs (${urls.length})`);
  for (const [index, url] of urls.entries()) {
    console.log(`  ${index + 1}. ${url}`);
  }

  const shouldDownload = parseBoolean(getFlag(flags, 'download'), true);
  if (!shouldDownload) return;

  const defaultOutDir = path.join('tmp', 'canva-exports', designId);
  const outFlag = getFlag(flags, 'out', defaultOutDir);
  const outAbsolute = path.isAbsolute(outFlag) ? outFlag : path.resolve(ROOT, outFlag);
  const overwrite = parseBoolean(getFlag(flags, 'overwrite'), false);

  const outputFiles = [];
  if (urls.length === 1 && path.extname(outAbsolute)) {
    const info = await downloadToFile(urls[0], outAbsolute, overwrite);
    outputFiles.push({ absolutePath: outAbsolute, ...info });
  } else {
    fs.mkdirSync(outAbsolute, { recursive: true });
    for (const [index, url] of urls.entries()) {
      const parsed = new URL(url);
      const urlPathname = parsed.pathname.split('/').filter(Boolean).pop() || `${designId}-${index + 1}.${formatType}`;
      const fallbackName = `${designId}-${String(index + 1).padStart(2, '0')}-${urlPathname}`;
      const fileName = slugify(path.basename(fallbackName, path.extname(fallbackName))) + (path.extname(fallbackName) || `.${formatType}`);
      const targetFile = path.join(outAbsolute, fileName);
      const info = await downloadToFile(url, targetFile, overwrite);
      outputFiles.push({ absolutePath: targetFile, ...info });
    }
  }

  for (const output of outputFiles) {
    console.log(`Downloaded export: ${asRelativePosix(output.absolutePath)} (${output.bytes} bytes)`);
  }
}

function commandPresets() {
  const names = Object.keys(PRESETS).sort();
  console.log(`Available presets (${names.length}):`);
  for (const name of names) {
    const preset = PRESETS[name];
    console.log(`- ${name}`);
    console.log(`  out: ${preset.out}`);
    console.log(`  wires: ${preset.wires.length ? preset.wires.join(', ') : '(none)'}`);
    console.log(`  note: ${preset.description}`);
  }
}

async function main() {
  const parsed = parseArgs(process.argv.slice(2));

  if (parsed.command === 'help' || parsed.command === '--help' || parsed.command === '-h') {
    logHelp();
    return;
  }

  if (parsed.command === 'presets') {
    commandPresets();
    return;
  }

  const client = new CanvaConnectClient();

  if (parsed.command === 'search-assets') {
    await commandSearchAssets(parsed.flags, client);
    return;
  }

  if (parsed.command === 'pull-asset') {
    await commandPullAsset(parsed.flags, client);
    return;
  }

  if (parsed.command === 'export-design') {
    await commandExportDesign(parsed.flags, client);
    return;
  }

  throw new Error(`Unknown command: ${parsed.command}`);
}

main().catch((error) => {
  console.error(`Error: ${error.message}`);
  process.exit(1);
});
