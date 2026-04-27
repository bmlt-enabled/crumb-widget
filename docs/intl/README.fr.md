<p align="center">
  <img src="../../pages/crumb-logo.svg" alt="Logo de Crumb Widget" width="128" height="128">
</p>

# Crumb Widget

**Lire dans une autre langue :** [English](../../README.md) · [Español](README.es.md) · [Português (Brasil)](README.pt-BR.md) · [Deutsch](README.de.md) · [Italiano](README.it.md) · [Svenska](README.sv.md) · [Dansk](README.da.md) · [Polski](README.pl.md) · [Ελληνικά](README.el.md) · [Русский](README.ru.md) · [日本語](README.ja.md) · [فارسی](README.fa.md)

[![test](https://github.com/bmlt-enabled/crumb-widget/actions/workflows/test.yml/badge.svg)](https://github.com/bmlt-enabled/crumb-widget/actions/workflows/test.yml)
[![codecov](https://codecov.io/gh/bmlt-enabled/crumb-widget/graph/badge.svg)](https://codecov.io/gh/bmlt-enabled/crumb-widget)
[![npm](https://img.shields.io/npm/v/crumb-widget)](https://www.npmjs.com/package/crumb-widget)
[![docs](https://img.shields.io/badge/docs-crumb.bmlt.app-blue)](https://crumb.bmlt.app/)

Un widget intégrable de recherche de réunions NA. Construit avec Svelte 5 et distribué sous forme d'un fichier JavaScript unique et autonome. Disponible en [extension WordPress](https://wordpress.org/plugins/crumb/), [module Drupal](https://github.com/bmlt-enabled/crumb-drupal), [script via CDN](https://cdn.aws.bmlt.app/crumb-widget.js) ou [paquet npm](https://www.npmjs.com/package/crumb-widget).

## Fonctionnalités

- Vues liste et carte avec recherche et filtres en temps réel
- Détail de réunion avec itinéraire, lien pour rejoindre en virtuel et formats
- Recherche par proximité basée sur la géolocalisation
- Liens vers des réunions individuelles via le routeur intégré
- Prise en charge multilingue (13 langues, y compris la disposition RTL pour le persan)
- Colonnes, tuiles de carte et marqueurs personnalisables
- Vue liste adaptée à l'impression

## Démarrage rapide

```html
<div id="crumb-widget" data-server="https://myserver.com/main_server/" data-service-body="3"></div>
<script type="module" src="https://cdn.aws.bmlt.app/crumb-widget.js"></script>
```

## Licence

MIT
