<script lang="ts">
  import { page } from "$app/state";

  const session = $derived(page.data.session);
</script>

<div class="min-h-[calc(100vh-56px)] flex items-center justify-center px-4 relative overflow-hidden">
  <!-- Background effects -->
  <div class="absolute inset-0 bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950"></div>
  <div class="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
  <div class="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl"></div>

  <div class="text-center space-y-8 p-4 sm:p-8 max-w-3xl w-full relative z-10">
    <!-- Badge -->
    <div class="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 text-sm text-gray-400">
      <svg class="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="5"/></svg>
      Powered by SvelteKit + Auth.js + Gemini AI
    </div>

    <h1 class="text-4xl sm:text-5xl md:text-6xl font-bold text-white leading-tight">
      Secure Auth with
      <span class="bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent"> AI Chat</span>
    </h1>
    <p class="text-lg sm:text-xl text-gray-400 max-w-xl mx-auto">
      Full-stack authentication with email, OAuth, role-based access, and an AI-powered chat interface built with Vercel AI SDK.
    </p>

    {#if session?.user}
      <a
        href="/dashboard"
        class="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-violet-600 hover:from-blue-600 hover:to-violet-700 text-white px-8 py-3.5 rounded-xl text-lg font-medium transition shadow-lg shadow-blue-500/25"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"/></svg>
        Go to Dashboard
      </a>
    {:else}
      <div class="flex flex-col sm:flex-row gap-4 justify-center">
        <a
          href="/register"
          class="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-violet-600 hover:from-blue-600 hover:to-violet-700 text-white px-8 py-3.5 rounded-xl text-lg font-medium transition shadow-lg shadow-blue-500/25"
        >
          Get Started
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"/></svg>
        </a>
        <a
          href="/login"
          class="inline-flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-white px-8 py-3.5 rounded-xl text-lg font-medium border border-white/10 transition"
        >
          Sign In
        </a>
      </div>
    {/if}

    <!-- Feature cards -->
    <div class="pt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
      <div class="bg-white/5 backdrop-blur border border-white/10 p-5 rounded-2xl hover:bg-white/[0.07] transition group">
        <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-600/20 flex items-center justify-center mb-3">
          <svg class="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
        </div>
        <h3 class="font-semibold text-white mb-1">Email & Password</h3>
        <p class="text-sm text-gray-400">Secure registration with bcrypt-hashed passwords and email verification</p>
      </div>
      <div class="bg-white/5 backdrop-blur border border-white/10 p-5 rounded-2xl hover:bg-white/[0.07] transition group">
        <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500/20 to-violet-600/20 flex items-center justify-center mb-3">
          <svg class="w-5 h-5 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
        </div>
        <h3 class="font-semibold text-white mb-1">OAuth Providers</h3>
        <p class="text-sm text-gray-400">Sign in with Google or GitHub accounts in one click</p>
      </div>
      <div class="bg-white/5 backdrop-blur border border-white/10 p-5 rounded-2xl hover:bg-white/[0.07] transition group">
        <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 flex items-center justify-center mb-3">
          <svg class="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/></svg>
        </div>
        <h3 class="font-semibold text-white mb-1">AI Chat</h3>
        <p class="text-sm text-gray-400">Gemini-powered chat with streaming, branching history, and persistence</p>
      </div>
    </div>
  </div>
</div>
