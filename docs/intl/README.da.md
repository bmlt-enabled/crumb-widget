<p align="center">
  <img src="../../pages/crumb-logo.svg" alt="Crumb Widget-logo" width="128" height="128">
</p>

# Crumb Widget

**Læs dette på andre sprog:** [English](../../README.md) · [Español](README.es.md) · [Português (Brasil)](README.pt-BR.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Italiano](README.it.md) · [Svenska](README.sv.md) · [Polski](README.pl.md) · [Ελληνικά](README.el.md) · [Русский](README.ru.md) · [日本語](README.ja.md) · [فارسی](README.fa.md)

[![test](https://github.com/bmlt-enabled/crumb-widget/actions/workflows/test.yml/badge.svg)](https://github.com/bmlt-enabled/crumb-widget/actions/workflows/test.yml)
[![codecov](https://codecov.io/gh/bmlt-enabled/crumb-widget/graph/badge.svg)](https://codecov.io/gh/bmlt-enabled/crumb-widget)
[![npm](https://img.shields.io/npm/v/crumb-widget)](https://www.npmjs.com/package/crumb-widget)
[![docs](https://img.shields.io/badge/docs-crumb.bmlt.app-blue)](https://crumb.bmlt.app/?lang=da)

En indlejrbar widget til at finde NA-møder. Bygget med Svelte 5 og distribueret som en enkelt selvstændig JavaScript-fil. Tilgængelig som [WordPress-plugin](https://wordpress.org/plugins/crumb/), [Drupal-modul](https://github.com/bmlt-enabled/crumb-drupal), [CDN-script](https://cdn.aws.bmlt.app/crumb-widget.js) eller [npm-pakke](https://www.npmjs.com/package/crumb-widget).

## Funktioner

- Liste- og kortvisninger med realtidssøgning og filtre
- Mødedetaljer med rutevejledning, link til virtuelle møder og formater
- Geolokationsbaseret søgning efter nærliggende møder
- Individuelle mødelinks via indbygget router
- Flersproget understøttelse (13 sprog, inklusive RTL-layout for persisk)
- Konfigurerbare kolonner, kortfliser og brugerdefinerede markører
- Printvenlig listevisning

## Hurtig start

```html
<div id="crumb-widget" data-server="https://myserver.com/main_server/" data-service-body="3"></div>
<script type="module" src="https://cdn.aws.bmlt.app/crumb-widget.js"></script>
```

## Licens

MIT
