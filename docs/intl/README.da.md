<p align="center">
  <img src="../crumb-logo.svg" alt="Crumb Widget-logo" width="128" height="128">
</p>

<h1 align="center">Crumb Widget</h1>

<p align="center">
  <a href="https://github.com/bmlt-enabled/crumb-widget/actions/workflows/test.yml"><img src="https://github.com/bmlt-enabled/crumb-widget/actions/workflows/test.yml/badge.svg" alt="test"></a>
  <a href="https://codecov.io/gh/bmlt-enabled/crumb-widget"><img src="https://codecov.io/gh/bmlt-enabled/crumb-widget/graph/badge.svg" alt="codecov"></a>
  <a href="https://www.npmjs.com/package/crumb-widget"><img src="https://img.shields.io/npm/v/crumb-widget" alt="npm"></a>
  <a href="https://crumb.bmlt.app/?lang=da"><img src="https://img.shields.io/badge/docs-crumb.bmlt.app-blue" alt="docs"></a>
</p>

<p align="center">
  🌐 <a href="https://github.com/bmlt-enabled/crumb-widget/">English</a> | <a href="README.es.md">Español</a> | <a href="README.pt-BR.md">Português (Brasil)</a> | <a href="README.fr.md">Français</a> | <a href="README.de.md">Deutsch</a> | <a href="README.it.md">Italiano</a> | <a href="README.sv.md">Svenska</a> | Dansk | <a href="README.pl.md">Polski</a> | <a href="README.el.md">Ελληνικά</a> | <a href="README.ru.md">Русский</a> | <a href="README.ja.md">日本語</a> | <a href="README.fa.md">فارسی</a>
</p>

<p align="center">
  <strong>👉 Live-demo:</strong> <a href="https://crumb.bmlt.app/meetings.html?lang=da">crumb.bmlt.app/meetings.html?lang=da</a>
</p>

<p align="center">
  <img src="../screenshot-carousel.gif" alt="Crumb Widget — list, map, and meeting detail views" width="550">
</p>

En indlejrbar widget til at finde NA-møder. Bygget med Svelte 5 og distribueret som en enkelt selvstændig JavaScript-fil. Tilgængelig som [WordPress-plugin](https://wordpress.org/plugins/crumb/), [Drupal-modul](https://github.com/bmlt-enabled/crumb-drupal), [CDN-script](https://cdn.aws.bmlt.app/crumb-widget.js) eller [npm-pakke](https://www.npmjs.com/package/crumb-widget).

## Hvilken version skal jeg bruge?

| Dit websted                                            | Brug dette                                                               |
|--------------------------------------------------------|--------------------------------------------------------------------------|
| **WordPress**                                          | [WordPress-plugin](https://wordpress.org/plugins/crumb/)                 |
| **Drupal** 10.3+ eller 11                              | [Drupal-modul](https://github.com/bmlt-enabled/crumb-drupal)             |
| **Wix, Squarespace, Google Sites eller almindelig HTML** | Indsæt [CDN-uddraget](#hurtig-start) i en kodeblok                     |
| **En JS/TS-app** (React, Svelte, Vue, Vite osv.)       | `npm install crumb-widget` ([dokumentation](https://crumb.bmlt.app/?lang=da#npm-package)) |

## Funktioner

- Liste- og kortvisninger med realtidssøgning og filtre
- Mødedetaljer med rutevejledning, link til virtuelle møder og formater
- Geolokationsbaseret søgning efter nærliggende møder
- Individuelle mødelinks via indbygget router
- 13 indbyggede sprog (English, Español, Português (Brasil), Français, Deutsch, Italiano, Svenska, Dansk, Polski, Ελληνικά, Русский, 日本語, فارسی — inklusive RTL-layout for persisk)
- Konfigurerbare kolonner, kortfliser og brugerdefinerede markører
- Printvenlig listevisning

## Hurtig start

**Hvad du skal bruge:**

1. Din **BMLT-server-URL** — som regel noget i stil med `https://bmlt.example.org/main_server/`. Spørg dit service bodys webservant, hvis du ikke har den.
2. (Valgfrit) Et **service body-ID** for at filtrere til et bestemt område eller en region. [Sådan finder du det →](https://crumb.bmlt.app/?lang=da#find-service-body)

**Minimal indlejring** (indsæt på enhver HTML-side, Squarespace-kodeblok, Wix HTML-indlejring osv.):

```html
<div id="crumb-widget" data-server="https://myserver.com/main_server/"></div>
<script type="module" src="https://cdn.aws.bmlt.app/crumb-widget.js"></script>
```

**Filtrér til et enkelt service body:**

```html
<div id="crumb-widget"
    data-server="https://myserver.com/main_server/"
    data-service-body="3"
></div>
<script type="module" src="https://cdn.aws.bmlt.app/crumb-widget.js"></script>
```

## Dokumentation

Se den fulde Crumb-dokumentation — inklusive konfigurationsmuligheder, eksempler og en guide til at komme i gang på **[crumb.bmlt.app](https://crumb.bmlt.app/?lang=da)**.

## Brug for hjælp?

- 🐛 **Fejl eller funktionsønske:** opret et issue på [GitHub](https://github.com/bmlt-enabled/crumb-widget/issues)
- 📧 **E-mail:** [help@bmlt.app](mailto:help@bmlt.app)
- 💬 **Fællesskab:** [BMLT Facebook-gruppen](https://www.facebook.com/groups/bmltapp/)

## Licens

MIT
