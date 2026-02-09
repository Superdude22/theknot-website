import { rm } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const cacheDirs = ['.astro', path.join('node_modules', '.vite')];

for (const dir of cacheDirs) {
  const fullPath = path.join(projectRoot, dir);
  try {
    await rm(fullPath, { recursive: true, force: true });
    console.log(`Cleared ${dir}`);
  } catch (error) {
    console.warn(`Failed to clear ${dir}:`, error);
  }
}
