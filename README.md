# Crumb Widget

An embeddable NA meeting finder widget. Drop a `<div>` and a `<script>` tag into any page and get a fully functional
meeting finder - search, filters, list view, map, and meeting detail.

Built with Svelte 5, compiled to a **single self-contained JavaScript file** with no host-page dependencies.

## Philosophy

This project aims to cover the needs of most NA service bodies well — not every possible use case. It is intentionally
kept simple and focused. New features are weighed against the cost to the codebase; niche requests that bloat the project
for everyone are generally out of scope. If you need deep customization, this may not be the right tool.

## Features

- List and map views with real-time search and filters
- Meeting detail with directions, virtual join link, and formats
- Geolocation-based nearby search
- Multi-language support
- Configurable columns, map tiles, and custom markers

## Quick Start

```html
<!doctype html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Meeting Finder</title>
</head>
<body>
<div
    id="crumb-widget"
    data-root-server="https://myserver.com/main_server/"
    data-service-body="3"
></div>
<script type="module" src="https://cdn.aws.bmlt.app/crumb-widget.js"></script>
</body>
</html>
```

**Important:** Be sure your page includes `<meta name="viewport" content="width=device-width, initial-scale=1.0" />` in the `<head>`. This is important for proper rendering on mobile devices and small screens.

Full documentation at **[crumb.bmlt.app](https://crumb.bmlt.app/)**.
