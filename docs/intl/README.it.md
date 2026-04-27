<p align="center">
  <img src="../../pages/crumb-logo.svg" alt="Logo di Crumb Widget" width="128" height="128">
</p>

# Crumb Widget

**Leggi in altre lingue:** [English](../../README.md) · [Español](README.es.md) · [Português (Brasil)](README.pt-BR.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Svenska](README.sv.md) · [Dansk](README.da.md) · [Polski](README.pl.md) · [Ελληνικά](README.el.md) · [Русский](README.ru.md) · [日本語](README.ja.md) · [فارسی](README.fa.md)

[![test](https://github.com/bmlt-enabled/crumb-widget/actions/workflows/test.yml/badge.svg)](https://github.com/bmlt-enabled/crumb-widget/actions/workflows/test.yml)
[![codecov](https://codecov.io/gh/bmlt-enabled/crumb-widget/graph/badge.svg)](https://codecov.io/gh/bmlt-enabled/crumb-widget)
[![npm](https://img.shields.io/npm/v/crumb-widget)](https://www.npmjs.com/package/crumb-widget)
[![docs](https://img.shields.io/badge/docs-crumb.bmlt.app-blue)](https://crumb.bmlt.app/?lang=it)

Un widget integrabile per la ricerca di riunioni NA. Costruito con Svelte 5 e distribuito come un singolo file JavaScript autonomo. Disponibile come [plugin WordPress](https://wordpress.org/plugins/crumb/), [modulo Drupal](https://github.com/bmlt-enabled/crumb-drupal), [script CDN](https://cdn.aws.bmlt.app/crumb-widget.js) o [pacchetto npm](https://www.npmjs.com/package/crumb-widget).

## Funzionalità

- Viste elenco e mappa con ricerca e filtri in tempo reale
- Dettaglio riunione con indicazioni stradali, link di partecipazione virtuale e formati
- Ricerca delle vicinanze basata sulla geolocalizzazione
- Link a singole riunioni tramite router integrato
- Supporto multilingue (13 lingue, inclusa la disposizione RTL per il persiano)
- Colonne, tessere mappa e marker personalizzabili
- Vista elenco ottimizzata per la stampa

## Avvio rapido

```html
<div id="crumb-widget" data-server="https://myserver.com/main_server/" data-service-body="3"></div>
<script type="module" src="https://cdn.aws.bmlt.app/crumb-widget.js"></script>
```

## Licenza

MIT
