import type { TilesConfig } from '@/types';

export const RESIZE_DEBOUNCE_MS = 200;

export const DEFAULT_TILES: TilesConfig = {
  url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
};

export function isDarkMode(containerId: string): boolean {
  const el = document.getElementById(containerId);
  if (el?.classList.contains('bmlt-dark-force')) return true;
  if (el?.classList.contains('bmlt-dark-auto')) return window.matchMedia('(prefers-color-scheme: dark)').matches;
  return false;
}

/**
 * Attaches a debounced ResizeObserver that calls `invalidateSize()` after the
 * element resizes. Returns a cleanup function that clears the timer and
 * disconnects the observer.
 */
export function observeMapResize(element: Element, invalidateSize: () => void): () => void {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const observer = new ResizeObserver(() => {
    clearTimeout(timer);
    timer = setTimeout(invalidateSize, RESIZE_DEBOUNCE_MS);
  });
  observer.observe(element);
  return () => {
    clearTimeout(timer);
    observer.disconnect();
  };
}

export function buildDirectionsLinkHtml(url: string, label: string, marginTop = '8px'): string {
  return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="bmlt-btn-secondary" style="margin-top:${marginTop};display:inline-flex;align-items:center;gap:4px;padding:4px 10px;font-size:12px;border-radius:6px;border:1px solid;text-decoration:none;font-family:inherit">${label}</a>`;
}
