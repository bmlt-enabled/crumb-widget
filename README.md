<p align="center">
  <img src="pages/crumb-logo.svg" alt="Crumb Widget logo" width="128" height="128">
</p>

# Crumb Widget

[![test](https://github.com/bmlt-enabled/crumb-widget/actions/workflows/test.yml/badge.svg)](https://github.com/bmlt-enabled/crumb-widget/actions/workflows/test.yml)
[![codecov](https://codecov.io/gh/bmlt-enabled/crumb-widget/graph/badge.svg)](https://codecov.io/gh/bmlt-enabled/crumb-widget)
[![npm](https://img.shields.io/npm/v/crumb-widget)](https://www.npmjs.com/package/crumb-widget)
[![docs](https://img.shields.io/badge/docs-crumb.bmlt.app-blue)](https://crumb.bmlt.app/)

An embeddable NA meeting finder widget with search, filters, list view, map, and meeting detail. Drop a `<div>` and a `<script>` tag into any page, or install from npm for use in JavaScript and TypeScript projects.

Built with Svelte 5, distributed as a **single self-contained JavaScript file** with no host-page dependencies. Available as a [WordPress plugin](https://wordpress.org/plugins/crumb/), as an [CDN script](https://cdn.aws.bmlt.app/crumb-widget.js), or as a [npm package](https://www.npmjs.com/package/crumb-widget).

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
    data-server="https://myserver.com/main_server/"
    data-service-body="3"
></div>
<script type="module" src="https://cdn.aws.bmlt.app/crumb-widget.js"></script>
</body>
</html>
```

**Important:** Be sure your page includes `<meta name="viewport" content="width=device-width, initial-scale=1.0" />` in the `<head>`. This is important for proper rendering on mobile devices and small screens.

## Philosophy

This project aims to cover the needs of most NA service bodies well - not every possible use case. It is intentionally
kept simple and focused. New features are weighed against the cost to the codebase; niche requests that bloat the project
for everyone are generally out of scope. If you need deep customization, this may not be the right tool.
