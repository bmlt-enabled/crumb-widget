# AGENTS.md

Guidelines for AI agents working in this repository.

## Project Overview

**BMLT Meeting List** is an embeddable NA meeting finder widget built with Svelte 5, Vite, TypeScript, and Tailwind CSS. It queries a [BMLT root server](https://bmlt.app) via the `bmlt-query-client` library and compiles to a single self-contained `public/app.js` file (CSS injected into JS) that can be dropped into any WordPress site or plain HTML page.

## Tech Stack

- **Framework**: Svelte 5 (runes API)
- **Build Tool**: Vite 8
- **Styling**: Tailwind CSS 4 (injected into the JS bundle — no separate CSS file)
- **Language**: TypeScript 5 (strict mode)
- **Data**: `bmlt-query-client` (local path dep from `../bmlt-query-client`)
- **Maps**: Leaflet 1.9
- **Testing**: Vitest + @testing-library/svelte (jsdom)
- **Linting**: ESLint 10 (flat config) + Prettier 3 + svelte-check

## Commands

```bash
npm install        # Install dependencies
npm run dev        # Start dev server with HMR (test page at localhost:5173)
npm run build      # Production build → public/app.js
npm run preview    # Preview production build
npm run lint       # Run prettier + eslint + svelte-check
npm run format     # Auto-format code with Prettier
npm run test       # Run tests once
npm run test:watch # Run tests in watch mode
npm run coverage   # Generate test coverage report
```

Always run `npm run lint` before finishing a task. Fix all lint errors before considering work complete.

## Embedding

The widget is embedded by adding a div with data attributes and loading `app.js`:

```html
<div
  id="bmlt-meeting-list"
  data-root-server="https://your-server/main_server"
  data-service-body="123"
  data-service-body="1,2,3"
  data-view="list"
></div>
<script src="app.js"></script>
```

Optional global config object (must be defined before `app.js` loads):

```html
<script>
  var BmltUiConfig = { defaultView: 'map' };
</script>
```

## Project Structure

```
src/
  main.ts                    # Entry point — reads data-* attrs, mounts app
  app.css                    # Tailwind import + .bmlt-meeting-list reset
  App.svelte                 # Root component — filtering, view routing
  types/
    index.ts                 # Shared types: AppConfig, ProcessedMeeting, FilterState, ViewType
  stores/
    config.svelte.ts         # App config ($state rune, initialized from DOM attrs)
    data.svelte.ts           # Meeting data loading via BmltClient ($state rune)
    ui.svelte.ts             # UI state: view, selected meeting, filter values ($state rune)
  components/
    Controls.svelte          # Search input + filter chips + list/map toggle
    MeetingList.svelte       # Meeting table (click row → detail view)
    MeetingDetail.svelte     # Full meeting detail (schedule, location, virtual link, formats)
    MapView.svelte           # Leaflet map for in-person/hybrid meetings
    Loading.svelte           # Loading spinner
  utils/
    format.ts                # formatTime, formatAddress, getTimeOfDay, sortMeetings, etc.
  tests/
    setup.ts                 # Mocks window.matchMedia, imports jest-dom
    App.svelte.test.ts       # Component integration tests (mocks loadData)
    format.test.ts           # Unit tests for format utilities
public/
  app.js                     # Built output (single IIFE bundle, CSS injected)
  index.html                 # Production test page
index.html                   # Dev test page (loads src/main.ts via Vite)
```

## Path Aliases

Use these aliases — do not use relative `../../` paths when an alias applies:

| Alias          | Resolves to       |
|----------------|-------------------|
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
- **Styling**: Tailwind utility classes only. The widget uses CSS isolation via `.bmlt-meeting-list { all: initial; }` — all styles must be scoped inside that class.
- **TypeScript**: Strict mode is on. Do not use `any`. BMLT API returns numeric fields as strings — always coerce with `Number()` before comparison.
- **Formatting**: Prettier is the source of truth. Line width 200, single quotes, no trailing commas.
- **ESLint**: `@typescript-eslint/no-explicit-any` and `no-undef` are disabled. `svelte-eslint-parser` is configured for `.svelte.ts` files.

## Data Flow

1. `main.ts` reads `data-*` attributes from `#bmlt-meeting-list`, calls `initConfig()`, mounts `App.svelte`.
2. `App.svelte` calls `loadData(rootServerUrl, serviceBodyId)` on mount.
3. `loadData` uses `BmltClient` from `bmlt-query-client` to fetch meetings and formats in parallel. Meetings are processed into `ProcessedMeeting` (adds `formattedTime`, `formattedAddress`, `timeOfDay`, `dayName`, etc.) and stored in `dataState.meetings`.
4. `App.svelte` computes `filteredMeetings` via `$derived.by` — applies weekday, venue type, time-of-day, and text search filters from `uiState.filters`.
5. Components read from `dataState` and `uiState` directly.

## BMLT-Specific Notes

- `weekday_tinyint`: 1=Sunday … 7=Saturday (PHP convention). Always coerce to `Number()` — the API returns strings.
- `venue_type`: 1=In-Person, 2=Virtual, 3=Hybrid. Same string-coercion caveat.
- `format_shared_id_list`: comma-separated string of format IDs. Split and look up in `dataState.formats` (a `SvelteMap`) to resolve names.
- `data-service-body` accepts a single ID or a comma-separated list (`"1,2,3"`). Parsed into `AppConfig.serviceBodyIds: number[]`. Empty = fetch all.
- Service body searches use `recursive: true` by default to include child service bodies.
- The `bmlt-query-client` local dep lives at `../bmlt-query-client` (sibling repo). If it changes, run `npm install` to refresh.

## Testing

- Tests live in `src/tests/`.
- `App.svelte.test.ts`: Component tests mock `loadData` via `vi.mock('@stores/data.svelte', ...)` to avoid real API calls. Set `dataState.meetings` directly to inject test data. Call `resetFilters()` and reset `uiState` in `beforeEach`.
- Filter chip labels (e.g. "Mon", "Virtual") also appear in meeting rows — use `getByRole('button', { name: 'Mon' })` to target chips specifically.
- Text split across elements (e.g. "Monday at 7:00 PM") requires regex: `getByText(/7:00 PM/)`.
- Run `npm run test` to verify changes don't break existing tests. Add tests for new components/logic.

## Build Output

The build produces a single IIFE at `public/app.js`. CSS (including Tailwind and Leaflet) is injected at runtime via `vite-plugin-css-injected-by-js`. Leaflet marker images are loaded from `unpkg.com` CDN (not bundled).

## CI/CD

Three GitHub Actions workflows run automatically:

- **`test.yml`**: Runs lint + tests on all pushes except to `main`.
- **`static.yml`**: Builds and deploys to GitHub Pages on push to `main`.
- **`release.yml`**: Creates a GitHub release with build artifacts when a tag is pushed.

Do not modify workflow files unless the task explicitly requires it.

## Reference Documentation

- **Svelte 5**: https://svelte.dev/llms.txt
- **BMLT**: https://bmlt.app/docs/

## Dependency Updates

Renovate is configured for automated dependency updates:
- **Major** updates: Mondays after 9am
- **Minor/patch** updates: Mondays after 8am (grouped)

Do not manually bump dependencies unless the task requires it.
