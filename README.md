# BMLT Meeting List

An embeddable NA meeting finder widget. Drop a `<div>` and a `<script>` tag into any WordPress site or plain HTML page and get a fully functional meeting finder — search, filters, list view, and an interactive map.

Built with Svelte 5, compiled to a **single self-contained JavaScript file** with CSS injected. No dependencies required on the host page.

## Features

- **List view** — sortable meeting table with day, time, name, location, and venue type
- **Map view** — interactive Leaflet map for in-person and hybrid meetings; click a marker to see meetings at that location
- **Detail view** — full meeting info including schedule, address with directions link, virtual meeting join button, formats, and notes
- **Search** — real-time text filter across meeting name, location, and notes
- **Filters** — weekday, venue type (in-person / virtual / hybrid), and time of day (morning / afternoon / evening / night)
- **BMLT native** — queries any BMLT root server directly via [`bmlt-query-client`](https://github.com/bmlt-enabled/bmlt-query-client)
- **Service body filtering** — single ID or a comma-separated list, with recursive child service body support

## Quick Start

```html
<div
  id="bmlt-meeting-list"
  data-root-server="https://your-server/main_server"
  data-view="list"
></div>
<script src="https://your-cdn/app.js"></script>
```

That's it. The widget self-initializes when the script loads.

## Configuration

### `data-*` Attributes

All attributes are set on the `#bmlt-meeting-list` div.

| Attribute | Required | Description |
|---|---|---|
| `data-root-server` | Yes | Full URL to your BMLT root server (e.g. `https://example.org/main_server`) |
| `data-service-body` | No | Filter by service body. Accepts a single ID (`"42"`) or comma-separated list (`"42,57,103"`). Omit to show all meetings on the server. Searches are recursive — child service bodies are always included. |
| `data-view` | No | Default view on load: `list` (default) or `map` |

### Optional Global Config

Define `BmltMeetingListConfig` before loading `app.js` to override defaults:

```html
<script>
  var BmltMeetingListConfig = {
    defaultView: 'map'
  };
</script>
<script src="app.js"></script>
```

## Examples

**Show all meetings on a server:**
```html
<div id="bmlt-meeting-list" data-root-server="https://latest.aws.bmlt.app/main_server"></div>
```

**Filter to one service body, default to map:**
```html
<div
  id="bmlt-meeting-list"
  data-root-server="https://bmlt.sezf.org/main_server"
  data-service-body="42"
  data-view="map"
></div>
```

**Filter to multiple service bodies:**
```html
<div
  id="bmlt-meeting-list"
  data-root-server="https://bmlt.sezf.org/main_server"
  data-service-body="42,57,103"
></div>
```

## Development

### Prerequisites

- Node.js 18+
- npm

### Setup

```bash
git clone https://github.com/bmlt-enabled/bmlt-client.git
cd bmlt-client
npm install
```

The widget depends on [`bmlt-query-client`](https://github.com/bmlt-enabled/bmlt-query-client) as a local sibling repo. Clone it alongside this one:

```
workspace/
  bmlt-client/       ← this repo
  bmlt-query-client/ ← required sibling
```

### Commands

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

### Project Structure

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
  tests/
    App.svelte.test.ts     # Component integration tests
    format.test.ts         # Unit tests for format utilities
public/
  app.js                   # Built output (committed for distribution)
  index.html               # Production test page
index.html                 # Dev test page
```

### Build Output

`npm run build` produces `public/app.js` — a single IIFE bundle with all CSS (Tailwind + Leaflet) injected at runtime. No separate stylesheet is needed. Leaflet marker images are loaded from `unpkg.com`.

The built file is committed to the repo so it can be served directly from GitHub Pages.

## Tech Stack

| | |
|---|---|
| Framework | Svelte 5 (runes API) |
| Build | Vite 8 + `vite-plugin-css-injected-by-js` |
| Styling | Tailwind CSS 4 |
| Maps | Leaflet 1.9 |
| Data | [bmlt-query-client](https://github.com/bmlt-enabled/bmlt-query-client) |
| Language | TypeScript 5 (strict) |
| Testing | Vitest + @testing-library/svelte |
| Linting | ESLint 10 + Prettier 3 + svelte-check |

## CI/CD

| Workflow | Trigger | Action |
|---|---|---|
| `test.yml` | Push to non-main branches | Lint + test |
| `static.yml` | Push to `main` | Build and deploy to GitHub Pages |
| `release.yml` | Tag push | Create GitHub release with `app.js` attached |

## License

MIT — see [LICENSE](LICENSE).
