<script lang="ts">
  let { form } = $props();

  let showPassword = $state(false);
  let password = $state("");
  let confirmPassword = $state("");

  const passwordMismatch = $derived(
    confirmPassword.length > 0 && password !== confirmPassword
  );

  const canSubmit = $derived(
    password.length >= 6 && !passwordMismatch && confirmPassword.length > 0
  );
</script>

<div class="min-h-[calc(100vh-56px)] flex items-center justify-center px-4 py-8 relative overflow-hidden">
  <div class="absolute inset-0 bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950"></div>
  <div class="absolute top-1/3 left-1/4 w-72 h-72 bg-violet-500/10 rounded-full blur-3xl"></div>
  <div class="absolute bottom-1/3 right-1/4 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl"></div>

  <div class="w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 p-6 sm:p-8 rounded-2xl shadow-2xl relative z-10">
    <div class="flex justify-center mb-6">
      <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-blue-600 flex items-center justify-center">
        <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"/></svg>
      </div>
    </div>
    <h1 class="text-2xl sm:text-3xl font-bold mb-6 text-center text-white">Create Account</h1>

    {#if form?.error}
      <div class="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-sm">
        {form.error}
      </div>
    {/if}

    <form method="POST" class="space-y-4">
      <div>
        <label for="name" class="block text-sm font-medium text-gray-300 mb-1">Name</label>
        <input
          id="name"
          name="name"
          type="text"
          class="w-full bg-white/5 border border-white/10 text-white placeholder-gray-500 p-2.5 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 focus:outline-none"
          placeholder="John Doe"
        />
      </div>

      <div>
        <label for="email" class="block text-sm font-medium text-gray-300 mb-1">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          required
          class="w-full bg-white/5 border border-white/10 text-white placeholder-gray-500 p-2.5 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 focus:outline-none"
          placeholder="you@email.com"
        />
      </div>

      <div>
        <label for="password" class="block text-sm font-medium text-gray-300 mb-1">Password</label>
        <div class="relative">
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            required
            minlength="6"
            bind:value={password}
            class="w-full bg-white/5 border border-white/10 text-white placeholder-gray-500 p-2.5 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 focus:outline-none pr-16"
            placeholder="••••••••"
          />
          <button
            type="button"
            onclick={() => (showPassword = !showPassword)}
            class="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400 hover:text-gray-200 font-medium"
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>
        {#if password.length > 0 && password.length < 6}
          <p class="text-red-400 text-xs mt-1">Password must be at least 6 characters</p>
        {/if}
      </div>

      <div>
        <label for="confirm-password" class="block text-sm font-medium text-gray-300 mb-1">
          Confirm Password
        </label>
        <div class="relative">
          <input
            id="confirm-password"
            type={showPassword ? "text" : "password"}
            required
            minlength="6"
            bind:value={confirmPassword}
            class="w-full bg-white/5 border border-white/10 text-white placeholder-gray-500 p-2.5 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 focus:outline-none"
            placeholder="••••••••"
          />
        </div>
        {#if passwordMismatch}
          <p class="text-red-400 text-xs mt-1">Passwords don't match</p>
        {/if}
      </div>

      <button
        type="submit"
        disabled={!canSubmit}
        class="w-full bg-gradient-to-r from-violet-500 to-blue-600 hover:from-violet-600 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white p-2.5 rounded-lg transition font-medium shadow-lg shadow-violet-500/25"
      >
        Create Account
      </button>
    </form>

    <p class="mt-6 text-center text-sm text-gray-400">
      Already have an account?
      <a href="/login" class="text-blue-400 hover:text-blue-300 font-medium transition">Sign in</a>
    </p>
  </div>
</div>
