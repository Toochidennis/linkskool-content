<template>
  <section>
    <aside :class="{ 'w-64': sidebarOpen, 'w-16': !sidebarOpen }"
      class="fixed left-0 top-16 h-full bg-white dark:bg-gray-800 shadow-sm border-r border-gray-200 dark:border-gray-700 transition-all duration-300 z-40">
      <div class="p-4">
        <button @click="sidebarOpen = !sidebarOpen"
          class="w-full flex items-center justify-center p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer">
          <i :class="sidebarOpen ? 'fas fa-times' : 'fas fa-bars'" class="text-gray-600 dark:text-gray-400"></i>
        </button>
      </div>
      <nav class="px-4 pb-4">
        <div v-for="item in menuItems" :key="item.name" class="mb-2">
          <button @click="activeTab = item.key"
            :class="{ 'bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-400 border-r-2 border-blue-600': activeTab === item.key }"
            class="w-full flex items-center p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer whitespace-nowrap !rounded-button">
            <i :class="item.icon" class="text-lg"></i>
            <span v-if="sidebarOpen" class="ml-3 text-sm font-medium text-gray-700 dark:text-gray-300">{{ item.name
              }}</span>
          </button>
        </div>
      </nav>
    </aside>
    <!-- Mobile Overlay -->
    <div v-if="sidebarOpen" @click="sidebarOpen = false" class="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden">
    </div>
  </section>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue';

const sidebarOpen = ref(true);
const currentUserRole = ref('Admin');
const activeTab = ref('dashboard');

const menuItems = computed(() => {
  const baseItems = [
    { name: 'Dashboard', key: 'dashboard', icon: 'fas fa-home' },
    { name: 'Content Management', key: 'content', icon: 'fas fa-file-alt' },
    { name: 'Program Setup', key: 'programs', icon: 'fas fa-sitemap' },
    { name: 'Settings', key: 'settings', icon: 'fas fa-cog' }
  ];
  if (currentUserRole.value === 'Admin') {
    baseItems.splice(3, 0,
      { name: 'User Management', key: 'users', icon: 'fas fa-users' },
      { name: 'Activity Logs', key: 'logs', icon: 'fas fa-clipboard-list' }
    );
  }
  return baseItems;
});
</script>
