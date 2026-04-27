<p align="center">
  <img src="../../pages/crumb-logo.svg" alt="Logo de Crumb Widget" width="128" height="128">
</p>

<h1 align="center">Crumb Widget</h1>

<p align="center">
  <a href="https://github.com/bmlt-enabled/crumb-widget/actions/workflows/test.yml"><img src="https://github.com/bmlt-enabled/crumb-widget/actions/workflows/test.yml/badge.svg" alt="test"></a>
  <a href="https://codecov.io/gh/bmlt-enabled/crumb-widget"><img src="https://codecov.io/gh/bmlt-enabled/crumb-widget/graph/badge.svg" alt="codecov"></a>
  <a href="https://www.npmjs.com/package/crumb-widget"><img src="https://img.shields.io/npm/v/crumb-widget" alt="npm"></a>
  <a href="https://crumb.bmlt.app/?lang=fr"><img src="https://img.shields.io/badge/docs-crumb.bmlt.app-blue" alt="docs"></a>
</p>

<p align="center">
  🌐 <a href="../../README.md">English</a> | <a href="README.es.md">Español</a> | <a href="README.pt-BR.md">Português (Brasil)</a> | Français | <a href="README.de.md">Deutsch</a> | <a href="README.it.md">Italiano</a> | <a href="README.sv.md">Svenska</a> | <a href="README.da.md">Dansk</a> | <a href="README.pl.md">Polski</a> | <a href="README.el.md">Ελληνικά</a> | <a href="README.ru.md">Русский</a> | <a href="README.ja.md">日本語</a> | <a href="README.fa.md">فارسی</a>
</p>

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

## Documentation

Consultez la documentation complète de Crumb — incluant les options de configuration, des exemples et un guide de démarrage sur **[crumb.bmlt.app](https://crumb.bmlt.app/?lang=fr)**.

## Licence

MIT
