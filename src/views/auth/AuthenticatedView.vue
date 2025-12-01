<template>
  <div class="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
    <HeaderComponent />
    <div class="flex flex-1 overflow-hidden">
      <SidebarComponent v-if="isAdmin" @sidebarStateChange="handleSidebarChange" />
      <main :style="{
        marginLeft: isAdmin ? (sidebarOpen ? '13.5rem' : '5.5rem') : '0',
      }" class="flex-1 overflow-y-auto pt-16 transition-all duration-300">
        <div class="p-4 md:p-6">
          <router-view />
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import HeaderComponent from '@/components/HeaderComponent.vue'
import SidebarComponent from '@/components/SidebarComponent.vue'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const isAdmin = auth.isAdmin;

const sidebarOpen = ref(true)

const handleSidebarChange = (isOpen: boolean) => {
  sidebarOpen.value = isOpen
}
</script>

<style scoped></style>
