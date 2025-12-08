<template>
  <div class="space-y-8">
    <div>
      <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">Team Management</h2>
      <p class="text-gray-600 dark:text-gray-400">Manage team accounts and permissions</p>
    </div>

    <!-- Team Management Table -->
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
      <div class="p-6 border-b border-gray-200 dark:border-gray-700">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Team Members</h3>
          <div class="flex items-center space-x-3">
            <div class="relative">
              <i class="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm"></i>
              <input type="text" placeholder="Search users..."
                class="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            </div>
            <button @click="fetchUsers" :disabled="isLoadingUser"
              class="bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer whitespace-nowrap flex items-center">
              <i :class="isLoadingUser ? 'fas fa-spinner fa-spin' : 'fas fa-refresh'"></i>
            </button>
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
                Status
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
                  <div v-if="user.pictureRef && user.pictureRef !== 'https://via.placeholder.com/32'"
                    class="w-8 h-8 rounded-full mr-3 object-cover overflow-hidden">
                    <img :src="user.pictureRef" alt="User" class="w-full h-full object-cover" />
                  </div>
                  <div v-else
                    :class="`${getAvatarColor(user.firstName)} w-8 h-8 rounded-full mr-3 flex items-center justify-center font-semibold text-white text-xs`">
                    {{ getInitials(user.firstName) }}
                  </div>
                  <div>
                    <div class="text-sm font-medium text-gray-900 dark:text-white">{{ user.firstName }}</div>
                    <div class="text-sm text-gray-500 dark:text-gray-400">{{ user.email }}</div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="user.status === 1 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'"
                  class="px-2 py-1 text-xs font-medium rounded-full">
                  {{ user.status === 1 ? 'Active' : 'Disabled' }}
                </span>
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
                <button @click="openEditModal(user)" class="text-blue-600 hover:text-blue-900 mr-3 cursor-pointer">
                  <i class="fas fa-edit"></i> Edit
                </button>
                <button @click="openDeleteModal(user)" class="text-red-600 hover:text-red-900 cursor-pointer">
                  <i class="fas fa-trash"></i> Delete
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Add User Modal -->
    <div v-if="showModal" @click="closeModal"
      class="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div @click.stop
        class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[95vh] overflow-y-auto">

        <!-- Modal Header -->
        <div
          class="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6 flex items-center justify-between border-b border-blue-600">
          <div>
            <h3 class="text-2xl font-bold text-white mb-1">Add New User</h3>
            <p class="text-blue-100 text-sm">Create a new user account and assign permissions</p>
          </div>
          <button @click="closeModal"
            class="text-blue-100 hover:text-white transition-colors p-2 hover:bg-blue-500 rounded-lg cursor-pointer">
            <i class="fas fa-times text-2xl"></i>
          </button>
        </div>

        <!-- Modal Content -->
        <div class="p-8">
          <div class="space-y-6">
            <!-- Account Information Section -->
            <div>
              <h4 class="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <i class="fas fa-user-circle text-blue-600 mr-2"></i>
                Account Information
              </h4>
              <div
                class="space-y-4 bg-gray-50 dark:bg-gray-700/50 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                <!-- Full Name -->
                <div>
                  <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Full Name</label>
                  <input v-model="newUser.fullName" type="text" placeholder="John Doe"
                    class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" />
                  <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">User's full name</p>
                </div>

                <!-- Username -->
                <div>
                  <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Username</label>
                  <input v-model="newUser.username" type="text" placeholder="john.doe"
                    class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" />
                  <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">Username for login</p>
                </div>

                <!-- Email -->
                <div>
                  <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Email Address</label>
                  <input v-model="newUser.email" type="email" placeholder="john.doe@linkskool.com"
                    class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" />
                  <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">Used for communication and login</p>
                </div>

                <!-- Password -->
                <div>
                  <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Password</label>
                  <div class="relative">
                    <input :type="showPasswordField ? 'text' : 'password'" v-model="newUser.password"
                      placeholder="Enter a secure password"
                      class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all pr-12" />
                    <button @click="showPasswordField = !showPasswordField" type="button"
                      class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors cursor-pointer">
                      <i :class="showPasswordField ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                    </button>
                  </div>
                  <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">Minimum 8 characters recommended</p>
                  <div
                    class="mt-3 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                    <p class="text-sm text-amber-800 dark:text-amber-300">
                      <i class="fas fa-warning mr-2"></i>
                      <span class="font-semibold">Important:</span> Copy the password now! After registration, this
                      password cannot be viewed again. Users can only reset it if needed.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Role and Access Section -->
            <div>
              <h4 class="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <i class="fas fa-shield-alt text-blue-600 mr-2"></i>
                Role and Access
              </h4>
              <div
                class="space-y-4 bg-gray-50 dark:bg-gray-700/50 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                <!-- Role -->
                <div>
                  <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">User Role</label>
                  <select v-model="newUser.role"
                    class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer transition-all">
                    <option value="">-- Select a role --</option>
                    <option value="Admin">Admin</option>
                    <option value="User">User</option>
                  </select>
                  <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">Admin has full access, User has limited
                    access</p>
                </div>

                <!-- Permissions -->
                <div>
                  <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Permissions</label>
                  <div
                    class="grid grid-cols-2 gap-3 p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800">
                    <label v-for="permission in availablePermissions" :key="permission"
                      class="flex items-center p-3 hover:bg-blue-50 dark:hover:bg-gray-700 rounded-lg cursor-pointer transition-colors">
                      <input type="checkbox" :value="permission" v-model="newUser.permissions"
                        class="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer" />
                      <span class="ml-3 text-sm font-medium text-gray-700 dark:text-gray-300">{{ permission }}</span>
                    </label>
                  </div>
                  <p class="text-xs text-gray-500 dark:text-gray-400 mt-2">Select the permissions this user should have
                  </p>
                </div>

                <!-- Status -->
                <div>
                  <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Status</label>
                  <select v-model="newUser.status"
                    class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer transition-all">
                    <option :value="1">Active</option>
                    <option :value="0">Disabled</option>
                  </select>
                  <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">Set whether the account is active</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Modal Footer -->
        <div
          class="bg-gray-50 dark:bg-gray-700/50 px-8 py-4 border-t border-gray-200 dark:border-gray-700 flex gap-3 justify-end sticky bottom-0">
          <button @click="closeModal"
            class="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 font-semibold transition-colors cursor-pointer">
            Cancel
          </button>
          <button @click="addUser" :disabled="isLoadingUser"
            class="px-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition-colors cursor-pointer shadow-md hover:shadow-lg disabled:shadow-none">
            <i :class="isLoadingUser ? 'fas fa-spinner fa-spin mr-2' : 'fas fa-plus mr-2'"></i>{{ isLoadingUser ?
              'Loading...' : 'Add User' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Edit User Modal -->
    <div v-if="showEditModal" @click="closeEditModal"
      class="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div @click.stop
        class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[95vh] overflow-y-auto">

        <!-- Modal Header -->
        <div
          class="sticky top-0 bg-gradient-to-r from-amber-600 to-amber-700 px-8 py-6 flex items-center justify-between border-b border-amber-600">
          <div>
            <h3 class="text-2xl font-bold text-white mb-1">Edit User</h3>
            <p class="text-amber-100 text-sm">Update user details and permissions</p>
          </div>
          <button @click="closeEditModal"
            class="text-amber-100 hover:text-white transition-colors p-2 hover:bg-amber-500 rounded-lg">
            <i class="fas fa-times text-2xl"></i>
          </button>
        </div>

        <!-- Modal Content -->
        <div class="p-8">
          <div class="space-y-6">
            <!-- Account Information Section -->
            <div>
              <h4 class="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <i class="fas fa-user-circle text-amber-600 mr-2"></i>
                Account Information
              </h4>
              <div
                class="space-y-4 bg-gray-50 dark:bg-gray-700/50 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                <!-- Full Name -->
                <div>
                  <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Full Name</label>
                  <input v-model="editingUser.fullName" type="text" placeholder="John Doe"
                    class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all" />
                  <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">User's full name</p>
                </div>

                <!-- Username -->
                <div>
                  <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Username</label>
                  <input v-model="editingUser.username" type="text" placeholder="john.doe" disabled
                    class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed" />
                  <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">Cannot be changed</p>
                </div>

                <!-- Email -->
                <div>
                  <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Email Address</label>
                  <input v-model="editingUser.email" type="email" placeholder="john.doe@linkskool.com"
                    class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all" />
                  <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">Used for communication and login</p>
                </div>

                <!-- Password (Optional) -->
                <div>
                  <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Password
                    (Optional)</label>
                  <div class="relative">
                    <input :type="showEditPasswordField ? 'text' : 'password'" v-model="editingUser.password"
                      placeholder="Leave empty to keep current password"
                      class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all pr-12" />
                    <button @click="showEditPasswordField = !showEditPasswordField" type="button"
                      class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors cursor-pointer">
                      <i :class="showEditPasswordField ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                    </button>
                  </div>
                  <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">Only fill if you want to change the password.
                    Leave empty to keep the current one.</p>
                </div>
              </div>
            </div>

            <!-- Role and Access Section -->
            <div>
              <h4 class="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <i class="fas fa-shield-alt text-amber-600 mr-2"></i>
                Role and Access
              </h4>
              <div
                class="space-y-4 bg-gray-50 dark:bg-gray-700/50 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                <!-- Role -->
                <div>
                  <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">User Role</label>
                  <select v-model="editingUser.role"
                    class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent cursor-pointer transition-all">
                    <option value="">-- Select a role --</option>
                    <option value="Admin">Admin</option>
                    <option value="User">User</option>
                  </select>
                  <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">Admin has full access, User has limited
                    access</p>
                </div>
                <!-- Status -->
                <div>
                  <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Status</label>
                  <select v-model="editingUser.status"
                    class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent cursor-pointer transition-all">
                    <option :value="1">Active</option>
                    <option :value="0">Disabled</option>
                  </select>
                  <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">Set whether the account is active</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Modal Footer -->
        <div
          class="bg-gray-50 dark:bg-gray-700/50 px-8 py-4 border-t border-gray-200 dark:border-gray-700 flex gap-3 justify-end sticky bottom-0">
          <button @click="closeEditModal"
            class="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 font-semibold transition-colors cursor-pointer">
            Cancel
          </button>
          <button @click="updateUser" :disabled="isLoadingUser"
            class="px-8 py-3 bg-amber-600 hover:bg-amber-700 disabled:bg-amber-400 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition-colors cursor-pointer shadow-md hover:shadow-lg disabled:shadow-none">
            <i :class="isLoadingUser ? 'fas fa-spinner fa-spin mr-2' : 'fas fa-save mr-2'"></i>{{ isLoadingUser ?
              'Updating...' : 'Update User' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Delete User Modal -->
    <div v-if="showDeleteModal" @click="closeDeleteModal"
      class="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div @click.stop class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-sm">
        <div class="p-8">
          <div class="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 dark:bg-red-900 mb-4 mx-auto">
            <i class="fas fa-trash text-red-600 dark:text-red-400 text-lg"></i>
          </div>
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2 text-center">Delete User</h3>
          <p class="text-gray-600 dark:text-gray-300 mb-4 text-center">
            Are you sure you want to delete <strong>{{ deletingUser?.firstName }}</strong>? This action cannot be
            undone.
          </p>
          <div class="flex gap-3">
            <button @click="closeDeleteModal"
              class="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 font-semibold transition-colors cursor-pointer">
              Cancel
            </button>
            <button @click="deleteUser" :disabled="isLoadingUser"
              class="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition-colors cursor-pointer shadow-md hover:shadow-lg disabled:shadow-none">
              <i :class="isLoadingUser ? 'fas fa-spinner fa-spin mr-2' : 'fas fa-trash mr-2'"></i>{{ isLoadingUser ?
                'Deleting...' : 'Delete' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useToast } from 'vue-toast-notification'
import type { User } from '@/api/models'
import { userService } from '@/api/services/serviceFactory'

const showModal = ref(false)

const showPasswordField = ref(false)

const showEditPasswordField = ref(false)

const isLoadingUser = ref(false)

const showEditModal = ref(false)

const showDeleteModal = ref(false)

const editingUser = ref({
  id: 0,
  fullName: '',
  username: '',
  email: '',
  role: '',
  password: '',
  status: 1
})

const deletingUser = ref<(User & { firstName: string }) | null>(null)

const $toast = useToast()

const availablePermissions = ref([
  'View',
  'Create',
  'Edit',
  'Delete',
  'Full Access'
])

const userList = ref<User[]>([])

const newUser = ref({
  fullName: '',
  username: '',
  email: '',
  password: '',
  role: '',
  permissions: [] as string[],
  status: 1
})

const getRoleColor = (role: string): string => {
  const colors: { [key: string]: string } = {
    'Admin': 'bg-purple-100 text-purple-800',
    'User': 'bg-blue-100 text-blue-800',
  }
  return colors[role] || 'bg-gray-100 text-gray-800'
}

const getInitials = (name: string | undefined): string => {
  if (!name) return '?'
  const parts = name.trim().split(' ').filter(p => p.length > 0)
  if (parts.length === 0) return '?'
  if (parts.length >= 2) {
    return (parts[0]?.[0] || '?' + parts[parts.length - 1]?.[0] || '?').toUpperCase()
  }
  return (parts[0]?.substring(0, 2) || '?').toUpperCase()
}

const getAvatarColor = (name: string | undefined): string => {
  if (!name) return 'bg-gray-500'
  const colors = [
    'bg-blue-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-green-500',
    'bg-yellow-500',
    'bg-red-500',
    'bg-indigo-500',
    'bg-teal-500'
  ]
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return colors[Math.abs(hash) % colors.length] || 'bg-gray-500'
}

const formatLastActive = (timestamp: string): string => {
  if (!timestamp || timestamp === '-') return '-'

  try {
    const lastActiveDate = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - lastActiveDate.getTime()
    const diffSeconds = Math.floor(diffMs / 1000)
    const diffMinutes = Math.floor(diffSeconds / 60)
    const diffHours = Math.floor(diffMinutes / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffSeconds < 60) {
      return 'Just now'
    } else if (diffMinutes < 60) {
      return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`
    } else if (diffHours < 24) {
      return `${diffHours}hr${diffHours > 1 ? 's' : ''} ago`
    } else if (diffDays < 30) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
    } else {
      const diffMonths = Math.floor(diffDays / 30)
      return `${diffMonths} month${diffMonths > 1 ? 's' : ''} ago`
    }
  } catch {
    return '-'
  }
}

const fetchUsers = async () => {
  try {
    isLoadingUser.value = true
    const response = await userService.get()
    if (response.success && response.data) {
      userList.value = response.data.map((user: User) => ({
        id: user.id,
        firstName: `${user.firstName} ${user.lastName || ''}`.trim(),
        name: `${user.firstName} ${user.lastName || ''}`.trim(),
        email: user.email || '',
        role: user.role,
        roleColor: getRoleColor(user.role),
        permissions: user.role === 'Admin' ? 'Full Access' : 'View, Create',
        lastActive: formatLastActive(user.lastActive || '-'),
        pictureRef: user.pictureRef || 'https://via.placeholder.com/32',
        username: user.username || '',
        status: (((user as unknown as { status?: number }).status ?? 1) === 1 ? 1 : 0) as 0 | 1
      }))
    }
  } catch (error) {
    console.error('Error fetching users:', error)
  } finally {
    isLoadingUser.value = false
  }
}

onMounted(() => {
  fetchUsers()
})

const addUser = async () => {
  if (!newUser.value.fullName.trim()) {
    $toast.warning('Please enter full name')
    return
  }
  if (!newUser.value.username.trim()) {
    $toast.warning('Please enter username')
    return
  }
  if (!newUser.value.password.trim()) {
    $toast.warning('Please enter password')
    return
  }
  if (!newUser.value.role) {
    $toast.warning('Please select a role')
    return
  }

  try {
    isLoadingUser.value = true
    const userObj = localStorage.getItem('user')
    const user = {
      creatorId: JSON.parse(userObj ? userObj : '{}').id || 0,
      createdBy: JSON.parse(userObj ? userObj : '{}').firstName || 'System',
      firstName: newUser.value.fullName,
      email: newUser.value.email,
      role: newUser.value.role,
      username: newUser.value.username,
      password: newUser.value.password,
      status: newUser.value.status
    }

    const response = await userService.post(undefined, user as unknown as Record<string, unknown>)

    if (response.success) {
      $toast.success(response.message || 'User created successfully!')
      await fetchUsers()
      closeModal()
    } else {
      $toast.error(response.message || 'Failed to create user')
    }
  } catch (error) {
    console.error('Error creating user:', error)
    $toast.error('Failed to create user. Please try again.')
  } finally {
    isLoadingUser.value = false
  }
}

const openEditModal = (user: User & { firstName: string }) => {
  editingUser.value = {
    id: user.id,
    fullName: user.firstName,
    username: user.username,
    email: user.email || '',
    role: user.role,
    password: '',
    status: (user as unknown as { status?: number }).status ?? 1
  }
  showEditPasswordField.value = false
  showEditModal.value = true
}

const closeEditModal = () => {
  showEditModal.value = false
  showEditPasswordField.value = false
  editingUser.value = {
    id: 0,
    fullName: '',
    username: '',
    email: '',
    role: '',
    password: '',
    status: 1
  }
}

const updateUser = async () => {
  if (!editingUser.value.fullName.trim()) {
    $toast.warning('Please enter full name')
    return
  }
  // if (!editingUser.value.email.trim()) {
  //   $toast.warning('Please enter email address')
  //   return
  // }
  if (!editingUser.value.role) {
    $toast.warning('Please select a role')
    return
  }

  try {
    isLoadingUser.value = true
    const user: Record<string, unknown> = {
      firstName: editingUser.value.fullName,
      username: editingUser.value.username,
      email: editingUser.value.email,
      role: editingUser.value.role
    }

    // Only include password if it's provided
    if (editingUser.value.password.trim()) {
      user.password = editingUser.value.password
    }
    // include status
    user.status = editingUser.value.status

    const response = await userService.put(`${editingUser.value.id}`, user)

    if (response.success) {
      $toast.success(response.message || 'User updated successfully!')
      await fetchUsers()
      closeEditModal()
    } else {
      $toast.error(response.message || 'Failed to update user')
    }
  } catch (error) {
    console.error('Error updating user:', error)
    $toast.error('Failed to update user. Please try again.')
  } finally {
    isLoadingUser.value = false
  }
}

const openDeleteModal = (user: User & { firstName: string }) => {
  deletingUser.value = user
  showDeleteModal.value = true
}

const closeDeleteModal = () => {
  showDeleteModal.value = false
  deletingUser.value = null
}

const deleteUser = async () => {
  if (!deletingUser.value) return

  try {
    isLoadingUser.value = true
    const response = await userService.delete(`${deletingUser.value.id}`)

    if (response.success) {
      $toast.success(response.message || 'User deleted successfully!')
      await fetchUsers()
      closeDeleteModal()
    } else {
      $toast.error(response.message || 'Failed to delete user')
    }
  } catch (error) {
    console.error('Error deleting user:', error)
    $toast.error('Failed to delete user. Please try again.')
  } finally {
    isLoadingUser.value = false
  }
}

const closeModal = () => {
  showModal.value = false
  showPasswordField.value = false
  newUser.value = {
    fullName: '',
    username: '',
    email: '',
    password: '',
    role: '',
    permissions: [],
    status: 1
  }
}
</script>
