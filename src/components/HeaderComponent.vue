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
        <div class="relative user-menu-container">
          <button @click="showUserMenu = !showUserMenu"
            class="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer">
            <div v-if="auth.user?.picture_ref && isValidImageUrl(auth.user.picture_ref)"
              class="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
              <img :src="auth.user.picture_ref" :alt="auth.user?.username" class="w-full h-full object-cover" />
            </div>
            <div v-else :class="getAvatarColor(auth.user?.username)"
              class="w-8 h-8 rounded-full flex items-center justify-center font-semibold text-white text-xs flex-shrink-0">
              {{ getInitials(auth.user?.username) }}
            </div>
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
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const auth = useAuthStore()

const isDark = ref(false)
const showUserMenu = ref(false)

const initializeTheme = () => {
  const isDarkMode = document.documentElement.classList.contains('dark')
  isDark.value = isDarkMode
}

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

// Watch for external theme changes
watch(
  () => document.documentElement.classList.contains('dark'),
  (newValue) => {
    isDark.value = newValue
  }
)

const handleLogout = () => {
  auth.logout()
  showUserMenu.value = false
  router.push('/login')
}

const closeUserMenu = () => {
  showUserMenu.value = false
}

const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as HTMLElement
  // Check if click is outside the dropdown menu
  if (!target.closest('.user-menu-container')) {
    closeUserMenu()
  }
}

const getInitials = (name: string | undefined): string => {
  if (!name) return '?'
  const parts = name.trim().split(' ').filter(p => p.length > 0)
  if (parts.length === 0) return '?'
  if (parts.length >= 2) {
    return ((parts[0]?.[0] || '?') + (parts[parts.length - 1]?.[0] || '?')).toUpperCase()
  }
  return (parts[0]?.substring(0, 1) || '?').toUpperCase()
}

const getAvatarColor = (name: string | undefined): string => {
  if (!name) return 'bg-gray-500'
  const colors = [
    'bg-blue-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-green-500',
    'bg-yellow-500',
    'bg-red-500',
    'bg-indigo-500',
    'bg-teal-500'
  ]
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return colors[Math.abs(hash) % colors.length] || 'bg-gray-500'
}

const isValidImageUrl = (url: string | undefined): boolean => {
  if (!url) return false
  return url.trim() !== '' && !url.includes('via.placeholder.com') && !url.includes('null')
}

onMounted(() => {
  initializeTheme()

  // Add click-outside listener
  document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
  // Remove click-outside listener
  document.removeEventListener('click', handleClickOutside)
})
</script>
