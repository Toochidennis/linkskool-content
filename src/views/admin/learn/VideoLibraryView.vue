<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">Video Library</h2>
        <p class="text-gray-600 dark:text-gray-400">Browse courses and access video content</p>
      </div>
      <div class="relative">
        <i class="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm"></i>
        <input v-model="searchQuery" type="text" placeholder="Search courses..."
          class="pl-10 pr-4 py-2 w-64 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      <div v-for="n in 8" :key="n"
        class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 animate-pulse">
        <div class="w-12 h-12 bg-gray-300 dark:bg-gray-600 rounded-lg mb-4"></div>
        <div class="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4 mb-2"></div>
        <div class="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else-if="filteredCourses.length === 0"
      class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
      <div class="flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-700 mx-auto mb-4">
        <i class="fas fa-book text-gray-400 text-3xl"></i>
      </div>
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">No courses found</h3>
      <p class="text-gray-600 dark:text-gray-400">
        {{ searchQuery ? 'Try adjusting your search query' : 'Start by adding courses to the system' }}
      </p>
    </div>

    <!-- Course Cards Grid -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      <div v-for="course in filteredCourses" :key="course.id" @click="openCourse(course)"
        class="group bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg hover:border-blue-500 dark:hover:border-blue-500 transition-all duration-200 cursor-pointer">
        <!-- Course Icon -->
        <div class="flex items-center justify-between mb-4">
          <div :style="{ backgroundColor: getCourseColor(course.courseName) }"
            class="w-14 h-14 rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-200">
            <i :class="getCourseIcon(course.courseName)" class="text-white text-2xl"></i>
          </div>

          <!-- Video Count Badge -->
          <div
            class="bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-3 py-1.5 rounded-full flex items-center space-x-1.5 text-sm font-semibold">
            <i class="fas fa-video text-xs"></i>
            <span>{{ course.videoCount || 0 }}</span>
          </div>
        </div>

        <!-- Course Info -->
        <div class="space-y-2">
          <h3
            class="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1">
            {{ course.courseName }}
          </h3>
          <p class="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 min-h-[2.5rem]">
            {{ course.description || 'No description available' }}
          </p>
        </div>

        <!-- Course Footer -->
        <div class="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div class="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
            <i class="fas fa-clock"></i>
            <span>{{ getVideoDuration(course.videoCount ?? 0) }}</span>
          </div>
          <div
            class="text-blue-600 dark:text-blue-400 text-sm font-medium flex items-center space-x-1 group-hover:translate-x-1 transition-transform">
            <span>View</span>
            <i class="fas fa-arrow-right text-xs"></i>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toast-notification'
import type { Course } from '@/api/models'
import { videoLibraryService } from '@/api/services/serviceFactory'

const router = useRouter()
const $toast = useToast()
const courseList = ref<Course[]>([])
const isLoading = ref(false)
const searchQuery = ref('')

// Course icon mapping
const courseIcons: Record<string, string> = {
  mathematics: 'fas fa-calculator',
  math: 'fas fa-calculator',
  science: 'fas fa-flask',
  physics: 'fas fa-atom',
  chemistry: 'fas fa-vial',
  biology: 'fas fa-dna',
  english: 'fas fa-book-open',
  literature: 'fas fa-book',
  history: 'fas fa-landmark',
  geography: 'fas fa-globe',
  computer: 'fas fa-laptop-code',
  programming: 'fas fa-code',
  art: 'fas fa-palette',
  music: 'fas fa-music',
  economics: 'fas fa-chart-line',
  business: 'fas fa-briefcase',
  language: 'fas fa-language',
  default: 'fas fa-graduation-cap'
}

// Course color palette
const courseColors = [
  '#3B82F6', // Blue
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#F59E0B', // Amber
  '#10B981', // Green
  '#06B6D4', // Cyan
  '#EF4444', // Red
  '#F97316', // Orange
  '#6366F1', // Indigo
  '#14B8A6', // Teal
]

const getCourseIcon = (courseName: string): string => {
  const name = courseName.toLowerCase()
  for (const [key, icon] of Object.entries(courseIcons)) {
    if (name.includes(key)) {
      return icon
    }
  }
  return courseIcons.default || 'fas fa-graduation-cap'
}

const getCourseColor = (courseName: string): string => {
  const hash = courseName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  return courseColors[hash % courseColors.length]!
}

const getVideoDuration = (videoCount: number): string => {
  const avgDuration = 15 // Assume average video is 15 minutes
  const totalMinutes = (videoCount || 0) * avgDuration

  if (totalMinutes < 60) {
    return `${totalMinutes}min`
  }

  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`
}

const capitalize = (str: string): string => {
  if (!str) return ''
  return str
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

const filteredCourses = computed(() => {
  if (!searchQuery.value.trim()) {
    return courseList.value
  }

  const query = searchQuery.value.toLowerCase()
  return courseList.value.filter(course =>
    course.courseName.toLowerCase().includes(query) ||
    (course.description && course.description.toLowerCase().includes(query))
  )
})

const fetchCourses = async () => {
  isLoading.value = true
  try {
    const response = await videoLibraryService.get('courses')

    if (response && response.data && Array.isArray(response.data)) {
      courseList.value = response.data.map((courseData: any) => ({
        id: courseData.id,
        courseName: capitalize(courseData.courseName),
        description: courseData.description || '',
        videoCount: courseData.videoCount || 0
      }))
    }
  } catch (e) {
    console.error('Error fetching courses:', e)
    $toast.error('Failed to load courses')
  } finally {
    isLoading.value = false
  }
}

const openCourse = (course: Course) => {
  router.push({
    name: 'CourseVideos',
    params: { courseId: course.id },
    query: { name: course.courseName }
  })
}

onMounted(() => {
  fetchCourses()
})
</script>
