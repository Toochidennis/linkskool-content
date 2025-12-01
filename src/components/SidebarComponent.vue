<template>
  <section class="hidden lg:block">
    <aside :style="{ width: sidebarOpen ? '13.5rem' : '5.5rem' }"
      class="fixed left-0 top-16 h-full bg-white dark:bg-gray-800 shadow-sm border-r border-gray-200 dark:border-gray-700 transition-all duration-300 z-40 overflow-y-auto">
      <div class="p-4">
        <button @click="toggleSidebar"
          class="w-full flex items-center justify-center p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer">
          <i :class="sidebarOpen ? 'fas fa-times' : 'fas fa-bars'" class="text-gray-600 dark:text-gray-400"></i>
        </button>
      </div>

      <nav class="px-4 pb-4">
        <div v-for="item in menuItems" :key="item.name" class="mb-6">
          <!-- Section with children -->
          <template v-if="item.children">
            <div v-if="sidebarOpen" class="mb-3">
              <div class="border-t border-gray-300 dark:border-gray-600 mb-2"></div>
              <div class="px-3 py-2">
                <h3
                  class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide flex items-center">
                  <i :class="item.icon" class="text-sm mr-2"></i>
                  {{ item.name }}
                </h3>
              </div>
            </div>
            <div class="space-y-1">
              <router-link v-for="child in item.children" :key="child.name" :to="child.route || ''" :class="{
                'border-l-4 border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20':
                  isActiveRoute(child.route || '')
              }"
                class="w-full flex items-center p-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer whitespace-nowrap text-gray-700 dark:text-gray-300 rounded-r-lg">
                <i :class="child.icon" class="text-lg"></i>
                <span v-if="sidebarOpen" class="ml-3 text-sm text-gray-700 dark:text-gray-300">
                  {{ child.name }}
                </span>
              </router-link>
            </div>
          </template>

          <!-- Regular menu item without submenu -->
          <router-link v-else :to="item.route || ''" :class="{
            'border-l-4 border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20':
              isActiveRoute(item.route || '')
          }"
            class="w-full flex items-center p-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer whitespace-nowrap text-gray-700 dark:text-gray-300 rounded-r-lg">
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
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

interface MenuItem {
  name: string
  route?: string
  icon: string
  children?: MenuItem[] | null
}

const route = useRoute()
const auth = useAuthStore()

const sidebarOpen = ref(true)

const emit = defineEmits<{
  sidebarStateChange: [isOpen: boolean]
}>()

const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value
}

// Emit sidebar state changes
watch(sidebarOpen, (newValue) => {
  emit('sidebarStateChange', newValue)
})

const isActiveRoute = (routePath: string): boolean => {
  if (routePath === '/dashboard') {
    return route.path === '/dashboard'
  }
  return route.path.startsWith(routePath)
}

const menuItems: MenuItem[] = [
  {
    name: 'Dashboard',
    route: '/dashboard',
    icon: 'fas fa-home',
    children: null
  },
  {
    name: 'CBT',
    icon: 'fas fa-layer-group',
    children: [
      { name: 'Courses', route: '/dashboard/courses', icon: 'fas fa-book' },
      { name: 'Programs', route: '/dashboard/programs', icon: 'fas fa-sitemap' },
      { name: 'Topics', route: '/dashboard/topics', icon: 'fas fa-list' },
      { name: 'Syllabus', route: '/dashboard/syllabus', icon: 'fas fa-graduation-cap' },
      { name: 'Assessments', route: '/dashboard/assessments', icon: 'fas fa-question-circle' },
    ]
  },
  {
    name: 'Updates',
    icon: 'fas fa-bell',
    children: [
      { name: 'Announcements', route: '/dashboard/announcements', icon: 'fas fa-newspaper' },
      { name: 'Admissions', route: '/dashboard/admissions', icon: 'fas fa-user-plus' },
    ]
  },
]

// Add admin items if user is admin
if (auth.isAdmin) {
  menuItems.push(
    { name: 'Team', route: '/dashboard/team', icon: 'fas fa-users', children: null },
    { name: 'Logs', route: '/dashboard/logs', icon: 'fas fa-clipboard-list', children: null }
  )
}

menuItems.push({ name: 'Settings', route: '/dashboard/config', icon: 'fas fa-cog', children: null })
</script>
