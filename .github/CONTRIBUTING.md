# Contributing

## Prerequisites

- Node.js 24+
- npm

## Setup

```bash
git clone https://github.com/bmlt-enabled/crumb-widget.git
cd crumb-widget
npm install
```

`npm install` runs the `prepare` script, which initializes the [husky](https://typicode.github.io/husky/) git hooks. From that point on, every commit triggers [lint-staged](https://github.com/lint-staged/lint-staged) — `eslint --fix` and `prettier --write` run on staged `.ts`/`.svelte` files (and prettier on `.json`/`.md`/`.html`/`.css`). `svelte-check` is intentionally not in the pre-commit hook (too slow); CI runs it.

The widget depends on [bmlt-query-client](https://github.com/bmlt-enabled/bmlt-query-client) and [@bmlt-enabled/svelte-spa-router](https://github.com/bmlt-enabled/svelte-spa-router) (hash + History API routing with `basePath` support), both installed from npm and maintained by BMLT.

## Commands

```bash
npm run dev        # Dev server at localhost:5173 (edit index.html to point at your BMLT server)
npm run build      # Build → dist/app.js
npm run build:lib  # Library build → dist/module.js + dist/module.d.ts
npm run preview    # Serve dist/ to test the built bundle
npm run lint       # Prettier + ESLint + svelte-check
npm run format     # Auto-format all source files
npm run knip       # Find unused files, exports, and dependencies
npm run test       # Run unit tests once
npm run test:watch # Run tests in watch mode
npm run coverage   # Generate coverage report (80% threshold enforced)
npm run test:e2e   # Run Playwright e2e tests (Chromium, Firefox, WebKit)
npm run all        # Format + lint + test + build (full verification)
```

## Project Structure

```
src/
  main.ts                  # Entry point — reads data-* attrs, mounts app
  module.ts                # NPM package entry point
  app.css                  # Tailwind import + widget CSS reset
  App.svelte               # Root component — view routing, filtering
  types/index.ts           # Shared TypeScript types
  stores/
    config.svelte.ts       # Config parsed from DOM attributes, routing mode setup
    data.svelte.ts         # Meeting data loading (BmltClient)
    ui.svelte.ts           # UI state: view, selected meeting (state + URL), filters
    localization.ts        # i18n store and language loading
  components/              # Svelte UI components
  lang/                    # i18n translations (da, de, el, en, es, fa, fr, it, pl, pt, ru, sv)
  utils/
    format.ts              # Time, address, and sort helpers
    markers.ts             # Leaflet marker icon helpers
    mapUtils.ts            # Map tile and resize utilities
    constants.ts           # Shared constants (geolocation timeout, unit conversions)
    configValidation.ts    # Runtime validators for embed config + global config
  tests/
    unit/                  # Vitest unit + component tests
    e2e/                   # Playwright e2e + accessibility tests
dist/
  app.js                   # Built IIFE bundle (CSS injected)
index.html                 # Dev test page
pages/                     # Static docs and demo pages
```

## Build Output

`npm run build` produces `dist/app.js` — a single IIFE bundle with all CSS (Tailwind + Leaflet) injected at runtime. No separate stylesheet is needed. The default NA meeting marker is embedded as a base64 data URI.

`npm run build:lib` produces `dist/module.js` + `dist/module.d.ts` for the npm package (ES module format).

## Tech Stack

| Category  | Technology                                                             |
| --------- | ---------------------------------------------------------------------- |
| Framework | Svelte 5 (runes API)                                                   |
| Build     | Vite 8 + `vite-plugin-css-injected-by-js`                              |
| Styling   | Tailwind CSS 4                                                         |
| Maps      | Leaflet 1.9                                                            |
| Data      | [bmlt-query-client](https://github.com/bmlt-enabled/bmlt-query-client) |
| Routing   | [svelte-spa-router](https://github.com/bmlt-enabled/svelte-spa-router) |
| Language  | TypeScript 5 (strict)                                                  |
| Testing   | Vitest + @testing-library/svelte + Playwright                          |
| Linting   | ESLint 10 + Prettier 3 + svelte-check + knip                           |
| Hooks     | husky + lint-staged (pre-commit)                                       |

## CI/CD

| Workflow      | Trigger         | Action                                                                                           |
| ------------- | --------------- | ------------------------------------------------------------------------------------------------ |
| `test.yml`    | Pull request    | Lint + unit tests + e2e tests                                                                    |
| `static.yml`  | Push to `main`  | Lint + test, then build and deploy to GitHub Pages + S3 CDN (with CloudFront cache invalidation) |
| `publish.yml` | Tag push (`v*`) | Lint + test, then publish to npm                                                                 |

Deploys happen automatically on push to `main`. The S3 CDN copy (`crumb-widget.js`) is invalidated in CloudFront after each deploy, so changes are live immediately.
