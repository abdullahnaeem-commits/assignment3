<script lang="ts">
  let { data, form } = $props();
</script>

<div class="min-h-[calc(100vh-56px)] p-4 sm:p-6 md:p-8">
  <div class="max-w-6xl mx-auto">
    <div class="mb-6 sm:mb-8">
      <h1 class="text-2xl sm:text-3xl font-bold text-white mb-1 flex items-center gap-2">
        <svg class="w-7 h-7 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
        Admin Dashboard
      </h1>
      <p class="text-gray-400">Manage users and view analytics</p>
    </div>

    {#if form?.error}
      <div class="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-sm">
        {form.error}
      </div>
    {/if}

    {#if form?.success}
      <div class="mb-4 p-3 bg-green-500/10 border border-green-500/20 text-green-400 rounded-lg text-sm">
        Action completed successfully.
      </div>
    {/if}

    <!-- Stats Cards -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
      <div class="bg-white/5 backdrop-blur border border-white/10 p-4 sm:p-5 rounded-2xl hover:bg-white/[0.07] transition">
        <div class="flex items-center gap-2 mb-2">
          <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500/20 to-blue-600/20 flex items-center justify-center">
            <svg class="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
          </div>
          <div class="text-xs sm:text-sm text-gray-400">Total Users</div>
        </div>
        <div class="text-2xl sm:text-3xl font-bold text-white">{data.stats.total}</div>
      </div>
      <div class="bg-white/5 backdrop-blur border border-white/10 p-4 sm:p-5 rounded-2xl hover:bg-white/[0.07] transition">
        <div class="flex items-center gap-2 mb-2">
          <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500/20 to-amber-600/20 flex items-center justify-center">
            <svg class="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
          </div>
          <div class="text-xs sm:text-sm text-gray-400">Admins</div>
        </div>
        <div class="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-amber-400 to-amber-300 bg-clip-text text-transparent">{data.stats.admins}</div>
      </div>
      <div class="bg-white/5 backdrop-blur border border-white/10 p-4 sm:p-5 rounded-2xl hover:bg-white/[0.07] transition">
        <div class="flex items-center gap-2 mb-2">
          <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500/20 to-green-600/20 flex items-center justify-center">
            <svg class="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          </div>
          <div class="text-xs sm:text-sm text-gray-400">Verified</div>
        </div>
        <div class="text-2xl sm:text-3xl font-bold text-green-400">{data.stats.verified}</div>
      </div>
      <div class="bg-white/5 backdrop-blur border border-white/10 p-4 sm:p-5 rounded-2xl hover:bg-white/[0.07] transition">
        <div class="flex items-center gap-2 mb-2">
          <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500/20 to-orange-600/20 flex items-center justify-center">
            <svg class="w-4 h-4 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
          </div>
          <div class="text-xs sm:text-sm text-gray-400">Unverified</div>
        </div>
        <div class="text-2xl sm:text-3xl font-bold text-orange-400">{data.stats.unverified}</div>
      </div>
    </div>

    <!-- Users Table -->
    <div class="bg-white/5 backdrop-blur border border-white/10 rounded-2xl overflow-hidden">
      <div class="p-4 sm:p-5 border-b border-white/10">
        <h2 class="text-lg font-semibold text-white flex items-center gap-2">
          <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg>
          All Users
        </h2>
      </div>

      <!-- Desktop table -->
      <div class="hidden md:block overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="bg-white/5 text-gray-400">
            <tr>
              <th class="text-left p-4 font-medium">Name</th>
              <th class="text-left p-4 font-medium">Email</th>
              <th class="text-left p-4 font-medium">Role</th>
              <th class="text-left p-4 font-medium">Verified</th>
              <th class="text-left p-4 font-medium">Joined</th>
              <th class="text-left p-4 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {#each data.users as user}
              <tr class="border-t border-white/5 hover:bg-white/5 transition">
                <td class="p-4 text-white font-medium">
                  {user.name || "—"}
                </td>
                <td class="p-4 text-gray-400">{user.email}</td>
                <td class="p-4">
                  <span
                    class="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium {user.role === 'admin'
                      ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      : 'bg-white/10 text-gray-400 border border-white/10'}"
                  >
                    {user.role}
                  </span>
                </td>
                <td class="p-4">
                  {#if user.emailVerified}
                    <span class="text-green-400 text-xs font-medium flex items-center gap-1">
                      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
                      Verified
                    </span>
                  {:else}
                    <span class="text-orange-400 text-xs font-medium flex items-center gap-1">
                      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01"/></svg>
                      Unverified
                    </span>
                  {/if}
                </td>
                <td class="p-4 text-gray-500">
                  {new Date(user.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </td>
                <td class="p-4">
                  <div class="flex gap-2">
                    <form method="POST" action="?/toggleRole">
                      <input type="hidden" name="userId" value={user.id} />
                      <button
                        type="submit"
                        class="text-xs px-2.5 py-1 rounded-lg border border-blue-500/30 text-blue-400 hover:bg-blue-500/10 transition"
                      >
                        {user.role === "admin" ? "Demote" : "Promote"}
                      </button>
                    </form>
                    <form
                      method="POST"
                      action="?/deleteUser"
                      onsubmit={(e) => {
                        if (!confirm(`Delete ${user.email}?`)) e.preventDefault();
                      }}
                    >
                      <input type="hidden" name="userId" value={user.id} />
                      <button
                        type="submit"
                        class="text-xs px-2.5 py-1 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 transition"
                      >
                        Delete
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>

      <!-- Mobile cards -->
      <div class="md:hidden divide-y divide-white/5">
        {#each data.users as user}
          <div class="p-4 space-y-2">
            <div class="flex items-center justify-between">
              <div>
                <div class="font-medium text-white">{user.name || "—"}</div>
                <div class="text-sm text-gray-400 break-all">{user.email}</div>
              </div>
              <span
                class="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium shrink-0 ml-2 {user.role === 'admin'
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  : 'bg-white/10 text-gray-400 border border-white/10'}"
              >
                {user.role}
              </span>
            </div>

            <div class="flex items-center justify-between text-xs">
              <div class="flex items-center gap-3">
                {#if user.emailVerified}
                  <span class="text-green-400 font-medium">Verified</span>
                {:else}
                  <span class="text-orange-400 font-medium">Unverified</span>
                {/if}
                <span class="text-gray-500">
                  {new Date(user.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>

              <div class="flex gap-2">
                <form method="POST" action="?/toggleRole">
                  <input type="hidden" name="userId" value={user.id} />
                  <button
                    type="submit"
                    class="text-xs px-2.5 py-1 rounded-lg border border-blue-500/30 text-blue-400 hover:bg-blue-500/10 transition"
                  >
                    {user.role === "admin" ? "Demote" : "Promote"}
                  </button>
                </form>
                <form
                  method="POST"
                  action="?/deleteUser"
                  onsubmit={(e) => {
                    if (!confirm(`Delete ${user.email}?`)) e.preventDefault();
                  }}
                >
                  <input type="hidden" name="userId" value={user.id} />
                  <button
                    type="submit"
                    class="text-xs px-2.5 py-1 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 transition"
                  >
                    Delete
                  </button>
                </form>
              </div>
            </div>
          </div>
        {/each}
      </div>
    </div>
  </div>
</div>
