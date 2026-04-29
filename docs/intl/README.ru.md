<p align="center">
  <img src="../crumb-logo.svg" alt="Логотип Crumb Widget" width="128" height="128">
</p>

<h1 align="center">Crumb Widget</h1>

<p align="center">
  <a href="https://github.com/bmlt-enabled/crumb-widget/actions/workflows/test.yml"><img src="https://github.com/bmlt-enabled/crumb-widget/actions/workflows/test.yml/badge.svg" alt="test"></a>
  <a href="https://codecov.io/gh/bmlt-enabled/crumb-widget"><img src="https://codecov.io/gh/bmlt-enabled/crumb-widget/graph/badge.svg" alt="codecov"></a>
  <a href="https://www.npmjs.com/package/crumb-widget"><img src="https://img.shields.io/npm/v/crumb-widget" alt="npm"></a>
  <a href="https://crumb.bmlt.app/?lang=ru"><img src="https://img.shields.io/badge/docs-crumb.bmlt.app-blue" alt="docs"></a>
</p>

<p align="center">
  🌐 <a href="https://github.com/bmlt-enabled/crumb-widget/">English</a> | <a href="README.es.md">Español</a> | <a href="README.pt-BR.md">Português (Brasil)</a> | <a href="README.fr.md">Français</a> | <a href="README.de.md">Deutsch</a> | <a href="README.it.md">Italiano</a> | <a href="README.sv.md">Svenska</a> | <a href="README.da.md">Dansk</a> | <a href="README.pl.md">Polski</a> | <a href="README.el.md">Ελληνικά</a> | Русский | <a href="README.ja.md">日本語</a> | <a href="README.fa.md">فارسی</a>
</p>

<p align="center">
  <strong>👉 Демо в реальном времени:</strong> <a href="https://crumb.bmlt.app/meetings.html?lang=ru">crumb.bmlt.app/meetings.html?lang=ru</a>
</p>

<p align="center">
  <img src="../screenshot-carousel.gif" alt="Crumb Widget — list, map, and meeting detail views" width="550">
</p>

Встраиваемый виджет поиска встреч NA. Построен на Svelte 5 и поставляется как единый автономный JavaScript-файл. Доступен в виде [плагина WordPress](https://wordpress.org/plugins/crumb/), [модуля Drupal](https://github.com/bmlt-enabled/crumb-drupal), [CDN-скрипта](https://cdn.aws.bmlt.app/crumb-widget.js) или [npm-пакета](https://www.npmjs.com/package/crumb-widget).

## Какую версию мне использовать?

| Ваш сайт                                                  | Используйте это                                                          |
|-----------------------------------------------------------|--------------------------------------------------------------------------|
| **WordPress**                                             | [Плагин WordPress](https://wordpress.org/plugins/crumb/)                 |
| **Drupal** 10.3+ или 11                                   | [Модуль Drupal](https://github.com/bmlt-enabled/crumb-drupal)            |
| **Wix, Squarespace, Google Sites или обычный HTML**       | Вставьте [фрагмент CDN](#быстрый-старт) в блок кода                      |
| **JS/TS-приложение** (React, Svelte, Vue, Vite и т. д.)   | `npm install crumb-widget` ([документация](https://crumb.bmlt.app/?lang=ru#npm-package)) |

## Возможности

- Виды списка и карты с поиском и фильтрами в реальном времени
- Детали встречи с маршрутом, ссылкой для виртуального присоединения и форматами
- Поиск ближайших встреч по геолокации
- Ссылки на отдельные встречи через встроенный маршрутизатор
- 13 встроенных языков (English, Español, Português (Brasil), Français, Deutsch, Italiano, Svenska, Dansk, Polski, Ελληνικά, Русский, 日本語, فارسی — включая RTL-раскладку для персидского)
- Настраиваемые столбцы, тайлы карты и пользовательские маркеры
- Вид списка, удобный для печати

## Быстрый старт

**Что вам понадобится:**

1. **URL вашего сервера BMLT** — обычно что-то вроде `https://bmlt.example.org/main_server/`. Если у вас его нет, спросите вебсервиса вашего service body.
2. (Необязательно) **ID service body** для фильтрации по конкретной области или региону. [Как его найти →](https://crumb.bmlt.app/?lang=ru#find-service-body)

**Минимальное встраивание** (вставьте в любую HTML-страницу, блок кода Squarespace, HTML-встраивание Wix и т. д.):

```html
<div id="crumb-widget" data-server="https://myserver.com/main_server/"></div>
<script type="module" src="https://cdn.aws.bmlt.app/crumb-widget.js"></script>
```

**Фильтр по одному service body:**

```html
<div id="crumb-widget"
    data-server="https://myserver.com/main_server/"
    data-service-body="3"
></div>
<script type="module" src="https://cdn.aws.bmlt.app/crumb-widget.js"></script>
```

## Документация

Ознакомьтесь с полной документацией Crumb — включая параметры конфигурации, примеры и руководство по началу работы — на **[crumb.bmlt.app](https://crumb.bmlt.app/?lang=ru)**.

## Нужна помощь?

- 🐛 **Ошибка или запрос функции:** откройте issue на [GitHub](https://github.com/bmlt-enabled/crumb-widget/issues)
- 📧 **Email:** [help@bmlt.app](mailto:help@bmlt.app)
- 💬 **Сообщество:** [группа BMLT в Facebook](https://www.facebook.com/groups/bmltapp/)

## Лицензия

MIT
