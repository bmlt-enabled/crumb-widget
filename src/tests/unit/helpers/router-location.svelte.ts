// Reactive stand-in for the router's location, used by the App test's router mock.
// The real @bmlt-enabled/svelte-spa-router exposes `location` as reactive ($state),
// so a plain object getter wouldn't let App's $derived re-run on navigation. This
// $state holder reproduces that reactivity: writing `routerLoc.value` re-derives the
// selected meeting, exercising click / in-app Back / browser Back the way the app does.
export const routerLoc = $state({ value: '/' });
