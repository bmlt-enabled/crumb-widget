<p align="center">
  <img src="../crumb-logo.svg" alt="Logo Crumb Widget" width="128" height="128">
</p>

<h1 align="center">Crumb Widget</h1>

<p align="center">
  <a href="https://github.com/bmlt-enabled/crumb-widget/actions/workflows/test.yml"><img src="https://github.com/bmlt-enabled/crumb-widget/actions/workflows/test.yml/badge.svg" alt="test"></a>
  <a href="https://codecov.io/gh/bmlt-enabled/crumb-widget"><img src="https://codecov.io/gh/bmlt-enabled/crumb-widget/graph/badge.svg" alt="codecov"></a>
  <a href="https://www.npmjs.com/package/crumb-widget"><img src="https://img.shields.io/npm/v/crumb-widget" alt="npm"></a>
  <a href="https://crumb.bmlt.app/?lang=pl"><img src="https://img.shields.io/badge/docs-crumb.bmlt.app-blue" alt="docs"></a>
</p>

<p align="center">
  🌐 <a href="README.en.md">English</a> | <a href="README.es.md">Español</a> | <a href="README.pt-BR.md">Português (Brasil)</a> | <a href="README.fr.md">Français</a> | <a href="README.de.md">Deutsch</a> | <a href="README.it.md">Italiano</a> | <a href="README.sv.md">Svenska</a> | <a href="README.da.md">Dansk</a> | Polski | <a href="README.el.md">Ελληνικά</a> | <a href="README.ru.md">Русский</a> | <a href="README.ja.md">日本語</a> | <a href="README.fa.md">فارسی</a>
</p>

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

## Dokumentacja

Zapoznaj się z pełną dokumentacją Crumb — w tym opcjami konfiguracji, przykładami i przewodnikiem wprowadzającym na **[crumb.bmlt.app](https://crumb.bmlt.app/?lang=pl)**.

## Licencja

MIT
