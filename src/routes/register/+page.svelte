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

<div class="min-h-[calc(100vh-56px)] flex items-center justify-center bg-gray-50 px-4 py-8">
  <div class="w-full max-w-md bg-white p-6 sm:p-8 rounded-2xl shadow-lg">
    <h1 class="text-2xl sm:text-3xl font-bold mb-6 text-center text-gray-900">Create Account</h1>

    {#if form?.error}
      <div class="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
        {form.error}
      </div>
    {/if}

    <form method="POST" class="space-y-4">
      <!-- Name -->
      <div>
        <label for="name" class="block text-sm font-medium text-gray-700 mb-1">Name</label>
        <input
          id="name"
          name="name"
          type="text"
          class="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
          placeholder="John Doe"
        />
      </div>

      <!-- Email -->
      <div>
        <label for="email" class="block text-sm font-medium text-gray-700 mb-1">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          required
          class="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
          placeholder="you@email.com"
        />
      </div>

      <!-- Password -->
      <div>
        <label for="password" class="block text-sm font-medium text-gray-700 mb-1">Password</label>
        <div class="relative">
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            required
            minlength="6"
            bind:value={password}
            class="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none pr-16"
            placeholder="••••••••"
          />
          <button
            type="button"
            onclick={() => (showPassword = !showPassword)}
            class="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500 hover:text-gray-700 font-medium"
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>
        {#if password.length > 0 && password.length < 6}
          <p class="text-red-500 text-xs mt-1">Password must be at least 6 characters</p>
        {/if}
      </div>

      <!-- Confirm Password -->
      <div>
        <label for="confirm-password" class="block text-sm font-medium text-gray-700 mb-1">
          Confirm Password
        </label>
        <div class="relative">
          <input
            id="confirm-password"
            type={showPassword ? "text" : "password"}
            required
            minlength="6"
            bind:value={confirmPassword}
            class="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
            placeholder="••••••••"
          />
        </div>
        {#if passwordMismatch}
          <p class="text-red-500 text-xs mt-1">Passwords don't match</p>
        {/if}
      </div>

      <button
        type="submit"
        disabled={!canSubmit}
        class="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white p-2.5 rounded-lg transition font-medium"
      >
        Create Account
      </button>
    </form>

    <p class="mt-6 text-center text-sm text-gray-600">
      Already have an account?
      <a href="/login" class="text-blue-600 hover:underline font-medium">Sign in</a>
    </p>
  </div>
</div>
