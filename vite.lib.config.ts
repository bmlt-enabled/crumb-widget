/// <reference types="vitest/config" />

import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import tailwindcss from '@tailwindcss/vite';
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js';
import dts from 'unplugin-dts/vite';
import { resolve } from 'path';
import { versionDefine, srcAliases } from './vite.shared.ts';

export default defineConfig({
  define: versionDefine,
  resolve: {
    alias: srcAliases
  },
  plugins: [tailwindcss(), svelte(), cssInjectedByJsPlugin(), dts({ include: ['src/module.ts', 'src/types/index.ts'], outDir: 'dist', rollupTypes: true })],
  build: {
    lib: {
      entry: resolve(import.meta.dirname, 'src/module.ts'),
      formats: ['es'],
      fileName: 'module'
    },
    rolldownOptions: {
      external: ['leaflet']
    },
    cssCodeSplit: false,
    minify: 'oxc',
    outDir: 'dist',
    emptyOutDir: false
  }
});
