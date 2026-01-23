<template>
  <div class="lesson-container">
    <!-- Header Section -->
    <div class="lesson-header">
      <div class="header-content">
        <button class="back-btn" @click="goBack">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M19 12H5M12 19l-7-7 7-7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </button>
        <div class="header-info">
          <h1 class="page-title">{{ courseTitle }} Lessons</h1>
          <p class="page-subtitle">View and manage course lessons with comprehensive content</p>
        </div>
        <div class="header-actions">
          <span v-if="savedIndicator" class="saved-status">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
            </svg>
            Saved
          </span>
          <button class="add-lesson-btn" @click="openAddModal">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add Lesson
          </button>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="lessons-content">
      <!-- Lessons List -->
      <div class="lessons-list">
        <div v-if="lessons.length === 0" class="empty-state">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path
              d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z" />
          </svg>
          <h3>No lessons yet</h3>
          <p>Create your first lesson to get started</p>
          <button class="btn-primary" @click="openAddModal">Create First Lesson</button>
        </div>

        <div v-else class="lessons-grid" @dragover.prevent @drop="handleDrop">
          <div v-for="(lesson, index) in lessons" :key="lesson.lessonId || lesson.localId" class="lesson-item"
            draggable="true" @dragstart="handleDragStart($event, index)" @dragend="handleDragEnd" :data-index="index">
            <div class="lesson-card" :class="{
              'is-final': lesson.isFinalLesson,
            }">
              <!-- Card Header -->
              <div class="lesson-card-header">
                <div class="lesson-header-info">
                  <div class="lesson-badge" :class="lesson.isFinalLesson ? 'final' : 'regular'">
                    {{ lesson.isFinalLesson ? ' Final' : `Lesson ${index + 1}` }}
                  </div>
                  <h3 class="lesson-title">
                    {{ lesson.title || 'Untitled Lesson' }}
                  </h3>
                </div>
                <div class="lesson-display-order">
                  <label class="order-label">Order:</label>
                  <span class="order-display">{{ lesson.displayOrder }}</span>
                </div>
                <div class="lesson-card-actions">
                  <button class="icon-btn edit-btn" @click="openEditModal(lesson, $event)" title="Edit">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                  </button>
                  <button class="icon-btn duplicate-btn" @click="duplicateLesson(lesson, $event)"
                    title="Duplicate (Coming Soon)" disabled style="opacity: 0.5; cursor: not-allowed">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                    </svg>
                  </button>
                  <button class="icon-btn delete-btn" @click="deleteLesson(lesson, $event)" title="Delete"
                    :disabled="isDeleting">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <polyline points="3 6 5 6 21 6"></polyline>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                      <line x1="10" y1="11" x2="10" y2="17"></line>
                      <line x1="14" y1="11" x2="14" y2="17"></line>
                    </svg>
                  </button>
                </div>
              </div>

              <!-- Summary Preview - Always Read-Only -->
              <div class="lesson-preview">
                <p class="preview-description">{{ lesson.description || 'No description' }}</p>
                <div class="preview-stats">
                  <div class="stat-item">
                    <span class="stat-label">Status:</span>
                    <span class="stat-value">✅ Saved</span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-label">Date:</span>
                    <span class="stat-value">{{ formatDate(lesson.lessonDate) }}</span>
                  </div>
                </div>
                <div class="preview-meta">
                  <button v-if="lesson.videoUrl" class="meta-tag video" @click="previewVideo(lesson.videoUrl!, $event)">
                    Video
                  </button>
                  <button v-if="lesson.recordedVideoUrl" class="meta-tag recorded"
                    @click="previewVideo(lesson.recordedVideoUrl!, $event)">
                    Recorded
                  </button>
                  <button v-if="lesson.materialUrl" class="meta-tag material"
                    @click="previewMaterial(lesson.materialUrl!, $event)">
                    Material
                  </button>
                  <span v-if="lesson.writeupContent" class="meta-tag writeup">📝 Write-up</span>
                  <button v-if="lesson.assignmentUrl" class="meta-tag assignment"
                    @click="previewAssignment(lesson.assignmentUrl!, $event)">
                    Assignment
                  </button>
                  <button class="meta-tag quiz" @click="openQuizBuilder(lesson, $event)">
                    {{ lesson.hasQuiz ? 'Quiz' : 'Create Quiz' }}
                  </button>
                  <button v-if="lesson.certificateUrl && lesson.isFinalLesson" class="meta-tag certificate"
                    @click="previewCertificate(lesson.certificateUrl!, $event)">
                    Certificate
                  </button>
                  <span v-if="lesson.isFinalLesson" class="meta-tag final-badge">Final Lesson</span>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Video Player Overlay -->
    <Teleport to="body">
      <div v-if="videoPlayerOpen" class="video-overlay" @click="closeVideoPlayer">
        <div class="video-modal" @click.stop>
          <button class="video-close-btn" @click="closeVideoPlayer">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
          <div class="video-container">
            <!-- YouTube embed -->
            <iframe v-if="currentVideoType === 'youtube'" :src="currentVideoUrl" frameborder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowfullscreen></iframe>
            <!-- Regular video -->
            <video v-else :src="currentVideoUrl" controls autoplay></video>
          </div>
        </div>
      </div>
    </Teleport>

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useToast } from 'vue-toast-notification'
import type { Lesson } from '@/api/models/lesson'
import { useLesson } from '@/composables/useLesson'

const route = useRoute()
const router = useRouter()
const toast = useToast()
const isDeleting = ref(false)

function formatCourseSlug(slug: string) {
  if (!slug) return 'Course'
  const spaced = slug.replace(/-/g, ' ')
  return spaced.charAt(0).toUpperCase() + spaced.slice(1)
}

const courseSlug = computed(() => route.params.courseSlug as string)
const courseId = computed(() => {
  const fromQuery = Number(route.query.courseId)
  return Number.isFinite(fromQuery) ? fromQuery : 0
})
const programId = computed(() => {
  const fromQuery = Number(route.query.programId)
  return Number.isFinite(fromQuery) ? fromQuery : 0
})
const cohortId = computed(() => {
  const fromQuery = Number(route.query.cohortId)
  return Number.isFinite(fromQuery) ? fromQuery : 0
})
const courseTitle = ref((route.query.courseName as string) || formatCourseSlug(courseSlug.value))
const savedIndicator = ref(false)

const { lessons, fetchLessons, deleteLesson: deleteLessonApi } = useLesson()

const loadLessons = async () => {
  if (cohortId.value > 0) {
    try {
      await fetchLessons(cohortId.value)
    } catch (err) {
      console.error('Failed to load lessons:', err)
      toast.error('Failed to load lessons. Please refresh the page.', {
        position: 'top-right',
        duration: 5000,
      })
    }
  }
}

onMounted(async () => {
  // Extract course info from route if available
  if (courseSlug.value) {
    courseTitle.value = formatCourseSlug(courseSlug.value)
  }

  // Load lessons from server
  await loadLessons()
})

// Reload lessons when returning from form
router.afterEach(() => {
  if (route.name === 'Program Course Lessons') {
    loadLessons()
  }
})

// Navigation functions
const openAddModal = () => {
  router.push({
    path: '/dashboard/lesson-form',
    query: {
      programId: programId.value,
      cohortId: cohortId.value,
      courseId: courseId.value,
      displayOrder: lessons.value.length + 1,
    },
  })
}

const openEditModal = (lesson: Lesson, event: Event) => {
  event.stopPropagation()
  router.push({
    path: '/dashboard/lesson-form',
    query: {
      programId: programId.value,
      cohortId: cohortId.value,
      courseId: courseId.value,
    },
    state: {
      lesson: JSON.parse(JSON.stringify(lesson)),
      mode: 'edit',
    },
  })
}

let draggedIndex = -1

const handleDragStart = (event: DragEvent, index: number) => {
  draggedIndex = index
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/html', (event.target as HTMLElement).innerHTML)
  }
}

const handleDragEnd = () => {
  draggedIndex = -1
}

const handleDrop = (event: DragEvent) => {
  event.preventDefault()
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = 'move'
  }

  if (draggedIndex !== -1) {
    const allLessonItems = Array.from(document.querySelectorAll('.lesson-item'))
    let dropIndex = allLessonItems.length - 1

    for (let i = 0; i < allLessonItems.length; i++) {
      const item = allLessonItems[i] as HTMLElement
      const rect = item.getBoundingClientRect()
      if (event.clientY < rect.bottom) {
        dropIndex = i
        break
      }
    }

    if (draggedIndex !== dropIndex) {
      const draggedLesson = lessons.value[draggedIndex]
      if (draggedLesson) {
        lessons.value.splice(draggedIndex, 1)
        lessons.value.splice(dropIndex, 0, draggedLesson)
      }
    }
  }
}

const duplicateLesson = (lesson: Lesson, event: Event) => {
  event.stopPropagation()
  // TODO: Implement duplication functionality
  toast.info('Duplicate feature coming soon!', {
    position: 'top-right',
    duration: 2000,
  })
}

const deleteLesson = async (lesson: Lesson, event: Event) => {
  event.stopPropagation()

  if (!confirm('Are you sure you want to delete this lesson? This action cannot be undone.')) {
    return
  }

  // Don't delete temp lessons that haven't been saved yet
  if (String(lesson.lessonId).startsWith('temp-')) {
    const index = lessons.value.findIndex((l: Lesson) => l.lessonId === lesson.lessonId)
    if (index !== -1) {
      lessons.value.splice(index, 1)
    }
    toast.success('Lesson removed', {
      position: 'top-right',
      duration: 2000,
    })
    return
  }

  try {
    isDeleting.value = true
    toast.info('Deleting lesson...', {
      position: 'top-right',
      duration: 2000,
    })

    await deleteLessonApi(Number(lesson.lessonId))

    // Remove from local list
    const index = lessons.value.findIndex((l: Lesson) => l.lessonId === lesson.lessonId)
    if (index !== -1) {
      lessons.value.splice(index, 1)
    }

    toast.success('Lesson deleted successfully!', {
      position: 'top-right',
      duration: 3000,
    })
  } catch (err) {
    console.error('Error deleting lesson:', err)
    const errorMessage =
      err instanceof Error ? err.message : 'Failed to delete lesson. Please try again.'
    toast.error(errorMessage, {
      position: 'top-right',
      duration: 5000,
    })
  } finally {
    isDeleting.value = false
  }
}

// Preview functions
const previewMaterial = (materialUrl: string, event: Event) => {
  event.stopPropagation()
  if (materialUrl) {
    const assetsBaseUrl = import.meta.env.VITE_ASSETS_BASE_URL || ''
    const fullUrl = `${assetsBaseUrl}/${materialUrl}`
    window.open(fullUrl, '_blank')
  }
}

const previewAssignment = (assignmentUrl: string, event: Event) => {
  event.stopPropagation()
  if (assignmentUrl) {
    const assetsBaseUrl = import.meta.env.VITE_ASSETS_BASE_URL || ''
    const fullUrl = `${assetsBaseUrl}/${assignmentUrl}`
    window.open(fullUrl, '_blank')
  }
}

const previewCertificate = (certificateUrl: string, event: Event) => {
  event.stopPropagation()
  if (certificateUrl) {
    const assetsBaseUrl = import.meta.env.VITE_ASSETS_BASE_URL || ''
    const fullUrl = `${assetsBaseUrl}/${certificateUrl}`
    window.open(fullUrl, '_blank')
  }
}

// Video player state
const videoPlayerOpen = ref(false)
const currentVideoUrl = ref('')
const currentVideoType = ref<'youtube' | 'regular'>('regular')

const isYouTubeUrl = (url: string): boolean => {
  return url.includes('youtube.com') || url.includes('youtu.be')
}

const getYouTubeEmbedUrl = (url: string): string => {
  // Handle youtube.com/watch?v=VIDEO_ID
  const watchMatch = url.match(/[?&]v=([^&]+)/)
  if (watchMatch) {
    return `https://www.youtube.com/embed/${watchMatch[1]}`
  }
  // Handle youtu.be/VIDEO_ID
  const shortMatch = url.match(/youtu\.be\/([^?]+)/)
  if (shortMatch) {
    return `https://www.youtube.com/embed/${shortMatch[1]}`
  }
  // Already an embed URL
  if (url.includes('/embed/')) {
    return url
  }
  return url
}

const previewVideo = (videoUrl: string, event: Event) => {
  event.stopPropagation()
  if (!videoUrl) return

  if (isYouTubeUrl(videoUrl)) {
    currentVideoType.value = 'youtube'
    currentVideoUrl.value = getYouTubeEmbedUrl(videoUrl)
  } else {
    currentVideoType.value = 'regular'
    currentVideoUrl.value = videoUrl
  }
  videoPlayerOpen.value = true
}

const closeVideoPlayer = () => {
  videoPlayerOpen.value = false
  currentVideoUrl.value = ''
}

const openQuizBuilder = (lesson: Lesson, event: Event) => {
  event.stopPropagation()
  router.push({
    name: 'Lesson Quiz',
    query: {
      programId: programId.value,
      courseId: courseId.value,
      cohortId: cohortId.value,
      courseName: courseTitle.value,
      lessonId: lesson.lessonId,
      lessonTitle: lesson.title || 'Lesson Quiz',
      hasQuiz: lesson.hasQuiz ? '1' : '0',
    },
  })
}

const formatDate = (dateString: string): string => {
  if (!dateString) return 'Not set'
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const goBack = () => {
  router.back()
}
</script>

<style scoped lang="css">
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

* {
  font-family:
    'Inter',
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    sans-serif;
}

.lesson-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
}

/* Header */
.lesson-header {
  position: sticky;
  top: 0;
  z-index: 40;
  background: white;
  border-bottom: 1px solid #e5e7eb;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  backdrop-filter: blur(10px);
  background-color: rgba(255, 255, 255, 0.95);
}

.header-content {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 16px 24px;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
}

.back-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: #f3f4f6;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  color: #6b7280;
}

.back-btn:hover {
  background: white;
  border-color: #667eea;
  color: #667eea;
  transform: translateX(-2px);
}

.back-btn svg {
  width: 20px;
  height: 20px;
  stroke-width: 2;
}

.header-info {
  flex: 1;
}

.page-title {
  font-size: 24px;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 4px 0;
  letter-spacing: -0.5px;
}

.page-subtitle {
  font-size: 13px;
  color: #9ca3af;
  margin: 0;
  font-weight: 500;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.saving-status,
.saved-status {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 600;
  padding: 8px 12px;
  border-radius: 6px;
  white-space: nowrap;
}

.saving-status {
  color: #f59e0b;
  background: #fef3c7;
}

.saved-status {
  color: #10b981;
  background: #d1fae5;
}

.saved-status svg {
  width: 16px;
  height: 16px;
  fill: currentColor;
}

.spinner {
  width: 14px;
  height: 14px;
  border: 2px solid #fef3c7;
  border-top-color: #f59e0b;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.add-lesson-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.add-lesson-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(102, 126, 234, 0.4);
}

.add-lesson-btn:active {
  transform: translateY(0);
}

.add-lesson-btn svg {
  width: 18px;
  height: 18px;
  stroke-width: 2.5;
}

/* Main Content */
.lessons-content {
  flex: 1;
  padding: 32px 24px;
  max-width: 1000px;
  margin: 0 auto;
  width: 100%;
}

.lessons-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 40px;
  text-align: center;
  background: white;
  border-radius: 16px;
  border: 2px dashed #e5e7eb;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.empty-state svg {
  width: 80px;
  height: 80px;
  color: #d1d5db;
  margin-bottom: 24px;
  stroke-width: 1;
}

.empty-state h3 {
  font-size: 24px;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 8px 0;
}

.empty-state p {
  font-size: 14px;
  color: #6b7280;
  margin: 0 0 24px 0;
}

.btn-primary {
  padding: 12px 28px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(102, 126, 234, 0.4);
}

/* Lessons Grid */
.lessons-grid {
  display: flex;
  flex-direction: column;
  gap: 20px;
  position: relative;
}

.lesson-item {
  animation: slideInUp 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.lesson-item[draggable='true'] {
  cursor: move;
  user-select: none;
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Lesson Card */
.lesson-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border-left: 4px solid transparent;
}

.lesson-card.is-edited {
  border-left-color: #fbbf24;
  box-shadow: 0 4px 12px rgba(251, 191, 36, 0.15);
}

.lesson-card.is-final {
  border-left-color: #8b5cf6;
}

/* Card Header */
.lesson-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 2px solid #f3f4f6;
  transition: all 0.3s ease;
}

.lesson-header-info {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  min-width: 0;
}

.lesson-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  background: #f0f4ff;
  color: #667eea;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 700;
  white-space: nowrap;
  border: 1px solid #e0e7ff;
}

.lesson-badge.final {
  background: #f3e8ff;
  color: #8b5cf6;
  border-color: #ede9fe;
}

.lesson-title {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.lesson-display-order {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 12px;
}

.order-label {
  font-size: 12px;
  font-weight: 600;
  color: #6b7280;
  white-space: nowrap;
}

.order-input {
  width: 50px;
  padding: 6px 8px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  color: #1f2937;
  outline: none;
  transition: all 0.2s ease;
}

.order-input:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.lesson-card-actions {
  display: flex;
  gap: 8px;
  margin-left: 12px;
}

.icon-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background: #f3f4f6;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #6b7280;
  flex-shrink: 0;
}

.icon-btn:hover {
  background: white;
  transform: translateY(-1px);
}


.icon-btn.duplicate-btn:hover {
  color: #10b981;
  border-color: #10b981;
  background: #f0fdf4;
}

.icon-btn.delete-btn:hover {
  color: #ef4444;
  border-color: #ef4444;
  background: #fef2f2;
}

.icon-btn svg {
  width: 18px;
  height: 18px;
  stroke-width: 2;
}

/* Preview */
.lesson-preview {
  padding: 20px 24px;
  background: #f9fafb;
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

.preview-description {
  font-size: 14px;
  color: #374151;
  line-height: 1.6;
  margin: 0 0 12px 0;
}

.preview-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.meta-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  color: #6b7280;
  cursor: default;
  transition: all 0.2s ease;
}

/* Clickable meta-tags (buttons) */
button.meta-tag {
  cursor: pointer;
  border: 1px solid #e5e7eb;
}

button.meta-tag:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

button.meta-tag.video:hover {
  border-color: #f59e0b;
  box-shadow: 0 2px 8px rgba(251, 191, 36, 0.3);
}

button.meta-tag.material:hover {
  border-color: #3b82f6;
  box-shadow: 0 2px 8px rgba(96, 165, 250, 0.3);
}

button.meta-tag.quiz:hover {
  border-color: #ec4899;
  box-shadow: 0 2px 8px rgba(244, 114, 182, 0.3);
}

button.meta-tag.recorded:hover {
  border-color: #2563eb;
  box-shadow: 0 2px 8px rgba(147, 197, 253, 0.3);
}

button.meta-tag.assignment:hover {
  border-color: #f59e0b;
  box-shadow: 0 2px 8px rgba(254, 215, 170, 0.3);
}

button.meta-tag.certificate:hover {
  border-color: #7c3aed;
  box-shadow: 0 2px 8px rgba(167, 139, 250, 0.3);
}

.meta-tag.video {
  border-color: #fbbf24;
  color: #92400e;
  background: #fffbeb;
}

.meta-tag.material {
  border-color: #60a5fa;
  color: #1e40af;
  background: #eff6ff;
}

.meta-tag.quiz {
  border-color: #f472b6;
  color: #831843;
  background: #fce7f3;
}

.meta-tag.date {
  border-color: #86efac;
  color: #166534;
  background: #f0fdf4;
}

.meta-tag.recorded {
  border-color: #93c5fd;
  color: #1e3a8a;
  background: #eff6ff;
}

.meta-tag.writeup {
  border-color: #ddd6fe;
  color: #4c1d95;
  background: #faf5ff;
}

.meta-tag.assignment {
  border-color: #fed7aa;
  color: #92400e;
  background: #fffbeb;
}

.meta-tag.final-badge {
  border-color: #d8b4fe;
  color: #581c87;
  background: #faf5ff;
  font-weight: 600;
}

.meta-tag.certificate {
  border-color: #a78bfa;
  color: #5b21b6;
  background: #f5f3ff;
  font-weight: 600;
}

.preview-stats {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 12px;
  padding: 10px;
  background: #f0f4ff;
  border-radius: 6px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
}

.stat-label {
  font-weight: 600;
  color: #6b7280;
}

.stat-value {
  color: #374151;
  font-weight: 500;
}

/* Form Actions */
.form-actions-top {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  padding: 12px;
  background: #fef3c7;
  border-left: 4px solid #f59e0b;
  border-radius: 6px;
  animation: slideInDown 0.3s ease-out;
}

@keyframes slideInDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.btn-save,
.btn-discard {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border: none;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.btn-save {
  background: #10b981;
  color: white;
}

.btn-save:hover {
  background: #059669;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.btn-save svg {
  width: 16px;
  height: 16px;
  stroke-width: 2;
}

.btn-discard {
  background: #ef4444;
  color: white;
}

.btn-discard:hover {
  background: #dc2626;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
}

.btn-discard svg {
  width: 16px;
  height: 16px;
  stroke-width: 2;
}

/* Form */
.lesson-form {
  padding: 24px;
  animation: expandForm 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes expandForm {
  from {
    opacity: 0;
    transform: scaleY(0.95);
  }

  to {
    opacity: 1;
    transform: scaleY(1);
  }
}

.form-section {
  margin-bottom: 28px;
  padding-bottom: 24px;
  border-bottom: 1px solid #f3f4f6;
  animation: fadeInUp 0.4s cubic-bezier(0.4, 0, 0.2, 1) backwards;
}

.form-section:nth-child(1) {
  animation-delay: 0.05s;
}

.form-section:nth-child(2) {
  animation-delay: 0.1s;
}

.form-section:nth-child(3) {
  animation-delay: 0.15s;
}

.form-section:nth-child(4) {
  animation-delay: 0.2s;
}

.form-section:nth-child(n + 5) {
  animation-delay: 0.25s;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(12px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.section-title {
  font-size: 15px;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 16px 0;
  display: flex;
  align-items: center;
  gap: 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.form-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 16px;
  margin-bottom: 16px;
}

.form-row:last-child {
  margin-bottom: 0;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group.full {
  grid-column: 1 / -1;
}

.form-label {
  font-size: 13px;
  font-weight: 600;
  color: #374151;
  display: flex;
  align-items: center;
  gap: 4px;
}

.required {
  color: #ef4444;
  font-weight: 700;
}

.form-input,
.form-textarea {
  padding: 10px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  font-family: inherit;
  transition: all 0.2s ease;
  outline: none;
  background: white;
}

.form-input:focus,
.form-textarea:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  background: white;
}

.form-textarea {
  resize: vertical;
  min-height: 80px;
}

.form-hint {
  font-size: 12px;
  color: #9ca3af;
  margin: 4px 0 0 0;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  color: #374151;
  font-weight: 500;
  cursor: pointer;
  user-select: none;
}

.checkbox-label input {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: #667eea;
}

/* Rich Editor Wrapper */
.rich-editor-wrapper {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.2s ease;
}

.rich-editor-wrapper:focus-within {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

/* File Components */
.file-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 12px;
}

.file-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  background: #f0fdf4;
  border: 1px solid #86efac;
  border-radius: 6px;
  animation: slideInLeft 0.3s ease-out;
}

@keyframes slideInLeft {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }

  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.file-name {
  font-size: 13px;
  font-weight: 500;
  color: #166534;
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.btn-remove {
  padding: 4px 10px;
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  margin-left: 8px;
}

.btn-remove:hover {
  background: #dc2626;
  transform: scale(1.05);
}

/* Save Indicator */
.save-indicator {
  position: fixed;
  bottom: 24px;
  right: 24px;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  font-size: 13px;
  font-weight: 600;
  color: #374151;
  z-index: 1000;
  animation: slideInUp 0.3s ease-out;
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Read-Only View Styles */
.lesson-detail-view {
  padding: 24px;
  animation: expandForm 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.view-section {
  margin-bottom: 24px;
  padding-bottom: 20px;
  border-bottom: 1px solid #f3f4f6;
}

.view-section:last-child {
  border-bottom: none;
}

.view-row {
  margin-bottom: 16px;
}

.view-row:last-child {
  margin-bottom: 0;
}

.view-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.view-label {
  font-size: 12px;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.view-value {
  font-size: 14px;
  color: #374151;
  margin: 0;
  line-height: 1.6;
}

.view-html {
  font-size: 14px;
  color: #374151;
  line-height: 1.7;
  padding: 12px;
  background: #f9fafb;
  border-radius: 6px;
  border: 1px solid #e5e7eb;
}

.view-link {
  font-size: 14px;
  color: #667eea;
  text-decoration: none;
  word-break: break-all;
  transition: color 0.2s ease;
}

.view-link:hover {
  color: #764ba2;
  text-decoration: underline;
}

.view-file {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  background: #f0fdf4;
  border: 1px solid #86efac;
  border-radius: 6px;
  color: #166534;
  font-size: 13px;
  font-weight: 500;
}

.view-file svg {
  width: 18px;
  height: 18px;
  stroke-width: 2;
  flex-shrink: 0;
}

.view-file-preview {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.view-file-preview .view-file {
  flex: 1;
  min-width: 200px;
}

.btn-preview {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.btn-preview:hover {
  background: #5a67d8;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.btn-preview svg {
  width: 16px;
  height: 16px;
  stroke-width: 2;
}

.btn-preview.quiz {
  background: #f472b6;
}

.btn-preview.quiz:hover {
  background: #ec4899;
  box-shadow: 0 4px 12px rgba(244, 114, 182, 0.3);
}

.quiz-badge {
  background: #fef3c7;
  border-color: #fbbf24;
  color: #92400e;
}

.view-actions {
  display: flex;
  justify-content: center;
  padding-top: 20px;
  margin-top: 20px;
  border-top: 2px solid #f3f4f6;
}

.btn-edit-full {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.btn-edit-full:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(102, 126, 234, 0.4);
}

.btn-edit-full svg {
  width: 18px;
  height: 18px;
  stroke-width: 2;
}

.order-display {
  font-size: 14px;
  font-weight: 600;
  color: #667eea;
  padding: 6px 12px;
  background: #f0f4ff;
  border: 1px solid #e0e7ff;
  border-radius: 6px;
}

.icon-btn.edit-btn:hover {
  color: #667eea;
  border-color: #667eea;
  background: #f0f4ff;
}

/* Responsive */
@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
    padding: 12px 16px;
  }

  .header-info {
    width: 100%;
  }

  .page-title {
    font-size: 20px;
  }

  .header-actions {
    width: 100%;
    justify-content: space-between;
  }

  .lessons-content {
    padding: 16px;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .form-group.full {
    grid-column: 1;
  }

  .lesson-card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .lesson-header-info {
    width: 100%;
  }

  .lesson-card-actions {
    width: 100%;
    justify-content: flex-end;
    margin-left: 0;
  }
}

/* Video Player Overlay */
.video-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

.video-modal {
  position: relative;
  width: 90%;
  max-width: 1200px;
  background: #000;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    transform: translateY(40px);
    opacity: 0;
  }

  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.video-close-btn {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 40px;
  height: 40px;
  background: rgba(0, 0, 0, 0.7);
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 10;
  transition: all 0.2s ease;
  color: white;
}

.video-close-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.6);
  transform: rotate(90deg);
}

.video-close-btn svg {
  width: 20px;
  height: 20px;
  stroke-width: 2;
}

.video-container {
  position: relative;
  width: 100%;
  padding-bottom: 56.25%;
  /* 16:9 aspect ratio */
  background: #000;
}

.video-container iframe,
.video-container video {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border: none;
}

@media (max-width: 768px) {
  .video-modal {
    width: 95%;
    border-radius: 8px;
  }

  .video-close-btn {
    top: 8px;
    right: 8px;
    width: 36px;
    height: 36px;
  }
}
</style>
