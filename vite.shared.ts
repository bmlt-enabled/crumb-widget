// Pieces shared by vite.config.ts (IIFE app bundle) and vite.lib.config.ts
// (npm library build) so they can't drift apart.
import { resolve } from 'path';
import { readFileSync } from 'fs';
import { execSync } from 'child_process';

const pkg = JSON.parse(readFileSync('./package.json', 'utf-8'));

let shortSha = 'unknown';
try {
  shortSha = execSync('git rev-parse --short HEAD', { stdio: ['ignore', 'pipe', 'ignore'] })
    .toString()
    .trim();
} catch {
  // not a git checkout (e.g. tarball, Docker without .git) — fall back
}

export const versionDefine = {
  __APP_VERSION__: JSON.stringify(`${pkg.version}+${shortSha}`)
};

export const srcAliases = {
  '@': resolve(import.meta.dirname, 'src'),
  '@components': resolve(import.meta.dirname, 'src/components'),
  '@utils': resolve(import.meta.dirname, 'src/utils'),
  '@tests': resolve(import.meta.dirname, 'src/tests'),
  '@stores': resolve(import.meta.dirname, 'src/stores'),
  '@assets': resolve(import.meta.dirname, 'src/assets')
};
