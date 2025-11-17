<template>
  <div class="space-y-8">
    <div>
      <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">Courses</h2>
      <p class="text-gray-600 dark:text-gray-400">Manage educational courses and content</p>
    </div>

    <!-- Add Course Button -->
    <button
      class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors cursor-pointer">
      <i class="fas fa-plus mr-2"></i>
      Add New Course
    </button>

    <!-- Courses Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div v-for="course in courses" :key="course.id"
        class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow">
        <div class="h-32 bg-gradient-to-r" :class="course.gradient"></div>
        <div class="p-6">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">{{ course.name }}</h3>
          <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">{{ course.description }}</p>
          <div class="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-4">
            <span><i class="fas fa-book mr-1"></i>{{ course.lessons }} Lessons</span>
            <span><i class="fas fa-users mr-1"></i>{{ course.students }} Students</span>
          </div>
          <div class="flex gap-2">
            <button
              class="flex-1 px-3 py-2 bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-lg text-sm font-medium hover:bg-blue-100 dark:hover:bg-blue-800 transition-colors cursor-pointer">
              Edit
            </button>
            <button
              class="flex-1 px-3 py-2 bg-red-50 dark:bg-red-900 text-red-600 dark:text-red-400 rounded-lg text-sm font-medium hover:bg-red-100 dark:hover:bg-red-800 transition-colors cursor-pointer">
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const courses = ref([
  {
    id: 1,
    name: 'Introduction to Programming',
    description: 'Learn the basics of programming with Python',
    lessons: 24,
    students: 128,
    gradient: 'from-blue-400 to-blue-600'
  },
  {
    id: 2,
    name: 'Data Structures & Algorithms',
    description: 'Master fundamental data structures and algorithms',
    lessons: 32,
    students: 95,
    gradient: 'from-purple-400 to-purple-600'
  },
  {
    id: 3,
    name: 'Web Development Fundamentals',
    description: 'Build modern web applications with HTML, CSS, and JavaScript',
    lessons: 40,
    students: 156,
    gradient: 'from-green-400 to-green-600'
  },
  {
    id: 4,
    name: 'Database Management Systems',
    description: 'Learn to design and manage databases',
    lessons: 20,
    students: 87,
    gradient: 'from-orange-400 to-orange-600'
  }
])
</script>
