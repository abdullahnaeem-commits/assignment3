<script lang="ts">
  import ChatMessage from "$lib/components/ChatMessage.svelte";
  import ChatInput from "$lib/components/ChatInput.svelte";
  import ChatSidebar from "$lib/components/ChatSidebar.svelte";

  type Citation = {
    index: number;
    filename: string;
    similarity: number;
  };

  type Message = {
    id: string;
    role: "user" | "assistant";
    content: string;
    position: number;
    branch: string;
    branchGroup: string | null;
    branchIndex: number;
    parentMessageId: string | null;
    createdAt?: string;
    citations?: Citation[];
  };

  type Conversation = { id: string; title: string; updatedAt: string };

  let allMessages: Message[] = $state([]);
  // For each branchGroup, which branchIndex is active
  let activeVersions: Record<string, number> = $state({});
  // The branch we're currently "on" for sending new messages
  let activeBranch = $state("main");

  let input = $state("");
  let isLoading = $state(false);
  let streamingMessageId: string | null = $state(null);
  let error: string | null = $state(null);
  let chatContainer: HTMLDivElement;

  let conversationsList: Conversation[] = $state([]);
  let activeConversationId: string | null = $state(null);
  let sidebarOpen = $state(false);

  /**
   * Build the visible message list by walking positions and following
   * the active branch at each fork point.
   */
  const visibleMessages = $derived.by(() => {
    if (allMessages.length === 0) return [];

    // Group by position
    const byPos: Record<number, Message[]> = {};
    for (const m of allMessages) {
      if (!byPos[m.position]) byPos[m.position] = [];
      byPos[m.position].push(m);
    }

    const positions = Object.keys(byPos).map(Number).sort((a, b) => a - b);
    const result: Message[] = [];
    let currentBranch = "main";

    for (const pos of positions) {
      const msgs = byPos[pos];

      // Check if this position has a fork (branchGroup)
      const forked = msgs.filter((m) => m.branchGroup);
      if (forked.length > 0) {
        const bg = forked[0].branchGroup!;
        const activeIdx = activeVersions[bg] ?? latestIndex(bg);
        const chosen = forked.find(
          (m) => m.branchGroup === bg && m.branchIndex === activeIdx
        );
        if (chosen) {
          result.push(chosen);
          // Switch current branch to follow the chosen fork
          if (chosen.branchIndex === 0) {
            currentBranch = chosen.branch; // stays "main" for original
          } else {
            currentBranch = chosen.branch; // the branchGroup UUID for edits
          }
        }
      } else {
        // Non-forked position: only show if it belongs to current branch
        const matching = msgs.filter((m) => m.branch === currentBranch);
        if (matching.length > 0) {
          result.push(matching[0]);
        }
      }
    }

    return result;
  });

  function latestIndex(bg: string): number {
    const msgs = allMessages.filter((m) => m.branchGroup === bg);
    return msgs.length > 0 ? Math.max(...msgs.map((m) => m.branchIndex)) : 0;
  }

  function versionCount(bg: string, role: string): number {
    return allMessages.filter((m) => m.branchGroup === bg && m.role === role).length;
  }

  // Derive which branch we're on based on the last visible message
  $effect(() => {
    const vis = visibleMessages;
    if (vis.length > 0) {
      activeBranch = vis[vis.length - 1].branch;
    } else {
      activeBranch = "main";
    }
  });

  $effect(() => {
    loadConversations();
  });

  async function loadConversations() {
    try {
      const res = await fetch("/api/conversations");
      if (res.ok) conversationsList = await res.json();
    } catch { /* ignore */ }
  }

  async function loadConversation(id: string) {
    try {
      const res = await fetch(`/api/conversations/${id}`);
      if (!res.ok) return;
      const data = await res.json();
      activeConversationId = id;
      allMessages = data.messages.map((m: any) => ({
        id: m.id,
        role: m.role,
        content: m.content,
        position: m.position ?? 0,
        branch: m.branch ?? "main",
        branchGroup: m.branchGroup ?? m.branch_group ?? null,
        branchIndex: m.branchIndex ?? m.branch_index ?? 0,
        parentMessageId: m.parentMessageId ?? m.parent_message_id ?? null,
        createdAt: m.createdAt ?? m.created_at ?? undefined,
        citations: undefined,
      }));
      activeVersions = {};
      error = null;
      sidebarOpen = false;
      scrollToBottom();
    } catch {
      error = "Failed to load conversation";
    }
  }

  async function deleteConversation(id: string) {
    try {
      await fetch("/api/conversations", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId: id }),
      });
      conversationsList = conversationsList.filter((c) => c.id !== id);
      if (activeConversationId === id) startNewChat();
    } catch {
      error = "Failed to delete conversation";
    }
  }

  function startNewChat() {
    activeConversationId = null;
    allMessages = [];
    activeVersions = {};
    activeBranch = "main";
    streamingMessageId = null;
    error = null;
    input = "";
    sidebarOpen = false;
  }

  function scrollToBottom() {
    if (chatContainer) {
      setTimeout(() => { chatContainer.scrollTop = chatContainer.scrollHeight; }, 0);
    }
  }

  function handleVersionChange(branchGroup: string, newIndex: number) {
    activeVersions = { ...activeVersions, [branchGroup]: newIndex };
  }

  function parseRagSources(response: Response): Citation[] {
    const header = response.headers.get("X-Rag-Sources");
    if (!header) return [];
    try {
      return JSON.parse(header);
    } catch {
      return [];
    }
  }

  // === Send a normal new message ===
  async function handleSubmit() {
    if (!input.trim() || isLoading) return;

    const maxPos = allMessages.length > 0
      ? Math.max(...allMessages.map((m) => m.position))
      : -1;

    const tempUser: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: input.trim(),
      position: maxPos + 1,
      branch: activeBranch,
      branchGroup: null,
      branchIndex: 0,
      parentMessageId: null,
      createdAt: new Date().toISOString(),
    };

    allMessages = [...allMessages, tempUser];
    const userContent = input.trim();
    input = "";
    isLoading = true;
    error = null;
    scrollToBottom();

    try {
      const contextMsgs = visibleMessages.map((m) => ({
        role: m.role, content: m.content,
      }));

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: contextMsgs,
          conversationId: activeConversationId,
          currentBranch: activeBranch,
        }),
      });

      if (!response.ok) throw new Error(`Failed (${response.status})`);

      const newConvId = response.headers.get("X-Conversation-Id");
      if (newConvId && !activeConversationId) activeConversationId = newConvId;

      const citations = parseRagSources(response);

      const tempAssistant: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: "",
        position: maxPos + 2,
        branch: activeBranch,
        branchGroup: null,
        branchIndex: 0,
        parentMessageId: tempUser.id,
        createdAt: new Date().toISOString(),
        citations,
      };
      allMessages = [...allMessages, tempAssistant];
      streamingMessageId = tempAssistant.id;

      await readStream(response, tempAssistant);
      streamingMessageId = null;
      await reloadConversation();
    } catch (e) {
      error = e instanceof Error ? e.message : "Something went wrong";
      streamingMessageId = null;
    } finally {
      isLoading = false;
      scrollToBottom();
    }
  }

  // === Edit a message: fork the conversation ===
  async function handleEdit(msg: Message, newContent: string) {
    isLoading = true;
    error = null;

    // Context = all visible messages before the edit position
    const contextMsgs = visibleMessages
      .filter((m) => m.position < msg.position)
      .map((m) => ({ role: m.role, content: m.content }));

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...contextMsgs, { role: "user", content: newContent }],
          conversationId: activeConversationId,
          editPosition: msg.position,
          currentBranch: activeBranch,
        }),
      });

      if (!response.ok) throw new Error(`Failed (${response.status})`);

      const branchMetaStr = response.headers.get("X-Branch-Meta");
      let newBranch = activeBranch;
      let branchGroup: string | null = null;
      let branchIndex = 0;
      if (branchMetaStr) {
        const meta = JSON.parse(branchMetaStr);
        branchGroup = meta.branchGroup;
        branchIndex = meta.branchIndex;
        newBranch = meta.branch;
      }

      const citations = parseRagSources(response);

      // Add temp messages for streaming
      const tempUser: Message = {
        id: crypto.randomUUID(),
        role: "user",
        content: newContent,
        position: msg.position,
        branch: newBranch,
        branchGroup,
        branchIndex,
        parentMessageId: null,
        createdAt: new Date().toISOString(),
      };
      const tempAssistant: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: "",
        position: msg.position + 1,
        branch: newBranch,
        branchGroup,
        branchIndex,
        parentMessageId: tempUser.id,
        createdAt: new Date().toISOString(),
        citations,
      };

      allMessages = [...allMessages, tempUser, tempAssistant];
      streamingMessageId = tempAssistant.id;
      if (branchGroup) {
        activeVersions = { ...activeVersions, [branchGroup]: branchIndex };
      }

      await readStream(response, tempAssistant);
      streamingMessageId = null;

      // Save the selected version before reload
      const savedVersions = branchGroup
        ? { ...activeVersions, [branchGroup]: branchIndex }
        : { ...activeVersions };

      await reloadConversation();
      activeVersions = savedVersions;
    } catch (e) {
      error = e instanceof Error ? e.message : "Something went wrong";
      streamingMessageId = null;
    } finally {
      isLoading = false;
      scrollToBottom();
    }
  }

  // === Regenerate: re-edit with same content ===
  async function handleRegenerate() {
    const vis = visibleMessages;
    if (vis.length < 2) return;
    const lastAssistant = vis[vis.length - 1];
    const lastUser = vis[vis.length - 2];
    if (lastAssistant.role !== "assistant" || lastUser.role !== "user") return;
    await handleEdit(lastUser, lastUser.content);
  }

  // === Helpers ===
  async function readStream(response: Response, target: Message) {
    const reader = response.body?.getReader();
    if (!reader) throw new Error("No stream");
    const decoder = new TextDecoder();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      target.content += decoder.decode(value, { stream: true });
      allMessages = [...allMessages.slice(0, -1), { ...target }];
      scrollToBottom();
    }
  }

  async function handleFileUpload(file: File) {
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch("/api/documents", { method: "POST", body: formData });
      if (!res.ok) {
        const data = await res.json();
        error = data.error || "Upload failed";
      } else {
        error = null;
        // Show success briefly as a non-error message
        const name = file.name;
        error = null;
        // Use a temporary success indicator
        const tempErr = error;
        error = `Uploaded "${name}" — it will be used for context in your next message.`;
        setTimeout(() => { if (error?.includes(name)) error = null; }, 4000);
      }
    } catch {
      error = "Upload failed";
    }
  }

  async function reloadConversation() {
    await loadConversations();
    if (activeConversationId) await loadConversation(activeConversationId);
  }
</script>

<div class="flex h-[calc(100vh-64px)]">
  <button
    onclick={() => (sidebarOpen = !sidebarOpen)}
    class="md:hidden fixed bottom-20 left-3 z-50 bg-gradient-to-r from-blue-500 to-violet-600 text-white p-2.5 rounded-full shadow-lg shadow-blue-500/25"
    aria-label="Toggle chat history"
  >
    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h7" />
    </svg>
  </button>

  <div class="
    {sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
    md:translate-x-0 transition-transform duration-200
    fixed md:relative z-40 w-64 h-[calc(100vh-64px)] flex-shrink-0
  ">
    <ChatSidebar
      conversations={conversationsList}
      activeId={activeConversationId}
      onselect={loadConversation}
      onnew={startNewChat}
      ondelete={deleteConversation}
    />
  </div>

  {#if sidebarOpen}
    <button
      class="fixed inset-0 bg-black/30 z-30 md:hidden"
      onclick={() => (sidebarOpen = false)}
      aria-label="Close sidebar"
    ></button>
  {/if}

  <div class="flex-1 flex flex-col bg-gray-950 min-w-0">
    <div class="border-b border-white/10 px-4 sm:px-6 py-3 flex items-center justify-between bg-gray-900/80 backdrop-blur-xl">
      <div>
        <h1 class="text-lg font-semibold text-white">AI Chat</h1>
        <p class="text-xs text-gray-400">Powered by Google Gemini</p>
      </div>
      {#if visibleMessages.length > 0}
        <button onclick={startNewChat} class="text-sm text-gray-400 hover:text-blue-400 transition px-3 py-1.5 rounded-lg hover:bg-white/5">
          New Chat
        </button>
      {/if}
    </div>

    <div bind:this={chatContainer} class="flex-1 overflow-y-auto px-4 sm:px-6 py-4">
      {#if visibleMessages.length === 0}
        <div class="flex flex-col items-center justify-center h-full text-center">
          <div class="w-16 h-16 bg-gradient-to-br from-blue-500/20 to-violet-500/20 rounded-full flex items-center justify-center mb-4 border border-white/10">
            <svg class="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          </div>
          <h2 class="text-xl font-semibold text-white mb-2">Start a conversation</h2>
          <p class="text-gray-400 text-sm max-w-sm">Ask me anything! I'm powered by Google Gemini and ready to help. Upload documents on the <a href="/documents" class="text-blue-400 underline">Documents</a> page to enable RAG-powered answers.</p>
        </div>
      {:else}
        {#each visibleMessages as message, i (message.id)}
          {@const bg = message.branchGroup}
          {@const vc = bg ? versionCount(bg, message.role) : 1}
          {@const cv = bg ? (activeVersions[bg] ?? latestIndex(bg)) : 0}
          <ChatMessage
            role={message.role}
            content={message.content}
            isLast={i === visibleMessages.length - 1}
            {isLoading}
            isStreaming={streamingMessageId === message.id}
            timestamp={message.createdAt}
            citations={message.citations ?? []}
            versionCount={vc}
            currentVersion={cv}
            onversionchange={bg ? (idx) => handleVersionChange(bg, idx) : undefined}
            onedit={message.role === "user" ? (nc) => handleEdit(message, nc) : undefined}
            onregenerate={message.role === "assistant" && i === visibleMessages.length - 1 ? handleRegenerate : undefined}
          />
        {/each}

        {#if isLoading && visibleMessages[visibleMessages.length - 1]?.role === "user"}
          <div class="flex justify-start mb-4">
            <div class="bg-white/10 backdrop-blur border border-white/10 rounded-2xl rounded-bl-md px-4 py-3">
              <div class="flex items-center gap-1">
                <div class="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style="animation-delay: 0ms"></div>
                <div class="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style="animation-delay: 150ms"></div>
                <div class="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style="animation-delay: 300ms"></div>
              </div>
            </div>
          </div>
        {/if}
      {/if}
    </div>

    {#if error}
      {@const isSuccess = error.startsWith("Uploaded")}
      <div class="mx-4 sm:mx-6 mb-2 {isSuccess ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-red-500/10 border-red-500/20 text-red-400'} border px-4 py-2 rounded-lg text-sm flex items-center justify-between">
        <span>{error}</span>
        <button onclick={() => (error = null)} class="{isSuccess ? 'text-green-400 hover:text-green-300' : 'text-red-400 hover:text-red-300'} ml-2">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    {/if}

    <div class="border-t border-white/10 px-4 sm:px-6 py-3 bg-gray-900/80 backdrop-blur-xl">
      <ChatInput bind:value={input} onsubmit={handleSubmit} {isLoading} onfileupload={handleFileUpload} />
    </div>
  </div>
</div>
