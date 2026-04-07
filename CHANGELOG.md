## 1.1.0 (April 6, 2026)

* **`leaflet` is now a peer dependency** — npm consumers must install `leaflet` alongside `crumb-widget` (`npm install crumb-widget leaflet`). This shrinks the published bundle by ~40% and lets your app dedupe a single Leaflet copy. The CDN/IIFE build (`crumb-widget.js`) is unaffected and still bundles Leaflet.

## 1.0.4 (April 5, 2026)

* **Also at this location** — meeting detail page now lists other meetings held at the same address, with links to their detail pages
* **Service body filter** — when the `service_body` column is enabled, a dropdown filter appears to filter meetings by service body
* **Hide header option** — new `hideHeader` global config option to hide the "Meeting Finder" title bar and meeting count

## 0.0.1 (March 27, 2026)
* Initial release.
