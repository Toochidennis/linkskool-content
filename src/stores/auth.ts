import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { userService } from '@/api/services/serviceFactory'
import type { User } from '@/api/models'

// Session timeout in milliseconds (2 hours)
const SESSION_TIMEOUT = 2 * 60 * 60 * 1000

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const isAuthenticated = ref(false)
  const isLoading = ref(false)
  let sessionTimeout: ReturnType<typeof setTimeout> | null = null
  let activityListener: (() => void) | null = null

  /**
   * Set up session timeout timer
   */
  const setupSessionTimeout = () => {
    // Clear existing timeout
    if (sessionTimeout) {
      clearTimeout(sessionTimeout)
    }

    // Set new timeout
    sessionTimeout = setTimeout(() => {
      console.warn('Session expired due to inactivity')
      logout()
      // Optionally show a notification to user
      window.dispatchEvent(new CustomEvent('session-expired'))
    }, SESSION_TIMEOUT)
  }

  /**
   * Reset session timeout on user activity
   */
  const resetSessionTimeout = () => {
    if (isAuthenticated.value) {
      setupSessionTimeout()
    }
  }

  /**
   * Set up activity listeners (mouse, keyboard, touch)
   */
  const setupActivityListeners = () => {
    activityListener = () => {
      resetSessionTimeout()
    }

    // Add event listeners for user activity
    document.addEventListener('mousemove', activityListener, true)
    document.addEventListener('mousedown', activityListener, true)
    document.addEventListener('keydown', activityListener, true)
    document.addEventListener('scroll', activityListener, true)
    document.addEventListener('touchstart', activityListener, true)
  }

  /**
   * Remove activity listeners
   */
  const removeActivityListeners = () => {
    if (activityListener) {
      document.removeEventListener('mousemove', activityListener, true)
      document.removeEventListener('mousedown', activityListener, true)
      document.removeEventListener('keydown', activityListener, true)
      document.removeEventListener('scroll', activityListener, true)
      document.removeEventListener('touchstart', activityListener, true)
    }
  }

  /**
   * Store session timestamp for additional validation
   */
  const storeSessionTimestamp = () => {
    localStorage.setItem('session_timestamp', Date.now().toString())
  }

  /**
   * Check if session has expired (double validation)
   */
  const isSessionExpired = (): boolean => {
    const timestamp = localStorage.getItem('session_timestamp')
    if (!timestamp) return false

    const elapsed = Date.now() - parseInt(timestamp)
    return elapsed > SESSION_TIMEOUT
  }

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
        storeSessionTimestamp();
        setupSessionTimeout();
        setupActivityListeners();
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
    localStorage.removeItem('auth_token')
    localStorage.removeItem('session_timestamp')

    // Clean up timers and listeners
    if (sessionTimeout) {
      clearTimeout(sessionTimeout)
      sessionTimeout = null
    }
    removeActivityListeners()
  }

  const restoreSession = () => {
    const storedUser = localStorage.getItem('user')
    const token = localStorage.getItem('auth_token')

    if (storedUser && token) {
      // Check if session has expired
      if (isSessionExpired()) {
        console.warn('Stored session has expired')
        logout()
        return
      }

      try {
        user.value = JSON.parse(storedUser)
        isAuthenticated.value = true
        // Resume session with new timeout
        setupSessionTimeout()
        setupActivityListeners()
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
    resetSessionTimeout
  }
})
