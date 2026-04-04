import L from 'leaflet';
import type { Map as LeafletMap, TileLayer } from 'leaflet';
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

export function resolveTileConfig(containerId: string, tiles?: TilesConfig, tilesDark?: TilesConfig): TilesConfig {
  return isDarkMode(containerId) && tilesDark ? tilesDark : (tiles ?? DEFAULT_TILES);
}

/**
 * Swaps the active tile layer on a Leaflet map. Returns the new TileLayer
 * so callers can track it for later removal.
 *
 * If `currentTileUrl` matches the new config's URL the call is a no-op and
 * the existing layer is returned unchanged — this prevents spurious iOS
 * prefers-color-scheme / MutationObserver events from tearing down the
 * tile layer mid-tap.
 */
export function applyTileLayer(map: LeafletMap, cfg: TilesConfig, existingLayer: TileLayer | null, currentTileUrl: string | null): { layer: TileLayer; url: string } {
  if (currentTileUrl === cfg.url && existingLayer) {
    return { layer: existingLayer, url: currentTileUrl };
  }
  existingLayer?.remove();
  const layer = L.tileLayer(cfg.url, { attribution: cfg.attribution, maxZoom: 19 });
  layer.addTo(map);
  return { layer, url: cfg.url };
}

export function buildDirectionsLinkHtml(url: string, label: string, marginTop = '8px'): string {
  return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="bmlt-btn-secondary" style="margin-top:${marginTop};display:inline-flex;align-items:center;gap:4px;padding:4px 10px;font-size:12px;border-radius:6px;border:1px solid;text-decoration:none;font-family:inherit">${label}</a>`;
}
