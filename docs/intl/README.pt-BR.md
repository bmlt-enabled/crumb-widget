<p align="center">
  <img src="../../pages/crumb-logo.svg" alt="Logo do Crumb Widget" width="128" height="128">
</p>

# Crumb Widget

**Leia em outros idiomas:** [English](../../README.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Italiano](README.it.md) · [Svenska](README.sv.md) · [Dansk](README.da.md) · [Polski](README.pl.md) · [Ελληνικά](README.el.md) · [Русский](README.ru.md) · [日本語](README.ja.md) · [فارسی](README.fa.md)

[![test](https://github.com/bmlt-enabled/crumb-widget/actions/workflows/test.yml/badge.svg)](https://github.com/bmlt-enabled/crumb-widget/actions/workflows/test.yml)
[![codecov](https://codecov.io/gh/bmlt-enabled/crumb-widget/graph/badge.svg)](https://codecov.io/gh/bmlt-enabled/crumb-widget)
[![npm](https://img.shields.io/npm/v/crumb-widget)](https://www.npmjs.com/package/crumb-widget)
[![docs](https://img.shields.io/badge/docs-crumb.bmlt.app-blue)](https://crumb.bmlt.app/?lang=pt-BR)

Um widget incorporável para buscar reuniões de NA. Construído com Svelte 5 e distribuído como um único arquivo JavaScript autônomo. Disponível como [plugin do WordPress](https://wordpress.org/plugins/crumb/), [módulo do Drupal](https://github.com/bmlt-enabled/crumb-drupal), [script via CDN](https://cdn.aws.bmlt.app/crumb-widget.js) ou [pacote npm](https://www.npmjs.com/package/crumb-widget).

## Recursos

- Visões de lista e mapa com busca e filtros em tempo real
- Detalhe da reunião com rotas, link para entrar virtualmente e formatos
- Busca por proximidade baseada em geolocalização
- Links para reuniões individuais via roteador embutido
- Suporte multilíngue (13 idiomas, incluindo layout RTL para persa)
- Colunas, tiles de mapa e marcadores personalizáveis
- Visão de lista pronta para impressão

## Início rápido

```html
<div id="crumb-widget" data-server="https://myserver.com/main_server/" data-service-body="3"></div>
<script type="module" src="https://cdn.aws.bmlt.app/crumb-widget.js"></script>
```

## Licença

MIT
