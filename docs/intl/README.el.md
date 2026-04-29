<p align="center">
  <img src="../crumb-logo.svg" alt="Λογότυπο Crumb Widget" width="128" height="128">
</p>

<h1 align="center">Crumb Widget</h1>

<p align="center">
  <a href="https://github.com/bmlt-enabled/crumb-widget/actions/workflows/test.yml"><img src="https://github.com/bmlt-enabled/crumb-widget/actions/workflows/test.yml/badge.svg" alt="test"></a>
  <a href="https://codecov.io/gh/bmlt-enabled/crumb-widget"><img src="https://codecov.io/gh/bmlt-enabled/crumb-widget/graph/badge.svg" alt="codecov"></a>
  <a href="https://www.npmjs.com/package/crumb-widget"><img src="https://img.shields.io/npm/v/crumb-widget" alt="npm"></a>
  <a href="https://crumb.bmlt.app/?lang=el"><img src="https://img.shields.io/badge/docs-crumb.bmlt.app-blue" alt="docs"></a>
</p>

<p align="center">
  🌐 <a href="https://github.com/bmlt-enabled/crumb-widget/">English</a> | <a href="README.es.md">Español</a> | <a href="README.pt-BR.md">Português (Brasil)</a> | <a href="README.fr.md">Français</a> | <a href="README.de.md">Deutsch</a> | <a href="README.it.md">Italiano</a> | <a href="README.sv.md">Svenska</a> | <a href="README.da.md">Dansk</a> | <a href="README.pl.md">Polski</a> | Ελληνικά | <a href="README.ru.md">Русский</a> | <a href="README.ja.md">日本語</a> | <a href="README.fa.md">فارسی</a>
</p>

<p align="center">
  <strong>👉 Ζωντανή επίδειξη:</strong> <a href="https://crumb.bmlt.app/meetings.html?lang=el">crumb.bmlt.app/meetings.html?lang=el</a>
</p>

<p align="center">
  <img src="../screenshot-carousel.gif" alt="Crumb Widget — list, map, and meeting detail views" width="550">
</p>

Ένα ενσωματώσιμο widget για την εύρεση συναντήσεων NA. Κατασκευασμένο με Svelte 5 και διανέμεται ως ένα αυτόνομο αρχείο JavaScript. Διαθέσιμο ως [πρόσθετο WordPress](https://wordpress.org/plugins/crumb/), [ενότητα Drupal](https://github.com/bmlt-enabled/crumb-drupal), [σενάριο CDN](https://cdn.aws.bmlt.app/crumb-widget.js) ή [πακέτο npm](https://www.npmjs.com/package/crumb-widget).

## Ποια έκδοση να χρησιμοποιήσω;

| Ο ιστότοπός σας                                       | Χρησιμοποιήστε αυτό                                                       |
|-------------------------------------------------------|---------------------------------------------------------------------------|
| **WordPress**                                         | [Πρόσθετο WordPress](https://wordpress.org/plugins/crumb/)                |
| **Drupal** 10.3+ ή 11                                 | [Ενότητα Drupal](https://github.com/bmlt-enabled/crumb-drupal)            |
| **Wix, Squarespace, Google Sites ή απλό HTML**        | Επικολλήστε το [απόσπασμα CDN](#γρήγορη-εκκίνηση) σε ένα code block       |
| **Εφαρμογή JS/TS** (React, Svelte, Vue, Vite κ.λπ.)   | `npm install crumb-widget` ([τεκμηρίωση](https://crumb.bmlt.app/?lang=el#npm-package)) |

## Χαρακτηριστικά

- Προβολές λίστας και χάρτη με αναζήτηση και φίλτρα σε πραγματικό χρόνο
- Λεπτομέρειες συνάντησης με οδηγίες, σύνδεσμο εικονικής συμμετοχής και μορφές
- Αναζήτηση κοντινών συναντήσεων με βάση τη γεωτοποθεσία
- Σύνδεσμοι μεμονωμένων συναντήσεων μέσω ενσωματωμένου δρομολογητή
- 13 ενσωματωμένες γλώσσες (English, Español, Português (Brasil), Français, Deutsch, Italiano, Svenska, Dansk, Polski, Ελληνικά, Русский, 日本語, فارسی — συμπεριλαμβανομένης διάταξης RTL για τα Περσικά)
- Παραμετροποιήσιμες στήλες, πλακίδια χάρτη και προσαρμοσμένοι δείκτες
- Φιλική προς εκτύπωση προβολή λίστας

## Γρήγορη εκκίνηση

**Τι θα χρειαστείτε:**

1. Το **URL του διακομιστή BMLT σας** — συνήθως κάτι όπως `https://bmlt.example.org/main_server/`. Ρωτήστε τον webservant του service body σας αν δεν το έχετε.
2. (Προαιρετικά) Ένα **ID service body** για φιλτράρισμα σε συγκεκριμένη περιοχή ή περιφέρεια. [Πώς να το βρείτε →](https://crumb.bmlt.app/?lang=el#find-service-body)

**Ελάχιστη βιώσιμη ενσωμάτωση** (επικολλήστε σε οποιαδήποτε σελίδα HTML, code block του Squarespace, HTML embed του Wix κ.λπ.):

```html
<div id="crumb-widget" data-server="https://myserver.com/main_server/"></div>
<script type="module" src="https://cdn.aws.bmlt.app/crumb-widget.js"></script>
```

**Φιλτράρισμα σε ένα μόνο service body:**

```html
<div id="crumb-widget"
    data-server="https://myserver.com/main_server/"
    data-service-body="3"
></div>
<script type="module" src="https://cdn.aws.bmlt.app/crumb-widget.js"></script>
```

## Τεκμηρίωση

Δείτε την πλήρη τεκμηρίωση του Crumb — συμπεριλαμβανομένων επιλογών διαμόρφωσης, παραδειγμάτων και οδηγού για αρχάριους στο **[crumb.bmlt.app](https://crumb.bmlt.app/?lang=el)**.

## Χρειάζεστε βοήθεια;

- 🐛 **Σφάλμα ή αίτημα χαρακτηριστικού:** ανοίξτε ένα issue στο [GitHub](https://github.com/bmlt-enabled/crumb-widget/issues)
- 📧 **Email:** [help@bmlt.app](mailto:help@bmlt.app)
- 💬 **Κοινότητα:** η [ομάδα BMLT στο Facebook](https://www.facebook.com/groups/bmltapp/)

## Άδεια χρήσης

MIT
