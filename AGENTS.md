# AGENTS.md

Guidelines for AI agents working in this repository.

## Project Overview

**Crumb Widget** is an embeddable NA meeting finder widget built with Svelte 5, Vite, TypeScript, and Tailwind CSS. It queries a [BMLT server](https://bmlt.app) via the `bmlt-query-client` library and ships in two forms:

1. **`dist/app.js`** — a single self-contained IIFE bundle (CSS injected into JS), distributed via CDN. Entry: `src/main.ts`. Built with `npm run build`.
2. **`dist/module.js`** — an ESM library entry for npm consumers (`import { mountCrumbWidget } from 'crumb-widget'`). Entry: `src/module.ts`. Built with `npm run build:lib`. `leaflet` is a peer dependency in this build.

## Tech Stack

- **Framework**: Svelte 5 (runes API)
- **Build Tool**: Vite 8
- **Styling**: Tailwind CSS 4 (injected into the JS bundle — no separate CSS file)
- **Language**: TypeScript 5 (strict mode)
- **Data**: `bmlt-query-client`
- **Maps**: Leaflet 1.9
- **Testing**: Vitest + @testing-library/svelte (jsdom) for unit tests; Playwright for e2e
- **Linting**: ESLint 10 (flat config) + Prettier 3 + svelte-check
- **Bundle size**: Enforced via `size-limit` (`npm run size`)

## Commands

```bash
npm install        # Install dependencies
npm run dev        # Start dev server with HMR (test page at localhost:5173)
npm run build      # Production IIFE build → dist/app.js (+ docs HTML pages)
npm run build:lib  # ESM library build → dist/module.js (+ dist/module.d.ts)
npm run preview    # Preview production build
npm run lint       # Run prettier + eslint + svelte-check
npm run format     # Auto-format code with Prettier
npm run test       # Run unit tests once
npm run test:watch # Run unit tests in watch mode
npm run test:e2e   # Run Playwright e2e tests
npm run coverage   # Generate unit test coverage report
npm run size       # Check dist/module.js bundle size against the limit
```

Always run `npm run lint` before finishing a task. Fix all lint errors before considering work complete.

## Embedding

The widget is embedded by adding a div with data attributes and loading `app.js`:

```html
<div id="crumb-widget" data-server="https://your-server/main_server" data-service-body="123" data-service-body="1,2,3" data-view="list"></div>
<script src="app.js"></script>
```

Optional global config object (must be defined before `app.js` loads):

```html
<script>
  var CrumbWidgetConfig = { view: 'map' };
</script>
```

## Project Structure

```
src/
  main.ts                    # IIFE entry — reads data-* attrs, mounts app
  module.ts                  # npm/ESM entry — exports mountCrumbWidget
  app.css                    # Tailwind import + .crumb-widget reset
  App.svelte                 # Root component — filtering, view routing
  types/
    index.ts                 # Shared types: CrumbWidgetConfig, ProcessedMeeting, FilterState, ViewType
  stores/
    config.svelte.ts         # App config ($state rune)
    data.svelte.ts           # Meeting data loading via BmltClient ($state rune)
    ui.svelte.ts             # UI state: view, selected meeting, filter values ($state rune)
    localization.ts          # i18n via localized-strings + svelte writable store
  components/
    Controls.svelte          # Search input + filter chips + list/map toggle
    MeetingList.svelte       # Meeting table (click row → detail view)
    MeetingDetail.svelte     # Full meeting detail (schedule, location, virtual link, formats)
    MapView.svelte           # Leaflet map for in-person/hybrid meetings
    FilterDropdown.svelte    # Reusable multi-select filter dropdown
    Loading.svelte           # Loading spinner
  utils/
    format.ts                # formatTime, formatAddress, getTimeOfDay, sortMeetings, etc.
    markers.ts               # Leaflet marker icon helpers
    mapUtils.ts              # Map bounds, geolocation helpers
  lang/                      # Translation tables (da, de, el, en, es, fa, fr, it, pl, pt, ru, sv)
  tests/
    unit/                    # Vitest unit + component tests
    e2e/                     # Playwright e2e tests
pages/
  docs.html                  # Documentation page (copied to dist/index.html on build)
  meetings.html              # Demo page (copied to dist/meetings.html on build)
dist/
  app.js                     # IIFE build output (CSS injected)
  module.js, module.d.ts     # npm/ESM build output
index.html                   # Dev test page (loads src/main.ts via Vite)
```

## Path Aliases

Use these aliases — do not use relative `../../` paths when an alias applies:

| Alias          | Resolves to       |
| -------------- | ----------------- |
| `@/`           | `src/`            |
| `@components/` | `src/components/` |
| `@utils/`      | `src/utils/`      |
| `@tests/`      | `src/tests/`      |
| `@stores/`     | `src/stores/`     |
| `@assets/`     | `src/assets/`     |

Note: `@types/` is intentionally absent — it conflicts with TypeScript's DefinitelyTyped resolution. Use `@/types/index` instead.

## Code Conventions

- **Svelte 5 runes**: Use `$state`, `$derived.by`, `$effect`, `$props` — not legacy `writable`/`reactive` store patterns.
- **Shared state**: Live in `src/stores/*.svelte.ts` files using module-level `$state`. Import the state object directly into components.
- **Reactive collections**: Use `SvelteMap` from `svelte/reactivity` instead of native `Map` — the lint rule `svelte/prefer-svelte-reactivity` enforces this.
- **`$derived` vs `$derived.by`**: Use `$derived(expr)` for simple expressions. Use `$derived.by(() => { ... })` when the computation has a function body — wrapping a function in `$derived(fn)` makes `fn` the derived value, not its result.
- **Each blocks**: Always provide a key: `{#each items as item (item.id)}`.
- **Styling**: Tailwind utility classes only. The widget uses CSS isolation via `.crumb-widget { all: initial; }` — all styles must be scoped inside that class.
- **RTL**: The widget supports right-to-left languages (Persian/Farsi today). Use **logical** Tailwind utilities for direction-sensitive properties: `ps-/pe-` (not `pl-/pr-`), `ms-/me-` (not `ml-/mr-`), `start-/end-` (not `left-/right-`), `text-start/text-end` (not `text-left/text-right`), `rounded-s-/rounded-e-` and `border-s/border-e`. The `dir` attribute on `.crumb-widget` is bound to the localization `direction` store — adding a new RTL language only requires adding the code to `RTL_LANGUAGES` in `src/stores/localization.ts`.
- **TypeScript**: Strict mode is on, plus `noUncheckedIndexedAccess` and `noImplicitOverride`. Do not use `any` — `@typescript-eslint/no-explicit-any` is enforced. BMLT API returns numeric fields as strings — always coerce with `Number()` before comparison.
- **Formatting**: Prettier is the source of truth (config in `.prettierrc.ts`). Line width 200, single quotes, no trailing commas.
- **ESLint**: `no-undef` is disabled (TypeScript handles it). `svelte-eslint-parser` is configured for `.svelte.ts` files.

## Data Flow

1. `main.ts` reads `data-*` attributes from `#crumb-widget`, calls `initConfig()`, mounts `App.svelte`.
2. `App.svelte` calls `loadData(serverUrl, serviceBodyId)` on mount.
3. `loadData` uses `BmltClient` from `bmlt-query-client` to fetch meetings and formats in parallel. Meetings are processed into `ProcessedMeeting` (adds `formattedTime`, `formattedAddress`, `timeOfDay`, `dayName`, etc.) and stored in `dataState.meetings`.
4. `App.svelte` computes `filteredMeetings` via `$derived.by` — applies weekday, venue type, time-of-day, and text search filters from `uiState.filters`.
5. Components read from `dataState` and `uiState` directly.

## BMLT-Specific Notes

- `weekday_tinyint`: 1=Sunday … 7=Saturday (PHP convention). Always coerce to `Number()` — the API returns strings.
- `venue_type`: 1=In-Person, 2=Virtual, 3=Hybrid. Same string-coercion caveat.
- `format_shared_id_list`: comma-separated string of format IDs. Split and look up in `dataState.formats` (a `SvelteMap`) to resolve names.
- `format_type_enum`: the legacy BMLT API returns short codes (`FC1`, `FC2`, `FC3`, `O`, `LANG`) — **not** the descriptive enum names used by the v3 REST API (`MEETING_FORMAT`, `LOCATION`, `COMMON_NEEDS_OR_RESTRICTION`, `OPEN_OR_CLOSED`, `LANGUAGE`). `Controls.svelte` normalizes these via `LEGACY_TYPE_MAP` before grouping formats in the dropdown. If you add new format grouping logic, use the canonical group names and keep the map in sync.
- `data-service-body` accepts a single ID or a comma-separated list (`"1,2,3"`). Parsed into `AppConfig.serviceBodyIds: number[]`. Empty = fetch all.
- Service body searches use `recursive: true` by default to include child service bodies.
- The `bmlt-query-client` dep is from npmjs

## Testing

- Unit/component tests live in `src/tests/unit/`. E2e tests live in `src/tests/e2e/`.
- Component tests mock `loadData` via `vi.mock('@stores/data.svelte', ...)` to avoid real API calls. Set `dataState.meetings` directly to inject test data. Call `resetFilters()` and reset `uiState` in `beforeEach`.
- Filter chip labels (e.g. "Mon", "Virtual") also appear in meeting rows — use `getByRole('button', { name: 'Mon' })` to target chips specifically.
- Text split across elements (e.g. "Monday at 7:00 PM") requires regex: `getByText(/7:00 PM/)`.
- Coverage thresholds (lines/functions/statements) are enforced at 80% in `vite.config.ts`.
- Run `npm run test` to verify changes don't break existing tests. Add tests for new components/logic.

## Build Output

- **IIFE build (`dist/app.js`)** — single self-contained bundle from `src/main.ts`. CSS (Tailwind and Leaflet) is injected at runtime via `vite-plugin-css-injected-by-js`. Leaflet is bundled. Leaflet marker images are loaded from `unpkg.com` CDN (not bundled).
- **ESM lib build (`dist/module.js` + `dist/module.d.ts`)** — from `src/module.ts`. CSS is also injected. **`leaflet` is externalized as a peer dependency** so npm consumers can dedupe it. The `dts` plugin emits a single rolled-up `.d.ts`.

## CI/CD

GitHub Actions workflows:

- **`test.yml`**: Runs the reusable test workflow on pull requests. Uses concurrency cancellation.
- **`static.yml`**: Builds and deploys to GitHub Pages on push to `main` (also pushes the IIFE bundle to S3/CloudFront).
- **`publish.yml`**: Publishes to npm on `v*` tag push using OIDC trusted publishing (`--provenance`). No long-lived `NPM_TOKEN`.
- **`reusable-test.yml`**: Shared job — lint, unit tests + coverage (Codecov), `build:lib`, `size-limit` check, e2e tests.

Do not modify workflow files unless the task explicitly requires it.

## Controls Layout Breakpoint

`Controls.svelte` and `FilterDropdown.svelte` use `md:` (768px) as the breakpoint that switches from the stacked 2-column grid to the single inline flex row. This matches the breakpoint where `MeetingList.svelte` switches from card view (`md:hidden`) to table view (`hidden md:block`). **Do not change these to `sm:` — the controls and list must switch at the same width.**

## Meeting Table Layout — Recurring Pitfall

**The meeting table columns squashing/overlapping is a recurring bug.** It has been triggered multiple times by unrelated changes. Any layout work that touches the widget container, introduces new wrapper divs, or changes flex/grid structure must be checked against this.

### Root cause

`MeetingList` renders a `<table>` with:

- `table-layout: fixed` — column widths are distributed from the table's own width
- `min-width: 600px` — prevents collapse below 600px
- `width: 100%` — fills its container

If the table's **containing block** becomes narrower than the content, or if an element **overlaps** the table from outside the normal flow, columns appear squashed, truncated, or overlapping.

### Known triggers (non-exhaustive)

1. **Leaflet popup overflow** — Leaflet renders popups via absolute positioning relative to the map div. Without `overflow: hidden` on the map wrapper, popups bleed into adjacent content and visually corrupt the table. Fix: always add `overflow-hidden` to any fixed-height `<MapView>` wrapper.

2. **New flex/grid wrapper divs** — Wrapping the meeting list in a new `flex` or `grid` container without explicit width (`w-full` / `width: 100%`) can cause the table's containing block to shrink. Fix: always add `w-full` to any new wrapper around `<MeetingList>`.

3. **`overflow: hidden` on a too-narrow ancestor** — Clipping an ancestor at a width smaller than 600px causes the table to be clipped, making columns appear missing or truncated.

4. **Absolutely/fixed-positioned elements with high z-index** — Elements rendered outside normal flow (dropdowns, tooltips, popups) with a high `z-index` can paint over table columns without affecting layout, making columns appear squashed.

### Checklist before finishing any layout change

- [ ] Does the `<MeetingList>` container have `w-full`?
- [ ] Is any new flex/grid ancestor correctly sized?
- [ ] Does any new fixed-height wrapper around `<MapView>` have `overflow-hidden`?
- [ ] Are there any absolutely-positioned elements that could overlap the table?

## Reference Documentation

- **Svelte 5**: https://svelte.dev/llms.txt
- **BMLT**: https://bmlt.app/docs/

## Dependency Updates

Renovate is configured for automated dependency updates:

- **Major** updates: Mondays after 9am (manual review)
- **devDependencies (minor + patch)**: grouped, automerged after 7-day release age
- **Runtime dependencies — minor**: grouped, manual review
- **Runtime dependencies — patch**: grouped, automerged after 14-day release age

Do not manually bump dependencies unless the task requires it.
