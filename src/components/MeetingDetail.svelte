<script lang="ts">
  import type { ProcessedMeeting } from '@/types';
  import { clearSelectedMeeting } from '@stores/ui.svelte';
  import { getDirectionsUrl } from '@utils/format';

  interface Props {
    meeting: ProcessedMeeting;
  }

  const { meeting }: Props = $props();
</script>

<div class="mx-auto max-w-2xl px-4 py-6">
  <!-- Back button -->
  <button onclick={clearSelectedMeeting} class="bmlt-link mb-4 flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-800">
    <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
    </svg>
    Back to meetings
  </button>

  <h2 class="mb-1 text-2xl font-bold text-gray-900">{meeting.meeting_name}</h2>

  <!-- Venue type badge -->
  <div class="mb-4">
    {#if meeting.isInPerson}
      <span class="bmlt-badge-in-person inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-1 text-sm font-medium text-green-700">In-Person</span>
    {:else if meeting.isVirtual}
      <span class="bmlt-badge-virtual inline-flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-1 text-sm font-medium text-blue-700">Virtual</span>
    {:else if meeting.isHybrid}
      <span class="bmlt-badge-hybrid inline-flex items-center gap-1 rounded-full bg-purple-100 px-2.5 py-1 text-sm font-medium text-purple-700">Hybrid</span>
    {/if}
  </div>

  <div class="space-y-4">
    <!-- Schedule -->
    <div class="bmlt-card rounded-lg border border-gray-200 p-4">
      <h3 class="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-700">
        <svg class="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        Schedule
      </h3>
      <p class="text-gray-900">
        <strong>{meeting.dayName}</strong> at {meeting.formattedTime}
        {#if meeting.time_zone}
          <span class="text-sm text-gray-500">({meeting.time_zone})</span>
        {/if}
      </p>
      {#if meeting.duration_time && meeting.duration_time !== '01:00:00'}
        <p class="mt-1 text-sm text-gray-500">Duration: {meeting.duration_time.slice(0, 5).replace(/^0/, '')}</p>
      {/if}
    </div>

    <!-- Location (in-person or hybrid) -->
    {#if !meeting.isVirtual && meeting.formattedAddress}
      <div class="bmlt-card rounded-lg border border-gray-200 p-4">
        <h3 class="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-700">
          <svg class="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Location
        </h3>
        {#if meeting.location_text}
          <p class="font-medium text-gray-900">{meeting.location_text}</p>
        {/if}
        <p class="text-gray-700">{meeting.formattedAddress}</p>
        {#if meeting.location_info}
          <p class="mt-1 text-sm text-gray-500">{meeting.location_info}</p>
        {/if}
        <a href={getDirectionsUrl(meeting)} target="_blank" rel="noopener noreferrer" class="bmlt-link mt-2 inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800">
          Get directions
          <svg class="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      </div>
    {/if}

    <!-- Virtual meeting link -->
    {#if meeting.isVirtual || meeting.isHybrid}
      {#if meeting.virtual_meeting_link || meeting.virtual_meeting_additional_info}
        <div class="bmlt-card rounded-lg border border-gray-200 p-4">
          <h3 class="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-700">
            <svg class="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
            Online Meeting
          </h3>
          {#if meeting.virtual_meeting_link}
            <a
              href={meeting.virtual_meeting_link}
              target="_blank"
              rel="noopener noreferrer"
              class="bmlt-btn-primary inline-flex items-center gap-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Join Meeting
              <svg class="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          {/if}
          {#if meeting.virtual_meeting_additional_info}
            <p class="mt-2 text-sm text-gray-600">{meeting.virtual_meeting_additional_info}</p>
          {/if}
        </div>
      {/if}
    {/if}

    <!-- Formats -->
    {#if meeting.resolvedFormats.length > 0}
      <div class="bmlt-card rounded-lg border border-gray-200 p-4">
        <h3 class="mb-2 text-sm font-semibold text-gray-700">Meeting Formats</h3>
        <div class="flex flex-wrap gap-1.5">
          {#each meeting.resolvedFormats as fmt (fmt.id)}
            <span class="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-700" title={fmt.description_string}>{fmt.name_string}</span>
          {/each}
        </div>
      </div>
    {/if}

    <!-- Notes -->
    {#if meeting.comments}
      <div class="bmlt-card rounded-lg border border-gray-200 p-4">
        <h3 class="mb-2 text-sm font-semibold text-gray-700">Notes</h3>
        <p class="text-sm text-gray-600">{meeting.comments}</p>
      </div>
    {/if}

    <!-- Contact -->
    {#if meeting.email_contact}
      <div class="bmlt-card rounded-lg border border-gray-200 p-4">
        <h3 class="mb-2 text-sm font-semibold text-gray-700">Contact</h3>
        <a href="mailto:{meeting.email_contact}" class="bmlt-link text-sm text-blue-600 hover:text-blue-800">
          {meeting.email_contact}
        </a>
      </div>
    {/if}
  </div>
</div>
