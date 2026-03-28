# Contributing

## Prerequisites

- Node.js 22+
- npm

## Setup

```bash
git clone https://github.com/bmlt-enabled/bmlt-client.git
cd bmlt-client
npm install
```

The widget depends on [`bmlt-query-client`](https://github.com/bmlt-enabled/bmlt-query-client), which is installed from npm and maintained by the same organization.

## Commands

```bash
npm run dev        # Dev server at localhost:5173 (edit index.html to point at your BMLT server)
npm run build      # Build → public/app.js
npm run preview    # Serve public/ to test the built bundle
npm run lint       # Prettier + ESLint + svelte-check
npm run format     # Auto-format all source files
npm run test       # Run test suite once
npm run test:watch # Run tests in watch mode
npm run coverage   # Generate coverage report
```

## Project Structure

```
src/
  main.ts                  # Entry point — reads data-* attrs, mounts app
  app.css                  # Tailwind import + widget CSS reset
  App.svelte               # Root component — view routing, filtering
  types/index.ts           # Shared TypeScript types
  stores/
    config.svelte.ts       # Config parsed from DOM attributes
    data.svelte.ts         # Meeting data loading (BmltClient)
    ui.svelte.ts           # UI state: view, selected meeting, filters
  components/
    Controls.svelte        # Search bar, filter chips, list/map toggle
    MeetingList.svelte     # Meeting table
    MeetingDetail.svelte   # Full meeting detail view
    MapView.svelte         # Leaflet map
    Loading.svelte         # Loading spinner
  utils/
    format.ts              # Time, address, and sort helpers
    markers.ts             # Leaflet marker icon helpers
    localization.ts        # Localization store and language loading
  tests/
    App.svelte.test.ts     # Component integration tests
    format.test.ts         # Unit tests for format utilities
public/
  app.js                   # Built output (committed for distribution)
  index.html               # Production test page
index.html                 # Dev test page
```

## Build Output

`npm run build` produces `public/app.js` — a single IIFE bundle with all CSS (Tailwind + Leaflet) injected at runtime. No separate stylesheet is needed. The default NA meeting marker is embedded as a base64 data URI.

The built file is committed to the repo so it can be served directly from GitHub Pages.

## Tech Stack

| | |
|---|---|
| Framework | Svelte 5 (runes API) |
| Build | Vite 8 + `vite-plugin-css-injected-by-js` |
| Styling | Tailwind CSS 4 |
| Maps | Leaflet 1.9 |
| Data | [bmlt-query-client](https://github.com/bmlt-enabled/bmlt-query-client) |
| Routing | [svelte-spa-router](https://github.com/bmlt-enabled/svelte-spa-router) |
| Language | TypeScript 5 (strict) |
| Testing | Vitest + @testing-library/svelte |
| Linting | ESLint 10 + Prettier 3 + svelte-check |

## CI/CD

| Workflow | Trigger | Action |
|---|---|---|
| `test.yml` | Push to non-main branches | Lint + test |
| `static.yml` | Push to `main` | Build and deploy to GitHub Pages |
| `release.yml` | Tag push | Create GitHub release with `app.js` attached |
