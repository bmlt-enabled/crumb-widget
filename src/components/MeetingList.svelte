<script lang="ts">
  import { onMount } from 'svelte';
  import QRCode from '@bmlt-enabled/qrcode-svg';
  import type { ProcessedMeeting } from '@/types/index';
  import { selectMeeting } from '@stores/ui.svelte';
  import { config } from '@stores/config.svelte';
  import { formatShortAddress, isInProgress } from '@utils/format';
  import { t } from '@stores/localization';

  function qrDataUrl(url: string): string {
    try {
      const svg = new QRCode({ content: url, padding: 0, width: 72, height: 72, color: '#000000', background: '#ffffff', ecl: 'M', join: true, xmlDeclaration: false }).svg();
      return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
    } catch {
      return '';
    }
  }

  interface Props {
    meetings: ProcessedMeeting[];
  }

  const { meetings }: Props = $props();

  const cols = $derived(new Set(config.columns));
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
    (cols.has('time') ? 1 : 0) + (cols.has('name') ? 1 : 0) + (cols.has('location') ? 1 : 0) + (cols.has('address') ? 1 : 0) + (cols.has('service_body') ? 1 : 0) || 1
  );
</script>

{#if meetings.length === 0}
  <div class="flex flex-col items-center justify-center py-16 text-gray-500">
    <svg class="mb-3 h-10 w-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
    <p class="text-sm font-medium">{$t.noMeetingsFound}</p>
    <p class="mt-1 text-xs">{$t.tryAdjustingFilters}</p>
  </div>
{:else}
  <!-- Mobile cards (below md) -->
  <div class="divide-y divide-gray-100 md:hidden">
    {#if inProgressMeetings.length > 0}
      <!-- In-progress banner -->
      <button type="button" class="bmlt-in-progress-banner flex w-full items-center justify-between px-4 py-5 text-left text-sm font-semibold" onclick={() => (inProgressOpen = !inProgressOpen)}>
        <span>
          {inProgressMeetings.length}
          {inProgressMeetings.length === 1 ? $t.meeting : $t.meetings}
          {$t.inProgress}
        </span>
        <svg class="h-4 w-4 shrink-0 transition-transform {inProgressOpen ? 'rotate-180' : ''}" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {#if inProgressOpen}
        {#each inProgressMeetings as meeting (meeting.id_bigint)}
          <button type="button" class="bmlt-row bmlt-in-progress-row flex w-full cursor-pointer gap-4 px-4 py-4 text-left" onclick={() => selectMeeting(meeting)}>
            {#if cols.has('time')}
              <div class="w-20 shrink-0 text-sm text-gray-600">
                {meeting.formattedTime + ' ' + $t.weekdaysShort[meeting.weekday_tinyint - 1]}
              </div>
            {/if}
            <div class="min-w-0 flex-1">
              {#if cols.has('name')}
                <p class="bmlt-link text-lg font-semibold">{meeting.meeting_name}</p>
              {/if}
              {#if cols.has('location') && meeting.location_text}
                <p class="mt-0.5 text-base text-gray-600">{meeting.location_text}</p>
              {/if}
              {#if cols.has('address')}
                <div class="mt-1.5 flex flex-wrap gap-2">
                  {#if meeting.isInPerson}
                    <span class="bmlt-badge-in-person inline-flex items-center gap-1.5 rounded-lg bg-green-100 px-3 py-1.5 text-sm font-medium text-green-700">
                      <svg class="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      </svg>
                      <span class="break-words">{formatShortAddress(meeting) || meeting.location_text}</span>
                    </span>
                  {/if}
                  {#if meeting.isVirtual}
                    <span class="bmlt-badge-virtual inline-flex items-center gap-1.5 rounded-lg bg-blue-100 px-3 py-1.5 text-sm font-medium text-blue-700">
                      <svg class="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                        />
                      </svg>
                      {$t.onlineMeeting}
                    </span>
                  {/if}
                </div>
              {/if}
              {#if cols.has('service_body') && meeting.service_body_name}
                <p class="mt-2.5 text-base text-gray-500">{meeting.service_body_name}</p>
              {/if}
            </div>
          </button>
        {/each}
      {/if}
    {/if}

    {#each otherMeetings as meeting (meeting.id_bigint)}
      <button type="button" class="bmlt-row flex w-full cursor-pointer gap-4 px-4 py-4 text-left transition-colors" onclick={() => selectMeeting(meeting)}>
        <!-- Left: time -->
        {#if cols.has('time')}
          <div class="w-20 shrink-0 text-sm text-gray-600">
            {meeting.formattedTime + ' ' + $t.weekdaysShort[meeting.weekday_tinyint - 1]}
          </div>
        {/if}
        <!-- Right: name + location details -->
        <div class="min-w-0 flex-1">
          {#if cols.has('name')}
            <p class="bmlt-link text-lg font-semibold text-blue-600">{meeting.meeting_name}</p>
          {/if}
          {#if cols.has('location') && meeting.location_text}
            <p class="mt-0.5 text-base text-gray-600">{meeting.location_text}</p>
          {/if}
          {#if cols.has('address')}
            <div class="mt-1.5 flex flex-wrap gap-2">
              {#if meeting.isInPerson}
                <span class="bmlt-badge-in-person inline-flex items-center gap-1.5 rounded-lg bg-green-100 px-3 py-1.5 text-sm font-medium text-green-700">
                  <svg class="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  </svg>
                  <span class="break-words">{formatShortAddress(meeting) || meeting.location_text}</span>
                </span>
              {/if}
              {#if meeting.isVirtual}
                <span class="bmlt-badge-virtual inline-flex items-center gap-1.5 rounded-lg bg-blue-100 px-3 py-1.5 text-sm font-medium text-blue-700">
                  <svg class="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                  {$t.onlineMeeting}
                </span>
              {/if}
            </div>
          {/if}
          {#if cols.has('service_body') && meeting.service_body_name}
            <p class="mt-2.5 text-base text-gray-500">{meeting.service_body_name}</p>
          {/if}
        </div>
      </button>
    {/each}
  </div>

  <!-- Desktop table (md+) -->
  <div class="hidden overflow-x-auto md:block">
    <table class="w-full border-collapse text-base">
      <thead class="bg-gray-50 text-xs font-semibold tracking-wide text-gray-500 uppercase">
        <tr>
          {#if cols.has('time')}<th class="bmlt-time-col w-24 px-4 py-2 text-left lg:w-40">{$t.dayAndTime}</th>{/if}
          {#if cols.has('name')}<th class="px-4 py-2 text-left">{$t.meetingColumn}</th>{/if}
          {#if cols.has('location')}<th class="px-4 py-2 text-left">{$t.location}</th>{/if}
          {#if cols.has('address')}<th class="px-4 py-2 text-left">{$t.address}</th>{/if}
          {#if cols.has('service_body')}<th class="hidden px-4 py-2 text-left lg:table-cell">{$t.serviceBody}</th>{/if}
        </tr>
      </thead>
      <tbody class="divide-y divide-gray-100">
        {#if inProgressMeetings.length > 0}
          <!-- In-progress banner row -->
          <tr>
            <td colspan="99" class="p-0">
              <button type="button" class="bmlt-in-progress-banner flex w-full items-center justify-center gap-2 px-4 py-5 text-sm font-semibold" onclick={() => (inProgressOpen = !inProgressOpen)}>
                <span>
                  {inProgressMeetings.length}
                  {inProgressMeetings.length === 1 ? $t.meeting : $t.meetings}
                  {$t.inProgress}
                </span>
                <svg class="h-4 w-4 shrink-0 transition-transform {inProgressOpen ? 'rotate-180' : ''}" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </td>
          </tr>

          {#if inProgressOpen}
            {#each inProgressMeetings as meeting (meeting.id_bigint)}
              <tr class="bmlt-row bmlt-in-progress-row cursor-pointer" onclick={() => selectMeeting(meeting)}>
                {#if cols.has('time')}
                  <td class="bmlt-time-col px-4 py-4 text-sm text-gray-600">
                    <time class="flex flex-col lg:flex-row lg:gap-2">
                      <span class="whitespace-nowrap">{meeting.formattedTime}</span>
                      <span class="whitespace-nowrap">{$t.weekdaysShort[meeting.weekday_tinyint - 1]}</span>
                    </time>
                  </td>
                {/if}
                {#if cols.has('name')}
                  <td class="px-4 py-4">
                    <span class="bmlt-link font-medium">{meeting.meeting_name}</span>
                    {#if meeting.comments}
                      <p class="mt-0.5 max-w-xs truncate text-xs text-gray-500">{meeting.comments}</p>
                    {/if}
                  </td>
                {/if}
                {#if cols.has('location')}
                  <td class="px-4 py-4 text-base text-gray-600">
                    {meeting.location_text ?? ''}
                  </td>
                {/if}
                {#if cols.has('address')}
                  <td class="px-4 py-4">
                    <div class="flex flex-wrap gap-2">
                      {#if meeting.isInPerson}
                        <span class="bmlt-badge-in-person inline-flex items-center gap-1.5 rounded-lg bg-green-100 px-3 py-1.5 text-sm font-medium text-green-700">
                          <svg class="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          </svg>
                          <span class="break-words">{formatShortAddress(meeting) || meeting.location_text}</span>
                        </span>
                      {/if}
                      {#if meeting.isVirtual}
                        <span class="bmlt-badge-virtual inline-flex items-center gap-1.5 rounded-lg bg-blue-100 px-3 py-1.5 text-sm font-medium text-blue-700">
                          <svg class="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              stroke-linecap="round"
                              stroke-linejoin="round"
                              stroke-width="2"
                              d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                            />
                          </svg>
                          {$t.onlineMeeting}
                        </span>
                        {#if meeting.virtual_meeting_link}
                          <img class="bmlt-print-qr" src={qrDataUrl(meeting.virtual_meeting_link)} alt="" aria-hidden="true" />
                          <span class="bmlt-print-url">{meeting.virtual_meeting_link}</span>
                        {/if}
                      {/if}
                    </div>
                  </td>
                {/if}
                {#if cols.has('service_body')}
                  <td class="hidden px-4 py-4 text-base text-gray-600 lg:table-cell">
                    {meeting.service_body_name ?? ''}
                  </td>
                {/if}
              </tr>
            {/each}
          {/if}
        {/if}

        {#each otherMeetings as meeting, i (meeting.id_bigint)}
          {#if i === 0 || otherMeetings[i - 1]?.weekday_tinyint !== meeting.weekday_tinyint}
            <tr class="bmlt-print-day-row">
              <td colspan={printHeaderColSpan}>{$t.weekdays?.[meeting.weekday_tinyint - 1] ?? $t.weekdaysShort[meeting.weekday_tinyint - 1]}</td>
            </tr>
          {/if}
          <tr class="bmlt-row cursor-pointer transition-colors" onclick={() => selectMeeting(meeting)}>
            {#if cols.has('time')}
              <td class="bmlt-time-col px-4 py-4 text-sm text-gray-600">
                <time class="flex flex-col lg:flex-row lg:gap-2">
                  <span class="whitespace-nowrap">{meeting.formattedTime}</span>
                  <span class="whitespace-nowrap">{$t.weekdaysShort[meeting.weekday_tinyint - 1]}</span>
                </time>
              </td>
            {/if}
            {#if cols.has('name')}
              <td class="px-4 py-4">
                <span class="bmlt-link font-medium text-blue-600">{meeting.meeting_name}</span>
                {#if meeting.comments}
                  <p class="mt-0.5 max-w-xs truncate text-xs text-gray-500">{meeting.comments}</p>
                {/if}
              </td>
            {/if}
            {#if cols.has('location')}
              <td class="px-4 py-4 text-base text-gray-600">
                {meeting.location_text ?? ''}
              </td>
            {/if}
            {#if cols.has('address')}
              <td class="px-4 py-4">
                <div class="flex flex-wrap gap-2">
                  {#if meeting.isInPerson}
                    <span class="bmlt-badge-in-person inline-flex items-center gap-1.5 rounded-lg bg-green-100 px-3 py-1.5 text-sm font-medium text-green-700">
                      <svg class="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      </svg>
                      <span class="break-words">{formatShortAddress(meeting) || meeting.location_text}</span>
                    </span>
                  {/if}
                  {#if meeting.isVirtual}
                    <span class="bmlt-badge-virtual inline-flex items-center gap-1.5 rounded-lg bg-blue-100 px-3 py-1.5 text-sm font-medium text-blue-700">
                      <svg class="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                        />
                      </svg>
                      {$t.onlineMeeting}
                    </span>
                  {/if}
                  {#if meeting.isVirtual && meeting.virtual_meeting_link}
                    <img class="bmlt-print-qr" src={qrDataUrl(meeting.virtual_meeting_link)} alt="" aria-hidden="true" />
                    <span class="bmlt-print-url">{meeting.virtual_meeting_link}</span>
                  {/if}
                </div>
              </td>
            {/if}
            {#if cols.has('service_body')}
              <td class="hidden px-4 py-4 text-base text-gray-600 lg:table-cell">
                {meeting.service_body_name ?? ''}
              </td>
            {/if}
          </tr>
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
