/** @type {import('tailwindcss').Config} */
export default {
  // Scope all utilities under #crumb-widget so they beat WordPress's
  // unlayered CSS via ID specificity (1-1-0 > 0-x-0), without using
  // blanket !important that breaks host Tailwind apps' dark: variants.
  // Our unlayered bmlt-* custom rules (with !important) still handle
  // WordPress edge cases that need it.
  important: '#crumb-widget'
};
