<p align="center">
  <img src="../../pages/crumb-logo.svg" alt="Crumb Widget ロゴ" width="128" height="128">
</p>

# Crumb Widget

**他の言語で読む:** [English](../../README.md) · [Español](README.es.md) · [Português (Brasil)](README.pt-BR.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Italiano](README.it.md) · [Svenska](README.sv.md) · [Dansk](README.da.md) · [Polski](README.pl.md) · [Ελληνικά](README.el.md) · [Русский](README.ru.md) · [فارسی](README.fa.md)

[![test](https://github.com/bmlt-enabled/crumb-widget/actions/workflows/test.yml/badge.svg)](https://github.com/bmlt-enabled/crumb-widget/actions/workflows/test.yml)
[![codecov](https://codecov.io/gh/bmlt-enabled/crumb-widget/graph/badge.svg)](https://codecov.io/gh/bmlt-enabled/crumb-widget)
[![npm](https://img.shields.io/npm/v/crumb-widget)](https://www.npmjs.com/package/crumb-widget)
[![docs](https://img.shields.io/badge/docs-crumb.bmlt.app-blue)](https://crumb.bmlt.app/?lang=ja)

埋め込み可能な NA ミーティング検索ウィジェットです。Svelte 5 で構築されており、自己完結型の単一 JavaScript ファイルとして配布されます。[WordPress プラグイン](https://wordpress.org/plugins/crumb/)、[Drupal モジュール](https://github.com/bmlt-enabled/crumb-drupal)、[CDN スクリプト](https://cdn.aws.bmlt.app/crumb-widget.js)、[npm パッケージ](https://www.npmjs.com/package/crumb-widget)として利用できます。

## 機能

- リアルタイムの検索とフィルター付きのリスト・地図表示
- 道順、オンライン参加リンク、形式を含むミーティング詳細
- 位置情報を使った近隣検索
- 組み込みルーターによる個別ミーティングへのリンク
- 多言語対応（ペルシア語の RTL レイアウトを含む 13 言語）
- カスタマイズ可能な列、地図タイル、マーカー
- 印刷向きのリスト表示

## クイックスタート

```html
<div id="crumb-widget" data-server="https://myserver.com/main_server/" data-service-body="3"></div>
<script type="module" src="https://cdn.aws.bmlt.app/crumb-widget.js"></script>
```

## ライセンス

MIT
