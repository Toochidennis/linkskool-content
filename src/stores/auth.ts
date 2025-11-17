import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export interface User {
  id: number
  username: string
  email: string
  name: string
  role: 'admin' | 'user'
  avatar?: string
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const isAuthenticated = ref(false)
  const isLoading = ref(false)

  // Default credentials
  const defaultCredentials = {
    admin: { username: 'admin', password: 'admin123', role: 'admin' },
    user: { username: 'user', password: 'user123', role: 'user' }
  }

  // Admin user data
  const adminUser: User = {
    id: 1,
    username: 'admin',
    email: 'admin@linkskool.com',
    name: 'John Smith',
    role: 'admin',
    avatar: 'https://readdy.ai/api/search-image?query=professional%20man%20business%20portrait%20headshot%20clean%20background%20modern%20corporate%20style&width=40&height=40&seq=admin-avatar&orientation=squarish'
  }

  // Regular user data
  const regularUser: User = {
    id: 2,
    username: 'user',
    email: 'user@linkskool.com',
    name: 'Emma Davis',
    role: 'user',
    avatar: 'https://readdy.ai/api/search-image?query=professional%20woman%20business%20portrait%20headshot%20clean%20background%20modern%20corporate%20style&width=40&height=40&seq=user-avatar&orientation=squarish'
  }

  const login = async (username: string, password: string) => {
    isLoading.value = true
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500))

      // Check admin credentials
      if (
        username === defaultCredentials.admin.username &&
        password === defaultCredentials.admin.password
      ) {
        user.value = adminUser
        isAuthenticated.value = true
        localStorage.setItem('user', JSON.stringify(adminUser))
        return { success: true, user: adminUser }
      }

      // Check user credentials
      if (
        username === defaultCredentials.user.username &&
        password === defaultCredentials.user.password
      ) {
        user.value = regularUser
        isAuthenticated.value = true
        localStorage.setItem('user', JSON.stringify(regularUser))
        return { success: true, user: regularUser }
      }

      throw new Error('Invalid credentials')
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
    restoreSession,
    defaultCredentials
  }
})
