<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between flex-wrap gap-3">
      <div class="flex items-center gap-3">
        <button @click="router.push('/dashboard/video-library')"
          class="h-10 w-10 inline-flex items-center justify-center rounded-lg border border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          aria-label="Back to courses">
          <i class="fas fa-arrow-left"></i>
        </button>
        <div>
          <p class="text-sm uppercase tracking-wide text-blue-600 dark:text-blue-400 font-semibold">Course</p>
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white leading-tight">{{ courseName }}</h1>
          <p class="text-gray-600 dark:text-gray-400">Manage uploaded videos for this course</p>
        </div>
      </div>

      <div class="flex items-center gap-3">
        <div class="hidden md:block text-sm text-gray-500 dark:text-gray-400">
          <span class="font-semibold text-gray-900 dark:text-white mr-1">{{ videos.length }}</span> videos uploaded
        </div>
        <button @click="openAddModal()"
          class="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium shadow-sm transition">
          <i class="fas fa-plus"></i>
          Add Video
        </button>
      </div>
    </div>

    <!-- Stats bar -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div
        class="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <div>
          <p class="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Published</p>
          <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ publishedCount }}</p>
        </div>
        <div
          class="w-10 h-10 rounded-lg bg-green-100 text-green-600 dark:bg-green-900/40 dark:text-green-300 flex items-center justify-center">
          <i class="fas fa-check"></i>
        </div>
      </div>
      <div
        class="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <div>
          <p class="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Draft</p>
          <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ draftCount }}</p>
        </div>
        <div
          class="w-10 h-10 rounded-lg bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-300 flex items-center justify-center">
          <i class="fas fa-pen"></i>
        </div>
      </div>
      <div
        class="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <div>
          <p class="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Archived</p>
          <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ archivedCount }}</p>
        </div>
        <div
          class="w-10 h-10 rounded-lg bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200 flex items-center justify-center">
          <i class="fas fa-box"></i>
        </div>
      </div>
    </div>

    <!-- Video list -->
    <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
      <div class="flex flex-wrap gap-3 items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div class="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <i class="fas fa-video text-blue-500"></i>
          <span>Uploaded videos ({{ videos.length }})</span>
        </div>
        <div class="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
          <div class="flex items-center gap-2">
            <span class="w-2.5 h-2.5 rounded-full bg-green-500"></span>
            Published
          </div>
          <div class="flex items-center gap-2">
            <span class="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
            Draft
          </div>
          <div class="flex items-center gap-2">
            <span class="w-2.5 h-2.5 rounded-full bg-gray-400"></span>
            Archived
          </div>
        </div>
      </div>

      <div v-if="videos.length === 0" class="p-8 text-center text-gray-600 dark:text-gray-400">
        <p>No videos uploaded yet. Click "Add Video" to start.</p>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 p-4">
        <div v-for="video in videos" :key="video.id"
          class="relative overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm hover:shadow-lg transition">
          <div class="flex gap-4 p-4">
            <div
              class="w-28 h-20 rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
              <img v-if="video.thumbnailUrl" :src="video.thumbnailUrl" alt="Thumbnail"
                class="w-full h-full object-cover" />
              <div v-else class="text-gray-500 dark:text-gray-300 text-sm">No thumbnail</div>
            </div>
            <div class="flex-1 min-w-0 space-y-1">
              <div class="flex items-center gap-2 text-xs font-semibold justify-between">
                <div class="flex items-center gap-2">
                  <span :class="statusBadgeClass(video.status)" class="px-2 py-0.5 rounded-full">
                    {{ video.status }}
                  </span>
                  <span class="text-gray-500 dark:text-gray-400">• {{ video.level }}</span>
                </div>
                <!-- Three Dot Menu -->
                <div class="relative menu-container">
                  <button @click="toggleMenu(video.id)" class="menu-button">
                    <i class="fas fa-ellipsis-v"></i>
                  </button>
                  <Transition name="dropdown">
                    <div v-if="activeMenu === video.id" class="menu-dropdown" @click.self="activeMenu = null">
                      <button @click="editVideo(video)" class="menu-item">
                        <i class="fas fa-edit text-sm"></i>
                        Edit
                      </button>
                      <button @click="toggleVideoStatus(video)" class="menu-item">
                        <i :class="video.status === 'Published' ? 'fas fa-archive' : 'fas fa-check'"
                          class="text-sm"></i>
                        {{ video.status === 'Published' ? 'Archive' : 'Publish' }}
                      </button>
                      <button @click="deleteVideo(video.id)" class="menu-item menu-item-danger">
                        <i class="fas fa-trash text-sm"></i>
                        Delete
                      </button>
                    </div>
                  </Transition>
                </div>
              </div>
              <h3 class="text-base font-semibold text-gray-900 dark:text-white truncate">{{ video.title }}</h3>
              <p class="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{{ video.description }}</p>
              <div class="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2">
                <i class="fas fa-layer-group"></i>
                <span>{{ video.syllabus }}</span>
                <span>•</span>
                <span>{{ video.topic }}</span>
              </div>
            </div>
          </div>
          <div class="px-4 pb-4 flex items-center justify-between text-sm text-blue-600 dark:text-blue-400">
            <a :href="video.videoUrl" target="_blank" rel="noopener"
              class="inline-flex items-center gap-1 hover:underline">
              <i class="fas fa-play-circle"></i>
              Watch
            </a>
          </div>
        </div>
      </div>
    </div>

    <!-- Add Video Modal - Teleported to body -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showAddModal" class="modal-overlay" @click.self="closeAddModal">
          <div class="modal-container">
            <div class="modal-header">
              <div>
                <p class="text-xs uppercase tracking-wide text-blue-600 dark:text-blue-400 font-semibold">Add Video</p>
                <h2 class="modal-title">New video for {{ courseName }}</h2>
                <p class="text-sm text-gray-600 dark:text-gray-400">Fill in the details below to upload or link a video.
                </p>
              </div>
              <button @click="closeAddModal" class="close-button">
                <i class="fas fa-times text-lg"></i>
              </button>
            </div>

            <div class="modal-body">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="form-group">
                  <label class="form-label">Title</label>
                  <input v-model="form.title" type="text" placeholder="Enter video title" class="form-input" />
                </div>
                <div class="form-group">
                  <label class="form-label">Video URL</label>
                  <input v-model="form.videoUrl" type="url" placeholder="https://..." class="form-input" />
                </div>
                <div class="md:col-span-2 form-group">
                  <label class="form-label">Description</label>
                  <textarea v-model="form.description" rows="3" placeholder="Brief description"
                    class="form-input"></textarea>
                </div>

                <div class="form-group">
                  <label class="form-label">Thumbnail URL</label>
                  <input v-model="form.thumbnailUrl" type="url" placeholder="https://..." class="form-input" />
                </div>
                <div class="form-group">
                  <label class="form-label">Or Upload Thumbnail</label>
                  <label
                    class="flex items-center gap-3 px-3 py-2 rounded-lg border border-dashed border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/60 text-sm text-gray-600 dark:text-gray-300 cursor-pointer hover:border-blue-500">
                    <i class="fas fa-upload"></i>
                    <span>{{ thumbnailFileName || 'Choose image file' }}</span>
                    <input type="file" accept="image/*" class="hidden" @change="onThumbnailSelected" />
                  </label>
                </div>

                <div class="form-group">
                  <label class="form-label">Level</label>
                  <select v-model="form.level" class="form-input">
                    <option value="" disabled>Select level</option>
                    <option v-for="level in levelOptions" :key="level" :value="level">{{ level }}</option>
                  </select>
                </div>

                <div class="form-group">
                  <label class="form-label">Syllabus</label>
                  <select v-model="form.syllabus" @change="onSyllabusChange" class="form-input">
                    <option value="" disabled>Select syllabus</option>
                    <option v-for="syllabus in syllabusOptions" :key="syllabus" :value="syllabus">{{ syllabus }}
                    </option>
                  </select>
                </div>

                <div class="form-group">
                  <label class="form-label">Topic</label>
                  <select v-model="form.topic" :disabled="topicOptions.length === 0" class="form-input">
                    <option value="" disabled>Select topic</option>
                    <option v-for="topic in topicOptions" :key="topic" :value="topic">{{ topic }}</option>
                  </select>
                </div>
              </div>
            </div>

            <div class="modal-footer">
              <button @click="closeAddModal" class="btn-secondary">
                Cancel
              </button>
              <button @click="form.status = 'Draft'; submitVideo()"
                :class="form.status === 'Draft' ? 'btn-status-active bg-amber-500 text-white border-amber-500' : 'btn-status-inactive'"
                class="px-4 py-2 rounded-lg text-sm font-medium border transition" type="button">
                <i class="fas fa-pen mr-2"></i>Save as Draft
              </button>
              <button @click="form.status = 'Published'; submitVideo()"
                :class="form.status === 'Published' ? 'btn-status-active bg-green-600 text-white border-green-600' : 'btn-status-inactive'"
                class="px-4 py-2 rounded-lg text-sm font-medium border transition" type="button">
                <i class="fas fa-check mr-2"></i>Publish Now
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useToast } from 'vue-toast-notification'

interface VideoItem {
  id: number
  title: string
  description: string
  videoUrl: string
  thumbnailUrl?: string
  level: string
  syllabus: string
  topic: string
  status: 'Published' | 'Draft' | 'Archived'
}

const router = useRouter()
const route = useRoute()
const $toast = useToast()

const courseName = computed(() => (route.query.name as string) || 'Selected Course')

const videos = ref<VideoItem[]>([])
const showAddModal = ref(false)
const thumbnailFileName = ref('')
const activeMenu = ref<number | null>(null)

const levelOptions = ['Beginner', 'Intermediate', 'Advanced']
const syllabusOptions = ['Core Curriculum', 'Elective', 'Exam Prep']
const topicsBySyllabus: Record<string, string[]> = {
  'Core Curriculum': ['Foundations', 'Key Concepts', 'Practice'],
  'Elective': ['Exploration', 'Case Studies', 'Projects'],
  'Exam Prep': ['Past Questions', 'Mock Tests', 'Tips']
}

const statusOptions: VideoItem['status'][] = ['Published', 'Draft', 'Archived']

const form = reactive({
  title: '',
  description: '',
  videoUrl: '',
  thumbnailUrl: '',
  level: '',
  syllabus: '',
  topic: '',
  status: 'Draft' as VideoItem['status']
})

const topicOptions = computed(() => {
  return form.syllabus ? (topicsBySyllabus[form.syllabus] || []) : []
})

const publishedCount = computed(() => videos.value.filter(v => v.status === 'Published').length)
const draftCount = computed(() => videos.value.filter(v => v.status === 'Draft').length)
const archivedCount = computed(() => videos.value.filter(v => v.status === 'Archived').length)

watch(() => form.syllabus, () => {
  if (!topicOptions.value.includes(form.topic)) {
    form.topic = ''
  }
})

const openAddModal = () => {
  resetForm()
  showAddModal.value = true
}

const closeAddModal = () => {
  showAddModal.value = false
}

const resetForm = () => {
  form.title = ''
  form.description = ''
  form.videoUrl = ''
  form.thumbnailUrl = ''
  form.level = ''
  form.syllabus = ''
  form.topic = ''
  form.status = 'Draft'
  thumbnailFileName.value = ''
}

const onThumbnailSelected = (event: Event) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (file) {
    thumbnailFileName.value = file.name
    form.thumbnailUrl = URL.createObjectURL(file)
  }
}

const validateForm = (): boolean => {
  if (!form.title.trim() || !form.videoUrl.trim()) {
    $toast.warning('Title and video URL are required')
    return false
  }

  if (!form.thumbnailUrl.trim() && !thumbnailFileName.value) {
    $toast.warning('Provide a thumbnail URL or upload a thumbnail')
    return false
  }

  if (!form.level || !form.syllabus || !form.topic) {
    $toast.warning('Select level, syllabus, and topic')
    return false
  }

  return true
}

const submitVideo = () => {
  if (!validateForm()) return

  const newVideo: VideoItem = {
    id: Date.now(),
    title: form.title,
    description: form.description,
    videoUrl: form.videoUrl,
    thumbnailUrl: form.thumbnailUrl,
    level: form.level,
    syllabus: form.syllabus,
    topic: form.topic,
    status: form.status
  }

  videos.value.unshift(newVideo)
  $toast.success('Video added to course')
  closeAddModal()
}

const statusBadgeClass = (status: VideoItem['status']) => {
  if (status === 'Published') return 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300'
  if (status === 'Draft') return 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'
  return 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200'
}

const toggleMenu = (videoId: number) => {
  activeMenu.value = activeMenu.value === videoId ? null : videoId
}

const editVideo = (video: VideoItem) => {
  form.title = video.title
  form.description = video.description
  form.videoUrl = video.videoUrl
  form.thumbnailUrl = video.thumbnailUrl || ''
  form.level = video.level
  form.syllabus = video.syllabus
  form.topic = video.topic
  form.status = video.status === 'Archived' ? 'Draft' : (video.status as 'Published' | 'Draft')
  activeMenu.value = null
  showAddModal.value = true
}

const toggleVideoStatus = (video: VideoItem) => {
  if (video.status === 'Published') {
    video.status = 'Archived'
    $toast.success('Video archived')
  } else if (video.status === 'Archived') {
    video.status = 'Published'
    $toast.success('Video published')
  } else {
    video.status = 'Published'
    $toast.success('Video published')
  }
  activeMenu.value = null
}

const deleteVideo = (videoId: number) => {
  const index = videos.value.findIndex(v => v.id === videoId)
  if (index > -1) {
    videos.value.splice(index, 1)
    $toast.success('Video deleted')
  }
  activeMenu.value = null
}

const onSyllabusChange = () => {
  if (!topicOptions.value.includes(form.topic)) {
    form.topic = ''
  }
}

onMounted(() => {
  // Placeholder seed data for UI illustration
  videos.value = [
    {
      id: 1,
      title: 'Introduction and Overview',
      description: 'Kick-off video covering objectives and structure.',
      videoUrl: 'https://example.com/video/intro',
      thumbnailUrl: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=600&q=80',
      level: 'Beginner',
      syllabus: 'Core Curriculum',
      topic: 'Foundations',
      status: 'Published'
    },
    {
      id: 2,
      title: 'Practice Session',
      description: 'Hands-on practice with guided examples.',
      videoUrl: 'https://example.com/video/practice',
      thumbnailUrl: 'https://images.unsplash.com/photo-1582719478248-54e9f2c12aa4?auto=format&fit=crop&w=600&q=80',
      level: 'Intermediate',
      syllabus: 'Exam Prep',
      topic: 'Mock Tests',
      status: 'Draft'
    }
  ]
})
</script>

<style scoped>
/* Modal Styles */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
  padding: 1rem;
}

.modal-container {
  background: white;
  border-radius: 1rem;
  max-width: 42rem;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

.dark .modal-container {
  background: #111827;
}

.modal-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.dark .modal-header {
  border-bottom-color: #374151;
}

.modal-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #111827;
  margin: 0.5rem 0 0 0;
}

.dark .modal-title {
  color: #f3f4f6;
}

.close-button {
  padding: 0.5rem;
  color: #6b7280;
  transition: color 0.2s;
  border: none;
  background: none;
  cursor: pointer;
  border-radius: 0.5rem;
}

.close-button:hover {
  background: #f3f4f6;
  color: #111827;
}

.dark .close-button:hover {
  background: #374151;
  color: #f3f4f6;
}

.modal-body {
  padding: 1.5rem;
}

.modal-footer {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
  padding: 1.5rem;
  border-top: 1px solid #e5e7eb;
}

.dark .modal-footer {
  border-top-color: #374151;
}

/* Form Styles */
.form-group {
  margin-bottom: 1.5rem;
}

.form-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.5rem;
}

.dark .form-label {
  color: #d1d5db;
}

.form-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  background: white;
  color: #111827;
  font-size: 0.875rem;
  transition: all 0.2s;
}

.dark .form-input {
  background: #374151;
  border-color: #4b5563;
  color: #f3f4f6;
}

.form-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Button Styles */
.btn-primary,
.btn-secondary {
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 500;
  font-size: 0.875rem;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary {
  background: #3b82f6;
  color: white;
}

.btn-primary:hover {
  background: #2563eb;
}

.btn-secondary {
  background: white;
  color: #6b7280;
  border: 1px solid #d1d5db;
}

.dark .btn-secondary {
  background: #374151;
  color: #d1d5db;
  border-color: #4b5563;
}

.btn-secondary:hover {
  background: #f3f4f6;
  color: #111827;
}

.dark .btn-secondary:hover {
  background: #4b5563;
  color: #f3f4f6;
}

/* Menu Styles */
.menu-container {
  position: relative;
}

.menu-button {
  padding: 0.25rem 0.5rem;
  color: #6b7280;
  background: none;
  border: none;
  cursor: pointer;
  border-radius: 0.375rem;
  transition: all 0.2s;
}

.dark .menu-button {
  color: #d1d5db;
}

.menu-button:hover {
  background: #f3f4f6;
  color: #111827;
}

.dark .menu-button:hover {
  background: #374151;
  color: #f3f4f6;
}

.menu-dropdown {
  position: absolute;
  right: 0;
  top: 100%;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  z-index: 40;
  min-width: 12rem;
  margin-top: 0.25rem;
}

.dark .menu-dropdown {
  background: #374151;
  border-color: #4b5563;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.3);
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.5rem 1rem;
  background: none;
  border: none;
  color: #374151;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;
}

.dark .menu-item {
  color: #d1d5db;
}

.menu-item:hover {
  background: #f3f4f6;
}

.dark .menu-item:hover {
  background: #4b5563;
}

.menu-item-danger {
  color: #dc2626;
}

.dark .menu-item-danger {
  color: #f87171;
}

.menu-item-danger:hover {
  background: #fee2e2;
}

.dark .menu-item-danger:hover {
  background: #7f1d1d;
}

/* Status Button Styles */
.btn-status-active {
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
}

.btn-status-inactive {
  border-color: #d1d5db;
  color: #6b7280;
}

.dark .btn-status-inactive {
  border-color: #4b5563;
  color: #d1d5db;
}

.btn-status-inactive:hover {
  background: #f3f4f6;
}

.dark .btn-status-inactive:hover {
  background: #4b5563;
}

/* Dropdown Transition */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.2s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

/* Modal Transition */
.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal-container,
.modal-leave-to .modal-container {
  transform: scale(0.95);
}
</style>
