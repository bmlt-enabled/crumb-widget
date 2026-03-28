# BMLT Client

An embeddable NA meeting finder widget. Drop a `<div>` and a `<script>` tag into any page and get a fully functional meeting finder - search, filters, list view, map, and meeting detail.

Built with Svelte 5, compiled to a **single self-contained JavaScript file** with no host-page dependencies.

## Features

- List and map views with real-time search and filters
- Meeting detail with directions, virtual join link, and formats
- Geolocation-based nearby search
- Multi-language support
- Configurable columns, map tiles, and custom markers

## Quick Start

```html
<div
  id="bmlt-meeting-list"
  data-root-server="https://your-server/main_server"
></div>
<script src="https://cdn.aws.bmlt.app/bmlt-client/app.js"></script>
```

Full documentation at **[client.bmlt.app](https://client.bmlt.app/)**.

## Contributing

See [CONTRIBUTING.md](.github/CONTRIBUTING.md).

## License

MIT — see [LICENSE](LICENSE).
