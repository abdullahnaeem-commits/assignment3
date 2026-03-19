<script lang="ts">
  import { renderMarkdown } from "$lib/utils/markdown";

  let {
    role,
    content,
    isLast = false,
    isLoading = false,
    isStreaming = false,
    timestamp,
    attachments,
    ragSources,
    userImage,
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
    isStreaming?: boolean;
    timestamp?: string;
    attachments?: string[];
    ragSources?: Record<string, string>; // filename -> documentId
    userImage?: string | null;
    onedit?: (newContent: string) => void;
    onregenerate?: () => void;
    versionCount?: number;
    currentVersion?: number;
    onversionchange?: (index: number) => void;
  } = $props();

  const isUser = $derived(role === "user");
  let editing = $state(false);
  let editValue = $state("");
  let copied = $state(false);

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

  async function copyToClipboard() {
    try {
      await navigator.clipboard.writeText(content);
      copied = true;
      setTimeout(() => (copied = false), 2000);
    } catch {
      // fallback
    }
  }

  function formatTime(ts: string | undefined): string {
    if (!ts) return "";
    const d = new Date(ts);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

  // Extract [[doc:filename]] citations and strip them from content
  const citedFiles = $derived(() => {
    const matches = content.matchAll(/\[\[doc:(.+?)\]\]/g);
    const files = new Set<string>();
    for (const m of matches) files.add(m[1]);
    return [...files];
  });

  const cleanContent = $derived(
    !isUser ? content.replace(/\s*\[\[doc:.+?\]\]/g, "") : content
  );

  const renderedContent = $derived(
    !isUser ? renderMarkdown(cleanContent) : ""
  );
</script>

<div class="flex {isUser ? 'justify-end' : 'justify-start'} mb-4 group">
  <div class="flex {isUser ? 'flex-row-reverse' : 'flex-row'} gap-2.5 max-w-[85%] sm:max-w-[75%]">
    <!-- Avatar -->
    <div class="flex-shrink-0 mt-1">
      {#if isUser}
        {#if userImage}
          <img src={userImage} alt="You" class="w-8 h-8 rounded-full shadow-lg shadow-blue-500/20 object-cover" referrerpolicy="no-referrer" />
        {:else}
          <div class="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
        {/if}
      {:else}
        <div class="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500/20 to-blue-500/20 border border-white/10 flex items-center justify-center">
          <svg class="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714a2.25 2.25 0 00.659 1.591L19 14.5M14.25 3.104c.251.023.501.05.75.082M19 14.5l-2.47 3.954a2.25 2.25 0 01-1.906 1.046H9.376a2.25 2.25 0 01-1.906-1.046L5 14.5m14 0a2.68 2.68 0 00-.474-.135m.474.135a2.689 2.689 0 01-.474-.135M5 14.5a2.68 2.68 0 01.474-.135m-.474.135a2.689 2.689 0 00.474-.135" />
          </svg>
        </div>
      {/if}
    </div>

    <div class="min-w-0">
    <div
      class="px-4 py-3 rounded-2xl {isUser
        ? 'bg-gradient-to-r from-blue-500 to-violet-600 text-white rounded-br-md shadow-lg shadow-blue-500/20 w-fit ml-auto'
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
      {:else if isUser}
        <div class="text-sm leading-relaxed whitespace-pre-wrap">{content.trim()}</div>
        {#if attachments && attachments.length > 0}
          <div class="flex flex-wrap gap-1.5 mt-2 pt-2 border-t border-white/20">
            {#each attachments as filename}
              <span class="inline-flex items-center gap-1 bg-white/15 text-white/90 text-xs px-2 py-0.5 rounded-md">
                <svg class="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                </svg>
                {filename}
              </span>
            {/each}
          </div>
        {/if}
      {:else}
        <div class="markdown-content {isStreaming ? 'streaming-cursor' : ''}">
          {@html renderedContent}
        </div>
        {#if !isStreaming && citedFiles().length > 0}
          <div class="flex flex-wrap gap-1.5 mt-2.5 pt-2 border-t border-white/10">
            <span class="text-[10px] text-gray-500 mr-1 self-center">Sources:</span>
            {#each citedFiles() as filename}
              {@const docId = ragSources?.[filename]}
              <a
                href={docId ? `/documents` : '#'}
                class="inline-flex items-center gap-1 bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:bg-blue-500/20 hover:text-blue-300 text-xs px-2 py-0.5 rounded-md transition cursor-pointer"
                title="View document: {filename}"
              >
                <svg class="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                {filename}
              </a>
            {/each}
          </div>
        {/if}
      {/if}
    </div>

    <!-- Timestamp + Version navigator + action buttons -->
    {#if !editing}
      <div class="flex items-center gap-2 mt-1 {isUser ? 'justify-end' : 'justify-start'}">
        <!-- Timestamp -->
        {#if timestamp}
          <span class="text-[10px] text-gray-500">{formatTime(timestamp)}</span>
        {/if}

        {#if !isLoading}
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
            <!-- Copy button -->
            <button
              onclick={copyToClipboard}
              class="text-gray-500 hover:text-gray-300 p-1 rounded transition"
              title={copied ? "Copied!" : "Copy message"}
            >
              {#if copied}
                <svg class="w-3.5 h-3.5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
              {:else}
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              {/if}
            </button>

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
        {/if}
      </div>
    {/if}
  </div>
  </div>
</div>
