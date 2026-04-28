<p align="center">
  <img src="docs/crumb-logo.svg" alt="Crumb Widget logo" width="128" height="128">
</p>

<h1 align="center">Crumb Widget</h1>

<p align="center">
  <a href="https://github.com/bmlt-enabled/crumb-widget/actions/workflows/test.yml"><img src="https://github.com/bmlt-enabled/crumb-widget/actions/workflows/test.yml/badge.svg" alt="test"></a>
  <a href="https://codecov.io/gh/bmlt-enabled/crumb-widget"><img src="https://codecov.io/gh/bmlt-enabled/crumb-widget/graph/badge.svg" alt="codecov"></a>
  <a href="https://www.npmjs.com/package/crumb-widget"><img src="https://img.shields.io/npm/v/crumb-widget" alt="npm"></a>
  <a href="https://crumb.bmlt.app/"><img src="https://img.shields.io/badge/docs-crumb.bmlt.app-blue" alt="docs"></a>
</p>

<p align="center">
  🌐 English | <a href="docs/intl/README.es.md">Español</a> | <a href="docs/intl/README.pt-BR.md">Português (Brasil)</a> | <a href="docs/intl/README.fr.md">Français</a> | <a href="docs/intl/README.de.md">Deutsch</a> | <a href="docs/intl/README.it.md">Italiano</a> | <a href="docs/intl/README.sv.md">Svenska</a> | <a href="docs/intl/README.da.md">Dansk</a> | <a href="docs/intl/README.pl.md">Polski</a> | <a href="docs/intl/README.el.md">Ελληνικά</a> | <a href="docs/intl/README.ru.md">Русский</a> | <a href="docs/intl/README.ja.md">日本語</a> | <a href="docs/intl/README.fa.md">فارسی</a>
</p>

An embeddable NA meeting finder widget. Built with Svelte 5, distributed as a single self-contained JavaScript file. Available as a [WordPress plugin](https://wordpress.org/plugins/crumb/), [Drupal module](https://github.com/bmlt-enabled/crumb-drupal), [CDN script](https://cdn.aws.bmlt.app/crumb-widget.js), or [npm package](https://www.npmjs.com/package/crumb-widget).

## Features

- List and map views with real-time search and filters
- Meeting detail with directions, virtual join link, and formats
- Geolocation-based nearby search
- Individual meeting links via built-in router
- Multi-language support (13 languages, including RTL layout for Persian)
- Configurable columns, map tiles, and custom markers
- Printer-friendly list view

## Quick Start

```html
<div id="crumb-widget"
    data-server="https://myserver.com/main_server/"
    data-service-body="3"
></div>
<script type="module" src="https://cdn.aws.bmlt.app/crumb-widget.js"></script>
```

## Documentation

Check out the full Crumb documentation — including configuration options, examples, and a getting started guide at **[crumb.bmlt.app](https://crumb.bmlt.app/)**.

## License

MIT
