<script lang="ts">
  import { onMount } from 'svelte';
  import type { ProcessedMeeting } from '@/types/index';
  import { selectMeeting, uiState } from '@stores/ui.svelte';
  import { config } from '@stores/config.svelte';
  import { formatShortAddress, isInProgress, haversineDistanceMiles } from '@utils/format';
  import { milesToKm } from '@utils/constants';
  import { t } from '@stores/localization';
  import Icon from '@components/Icon.svelte';

  interface Props {
    meetings: ProcessedMeeting[];
  }

  const { meetings }: Props = $props();

  const cols = $derived(new Set(config.columns));

  function meetingDistanceLabel(meeting: ProcessedMeeting): string {
    if (!uiState.userLocation || !meeting.latitude || !meeting.longitude) return '';
    const distMiles = haversineDistanceMiles(uiState.userLocation.lat, uiState.userLocation.lng, Number(meeting.latitude), Number(meeting.longitude));
    const dist = config.distanceUnit === 'km' ? milesToKm(distMiles) : distMiles;
    return `${dist.toFixed(1)} ${$t[config.distanceUnit]}`;
  }
  const nowOffset = $derived(config.nowOffset ?? 10);

  const inProgressMeetings = $derived(meetings.filter((m) => isInProgress(m, nowOffset)));
  const otherMeetings = $derived(meetings.filter((m) => !isInProgress(m, nowOffset)));

  let inProgressOpen = $state(false);

  // When the user prints, force the in-progress group open so collapsed rows
  // don't silently vanish from the printout. Restore after printing.
  onMount(() => {
    const before = () => {
      inProgressOpen = true;
    };
    window.addEventListener('beforeprint', before);
    return () => window.removeEventListener('beforeprint', before);
  });

  // Column span for print-only day-group header rows.
  const printHeaderColSpan = $derived(
    (cols.has('time') ? 1 : 0) + (uiState.geoActive ? 1 : 0) + (cols.has('name') ? 1 : 0) + (cols.has('location') ? 1 : 0) + (cols.has('address') ? 1 : 0) + (cols.has('service_body') ? 1 : 0) || 1
  );
</script>

{#snippet venueBadges(meeting: ProcessedMeeting)}
  {#if meeting.isInPerson}
    <span class="bmlt-badge-in-person inline-flex items-center gap-1.5 rounded-lg bg-green-100 px-3 py-1.5 text-sm font-medium text-green-700">
      <Icon name="map-pin-outline" class="h-4 w-4 shrink-0" />
      <span class="break-words">{formatShortAddress(meeting) || meeting.location_text}</span>
    </span>
  {/if}
  {#if meeting.isVirtual}
    <span class="bmlt-badge-virtual inline-flex items-center gap-1.5 rounded-lg bg-blue-100 px-3 py-1.5 text-sm font-medium text-blue-700">
      <Icon name="video" class="h-4 w-4 shrink-0" />
      {$t.onlineMeeting}
    </span>
    {#if meeting.virtual_meeting_link}
      <span class="bmlt-print-url">{meeting.virtual_meeting_link}</span>
    {/if}
  {/if}
{/snippet}

{#snippet card(meeting: ProcessedMeeting, inProgress: boolean)}
  <button type="button" class="bmlt-row {inProgress ? 'bmlt-in-progress-row' : 'transition-colors'} flex w-full cursor-pointer gap-4 px-4 py-4 text-start" onclick={() => selectMeeting(meeting)}>
    {#if cols.has('time')}
      <div class="w-24 shrink-0 overflow-hidden text-sm text-gray-600">
        <div class="whitespace-nowrap">{meeting.formattedTime}</div>
        <div>{$t.weekdays[meeting.weekday_tinyint - 1]}</div>
        {#if uiState.geoActive}{@const d = meetingDistanceLabel(meeting)}{#if d}<div class="text-xs text-gray-400">{d}</div>{/if}{/if}
      </div>
    {/if}
    <div class="min-w-0 flex-1">
      {#if cols.has('name')}
        <p class="bmlt-link text-lg font-semibold {inProgress ? '' : 'text-blue-600'}">{meeting.meeting_name}</p>
      {/if}
      {#if cols.has('location') && meeting.location_text}
        <p class="mt-0.5 text-base text-gray-600">{meeting.location_text}</p>
      {/if}
      {#if cols.has('address')}
        <div class="mt-1.5 flex flex-wrap gap-2">
          {@render venueBadges(meeting)}
        </div>
      {/if}
      {#if cols.has('service_body') && meeting.service_body_name}
        <p class="mt-2.5 text-base text-gray-500">{meeting.service_body_name}</p>
      {/if}
    </div>
  </button>
{/snippet}

{#snippet tableRow(meeting: ProcessedMeeting, inProgress: boolean)}
  <tr class="bmlt-row {inProgress ? 'bmlt-in-progress-row' : 'transition-colors'} cursor-pointer" onclick={() => selectMeeting(meeting)}>
    {#if cols.has('time')}
      <td class="bmlt-time-col px-4 py-4 text-sm text-gray-600">
        <time class="flex flex-col lg:flex-row lg:gap-2">
          <span class="whitespace-nowrap">{meeting.formattedTime}</span>
          <span class="whitespace-nowrap">{$t.weekdays[meeting.weekday_tinyint - 1]}</span>
        </time>
      </td>
    {/if}
    {#if uiState.geoActive}
      <td class="px-4 py-4 text-sm whitespace-nowrap text-gray-500">{meetingDistanceLabel(meeting)}</td>
    {/if}
    {#if cols.has('name')}
      <td class="px-4 py-4">
        <span class="bmlt-link font-medium {inProgress ? '' : 'text-blue-600'}">{meeting.meeting_name}</span>
        {#if meeting.comments}
          <p class="mt-0.5 max-w-xs truncate text-xs text-gray-500">{meeting.comments}</p>
        {/if}
      </td>
    {/if}
    {#if cols.has('location')}
      <td class="px-4 py-4 text-base break-words text-gray-600">
        {meeting.location_text ?? ''}
      </td>
    {/if}
    {#if cols.has('address')}
      <td class="px-4 py-4">
        <div class="flex flex-wrap gap-2">
          {@render venueBadges(meeting)}
        </div>
      </td>
    {/if}
    {#if cols.has('service_body')}
      <td class="hidden px-4 py-4 text-base text-gray-600 lg:table-cell">
        {meeting.service_body_name ?? ''}
      </td>
    {/if}
  </tr>
{/snippet}

{#snippet inProgressBanner(role: 'mobile' | 'desktop')}
  {@const label = `${inProgressMeetings.length} ${inProgressMeetings.length === 1 ? $t.meeting : $t.meetings} ${$t.inProgress}`}
  {#if role === 'mobile'}
    <button type="button" class="bmlt-in-progress-banner flex w-full items-center justify-between px-4 py-5 text-start text-sm font-semibold" onclick={() => (inProgressOpen = !inProgressOpen)}>
      <span>{label}</span>
      <Icon name="chevron-down" class="h-4 w-4 shrink-0 transition-transform {inProgressOpen ? 'rotate-180' : ''}" />
    </button>
  {:else}
    <tr>
      <td colspan={printHeaderColSpan} class="p-0">
        <button type="button" class="bmlt-in-progress-banner flex w-full items-center justify-center gap-2 px-4 py-5 text-sm font-semibold" onclick={() => (inProgressOpen = !inProgressOpen)}>
          <span>{label}</span>
          <Icon name="chevron-down" class="h-4 w-4 shrink-0 transition-transform {inProgressOpen ? 'rotate-180' : ''}" />
        </button>
      </td>
    </tr>
  {/if}
{/snippet}

{#if meetings.length === 0}
  <div class="flex flex-col items-center justify-center py-16 text-gray-500">
    <Icon name="no-results" class="mb-3 h-10 w-10 text-gray-300" strokeWidth={1.5} />
    <p class="text-sm font-medium">{$t.noMeetingsFound}</p>
    <p class="mt-1 text-xs">{$t.tryAdjustingFilters}</p>
  </div>
{:else}
  <!-- Mobile cards (below md) -->
  <div class="divide-y divide-gray-100 md:hidden">
    {#if inProgressMeetings.length > 0}
      {@render inProgressBanner('mobile')}
      {#if inProgressOpen}
        {#each inProgressMeetings as meeting (meeting.id_bigint)}
          {@render card(meeting, true)}
        {/each}
      {/if}
    {/if}
    {#each otherMeetings as meeting (meeting.id_bigint)}
      {@render card(meeting, false)}
    {/each}
  </div>

  <!-- Desktop table (md+) -->
  <div class="hidden overflow-x-auto md:block">
    <table class="w-full border-collapse text-base">
      <thead class="bg-gray-50 text-xs font-semibold tracking-wide text-gray-500 uppercase">
        <tr>
          {#if cols.has('time')}<th class="bmlt-time-col w-24 px-4 py-2 text-start lg:w-40">{$t.dayAndTime}</th>{/if}
          {#if uiState.geoActive}<th class="w-24 px-3 py-2 text-start">{$t.distance}</th>{/if}
          {#if cols.has('name')}<th class="min-w-[8rem] px-4 py-2 text-start">{$t.meetingColumn}</th>{/if}
          {#if cols.has('location')}<th class="min-w-[7rem] px-4 py-2 text-start">{$t.location}</th>{/if}
          {#if cols.has('address')}<th class="px-4 py-2 text-start">{$t.address}</th>{/if}
          {#if cols.has('service_body')}<th class="hidden px-4 py-2 text-start lg:table-cell">{$t.serviceBody}</th>{/if}
        </tr>
      </thead>
      <tbody class="divide-y divide-gray-100">
        {#if inProgressMeetings.length > 0}
          {@render inProgressBanner('desktop')}
          {#if inProgressOpen}
            {#each inProgressMeetings as meeting (meeting.id_bigint)}
              {@render tableRow(meeting, true)}
            {/each}
          {/if}
        {/if}

        {#each otherMeetings as meeting, i (meeting.id_bigint)}
          {#if i === 0 || otherMeetings[i - 1]?.weekday_tinyint !== meeting.weekday_tinyint}
            <tr class="bmlt-print-day-row">
              <td colspan={printHeaderColSpan}>{$t.weekdays?.[meeting.weekday_tinyint - 1] ?? $t.weekdaysShort[meeting.weekday_tinyint - 1]}</td>
            </tr>
          {/if}
          {@render tableRow(meeting, false)}
        {/each}
      </tbody>
    </table>
  </div>

  <div class="border-t border-gray-100 px-4 py-2 text-xs text-gray-500">
    {$t.showing}
    {meetings.length}
    {meetings.length !== 1 ? $t.meetings : $t.meeting}
  </div>
{/if}

<style>
  table,
  th,
  td {
    border: none !important;
  }
</style>
