<template>
  <section>
    <div class="mb-8">
      <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">User Management</h2>
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
                class="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent">
            </div>
            <button
              class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer whitespace-nowrap !rounded-button">
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
                User</th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Role</th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Permissions</th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Last Active</th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Actions</th>
            </tr>
          </thead>
          <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            <tr v-for="user in userList" :key="user.id">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <img :src="user.avatar" alt="User" class="w-8 h-8 rounded-full object-cover mr-3">
                  <div>
                    <div class="text-sm font-medium text-gray-900 dark:text-white">{{ user.name }}</div>
                    <div class="text-sm text-gray-500 dark:text-gray-400">{{ user.email }}</div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="user.roleColor" class="px-2 py-1 text-xs font-medium rounded-full">{{ user.role
                  }}</span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{{ user.permissions
                }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{{ user.lastActive
                }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button class="text-blue-600 hover:text-blue-900 mr-3 cursor-pointer">Edit</button>
                <button class="text-red-600 hover:text-red-900 cursor-pointer">Delete</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </section>
</template>
<script setup lang="ts">
import { ref } from 'vue';

// User list (Admin only)
const userList = ref([
  {
    id: 1,
    name: 'Sarah Johnson',
    email: 'sarah.johnson@linkskool.com',
    role: 'Teacher',
    roleColor: 'bg-blue-100 text-blue-800',
    permissions: 'Upload, View',
    lastActive: '2 hours ago',
    avatar: 'https://readdy.ai/api/search-image?query=professional%20woman%20business%20portrait%20headshot%20clean%20background%20modern%20corporate%20style&width=32&height=32&seq=user-list-001&orientation=squarish'
  },
  {
    id: 2,
    name: 'Mike Chen',
    email: 'mike.chen@linkskool.com',
    role: 'Admin',
    roleColor: 'bg-purple-100 text-purple-800',
    permissions: 'Full Access',
    lastActive: '30 minutes ago',
    avatar: 'https://readdy.ai/api/search-image?query=professional%20man%20business%20portrait%20headshot%20clean%20background%20modern%20corporate%20style&width=32&height=32&seq=user-list-002&orientation=squarish'
  },
  {
    id: 3,
    name: 'Emma Davis',
    email: 'emma.davis@linkskool.com',
    role: 'Student',
    roleColor: 'bg-green-100 text-green-800',
    permissions: 'View Only',
    lastActive: '1 day ago',
    avatar: 'https://readdy.ai/api/search-image?query=professional%20woman%20business%20portrait%20headshot%20clean%20background%20modern%20corporate%20style&width=32&height=32&seq=user-list-003&orientation=squarish'
  }
]);

</script>
