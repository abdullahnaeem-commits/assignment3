<script lang="ts">
  import { signOut } from "@auth/sveltekit/client";
  import favicon from "$lib/assets/favicon.svg";
  import "../app.css";

  let { children, data } = $props();
  const session = $derived(data.session);
  let mobileMenuOpen = $state(false);
</script>

<svelte:head>
  <link rel="icon" href={favicon} />
</svelte:head>

<nav class="bg-gray-900/80 backdrop-blur-xl text-white border-b border-white/10 sticky top-0 z-50">
  <div class="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
    <a href="/" class="flex items-center gap-2 text-xl font-bold tracking-tight hover:text-white/80 transition">
      <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-sm font-black">A</div>
      AuthApp
    </a>

    <!-- Desktop nav -->
    <div class="hidden md:flex items-center gap-1">
      {#if session?.user}
        <a href="/dashboard" class="px-3 py-1.5 text-sm text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition">
          <span class="flex items-center gap-1.5">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/></svg>
            Dashboard
          </span>
        </a>
        <a href="/chat" class="px-3 py-1.5 text-sm text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition">
          <span class="flex items-center gap-1.5">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/></svg>
            Chat
          </span>
        </a>
        <a href="/documents" class="px-3 py-1.5 text-sm text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition">
          <span class="flex items-center gap-1.5">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
            Documents
          </span>
        </a>
        <a href="/profile" class="px-3 py-1.5 text-sm text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition">
          <span class="flex items-center gap-1.5">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
            Profile
          </span>
        </a>
        {#if (session as any)?.role === "admin"}
          <a href="/admin" class="px-3 py-1.5 text-sm text-amber-400 hover:text-amber-300 hover:bg-white/10 rounded-lg transition font-medium">
            <span class="flex items-center gap-1.5">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
              Admin
            </span>
          </a>
        {/if}
        <div class="w-px h-6 bg-white/20 mx-2"></div>
        <span class="text-sm text-gray-400 px-2">
          {session.user.name || session.user.email}
        </span>
        <button
          onclick={() => signOut({ redirectTo: "/" })}
          class="bg-white/10 hover:bg-red-500/80 px-3 py-1.5 rounded-lg text-sm font-medium transition border border-white/10 hover:border-red-500"
        >
          Logout
        </button>
      {:else}
        <a href="/login" class="px-3 py-1.5 text-sm text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition">Login</a>
        <a
          href="/register"
          class="bg-gradient-to-r from-blue-500 to-violet-600 hover:from-blue-600 hover:to-violet-700 px-4 py-1.5 rounded-lg text-sm font-medium transition shadow-lg shadow-blue-500/25"
        >
          Register
        </a>
      {/if}
    </div>

    <!-- Mobile hamburger -->
    <button
      class="md:hidden p-2 rounded-lg hover:bg-white/10 transition"
      onclick={() => (mobileMenuOpen = !mobileMenuOpen)}
      aria-label="Toggle menu"
    >
      {#if mobileMenuOpen}
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      {:else}
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      {/if}
    </button>
  </div>

  <!-- Mobile menu -->
  {#if mobileMenuOpen}
    <div class="md:hidden border-t border-white/10 px-4 py-3 space-y-1 bg-gray-900/95 backdrop-blur-xl">
      {#if session?.user}
        <div class="text-sm text-gray-400 pb-2 mb-2 border-b border-white/10">
          {session.user.name || session.user.email}
        </div>
        <a href="/dashboard" class="flex items-center gap-2 py-2 px-3 text-sm hover:bg-white/10 rounded-lg transition" onclick={() => (mobileMenuOpen = false)}>
          <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/></svg>
          Dashboard
        </a>
        <a href="/chat" class="flex items-center gap-2 py-2 px-3 text-sm hover:bg-white/10 rounded-lg transition" onclick={() => (mobileMenuOpen = false)}>
          <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/></svg>
          Chat
        </a>
        <a href="/documents" class="flex items-center gap-2 py-2 px-3 text-sm hover:bg-white/10 rounded-lg transition" onclick={() => (mobileMenuOpen = false)}>
          <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
          Documents
        </a>
        <a href="/profile" class="flex items-center gap-2 py-2 px-3 text-sm hover:bg-white/10 rounded-lg transition" onclick={() => (mobileMenuOpen = false)}>
          <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
          Profile
        </a>
        {#if (session as any)?.role === "admin"}
          <a href="/admin" class="flex items-center gap-2 py-2 px-3 text-sm text-amber-400 hover:bg-white/10 rounded-lg transition font-medium" onclick={() => (mobileMenuOpen = false)}>
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
            Admin
          </a>
        {/if}
        <button
          onclick={() => { mobileMenuOpen = false; signOut({ redirectTo: "/" }); }}
          class="w-full mt-2 bg-white/10 hover:bg-red-500/80 px-3 py-2 rounded-lg text-sm font-medium transition text-left border border-white/10"
        >
          Logout
        </button>
      {:else}
        <a href="/login" class="block py-2 px-3 text-sm hover:bg-white/10 rounded-lg transition" onclick={() => (mobileMenuOpen = false)}>Login</a>
        <a
          href="/register"
          class="block mt-1 bg-gradient-to-r from-blue-500 to-violet-600 px-3 py-2 rounded-lg text-sm font-medium transition text-center"
          onclick={() => (mobileMenuOpen = false)}
        >
          Register
        </a>
      {/if}
    </div>
  {/if}
</nav>

<main>
  {@render children()}
</main>
