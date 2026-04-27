<p align="center">
  <img src="../../pages/crumb-logo.svg" alt="Logo Crumb Widget" width="128" height="128">
</p>

# Crumb Widget

**Czytaj w innych językach:** [English](../../README.md) · [Español](README.es.md) · [Português (Brasil)](README.pt-BR.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Italiano](README.it.md) · [Svenska](README.sv.md) · [Dansk](README.da.md) · [Ελληνικά](README.el.md) · [Русский](README.ru.md) · [日本語](README.ja.md) · [فارسی](README.fa.md)

[![test](https://github.com/bmlt-enabled/crumb-widget/actions/workflows/test.yml/badge.svg)](https://github.com/bmlt-enabled/crumb-widget/actions/workflows/test.yml)
[![codecov](https://codecov.io/gh/bmlt-enabled/crumb-widget/graph/badge.svg)](https://codecov.io/gh/bmlt-enabled/crumb-widget)
[![npm](https://img.shields.io/npm/v/crumb-widget)](https://www.npmjs.com/package/crumb-widget)
[![docs](https://img.shields.io/badge/docs-crumb.bmlt.app-blue)](https://crumb.bmlt.app/?lang=pl)

Osadzalny widżet wyszukiwarki spotkań NA. Zbudowany przy użyciu Svelte 5 i dystrybuowany jako pojedynczy, samowystarczalny plik JavaScript. Dostępny jako [wtyczka WordPress](https://wordpress.org/plugins/crumb/), [moduł Drupal](https://github.com/bmlt-enabled/crumb-drupal), [skrypt CDN](https://cdn.aws.bmlt.app/crumb-widget.js) lub [pakiet npm](https://www.npmjs.com/package/crumb-widget).

## Funkcje

- Widoki listy i mapy z wyszukiwaniem i filtrami w czasie rzeczywistym
- Szczegóły spotkania z trasą dojazdu, linkiem do dołączenia wirtualnego i formatami
- Wyszukiwanie pobliskich spotkań na podstawie geolokalizacji
- Linki do pojedynczych spotkań przez wbudowany router
- Obsługa wielu języków (13 języków, w tym układ RTL dla perskiego)
- Konfigurowalne kolumny, kafelki mapy i niestandardowe znaczniki
- Widok listy przyjazny dla drukarki

## Szybki start

```html
<div id="crumb-widget" data-server="https://myserver.com/main_server/" data-service-body="3"></div>
<script type="module" src="https://cdn.aws.bmlt.app/crumb-widget.js"></script>
```

## Licencja

MIT
