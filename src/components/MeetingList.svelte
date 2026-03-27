<script lang="ts">
  import type { ProcessedMeeting } from '@/types/index';
  import { selectMeeting } from '@stores/ui.svelte';

  interface Props {
    meetings: ProcessedMeeting[];
  }

  const { meetings }: Props = $props();
</script>

{#if meetings.length === 0}
  <div class="flex flex-col items-center justify-center py-16 text-gray-500">
    <svg class="mb-3 h-10 w-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
    <p class="text-sm font-medium">No meetings found</p>
    <p class="mt-1 text-xs">Try adjusting your search or filters</p>
  </div>
{:else}
  <div class="overflow-x-auto">
    <table class="w-full text-sm">
      <thead class="sticky top-0 bg-gray-50 text-xs font-semibold tracking-wide text-gray-500 uppercase">
        <tr>
          <th class="px-4 py-2 text-left">Day &amp; Time</th>
          <th class="px-4 py-2 text-left">Meeting</th>
          <th class="hidden px-4 py-2 text-left md:table-cell">Location</th>
          <th class="hidden px-4 py-2 text-left sm:table-cell">Type</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-gray-100">
        {#each meetings as meeting (meeting.id_bigint)}
          <tr class="bmlt-row cursor-pointer transition-colors even:bg-gray-50 hover:bg-blue-50" onclick={() => selectMeeting(meeting.id_bigint)}>
            <td class="px-4 py-3 whitespace-nowrap text-gray-600">
              <span class="font-medium text-gray-800">{meeting.dayShort}</span>
              <br />
              <span class="text-xs">{meeting.formattedTime}</span>
            </td>
            <td class="px-4 py-3">
              <span class="font-medium text-gray-900">{meeting.meeting_name}</span>
              {#if meeting.comments}
                <p class="mt-0.5 max-w-xs truncate text-xs text-gray-500">{meeting.comments}</p>
              {/if}
            </td>
            <td class="hidden px-4 py-3 text-gray-600 md:table-cell">
              {#if meeting.isVirtual}
                <span class="text-xs text-gray-400 italic">Online meeting</span>
              {:else}
                <span class="truncate text-xs">{meeting.formattedAddress}</span>
              {/if}
            </td>
            <td class="hidden px-4 py-3 sm:table-cell">
              <div class="flex flex-wrap gap-1">
                {#if meeting.isInPerson}
                  <span class="bmlt-badge-in-person inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                    <svg class="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    </svg>
                    In-Person
                  </span>
                {/if}
                {#if meeting.isVirtual}
                  <span class="bmlt-badge-virtual inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                    <svg class="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    </svg>
                    Virtual
                  </span>
                {/if}
              </div>
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
  <div class="border-t border-gray-100 px-4 py-2 text-xs text-gray-400">
    Showing {meetings.length} meeting{meetings.length !== 1 ? 's' : ''}
  </div>
{/if}
