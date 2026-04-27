<p align="center">
  <img src="../../pages/crumb-logo.svg" alt="Crumb Widgets logotyp" width="128" height="128">
</p>

# Crumb Widget

**Läs på andra språk:** [English](../../README.md) · [Español](README.es.md) · [Português (Brasil)](README.pt-BR.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Italiano](README.it.md) · [Dansk](README.da.md) · [Polski](README.pl.md) · [Ελληνικά](README.el.md) · [Русский](README.ru.md) · [日本語](README.ja.md) · [فارسی](README.fa.md)

[![test](https://github.com/bmlt-enabled/crumb-widget/actions/workflows/test.yml/badge.svg)](https://github.com/bmlt-enabled/crumb-widget/actions/workflows/test.yml)
[![codecov](https://codecov.io/gh/bmlt-enabled/crumb-widget/graph/badge.svg)](https://codecov.io/gh/bmlt-enabled/crumb-widget)
[![npm](https://img.shields.io/npm/v/crumb-widget)](https://www.npmjs.com/package/crumb-widget)
[![docs](https://img.shields.io/badge/docs-crumb.bmlt.app-blue)](https://crumb.bmlt.app/)

En inbäddningsbar widget för att hitta NA-möten. Byggd med Svelte 5 och distribuerad som en fristående JavaScript-fil. Tillgänglig som [WordPress-plugin](https://wordpress.org/plugins/crumb/), [Drupal-modul](https://github.com/bmlt-enabled/crumb-drupal), [CDN-skript](https://cdn.aws.bmlt.app/crumb-widget.js) eller [npm-paket](https://www.npmjs.com/package/crumb-widget).

## Funktioner

- List- och kartvyer med realtidssökning och filter
- Mötesdetaljer med vägbeskrivning, länk för virtuellt deltagande och format
- Geolokationsbaserad sökning efter närliggande möten
- Individuella möteslänkar via inbyggd router
- Stöd för flera språk (13 språk, inklusive RTL-layout för persiska)
- Konfigurerbara kolumner, kartrutor och anpassade markörer
- Utskriftsvänlig listvy

## Snabbstart

```html
<div id="crumb-widget" data-server="https://myserver.com/main_server/" data-service-body="3"></div>
<script type="module" src="https://cdn.aws.bmlt.app/crumb-widget.js"></script>
```

## Licens

MIT
