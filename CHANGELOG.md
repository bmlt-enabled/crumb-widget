## 1.2.0 (April 10, 2026)

* **History API routing** — add `data-path` attribute to enable clean URLs without the `#` fragment (e.g. `/meetings/monday-night-meeting-42`). Defaults to hash-based routing for backwards compatibility.
* **Iframe compatibility** — meeting detail navigation now works reliably inside iframe embeds (Google Sites, etc.) by using programmatic navigation instead of native anchor links
* **Table min-width** — meeting list table no longer collapses columns in narrow containers; scrolls horizontally instead

## 1.1.0 (April 6, 2026)

* **`leaflet` is now a peer dependency** — npm consumers must install `leaflet` alongside `crumb-widget` (`npm install crumb-widget leaflet`). This shrinks the published bundle by ~40% and lets your app dedupe a single Leaflet copy. The CDN/IIFE build (`crumb-widget.js`) is unaffected and still bundles Leaflet.

## 1.0.4 (April 5, 2026)

* **Also at this location** — meeting detail page now lists other meetings held at the same address, with links to their detail pages
* **Service body filter** — when the `service_body` column is enabled, a dropdown filter appears to filter meetings by service body
* **Hide header option** — new `hideHeader` global config option to hide the "Meeting Finder" title bar and meeting count

## 0.0.1 (March 27, 2026)
* Initial release.
