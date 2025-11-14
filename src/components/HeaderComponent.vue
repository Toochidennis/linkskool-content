<template>
  <header
    class="h-16 bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 fixed top-0 left-0 right-0 z-50">
    <div class="flex items-center justify-between h-full px-6">
      <!-- Logo -->
      <div class="flex items-center space-x-3">
        <div class="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
          <i class="fas fa-graduation-cap text-white text-sm"></i>
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
            <img
              src="https://readdy.ai/api/search-image?query=professional%20business%20person%20avatar%20headshot%20with%20clean%20background%20modern%20corporate%20style%20high%20quality%20portrait&width=40&height=40&seq=user-avatar-001&orientation=squarish"
              alt="User Avatar" class="w-8 h-8 rounded-full object-cover">
            <div class="text-left">
              <div class="text-sm font-medium text-gray-900 dark:text-white">John Smith</div>
              <div class="text-xs text-blue-600 dark:text-blue-400">{{ currentUserRole }}</div>
            </div>
            <i class="fas fa-chevron-down text-gray-400 text-xs"></i>
          </button>
          <!-- Dropdown Menu -->
          <div v-if="showUserMenu"
            class="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2">
            <a href="#"
              class="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">Profile
              Settings</a>
            <a href="#"
              class="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">Switch
              Role</a>
            <hr class="my-2 border-gray-200 dark:border-gray-700">
            <a href="#"
              class="block px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">Sign
              Out</a>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
const isDark = ref(false);
const showUserMenu = ref(false);
const currentUserRole = ref('admin');

const toggleTheme = () => {
  isDark.value = !isDark.value;
  if (isDark.value) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
};

onMounted(() => {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark') {
    isDark.value = true;
    document.documentElement.classList.add('dark');
  }
});
</script>
