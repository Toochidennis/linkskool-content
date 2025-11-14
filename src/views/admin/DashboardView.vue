<template>
  <div class="">
    <!-- Main Content -->
    <main :class="{ 'ml-64': sidebarOpen, 'ml-16': !sidebarOpen }"
      class="pt-16 transition-all duration-300 min-h-screen">
      <div class="p-6">
        <!-- Dashboard Tab -->
        <div v-if="activeTab === 'dashboard'">
          <div class="mb-8">
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">Dashboard Overview</h2>
            <p class="text-gray-600 dark:text-gray-400">Welcome to your content management hub</p>
          </div>
          <!-- Metrics Cards -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div v-for="metric in dashboardMetrics" :key="metric.title"
              class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm font-medium text-gray-600 dark:text-gray-400">{{ metric.title }}</p>
                  <p class="text-3xl font-bold text-gray-900 dark:text-white mt-2">{{ metric.value }}</p>
                  <div class="flex items-center mt-2">
                    <i :class="metric.trend === 'up' ? 'fas fa-arrow-up text-green-500' : 'fas fa-arrow-down text-red-500'"
                      class="text-xs mr-1"></i>
                    <span :class="metric.trend === 'up' ? 'text-green-600' : 'text-red-600'"
                      class="text-sm font-medium">{{ metric.change }}</span>
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
            <div class="p-6">
              <div v-for="activity in recentActivities" :key="activity.id"
                class="flex items-start space-x-4 mb-4 last:mb-0">
                <img :src="activity.avatar" alt="User" class="w-8 h-8 rounded-full object-cover">
                <div class="flex-1">
                  <p class="text-sm text-gray-900 dark:text-white">
                    <span class="font-medium">{{ activity.user }}</span>
                    {{ activity.action }}
                  </p>
                  <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">{{ activity.time }}</p>
                </div>
                <span :class="activity.statusColor" class="px-2 py-1 text-xs font-medium rounded-full">{{
                  activity.status }}</span>
              </div>
            </div>
          </div>
        </div>
        <!-- Content Management Tab -->
        <div v-if="activeTab === 'content'">

        </div>
        <!-- Program Setup Tab -->
        <div v-if="activeTab === 'programs'">

        </div>
        <!-- User Management Tab (Admin Only) -->
        <div v-if="activeTab === 'users' && currentUserRole === 'Admin'">

        </div>
        <!-- Activity Logs Tab (Admin Only) -->
        <div v-if="activeTab === 'logs' && currentUserRole === 'Admin'">

        </div>
        <!-- Settings Tab -->
        <div v-if="activeTab === 'settings'">

        </div>
      </div>
    </main>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue';

// State
const isDark = ref(false);
const sidebarOpen = ref(true);
const activeTab = ref('dashboard');
const currentUserRole = ref('Admin');

// Dashboard metrics
const dashboardMetrics = ref([
  {
    title: 'Total Users',
    value: '2,847',
    change: '+12%',
    trend: 'up',
    icon: 'fas fa-users',
    iconBg: 'bg-blue-500'
  },
  {
    title: 'Active Programs',
    value: '156',
    change: '+8%',
    trend: 'up',
    icon: 'fas fa-graduation-cap',
    iconBg: 'bg-green-500'
  },
  {
    title: 'Questions Uploaded',
    value: '12,543',
    change: '+24%',
    trend: 'up',
    icon: 'fas fa-question-circle',
    iconBg: 'bg-purple-500'
  },
  {
    title: 'Recent Activities',
    value: '89',
    change: '-3%',
    trend: 'down',
    icon: 'fas fa-chart-line',
    iconBg: 'bg-orange-500'
  }
]);

// Recent activities
const recentActivities = ref([
  {
    id: 1,
    user: 'Sarah Johnson',
    action: 'uploaded new question set for Mathematics Course',
    time: '2 minutes ago',
    status: 'Success',
    statusColor: 'bg-green-100 text-green-800',
    avatar: 'https://readdy.ai/api/search-image?query=professional%20woman%20business%20portrait%20headshot%20clean%20background%20modern%20corporate%20style&width=32&height=32&seq=activity-user-001&orientation=squarish'
  },
  {
    id: 2,
    user: 'Mike Chen',
    action: 'created new program structure for Computer Science',
    time: '15 minutes ago',
    status: 'Pending',
    statusColor: 'bg-yellow-100 text-yellow-800',
    avatar: 'https://readdy.ai/api/search-image?query=professional%20man%20business%20portrait%20headshot%20clean%20background%20modern%20corporate%20style&width=32&height=32&seq=activity-user-002&orientation=squarish'
  },
  {
    id: 3,
    user: 'Emma Davis',
    action: 'modified user permissions for teaching staff',
    time: '1 hour ago',
    status: 'Success',
    statusColor: 'bg-green-100 text-green-800',
    avatar: 'https://readdy.ai/api/search-image?query=professional%20woman%20business%20portrait%20headshot%20clean%20background%20modern%20corporate%20style&width=32&height=32&seq=activity-user-003&orientation=squarish'
  }
]);

// Initialize theme
onMounted(() => {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark') {
    isDark.value = true;
    document.documentElement.classList.add('dark');
  }
});
</script>
