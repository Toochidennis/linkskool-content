<template>
  <div class="space-y-8">
    <div>
      <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">Activity Logs</h2>
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
              <i class="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm"></i>
              <input type="text" placeholder="Search logs..."
                class="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
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
                Timestamp
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                User
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Action
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Details
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            <tr v-for="log in activityLogs" :key="log.id">
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                {{ log.createdAt }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                {{ log.username }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                {{ log.action }}
              </td>
              <td class="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                {{ log.details || 'N/A' }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="getStatusColor(log.status)" class="px-2 py-1 text-xs font-medium rounded-full">
                  {{ log.status || 'N/A' }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <!-- Pagination Controls -->
      <div class="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <div class="text-sm text-gray-600 dark:text-gray-400">
          Showing {{ (currentPage - 1) * paginationMeta.perPage + 1 }} to {{ Math.min(currentPage *
            paginationMeta.perPage, paginationMeta.total) }} of {{ paginationMeta.total }} results
        </div>
        <div class="flex items-center space-x-2">
          <button @click="fetchActivityLogs(currentPage - 1)" :disabled="!paginationMeta.hasPrev"
            class="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
            Previous
          </button>
          <div class="flex items-center space-x-1">
            <button v-for="page in visiblePages" :key="page" @click="fetchActivityLogs(page)"
              :class="currentPage === page ? 'bg-blue-600 text-white' : 'border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'"
              class="px-2 py-1 rounded-lg text-sm font-medium transition-colors">
              {{ page }}
            </button>
          </div>
          <button @click="fetchActivityLogs(currentPage + 1)" :disabled="!paginationMeta.hasNext"
            class="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
            Next
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { ActivityLog } from '@/api/models'
import { activityLogService } from '@/api/services/serviceFactory'
import { useToast } from 'vue-toast-notification'

const $toast = useToast()

const activityLogs = ref<ActivityLog[]>([])
const currentPage = ref(1)
const paginationMeta = ref<{
  total: number;
  perPage: number;
  currentPage: number;
  lastPage: number;
  hasNext: boolean;
  hasPrev: boolean;
}>({
  total: 0,
  perPage: 10,
  currentPage: 1,
  lastPage: 1,
  hasNext: false,
  hasPrev: false
})

// Computed property to show page numbers around current page
const visiblePages = computed(() => {
  const maxPagesToShow = 7;
  const lastPage = paginationMeta.value.lastPage;
  const current = currentPage.value;

  let startPage = Math.max(1, current - Math.floor(maxPagesToShow / 2));
  const endPage = Math.min(lastPage, startPage + maxPagesToShow - 1);

  // Adjust start if end is at the boundary
  if (endPage - startPage + 1 < maxPagesToShow) {
    startPage = Math.max(1, endPage - maxPagesToShow + 1);
  }

  const pages = [];
  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }
  return pages;
})

const fetchActivityLogs = async (page: number = 1) => {
  try {
    const response = await activityLogService.get(undefined, { page });
    if (response.success && response.data) {
      activityLogs.value = response.data.data.map((log: ActivityLog) => ({
        id: log.id,
        userId: log.userId,
        username: log.username,
        action: log.action,
        details: log.details,
        createdAt: log.createdAt ? new Date(log.createdAt).toLocaleString() : 'N/A',
        actionId: log.actionId,
        actionType: log.actionType,
        status: log.status,
      }));

      // Update pagination metadata
      paginationMeta.value = {
        total: response.data.meta.total,
        perPage: response.data.meta.perPage,
        currentPage: response.data.meta.currentPage,
        lastPage: response.data.meta.lastPage,
        hasNext: response.data.meta.hasNext,
        hasPrev: response.data.meta.hasPrev
      };
      currentPage.value = page;

      // Scroll to top of page
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  } catch (error) {
    console.error('Error fetching activity logs:', error);
    $toast.error('Failed to load activity logs');
  }
}

const getStatusColor = (status: string | null) => {
  if (!status) return 'bg-gray-100 text-gray-800';
  if (status.toLowerCase() === 'success') return 'bg-green-100 text-green-800';
  if (status.toLowerCase() === 'failed') return 'bg-red-100 text-red-800';
  if (status.toLowerCase() === 'pending') return 'bg-yellow-100 text-yellow-800';
  return 'bg-gray-100 text-gray-800';
}

onMounted(() => {
  fetchActivityLogs();
})
</script>
