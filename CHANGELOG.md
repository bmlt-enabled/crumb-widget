## 1.4.0 (May 11, 2026)

- **Typed location search** — when `geolocation: true`, the search input has a mode dropdown so users can filter meetings or search by city, postal code, or address (resolved via OpenStreetMap Nominatim)
- **Aggregator default respects service-body scope** — `geolocation` now defaults to `true` only on the unconstrained aggregator; scoped pages no longer auto-prompt unless the embedder opts in explicitly
- **BMLT auto-radius** — negative integer `geolocationRadius` (e.g. `-50`) tells the server to expand until it finds ~N nearby meetings; positive values still apply a fixed radius
- **Format key filtering** — new `formats` config option (e.g. `['O', 'BT']`) locks the widget to meetings matching those format keys
- **Update Meeting Info link** — new `updateUrl` config and `data-update-url` attribute add a per-meeting link to bmlt-workflow, a custom form, or `mailto:` via `{meeting_id}`, `{meeting_name}`, `{server_url}`, `{return_url}` tokens
- **`distance` column** — distance to user is now a configurable column; hide by omitting from `columns`
- **Auto-detect `mi` / `km`** — `distanceUnit` defaults to the unit for the resolved locale (US/UK/Liberia/Myanmar → `mi`, else `km`); explicit setting wins
- **`data-columns` attribute** — set list-view columns from HTML without `CrumbWidgetConfig`
- **`?services=` query parameter** — override `data-service-body` from the URL
- **Japanese translation** — 13 languages total
- **Map pin grouping** — meetings at the same venue with sub-meter coord differences now collapse to one pin
- **Fixes** — in-progress row visibility, print CSS, iOS swipe/drag, format strings now localized, WordPress `"1"` / `"0"` accepted as boolean

## 1.3.0 (April 26, 2026)

- **Four new languages** — Greek (`el`), Polish (`pl`), Russian (`ru`), and Persian (`fa`) translations bring the total to 12 supported languages
- **Right-to-left (RTL) support** — widget now mirrors layout for RTL languages (Persian today; infrastructure ready for Arabic, Hebrew, and Urdu when those translations land)
- **Config validation** — invalid embed config (e.g. `view: 'banana'`, `geolocationRadius: -5`, unsupported `language`) now logs a `[crumb-widget]` warning and falls back to the default instead of failing silently. Applies to both the IIFE (data attributes / `window.CrumbWidgetConfig`) and npm (`mountCrumbWidget`) entry points

## 1.2.0 (April 10, 2026)

- **History API routing** — add `data-path` attribute to enable clean URLs without the `#` fragment (e.g. `/meetings/monday-night-meeting-42`). Defaults to hash-based routing for backwards compatibility.
- **Iframe compatibility** — meeting detail navigation now works reliably inside iframe embeds (Google Sites, etc.) by using programmatic navigation instead of native anchor links
- **Table min-width** — meeting list table no longer collapses columns in narrow containers; scrolls horizontally instead

## 1.1.0 (April 6, 2026)

- **`leaflet` is now a peer dependency** — npm consumers must install `leaflet` alongside `crumb-widget` (`npm install crumb-widget leaflet`). This shrinks the published bundle by ~40% and lets your app dedupe a single Leaflet copy. The CDN/IIFE build (`crumb-widget.js`) is unaffected and still bundles Leaflet.

## 1.0.4 (April 5, 2026)

- **Also at this location** — meeting detail page now lists other meetings held at the same address, with links to their detail pages
- **Service body filter** — when the `service_body` column is enabled, a dropdown filter appears to filter meetings by service body
- **Hide header option** — new `hideHeader` global config option to hide the "Meeting Finder" title bar and meeting count

## 0.0.1 (March 27, 2026)

- Initial release.
