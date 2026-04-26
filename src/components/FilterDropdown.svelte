<script lang="ts" generics="T extends string | number">
  import Icon from '@components/Icon.svelte';

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
    onOpen?: () => void;
    containerClass?: string;
  }

  let { buttonLabel, isActive, selected, options, isOpen = $bindable(false), onToggle, onOpen, containerClass = '' }: Props = $props();

  let rootEl: HTMLDivElement | undefined = $state();
</script>

<svelte:window
  onclick={(e) => {
    if (isOpen && rootEl && !rootEl.contains(e.target as Node)) isOpen = false;
  }}
/>

<div class="relative md:max-w-[13rem] md:min-w-[8rem] md:flex-1 {containerClass}" bind:this={rootEl}>
  <button
    onclick={(e) => {
      e.stopPropagation();
      isOpen = !isOpen;
      if (isOpen) onOpen?.();
    }}
    class="flex w-full items-center justify-between gap-2 rounded-lg border-2 px-3 py-2.5 text-sm font-medium whitespace-nowrap transition-colors {isActive
      ? 'bmlt-filter-toggle-active border-blue-500 bg-blue-50 text-blue-700'
      : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'}"
  >
    <span class="truncate">{buttonLabel}</span>
    <Icon name="chevron-down" class="h-3.5 w-3.5 shrink-0 transition-transform {isOpen ? 'rotate-180' : ''}" />
  </button>
  {#if isOpen}
    <div class="absolute top-full left-0 z-[1001] mt-1 w-full min-w-full overflow-y-auto rounded-lg border border-gray-200 bg-white py-1 shadow-lg" style="max-height:min(18rem, 60vh)">
      {#each options as opt (opt.value)}
        <button
          onclick={() => onToggle(opt.value)}
          title={opt.title}
          class="flex w-full items-center gap-2.5 border-0 px-3 py-2 text-left text-sm hover:bg-gray-50 {selected.includes(opt.value) ? 'font-semibold text-blue-700' : 'text-gray-700'}"
        >
          <span class="flex h-4 w-4 shrink-0 items-center justify-center rounded border {selected.includes(opt.value) ? 'border-blue-600 bg-blue-600' : 'border-gray-400'}">
            {#if selected.includes(opt.value)}
              <Icon name="check" class="h-3 w-3 text-white" strokeWidth={3} />
            {/if}
          </span>
          {opt.label}
        </button>
      {/each}
    </div>
  {/if}
</div>
