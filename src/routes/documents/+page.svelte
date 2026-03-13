<script lang="ts">
  type Document = {
    id: string;
    filename: string;
    mimeType: string;
    fileSize: number;
    totalChunks: number;
    status: string;
    createdAt: string;
  };

  let docs: Document[] = $state([]);
  let uploading = $state(false);
  let error: string | null = $state(null);
  let dragOver = $state(false);

  $effect(() => {
    loadDocuments();
  });

  async function loadDocuments() {
    try {
      const res = await fetch("/api/documents");
      if (res.ok) docs = await res.json();
    } catch {
      error = "Failed to load documents";
    }
  }

  async function uploadFile(file: File) {
    uploading = true;
    error = null;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/documents", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Upload failed");
      }

      // Reload documents after short delay to let processing complete
      setTimeout(() => loadDocuments(), 2000);
      await loadDocuments();
    } catch (e) {
      error = e instanceof Error ? e.message : "Upload failed";
    } finally {
      uploading = false;
    }
  }

  async function deleteDocument(id: string) {
    try {
      const res = await fetch(`/api/documents/${id}`, { method: "DELETE" });
      if (res.ok) {
        docs = docs.filter((d) => d.id !== id);
      }
    } catch {
      error = "Failed to delete document";
    }
  }

  function handleDrop(e: DragEvent) {
    e.preventDefault();
    dragOver = false;
    const file = e.dataTransfer?.files[0];
    if (file) uploadFile(file);
  }

  function handleFileInput(e: Event) {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) uploadFile(file);
    input.value = "";
  }

  function formatSize(bytes: number): string {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  }

  function statusColor(status: string): string {
    switch (status) {
      case "ready": return "text-green-400 bg-green-400/10 border-green-400/20";
      case "processing": return "text-yellow-400 bg-yellow-400/10 border-yellow-400/20";
      case "error": return "text-red-400 bg-red-400/10 border-red-400/20";
      default: return "text-gray-400 bg-gray-400/10 border-gray-400/20";
    }
  }
</script>

<svelte:head>
  <title>Documents - RAG</title>
</svelte:head>

<div class="max-w-4xl mx-auto px-4 py-8">
  <div class="mb-8">
    <h1 class="text-2xl font-bold text-white mb-1">Documents</h1>
    <p class="text-gray-400 text-sm">Upload documents to enhance AI responses with relevant context.</p>
  </div>

  <!-- Upload area -->
  <label
    ondragover={(e) => { e.preventDefault(); dragOver = true; }}
    ondragleave={() => (dragOver = false)}
    ondrop={handleDrop}
    class="block border-2 border-dashed rounded-xl p-8 text-center transition mb-8 cursor-pointer
      {dragOver
        ? 'border-blue-400 bg-blue-400/5'
        : 'border-white/10 hover:border-white/20 bg-white/5'}"
  >
    <svg class="w-10 h-10 mx-auto mb-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
    </svg>
    <p class="text-gray-300 mb-1">
      {#if uploading}
        <span class="text-blue-400">Uploading & processing...</span>
      {:else}
        Drag & drop a file here, or click to browse
      {/if}
    </p>
    <p class="text-xs text-gray-500">Supports .txt and .pdf files up to 10MB</p>
    <input
      type="file"
      accept=".txt,.pdf,text/plain,application/pdf"
      onchange={handleFileInput}
      disabled={uploading}
      class="hidden"
    />
  </label>

  {#if error}
    <div class="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-2 rounded-lg text-sm mb-6 flex items-center justify-between">
      <span>{error}</span>
      <button onclick={() => (error = null)} class="text-red-400 hover:text-red-300 ml-2" aria-label="Dismiss error">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  {/if}

  <!-- Document list -->
  {#if docs.length === 0}
    <div class="text-center py-12 text-gray-500">
      <svg class="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      <p>No documents uploaded yet</p>
    </div>
  {:else}
    <div class="space-y-3">
      {#each docs as doc (doc.id)}
        <div class="bg-white/5 border border-white/10 rounded-lg px-4 py-3 flex items-center justify-between group hover:bg-white/[0.07] transition">
          <div class="flex items-center gap-3 min-w-0">
            <div class="flex-shrink-0">
              {#if doc.mimeType === "application/pdf"}
                <svg class="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              {:else}
                <svg class="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              {/if}
            </div>
            <div class="min-w-0">
              <p class="text-sm text-white font-medium truncate">{doc.filename}</p>
              <p class="text-xs text-gray-500">
                {formatSize(doc.fileSize)} &middot; {doc.totalChunks} chunks &middot;
                {new Date(doc.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
          <div class="flex items-center gap-3">
            <span class="text-xs px-2 py-0.5 rounded-full border {statusColor(doc.status)}">
              {doc.status}
            </span>
            <button
              onclick={() => deleteDocument(doc.id)}
              class="text-gray-500 hover:text-red-400 transition p-1 opacity-0 group-hover:opacity-100"
              title="Delete document"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>
