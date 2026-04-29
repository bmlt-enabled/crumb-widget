<p align="center">
  <img src="../crumb-logo.svg" alt="Logo de Crumb Widget" width="128" height="128">
</p>

<h1 align="center">Crumb Widget</h1>

<p align="center">
  <a href="https://github.com/bmlt-enabled/crumb-widget/actions/workflows/test.yml"><img src="https://github.com/bmlt-enabled/crumb-widget/actions/workflows/test.yml/badge.svg" alt="test"></a>
  <a href="https://codecov.io/gh/bmlt-enabled/crumb-widget"><img src="https://codecov.io/gh/bmlt-enabled/crumb-widget/graph/badge.svg" alt="codecov"></a>
  <a href="https://www.npmjs.com/package/crumb-widget"><img src="https://img.shields.io/npm/v/crumb-widget" alt="npm"></a>
  <a href="https://crumb.bmlt.app/?lang=es"><img src="https://img.shields.io/badge/docs-crumb.bmlt.app-blue" alt="docs"></a>
</p>

<p align="center">
  🌐 <a href="https://github.com/bmlt-enabled/crumb-widget/">English</a> | Español | <a href="README.pt-BR.md">Português (Brasil)</a> | <a href="README.fr.md">Français</a> | <a href="README.de.md">Deutsch</a> | <a href="README.it.md">Italiano</a> | <a href="README.sv.md">Svenska</a> | <a href="README.da.md">Dansk</a> | <a href="README.pl.md">Polski</a> | <a href="README.el.md">Ελληνικά</a> | <a href="README.ru.md">Русский</a> | <a href="README.ja.md">日本語</a> | <a href="README.fa.md">فارسی</a>
</p>

<p align="center">
  <strong>👉 Demo en vivo:</strong> <a href="https://crumb.bmlt.app/meetings.html?lang=es">crumb.bmlt.app/meetings.html?lang=es</a>
</p>

<p align="center">
  <img src="../screenshot-carousel.gif" alt="Crumb Widget — list, map, and meeting detail views" width="550">
</p>

Un widget incrustable para encontrar reuniones de NA. Construido con Svelte 5 y distribuido como un único archivo JavaScript autónomo. Disponible como [plugin de WordPress](https://wordpress.org/plugins/crumb/), [módulo de Drupal](https://github.com/bmlt-enabled/crumb-drupal), [script desde CDN](https://cdn.aws.bmlt.app/crumb-widget.js) o [paquete npm](https://www.npmjs.com/package/crumb-widget).

## ¿Qué versión debo usar?

| Tu sitio                                                  | Usa esto                                                                  |
|-----------------------------------------------------------|---------------------------------------------------------------------------|
| **WordPress**                                             | [Plugin de WordPress](https://wordpress.org/plugins/crumb/)               |
| **Drupal** 10.3+ u 11                                     | [Módulo de Drupal](https://github.com/bmlt-enabled/crumb-drupal)          |
| **Wix, Squarespace, Google Sites o HTML simple**          | Pega el [fragmento de CDN](#inicio-rápido) en un bloque de código         |
| **Una app JS/TS** (React, Svelte, Vue, Vite, etc.)        | `npm install crumb-widget` ([docs](https://crumb.bmlt.app/?lang=es#npm-package)) |

## Funciones

- Vistas de lista y mapa con búsqueda y filtros en tiempo real
- Detalle de reunión con indicaciones, enlace para unirse virtualmente y formatos
- Búsqueda por cercanía basada en geolocalización
- Enlaces a reuniones individuales mediante el enrutador integrado
- 13 idiomas integrados (English, Español, Português (Brasil), Français, Deutsch, Italiano, Svenska, Dansk, Polski, Ελληνικά, Русский, 日本語, فارسی — incluida la disposición RTL para persa)
- Columnas, mosaicos de mapa y marcadores personalizables
- Vista de lista optimizada para impresión

## Inicio rápido

**Lo que necesitarás:**

1. La **URL de tu servidor BMLT** — normalmente algo como `https://bmlt.example.org/main_server/`. Pregunta al webservant de tu cuerpo de servicio si no la tienes.
2. (Opcional) Un **ID de cuerpo de servicio** para filtrar a un área o región específica. [Cómo encontrarlo →](https://crumb.bmlt.app/?lang=es#find-service-body)

**Inserción mínima viable** (pégalo en cualquier página HTML, bloque de código de Squarespace, inserción HTML de Wix, etc.):

```html
<div id="crumb-widget" data-server="https://myserver.com/main_server/"></div>
<script type="module" src="https://cdn.aws.bmlt.app/crumb-widget.js"></script>
```

**Filtrar a un único cuerpo de servicio:**

```html
<div id="crumb-widget"
    data-server="https://myserver.com/main_server/"
    data-service-body="3"
></div>
<script type="module" src="https://cdn.aws.bmlt.app/crumb-widget.js"></script>
```

## Documentación

Consulta la documentación completa de Crumb — incluyendo opciones de configuración, ejemplos y una guía de inicio en **[crumb.bmlt.app](https://crumb.bmlt.app/?lang=es)**.

## ¿Necesitas ayuda?

- 🐛 **Error o solicitud de función:** abre un issue en [GitHub](https://github.com/bmlt-enabled/crumb-widget/issues)
- 📧 **Correo:** [help@bmlt.app](mailto:help@bmlt.app)
- 💬 **Comunidad:** el [grupo de Facebook de BMLT](https://www.facebook.com/groups/bmltapp/)

## Licencia

MIT
