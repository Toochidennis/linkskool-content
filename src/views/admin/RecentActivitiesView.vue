<template>
  <section>
              <div class="mb-8">
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">Activity Logs</h2>
            <p class="text-gray-600 dark:text-gray-400">Monitor system activities and user actions</p>
          </div>
          <!-- Activity Logs Table -->
          <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div class="p-6 border-b border-gray-200 dark:border-gray-700">
              <div class="flex items-center justify-between">
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white">System Logs</h3>
                <div class="flex items-center space-x-3">
                  <select
                    class="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm">
                    <option>All Activities</option>
                    <option>User Actions</option>
                    <option>System Events</option>
                    <option>Uploads</option>
                  </select>
                  <div class="relative">
                    <i
                      class="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm"></i>
                    <input type="text" placeholder="Search logs..."
                      class="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  </div>
                </div>
              </div>
            </div>
            <div class="overflow-x-auto">
              <table class="w-full">
                <thead class="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th
                      class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Timestamp</th>
                    <th
                      class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      User</th>
                    <th
                      class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Action</th>
                    <th
                      class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Details</th>
                    <th
                      class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Status</th>
                  </tr>
                </thead>
                <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  <tr v-for="log in activityLogs" :key="log.id">
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{{ log.timestamp }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{{
                      log.user }}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{{ log.action }}
                    </td>
                    <td class="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{{ log.details }}</td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <span :class="log.statusColor" class="px-2 py-1 text-xs font-medium rounded-full">{{ log.status
                        }}</span>
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

const activityLogs = ref([
  {
    id: 1,
    timestamp: '2025-11-13 14:30:25',
    user: 'Sarah Johnson',
    action: 'File Upload',
    details: 'Uploaded math_questions_batch_1.csv containing 150 questions',
    status: 'Success',
    statusColor: 'bg-green-100 text-green-800'
  },
  {
    id: 2,
    timestamp: '2025-11-13 13:45:12',
    user: 'Mike Chen',
    action: 'User Creation',
    details: 'Created new user account for Emma Davis with Student role',
    status: 'Success',
    statusColor: 'bg-green-100 text-green-800'
  },
  {
    id: 3,
    timestamp: '2025-11-13 12:15:08',
    user: 'System',
    action: 'Backup Process',
    details: 'Automated database backup completed successfully',
    status: 'Success',
    statusColor: 'bg-green-100 text-green-800'
  },
  {
    id: 4,
    timestamp: '2025-11-13 11:30:45',
    user: 'Emma Davis',
    action: 'Login Attempt',
    details: 'Failed login attempt from IP 192.168.1.100',
    status: 'Failed',
    statusColor: 'bg-red-100 text-red-800'
  }
]);

</script>
