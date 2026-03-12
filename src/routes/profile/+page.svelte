<script lang="ts">
  let { data, form } = $props();

  let name = $state(data.user?.name || "");
  let email = $state(data.user?.email || "");

  // Keep in sync when data changes
  $effect(() => { name = data.user?.name || ""; });
  $effect(() => { email = data.user?.email || ""; });
  let currentPassword = $state("");
  let newPassword = $state("");
  let confirmPassword = $state("");
  let showPasswords = $state(false);
  let showEditForm = $state(false);

  const passwordMismatch = $derived(
    confirmPassword.length > 0 && newPassword !== confirmPassword
  );
</script>

<div class="min-h-[calc(100vh-56px)] p-4 sm:p-6 md:p-8">
  <div class="max-w-2xl mx-auto">
    <div class="mb-6 sm:mb-8">
      <h1 class="text-2xl sm:text-3xl font-bold text-white mb-1">Profile</h1>
      <p class="text-gray-400">Manage your account information</p>
    </div>

    {#if form?.success}
      <div class="mb-4 p-3 bg-green-500/10 border border-green-500/20 text-green-400 rounded-lg text-sm">
        Profile updated successfully!
      </div>
    {/if}

    {#if form?.error}
      <div class="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-sm">
        {form.error}
      </div>
    {/if}

    <!-- Account Info -->
    <div class="bg-white/5 backdrop-blur border border-white/10 p-5 sm:p-6 rounded-2xl mb-4 sm:mb-6">
      <h2 class="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
        Account Information
      </h2>
      <div class="space-y-3 text-sm">
        {#if data.user?.createdAt}
          <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 py-2 border-b border-white/5">
            <span class="text-gray-500">Member since</span>
            <span class="text-gray-300 font-medium">
              {new Date(data.user.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </div>
        {/if}
        <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 py-2 border-b border-white/5">
          <span class="text-gray-500">Auth method</span>
          <span class="inline-flex items-center gap-1.5 text-gray-300 font-medium">
            {#if data.isOAuth}
              <svg class="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/></svg>
              {data.provider === "google" ? "Google" : data.provider === "github" ? "GitHub" : "OAuth"}
            {:else}
              <svg class="w-4 h-4 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
              Email & Password
            {/if}
          </span>
        </div>
      </div>
    </div>

    <!-- Edit Profile Toggle -->
    {#if !showEditForm}
      <button
        onclick={() => (showEditForm = true)}
        class="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-violet-600 hover:from-blue-600 hover:to-violet-700 text-white px-6 py-2.5 rounded-lg transition font-medium shadow-lg shadow-blue-500/25 mb-4 sm:mb-6"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
        Edit Profile
      </button>
    {/if}

    <!-- Editable Profile -->
    {#if showEditForm}
      <div class="bg-white/5 backdrop-blur border border-white/10 p-5 sm:p-6 rounded-2xl mb-4 sm:mb-6">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-semibold text-white flex items-center gap-2">
            <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
            Edit Profile
          </h2>
          <button
            onclick={() => (showEditForm = false)}
            class="text-sm text-gray-400 hover:text-gray-200 font-medium transition"
          >
            Cancel
          </button>
        </div>

        <form method="POST" action="?/update" class="space-y-4">
        <div>
          <label for="name" class="block text-sm font-medium text-gray-300 mb-1">Display Name</label>
          <input
            id="name"
            name="name"
            type="text"
            bind:value={name}
            placeholder="Enter your name"
            class="w-full bg-white/5 border border-white/10 text-white placeholder-gray-500 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div>
          <label for="email" class="block text-sm font-medium text-gray-300 mb-1">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            required
            bind:value={email}
            disabled={data.isOAuth}
            placeholder="you@email.com"
            class="w-full bg-white/5 border border-white/10 text-white placeholder-gray-500 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none {data.isOAuth ? 'opacity-50 cursor-not-allowed' : ''}"
          />
          {#if data.isOAuth}
            <p class="text-xs text-gray-500 mt-1">Email is managed by your {data.provider === "google" ? "Google" : "GitHub"} account</p>
          {/if}
        </div>

        <!-- Password Change -->
        <div class="pt-4 border-t border-white/10">
          <h3 class="text-sm font-semibold text-white mb-3">Change Password</h3>

          {#if data.isOAuth}
            <p class="text-sm text-gray-500">
              Password cannot be changed when signed in with {data.provider === "google" ? "Google" : "GitHub"}.
            </p>
          {:else}
            <div class="space-y-3">
              <div>
                <label for="currentPassword" class="block text-sm font-medium text-gray-300 mb-1">Current Password</label>
                <div class="relative">
                  <input
                    id="currentPassword"
                    name="currentPassword"
                    type={showPasswords ? "text" : "password"}
                    bind:value={currentPassword}
                    placeholder="••••••••"
                    class="w-full bg-white/5 border border-white/10 text-white placeholder-gray-500 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none pr-16"
                  />
                  <button
                    type="button"
                    onclick={() => (showPasswords = !showPasswords)}
                    class="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400 hover:text-gray-200 font-medium"
                  >
                    {showPasswords ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              <div>
                <label for="newPassword" class="block text-sm font-medium text-gray-300 mb-1">New Password</label>
                <div class="relative">
                  <input
                    id="newPassword"
                    name="newPassword"
                    type={showPasswords ? "text" : "password"}
                    bind:value={newPassword}
                    minlength="6"
                    placeholder="••••••••"
                    class="w-full bg-white/5 border border-white/10 text-white placeholder-gray-500 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                  />
                </div>
                {#if newPassword.length > 0 && newPassword.length < 6}
                  <p class="text-red-400 text-xs mt-1">Must be at least 6 characters</p>
                {/if}
              </div>

              <div>
                <label for="confirmPassword" class="block text-sm font-medium text-gray-300 mb-1">Confirm New Password</label>
                <input
                  id="confirmPassword"
                  type={showPasswords ? "text" : "password"}
                  bind:value={confirmPassword}
                  minlength="6"
                  placeholder="••••••••"
                  class="w-full bg-white/5 border border-white/10 text-white placeholder-gray-500 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                />
                {#if passwordMismatch}
                  <p class="text-red-400 text-xs mt-1">Passwords don't match</p>
                {/if}
              </div>
            </div>

            <p class="text-xs text-gray-500 mt-2">Leave password fields empty to keep your current password.</p>
          {/if}
        </div>

        <button
          type="submit"
          disabled={passwordMismatch || (newPassword.length > 0 && newPassword.length < 6)}
          class="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-violet-600 hover:from-blue-600 hover:to-violet-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white px-6 py-2.5 rounded-lg transition font-medium shadow-lg shadow-blue-500/25"
        >
          Save Changes
        </button>
        </form>
      </div>
    {/if}
  </div>
</div>
