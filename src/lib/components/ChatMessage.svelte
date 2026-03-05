<script lang="ts">
  let {
    role,
    content,
    isLast = false,
    isLoading = false,
    onedit,
    onregenerate,
    versionCount = 1,
    currentVersion = 0,
    onversionchange,
  }: {
    role: string;
    content: string;
    isLast?: boolean;
    isLoading?: boolean;
    onedit?: (newContent: string) => void;
    onregenerate?: () => void;
    versionCount?: number;
    currentVersion?: number;
    onversionchange?: (index: number) => void;
  } = $props();

  const isUser = $derived(role === "user");
  let editing = $state(false);
  let editValue = $state("");

  function startEdit() {
    editValue = content;
    editing = true;
  }

  function cancelEdit() {
    editing = false;
    editValue = "";
  }

  function submitEdit() {
    if (editValue.trim() && editValue.trim() !== content && onedit) {
      onedit(editValue.trim());
    }
    editing = false;
  }

  function handleEditKeydown(e: KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submitEdit();
    }
    if (e.key === "Escape") {
      cancelEdit();
    }
  }
</script>

<div class="flex {isUser ? 'justify-end' : 'justify-start'} mb-4 group">
  <div class="max-w-[80%] sm:max-w-[70%]">
    <div
      class="px-4 py-3 rounded-2xl {isUser
        ? 'bg-gradient-to-r from-blue-500 to-violet-600 text-white rounded-br-md shadow-lg shadow-blue-500/20'
        : 'bg-white/10 backdrop-blur text-gray-100 rounded-bl-md border border-white/10'}"
    >
      {#if !isUser}
        <div class="text-xs font-semibold bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent mb-1">AI Assistant</div>
      {/if}

      {#if editing}
        <textarea
          bind:value={editValue}
          onkeydown={handleEditKeydown}
          rows={3}
          class="w-full bg-white/10 text-white text-sm rounded-lg px-2 py-1.5 border border-white/20 focus:outline-none focus:ring-1 focus:ring-blue-300 resize-none"
        ></textarea>
        <div class="flex gap-2 mt-2 justify-end">
          <button
            onclick={cancelEdit}
            class="text-xs px-2.5 py-1 rounded-md bg-white/10 hover:bg-white/20 text-white/70 transition"
          >
            Cancel
          </button>
          <button
            onclick={submitEdit}
            disabled={!editValue.trim() || editValue.trim() === content}
            class="text-xs px-2.5 py-1 rounded-md bg-white text-blue-600 font-medium hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            Save & Send
          </button>
        </div>
      {:else}
        <div class="text-sm leading-relaxed whitespace-pre-wrap">{content}</div>
      {/if}
    </div>

    <!-- Version navigator + action buttons -->
    {#if !editing && !isLoading}
      <div class="flex items-center gap-2 mt-1 {isUser ? 'justify-end' : 'justify-start'}">
        <!-- Version arrows -->
        {#if versionCount > 1 && onversionchange}
          <div class="flex items-center gap-1 text-gray-400">
            <button
              onclick={() => onversionchange(currentVersion - 1)}
              disabled={currentVersion <= 0}
              class="p-0.5 rounded hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition"
              title="Previous version"
            >
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <span class="text-xs font-medium tabular-nums">{currentVersion + 1}/{versionCount}</span>
            <button
              onclick={() => onversionchange(currentVersion + 1)}
              disabled={currentVersion >= versionCount - 1}
              class="p-0.5 rounded hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition"
              title="Next version"
            >
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        {/if}

        <!-- Action buttons -->
        <div class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {#if isUser && onedit}
            <button
              onclick={startEdit}
              class="text-gray-500 hover:text-gray-300 p-1 rounded transition"
              title="Edit message"
            >
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
          {/if}
          {#if !isUser && isLast && onregenerate}
            <button
              onclick={onregenerate}
              class="text-gray-500 hover:text-gray-300 p-1 rounded transition flex items-center gap-1"
              title="Regenerate response"
            >
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span class="text-xs">Regenerate</span>
            </button>
          {/if}
        </div>
      </div>
    {/if}
  </div>
</div>
