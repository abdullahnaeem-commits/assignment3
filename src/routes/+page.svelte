<script lang="ts">
  import { page } from "$app/state";

  const session = $derived(page.data.session);
</script>

<div class="min-h-[calc(100vh-56px)] flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
  <div class="text-center space-y-6 p-4 sm:p-8 max-w-2xl w-full">
    <h1 class="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900">
      Secure Authentication
    </h1>
    <p class="text-base sm:text-lg md:text-xl text-gray-600">
      A full-stack authentication app built with SvelteKit, PostgreSQL, Drizzle ORM, and Auth.js.
      Supports email/password login, Google OAuth, and GitHub OAuth.
    </p>

    {#if session?.user}
      <a
        href="/dashboard"
        class="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 sm:px-8 py-3 rounded-lg text-base sm:text-lg font-medium transition"
      >
        Go to Dashboard
      </a>
    {:else}
      <div class="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
        <a
          href="/register"
          class="bg-blue-600 hover:bg-blue-700 text-white px-6 sm:px-8 py-3 rounded-lg text-base sm:text-lg font-medium transition"
        >
          Get Started
        </a>
        <a
          href="/login"
          class="bg-white hover:bg-gray-50 text-gray-900 px-6 sm:px-8 py-3 rounded-lg text-base sm:text-lg font-medium border border-gray-300 transition"
        >
          Sign In
        </a>
      </div>
    {/if}

    <div class="pt-6 sm:pt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
      <div class="bg-white/80 p-4 sm:p-5 rounded-xl">
        <h3 class="font-semibold text-gray-900 mb-1">Email & Password</h3>
        <p class="text-sm text-gray-600">Secure registration with bcrypt-hashed passwords</p>
      </div>
      <div class="bg-white/80 p-4 sm:p-5 rounded-xl">
        <h3 class="font-semibold text-gray-900 mb-1">OAuth Providers</h3>
        <p class="text-sm text-gray-600">Sign in with Google or GitHub accounts</p>
      </div>
      <div class="bg-white/80 p-4 sm:p-5 rounded-xl">
        <h3 class="font-semibold text-gray-900 mb-1">Protected Routes</h3>
        <p class="text-sm text-gray-600">Dashboard and profile accessible only when logged in</p>
      </div>
    </div>
  </div>
</div>
