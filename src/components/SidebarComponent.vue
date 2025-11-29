<template>
  <section>
    <aside :class="{ 'w-54': sidebarOpen, 'w-22': !sidebarOpen }"
      class="fixed left-0 top-16 h-full bg-white dark:bg-gray-800 shadow-sm border-r border-gray-200 dark:border-gray-700 transition-all duration-300 z-40 overflow-y-auto">
      <div class="p-4">
        <button @click="toggleSidebar"
          class="w-full flex items-center justify-center p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer">
          <i :class="sidebarOpen ? 'fas fa-times' : 'fas fa-bars'" class="text-gray-600 dark:text-gray-400"></i>
        </button>
      </div>

      <nav class="px-4 pb-4">
        <div v-for="item in menuItems" :key="item.name" class="mb-2">
          <!-- Parent menu with submenu -->
          <template v-if="item.children">
            <button @click="toggleSubmenu(item.name)" :class="{
              'border-l-4 border-indigo-600 text-indigo-600 dark:text-indigo-400':
                isSubmenuActive(item)
            }"
              class="w-full flex items-center justify-between p-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer whitespace-nowrap text-gray-700 dark:text-gray-300">
              <span class="flex items-center">
                <i :class="item.icon" class="text-lg"></i>
                <span v-if="sidebarOpen" class="ml-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                  {{ item.name }}
                </span>
              </span>
              <i v-if="sidebarOpen" :class="expandedMenus[item.name] ? 'fas fa-chevron-up' : 'fas fa-chevron-down'"
                class="text-xs text-gray-600 dark:text-gray-400"></i>
            </button>

            <!-- Submenu items -->
            <div v-if="expandedMenus[item.name]" class="ml-4 mt-2 space-y-1">
              <router-link v-for="child in item.children" :key="child.name" :to="child.route || ''" :class="{
                'border-l-4 border-indigo-600 text-indigo-600 dark:text-indigo-400':
                  isActiveRoute(child.route || '')
              }"
                class="w-full flex items-center p-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer whitespace-nowrap text-gray-700 dark:text-gray-300">
                <i :class="child.icon" class="text-lg"></i>
                <span v-if="sidebarOpen" class="ml-3 text-sm text-gray-700 dark:text-gray-300">
                  {{ child.name }}
                </span>
              </router-link>
            </div>
          </template>

          <!-- Regular menu item without submenu -->
          <router-link v-else :to="item.route || ''" :class="{
            'border-l-4 border-indigo-600 text-indigo-600 dark:text-indigo-400':
              isActiveRoute(item.route || '')
          }"
            class="w-full flex items-center p-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer whitespace-nowrap text-gray-700 dark:text-gray-300">
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
import { ref, computed, watch } from 'vue'
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
const expandedMenus = ref<{ [key: string]: boolean }>({
  'Content Structure': false,
  'Updates': false,
})

const emit = defineEmits<{
  sidebarStateChange: [isOpen: boolean]
}>()

const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value
  // Close all submenus when sidebar is closed
  if (!sidebarOpen.value) {
    expandedMenus.value = {
      'Content Structure': false,
      'Updates': false,
    }
  }
}

// Emit sidebar state changes
watch(sidebarOpen, (newValue) => {
  emit('sidebarStateChange', newValue)
})

const toggleSubmenu = (menuName: string) => {
  expandedMenus.value[menuName] = !expandedMenus.value[menuName]
}

const isActiveRoute = (routePath: string): boolean => {
  return route.path.startsWith(routePath)
}

const isSubmenuActive = (item: MenuItem): boolean => {
  if (!item.children) return false
  return item.children.some((child: MenuItem) => isActiveRoute(child.route || ''))
}

const menuItems = computed((): MenuItem[] => {
  const baseItems: MenuItem[] = [
    {
      name: 'Dashboard',
      route: '/admin/dashboard',
      icon: 'fas fa-home',
      children: null
    },
    {
      name: 'CBT',
      icon: 'fas fa-layer-group',
      children: [
        { name: 'Courses', route: '/admin/courses', icon: 'fas fa-book' },
        { name: 'Programs', route: '/admin/programs', icon: 'fas fa-sitemap' },
        { name: 'Topics', route: '/admin/topics', icon: 'fas fa-list' },
        { name: 'Syllabus', route: '/admin/syllabus', icon: 'fas fa-graduation-cap' },
        { name: 'Questions', route: '/admin/questions', icon: 'fas fa-question-circle' },
      ]
    },
    {
      name: 'Updates',
      icon: 'fas fa-bell',
      children: [
        { name: 'News', route: '/admin/news', icon: 'fas fa-newspaper' },
        { name: 'Admissions', route: '/admin/admissions', icon: 'fas fa-user-plus' },
      ]
    },
  ]

  if (auth.isAdmin) {
    baseItems.push(
      { name: 'Users', route: '/admin/users', icon: 'fas fa-users', children: null },
      { name: 'Activities', route: '/admin/activities', icon: 'fas fa-clipboard-list', children: null }
    )
  }

  baseItems.push({ name: 'Settings', route: '/admin/settings', icon: 'fas fa-cog', children: null })

  return baseItems
})
</script>
