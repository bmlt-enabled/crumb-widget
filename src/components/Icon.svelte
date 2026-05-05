<script lang="ts" module>
  export type IconName = 'map-pin' | 'map-pin-outline' | 'video' | 'chevron-down' | 'chevron-left' | 'search' | 'alert' | 'no-results' | 'filter' | 'map' | 'check' | 'x' | 'lock';
</script>

<script lang="ts">
  interface Props {
    name: IconName;
    class?: string;
    strokeWidth?: number;
  }

  const { name, class: className = '', strokeWidth = 2 }: Props = $props();
</script>

<svg class={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
  {#if name === 'map-pin'}
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width={strokeWidth} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width={strokeWidth} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  {:else if name === 'map-pin-outline'}
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width={strokeWidth} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
  {:else if name === 'video'}
    <path
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-width={strokeWidth}
      d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
    />
  {:else if name === 'chevron-down'}
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width={strokeWidth} d="M19 9l-7 7-7-7" />
  {:else if name === 'chevron-left'}
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width={strokeWidth} d="M15 19l-7-7 7-7" />
  {:else if name === 'search'}
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width={strokeWidth} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  {:else if name === 'alert'}
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width={strokeWidth} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
  {:else if name === 'no-results'}
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width={strokeWidth} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  {:else if name === 'filter'}
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width={strokeWidth} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
  {:else if name === 'map'}
    <path
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-width={strokeWidth}
      d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
    />
  {:else if name === 'check'}
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width={strokeWidth} d="M5 13l4 4L19 7" />
  {:else if name === 'x'}
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width={strokeWidth} d="M6 18L18 6M6 6l12 12" />
  {:else if name === 'lock'}
    <path
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-width={strokeWidth}
      d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
    />
  {/if}
</svg>
