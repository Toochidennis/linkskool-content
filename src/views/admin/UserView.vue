<template>
  <div class="space-y-8">
    <div>
      <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">User Management</h2>
      <p class="text-gray-600 dark:text-gray-400">Manage user accounts and permissions</p>
    </div>

    <!-- User Management Table -->
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
      <div class="p-6 border-b border-gray-200 dark:border-gray-700">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Users</h3>
          <div class="flex items-center space-x-3">
            <div class="relative">
              <i class="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm"></i>
              <input type="text" placeholder="Search users..."
                class="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            </div>
            <button @click="showModal = true"
              class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer whitespace-nowrap">
              <i class="fas fa-plus mr-2"></i>Add User
            </button>
          </div>
        </div>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                User
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Role
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Permissions
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Last Active
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            <tr v-for="user in userList" :key="user.id">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <img :src="user.avatar" alt="User" class="w-8 h-8 rounded-full object-cover mr-3" />
                  <div>
                    <div class="text-sm font-medium text-gray-900 dark:text-white">{{ user.name }}</div>
                    <div class="text-sm text-gray-500 dark:text-gray-400">{{ user.email }}</div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="user.roleColor" class="px-2 py-1 text-xs font-medium rounded-full">
                  {{ user.role }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                {{ user.permissions }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                {{ user.lastActive }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button class="text-blue-600 hover:text-blue-900 mr-3 cursor-pointer">Edit</button>
                <button class="text-red-600 hover:text-red-900 cursor-pointer">Delete</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Add User Modal -->
    <div v-if="showModal" class="fixed inset-0 bg-black/30 backdrop-blur-md flex items-center justify-center z-50">
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Add New User</h3>
          <button @click="closeModal" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <i class="fas fa-times text-xl"></i>
          </button>
        </div>

        <div class="space-y-4">
          <!-- Username -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Username</label>
            <input v-model="newUser.username" type="text" placeholder="Enter username"
              class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
          </div>

          <!-- Email -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
            <input v-model="newUser.email" type="email" placeholder="Enter email address"
              class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
          </div>

          <!-- Password -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
            <input v-model="newUser.password" type="password" placeholder="Enter password"
              class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
          </div>

          <!-- Role -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Role</label>
            <select v-model="newUser.role"
              class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer">
              <option value="">-- Select a role --</option>
              <option value="Admin">Admin</option>
              <option value="Staff">Staff</option>
            </select>
          </div>

          <!-- Permissions -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Permissions</label>
            <div
              class="space-y-2 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700">
              <label v-for="permission in availablePermissions" :key="permission"
                class="flex items-center cursor-pointer">
                <input type="checkbox" :value="permission" v-model="newUser.permissions"
                  class="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500" />
                <span class="ml-2 text-sm text-gray-700 dark:text-gray-300">{{ permission }}</span>
              </label>
            </div>
          </div>
        </div>

        <div class="flex gap-3 mt-6">
          <button @click="closeModal"
            class="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 font-medium transition-colors">
            Cancel
          </button>
          <button @click="addUser"
            class="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors cursor-pointer">
            Add User
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface User {
  id: number
  name: string
  email: string
  role: string
  roleColor: string
  permissions: string
  lastActive: string
  avatar: string
  username?: string
  password?: string
}

const showModal = ref(false)

const availablePermissions = ref([
  'View',
  'Create',
  'Edit',
  'Delete',
  'Full Access'
])

const userList = ref<User[]>([
  {
    id: 1,
    name: 'Sarah Johnson',
    email: 'sarah.johnson@linkskool.com',
    role: 'Teacher',
    roleColor: 'bg-blue-100 text-blue-800',
    permissions: 'Upload, View',
    lastActive: '2 hours ago',
    avatar:
      'https://readdy.ai/api/search-image?query=professional%20woman%20business%20portrait%20headshot%20clean%20background%20modern%20corporate%20style&width=32&height=32&seq=user-list-001&orientation=squarish'
  },
  {
    id: 2,
    name: 'Mike Chen',
    email: 'mike.chen@linkskool.com',
    role: 'Admin',
    roleColor: 'bg-purple-100 text-purple-800',
    permissions: 'Full Access',
    lastActive: '30 minutes ago',
    avatar:
      'https://readdy.ai/api/search-image?query=professional%20man%20business%20portrait%20headshot%20clean%20background%20modern%20corporate%20style&width=32&height=32&seq=user-list-002&orientation=squarish'
  },
  {
    id: 3,
    name: 'Emma Davis',
    email: 'emma.davis@linkskool.com',
    role: 'Student',
    roleColor: 'bg-green-100 text-green-800',
    permissions: 'View Only',
    lastActive: '1 day ago',
    avatar:
      'https://readdy.ai/api/search-image?query=professional%20woman%20business%20portrait%20headshot%20clean%20background%20modern%20corporate%20style&width=32&height=32&seq=user-list-003&orientation=squarish'
  }
])

const newUser = ref({
  username: '',
  email: '',
  password: '',
  role: '',
  permissions: [] as string[]
})

const getRoleColor = (role: string): string => {
  const colors: { [key: string]: string } = {
    'Admin': 'bg-purple-100 text-purple-800',
    'Teacher': 'bg-blue-100 text-blue-800',
    'Student': 'bg-green-100 text-green-800'
  }
  return colors[role] || 'bg-gray-100 text-gray-800'
}

const addUser = () => {
  if (newUser.value.username.trim() && newUser.value.email.trim() && newUser.value.password.trim() && newUser.value.role && newUser.value.permissions.length > 0) {
    const user: User = {
      id: Math.max(...userList.value.map(u => u.id), 0) + 1,
      name: newUser.value.username,
      email: newUser.value.email,
      role: newUser.value.role,
      roleColor: getRoleColor(newUser.value.role),
      permissions: newUser.value.permissions.join(', '),
      lastActive: 'Just now',
      avatar: `https://readdy.ai/api/search-image?query=professional%20portrait%20headshot%20clean%20background&width=32&height=32&seq=user-${Date.now()}&orientation=squarish`,
      username: newUser.value.username,
      password: newUser.value.password
    }
    userList.value.push(user)
    closeModal()
  }
}

const closeModal = () => {
  showModal.value = false
  newUser.value = {
    username: '',
    email: '',
    password: '',
    role: '',
    permissions: []
  }
}
</script>
