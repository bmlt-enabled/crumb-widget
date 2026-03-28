/** @type {import('tailwindcss').Config} */
export default {
  // Make all utilities !important so they beat WordPress's unlayered CSS.
  // Our unlayered bmlt-* custom rules (also !important) will still win
  // because unlayered !important > layered !important in the cascade.
  important: true
};
