<p align="center">
  <img src="../crumb-logo.svg" alt="Crumb Widget ロゴ" width="128" height="128">
</p>

<h1 align="center">Crumb Widget</h1>

<p align="center">
  <a href="https://github.com/bmlt-enabled/crumb-widget/actions/workflows/test.yml"><img src="https://github.com/bmlt-enabled/crumb-widget/actions/workflows/test.yml/badge.svg" alt="test"></a>
  <a href="https://codecov.io/gh/bmlt-enabled/crumb-widget"><img src="https://codecov.io/gh/bmlt-enabled/crumb-widget/graph/badge.svg" alt="codecov"></a>
  <a href="https://www.npmjs.com/package/crumb-widget"><img src="https://img.shields.io/npm/v/crumb-widget" alt="npm"></a>
  <a href="https://crumb.bmlt.app/?lang=ja"><img src="https://img.shields.io/badge/docs-crumb.bmlt.app-blue" alt="docs"></a>
</p>

<p align="center">
  🌐 <a href="https://github.com/bmlt-enabled/crumb-widget/">English</a> | <a href="README.es.md">Español</a> | <a href="README.pt-BR.md">Português (Brasil)</a> | <a href="README.fr.md">Français</a> | <a href="README.de.md">Deutsch</a> | <a href="README.it.md">Italiano</a> | <a href="README.sv.md">Svenska</a> | <a href="README.da.md">Dansk</a> | <a href="README.pl.md">Polski</a> | <a href="README.el.md">Ελληνικά</a> | <a href="README.ru.md">Русский</a> | 日本語 | <a href="README.fa.md">فارسی</a>
</p>

<p align="center">
  <strong>👉 ライブデモ:</strong> <a href="https://crumb.bmlt.app/meetings.html?lang=ja">crumb.bmlt.app/meetings.html?lang=ja</a>
</p>

<p align="center">
  <img src="../screenshot-carousel.gif" alt="Crumb Widget — list, map, and meeting detail views" width="550">
</p>

埋め込み可能な NA ミーティング検索ウィジェットです。Svelte 5 で構築されており、自己完結型の単一 JavaScript ファイルとして配布されます。[WordPress プラグイン](https://wordpress.org/plugins/crumb/)、[Drupal モジュール](https://github.com/bmlt-enabled/crumb-drupal)、[Joomla 拡張](https://github.com/bmlt-enabled/crumb-joomla)、[CDN スクリプト](https://cdn.aws.bmlt.app/crumb-widget.js)、[npm パッケージ](https://www.npmjs.com/package/crumb-widget)として利用できます。

## どのバージョンを使うべき？

| あなたのサイト                                            | 使用するもの                                                            |
|------------------------------------------------------|----------------------------------------------------------------------|
| **WordPress**                                        | [WordPress プラグイン](https://wordpress.org/plugins/crumb/)            |
| **Drupal** 10.3+ または 11                            | [Drupal モジュール](https://github.com/bmlt-enabled/crumb-drupal)       |
| **Joomla** 4、5、または 6                              | [Joomla 拡張](https://github.com/bmlt-enabled/crumb-joomla)             |
| **Wix、Squarespace、Google Sites、または素の HTML**         | [CDN スニペット](#クイックスタート) をコードブロックに貼り付け                       |
| **JS/TS アプリ**（React、Svelte、Vue、Vite など）            | `npm install crumb-widget`（[ドキュメント](https://crumb.bmlt.app/?lang=ja#npm-package)）|

## 機能

- リアルタイムの検索とフィルター付きのリスト・地図表示
- 道順、オンライン参加リンク、形式を含むミーティング詳細
- 位置情報を使った近隣検索
- 組み込みルーターによる個別ミーティングへのリンク
- 13 の組み込み言語（English、Español、Português (Brasil)、Français、Deutsch、Italiano、Svenska、Dansk、Polski、Ελληνικά、Русский、日本語、فارسی — ペルシア語の RTL レイアウトを含む）
- カスタマイズ可能な列、地図タイル、マーカー
- 印刷向きのリスト表示

## クイックスタート

**必要なもの:**

1. **BMLT サーバの URL** — 通常は `https://bmlt.example.org/main_server/` のような形式です。分からない場合はサービスボディの Web 担当者にお尋ねください。
2. （任意）特定のエリアやリージョンに絞り込むための **サービスボディ ID**。[確認方法はこちら →](https://crumb.bmlt.app/?lang=ja#find-service-body)

**最小限の埋め込み**（任意の HTML ページ、Squarespace のコードブロック、Wix の HTML 埋め込みなどに貼り付けます）:

```html
<div id="crumb-widget" data-server="https://myserver.com/main_server/"></div>
<script type="module" src="https://cdn.aws.bmlt.app/crumb-widget.js"></script>
```

**単一のサービスボディに絞り込む場合:**

```html
<div id="crumb-widget"
    data-server="https://myserver.com/main_server/"
    data-service-body="3"
></div>
<script type="module" src="https://cdn.aws.bmlt.app/crumb-widget.js"></script>
```

## ドキュメント

設定オプション、サンプル、はじめにガイドを含む Crumb の完全なドキュメントは **[crumb.bmlt.app](https://crumb.bmlt.app/?lang=ja)** でご覧いただけます。

## サポートが必要ですか？

- 🐛 **バグや機能のリクエスト:** [GitHub](https://github.com/bmlt-enabled/crumb-widget/issues) でイシューを開いてください
- 📧 **メール:** [help@bmlt.app](mailto:help@bmlt.app)
- 💬 **コミュニティ:** [BMLT Facebook グループ](https://www.facebook.com/groups/bmltapp/)

## ライセンス

MIT
