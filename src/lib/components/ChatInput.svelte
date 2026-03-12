<script lang="ts">
  let {
    value = $bindable(""),
    onsubmit,
    isLoading = false,
    onfileupload,
  }: {
    value: string;
    onsubmit: () => void;
    isLoading: boolean;
    onfileupload?: (file: File) => void;
  } = $props();

  let fileInput: HTMLInputElement = $state(null!);
  let uploadingFile = $state(false);

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (value.trim() && !isLoading) {
        onsubmit();
      }
    }
  }

  async function handleFileSelect(e: Event) {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file && onfileupload) {
      uploadingFile = true;
      onfileupload(file);
      setTimeout(() => (uploadingFile = false), 3000);
    }
    input.value = "";
  }
</script>

<form
  onsubmit={(e) => {
    e.preventDefault();
    if (value.trim() && !isLoading) onsubmit();
  }}
  class="flex gap-2 items-end"
>
  {#if onfileupload}
    <button
      type="button"
      onclick={() => fileInput.click()}
      disabled={isLoading || uploadingFile}
      class="text-gray-400 hover:text-blue-400 p-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition disabled:opacity-50 disabled:cursor-not-allowed"
      title="Upload document (.txt, .pdf)"
    >
      {#if uploadingFile}
        <svg class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
        </svg>
      {:else}
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
        </svg>
      {/if}
    </button>
    <input
      bind:this={fileInput}
      type="file"
      accept=".txt,.pdf,text/plain,application/pdf"
      onchange={handleFileSelect}
      class="hidden"
    />
  {/if}
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
