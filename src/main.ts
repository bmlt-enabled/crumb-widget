import { mount } from 'svelte';
import './app.css';
import App from './App.svelte';
import { initConfig, config } from '@stores/config.svelte';

function init(): void {
  const el = document.getElementById('crumb-widget');
  if (!el) {
    console.warn('[crumb-widget] No element with id="crumb-widget" found.');
    return;
  }

  initConfig(el);

  if (config.darkMode === 'auto') {
    el.classList.add('bmlt-dark-auto');
  } else if (config.darkMode === true) {
    el.classList.add('bmlt-dark-force');
  }

  mount(App, {
    target: el,
    props: { config }
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
