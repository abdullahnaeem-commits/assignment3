<script lang="ts">
  import { signIn } from "@auth/sveltekit/client";
  import { page } from "$app/state";
  import googleIcon from "$lib/assets/google.svg";
  import githubIcon from "$lib/assets/github.svg";

  let { form } = $props();

  let showPassword = $state(false);

  const errorParam = $derived(page.url.searchParams.get("error"));
  const registered = $derived(page.url.searchParams.get("registered"));
  const verified = $derived(page.url.searchParams.get("verified"));
  const reset = $derived(page.url.searchParams.get("reset"));

  const oauthError = $derived(
    errorParam === "OAuthAccountNotLinked"
      ? "This email is already linked to another account."
      : errorParam
        ? "An error occurred. Please try again."
        : null
  );
</script>

<div class="min-h-[calc(100vh-56px)] flex items-center justify-center px-4 py-8 relative overflow-hidden">
  <div class="absolute inset-0 bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950"></div>
  <div class="absolute top-1/3 left-1/4 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl"></div>
  <div class="absolute bottom-1/3 right-1/4 w-72 h-72 bg-violet-500/10 rounded-full blur-3xl"></div>

  <div class="w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 p-6 sm:p-8 rounded-2xl shadow-2xl relative z-10">
    <div class="flex justify-center mb-6">
      <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center">
        <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
      </div>
    </div>
    <h1 class="text-2xl sm:text-3xl font-bold mb-6 text-center text-white">Welcome Back</h1>

    {#if registered}
      <div class="mb-4 p-3 bg-green-500/10 border border-green-500/20 text-green-400 rounded-lg text-sm">
        Account created! Please check your email to verify your account before signing in.
      </div>
    {/if}

    {#if verified}
      <div class="mb-4 p-3 bg-green-500/10 border border-green-500/20 text-green-400 rounded-lg text-sm">
        Email verified successfully! You can now sign in.
      </div>
    {/if}

    {#if reset}
      <div class="mb-4 p-3 bg-green-500/10 border border-green-500/20 text-green-400 rounded-lg text-sm">
        Password reset successfully! Please sign in with your new password.
      </div>
    {/if}

    {#if oauthError}
      <div class="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-sm">
        {oauthError}
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
          placeholder="you@email.com"
          required
          class="w-full bg-white/5 border border-white/10 text-white placeholder-gray-500 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
        />
      </div>

      <div>
        <label for="password" class="block text-sm font-medium text-gray-300 mb-1">Password</label>
        <div class="relative">
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            required
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
      </div>

      <div class="flex justify-end">
        <a href="/forgot-password" class="text-sm text-blue-400 hover:text-blue-300 transition">
          Forgot password?
        </a>
      </div>

      <button
        type="submit"
        class="w-full bg-gradient-to-r from-blue-500 to-violet-600 hover:from-blue-600 hover:to-violet-700 text-white p-2.5 rounded-lg transition font-medium shadow-lg shadow-blue-500/25"
      >
        Sign In
      </button>
    </form>

    <!-- OAuth divider -->
    <div class="mt-6">
      <div class="relative">
        <div class="absolute inset-0 flex items-center">
          <div class="w-full border-t border-white/10"></div>
        </div>
        <div class="relative flex justify-center text-sm">
          <span class="bg-gray-900 px-3 text-gray-500">Or continue with</span>
        </div>
      </div>

      <div class="mt-4 flex flex-col sm:flex-row gap-3">
        <button
          onclick={() => signIn("google", { redirectTo: "/dashboard" })}
          class="flex-1 flex items-center justify-center gap-2 bg-white/5 border border-white/10 hover:bg-white/10 text-gray-300 p-2.5 rounded-lg transition"
        >
          <img src={googleIcon} alt="Google" class="w-5 h-5" />
          Google
        </button>

        <button
          onclick={() => signIn("github", { redirectTo: "/dashboard" })}
          class="flex-1 flex items-center justify-center gap-2 bg-white/5 border border-white/10 hover:bg-white/10 text-gray-300 p-2.5 rounded-lg transition"
        >
          <img src={githubIcon} alt="GitHub" class="w-5 h-5 invert" />
          GitHub
        </button>
      </div>
    </div>

    <p class="mt-6 text-center text-sm text-gray-400">
      Don't have an account?
      <a href="/register" class="text-blue-400 hover:text-blue-300 font-medium transition">Create one</a>
    </p>
  </div>
</div>
