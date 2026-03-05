<script lang="ts">
  let { data } = $props();
</script>

<div class="min-h-[calc(100vh-56px)] p-4 sm:p-6 md:p-8">
  <div class="max-w-4xl mx-auto">
    <div class="mb-6 sm:mb-8">
      <h1 class="text-2xl sm:text-3xl font-bold text-white mb-1">Dashboard</h1>
      <p class="text-gray-400">Welcome back, <span class="text-blue-400 font-medium">{data.user?.name || "User"}</span>!</p>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
      <!-- User Card -->
      <div class="bg-white/5 backdrop-blur border border-white/10 p-5 sm:p-6 rounded-2xl hover:bg-white/[0.07] transition group">
        <div class="flex items-center gap-3 mb-3">
          <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-600/20 flex items-center justify-center">
            <svg class="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
          </div>
          <div class="text-sm font-medium text-gray-400">Signed in as</div>
        </div>
        <p class="text-lg sm:text-xl font-bold text-white truncate">
          {data.user?.name || "No name set"}
        </p>
        <p class="text-sm text-gray-400 truncate mt-1">{data.user?.email}</p>
      </div>

      <!-- Profile Image Card -->
      <div class="bg-white/5 backdrop-blur border border-white/10 p-5 sm:p-6 rounded-2xl hover:bg-white/[0.07] transition group">
        <div class="flex items-center gap-3 mb-3">
          <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500/20 to-violet-600/20 flex items-center justify-center">
            <svg class="w-5 h-5 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
          </div>
          <div class="text-sm font-medium text-gray-400">Profile</div>
        </div>
        {#if data.user?.image}
          <img
            src={data.user.image}
            alt="Profile"
            class="w-16 h-16 rounded-full ring-2 ring-violet-500/30"
          />
        {:else}
          <div class="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-blue-500/20">
            {(data.user?.name?.[0] || data.user?.email?.[0] || "?").toUpperCase()}
          </div>
        {/if}
      </div>

      <!-- Quick Actions -->
      <div class="bg-white/5 backdrop-blur border border-white/10 p-5 sm:p-6 rounded-2xl hover:bg-white/[0.07] transition group sm:col-span-2 lg:col-span-1">
        <div class="flex items-center gap-3 mb-3">
          <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 flex items-center justify-center">
            <svg class="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
          </div>
          <div class="text-sm font-medium text-gray-400">Quick Actions</div>
        </div>
        <div class="space-y-2">
          <a href="/profile" class="flex items-center gap-2 text-blue-400 hover:text-blue-300 text-sm font-medium transition group/link">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
            Edit Profile
          </a>
          <a href="/chat" class="flex items-center gap-2 text-emerald-400 hover:text-emerald-300 text-sm font-medium transition group/link">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/></svg>
            Start AI Chat
          </a>
        </div>
      </div>
    </div>

    <!-- Session Info -->
    <div class="mt-6 sm:mt-8 bg-white/5 backdrop-blur border border-white/10 p-5 sm:p-6 rounded-2xl">
      <h2 class="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
        Session Information
      </h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-sm">
        <div class="flex flex-col sm:flex-row sm:items-center gap-1 bg-white/5 rounded-lg p-3">
          <span class="text-gray-500">User ID:</span>
          <span class="text-gray-300 font-mono text-xs break-all">{data.user?.id || "N/A"}</span>
        </div>
        <div class="flex flex-col sm:flex-row sm:items-center gap-1 bg-white/5 rounded-lg p-3">
          <span class="text-gray-500">Email:</span>
          <span class="text-gray-300 break-all">{data.user?.email}</span>
        </div>
        <div class="flex flex-col sm:flex-row sm:items-center gap-1 bg-white/5 rounded-lg p-3">
          <span class="text-gray-500">Name:</span>
          <span class="text-gray-300">{data.user?.name || "Not set"}</span>
        </div>
      </div>
    </div>
  </div>
</div>
