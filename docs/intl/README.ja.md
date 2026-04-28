<p align="center">
  <img src="../../pages/crumb-logo.svg" alt="Crumb Widget ロゴ" width="128" height="128">
</p>

<h1 align="center">Crumb Widget</h1>

<p align="center">
  <a href="https://github.com/bmlt-enabled/crumb-widget/actions/workflows/test.yml"><img src="https://github.com/bmlt-enabled/crumb-widget/actions/workflows/test.yml/badge.svg" alt="test"></a>
  <a href="https://codecov.io/gh/bmlt-enabled/crumb-widget"><img src="https://codecov.io/gh/bmlt-enabled/crumb-widget/graph/badge.svg" alt="codecov"></a>
  <a href="https://www.npmjs.com/package/crumb-widget"><img src="https://img.shields.io/npm/v/crumb-widget" alt="npm"></a>
  <a href="https://crumb.bmlt.app/?lang=ja"><img src="https://img.shields.io/badge/docs-crumb.bmlt.app-blue" alt="docs"></a>
</p>

<p align="center">
  🌐 <a href="README.en.md">English</a> | <a href="README.es.md">Español</a> | <a href="README.pt-BR.md">Português (Brasil)</a> | <a href="README.fr.md">Français</a> | <a href="README.de.md">Deutsch</a> | <a href="README.it.md">Italiano</a> | <a href="README.sv.md">Svenska</a> | <a href="README.da.md">Dansk</a> | <a href="README.pl.md">Polski</a> | <a href="README.el.md">Ελληνικά</a> | <a href="README.ru.md">Русский</a> | 日本語 | <a href="README.fa.md">فارسی</a>
</p>

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

## ドキュメント

設定オプション、サンプル、はじめにガイドを含む Crumb の完全なドキュメントは **[crumb.bmlt.app](https://crumb.bmlt.app/?lang=ja)** でご覧いただけます。

## ライセンス

MIT
