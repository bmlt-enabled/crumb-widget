<p align="center">
  <img src="../../pages/crumb-logo.svg" alt="Логотип Crumb Widget" width="128" height="128">
</p>

<h1 align="center">Crumb Widget</h1>

<p align="center">
  <a href="https://github.com/bmlt-enabled/crumb-widget/actions/workflows/test.yml"><img src="https://github.com/bmlt-enabled/crumb-widget/actions/workflows/test.yml/badge.svg" alt="test"></a>
  <a href="https://codecov.io/gh/bmlt-enabled/crumb-widget"><img src="https://codecov.io/gh/bmlt-enabled/crumb-widget/graph/badge.svg" alt="codecov"></a>
  <a href="https://www.npmjs.com/package/crumb-widget"><img src="https://img.shields.io/npm/v/crumb-widget" alt="npm"></a>
  <a href="https://crumb.bmlt.app/?lang=ru"><img src="https://img.shields.io/badge/docs-crumb.bmlt.app-blue" alt="docs"></a>
</p>

<p align="center">
  🌐 <a href="../../README.md">English</a> | <a href="README.es.md">Español</a> | <a href="README.pt-BR.md">Português (Brasil)</a> | <a href="README.fr.md">Français</a> | <a href="README.de.md">Deutsch</a> | <a href="README.it.md">Italiano</a> | <a href="README.sv.md">Svenska</a> | <a href="README.da.md">Dansk</a> | <a href="README.pl.md">Polski</a> | <a href="README.el.md">Ελληνικά</a> | Русский | <a href="README.ja.md">日本語</a> | <a href="README.fa.md">فارسی</a>
</p>

Встраиваемый виджет поиска встреч NA. Построен на Svelte 5 и поставляется как единый автономный JavaScript-файл. Доступен в виде [плагина WordPress](https://wordpress.org/plugins/crumb/), [модуля Drupal](https://github.com/bmlt-enabled/crumb-drupal), [CDN-скрипта](https://cdn.aws.bmlt.app/crumb-widget.js) или [npm-пакета](https://www.npmjs.com/package/crumb-widget).

## Возможности

- Виды списка и карты с поиском и фильтрами в реальном времени
- Детали встречи с маршрутом, ссылкой для виртуального присоединения и форматами
- Поиск ближайших встреч по геолокации
- Ссылки на отдельные встречи через встроенный маршрутизатор
- Многоязычная поддержка (13 языков, включая RTL-раскладку для персидского)
- Настраиваемые столбцы, тайлы карты и пользовательские маркеры
- Вид списка, удобный для печати

## Быстрый старт

```html
<div id="crumb-widget" data-server="https://myserver.com/main_server/" data-service-body="3"></div>
<script type="module" src="https://cdn.aws.bmlt.app/crumb-widget.js"></script>
```

## Лицензия

MIT
