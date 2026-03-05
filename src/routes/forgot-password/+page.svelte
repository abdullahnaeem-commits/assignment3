<script lang="ts">
  let { form } = $props();
</script>

<div class="min-h-[calc(100vh-56px)] flex items-center justify-center px-4 py-8 relative overflow-hidden">
  <div class="absolute inset-0 bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950"></div>
  <div class="absolute top-1/3 left-1/3 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"></div>

  <div class="w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 p-6 sm:p-8 rounded-2xl shadow-2xl relative z-10">
    <div class="flex justify-center mb-6">
      <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center">
        <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
      </div>
    </div>
    <h1 class="text-2xl sm:text-3xl font-bold mb-2 text-center text-white">Forgot Password</h1>
    <p class="text-gray-400 text-center text-sm mb-6">
      Enter your email and we'll send you a reset link.
    </p>

    {#if form?.success}
      <div class="mb-4 p-4 bg-green-500/10 border border-green-500/20 text-green-400 rounded-lg text-sm">
        If an account with that email exists, we've sent a password reset link. Check your inbox.
      </div>
    {/if}

    {#if form?.error}
      <div class="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-sm">
        {form.error}
      </div>
    {/if}

    <form method="POST" class="space-y-4">
      <div>
        <label for="email" class="block text-sm font-medium text-gray-300 mb-1">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          required
          placeholder="you@email.com"
          class="w-full bg-white/5 border border-white/10 text-white placeholder-gray-500 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
        />
      </div>

      <button
        type="submit"
        class="w-full bg-gradient-to-r from-blue-500 to-violet-600 hover:from-blue-600 hover:to-violet-700 text-white p-2.5 rounded-lg transition font-medium shadow-lg shadow-blue-500/25"
      >
        Send Reset Link
      </button>
    </form>

    <p class="mt-6 text-center text-sm text-gray-400">
      Remember your password?
      <a href="/login" class="text-blue-400 hover:text-blue-300 font-medium transition">Sign in</a>
    </p>
  </div>
</div>
