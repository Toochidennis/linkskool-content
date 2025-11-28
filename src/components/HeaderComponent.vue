<template>
  <header
    class="h-16 bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 fixed top-0 left-0 right-0 z-50">
    <div class="flex items-center justify-between h-full px-6">
      <!-- Logo -->
      <div class="flex items-center space-x-3">
        <div class="w-8 h-8 rounded-lg flex items-center justify-center">
          <img src="@/assets/logo.png" alt="Logo" class="w-8 h-8" />
        </div>
        <h1 class="text-xl font-bold text-gray-900 dark:text-white">LinkSkool Content Hub</h1>
      </div>

      <!-- Theme Toggle & User Profile -->
      <div class="flex items-center space-x-4">
        <!-- Theme Toggle -->
        <button @click="toggleTheme"
          class="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors cursor-pointer">
          <i :class="isDark ? 'fas fa-sun text-yellow-500' : 'fas fa-moon text-gray-600'" class="text-lg"></i>
        </button>

        <!-- User Profile Dropdown -->
        <div class="relative">
          <button @click="showUserMenu = !showUserMenu"
            class="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer">
            <img :src="auth.user?.picture_ref" :alt="auth.user?.username" class="w-8 h-8 rounded-full object-cover" />
            <div class="text-left hidden sm:block">
              <div class="text-sm font-medium text-gray-900 dark:text-white">
                {{ auth.user?.username || '' }}
              </div>
              <div class="text-xs text-blue-600 dark:text-blue-400 capitalize">
                {{ auth.user?.role }}
              </div>
            </div>
            <i class="fas fa-chevron-down text-gray-400 text-xs"></i>
          </button>

          <!-- Dropdown Menu -->
          <div v-if="showUserMenu"
            class="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50">
            <router-link to="/admin/settings" @click="showUserMenu = false"
              class="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">
              <i class="fas fa-cog mr-2"></i>
              Profile Settings
            </router-link>
            <hr class="my-2 border-gray-200 dark:border-gray-700" />
            <button @click="handleLogout"
              class="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">
              <i class="fas fa-sign-out-alt mr-2"></i>
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const auth = useAuthStore()

const isDark = ref(false)
const showUserMenu = ref(false)

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

const handleLogout = () => {
  auth.logout()
  showUserMenu.value = false
  router.push('/login')
}

onMounted(() => {
  const savedTheme = localStorage.getItem('theme')
  if (savedTheme === 'dark') {
    isDark.value = true
    document.documentElement.classList.add('dark')
  }
})
</script>
