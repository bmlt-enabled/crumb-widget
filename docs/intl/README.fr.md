<p align="center">
  <img src="../crumb-logo.svg" alt="Logo de Crumb Widget" width="128" height="128">
</p>

<h1 align="center">Crumb Widget</h1>

<p align="center">
  <a href="https://github.com/bmlt-enabled/crumb-widget/actions/workflows/test.yml"><img src="https://github.com/bmlt-enabled/crumb-widget/actions/workflows/test.yml/badge.svg" alt="test"></a>
  <a href="https://codecov.io/gh/bmlt-enabled/crumb-widget"><img src="https://codecov.io/gh/bmlt-enabled/crumb-widget/graph/badge.svg" alt="codecov"></a>
  <a href="https://www.npmjs.com/package/crumb-widget"><img src="https://img.shields.io/npm/v/crumb-widget" alt="npm"></a>
  <a href="https://crumb.bmlt.app/?lang=fr"><img src="https://img.shields.io/badge/docs-crumb.bmlt.app-blue" alt="docs"></a>
</p>

<p align="center">
  🌐 <a href="https://github.com/bmlt-enabled/crumb-widget/">English</a> | <a href="README.es.md">Español</a> | <a href="README.pt-BR.md">Português (Brasil)</a> | Français | <a href="README.de.md">Deutsch</a> | <a href="README.it.md">Italiano</a> | <a href="README.sv.md">Svenska</a> | <a href="README.da.md">Dansk</a> | <a href="README.pl.md">Polski</a> | <a href="README.el.md">Ελληνικά</a> | <a href="README.ru.md">Русский</a> | <a href="README.ja.md">日本語</a> | <a href="README.fa.md">فارسی</a>
</p>

<p align="center">
  <strong>👉 Démo en direct :</strong> <a href="https://crumb.bmlt.app/meetings.html?lang=fr">crumb.bmlt.app/meetings.html?lang=fr</a>
</p>

<p align="center">
  <img src="../screenshot-carousel.gif" alt="Crumb Widget — list, map, and meeting detail views" width="550">
</p>

Un widget intégrable de recherche de réunions NA. Construit avec Svelte 5 et distribué sous forme d'un fichier JavaScript unique et autonome. Disponible en [extension WordPress](https://wordpress.org/plugins/crumb/), [module Drupal](https://github.com/bmlt-enabled/crumb-drupal), [script via CDN](https://cdn.aws.bmlt.app/crumb-widget.js) ou [paquet npm](https://www.npmjs.com/package/crumb-widget).

## Quelle version utiliser ?

| Votre site                                                  | Utilisez ceci                                                            |
|-------------------------------------------------------------|--------------------------------------------------------------------------|
| **WordPress**                                               | [Extension WordPress](https://wordpress.org/plugins/crumb/)              |
| **Drupal** 10.3+ ou 11                                      | [Module Drupal](https://github.com/bmlt-enabled/crumb-drupal)            |
| **Wix, Squarespace, Google Sites ou HTML brut**             | Collez l'[extrait CDN](#démarrage-rapide) dans un bloc de code           |
| **Une appli JS/TS** (React, Svelte, Vue, Vite, etc.)        | `npm install crumb-widget` ([docs](https://crumb.bmlt.app/?lang=fr#npm-package)) |

## Fonctionnalités

- Vues liste et carte avec recherche et filtres en temps réel
- Détail de réunion avec itinéraire, lien pour rejoindre en virtuel et formats
- Recherche par proximité basée sur la géolocalisation
- Liens vers des réunions individuelles via le routeur intégré
- 13 langues intégrées (English, Español, Português (Brasil), Français, Deutsch, Italiano, Svenska, Dansk, Polski, Ελληνικά, Русский, 日本語, فارسی — y compris la disposition RTL pour le persan)
- Colonnes, tuiles de carte et marqueurs personnalisables
- Vue liste adaptée à l'impression

## Démarrage rapide

**Ce dont vous aurez besoin :**

1. L'**URL de votre serveur BMLT** — généralement quelque chose comme `https://bmlt.example.org/main_server/`. Demandez-la au webmestre de votre corps de service si vous ne l'avez pas.
2. (Optionnel) Un **ID de corps de service** pour filtrer sur une zone ou région précise. [Comment le trouver →](https://crumb.bmlt.app/?lang=fr#find-service-body)

**Intégration minimale viable** (à coller dans n'importe quelle page HTML, bloc de code Squarespace, élément Embed HTML de Wix, etc.) :

```html
<div id="crumb-widget" data-server="https://myserver.com/main_server/"></div>
<script type="module" src="https://cdn.aws.bmlt.app/crumb-widget.js"></script>
```

**Filtrer sur un seul corps de service :**

```html
<div id="crumb-widget"
    data-server="https://myserver.com/main_server/"
    data-service-body="3"
></div>
<script type="module" src="https://cdn.aws.bmlt.app/crumb-widget.js"></script>
```

## Documentation

Consultez la documentation complète de Crumb — incluant les options de configuration, des exemples et un guide de démarrage sur **[crumb.bmlt.app](https://crumb.bmlt.app/?lang=fr)**.

## Besoin d'aide ?

- 🐛 **Bug ou demande de fonctionnalité :** ouvrez un ticket sur [GitHub](https://github.com/bmlt-enabled/crumb-widget/issues)
- 📧 **E-mail :** [help@bmlt.app](mailto:help@bmlt.app)
- 💬 **Communauté :** le [groupe Facebook BMLT](https://www.facebook.com/groups/bmltapp/)

## Licence

MIT
