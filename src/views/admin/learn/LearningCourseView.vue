<template>
  <div class="program-course-library">
    <!-- Modern Header with Title, Description, Search & Filter -->
    <div class="header-section">
      <div class="header-left">
        <div>
          <h1 class="header-title">Create and manage learning courses</h1>
          <p class="header-subtitle"> </p>
        </div>
      </div>

      <div class="header-right">
        <!-- Search Bar -->
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

    <!-- Grid View -->
    <div v-else-if="filteredCoursesList.length > 0" class="courses-grid" @click="closeMenuOutside">
      <div
        v-for="course in filteredCoursesList"
        :key="course.id"
        class="course-card"
        @click.stop
      >
        <div class="course-image-container">
          <img :src="loadImage(course.imageUrl || '')" :alt="course.title" class="course-image" />
        </div>
        <div class="course-content">
          <div class="course-header-row">
            <h3 class="course-title">{{ course.title }}</h3>
            <!-- Three Dot Menu -->
            <div class="menu-container" @click.stop>
              <button @click.stop="toggleMenu(course.id)" class="menu-button">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z"
                  />
                </svg>
              </button>
              <Transition name="dropdown">
                <div v-if="activeMenu === course.id" class="menu-dropdown">
                  <button @click.stop="editCourse(course)" class="menu-item">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                    Edit
                  </button>
                  <button @click.stop="duplicateCourse(course)" class="menu-item">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    </svg>
                    Duplicate
                  </button>
                  <button
                    @click.stop="deleteCourse(course.id)"
                    class="menu-item menu-item-danger"
                    :disabled="deleteLoadingId === course.id"
                    :class="deleteLoadingId === course.id ? 'opacity-60 cursor-not-allowed' : ''"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M19 7l-.867 12.142A2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                    Delete
                  </button>
                </div>
              </Transition>
            </div>
          </div>
          <p v-if="course.slogan" class="course-slogan">{{ course.slogan }}</p>
          <p class="course-text">{{ course.description }}</p>
          <div class="course-meta">
            <span v-if="course.category" class="course-category">{{ course.category }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
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
        {{
          searchQuery
            ? 'No courses match your filters'
            : 'No courses yet. Click "Add Course" to create your first course.'
        }}
      </p>
    </div>

    <!-- Modal -->
    <Transition name="modal">
      <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
        <div class="modal-container">
          <div class="modal-header">
            <h3 class="modal-title">{{ editingCourseId ? 'Edit Course' : 'Add Course' }}</h3>
            <button @click="closeModal" class="close-button">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <div class="modal-body">
            <!-- Section: Basic Information -->
            <div class="section-header">
              <h4 class="section-title">Basic Information</h4>
            </div>

            <!-- Course Title -->
            <div class="form-group" :class="{ 'has-error': fieldErrors.title }">
              <label class="form-label">Course Title <span class="required">*</span></label>
              <input
                v-model="formData.title"
                type="text"
                required
                class="form-input"
                placeholder="e.g., Advanced Web Development"
                @blur="handleBlur('title')"
                @input="handleInput('title')"
              />
              <span v-if="fieldErrors.title" class="error-message">
                <i class="fas fa-exclamation-circle"></i> {{ fieldErrors.title }}
              </span>
            </div>

            <!-- Slogan -->
            <div class="form-group">
              <label class="form-label">Slogan/Tagline</label>
              <input
                v-model="formData.slogan"
                type="text"
                class="form-input"
                placeholder="e.g., Master modern web technologies"
              />
            </div>

            <!-- Description -->
            <div class="form-group" :class="{ 'has-error': fieldErrors.description }">
              <label class="form-label">Description <span class="required">*</span></label>
              <textarea
                v-model="formData.description"
                required
                rows="4"
                class="form-input"
                placeholder="Describe this course..."
                @blur="handleBlur('description')"
                @input="handleInput('description')"
              ></textarea>
              <span v-if="fieldErrors.description" class="error-message">
                <i class="fas fa-exclamation-circle"></i> {{ fieldErrors.description }}
              </span>
            </div>

            <!-- Course Image -->
            <div class="form-group">
              <label class="form-label">Course Image</label>
              <div
                class="upload-area"
                @click="triggerFileInput"
                @dragover.prevent
                @drop.prevent="handleDrop"
              >
                <input
                  ref="fileInput"
                  type="file"
                  accept="image/*"
                  @change="handleFileSelect"
                  class="hidden"
                />
                <svg class="upload-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
                <p class="upload-text">Click to upload or drag and drop</p>
                <p class="upload-hint">PNG, JPG up to 10MB</p>
              </div>

              <!-- Image Preview -->
              <div v-if="imagePreview" class="image-preview-single">
                <img :src="loadImage(imagePreview)" alt="Preview" class="preview-image-single" />
                <button type="button" @click="removeImage" class="remove-image-btn">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>

            <!-- Submit Buttons -->
            <div class="modal-footer">
              <button
                type="button"
                @click="closeModal"
                class="btn-secondary"
                :disabled="isSubmitting"
              >
                Cancel
              </button>
              <button
                type="button"
                @click="handleSubmit"
                :disabled="!isFormValid || isSubmitting"
                class="btn-primary"
                :class="{ 'opacity-50 cursor-not-allowed': !isFormValid || isSubmitting }"
              >
                {{ isSubmitting ? 'Saving...' : editingCourseId ? 'Update Course' : 'Create Course' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Floating Action Button (Add Course) -->
    <button @click="openModal" class="floating-action-button" title="Add new course">
      <svg class="fab-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2.5"
          d="M12 4v16m8-8H4"
        />
      </svg>
    </button>

    <!-- Delete Confirmation Modal -->
    <Transition name="modal">
      <div v-if="showDeleteConfirm" class="modal-overlay" @click.self="showDeleteConfirm = false">
        <div class="delete-confirm-modal">
          <div class="delete-icon-container">
            <svg class="delete-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h3 class="delete-title">Delete Course</h3>
          <p class="delete-message">
            Are you sure you want to delete this course? This action cannot be undone.
          </p>
          <div class="delete-actions">
            <button @click="showDeleteConfirm = false" class="delete-btn-cancel">Cancel</button>
            <button
              @click="confirmDelete"
              :disabled="deleteLoadingId !== null"
              :class="deleteLoadingId !== null ? 'opacity-50 cursor-not-allowed' : ''"
              class="delete-btn-danger"
            >
              {{ deleteLoadingId !== null ? 'Deleting...' : 'Delete' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useToast } from 'vue-toast-notification'
import { learningCourseService } from '@/api/services/serviceFactory'
import type { LearningCourse } from '@/api/models'

const toast = useToast()

const showModal = ref(false)
const showDeleteConfirm = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)
const imagePreview = ref<string>('')
const imageFile = ref<File | null>(null)
const originalImageFileName = ref<string>('')
const coursesList = ref<LearningCourse[]>([])
const activeMenu = ref<number | null>(null)
const editingCourseId = ref<number | null>(null)
const courseToDelete = ref<number | null>(null)
const isSubmitting = ref(false)
const isLoading = ref(false)
const deleteLoadingId = ref<number | null>(null)

// Filter states
const searchQuery = ref('')

const formData = ref({
  title: '',
  slogan: '',
  description: '',
})

const fieldErrors = ref<Record<string, string>>({})

const validateField = (fieldName: string): string => {
  switch (fieldName) {
    case 'title':
      return formData.value.title.trim() ? '' : 'Course title is required'
    case 'description':
      return formData.value.description.trim() ? '' : 'Description is required'
    default:
      return ''
  }
}

const clearFieldError = (fieldName: string) => {
  if (fieldErrors.value[fieldName]) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { [fieldName]: _, ...rest } = fieldErrors.value
    fieldErrors.value = rest
  }
}

const handleBlur = (fieldName: string) => {
  const error = validateField(fieldName)
  if (error) {
    fieldErrors.value[fieldName] = error
  } else {
    clearFieldError(fieldName)
  }
}

const handleInput = (fieldName: string) => {
  clearFieldError(fieldName)
}

const fetchCourses = async () => {
  isLoading.value = true
  try {
    // Fetch all learning courses
    const coursesResponse = await learningCourseService.get()
    coursesList.value = coursesResponse.data as LearningCourse[]
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

// Filtered courses based on search and filters
const filteredCoursesList = computed(() => {
  let filtered = [...coursesList.value]

  // Apply search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(
      (course) =>
        course.title?.toLowerCase().includes(query) ||
        course.slogan?.toLowerCase().includes(query) ||
        (course.description && course.description.toLowerCase().includes(query)),
    )
  }

  return filtered
})

onMounted(() => {
  fetchCourses()
})

const isFormValid = computed(() => {
  return (
    formData.value.title.trim() !== '' &&
    formData.value.description.trim() !== ''
  )
})

const openModal = () => {
  resetForm()
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  resetForm()
  fieldErrors.value = {}
}

const resetForm = () => {
  formData.value = {
    title: '',
    slogan: '',
    description: '',
  }
  imagePreview.value = ''
  imageFile.value = null
  originalImageFileName.value = ''
  editingCourseId.value = null
}

const triggerFileInput = () => {
  fileInput.value?.click()
}

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    addFile(target.files[0])
  }
}

const handleDrop = (event: DragEvent) => {
  const files = event.dataTransfer?.files
  if (files && files[0]) {
    addFile(files[0])
  }
}

const addFile = (file: File) => {
  if (file.type.startsWith('image/')) {
    imageFile.value = file
    const reader = new FileReader()
    reader.onload = (e) => {
      imagePreview.value = e.target?.result as string
    }
    reader.readAsDataURL(file)
  } else {
    toast.error('Please upload an image file')
  }
}

const removeImage = () => {
  imagePreview.value = ''
  imageFile.value = null
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

const handleSubmit = async () => {
  // Validate all fields
  const errors: Record<string, string> = {}
  const fieldsToValidate = ['title', 'description']

  fieldsToValidate.forEach((field) => {
    const error = validateField(field)
    if (error) errors[field] = error
  })

  fieldErrors.value = errors

  if (Object.keys(errors).length > 0) {
    const firstError = Object.values(errors)[0]
    toast.error(firstError || 'Please fix the errors before submitting')
    return
  }

  if (!isFormValid.value || isSubmitting.value) return

  isSubmitting.value = true

  try {
    // Get user data from localStorage
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    const authorName = user.username || ''
    const authorId = user.id || 0

    const payload = new FormData()
    payload.append('title', formData.value.title)
    payload.append('slogan', formData.value.slogan || '')
    payload.append('description', formData.value.description)
    payload.append('author_name', authorName)
    payload.append('author_id', authorId.toString())

    // Add image if provided
    if (imageFile.value) {
      payload.append('image', imageFile.value)
    }

    // Track if image was deleted for updates
    if (originalImageFileName.value && !imagePreview.value && editingCourseId.value) {
      payload.append('old_image_url', originalImageFileName.value)
    }

    if (editingCourseId.value !== null) {
      // Update existing course
      await learningCourseService.post(
        `${editingCourseId.value}`,
        payload as unknown as Record<string, unknown>,
      )
      toast.success('Course updated successfully')
    } else {
      // Create new course
      await learningCourseService.post(
        '',
        payload as unknown as Record<string, unknown>,
      )
      toast.success('Course created successfully')
    }

    await fetchCourses()
    closeModal()
  } catch (error: unknown) {
    console.error('Failed to submit course:', error)
    const message = error instanceof Error ? error.message : 'Failed to save course'
    toast.error(message)
  } finally {
    isSubmitting.value = false
  }
}

const toggleMenu = (courseId: number) => {
  activeMenu.value = activeMenu.value === courseId ? null : courseId
}

const closeMenuOutside = () => {
  activeMenu.value = null
}

const editCourse = (course: LearningCourse) => {
  editingCourseId.value = course.id

  formData.value = {
    title: course.title || '',
    slogan: course.slogan || '',
    description: course.description || '',
  }
  originalImageFileName.value = course.imageUrl || ''
  imagePreview.value = course.imageUrl || ''
  imageFile.value = null
  activeMenu.value = null
  showModal.value = true
}

const duplicateCourse = (course: LearningCourse) => {
  editingCourseId.value = null

  formData.value = {
    title: course.title ? course.title + ' (Copy)' : '(Copy)',
    slogan: course.slogan || '',
    description: course.description || '',
  }
  originalImageFileName.value = ''
  imagePreview.value = course.imageUrl || ''
  imageFile.value = null
  activeMenu.value = null
  showModal.value = true
}

const deleteCourse = (courseId: number) => {
  courseToDelete.value = courseId
  showDeleteConfirm.value = true
  activeMenu.value = null
}

const confirmDelete = async () => {
  if (courseToDelete.value === null || deleteLoadingId.value !== null) return

  deleteLoadingId.value = courseToDelete.value

  try {
    await learningCourseService.delete(`${courseToDelete.value}`)
    const index = coursesList.value.findIndex((c) => c.id === courseToDelete.value)
    if (index > -1) {
      coursesList.value.splice(index, 1)
    }
    toast.success('Course deleted successfully')
  } catch (error: unknown) {
    console.error('Failed to delete course:', error)
    const message = error instanceof Error ? error.message : 'Failed to delete course'
    toast.error(message)
  } finally {
    deleteLoadingId.value = null
    showDeleteConfirm.value = false
    courseToDelete.value = null
  }
}

</script>

<style scoped>
/* Main Container */
.program-course-library {
  min-height: 100vh;
  position: relative;
  padding-bottom: 2rem;
}

/* Header Section - Modern Design */
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

/* Search Container */
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

/* Courses Grid */
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

/* Floating Action Button */
.floating-action-button {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  width: 3.5rem;
  height: 3.5rem;
  background: linear-gradient(135deg, #4f46e5, #6366f1);
  color: white;
  border: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow:
    0 10px 30px rgba(79, 70, 229, 0.4),
    0 0 0 0 rgba(79, 70, 229, 0.2);
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  z-index: 40;
  animation: floatIn 0.5s ease-out 0.2s both;
}

@keyframes floatIn {
  from {
    opacity: 0;
    transform: scale(0.3) translateY(20px);
  }

  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.floating-action-button:hover {
  transform: scale(1.1) translateY(-4px);
  box-shadow:
    0 15px 40px rgba(79, 70, 229, 0.5),
    0 0 0 0 rgba(79, 70, 229, 0.2);
}

.floating-action-button:active {
  transform: scale(0.95);
}

.fab-icon {
  width: 1.5rem;
  height: 1.5rem;
  stroke-width: 2.5;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0.8;
  }
}

/* Course Card */
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

.course-meta {
  margin-top: auto;
  padding-top: 0.75rem;
  border-top: 1px solid var(--theme-border);
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.course-category {
  font-size: 0.75rem;
  color: #fff;
  font-weight: 600;
  background: #6366f1;
  padding: 0.25rem 0.5rem;
  border-radius: 0.375rem;
}

.course-age-rating {
  font-size: 0.75rem;
  color: #fff;
  font-weight: 600;
  background: #ef4444;
  padding: 0.25rem 0.5rem;
  border-radius: 0.375rem;
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
  animation: learn-spin 0.8s linear infinite;
}

/* Empty State */
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

@keyframes learn-spin {
  to {
    transform: rotate(360deg);
  }
}

/* Modal */
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
  background: var(--theme-surface);
  border-radius: 1rem;
  max-width: 46rem;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem;
  border-bottom: 1px solid var(--theme-border);
}

.modal-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #111827;
}

.close-button {
  padding: 0.5rem;
  color: var(--theme-text-subtle);
  transition: color 0.2s;
  border: none;
  background: none;
  cursor: pointer;
  border-radius: 0.5rem;
}

.close-button:hover {
  background: var(--theme-surface-muted);
  color: #111827;
}

.modal-body {
  padding: 1.5rem;
}

.modal-footer {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
  padding-top: 1.5rem;
  margin-top: 1.5rem;
  border-top: 1px solid var(--theme-border);
}

/* Section Headers */
.section-header {
  margin: 2rem 0 1rem 0;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #e5e7eb;
}

.section-header:first-child {
  margin-top: 0;
}

.section-title {
  font-size: 1rem;
  font-weight: 700;
  color: #111827;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* Form */
.form-group {
  margin-bottom: 1.5rem;
}

.form-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--theme-text-muted);
  margin-bottom: 0.5rem;
}

.required {
  color: #ef4444;
}

.form-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--theme-border-strong);
  border-radius: 0.5rem;
  font-size: 0.875rem;
  transition: all 0.2s;
}

/* Age Group Checkboxes */
.age-group-checkboxes {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  padding: 1rem;
  background: var(--theme-surface-soft);
  border: 1px solid var(--theme-border);
  border-radius: 0.5rem;
}

.checkbox-option {
  display: flex;
  align-items: center;
  cursor: pointer;
  user-select: none;
}

.checkbox-option input[type='checkbox'] {
  width: 1.25rem;
  height: 1.25rem;
  accent-color: #6366f1;
  cursor: pointer;
  margin-right: 0.75rem;
  flex-shrink: 0;
  border-radius: 0.375rem;
}

.checkbox-label {
  font-size: 0.875rem;
  color: var(--theme-text-muted);
  font-weight: 500;
}

.checkbox-option:hover .checkbox-label {
  color: #111827;
}

.form-input:focus {
  outline: none;
  border-color: #4f46e5;
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
}

/* Upload Area */
.upload-area {
  border: 2px dashed var(--theme-border-strong);
  border-radius: 0.75rem;
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
}

.upload-area:hover {
  border-color: #4f46e5;
  background: #fafafa;
}

.upload-icon {
  width: 3rem;
  height: 3rem;
  margin: 0 auto 1rem;
  color: var(--theme-text-subtle);
}

.upload-text {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--theme-text-muted);
  margin-bottom: 0.25rem;
}

.upload-hint {
  font-size: 0.75rem;
  color: var(--theme-text-subtle);
}

.hidden {
  display: none;
}

/* Image Preview */
.image-preview-single {
  position: relative;
  margin-top: 1rem;
  border-radius: 0.5rem;
  overflow: hidden;
  border: 2px solid var(--theme-border);
  max-width: 100%;
}

.preview-image-single {
  width: 100%;
  height: auto;
  display: block;
}

.remove-image-btn {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background: rgba(0, 0, 0, 0.75);
  color: white;
  border: none;
  border-radius: 9999px;
  padding: 0.5rem;
  cursor: pointer;
  transition: background 0.2s;
}

.remove-image-btn:hover {
  background: rgba(220, 38, 38, 0.9);
}

/* Buttons */
.btn-primary {
  padding: 0.625rem 1.5rem;
  background: #4f46e5;
  color: white;
  font-weight: 600;
  border-radius: 0.5rem;
  border: none;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-primary:hover {
  background: #4338ca;
}

.btn-secondary {
  padding: 0.625rem 1.5rem;
  background: var(--theme-surface);
  color: var(--theme-text-muted);
  font-weight: 600;
  border-radius: 0.5rem;
  border: 1px solid var(--theme-border-strong);
  cursor: pointer;
  transition: all 0.2s;
}

.btn-secondary:hover {
  background: var(--theme-surface-soft);
}

/* Menu Dropdown */
.menu-container {
  position: relative;
  overflow: visible;
}

.menu-button {
  padding: 0.25rem;
  background: transparent;
  border: none;
  color: var(--theme-text-subtle);
  cursor: pointer;
  border-radius: 0.375rem;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.menu-button:hover {
  background: var(--theme-surface-muted);
  color: #111827;
}

.menu-dropdown {
  position: absolute;
  right: 0;
  top: 100%;
  margin-top: 0.25rem;
  background: var(--theme-surface);
  border-radius: 0.5rem;
  box-shadow:
    0 10px 15px -3px rgba(0, 0, 0, 0.1),
    0 4px 6px -2px rgba(0, 0, 0, 0.05);
  border: 1px solid var(--theme-border);
  min-width: 10rem;
  z-index: 50;
  overflow: hidden;
}

.menu-item {
  width: 100%;
  padding: 0.625rem 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: var(--theme-surface);
  border: none;
  color: var(--theme-text-muted);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
  text-align: left;
}

.menu-item:hover {
  background: var(--theme-surface-soft);
}

.menu-item-danger {
  color: #ef4444;
}

.menu-item-danger:hover {
  background: #fef2f2;
}

/* Grid Utilities */
.grid {
  display: grid;
}

.grid-cols-2 {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.gap-4 {
  gap: 1rem;
}

.items-center {
  display: flex;
  align-items: center;
}

.gap-2 {
  gap: 0.5rem;
}

.inline-block {
  display: inline-block;
}

.flex {
  display: flex;
}

/* Dropdown Transitions */
.dropdown-enter-active,
.dropdown-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

/* Modal Transitions */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .modal-container,
.modal-leave-active .modal-container {
  transition: transform 0.3s ease;
}

.modal-enter-from .modal-container,
.modal-leave-to .modal-container {
  transform: scale(0.95);
}

/* Age Groups Styles */
.age-groups-list {
  display: flex;
  flex-direction: column;
  gap: 0.875rem;
  margin-bottom: 0.875rem;
}

.age-group-input {
  display: flex;
  align-items: flex-end;
  gap: 0.875rem;
}

.age-group-inputs {
  display: flex;
  align-items: flex-end;
  gap: 0.5rem;
  flex: 1;
}

.age-input-wrapper {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  flex: 1;
}

.age-input-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--theme-text-subtle);
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.age-input {
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--theme-border);
  border-radius: 0.375rem;
  font-size: 0.875rem;
}

.age-separator {
  color: #d1d5db;
  font-weight: 600;
  margin-bottom: 0.5rem;
  line-height: 1;
}

.remove-age-group-btn {
  padding: 0.5rem;
  background: #fee2e2;
  color: #dc2626;
  border: none;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: background 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.remove-age-group-btn:hover {
  background: #fca5a5;
}

.btn-add-age-group {
  padding: 0.625rem 1rem;
  background: var(--theme-surface-muted);
  color: #4f46e5;
  border: 1px dashed #d1d5db;
  border-radius: 0.375rem;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-add-age-group:hover {
  background: var(--theme-border);
  border-color: #4f46e5;
}

/* Delete Confirmation Modal Styles */
.delete-confirm-modal {
  background: var(--theme-surface);
  border-radius: 0.75rem;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  padding: 2rem;
  width: 90%;
  max-width: 28rem;
  text-align: center;
}

.delete-icon-container {
  display: flex;
  justify-content: center;
  margin-bottom: 1rem;
  color: #dc2626;
}

.delete-icon {
  width: 4rem;
  height: 4rem;
  stroke-width: 1.5;
}

.delete-title {
  font-size: 1.375rem;
  font-weight: 700;
  color: #111827;
  margin-bottom: 0.75rem;
}

.delete-message {
  font-size: 0.875rem;
  color: var(--theme-text-subtle);
  line-height: 1.5;
  margin-bottom: 1.5rem;
}

.delete-actions {
  display: flex;
  gap: 0.875rem;
  justify-content: center;
}

.delete-btn-cancel {
  padding: 0.625rem 1.5rem;
  background: var(--theme-surface-muted);
  color: var(--theme-text-muted);
  border: 1px solid var(--theme-border-strong);
  border-radius: 0.375rem;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: background 0.2s;
}

.delete-btn-cancel:hover {
  background: var(--theme-border);
}

.delete-btn-danger {
  padding: 0.625rem 1.5rem;
  background: #dc2626;
  color: white;
  border: none;
  border-radius: 0.375rem;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: background 0.2s;
}

.delete-btn-danger:hover:not(:disabled) {
  background: #b91c1c;
}

/* Smooth Transition Animations */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateX(-10px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateX(10px);
}

/* Error Styles */
.form-group.has-error .form-input,
.form-group.has-error textarea,
.form-group.has-error .age-group-checkboxes {
  border-color: #ef4444;
  background-color: #fef2f2;
}

.form-group.has-error .form-input:focus,
.form-group.has-error textarea:focus {
  border-color: #dc2626;
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}

.error-message {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  color: #dc2626;
  font-size: 0.875rem;
  margin-top: 0.5rem;
}

.error-message i {
  font-size: 0.875rem;
}
</style>
