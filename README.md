# BMLT Meeting List

An embeddable NA meeting finder widget. Drop a `<div>` and a `<script>` tag into any WordPress site or plain HTML page and get a fully functional meeting finder — search, filters, list view, and an interactive map.

Built with Svelte 5, compiled to a **single self-contained JavaScript file** with CSS injected. No dependencies required on the host page.

## Features

- **List view** — sortable meeting table with day, time, name, location, and venue type
- **Map view** — interactive Leaflet map for in-person meetings (including those with an online component); click a marker to see meetings at that location
- **Detail view** — full meeting info including schedule, address with directions link, virtual meeting join button, formats, and notes
- **Search** — real-time text filter across meeting name, location, and notes
- **Filters** — weekday, venue type (in-person / virtual), and time of day (morning / afternoon / evening / night)
- **BMLT native** — queries any BMLT root server directly via [`bmlt-query-client`](https://github.com/bmlt-enabled/bmlt-query-client)
- **Service body filtering** — single ID or a comma-separated list, with recursive child service body support

## Quick Start

```html
<div
  id="bmlt-meeting-list"
  data-root-server="https://your-server/main_server"
  data-view="list"
></div>
<script src="https://cdn.aws.bmlt.app/app.js"></script>
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
  let BmltMeetingListConfig = {
    defaultView: 'map'
  };
</script>
<script src="app.js"></script>
```

#### Available properties

| Property | Type | Description |
|---|---|---|
| `defaultView` | `'list' \| 'map'` | Default view on load. Takes precedence over `data-view`. |
| `map.tiles` | `TilesConfig` | Custom map tile provider. See below. |
| `map.tiles_dark` | `TilesConfig` | Alternate tile provider used when `prefers-color-scheme: dark`. See below. |
| `map.markers.location` | `MarkerConfig` | Custom map marker for meeting locations. See below. |

#### CSS customization

You can theme the widget using CSS custom properties on the `#bmlt-meeting-list` element. Here are all available variables and their defaults:

```css
#bmlt-meeting-list {
  --bmlt-font-family: system-ui, -apple-system, sans-serif;
  --bmlt-font-size: 16px;
  --bmlt-background: #ffffff;
  --bmlt-text: #111827;
  --bmlt-border: #e5e7eb;
  --bmlt-accent: #2563eb;        /* buttons, active states, links */
  --bmlt-accent-light: #eff6ff;  /* row hover, active filter panel */
  --bmlt-border-radius: 8px;
  --bmlt-row-alt: #f9fafb;       /* alternating row tint */
  --bmlt-in-person: #15803d;
  --bmlt-in-person-bg: #dcfce7;
  --bmlt-virtual: #1d4ed8;
  --bmlt-virtual-bg: #dbeafe;
}
```

Only specify the variables you want to override:

```css
#bmlt-meeting-list {
  --bmlt-accent: #dc2626;
  --bmlt-accent-light: #fef2f2;
  --bmlt-border-radius: 0px;
}
```

#### Dark mode

Use a media query to adapt colors when the visitor's OS is in dark mode:

```css
@media (prefers-color-scheme: dark) {
  #bmlt-meeting-list {
    --bmlt-background: #111827;
    --bmlt-text: #f9fafb;
    --bmlt-border: #374151;
    --bmlt-accent: #60a5fa;
    --bmlt-accent-light: #1e3a5f;
    --bmlt-in-person-bg: #14532d;
    --bmlt-in-person: #86efac;
    --bmlt-virtual-bg: #1e3a5f;
    --bmlt-virtual: #93c5fd;
  }
}
```

#### CSS helper classes

These classes are used internally and can also be targeted in your own CSS to further customize the widget:

| Class | Used on |
|---|---|
| `bmlt-btn-primary` | Filled accent buttons (active filter chips, view toggle, Join Meeting) |
| `bmlt-btn-secondary` | Outlined buttons (Get Directions) |
| `bmlt-link` | Link-style buttons (Back, email) |
| `bmlt-badge-in-person` | In-person venue badge |
| `bmlt-badge-virtual` | Virtual venue badge |
| `bmlt-card` | Detail section cards |
| `bmlt-row` | Meeting list table rows |

Example — make the outlined button fully transparent on hover:

```css
#bmlt-meeting-list .bmlt-btn-secondary:hover {
  background-color: transparent;
  opacity: 0.8;
}
```

#### Custom map tile provider

By default the map uses [OpenStreetMap](https://www.openstreetmap.org/) tiles. Switch to any [Leaflet-compatible tile provider](https://leaflet-extras.github.io/leaflet-providers/preview/) using `map.tiles`:

```html
<script>
  let BmltMeetingListConfig = {
    map: {
      tiles: {
        url: 'https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png',
        attribution: '&copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }
    }
  };
</script>
<script src="app.js"></script>
```

#### Dark mode tiles

Add `map.tiles_dark` to use a different tile layer when the visitor's OS is in dark mode. The tile layer swaps automatically when the theme changes — no page reload needed. If omitted, the same tiles are used in all color schemes.

```html
<script>
  let BmltMeetingListConfig = {
    map: {
      tiles: {
        url: 'https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png',
        attribution: '&copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      },
      tiles_dark: {
        url: 'https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png',
        attribution: '&copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      },
    }
  };
</script>
<script src="app.js"></script>
```

**Example with Mapbox:**

```html
<script>
  let BmltMeetingListConfig = {
    map: {
      tiles: {
        url: 'https://api.mapbox.com/styles/v1/mapbox/streets-v11/tiles/{z}/{x}/{y}?access_token=<pk.your.access.token>',
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>, Imagery &copy; <a href="https://www.mapbox.com/">Mapbox</a>',
      },
      tiles_dark: {
        url: 'https://api.mapbox.com/styles/v1/mapbox/dark-v10/tiles/{z}/{x}/{y}?access_token=<pk.your.access.token>',
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>, Imagery &copy; <a href="https://www.mapbox.com/">Mapbox</a>',
      },
    }
  };
</script>
<script src="app.js"></script>
```

#### Custom map marker

Replace the default NA marker with any image or HTML:

```html
<script>
  let BmltMeetingListConfig = {
    map: {
      markers: {
        location: {
          html: '<img src="https://example.com/marker.png">',
          width: 23,
          height: 33
        }
      }
    }
  };
</script>
<script src="app.js"></script>
```

`html` is rendered as the marker's inner HTML (can be an `<img>` tag or inline SVG). `width` and `height` set the icon size in pixels and control the click/popup anchor point.

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
