<p align="center">
  <img src="../crumb-logo.svg" alt="Logo di Crumb Widget" width="128" height="128">
</p>

<h1 align="center">Crumb Widget</h1>

<p align="center">
  <a href="https://github.com/bmlt-enabled/crumb-widget/actions/workflows/test.yml"><img src="https://github.com/bmlt-enabled/crumb-widget/actions/workflows/test.yml/badge.svg" alt="test"></a>
  <a href="https://codecov.io/gh/bmlt-enabled/crumb-widget"><img src="https://codecov.io/gh/bmlt-enabled/crumb-widget/graph/badge.svg" alt="codecov"></a>
  <a href="https://www.npmjs.com/package/crumb-widget"><img src="https://img.shields.io/npm/v/crumb-widget" alt="npm"></a>
  <a href="https://crumb.bmlt.app/?lang=it"><img src="https://img.shields.io/badge/docs-crumb.bmlt.app-blue" alt="docs"></a>
</p>

<p align="center">
  🌐 <a href="https://github.com/bmlt-enabled/crumb-widget/">English</a> | <a href="README.es.md">Español</a> | <a href="README.pt-BR.md">Português (Brasil)</a> | <a href="README.fr.md">Français</a> | <a href="README.de.md">Deutsch</a> | Italiano | <a href="README.sv.md">Svenska</a> | <a href="README.da.md">Dansk</a> | <a href="README.pl.md">Polski</a> | <a href="README.el.md">Ελληνικά</a> | <a href="README.ru.md">Русский</a> | <a href="README.ja.md">日本語</a> | <a href="README.fa.md">فارسی</a>
</p>

<p align="center">
  <strong>👉 Demo dal vivo:</strong> <a href="https://crumb.bmlt.app/meetings.html?lang=it">crumb.bmlt.app/meetings.html?lang=it</a>
</p>

<p align="center">
  <img src="../screenshot-carousel.gif" alt="Crumb Widget — list, map, and meeting detail views" width="550">
</p>

Un widget integrabile per la ricerca di riunioni NA. Costruito con Svelte 5 e distribuito come un singolo file JavaScript autonomo. Disponibile come [plugin WordPress](https://wordpress.org/plugins/crumb/), [modulo Drupal](https://github.com/bmlt-enabled/crumb-drupal), [estensione Joomla](https://github.com/bmlt-enabled/crumb-joomla), [script CDN](https://cdn.aws.bmlt.app/crumb-widget.js) o [pacchetto npm](https://www.npmjs.com/package/crumb-widget).

## Quale versione devo usare?

| Il tuo sito                                            | Usa questa                                                                |
|--------------------------------------------------------|---------------------------------------------------------------------------|
| **WordPress**                                          | [Plugin WordPress](https://wordpress.org/plugins/crumb/)                  |
| **Drupal** 10.3+ o 11                                  | [Modulo Drupal](https://github.com/bmlt-enabled/crumb-drupal)             |
| **Joomla** 4, 5 o 6                                    | [Estensione Joomla](https://github.com/bmlt-enabled/crumb-joomla)         |
| **Wix, Squarespace, Google Sites o HTML semplice**     | Incolla lo [snippet CDN](#avvio-rapido) in un blocco di codice            |
| **Un'app JS/TS** (React, Svelte, Vue, Vite, ecc.)      | `npm install crumb-widget` ([docs](https://crumb.bmlt.app/?lang=it#npm-package)) |

## Funzionalità

- Viste elenco e mappa con ricerca e filtri in tempo reale
- Dettaglio riunione con indicazioni stradali, link di partecipazione virtuale e formati
- Ricerca delle vicinanze basata sulla geolocalizzazione
- Link a singole riunioni tramite router integrato
- 13 lingue integrate (English, Español, Português (Brasil), Français, Deutsch, Italiano, Svenska, Dansk, Polski, Ελληνικά, Русский, 日本語, فارسی — inclusa la disposizione RTL per il persiano)
- Colonne, tessere mappa e marker personalizzabili
- Vista elenco ottimizzata per la stampa

## Avvio rapido

**Cosa ti servirà:**

1. L'**URL del tuo server BMLT** — di solito qualcosa come `https://bmlt.example.org/main_server/`. Chiedi al webservant del tuo service body se non lo hai.
2. (Opzionale) Un **ID del service body** per filtrare a un'area o regione specifica. [Come trovarlo →](https://crumb.bmlt.app/?lang=it#find-service-body)

**Integrazione minima funzionante** (incolla in qualsiasi pagina HTML, blocco di codice Squarespace, embed HTML di Wix, ecc.):

```html
<div id="crumb-widget" data-server="https://myserver.com/main_server/"></div>
<script type="module" src="https://cdn.aws.bmlt.app/crumb-widget.js"></script>
```

**Filtra per un singolo service body:**

```html
<div id="crumb-widget"
    data-server="https://myserver.com/main_server/"
    data-service-body="3"
></div>
<script type="module" src="https://cdn.aws.bmlt.app/crumb-widget.js"></script>
```

## Documentazione

Consulta la documentazione completa di Crumb — incluse le opzioni di configurazione, esempi e una guida introduttiva su **[crumb.bmlt.app](https://crumb.bmlt.app/?lang=it)**.

## Serve aiuto?

- 🐛 **Bug o richiesta di funzionalità:** apri una issue su [GitHub](https://github.com/bmlt-enabled/crumb-widget/issues)
- 📧 **Email:** [help@bmlt.app](mailto:help@bmlt.app)
- 💬 **Community:** il [gruppo Facebook BMLT](https://www.facebook.com/groups/bmltapp/)

## Licenza

MIT
