/// <reference types="vitest/config" />

import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { svelteTesting } from '@testing-library/svelte/vite';
import tailwindcss from '@tailwindcss/vite';
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js';
import { resolve } from 'path';
import { copyFileSync, readFileSync, readdirSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';
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

export default defineConfig({
  base: './',
  define: {
    __APP_VERSION__: JSON.stringify(`${pkg.version}+${shortSha}`)
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@components': resolve(__dirname, 'src/components'),
      '@utils': resolve(__dirname, 'src/utils'),
      '@tests': resolve(__dirname, 'src/tests'),
      '@stores': resolve(__dirname, 'src/stores'),
      '@assets': resolve(__dirname, 'src/assets')
    }
  },
  plugins: [
    tailwindcss(),
    svelte(),
    cssInjectedByJsPlugin(),
    svelteTesting(),
    {
      name: 'copy-docs',
      closeBundle() {
        copyFileSync('pages/docs.html', 'dist/index.html');
        copyFileSync('pages/meetings.html', 'dist/meetings.html');
        copyFileSync('pages/privacy.html', 'dist/privacy.html');
        const testSrc = 'pages/tests';
        const testDst = 'dist/tests';
        if (existsSync(testSrc)) {
          mkdirSync(testDst, { recursive: true });
          for (const file of readdirSync(testSrc)) {
            copyFileSync(join(testSrc, file), join(testDst, file));
          }
        }
      }
    }
  ],
  build: {
    cssCodeSplit: false,
    minify: 'oxc',
    rolldownOptions: {
      input: 'src/main.ts',
      output: {
        entryFileNames: 'app.js',
        format: 'iife',
        name: 'CrumbWidget',
        codeSplitting: false
      },
      checks: {
        pluginTimings: false
      }
    }
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/tests/unit/setup.ts',
    include: ['src/tests/unit/**/*.{test,spec}.{js,ts}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'cobertura'],
      include: ['src/**/*.{ts,svelte}'],
      exclude: ['src/tests/**', 'src/main.ts'],
      thresholds: {
        lines: 80,
        functions: 80,
        statements: 80
      }
    }
  }
});
