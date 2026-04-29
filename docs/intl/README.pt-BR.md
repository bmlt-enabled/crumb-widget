<p align="center">
  <img src="../crumb-logo.svg" alt="Logo do Crumb Widget" width="128" height="128">
</p>

<h1 align="center">Crumb Widget</h1>

<p align="center">
  <a href="https://github.com/bmlt-enabled/crumb-widget/actions/workflows/test.yml"><img src="https://github.com/bmlt-enabled/crumb-widget/actions/workflows/test.yml/badge.svg" alt="test"></a>
  <a href="https://codecov.io/gh/bmlt-enabled/crumb-widget"><img src="https://codecov.io/gh/bmlt-enabled/crumb-widget/graph/badge.svg" alt="codecov"></a>
  <a href="https://www.npmjs.com/package/crumb-widget"><img src="https://img.shields.io/npm/v/crumb-widget" alt="npm"></a>
  <a href="https://crumb.bmlt.app/?lang=pt-BR"><img src="https://img.shields.io/badge/docs-crumb.bmlt.app-blue" alt="docs"></a>
</p>

<p align="center">
  🌐 <a href="https://github.com/bmlt-enabled/crumb-widget/">English</a> | <a href="README.es.md">Español</a> | Português (Brasil) | <a href="README.fr.md">Français</a> | <a href="README.de.md">Deutsch</a> | <a href="README.it.md">Italiano</a> | <a href="README.sv.md">Svenska</a> | <a href="README.da.md">Dansk</a> | <a href="README.pl.md">Polski</a> | <a href="README.el.md">Ελληνικά</a> | <a href="README.ru.md">Русский</a> | <a href="README.ja.md">日本語</a> | <a href="README.fa.md">فارسی</a>
</p>

<p align="center">
  <strong>👉 Demo ao vivo:</strong> <a href="https://crumb.bmlt.app/meetings.html?lang=pt-BR">crumb.bmlt.app/meetings.html?lang=pt-BR</a>
</p>

<p align="center">
  <img src="../screenshot-carousel.gif" alt="Crumb Widget — list, map, and meeting detail views" width="550">
</p>

Um widget incorporável para buscar reuniões de NA. Construído com Svelte 5 e distribuído como um único arquivo JavaScript autônomo. Disponível como [plugin do WordPress](https://wordpress.org/plugins/crumb/), [módulo do Drupal](https://github.com/bmlt-enabled/crumb-drupal), [script via CDN](https://cdn.aws.bmlt.app/crumb-widget.js) ou [pacote npm](https://www.npmjs.com/package/crumb-widget).

## Qual versão devo usar?

| Seu site                                              | Use isto                                                                 |
|-------------------------------------------------------|--------------------------------------------------------------------------|
| **WordPress**                                         | [Plugin do WordPress](https://wordpress.org/plugins/crumb/)              |
| **Drupal** 10.3+ ou 11                                | [Módulo do Drupal](https://github.com/bmlt-enabled/crumb-drupal)         |
| **Wix, Squarespace, Google Sites ou HTML simples**    | Cole o [trecho da CDN](#início-rápido) em um bloco de código             |
| **Um app JS/TS** (React, Svelte, Vue, Vite etc.)      | `npm install crumb-widget` ([docs](https://crumb.bmlt.app/?lang=pt-BR#npm-package)) |

## Recursos

- Visões de lista e mapa com busca e filtros em tempo real
- Detalhe da reunião com rotas, link para entrar virtualmente e formatos
- Busca por proximidade baseada em geolocalização
- Links para reuniões individuais via roteador embutido
- 13 idiomas embutidos (English, Español, Português (Brasil), Français, Deutsch, Italiano, Svenska, Dansk, Polski, Ελληνικά, Русский, 日本語, فارسی — incluindo layout RTL para persa)
- Colunas, tiles de mapa e marcadores personalizáveis
- Visão de lista pronta para impressão

## Início rápido

**O que você vai precisar:**

1. A **URL do seu servidor BMLT** — geralmente algo como `https://bmlt.example.org/main_server/`. Pergunte ao webservant do seu corpo de serviço se você não tiver.
2. (Opcional) Um **ID de corpo de serviço** para filtrar por uma área ou região específica. [Como encontrar →](https://crumb.bmlt.app/?lang=pt-BR#find-service-body)

**Incorporação mínima viável** (cole em qualquer página HTML, bloco de código do Squarespace, embed HTML do Wix etc.):

```html
<div id="crumb-widget" data-server="https://myserver.com/main_server/"></div>
<script type="module" src="https://cdn.aws.bmlt.app/crumb-widget.js"></script>
```

**Filtrar por um único corpo de serviço:**

```html
<div id="crumb-widget"
    data-server="https://myserver.com/main_server/"
    data-service-body="3"
></div>
<script type="module" src="https://cdn.aws.bmlt.app/crumb-widget.js"></script>
```

## Documentação

Confira a documentação completa do Crumb — incluindo opções de configuração, exemplos e um guia de introdução em **[crumb.bmlt.app](https://crumb.bmlt.app/?lang=pt-BR)**.

## Precisa de ajuda?

- 🐛 **Bug ou pedido de recurso:** abra uma issue no [GitHub](https://github.com/bmlt-enabled/crumb-widget/issues)
- 📧 **E-mail:** [help@bmlt.app](mailto:help@bmlt.app)
- 💬 **Comunidade:** o [grupo do BMLT no Facebook](https://www.facebook.com/groups/bmltapp/)

## Licença

MIT
