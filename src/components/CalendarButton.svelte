<script lang="ts">
  import type { ProcessedMeeting } from '@/types';
  import { formatGoogleCalendarUrl, downloadIcs } from '@utils/calendar';
  import { t } from '@stores/localization';

  interface Props {
    meeting: ProcessedMeeting;
  }

  const { meeting }: Props = $props();

  let open = $state(false);
  let el: HTMLDivElement;

  function toggle(e: MouseEvent) {
    e.stopPropagation();
    open = !open;
  }
</script>

<svelte:document
  onclick={(e) => {
    if (open && !el?.contains(e.target as Node)) open = false;
  }}
/>

<div bind:this={el} class="relative w-full">
  <button onclick={toggle} aria-expanded={open} class="bmlt-btn-secondary flex w-full items-center justify-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors">
    <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
    {$t.addToCalendar}
    <svg class="h-3 w-3 transition-transform {open ? 'rotate-180' : ''}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
    </svg>
  </button>

  {#if open}
    <div class="absolute left-0 z-20 mt-1 w-48 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg">
      <button
        onclick={() => {
          downloadIcs(meeting);
          open = false;
        }}
        class="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50"
      >
        <svg class="h-4 w-4 shrink-0 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        {$t.calendarIcal}
      </button>
      <a
        href={formatGoogleCalendarUrl(meeting)}
        target="_blank"
        rel="noopener noreferrer"
        onclick={() => (open = false)}
        class="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
      >
        <svg class="h-4 w-4 shrink-0 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
        </svg>
        {$t.calendarGoogle}
      </a>
    </div>
  {/if}
</div>
