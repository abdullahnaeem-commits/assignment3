<script lang="ts">
  let { data } = $props();
</script>

<div class="min-h-[calc(100vh-56px)] flex items-center justify-center px-4 relative overflow-hidden">
  <div class="absolute inset-0 bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950"></div>
  <div class="absolute top-1/3 right-1/3 w-64 h-64 bg-red-500/10 rounded-full blur-3xl"></div>

  <div class="w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-2xl shadow-2xl text-center relative z-10">
    {#if data.error}
      <div class="flex justify-center mb-4">
        <div class="w-14 h-14 rounded-xl bg-red-500/20 flex items-center justify-center">
          <svg class="w-7 h-7 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
        </div>
      </div>
      <div class="text-red-400 text-lg font-semibold mb-4">Verification Failed</div>
      <p class="text-gray-400 mb-6">{data.error}</p>
      <a
        href="/register"
        class="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-violet-600 hover:from-blue-600 hover:to-violet-700 text-white px-6 py-2.5 rounded-lg transition font-medium shadow-lg shadow-blue-500/25"
      >
        Register Again
      </a>
    {/if}
  </div>
</div>
