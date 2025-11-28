<template>
  <section class="min-h-screen flex items-center justify-center px-4 bg-gray-50">
    <div class="max-w-md w-full">
      <!-- Logo/Brand -->
      <div class="text-center mb-8">
        <div class="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4">
          <img src="@/assets/logo.png" alt="Logo" class="w-16 h-16 rounded-full" />
        </div>
        <h1 class="text-3xl font-bold text-gray-900">LinkSkool Content Hub</h1>
        <p class="text-gray-600 mt-2">Sign in to your account</p>
      </div>

      <!-- Login Form -->
      <div class="bg-white rounded-lg shadow-lg p-8">
        <form @submit.prevent="handleLogin">
          <!-- Username Field -->
          <div class="mb-6">
            <label for="username" class="block text-sm font-medium text-gray-700 mb-2">
              Username
            </label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <i class="fas fa-user text-gray-400 text-sm"></i>
              </div>
              <input id="username" v-model="loginForm.username" type="text"
                class="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors text-sm"
                :class="{ 'border-red-500': loginError && !loginForm.username }" placeholder="Enter your username"
                required />
            </div>
          </div>

          <!-- Password Field -->
          <div class="mb-6">
            <label for="password" class="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <i class="fas fa-lock text-gray-400 text-sm"></i>
              </div>
              <input id="password" v-model="loginForm.password" :type="showPassword ? 'text' : 'password'"
                class="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors text-sm"
                :class="{ 'border-red-500': loginError && !loginForm.password }" placeholder="Enter your password"
                required />
              <button type="button" @click="showPassword = !showPassword"
                class="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer">
                <i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'" class="text-gray-400 text-sm"></i>
              </button>
            </div>
          </div>

          <!-- Error Message -->
          <div v-if="loginError" class="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div class="flex items-center">
              <i class="fas fa-exclamation-circle text-red-500 text-sm mr-2"></i>
              <p class="text-red-700 text-sm">{{ loginError }}</p>
            </div>
          </div>

          <!-- Sign In Button -->
          <button type="submit" :disabled="isLoading"
            class="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors cursor-pointer"
            :class="{ 'opacity-50 cursor-not-allowed': isLoading }">
            <i v-if="isLoading" class="fas fa-spinner fa-spin mr-2"></i>
            {{ isLoading ? 'Signing In...' : 'Sign In' }}
          </button>
        </form>

        <!-- Forgot Password Link -->
        <div class="text-center mt-6">
          <a href="#" class="text-indigo-600 hover:text-indigo-700 text-sm font-medium cursor-pointer">
            Forgot your password?
          </a>
        </div>
      </div>
    </div>
  </section>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const auth = useAuthStore()

const showPassword = ref(false)
const loginError = ref('')
const loginForm = ref({
  username: '',
  password: ''
})

const isLoading = ref(false)

const handleLogin = async () => {
  loginError.value = ''

  if (!loginForm.value.username || !loginForm.value.password) {
    loginError.value = 'Please enter both username and password'
    return
  }

  isLoading.value = true
  const result = await auth.login(loginForm.value.username, loginForm.value.password)

  if (result?.success) {
    loginError.value = ''
    // Redirect based on role
    if (auth.isAdmin) {
      router.push('/admin')
    } else {
      router.push('/user/upload')
    }
  } else {
    loginError.value = "Invalid username or password. Please try again."
  }
  isLoading.value = false
}
</script>
