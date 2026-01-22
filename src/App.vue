<script setup lang="ts">
import { onMounted, onBeforeUnmount, watch, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useToast } from 'vue-toast-notification'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()
const toast = useToast()
const isDark = ref(false)
const transitionName = ref('slide-left')

// Handle route transitions
router.beforeEach((to, from) => {
  // Determine transition direction
  const toDepth = to.path.split('/').length
  const fromDepth = from.path.split('/').length

  // Special handling for lesson form - slide in from right
  if (to.name === 'Lesson Form') {
    transitionName.value = 'slide-left'
  } else if (from.name === 'Lesson Form') {
    transitionName.value = 'slide-right'
  } else {
    transitionName.value = toDepth < fromDepth ? 'slide-right' : 'slide-left'
  }
})

const initializeTheme = () => {
  const savedTheme = localStorage.getItem('theme')
  if (savedTheme === 'dark') {
    isDark.value = true
    document.documentElement.classList.add('dark')
  } else {
    isDark.value = false
    document.documentElement.classList.remove('dark')
  }
}

watch(isDark, (newValue) => {
  if (newValue) {
    document.documentElement.classList.add('dark')
    localStorage.setItem('theme', 'dark')
  } else {
    document.documentElement.classList.remove('dark')
    localStorage.setItem('theme', 'light')
  }
})

onMounted(() => {
  initializeTheme()
  auth.restoreSession()

  // Listen for session expiration
  window.addEventListener('session-expired', handleSessionExpired)
})

onBeforeUnmount(() => {
  window.removeEventListener('session-expired', handleSessionExpired)
})

const handleSessionExpired = () => {
  toast.warning('Your session has expired. Please log in again.', {
    position: 'top',
    duration: 5000,
  })
  router.push('/login')
}

// Expose theme control globally
if (typeof window !== 'undefined') {
  ; (window as any).__themeControl = {
    isDark,
    toggleTheme: () => {
      isDark.value = !isDark.value
    },
  }
}
</script>

<template>
  <RouterView v-slot="{ Component }">
    <Transition :name="transitionName" mode="out-in">
      <component :is="Component" />
    </Transition>
  </RouterView>
</template>

<style>
/* Slide transitions */
.slide-left-enter-active,
.slide-left-leave-active,
.slide-right-enter-active,
.slide-right-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-left-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.slide-left-leave-to {
  opacity: 0;
  transform: translateX(-30%);
}

.slide-right-enter-from {
  opacity: 0;
  transform: translateX(-30%);
}

.slide-right-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

.slide-left-enter-to,
.slide-right-enter-to {
  opacity: 1;
  transform: translateX(0);
}

.slide-left-leave-from,
.slide-right-leave-from {
  opacity: 1;
  transform: translateX(0);
}
</style>
