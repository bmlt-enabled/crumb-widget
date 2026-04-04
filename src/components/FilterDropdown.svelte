<script lang="ts" generics="T extends string | number">
  interface Option {
    value: T;
    label: string;
    title?: string;
  }

  interface Props {
    buttonLabel: string;
    isActive: boolean;
    selected: T[];
    options: Option[];
    isOpen?: boolean;
    onToggle: (value: T) => void;
    onopen?: () => void;
    containerClass?: string;
  }

  let { buttonLabel, isActive, selected, options, isOpen = $bindable(false), onToggle, onopen, containerClass = '' }: Props = $props();

  let rootEl: HTMLDivElement | undefined = $state();
</script>

<svelte:window
  onclick={(e) => {
    if (isOpen && rootEl && !rootEl.contains(e.target as Node)) isOpen = false;
  }}
/>

<div class="relative sm:flex-none {containerClass}" bind:this={rootEl}>
  <button
    onclick={(e) => {
      e.stopPropagation();
      isOpen = !isOpen;
      if (isOpen) onopen?.();
    }}
    class="flex w-full items-center justify-between gap-2 rounded-lg border px-3 py-2.5 text-sm font-medium whitespace-nowrap transition-colors sm:w-auto {isActive
      ? 'bmlt-filter-toggle-active border-blue-500 bg-blue-50 text-blue-700'
      : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'}"
  >
    <span>{buttonLabel}</span>
    <svg class="h-3.5 w-3.5 shrink-0 transition-transform {isOpen ? 'rotate-180' : ''}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
    </svg>
  </button>
  {#if isOpen}
    <div class="absolute top-full left-0 z-[1001] mt-1 w-full min-w-[9rem] rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
      {#each options as opt (opt.value)}
        <button
          onclick={() => onToggle(opt.value)}
          title={opt.title}
          class="flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm hover:bg-gray-50 {selected.includes(opt.value) ? 'font-semibold text-blue-700' : 'text-gray-700'}"
        >
          <span class="flex h-4 w-4 shrink-0 items-center justify-center rounded border {selected.includes(opt.value) ? 'border-blue-600 bg-blue-600' : 'border-gray-400'}">
            {#if selected.includes(opt.value)}
              <svg class="h-3 w-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
              </svg>
            {/if}
          </span>
          {opt.label}
        </button>
      {/each}
    </div>
  {/if}
</div>
