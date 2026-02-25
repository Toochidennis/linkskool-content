<template>
  <div class="program-course-library">
    <div class="header-section">
      <div class="header-left">
        <div class="back-button" @click="goBack">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </div>
        <div>
          <h1 class="header-title">{{ programName }}</h1>
          <p class="header-subtitle">Courses for this program</p>
        </div>
      </div>

      <div class="header-right">
        <div class="search-container">
          <svg class="search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search courses..."
            class="search-input"
          />
        </div>
      </div>
    </div>

    <div v-if="isLoading" class="loading-state">
      <div class="loading-spinner"></div>
      <p>Loading courses...</p>
    </div>

    <div v-else-if="filteredCoursesList.length > 0" class="courses-grid">
      <div
        v-for="course in filteredCoursesList"
        :key="course.id"
        class="course-card"
        @click="navigateToCohorts(course)"
      >
        <div class="course-image-container">
          <img :src="loadImage(course.imageUrl || '')" :alt="course.title" class="course-image" />
        </div>
        <div class="course-content">
          <div class="course-header-row">
            <h3 class="course-title">{{ course.title }}</h3>
          </div>
          <p v-if="course.slogan" class="course-slogan">{{ course.slogan }}</p>
          <p class="course-text">{{ course.description || 'No description available.' }}</p>
        </div>
      </div>
    </div>

    <div v-else class="empty-state">
      <svg class="empty-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
        />
      </svg>
      <p class="empty-text">
        {{ searchQuery ? 'No courses match your search' : 'No courses found for this program.' }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useToast } from 'vue-toast-notification'
import { learningCourseService } from '@/api/services/serviceFactory'
import type { ProgramCourse } from '@/api/models'

const router = useRouter()
const route = useRoute()
const toast = useToast()

const coursesList = ref<ProgramCourse[]>([])
const searchQuery = ref('')
const isLoading = ref(false)

const programName = computed(() => (route.query.name as string) || 'Program Courses')
const programId = computed(() => parseInt(route.query.id as string, 10) || 0)

const fetchCourses = async () => {
  if (!programId.value) {
    toast.error('Program ID not found')
    return
  }

  isLoading.value = true
  try {
    const response = await learningCourseService.get(`program/${programId.value}`)
    coursesList.value = Array.isArray(response.data) ? response.data : []
  } catch (error: unknown) {
    console.error('Failed to fetch courses:', error)
    const message = error instanceof Error ? error.message : 'Failed to load courses'
    toast.error(message)
  } finally {
    isLoading.value = false
  }
}

const loadImage = (image: string) => {
  if (!image) return 'https://via.placeholder.com/1200x400?text=Course+Banner'
  if (image.startsWith('data:') || image.startsWith('http')) {
    return image
  }
  return import.meta.env.VITE_ASSETS_BASE_URL + '/' + image
}

const filteredCoursesList = computed(() => {
  let filtered = [...coursesList.value]

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(
      (course) =>
        course.title?.toLowerCase().includes(query) ||
        (course.slogan && course.slogan.toLowerCase().includes(query)) ||
        (course.description && course.description.toLowerCase().includes(query)),
    )
  }

  return filtered
})

const goBack = () => {
  router.back()
}

const navigateToCohorts = (course: ProgramCourse) => {
  router.push({
    name: 'Program Course Cohorts',
    params: {
      courseSlug: course.slug || course.id?.toString(),
    },
    query: {
      courseName: course.title,
      courseId: course.id,
      programId: programId.value,
    },
  })
}

onMounted(() => {
  fetchCourses()
})
</script>

<style scoped>
.program-course-library {
  min-height: 100vh;
  position: relative;
  padding-bottom: 2rem;
}

.header-section {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 2rem;
  margin-bottom: 3rem;
  padding: 0;
  background: transparent;
}

.header-left {
  flex: 1;
  display: flex;
  align-items: flex-start;
  gap: 1rem;
}

.back-button {
  padding: 0.5rem;
  background: var(--theme-surface);
  border: 1px solid var(--theme-border);
  border-radius: 0.5rem;
  color: var(--theme-text-subtle);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  margin-top: 0.25rem;
}

.back-button:hover {
  background: var(--theme-surface-soft);
  border-color: #4f46e5;
  color: #4f46e5;
}

.header-title {
  font-size: 2rem;
  font-weight: 800;
  color: #111827;
  margin: 0 0 0.5rem 0;
  letter-spacing: -0.02em;
}

.header-subtitle {
  font-size: 0.95rem;
  color: var(--theme-text-subtle);
  margin: 0;
  font-weight: 500;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-shrink: 0;
}

.search-container {
  position: relative;
  width: 100%;
  max-width: 24rem;
}

.search-icon {
  position: absolute;
  left: 0.875rem;
  top: 50%;
  transform: translateY(-50%);
  width: 1.25rem;
  height: 1.25rem;
  color: var(--theme-text-subtle);
  flex-shrink: 0;
  pointer-events: none;
}

.search-input {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.75rem;
  border: 1.5px solid var(--theme-border);
  background: var(--theme-surface);
  border-radius: 0.75rem;
  font-size: 0.875rem;
  color: #111827;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.search-input:hover {
  border-color: #d1d5db;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.search-input:focus {
  outline: none;
  border-color: #4f46e5;
  box-shadow:
    0 0 0 3px rgba(79, 70, 229, 0.1),
    0 4px 12px rgba(0, 0, 0, 0.08);
}

.courses-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1rem;
  animation: fadeInUp 0.5s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.course-card {
  background: var(--theme-surface);
  border-radius: 0.75rem;
  overflow: visible;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid var(--theme-border);
  display: flex;
  flex-direction: column;
  animation: cardFadeIn 0.4s ease-out;
  cursor: pointer;
}

@keyframes cardFadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.course-card:hover {
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.12);
  transform: translateY(-6px);
  border-color: #4f46e5;
}

.course-image-container {
  position: relative;
  width: 100%;
  height: 160px;
  overflow: hidden;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.course-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.course-content {
  padding: 1rem;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.course-header-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.5rem;
}

.course-title {
  font-size: 1.125rem;
  font-weight: 700;
  color: #111827;
  line-height: 1.3;
  flex: 1;
}

.course-slogan {
  font-size: 0.875rem;
  color: #6366f1;
  font-weight: 600;
  margin-bottom: 0.5rem;
  background: #eef2ff;
  padding: 0.25rem 0.5rem;
  border-radius: 0.375rem;
  width: fit-content;
}

.course-text {
  color: var(--theme-text-subtle);
  line-height: 1.5;
  margin-bottom: 0.75rem;
  font-size: 0.875rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  flex: 1;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 3rem 1.5rem;
  color: var(--theme-text-subtle);
}

.loading-spinner {
  width: 2rem;
  height: 2rem;
  border-radius: 999px;
  border: 3px solid #dbeafe;
  border-top-color: #2563eb;
  animation: program-course-spin 0.8s linear infinite;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
}

.empty-icon {
  width: 4rem;
  height: 4rem;
  color: #d1d5db;
  margin-bottom: 1rem;
}

.empty-text {
  color: var(--theme-text-subtle);
  font-size: 1rem;
}

@keyframes program-course-spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 768px) {
  .header-section {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .header-right {
    width: 100%;
  }

  .search-container {
    max-width: 100%;
  }
}
</style>
