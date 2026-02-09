import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const astroSiteRoot = path.resolve(__dirname, '..');
const projectRoot = path.resolve(astroSiteRoot, '..');

const prdPath = path.join(projectRoot, 'prd', 'THEKNOT_WEBSITE_v1.json');
const contractPath = path.join(projectRoot, 'prd', 'THEKNOT_IMPLEMENTATION_CONTRACT_v1.json');
const sprintsDir = path.join(projectRoot, 'sprints');
const contentConfigPath = path.join(astroSiteRoot, 'src', 'content', 'config.ts');

const failures = [];
const warnings = [];

function normalizeFilePath(filePath) {
  return String(filePath || '').replace(/\\/g, '/');
}

function addFailure(message) {
  failures.push(message);
}

function addWarning(message) {
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

async function readJson(targetPath, label) {
  try {
    const raw = await fs.readFile(targetPath, 'utf8');
    return JSON.parse(raw);
  } catch (error) {
    addFailure(`Unable to read ${label}: ${targetPath} (${error.message})`);
    return null;
  }
}

function findPatternLines(text, pattern) {
  const lines = text.split(/\r?\n/);
  const hits = [];
  for (let index = 0; index < lines.length; index += 1) {
    if (lines[index].includes(pattern)) {
      hits.push(index + 1);
    }
  }
  return hits;
}

function parseCollectionKeys(contentConfigSource) {
  const exportMatch = contentConfigSource.match(/export\s+const\s+collections\s*=\s*{([\s\S]*?)}/m);
  if (!exportMatch) {
    return [];
  }

  const collectionBlock = exportMatch[1];
  const keys = collectionBlock
    .split(',')
    .map((token) => token.trim())
    .filter(Boolean)
    .map((token) => token.split(':')[0].trim())
    .map((token) => token.replace(/^['"]|['"]$/g, ''))
    .filter((token) => /^[a-zA-Z0-9_-]+$/.test(token));

  return [...new Set(keys)];
}

function collectGetEntryCollections(markdownSource) {
  const collections = new Set();
  const regex = /getEntry\('([^']+)'/g;
  let match = regex.exec(markdownSource);
  while (match) {
    collections.add(match[1]);
    match = regex.exec(markdownSource);
  }
  return collections;
}

async function validate() {
  const prd = await readJson(prdPath, 'PRD');
  const contract = await readJson(contractPath, 'implementation contract');

  if (!prd || !contract) {
    return;
  }

  const stories = Array.isArray(prd.userStories) ? prd.userStories : [];
  const expectedStoryCount = Number(contract.enforcedStoryCount);
  const expectedPhaseCount = Number(contract.enforcedPhaseCount);

  if (stories.length !== expectedStoryCount) {
    addFailure(`Story count mismatch: expected ${expectedStoryCount}, found ${stories.length}.`);
  }

  const seenStoryIds = new Set();
  for (const story of stories) {
    if (!story.id) {
      addFailure('Found story without id.');
      continue;
    }
    if (seenStoryIds.has(story.id)) {
      addFailure(`Duplicate story id detected: ${story.id}.`);
    }
    seenStoryIds.add(story.id);
  }

  const phaseNumbers = new Set(stories.map((story) => Number(story.phase)));
  for (let phase = 1; phase <= expectedPhaseCount; phase += 1) {
    if (!phaseNumbers.has(phase)) {
      addFailure(`Missing phase ${phase} in PRD user stories.`);
    }
  }

  for (const phase of phaseNumbers) {
    if (!Number.isFinite(phase) || phase < 1 || phase > expectedPhaseCount) {
      addFailure(`Out-of-range phase detected: ${phase}.`);
    }
  }

  const referenceDocs = Array.isArray(prd.referenceDocuments) ? prd.referenceDocuments : [];
  if (!referenceDocs.includes('../prd/THEKNOT_IMPLEMENTATION_CONTRACT_v1.json')) {
    addFailure('PRD referenceDocuments must include ../prd/THEKNOT_IMPLEMENTATION_CONTRACT_v1.json.');
  }
  if (!referenceDocs.includes('../prd/GUARDRAILS.md')) {
    addFailure('PRD referenceDocuments must include ../prd/GUARDRAILS.md.');
  }

  for (const story of stories) {
    if (!story.sprintRef) {
      addFailure(`Story ${story.id} is missing sprintRef.`);
      continue;
    }

    const sprintPath = path.join(projectRoot, 'sprints', story.sprintRef);
    if (!(await fileExists(sprintPath))) {
      addFailure(`Story ${story.id} references missing sprint file: ${story.sprintRef}.`);
    }
  }

  const requiredStoryPrimaryFiles = contract.requiredStoryPrimaryFiles || {};
  for (const [storyId, requiredFiles] of Object.entries(requiredStoryPrimaryFiles)) {
    const story = stories.find((entry) => entry.id === storyId);
    if (!story) {
      addFailure(`Contract references unknown story id: ${storyId}.`);
      continue;
    }
    const storyFiles = (story.primaryFiles || []).map(normalizeFilePath);
    for (const requiredFile of requiredFiles.map(normalizeFilePath)) {
      if (!storyFiles.includes(requiredFile)) {
        addFailure(`Story ${storyId} missing required primary file: ${requiredFile}.`);
      }
    }
  }

  const deprecatedFiles = new Set();
  for (const routeConfig of Object.values(contract.routes || {})) {
    for (const legacyFile of routeConfig.legacyFiles || []) {
      deprecatedFiles.add(normalizeFilePath(legacyFile));
    }
  }

  for (const story of stories) {
    for (const primaryFile of story.primaryFiles || []) {
      const normalized = normalizeFilePath(primaryFile);
      if (deprecatedFiles.has(normalized)) {
        addFailure(`Story ${story.id} uses deprecated file path: ${normalized}.`);
      }
    }
  }

  const perfStory = stories.find((story) => story.id === 'TK-1203');
  if (!perfStory) {
    addFailure('Missing performance story TK-1203.');
  } else {
    const criteriaBlob = (perfStory.acceptanceCriteria || []).join(' | ');
    if (/FID/i.test(criteriaBlob)) {
      addFailure('TK-1203 acceptance criteria must not reference FID. Use INP.');
    }
    if (!/INP/i.test(criteriaBlob)) {
      addFailure('TK-1203 acceptance criteria must include INP target.');
    }
  }

  const sprintFiles = (await fs.readdir(sprintsDir))
    .filter((fileName) => /^SPRINT_\d{2}_.+\.md$/i.test(fileName))
    .sort();

  const forbiddenPatterns = contract.forbiddenPatterns?.docs || [];
  const getEntryCollectionsUsed = new Set();
  const sprintSourceByFile = new Map();

  for (const sprintFile of sprintFiles) {
    const sprintPath = path.join(sprintsDir, sprintFile);
    const source = await fs.readFile(sprintPath, 'utf8');
    sprintSourceByFile.set(sprintFile, source);

    for (const pattern of forbiddenPatterns) {
      const lineHits = findPatternLines(source, pattern);
      for (const lineNumber of lineHits) {
        addFailure(`${sprintFile}:${lineNumber} contains forbidden pattern "${pattern}".`);
      }
    }

    if (source.includes('src/pages/events.astro')) {
      addFailure(`${sprintFile} references deprecated file path src/pages/events.astro.`);
    }

    if (source.includes('src/pages/new-climber.astro')) {
      addFailure(`${sprintFile} references deprecated file path src/pages/new-climber.astro.`);
    }

    const legacyNewClimberRoutePattern = /['"`]\/new-climber(?!s)(?:[/?#][^'"`]*)?['"`]/;
    if (legacyNewClimberRoutePattern.test(source)) {
      addWarning(`${sprintFile} includes legacy route "/new-climber".`);
    }

    const collections = collectGetEntryCollections(source);
    for (const collectionName of collections) {
      getEntryCollectionsUsed.add(collectionName);
    }
  }

  if (contract.contentPolicy?.productionFallbacksAllowed === false) {
    const strictPolicySprints = [
      'SPRINT_05_HOME.md',
      'SPRINT_06_ABOUT.md',
      'SPRINT_07_NEW_CLIMBERS.md',
      'SPRINT_08_MEMBERSHIP.md'
    ];

    for (const sprintFile of strictPolicySprints) {
      const source = sprintSourceByFile.get(sprintFile);
      if (!source) {
        addFailure(`Missing sprint file required for production content policy: ${sprintFile}.`);
        continue;
      }

      if (!source.toLowerCase().includes('production must fail')) {
        addFailure(`${sprintFile} must explicitly state "production must fail" for missing CMS content.`);
      }
    }
  }

  const sprint12 = sprintSourceByFile.get('SPRINT_12_POLISH.md');
  if (sprint12) {
    if (/FID\s*</i.test(sprint12)) {
      addFailure('SPRINT_12_POLISH.md still references FID. Replace with INP.');
    }
    if (!/INP\s*</i.test(sprint12)) {
      addFailure('SPRINT_12_POLISH.md must include an INP target.');
    }
  }

  if (await fileExists(contentConfigPath)) {
    const contentConfig = await fs.readFile(contentConfigPath, 'utf8');
    const definedCollectionKeys = parseCollectionKeys(contentConfig);
    const undefinedGetEntryCollections = [...getEntryCollectionsUsed].filter(
      (collectionName) => !definedCollectionKeys.includes(collectionName)
    );

    for (const collectionName of undefinedGetEntryCollections) {
      addWarning(
        `Sprint docs use getEntry('${collectionName}', ...), but src/content/config.ts does not define that collection.`
      );
    }
  } else {
    addWarning('Cannot read src/content/config.ts to compare getEntry collection keys.');
  }
}

await validate();

if (warnings.length > 0) {
  console.log('Guardrails warnings:');
  for (const warning of warnings) {
    console.log(`  - ${warning}`);
  }
}

if (failures.length > 0) {
  console.error('Guardrails validation failed:');
  for (const failure of failures) {
    console.error(`  - ${failure}`);
  }
  process.exit(1);
}

console.log('Guardrails validation passed.');
