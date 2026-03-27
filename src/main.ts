import { mount } from 'svelte';
import './app.css';
import App from './App.svelte';
import { initConfig, config } from '@stores/config.svelte';

function init(): void {
  const el = document.getElementById('bmlt-meeting-list');
  if (!el) {
    console.warn('[bmlt-meeting-list] No element with id="bmlt-meeting-list" found.');
    return;
  }

  initConfig(el);

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
