<template>
  <section>
    <aside :class="{ 'w-48': sidebarOpen, 'w-16': !sidebarOpen }"
      class="fixed left-0 top-16 h-full bg-white dark:bg-gray-800 shadow-sm border-r border-gray-200 dark:border-gray-700 transition-all duration-300 z-40">
      <div class="p-4">
        <button @click="toggleSidebar"
          class="w-full flex items-center justify-center p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer">
          <i :class="sidebarOpen ? 'fas fa-times' : 'fas fa-bars'" class="text-gray-600 dark:text-gray-400"></i>
        </button>
      </div>

      <nav class="px-4 pb-4">
        <div v-for="item in menuItems" :key="item.name" class="mb-2">
          <router-link :to="item.route" :class="{
            'bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-400 border-r-2 border-blue-600':
              isActiveRoute(item.route)
          }"
            class="w-full flex items-center p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer whitespace-nowrap">
            <i :class="item.icon" class="text-lg"></i>
            <span v-if="sidebarOpen" class="ml-3 text-sm font-medium text-gray-700 dark:text-gray-300">
              {{ item.name }}
            </span>
          </router-link>
        </div>
      </nav>
    </aside>

    <!-- Mobile Overlay -->
    <div v-if="sidebarOpen" @click="sidebarOpen = false" class="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden">
    </div>
  </section>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const auth = useAuthStore()

const sidebarOpen = ref(true)

const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value
}

const isActiveRoute = (routePath: string) => {
  return route.path.startsWith(routePath)
}

const menuItems = computed(() => {
  const baseItems = [
    { name: 'Dashboard', route: '/admin/dashboard', icon: 'fas fa-home' },
    { name: 'Courses', route: '/admin/courses', icon: 'fas fa-book' },
    { name: 'Exams', route: '/admin/exams', icon: 'fas fa-file-alt' },
    { name: 'Programs', route: '/admin/programs', icon: 'fas fa-sitemap' }
  ]

  if (auth.isAdmin) {
    baseItems.push(
      { name: 'Users', route: '/admin/users', icon: 'fas fa-users' },
      { name: 'Activities', route: '/admin/activities', icon: 'fas fa-clipboard-list' }
    )
  }

  baseItems.push({ name: 'Settings', route: '/admin/settings', icon: 'fas fa-cog' })

  return baseItems
})
</script>
