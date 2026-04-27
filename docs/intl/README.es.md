<p align="center">
  <img src="../../pages/crumb-logo.svg" alt="Logo de Crumb Widget" width="128" height="128">
</p>

# Crumb Widget

**Lee esto en otros idiomas:** [English](../../README.md) · [Português (Brasil)](README.pt-BR.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Italiano](README.it.md) · [Svenska](README.sv.md) · [Dansk](README.da.md) · [Polski](README.pl.md) · [Ελληνικά](README.el.md) · [Русский](README.ru.md) · [日本語](README.ja.md) · [فارسی](README.fa.md)

[![test](https://github.com/bmlt-enabled/crumb-widget/actions/workflows/test.yml/badge.svg)](https://github.com/bmlt-enabled/crumb-widget/actions/workflows/test.yml)
[![codecov](https://codecov.io/gh/bmlt-enabled/crumb-widget/graph/badge.svg)](https://codecov.io/gh/bmlt-enabled/crumb-widget)
[![npm](https://img.shields.io/npm/v/crumb-widget)](https://www.npmjs.com/package/crumb-widget)
[![docs](https://img.shields.io/badge/docs-crumb.bmlt.app-blue)](https://crumb.bmlt.app/)

Un widget incrustable para encontrar reuniones de NA. Construido con Svelte 5 y distribuido como un único archivo JavaScript autónomo. Disponible como [plugin de WordPress](https://wordpress.org/plugins/crumb/), [módulo de Drupal](https://github.com/bmlt-enabled/crumb-drupal), [script desde CDN](https://cdn.aws.bmlt.app/crumb-widget.js) o [paquete npm](https://www.npmjs.com/package/crumb-widget).

## Funciones

- Vistas de lista y mapa con búsqueda y filtros en tiempo real
- Detalle de reunión con indicaciones, enlace para unirse virtualmente y formatos
- Búsqueda por cercanía basada en geolocalización
- Enlaces a reuniones individuales mediante el enrutador integrado
- Soporte multilingüe (13 idiomas, incluida la disposición RTL para persa)
- Columnas, mosaicos de mapa y marcadores personalizables
- Vista de lista optimizada para impresión

## Inicio rápido

```html
<div id="crumb-widget" data-server="https://myserver.com/main_server/" data-service-body="3"></div>
<script type="module" src="https://cdn.aws.bmlt.app/crumb-widget.js"></script>
```

## Licencia

MIT
