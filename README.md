<p align="center">
  <img src="pages/crumb-logo.svg" alt="Crumb Widget logo" width="128" height="128">
</p>

# Crumb Widget

[![test](https://github.com/bmlt-enabled/crumb-widget/actions/workflows/test.yml/badge.svg)](https://github.com/bmlt-enabled/crumb-widget/actions/workflows/test.yml)
[![codecov](https://codecov.io/gh/bmlt-enabled/crumb-widget/graph/badge.svg)](https://codecov.io/gh/bmlt-enabled/crumb-widget)
[![npm](https://img.shields.io/npm/v/crumb-widget)](https://www.npmjs.com/package/crumb-widget)
[![docs](https://img.shields.io/badge/docs-crumb.bmlt.app-blue)](https://crumb.bmlt.app/)

An embeddable NA meeting finder widget. Built with Svelte 5, distributed as a single self-contained JavaScript file. Available as a [WordPress plugin](https://wordpress.org/plugins/crumb/), [CDN script](https://cdn.aws.bmlt.app/crumb-widget.js), or [npm package](https://www.npmjs.com/package/crumb-widget).

## Features

- List and map views with real-time search and filters
- Meeting detail with directions, virtual join link, and formats
- Geolocation-based nearby search
- Individual meeting links via built-in router
- Multi-language support
- Configurable columns, map tiles, and custom markers
- Printer-friendly list view

## Quick Start

```html
<div
    id="crumb-widget"
    data-server="https://myserver.com/main_server/"
    data-service-body="3"
></div>
<script type="module" src="https://cdn.aws.bmlt.app/crumb-widget.js"></script>
```

## License

MIT
