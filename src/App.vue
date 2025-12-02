<script setup lang="ts">
import { onMounted, onBeforeUnmount, watch, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useToast } from 'vue-toast-notification'

const router = useRouter()
const auth = useAuthStore()
const toast = useToast()
const isDark = ref(false)

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
    duration: 5000
  })
  router.push('/login')
}

// Expose theme control globally
if (typeof window !== 'undefined') {
  (window as any).__themeControl = {
    isDark,
    toggleTheme: () => {
      isDark.value = !isDark.value
    }
  }
}
</script>

<template>
  <RouterView />
</template>

<style scoped></style>
