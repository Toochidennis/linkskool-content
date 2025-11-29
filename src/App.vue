<script setup lang="ts">
import { onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useToast } from 'vue-toast-notification'

const router = useRouter()
const auth = useAuthStore()
const toast = useToast()

onMounted(() => {
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
</script>

<template>
  <RouterView />
</template>

<style scoped></style>
