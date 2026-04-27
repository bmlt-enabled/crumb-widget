<p align="center">
  <img src="../../pages/crumb-logo.svg" alt="Логотип Crumb Widget" width="128" height="128">
</p>

# Crumb Widget

**Читать на других языках:** [English](../../README.md) · [Español](README.es.md) · [Português (Brasil)](README.pt-BR.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Italiano](README.it.md) · [Svenska](README.sv.md) · [Dansk](README.da.md) · [Polski](README.pl.md) · [Ελληνικά](README.el.md) · [日本語](README.ja.md) · [فارسی](README.fa.md)

[![test](https://github.com/bmlt-enabled/crumb-widget/actions/workflows/test.yml/badge.svg)](https://github.com/bmlt-enabled/crumb-widget/actions/workflows/test.yml)
[![codecov](https://codecov.io/gh/bmlt-enabled/crumb-widget/graph/badge.svg)](https://codecov.io/gh/bmlt-enabled/crumb-widget)
[![npm](https://img.shields.io/npm/v/crumb-widget)](https://www.npmjs.com/package/crumb-widget)
[![docs](https://img.shields.io/badge/docs-crumb.bmlt.app-blue)](https://crumb.bmlt.app/?lang=ru)

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
