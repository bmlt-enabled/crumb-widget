<p align="center">
  <img src="../crumb-logo.svg" alt="Crumb Widget Logo" width="128" height="128">
</p>

<h1 align="center">Crumb Widget</h1>

<p align="center">
  <a href="https://github.com/bmlt-enabled/crumb-widget/actions/workflows/test.yml"><img src="https://github.com/bmlt-enabled/crumb-widget/actions/workflows/test.yml/badge.svg" alt="test"></a>
  <a href="https://codecov.io/gh/bmlt-enabled/crumb-widget"><img src="https://codecov.io/gh/bmlt-enabled/crumb-widget/graph/badge.svg" alt="codecov"></a>
  <a href="https://www.npmjs.com/package/crumb-widget"><img src="https://img.shields.io/npm/v/crumb-widget" alt="npm"></a>
  <a href="https://crumb.bmlt.app/?lang=de"><img src="https://img.shields.io/badge/docs-crumb.bmlt.app-blue" alt="docs"></a>
</p>

<p align="center">
  🌐 <a href="https://github.com/bmlt-enabled/crumb-widget/">English</a> | <a href="README.es.md">Español</a> | <a href="README.pt-BR.md">Português (Brasil)</a> | <a href="README.fr.md">Français</a> | Deutsch | <a href="README.it.md">Italiano</a> | <a href="README.sv.md">Svenska</a> | <a href="README.da.md">Dansk</a> | <a href="README.pl.md">Polski</a> | <a href="README.el.md">Ελληνικά</a> | <a href="README.ru.md">Русский</a> | <a href="README.ja.md">日本語</a> | <a href="README.fa.md">فارسی</a>
</p>

<p align="center">
  <strong>👉 Live-Demo:</strong> <a href="https://crumb.bmlt.app/meetings.html?lang=de">crumb.bmlt.app/meetings.html?lang=de</a>
</p>

<p align="center">
  <img src="../screenshot-carousel.gif" alt="Crumb Widget — list, map, and meeting detail views" width="550">
</p>

Ein einbettbares NA-Meeting-Finder-Widget. Erstellt mit Svelte 5 und als einzelne, eigenständige JavaScript-Datei verteilt. Verfügbar als [WordPress-Plugin](https://wordpress.org/plugins/crumb/), [Drupal-Modul](https://github.com/bmlt-enabled/crumb-drupal), [CDN-Skript](https://cdn.aws.bmlt.app/crumb-widget.js) oder [npm-Paket](https://www.npmjs.com/package/crumb-widget).

## Welche Version sollte ich verwenden?

| Deine Site                                              | Verwende dies                                                            |
|---------------------------------------------------------|--------------------------------------------------------------------------|
| **WordPress**                                           | [WordPress-Plugin](https://wordpress.org/plugins/crumb/)                 |
| **Drupal** 10.3+ oder 11                                | [Drupal-Modul](https://github.com/bmlt-enabled/crumb-drupal)             |
| **Wix, Squarespace, Google Sites oder einfaches HTML**  | Füge das [CDN-Snippet](#schnellstart) in einen Codeblock ein             |
| **Eine JS/TS-App** (React, Svelte, Vue, Vite usw.)      | `npm install crumb-widget` ([Doku](https://crumb.bmlt.app/?lang=de#npm-package)) |

## Funktionen

- Listen- und Kartenansichten mit Echtzeitsuche und Filtern
- Meeting-Details mit Wegbeschreibung, Beitrittslink für virtuelle Meetings und Formaten
- Standortbasierte Umkreissuche
- Individuelle Meeting-Links über integrierten Router
- 13 eingebaute Sprachen (English, Español, Português (Brasil), Français, Deutsch, Italiano, Svenska, Dansk, Polski, Ελληνικά, Русский, 日本語, فارسی — einschließlich RTL-Layout für Persisch)
- Konfigurierbare Spalten, Kartenkacheln und benutzerdefinierte Marker
- Druckerfreundliche Listenansicht

## Schnellstart

**Was du brauchst:**

1. Deine **BMLT-Server-URL** — meist etwas wie `https://bmlt.example.org/main_server/`. Frage den Webwart deines Service Body, falls du sie nicht hast.
2. (Optional) Eine **Service-Body-ID**, um nach einem bestimmten Bereich oder einer Region zu filtern. [So findest du sie →](https://crumb.bmlt.app/?lang=de#find-service-body)

**Minimale Einbettung** (in eine beliebige HTML-Seite, einen Squarespace-Codeblock, eine Wix-HTML-Einbettung usw. einfügen):

```html
<div id="crumb-widget" data-server="https://myserver.com/main_server/"></div>
<script type="module" src="https://cdn.aws.bmlt.app/crumb-widget.js"></script>
```

**Auf einen einzelnen Service Body filtern:**

```html
<div id="crumb-widget"
    data-server="https://myserver.com/main_server/"
    data-service-body="3"
></div>
<script type="module" src="https://cdn.aws.bmlt.app/crumb-widget.js"></script>
```

## Dokumentation

Sieh dir die vollständige Crumb-Dokumentation an — einschließlich Konfigurationsoptionen, Beispielen und einer Anleitung für den Einstieg unter **[crumb.bmlt.app](https://crumb.bmlt.app/?lang=de)**.

## Brauchst du Hilfe?

- 🐛 **Fehler oder Funktionswunsch:** öffne ein Issue auf [GitHub](https://github.com/bmlt-enabled/crumb-widget/issues)
- 📧 **E-Mail:** [help@bmlt.app](mailto:help@bmlt.app)
- 💬 **Community:** die [BMLT-Facebook-Gruppe](https://www.facebook.com/groups/bmltapp/)

## Lizenz

MIT
