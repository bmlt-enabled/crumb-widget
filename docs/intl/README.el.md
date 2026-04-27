<p align="center">
  <img src="../../pages/crumb-logo.svg" alt="Λογότυπο Crumb Widget" width="128" height="128">
</p>

# Crumb Widget

**Διαβάστε σε άλλες γλώσσες:** [English](../../README.md) · [Español](README.es.md) · [Português (Brasil)](README.pt-BR.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Italiano](README.it.md) · [Svenska](README.sv.md) · [Dansk](README.da.md) · [Polski](README.pl.md) · [Русский](README.ru.md) · [日本語](README.ja.md) · [فارسی](README.fa.md)

[![test](https://github.com/bmlt-enabled/crumb-widget/actions/workflows/test.yml/badge.svg)](https://github.com/bmlt-enabled/crumb-widget/actions/workflows/test.yml)
[![codecov](https://codecov.io/gh/bmlt-enabled/crumb-widget/graph/badge.svg)](https://codecov.io/gh/bmlt-enabled/crumb-widget)
[![npm](https://img.shields.io/npm/v/crumb-widget)](https://www.npmjs.com/package/crumb-widget)
[![docs](https://img.shields.io/badge/docs-crumb.bmlt.app-blue)](https://crumb.bmlt.app/)

Ένα ενσωματώσιμο widget για την εύρεση συναντήσεων NA. Κατασκευασμένο με Svelte 5 και διανέμεται ως ένα αυτόνομο αρχείο JavaScript. Διαθέσιμο ως [πρόσθετο WordPress](https://wordpress.org/plugins/crumb/), [ενότητα Drupal](https://github.com/bmlt-enabled/crumb-drupal), [σενάριο CDN](https://cdn.aws.bmlt.app/crumb-widget.js) ή [πακέτο npm](https://www.npmjs.com/package/crumb-widget).

## Χαρακτηριστικά

- Προβολές λίστας και χάρτη με αναζήτηση και φίλτρα σε πραγματικό χρόνο
- Λεπτομέρειες συνάντησης με οδηγίες, σύνδεσμο εικονικής συμμετοχής και μορφές
- Αναζήτηση κοντινών συναντήσεων με βάση τη γεωτοποθεσία
- Σύνδεσμοι μεμονωμένων συναντήσεων μέσω ενσωματωμένου δρομολογητή
- Πολύγλωσση υποστήριξη (13 γλώσσες, συμπεριλαμβανομένης διάταξης RTL για τα Περσικά)
- Παραμετροποιήσιμες στήλες, πλακίδια χάρτη και προσαρμοσμένοι δείκτες
- Φιλική προς εκτύπωση προβολή λίστας

## Γρήγορη εκκίνηση

```html
<div id="crumb-widget" data-server="https://myserver.com/main_server/" data-service-body="3"></div>
<script type="module" src="https://cdn.aws.bmlt.app/crumb-widget.js"></script>
```

## Άδεια χρήσης

MIT
