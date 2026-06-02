## 1.5.2 (June 1, 2026)

- **Inline format highlights** — new `inlineFormats` config option and `data-inline-formats` attribute highlight selected format key strings (e.g. `['M', 'W']`) inline next to each meeting name in the list/cards. Each matching format renders its localized name (e.g. "Women") as a muted suffix — a curated highlight for special-interest meetings, independent of `showFormats`. Opt-in — defaults to `[]` (none), so existing embeds are unaffected. BMLT format key strings vary by server, so a configured code only shows where the server actually uses it

## 1.5.1 (May 15, 2026)

- **Upgrade `bmlt-query-client` to `^1.4.1`** — numeric fields on `Meeting` (`latitude`, `longitude`, `weekday_tinyint`, `venue_type`, `published`, `distance_in_km`, `distance_in_miles`) and on `ServerInfo` / `CoverageArea` now arrive as real `number` values instead of strings, matching the existing TypeScript types. No behavior change in the widget — the internal coercion path in `data.svelte.ts` was already handling both shapes — but typings now line up end-to-end and downstream consumers don't need to parse

## 1.5.0 (May 12, 2026)

- **Custom raw BMLT queries** — new `query` config option and `data-query` attribute pass an arbitrary BMLT query string through to the server via `bmlt-query-client`'s `rawQuery()`. Use it for filters the structured options can't express (e.g. `meeting_key_value[]` matching multiple values). When set, it replaces the default service-body load entirely and forces `geolocation` off — Near Me, typed-location search, and "Search this area" are disabled because geo params can't safely be layered on top of an arbitrary query. `page_size`, `get_used_formats=1`, and `lang_enum` are appended automatically so meetings + formats still arrive in a single round-trip

## 1.4.1 (May 11, 2026)

- **Fix README on npm** — `README.md` was a symlink to `docs/intl/README.en.md`; npm doesn't follow symlinks when packing, so 1.4.0 published with no README. Flipped the symlink so `README.md` is now the real file at the repo root

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
