<script lang="ts">
  let {
    value = $bindable(""),
    onsubmit,
    isLoading = false,
  }: {
    value: string;
    onsubmit: () => void;
    isLoading: boolean;
  } = $props();

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (value.trim() && !isLoading) {
        onsubmit();
      }
    }
  }
</script>

<form
  onsubmit={(e) => {
    e.preventDefault();
    if (value.trim() && !isLoading) onsubmit();
  }}
  class="flex gap-2 items-end"
>
  <textarea
    bind:value
    onkeydown={handleKeydown}
    placeholder="Type your message..."
    rows={1}
    disabled={isLoading}
    class="flex-1 resize-none rounded-xl border border-white/10 bg-white/5 text-white placeholder-gray-500 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
  ></textarea>
  <button
    type="submit"
    disabled={!value.trim() || isLoading}
    class="bg-gradient-to-r from-blue-500 to-violet-600 hover:from-blue-600 hover:to-violet-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white px-4 py-3 rounded-xl text-sm font-medium transition flex items-center gap-2 shadow-lg shadow-blue-500/20"
  >
    {#if isLoading}
      <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
      </svg>
    {:else}
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
      </svg>
    {/if}
    Send
  </button>
</form>
