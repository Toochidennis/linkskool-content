<template>
  <div class="space-y-8">
    <div>
      <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">Settings</h2>
      <p class="text-gray-600 dark:text-gray-400">Configure your account and system preferences</p>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <!-- Account Settings -->
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div class="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Account Settings</h3>
        </div>
        <div class="p-6 space-y-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Full Name</label>
            <input type="text" :value="auth.user?.name"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email Address</label>
            <input type="email" :value="auth.user?.email"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Role</label>
            <div
              class="px-3 py-2 bg-gray-100 dark:bg-gray-600 rounded-lg text-sm text-gray-900 dark:text-white capitalize">
              {{ auth.user?.role }}
            </div>
          </div>
          <button
            class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors cursor-pointer whitespace-nowrap">
            Save Changes
          </button>
        </div>
      </div>

      <!-- System Preferences -->
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div class="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">System Preferences</h3>
        </div>
        <div class="p-6 space-y-6">
          <div class="flex items-center justify-between">
            <div>
              <div class="font-medium text-gray-900 dark:text-white">Dark Mode</div>
              <div class="text-sm text-gray-600 dark:text-gray-400">Toggle between light and dark themes</div>
            </div>
            <button @click="toggleTheme" :class="{ 'bg-blue-600': isDark, 'bg-gray-300': !isDark }"
              class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer">
              <span :class="{ 'translate-x-6': isDark, 'translate-x-1': !isDark }"
                class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"></span>
            </button>
          </div>
          <div class="flex items-center justify-between">
            <div>
              <div class="font-medium text-gray-900 dark:text-white">Email Notifications</div>
              <div class="text-sm text-gray-600 dark:text-gray-400">Receive email updates about activities</div>
            </div>
            <button
              class="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-600 transition-colors cursor-pointer">
              <span
                class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6"></span>
            </button>
          </div>
          <div class="flex items-center justify-between">
            <div>
              <div class="font-medium text-gray-900 dark:text-white">Auto-save Drafts</div>
              <div class="text-sm text-gray-600 dark:text-gray-400">Automatically save work in progress</div>
            </div>
            <button
              class="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-600 transition-colors cursor-pointer">
              <span
                class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6"></span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const isDark = ref(false)

const toggleTheme = () => {
  isDark.value = !isDark.value
  if (isDark.value) {
    document.documentElement.classList.add('dark')
    localStorage.setItem('theme', 'dark')
  } else {
    document.documentElement.classList.remove('dark')
    localStorage.setItem('theme', 'light')
  }
}

onMounted(() => {
  const savedTheme = localStorage.getItem('theme')
  if (savedTheme === 'dark') {
    isDark.value = true
    document.documentElement.classList.add('dark')
  }
})
</script>
