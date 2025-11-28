import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { userService } from '@/api/services/serviceFactory'
import type { User } from '@/api/models'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const isAuthenticated = ref(false)
  const isLoading = ref(false)

  const login = async (username: string, password: string) => {
    isLoading.value = true
    try {
      const response = await userService
        .action('login')
        .post<{ user: User, token: string }>({
          username,
          password
        });

      if (response && response.success) {
        user.value = response.data!.user;
        isAuthenticated.value = true;
        localStorage.setItem('user', JSON.stringify(response.data!.user));
        localStorage.setItem('auth_token', response.data!.token);
        return { success: true, user: response.data!.user };
      }

      return { success: false, message: response?.message || 'Login failed' };
    } catch (error) {
      console.log('Login error:', error);
      return { success: false, error };
    } finally {
      isLoading.value = false
    }
  }

  const logout = () => {
    user.value = null
    isAuthenticated.value = false
    localStorage.removeItem('user')
  }

  const restoreSession = () => {
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      try {
        user.value = JSON.parse(storedUser)
        isAuthenticated.value = true
      } catch {
        logout()
      }
    }
  }

  const userRole = computed(() => user.value?.role || null)
  const isAdmin = computed(() => user.value?.role === 'admin')
  const isUser = computed(() => user.value?.role === 'user')

  return {
    user,
    isAuthenticated,
    isLoading,
    userRole,
    isAdmin,
    isUser,
    login,
    logout,
    restoreSession
  }
})
