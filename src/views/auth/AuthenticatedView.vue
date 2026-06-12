<template>
  <div class="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
    <HeaderComponent />
    <div class="flex flex-1 overflow-hidden">
      <SidebarComponent v-if="isAdmin && !isFocusedEditor" @sidebarStateChange="handleSidebarChange" />
      <main :style="{
        marginLeft:
          isAdmin && !sidebarIsMobile && !isFocusedEditor ? (sidebarOpen ? '13.5rem' : '5.5rem') : '0',
      }" class="flex-1 overflow-y-auto pt-16 transition-all duration-300">
        <div :class="isFocusedEditor ? 'p-0' : 'p-4 md:p-6'">
          <router-view />
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import HeaderComponent from '@/components/HeaderComponent.vue'
import SidebarComponent from '@/components/SidebarComponent.vue'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const route = useRoute()
const isAdmin = auth.isAdmin;

const sidebarOpen = ref(true)
const sidebarIsMobile = ref(false)
const isFocusedEditor = computed(() => Boolean(route.meta.focusedEditor))

const handleSidebarChange = (payload: { isOpen: boolean; isMobile: boolean }) => {
  sidebarOpen.value = payload.isOpen
  sidebarIsMobile.value = payload.isMobile
}
</script>

<style scoped></style>
