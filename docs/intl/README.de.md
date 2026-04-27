<p align="center">
  <img src="../../pages/crumb-logo.svg" alt="Crumb Widget Logo" width="128" height="128">
</p>

# Crumb Widget

**In anderen Sprachen lesen:** [English](../../README.md) · [Español](README.es.md) · [Português (Brasil)](README.pt-BR.md) · [Français](README.fr.md) · [Italiano](README.it.md) · [Svenska](README.sv.md) · [Dansk](README.da.md) · [Polski](README.pl.md) · [Ελληνικά](README.el.md) · [Русский](README.ru.md) · [日本語](README.ja.md) · [فارسی](README.fa.md)

[![test](https://github.com/bmlt-enabled/crumb-widget/actions/workflows/test.yml/badge.svg)](https://github.com/bmlt-enabled/crumb-widget/actions/workflows/test.yml)
[![codecov](https://codecov.io/gh/bmlt-enabled/crumb-widget/graph/badge.svg)](https://codecov.io/gh/bmlt-enabled/crumb-widget)
[![npm](https://img.shields.io/npm/v/crumb-widget)](https://www.npmjs.com/package/crumb-widget)
[![docs](https://img.shields.io/badge/docs-crumb.bmlt.app-blue)](https://crumb.bmlt.app/)

Ein einbettbares NA-Meeting-Finder-Widget. Erstellt mit Svelte 5 und als einzelne, eigenständige JavaScript-Datei verteilt. Verfügbar als [WordPress-Plugin](https://wordpress.org/plugins/crumb/), [Drupal-Modul](https://github.com/bmlt-enabled/crumb-drupal), [CDN-Skript](https://cdn.aws.bmlt.app/crumb-widget.js) oder [npm-Paket](https://www.npmjs.com/package/crumb-widget).

## Funktionen

- Listen- und Kartenansichten mit Echtzeitsuche und Filtern
- Meeting-Details mit Wegbeschreibung, Beitrittslink für virtuelle Meetings und Formaten
- Standortbasierte Umkreissuche
- Individuelle Meeting-Links über integrierten Router
- Mehrsprachige Unterstützung (13 Sprachen, einschließlich RTL-Layout für Persisch)
- Konfigurierbare Spalten, Kartenkacheln und benutzerdefinierte Marker
- Druckerfreundliche Listenansicht

## Schnellstart

```html
<div id="crumb-widget" data-server="https://myserver.com/main_server/" data-service-body="3"></div>
<script type="module" src="https://cdn.aws.bmlt.app/crumb-widget.js"></script>
```

## Lizenz

MIT
