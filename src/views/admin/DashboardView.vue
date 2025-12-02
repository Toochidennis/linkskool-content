<template>
  <div class="space-y-8">
    <div>
      <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">Dashboard</h2>
      <p class="text-gray-600 dark:text-gray-400">Welcome to LinkSkool Content Management Hub</p>
    </div>

    <!-- Metrics Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div v-for="metric in dashboardMetrics" :key="metric.title"
        class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600 dark:text-gray-400">{{ metric.title }}</p>
            <p class="text-3xl font-bold text-gray-900 dark:text-white mt-2">{{ metric.value }}</p>
            <div class="flex items-center mt-2">
              <i :class="metric.trend === 'up' ? 'fas fa-arrow-up text-green-500' : 'fas fa-arrow-down text-red-500'
                " class="text-xs mr-1"></i>
              <span :class="metric.trend === 'up' ? 'text-green-600' : 'text-red-600'" class="text-sm font-medium">
                {{ metric.change }}
              </span>
            </div>
          </div>
          <div :class="metric.iconBg" class="w-12 h-12 rounded-lg flex items-center justify-center">
            <i :class="metric.icon" class="text-white text-lg"></i>
          </div>
        </div>
      </div>
    </div>

    <!-- Recent Activity Feed -->
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
      <div class="p-6 border-b border-gray-200 dark:border-gray-700">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Recent Activity</h3>
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
                Action
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Timestamp
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            <tr v-for="activity in recentActivities" :key="activity.id">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center space-x-2">
                  <div class="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                    :style="{ backgroundColor: getAvatarColor(activity.username) }">
                    {{ getInitials(activity.username) }}
                  </div>
                  <span class="text-sm font-medium text-gray-900 dark:text-white">{{ activity.username }}</span>
                </div>
              </td>
              <td class="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                {{ activity.details || activity.action }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                {{ activity.createdAt }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="activity.statusColor" class="px-2 py-1 text-xs font-medium rounded-full">
                  {{ activity.status }}
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
          <button @click="fetchRecentActivities(currentPage - 1)" :disabled="!paginationMeta.hasPrev"
            class="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
            Previous
          </button>
          <div class="flex items-center space-x-1">
            <button v-for="page in visiblePages" :key="page" @click="fetchRecentActivities(page)"
              :class="currentPage === page ? 'bg-blue-600 text-white' : 'border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'"
              class="px-2 py-1 rounded-lg text-sm font-medium transition-colors">
              {{ page }}
            </button>
          </div>
          <button @click="fetchRecentActivities(currentPage + 1)" :disabled="!paginationMeta.hasNext"
            class="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
            Next
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue'
import { dashboardService, activityLogService } from '@/api/services/serviceFactory'
import type { ActivityLog, DashboardMetric } from '@/api/models'
import { useToast } from 'vue-toast-notification'

const $toast = useToast()

// Dashboard metrics
const dashboardMetrics = ref<any[]>([])

const fetchMetrics = async () => {
  try {
    const response = await dashboardService.get()
    if (response && response.data) {
      const data: DashboardMetric = response.data
      dashboardMetrics.value = [
        {
          title: 'Total Users',
          value: data.totalUsers,
          trend: 'up',
          change: '10%',
          icon: 'fas fa-users',
          iconBg: 'bg-purple-500'
        },
        {
          title: 'Total Courses',
          value: data.totalCourses,
          trend: 'up',
          change: '5%',
          icon: 'fas fa-book',
          iconBg: 'bg-blue-500'
        },
        {
          title: 'Total Exams',
          value: data.totalExams,
          trend: 'up',
          change: '8%',
          icon: 'fas fa-file-alt',
          iconBg: 'bg-green-500'
        },
        {
          title: 'Total Programs',
          value: data.totalPrograms,
          trend: 'up',
          change: '2%',
          icon: 'fas fa-graduation-cap',
          iconBg: 'bg-yellow-500'
        }
      ]
    }
  } catch (error) {
    console.error('Error fetching dashboard metrics:', error)
  }
}

// Recent activities
const recentActivities = ref<(ActivityLog & { createdAt: string; statusColor: string })[]>([])
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

// Get initials from username
const getInitials = (username: string): string => {
  if (!username) return '?';
  const parts = username.split(' ');
  if (parts.length > 1) {
    return ((parts[0]?.[0] || '') + (parts[1]?.[0] || '')).toUpperCase();
  }
  return username.charAt(0).toUpperCase();
}

// Get consistent avatar color based on username
const getAvatarColor = (username: string): string => {
  const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2'];
  const hash = username.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length] || '#4ECDC4';
}

// Format date to human-readable format
const formatDateToWords = (dateString: string): string => {
  if (!dateString) return 'N/A';

  // Convert format "2025-11-27 10:51:39" to ISO format "2025-11-27T10:51:39"
  const isoDateString = dateString.replace(' ', 'T');
  const date = new Date(isoDateString);

  // Check if date is valid
  if (isNaN(date.getTime())) {
    return 'N/A';
  }

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) {
    return 'just now';
  } else if (diffMins < 60) {
    return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  } else if (diffHours < 24) {
    return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  } else if (diffDays < 7) {
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  } else {
    // Format as: Nov 27, 2025 at 10:51 AM
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }) + ' at ' + date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  }
}

const fetchRecentActivities = async (page: number = 1) => {
  try {
    const response = await activityLogService.get(undefined, { page });
    if (response.success && response.data) {
      recentActivities.value = response.data.data.map((log: ActivityLog) => ({
        ...log,
        createdAt: formatDateToWords(log.createdAt),
        statusColor: log.status === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
      }))

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
    console.error('Error fetching recent activities:', error)
    $toast.error('Failed to load activity logs');
  }
}

// Initialize theme
onMounted(() => {
  fetchMetrics()
  fetchRecentActivities()

  const savedTheme = localStorage.getItem('theme')
  if (savedTheme === 'dark') {
    document.documentElement.classList.add('dark')
  }
})
</script>
