<template>
    <div class="flex flex-col h-screen bg-gray-50 dark:bg-gray-900">
        <HeaderComponent />
        <div class="flex flex-1 overflow-hidden">
            <SidebarComponent @navigate="handleNavigation" />
            <main :class="{ 'ml-64': sidebarOpen, 'ml-16': !sidebarOpen }"
                class="flex-1 overflow-y-auto pt-16 transition-all duration-300">
                <div class="p-6">
                    <slot />
                </div>
            </main>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import HeaderComponent from '@/components/HeaderComponent.vue'
import SidebarComponent from '@/components/SidebarComponent.vue'

const sidebarOpen = ref(true)

const handleNavigation = (isOpen: boolean) => {
    sidebarOpen.value = isOpen
}
</script>

<style scoped></style>
