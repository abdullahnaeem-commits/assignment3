<script lang="ts">
  let { data, form } = $props();

  let password = $state("");
  let confirmPassword = $state("");
  let showPassword = $state(false);

  const passwordMismatch = $derived(
    confirmPassword.length > 0 && password !== confirmPassword
  );

  const canSubmit = $derived(
    password.length >= 6 && !passwordMismatch && confirmPassword.length > 0
  );
</script>

<div class="min-h-[calc(100vh-56px)] flex items-center justify-center px-4 py-8 relative overflow-hidden">
  <div class="absolute inset-0 bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950"></div>
  <div class="absolute bottom-1/3 right-1/3 w-64 h-64 bg-violet-500/10 rounded-full blur-3xl"></div>

  <div class="w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 p-6 sm:p-8 rounded-2xl shadow-2xl relative z-10">
    {#if !data.valid}
      <div class="text-center">
        <div class="flex justify-center mb-4">
          <div class="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center">
            <svg class="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
          </div>
        </div>
        <div class="text-red-400 text-lg font-semibold mb-4">Invalid Link</div>
        <p class="text-gray-400 mb-6">{data.error}</p>
        <a
          href="/forgot-password"
          class="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-violet-600 hover:from-blue-600 hover:to-violet-700 text-white px-6 py-2.5 rounded-lg transition font-medium shadow-lg shadow-blue-500/25"
        >
          Request New Link
        </a>
      </div>
    {:else}
      <div class="flex justify-center mb-6">
        <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center">
          <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"/></svg>
        </div>
      </div>
      <h1 class="text-2xl sm:text-3xl font-bold mb-6 text-center text-white">Reset Password</h1>

      {#if form?.error}
        <div class="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-sm">
          {form.error}
        </div>
      {/if}

      <form method="POST" class="space-y-4">
        <input type="hidden" name="token" value={data.token} />

        <div>
          <label for="password" class="block text-sm font-medium text-gray-300 mb-1">New Password</label>
          <div class="relative">
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              required
              minlength="6"
              bind:value={password}
              placeholder="••••••••"
              class="w-full bg-white/5 border border-white/10 text-white placeholder-gray-500 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none pr-16"
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
            <p class="text-red-400 text-xs mt-1">Must be at least 6 characters</p>
          {/if}
        </div>

        <div>
          <label for="confirm" class="block text-sm font-medium text-gray-300 mb-1">Confirm Password</label>
          <input
            id="confirm"
            type={showPassword ? "text" : "password"}
            required
            minlength="6"
            bind:value={confirmPassword}
            placeholder="••••••••"
            class="w-full bg-white/5 border border-white/10 text-white placeholder-gray-500 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
          />
          {#if passwordMismatch}
            <p class="text-red-400 text-xs mt-1">Passwords don't match</p>
          {/if}
        </div>

        <button
          type="submit"
          disabled={!canSubmit}
          class="w-full bg-gradient-to-r from-blue-500 to-violet-600 hover:from-blue-600 hover:to-violet-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white p-2.5 rounded-lg transition font-medium shadow-lg shadow-blue-500/25"
        >
          Reset Password
        </button>
      </form>
    {/if}
  </div>
</div>
