/// <reference types="vitest/config" />

import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { svelteTesting } from '@testing-library/svelte/vite';
import tailwindcss from '@tailwindcss/vite';
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js';
import { resolve } from 'path';

export default defineConfig({
  base: './',
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
  publicDir: false,
  plugins: [tailwindcss(), svelte(), cssInjectedByJsPlugin(), svelteTesting()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/tests/setup.ts',
    include: ['src/**/*.{test,spec}.{js,ts}']
  },
  build: {
    outDir: 'public',
    emptyOutDir: false,
    cssCodeSplit: false,
    minify: 'oxc',
    rolldownOptions: {
      input: 'src/main.ts',
      output: {
        entryFileNames: 'app.js',
        format: 'iife',
        name: 'BmltMeetingList',
        codeSplitting: false
      },
      checks: {
        pluginTimings: false
      }
    }
  }
});
