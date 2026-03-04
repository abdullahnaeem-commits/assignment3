<script lang="ts">
  let { data } = $props();
</script>

<div class="min-h-[calc(100vh-56px)] bg-gray-50 p-6 sm:p-8">
  <div class="max-w-4xl mx-auto">
    <h1 class="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
    <p class="text-gray-600 mb-8">Welcome back, {data.user?.name || "User"}!</p>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <!-- User Card -->
      <div class="bg-white p-6 rounded-2xl shadow">
        <div class="text-sm font-medium text-gray-500 mb-1">Signed in as</div>
        <p class="text-xl font-bold text-gray-900 truncate">
          {data.user?.name || "No name set"}
        </p>
        <p class="text-sm text-gray-500 truncate mt-1">{data.user?.email}</p>
      </div>

      <!-- Profile Image Card -->
      <div class="bg-white p-6 rounded-2xl shadow">
        <div class="text-sm font-medium text-gray-500 mb-3">Profile</div>
        {#if data.user?.image}
          <img
            src={data.user.image}
            alt="Profile"
            class="w-16 h-16 rounded-full"
          />
        {:else}
          <div class="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-2xl font-bold">
            {(data.user?.name?.[0] || data.user?.email?.[0] || "?").toUpperCase()}
          </div>
        {/if}
      </div>

      <!-- Quick Actions -->
      <div class="bg-white p-6 rounded-2xl shadow">
        <div class="text-sm font-medium text-gray-500 mb-3">Quick Actions</div>
        <div class="space-y-2">
          <a
            href="/profile"
            class="block text-blue-600 hover:text-blue-800 hover:underline text-sm font-medium"
          >
            Edit Profile
          </a>
        </div>
      </div>
    </div>

    <!-- Session Info -->
    <div class="mt-8 bg-white p-6 rounded-2xl shadow">
      <h2 class="text-lg font-semibold text-gray-900 mb-4">Session Information</h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
        <div>
          <span class="text-gray-500">User ID:</span>
          <span class="ml-2 text-gray-900 font-mono text-xs">{data.user?.id || "N/A"}</span>
        </div>
        <div>
          <span class="text-gray-500">Email:</span>
          <span class="ml-2 text-gray-900">{data.user?.email}</span>
        </div>
        <div>
          <span class="text-gray-500">Name:</span>
          <span class="ml-2 text-gray-900">{data.user?.name || "Not set"}</span>
        </div>
      </div>
    </div>
  </div>
</div>
