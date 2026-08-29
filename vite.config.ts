/// <reference types="vitest/config" />

import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { svelteTesting } from '@testing-library/svelte/vite';
import tailwindcss from '@tailwindcss/vite';
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js';
import { cpSync } from 'fs';
import { extname } from 'path';
import { versionDefine, srcAliases } from './vite.shared.ts';

export default defineConfig({
  base: './',
  define: versionDefine,
  resolve: {
    alias: srcAliases
  },
  plugins: [
    tailwindcss(),
    svelte(),
    cssInjectedByJsPlugin(),
    svelteTesting(),
    {
      name: 'copy-docs',
      closeBundle() {
        cpSync('docs', 'dist', {
          recursive: true,
          filter: (src) => extname(src) !== '.md'
        });
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
