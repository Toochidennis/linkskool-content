<template>
  <div class="program-library">
    <div v-if="!showModal">
      <!-- Modern Header with Title, Description, Search & Filter -->
    <div class="header-section">
      <div class="header-left">
        <h1 class="header-title">Programs</h1>
        <p class="header-subtitle">Manage and organize all your programs and courses</p>
      </div>

      <div class="header-right">
        <!-- Search Bar -->
        <div class="search-container">
          <svg class="search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input v-model="searchQuery" type="text" placeholder="Search programs..." class="search-input" />
        </div>

        <!-- Filter Button with Badge -->
        <button @click="showFilterModal = true" class="filter-button"
          :class="{ 'filter-active': activeFiltersCount > 0 }">
          <svg class="filter-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          <span v-if="activeFiltersCount > 0" class="filter-badge">{{ activeFiltersCount }}</span>
        </button>

        <!-- Clear Filters Button -->
        <Transition name="fade-slide">
          <button v-if="activeFiltersCount > 0" @click="clearAllFilters" class="clear-button">
            Clear
          </button>
        </Transition>
      </div>
    </div>

    <div v-if="programsLoading" class="loading-state">
      <div class="loading-spinner"></div>
      <p>Loading programs...</p>
    </div>

    <!-- Grid View -->
    <div v-else-if="filteredProgramsList.length > 0" class="programs-grid" @click="closeMenuOutside">
      <div v-for="program in filteredProgramsList" :key="program.id" class="program-card" @click="viewProgram(program)">
        <div class="program-image-container">
          <img :src="loadImage(program.imageUrl || '')" :alt="program.name" class="program-image" />
          <div class="program-status-badge" :class="getStatusClass(program.status)">
            {{ program.status }}
          </div>
        </div>
        <div class="program-content">
          <div class="program-header-row">
            <h3 class="program-title">{{ program.name }}</h3>
            <!-- Three Dot Menu -->
            <div class="menu-container" @click.stop>
              <button @click.stop="toggleMenu(program.id)" class="menu-button">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                </svg>
              </button>
              <Transition name="dropdown">
                <div v-if="activeMenu === program.id" class="menu-dropdown">
                  <button @click.stop="editProgram(program)" class="menu-item">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit
                  </button>
                  <button @click.stop="duplicateProgram(program)" class="menu-item">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Duplicate
                  </button>
                  <button @click.stop="togglePublishStatus(program.id)" class="menu-item"
                    :disabled="statusLoadingId === program.id"
                    :class="statusLoadingId === program.id ? 'opacity-60 cursor-not-allowed' : ''">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                    </svg>
                    {{ program.status === 'published' ? 'Archive' : 'Publish' }}
                  </button>
                  <button @click.stop="deleteProgram(program.id)" class="menu-item menu-item-danger"
                    :disabled="deleteLoadingId === program.id"
                    :class="deleteLoadingId === program.id ? 'opacity-60 cursor-not-allowed' : ''">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M19 7l-.867 12.142A2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Delete
                  </button>
                </div>
              </Transition>
            </div>
          </div>
          <p class="program-shortname">{{ program.shortname }}</p>
          <p v-if="program.sponsor" class="program-sponsor">{{ program.sponsor }}</p>
          <p class="program-text">{{ program.description }}</p>
          <div class="program-meta">
            <span class="program-date">📚 {{ getCourseCount(program) }}
              {{ getCourseCount(program) === 1 ? 'Course' : 'Courses' }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="empty-state">
      <svg class="empty-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
      <p class="empty-text">
        {{
          searchQuery || statusFilter || dateFilter
            ? 'No programs match your filters'
            : 'No programs yet. Click "Add Program" to create your first tech program.'
        }}
      </p>
    </div>

    <!-- Floating Action Button (Add Program) -->
    <button @click="openModal" class="floating-action-button" title="Add new program">
      <svg class="fab-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4" />
      </svg>
    </button>

    <!-- Filter Modal -->
    <Transition name="modal">
      <div v-if="showFilterModal" class="modal-overlay" @click.self="showFilterModal = false">
        <div class="filter-modal">
          <div class="filter-modal-header">
            <h3 class="filter-modal-title">Filter Programs</h3>
            <button @click="showFilterModal = false" class="filter-close-button">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div class="filter-modal-body">
            <!-- Filter by Status -->
            <div class="filter-section">
              <h4 class="filter-section-title">Status</h4>
              <div class="filter-options">
                <label class="filter-checkbox">
                  <input type="radio" v-model="statusFilter" value="" name="status" />
                  <span>All Status</span>
                </label>
                <label class="filter-checkbox">
                  <input type="radio" v-model="statusFilter" value="published" name="status" />
                  <span class="flex items-center gap-2">
                    <span class="inline-block w-2 h-2 bg-green-500 rounded-full"></span>
                    Published
                  </span>
                </label>
                <label class="filter-checkbox">
                  <input type="radio" v-model="statusFilter" value="draft" name="status" />
                  <span class="flex items-center gap-2">
                    <span class="inline-block w-2 h-2 bg-yellow-500 rounded-full"></span>
                    Draft
                  </span>
                </label>
                <label class="filter-checkbox">
                  <input type="radio" v-model="statusFilter" value="archived" name="status" />
                  <span class="flex items-center gap-2">
                    <span class="inline-block w-2 h-2 bg-gray-500 rounded-full"></span>
                    Archived
                  </span>
                </label>
              </div>
            </div>

            <!-- Filter by Date -->
            <div class="filter-section">
              <h4 class="filter-section-title">Date Created</h4>
              <div class="filter-options">
                <label class="filter-checkbox">
                  <input type="radio" v-model="dateFilter" value="" name="date" />
                  <span>All Dates</span>
                </label>
                <label class="filter-checkbox">
                  <input type="radio" v-model="dateFilter" value="today" name="date" />
                  <span>Today</span>
                </label>
                <label class="filter-checkbox">
                  <input type="radio" v-model="dateFilter" value="week" name="date" />
                  <span>This Week</span>
                </label>
                <label class="filter-checkbox">
                  <input type="radio" v-model="dateFilter" value="month" name="date" />
                  <span>This Month</span>
                </label>
              </div>
            </div>
          </div>

          <div class="filter-modal-footer">
            <button @click="showFilterModal = false" class="filter-btn-secondary">Done</button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Delete Confirmation Modal -->
    <Transition name="modal">
      <div v-if="showDeleteModal" class="modal-overlay" @click.self="showDeleteModal = false">
        <div class="delete-modal">
          <div class="delete-modal-header">
            <h3 class="delete-modal-title">Delete Program</h3>
          </div>
          <div class="delete-modal-body">
            <p class="delete-modal-text">Are you sure you want to delete this program?</p>
            <p class="delete-modal-hint">This action cannot be undone.</p>
          </div>
          <div class="delete-modal-footer">
            <button @click="showDeleteModal = false" class="delete-modal-btn delete-modal-cancel"
              :disabled="deleteLoadingId === programToDelete">
              Cancel
            </button>
            <button @click="confirmDelete" class="delete-modal-btn delete-modal-delete"
              :disabled="deleteLoadingId === programToDelete">
              {{ deleteLoadingId === programToDelete ? 'Deleting...' : 'Delete' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>

  <!-- Program Page -->
  <Transition name="page">
    <div v-if="showModal" class="program-page">
      <div class="page-panel">
        <div class="modal-header">
          <h3 class="modal-title">{{ editingProgramId ? 'Edit Program' : 'Add Program' }}</h3>
          <button @click="closeModal" class="close-button">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div class="modal-body">
          <!-- Section: Basic Information -->
          <div class="section-header">
            <h4 class="section-title">Basic Information</h4>
          </div>

          <!-- Program Title -->
          <div class="form-group" :class="{ 'has-error': fieldErrors.name }">
            <label class="form-label">Program Title <span class="required">*</span></label>
            <input v-model="formData.name" type="text" required class="form-input"
              placeholder="e.g., Kids Coding Bootcamp" @blur="handleBlur('name')" @input="handleInput('name')" />
            <span v-if="fieldErrors.name" class="error-message">
              <i class="fas fa-exclamation-circle"></i> {{ fieldErrors.name }}
            </span>
          </div>

          <!-- Slogan/Short Name -->
          <div class="form-group" :class="{ 'has-error': fieldErrors.shortname }">
            <label class="form-label">Slogan/Short Name <span class="required">*</span></label>
            <input v-model="formData.shortname" type="text" required class="form-input"
              placeholder="e.g., KCB, WebDev Pro" @blur="handleBlur('shortname')" @input="handleInput('shortname')" />
            <span v-if="fieldErrors.shortname" class="error-message">
              <i class="fas fa-exclamation-circle"></i> {{ fieldErrors.shortname }}
            </span>
          </div>

          <!-- Description/Purpose -->
          <div class="form-group" :class="{ 'has-error': fieldErrors.description }">
            <label class="form-label">Description/Purpose <span class="required">*</span></label>
            <textarea v-model="formData.description" required rows="4" class="form-input"
              placeholder="Describe what this program offers and its objectives..." @blur="handleBlur('description')"
              @input="handleInput('description')"></textarea>
            <span v-if="fieldErrors.description" class="error-message">
              <i class="fas fa-exclamation-circle"></i> {{ fieldErrors.description }}
            </span>
          </div>

          <!-- Sponsor/Host -->
          <div class="form-group">
            <label class="form-label">Sponsor/Host</label>
            <input v-model="formData.sponsor" type="text" class="form-input"
              placeholder="e.g., Digital Dreams Limited, Company Name" />
          </div>

          <!-- Program Start Date -->
          <div class="form-group">
            <label class="form-label">Program Start Date</label>
            <input v-model="formData.startDate" type="datetime-local" step="60" class="form-input" />
          </div>

          <div class="form-group">
            <label class="form-label">Video URL</label>
            <input
              v-model="formData.videoUrl"
              type="url"
              class="form-input"
              placeholder="https://example.com/program-video"
            />
          </div>

          <div class="form-group">
            <label class="form-label">Whatsapp Link</label>
            <input
              v-model="formData.whatsappGroupLink"
              type="url"
              class="form-input"
              placeholder="https://chat.whatsapp.com/..."
            />
          </div>

          <div class="form-group">
            <label class="form-label">Onboarding Steps</label>
            <div class="onboarding-steps">
              <div
                v-for="(step, index) in formData.onboardingSteps"
                :key="`onboarding-step-${index}`"
                class="onboarding-step-row"
                :class="{
                  'is-dragging': draggingOnboardingStepIndex === index,
                  'is-drop-target':
                    onboardingStepDropIndex === index && draggingOnboardingStepIndex !== index,
                }"
                draggable="true"
                @dragstart="handleOnboardingStepDragStart(index, $event)"
                @dragover.prevent="handleOnboardingStepDragOver(index)"
                @drop.prevent="handleOnboardingStepDrop(index)"
                @dragend="handleOnboardingStepDragEnd"
              >
                <button
                  type="button"
                  class="onboarding-step-handle"
                  aria-label="Drag to reorder onboarding step"
                  title="Drag to reorder"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path
                      d="M8 6h.01M8 12h.01M8 18h.01M16 6h.01M16 12h.01M16 18h.01"
                      stroke-width="2.5"
                      stroke-linecap="round"
                    />
                  </svg>
                </button>
                <div class="onboarding-step-index">{{ index + 1 }}</div>
                <textarea
                  v-model="formData.onboardingSteps[index]"
                  rows="3"
                  class="form-input onboarding-step-input"
                  :placeholder="`Step ${index + 1}`"
                ></textarea>
                <button
                  type="button"
                  class="onboarding-step-remove"
                  @click="removeOnboardingStep(index)"
                  :disabled="formData.onboardingSteps.length === 1"
                >
                  Remove
                </button>
              </div>
              <button type="button" class="onboarding-step-add" @click="addOnboardingStep">
                Add Step
              </button>
            </div>
          </div>

          <!-- Target Age Groups -->
          <div class="form-group" :class="{ 'has-error': fieldErrors.ageGroups }">
            <label class="form-label">Target Age Groups <span class="required">*</span></label>
            <div class="age-group-checkboxes">
              <label v-for="option in ageRangeOptions" :key="option.key" class="checkbox-option">
                <input type="checkbox" :value="option.key" v-model="selectedAgeRangeKeys" />
                <span class="checkbox-label">{{ option.label }}</span>
              </label>
            </div>
            <span v-if="fieldErrors.ageGroups" class="error-message">
              <i class="fas fa-exclamation-circle"></i> {{ fieldErrors.ageGroups }}
            </span>
          </div>

          <!-- Attach Courses -->
          <div class="form-group">
            <label class="form-label">Attach Courses</label>
            <input v-model="courseSearchQuery" type="text" class="form-input"
              placeholder="Search learning courses..." />
            <div class="course-chips">
              <span v-if="selectedCourses.length === 0" class="chip-empty">
                No courses attached yet
              </span>
              <button v-for="course in selectedCourses" :key="course.id" type="button"
                class="course-chip selected" @click="removeSelectedCourse(course.id)">
                <span class="chip-label">{{ getCourseLabel(course) }}</span>
                <span class="chip-remove">x</span>
              </button>
            </div>
            <div class="course-chip-list">
              <button v-for="course in availableCourses" :key="course.id" type="button" class="course-chip"
                @click="toggleCourseSelection(course.id)">
                {{ getCourseLabel(course) }}
              </button>
              <span v-if="learningCoursesLoading" class="chip-hint">Loading courses...</span>
              <span v-else-if="learningCourses.length === 0" class="chip-empty">
                No courses available
              </span>
              <span v-else-if="availableCourses.length === 0" class="chip-empty">
                No more courses to attach
              </span>
            </div>
          </div>

          <!-- Banner Image -->
          <div class="form-group" :class="{ 'has-error': fieldErrors.image }">
            <label class="form-label">Banner Image <span class="required">*</span></label>
            <div class="upload-area" @click="triggerFileInput" @dragover.prevent @drop.prevent="handleDrop">
              <input ref="fileInput" type="file" accept="image/*" @change="handleFileSelect" class="hidden" />
              <svg class="upload-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <p class="upload-text">Click to upload or drag and drop</p>
              <p class="upload-hint">PNG, JPG up to 2MB (Recommended: 1200x400px)</p>
            </div>

            <!-- Image Preview -->
            <div v-if="imagePreview" class="image-preview-single">
              <img :src="loadImage(imagePreview)" alt="Preview" class="preview-image-single" />
              <button type="button" @click="removeImage" class="remove-image-btn">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <span v-if="fieldErrors.image" class="error-message">
              <i class="fas fa-exclamation-circle"></i> {{ fieldErrors.image }}
            </span>
          </div>

          <!-- Submit Buttons -->
          <div class="modal-footer">
            <button type="button" @click="closeModal" class="btn-secondary" :disabled="isSubmitting">
              Cancel
            </button>
            <button type="button" @click="handleSubmit('draft')" :disabled="!isFormValid || isSubmitting"
              class="btn-draft" :class="{ 'opacity-50 cursor-not-allowed': !isFormValid || isSubmitting }">
              {{ isSubmitting ? 'Saving...' : 'Save as Draft' }}
            </button>
            <button type="button" @click="handleSubmit('published')" :disabled="!isFormValid || isSubmitting"
              class="btn-primary" :class="{ 'opacity-50 cursor-not-allowed': !isFormValid || isSubmitting }">
              {{ isSubmitting ? 'Publishing...' : 'Publish Now' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useToast } from 'vue-toast-notification'
import type { LearningCourse, Program } from '@/api/models'
import { learningCourseService, programService } from '@/api/services/serviceFactory'

const toast = useToast()
const router = useRouter()
const route = useRoute()

const showModal = ref(false)
const showDeleteModal = ref(false)
const showFilterModal = ref(false)
const programToDelete = ref<number | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)
const imagePreview = ref<string>('')
const imageFile = ref<File | null>(null)
const programsList = ref<Program[]>([])
const activeMenu = ref<number | null>(null)
const editingProgramId = ref<number | null>(null)
const isSubmitting = ref(false)
const originalImageFileName = ref('')
const statusLoadingId = ref<number | null>(null)
const deleteLoadingId = ref<number | null>(null)
const programsLoading = ref(false)
const learningCourses = ref<LearningCourse[]>([])
const learningCoursesLoading = ref(false)
const courseSearchQuery = ref('')
const selectedCourseIds = ref<number[]>([])
const draggingOnboardingStepIndex = ref<number | null>(null)
const onboardingStepDropIndex = ref<number | null>(null)
const maxImageBytes = 2 * 1024 * 1024

const ageRangeOptions = [
  { key: '5-8', label: '5-8 years', min: 5, max: 8 },
  { key: '8-12', label: '8-12 years', min: 8, max: 12 },
  { key: '12-16', label: '12-16 years', min: 12, max: 16 },
  { key: '16-18', label: '16-18 years', min: 16, max: 18 },
  { key: '18-plus', label: '18+ years', min: 18, max: null },
]

// Filter states
const searchQuery = ref('')
const dateFilter = ref('')
const statusFilter = ref('')

const formData = ref({
  name: '',
  shortname: '',
  description: '',
  sponsor: '',
  startDate: '',
  videoUrl: '',
  whatsappGroupLink: '',
  onboardingSteps: [''],
  ageGroups: [] as Array<{ key: string; label: string; min: number; max: number | null }>,
})

const unmappedAgeGroups = ref<
  Array<{ key: string; label: string; min: number; max: number | null }>
>([])

const fieldErrors = ref<Record<string, string>>({})

const validateField = (fieldName: string): string => {
  switch (fieldName) {
    case 'name':
      return formData.value.name.trim() ? '' : 'Program title is required'
    case 'shortname':
      return formData.value.shortname.trim() ? '' : 'Slogan/Short name is required'
    case 'description':
      return formData.value.description.trim() ? '' : 'Description/Purpose is required'
    case 'ageGroups':
      return formData.value.ageGroups.length > 0
        ? ''
        : 'At least one target age group is required'
    case 'image':
      if (editingProgramId.value && imagePreview.value) return ''
      return imageFile.value ? '' : 'Banner image is required'
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

const selectedAgeRangeKeys = computed({
  get: () => {
    const matchedKeys = formData.value.ageGroups
      .map((ag) => ag.key)
      .filter((key): key is string => Boolean(key))

    return matchedKeys
  },
  set: (newKeys: string[]) => {
    const uniqueKeys = Array.from(new Set(newKeys))
    const mappedSelections = uniqueKeys
      .map((key) => ageRangeOptions.find((opt) => opt.key === key))
      .filter((opt): opt is (typeof ageRangeOptions)[number] => Boolean(opt))
      .map((opt) => ({ ...opt }))

    formData.value.ageGroups = [...mappedSelections, ...unmappedAgeGroups.value]
    clearFieldError('ageGroups')
  },
})

const normalizeAgeGroup = (ageGroup: Record<string, unknown> | string) => {
  if (
    typeof ageGroup === 'object' &&
    ageGroup !== null &&
    'min' in ageGroup &&
    'max' in ageGroup &&
    'key' in ageGroup &&
    'label' in ageGroup
  ) {
    const min = Number((ageGroup as Record<string, unknown>).min)
    const rawMax = (ageGroup as Record<string, unknown>).max
    const max = rawMax === null || rawMax === undefined ? null : Number(rawMax)

    if (Number.isFinite(min) && (max === null || Number.isFinite(max))) {
      return {
        key: String((ageGroup as Record<string, unknown>).key),
        label: String((ageGroup as Record<string, unknown>).label),
        min,
        max: max === null ? null : Number(max),
      }
    }
  }

  if (typeof ageGroup === 'object' && ageGroup !== null && 'min' in ageGroup && 'max' in ageGroup) {
    const min = Number((ageGroup as Record<string, unknown>).min)
    const rawMax = (ageGroup as Record<string, unknown>).max
    const max = rawMax === null || rawMax === undefined ? null : Number(rawMax)

    if (Number.isFinite(min) && (max === null || Number.isFinite(max))) {
      const optionMatch = ageRangeOptions.find((opt) => opt.min === min && opt.max === max)
      if (optionMatch) return { ...optionMatch }
      return { key: `${min}-${max ?? 'plus'}`, label: `${min}-${max ?? 'plus'}`, min, max }
    }
  }

  if (typeof ageGroup === 'string') {
    const [minStr, maxStr] = ageGroup.split('-')
    const min = Number(minStr)
    const maxValue =
      maxStr === undefined || maxStr === '' || maxStr === 'null' ? null : Number(maxStr)

    if (Number.isFinite(min) && (maxValue === null || Number.isFinite(maxValue))) {
      const optionMatch = ageRangeOptions.find((opt) => opt.min === min && opt.max === maxValue)
      if (optionMatch) return { ...optionMatch }
      return {
        key: `${min}-${maxValue ?? 'plus'}`,
        label: `${min}-${maxValue ?? 'plus'}`,
        min,
        max: maxValue,
      }
    }
  }

  return null
}

const splitMappedAgeGroups = (ageGroups: Array<Record<string, unknown> | string>) => {
  const mapped: Array<{ key: string; label: string; min: number; max: number | null }> = []
  const unmapped: Array<{ key: string; label: string; min: number; max: number | null }> = []

  ageGroups.forEach((ag) => {
    const normalized = normalizeAgeGroup(ag)
    if (!normalized) return

    const optionMatch = ageRangeOptions.find(
      (opt) => opt.min === normalized.min && opt.max === normalized.max,
    )

    if (optionMatch) {
      mapped.push({ ...optionMatch })
    } else {
      unmapped.push(normalized)
    }
  })

  return { mapped, unmapped }
}

const resolveProgramAgeGroups = (prog: Program): Array<Record<string, unknown> | string> => {
  const programAny = prog as Program & {
    ageGroups?: Array<Record<string, unknown> | string>
    age_groups?: Array<Record<string, unknown> | string>
  }
  const candidate = programAny.ageGroups ?? programAny.age_groups
  return Array.isArray(candidate) ? candidate : []
}

const toDateTimeLocalValue = (value?: string) => {
  if (!value) return ''

  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) {
    return value.slice(0, 16)
  }

  const pad = (part: number) => String(part).padStart(2, '0')
  const year = parsed.getFullYear()
  const month = pad(parsed.getMonth() + 1)
  const day = pad(parsed.getDate())
  const hours = pad(parsed.getHours())
  const minutes = pad(parsed.getMinutes())

  return `${year}-${month}-${day}T${hours}:${minutes}`
}

const toServerDatetime = (value?: string) => {
  if (!value) return ''

  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) {
    return value
  }

  const pad = (part: number) => String(part).padStart(2, '0')
  const year = parsed.getFullYear()
  const month = pad(parsed.getMonth() + 1)
  const day = pad(parsed.getDate())
  const hours = pad(parsed.getHours())
  const minutes = pad(parsed.getMinutes())
  const seconds = pad(parsed.getSeconds())

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

const resolveProgramStartDate = (prog: Program): string => {
  const programAny = prog as Program & {
    startDate?: string
    start_date?: string
  }

  const rawStartDate = programAny.startDate ?? programAny.start_date
  return toDateTimeLocalValue(rawStartDate)
}

const resolveProgramVideoUrl = (prog: Program): string => {
  const programAny = prog as Program & {
    videUrl?: string
    videoUrl?: string
    video_url?: string
  }

  return programAny.videUrl ?? programAny.videoUrl ?? programAny.video_url ?? ''
}

const resolveProgramWhatsappGroupLink = (prog: Program): string => {
  const programAny = prog as Program & {
    whatsappGroupLink?: string
    whatsapp_group_link?: string
  }

  return programAny.whatsappGroupLink ?? programAny.whatsapp_group_link ?? ''
}

const stripHtml = (value: string) => value.replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').trim()

const normalizeOnboardingStep = (step: unknown): string | null => {
  if (typeof step === 'string') {
    const cleaned = stripHtml(step).trim()
    return cleaned || null
  }

  if (typeof step === 'object' && step !== null) {
    const stepRecord = step as Record<string, unknown>
    const candidate =
      stepRecord.description ??
      stepRecord.content ??
      stepRecord.title ??
      stepRecord.step ??
      stepRecord.text

    if (typeof candidate === 'string') {
      const cleaned = stripHtml(candidate).trim()
      return cleaned || null
    }
  }

  return null
}

const resolveProgramOnboardingSteps = (prog: Program): string[] => {
  const programAny = prog as Program & {
    onboardingSteps?: unknown
    onboarding_steps?: unknown
  }

  const rawValue = programAny.onboardingSteps ?? programAny.onboarding_steps

  if (Array.isArray(rawValue)) {
    const normalized = rawValue
      .map((step) => normalizeOnboardingStep(step))
      .filter((step): step is string => Boolean(step))
    return normalized.length ? normalized : ['']
  }

  if (typeof rawValue === 'string') {
    const listMatches = Array.from(rawValue.matchAll(/<li[^>]*>(.*?)<\/li>/gis))
      .map((match) => stripHtml(match[1] || '').trim())
      .filter(Boolean)

    if (listMatches.length) {
      return listMatches
    }

    const plainText = stripHtml(rawValue)
    if (!plainText) return ['']

    const splitLines = plainText
      .split(/\r?\n|•|(?=\d+\.)/g)
      .map((line) => line.replace(/^\d+\.\s*/, '').trim())
      .filter(Boolean)

    return splitLines.length ? splitLines : [plainText]
  }

  return ['']
}

const addOnboardingStep = () => {
  formData.value.onboardingSteps.push('')
}

const removeOnboardingStep = (index: number) => {
  if (formData.value.onboardingSteps.length === 1) {
    formData.value.onboardingSteps[0] = ''
    return
  }

  formData.value.onboardingSteps.splice(index, 1)
}

const handleOnboardingStepDragStart = (index: number, event: DragEvent) => {
  draggingOnboardingStepIndex.value = index
  onboardingStepDropIndex.value = index

  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/plain', String(index))
  }
}

const handleOnboardingStepDragOver = (index: number) => {
  onboardingStepDropIndex.value = index
}

const handleOnboardingStepDrop = (index: number) => {
  const sourceIndex = draggingOnboardingStepIndex.value
  if (sourceIndex === null || sourceIndex === index) {
    handleOnboardingStepDragEnd()
    return
  }

  const updatedSteps = [...formData.value.onboardingSteps]
  const [movedStep] = updatedSteps.splice(sourceIndex, 1)
  if (movedStep === undefined) {
    handleOnboardingStepDragEnd()
    return
  }

  updatedSteps.splice(index, 0, movedStep)
  formData.value.onboardingSteps = updatedSteps
  handleOnboardingStepDragEnd()
}

const handleOnboardingStepDragEnd = () => {
  draggingOnboardingStepIndex.value = null
  onboardingStepDropIndex.value = null
}

const resolveProgramCourseIds = (prog: Program): number[] => {
  const programAny = prog as Program & {
    courseIds?: Array<number | string>
    course_ids?: Array<number | string>
    courses?: Array<{ id?: number | string }>
  }

  const direct = programAny.courseIds ?? programAny.course_ids
  if (Array.isArray(direct)) {
    return direct
      .map((id) => Number(id))
      .filter((id) => Number.isFinite(id))
  }

  if (Array.isArray(programAny.courses)) {
    return programAny.courses
      .map((course) => Number(course.id))
      .filter((id) => Number.isFinite(id))
  }

  return []
}

const getCourseCount = (prog: Program): number => {
  if (Array.isArray(prog.courses)) {
    return prog.courses.length
  }
  if (typeof prog.courseCount === 'number') {
    return prog.courseCount
  }
  return 0
}

// Fetch programs from API
const fetchPrograms = async () => {
  programsLoading.value = true
  try {
    const response = await programService.get()
    if (response.data) {
      programsList.value = Array.isArray(response.data)
        ? response.data.map((program) => ({
            ...program,
            whatsappGroupLink: resolveProgramWhatsappGroupLink(program),
          }))
        : []
    }
    console.log('Loaded programs from backend')
  } catch (error: unknown) {
    console.error('Failed to fetch programs:', error)
    const message = error instanceof Error ? error.message : 'Failed to load programs'
    toast.error(message)
  } finally {
    programsLoading.value = false
  }
}

const fetchLearningCourses = async () => {
  learningCoursesLoading.value = true
  try {
    const response = await learningCourseService.get()
    learningCourses.value = Array.isArray(response.data) ? response.data : []
  } catch (error: unknown) {
    console.error('Failed to fetch learning courses:', error)
    const message = error instanceof Error ? error.message : 'Failed to load learning courses'
    toast.error(message)
  } finally {
    learningCoursesLoading.value = false
  }
}

const loadImage = (image: string) => {
  if (!image) return 'https://via.placeholder.com/1200x400?text=Program+Banner'
  if (image.startsWith('data:') || image.startsWith('http')) {
    return image
  }
  return import.meta.env.VITE_ASSETS_BASE_URL + '/' + image
}

// Filtered programs based on search and filters
const filteredProgramsList = computed(() => {
  let filtered = [...programsList.value]

  // Apply search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(
      (prog) =>
        prog.name.toLowerCase().includes(query) ||
        prog.shortname.toLowerCase().includes(query) ||
        (prog.description && prog.description.toLowerCase().includes(query)),
    )
  }

  // Apply status filter
  if (statusFilter.value) {
    filtered = filtered.filter((prog) => prog.status === statusFilter.value)
  }

  // Apply date filter
  if (dateFilter.value) {
    const now = new Date()
    filtered = filtered.filter((prog) => {
      if (!prog.createdAt) return false
      const progDate = new Date(prog.createdAt)
      switch (dateFilter.value) {
        case 'today':
          return progDate.toDateString() === now.toDateString()
        case 'week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          return progDate >= weekAgo
        case 'month':
          return (
            progDate.getMonth() === now.getMonth() && progDate.getFullYear() === now.getFullYear()
          )
        default:
          return true
      }
    })
  }

  return filtered
})

const filteredLearningCourses = computed(() => {
  const query = courseSearchQuery.value.trim().toLowerCase()
  if (!query) {
    return [...learningCourses.value]
  }

  return learningCourses.value.filter((course) => {
    const title = (course.title || course.courseName || '').toLowerCase()
    const slogan = (course.slogan || '').toLowerCase()
    const description = (course.description || '').toLowerCase()
    return title.includes(query) || slogan.includes(query) || description.includes(query)
  })
})

const selectedCourses = computed(() =>
  learningCourses.value.filter((course) => selectedCourseIds.value.includes(course.id)),
)

const availableCourses = computed(() =>
  filteredLearningCourses.value.filter((course) => !selectedCourseIds.value.includes(course.id)),
)

// Count active filters
const activeFiltersCount = computed(() => {
  let count = 0
  if (statusFilter.value) count++
  if (dateFilter.value) count++
  return count
})

// Load data on component mount
onMounted(() => {
  fetchPrograms()
  fetchLearningCourses()
})

const isFormValid = computed(() => {
  const basicValid =
    formData.value.name.trim() !== '' &&
    formData.value.shortname.trim() !== '' &&
    formData.value.description.trim() !== '' &&
    (imageFile.value !== null || (editingProgramId.value && imagePreview.value))

  const hasValidAgeGroups =
    formData.value.ageGroups.length > 0 &&
    formData.value.ageGroups.every(
      (ag) =>
        typeof ag.key === 'string' &&
        ag.key.length > 0 &&
        typeof ag.label === 'string' &&
        ag.label.length > 0 &&
        Number.isFinite(ag.min) &&
        ag.min >= 0 &&
        (ag.max === null || (Number.isFinite(ag.max) && ag.max >= ag.min)),
    )

  return basicValid && hasValidAgeGroups
})

const openModal = () => {
  resetForm()
  if (learningCourses.value.length === 0 && !learningCoursesLoading.value) {
    fetchLearningCourses()
  }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  resetForm()
  fieldErrors.value = {}
  if (route.query.editProgramId) {
    const nextQuery = { ...route.query }
    delete nextQuery.editProgramId
    router.replace({
      name: 'Programs',
      query: nextQuery,
    })
  }
}

const resetForm = () => {
  formData.value = {
    name: '',
    shortname: '',
    description: '',
    sponsor: '',
    startDate: '',
    videoUrl: '',
    whatsappGroupLink: '',
    onboardingSteps: [''],
    ageGroups: [],
  }
  unmappedAgeGroups.value = []
  imagePreview.value = ''
  imageFile.value = null
  editingProgramId.value = null
  originalImageFileName.value = ''
  selectedCourseIds.value = []
  courseSearchQuery.value = ''
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
    if (file.size > maxImageBytes) {
      toast.error('Image must be 2MB or less')
      return
    }
    imageFile.value = file
    const reader = new FileReader()
    reader.onload = (e) => {
      imagePreview.value = e.target?.result as string
    }
    reader.readAsDataURL(file)
    clearFieldError('image')
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
  if (!editingProgramId.value) {
    handleBlur('image')
  }
}

const getCourseLabel = (course: LearningCourse) =>
  course.title || course.courseName || 'Untitled Course'

const toggleCourseSelection = (courseId: number) => {
  const next = new Set(selectedCourseIds.value)
  if (next.has(courseId)) {
    next.delete(courseId)
  } else {
    next.add(courseId)
  }
  selectedCourseIds.value = Array.from(next)
}

const removeSelectedCourse = (courseId: number) => {
  selectedCourseIds.value = selectedCourseIds.value.filter((id) => id !== courseId)
}

const handleSubmit = async (status: 'published' | 'draft' | 'archived') => {
  // Validate all fields
  const errors: Record<string, string> = {}
  const fieldsToValidate = ['name', 'shortname', 'description', 'ageGroups', 'image']

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
    // Get current user from localStorage
    const userString = localStorage.getItem('user')
    if (!userString) {
      toast.error('User data not found. Please login again.')
      isSubmitting.value = false
      return
    }

    const user = JSON.parse(userString)
    const authorName = user.username || ''
    const authorId = user.id || 0

    if (!authorName || authorId === 0) {
      toast.error('Invalid user data. Please login again.')
      isSubmitting.value = false
      return
    }

    // Prepare FormData
    const payload = new FormData()
    payload.append('name', formData.value.name)
    payload.append('description', formData.value.description)
    payload.append('author_name', authorName)
    payload.append('author_id', authorId.toString())
    payload.append('shortname', formData.value.shortname)
    payload.append('status', status)
    if (formData.value.sponsor) {
      payload.append('sponsor', formData.value.sponsor)
    }
    if (formData.value.startDate) {
      payload.append('start_date', toServerDatetime(formData.value.startDate))
    }
    if (formData.value.videoUrl) {
      payload.append('video_url', formData.value.videoUrl)
    }
    if (formData.value.whatsappGroupLink) {
      payload.append('whatsapp_group_link', formData.value.whatsappGroupLink)
    }
    formData.value.onboardingSteps
      .map((step) => step.trim())
      .filter(Boolean)
      .forEach((step, index) => {
        payload.append(`onboarding_steps[${index}]`, step)
      })

    formData.value.ageGroups.forEach((ag, index) => {
      payload.append(`age_groups[${index}][key]`, ag.key)
      payload.append(`age_groups[${index}][label]`, ag.label)
      payload.append(`age_groups[${index}][min]`, String(ag.min))
      if (ag.max !== null) {
        payload.append(`age_groups[${index}][max]`, String(ag.max))
      }
    })

    selectedCourseIds.value.forEach((courseId, index) => {
      const course = learningCourses.value.find((item) => item.id === courseId)
      const title = course ? getCourseLabel(course) : ''
      payload.append(`courses[${index}][id]`, String(courseId))
      payload.append(`courses[${index}][title]`, title)
    })

    // Handle image updates
    if (editingProgramId.value !== null) {
      // When updating, check if the old image was deleted
      if (originalImageFileName.value && !imagePreview.value) {
        // Old image was deleted, send the old URL for backend to handle deletion
        payload.append('old_image_url', originalImageFileName.value)
      }
    }

    if (imageFile.value) {
      payload.append('image', imageFile.value)
    }

    if (editingProgramId.value !== null) {
      // Update existing program
      const response = await programService.post(editingProgramId.value.toString(), payload as any)
      if (response) {
        toast.success('Program updated successfully')
        await fetchPrograms()
        closeModal()
      }
    } else {
      // Create new program
      const response = await programService.post(undefined, payload as any)
      if (response) {
        toast.success('Program created successfully')
        await fetchPrograms()
        closeModal()
      }
    }
  } catch (error: unknown) {
    console.error('Failed to submit program:', error)
    const message = error instanceof Error ? error.message : 'Failed to save program'
    toast.error(message)
  } finally {
    isSubmitting.value = false
  }
}

const toggleMenu = (programId: number) => {
  activeMenu.value = activeMenu.value === programId ? null : programId
}

const closeMenuOutside = () => {
  activeMenu.value = null
}

const editProgram = (prog: Program) => {
  editingProgramId.value = prog.id
  const { mapped, unmapped } = splitMappedAgeGroups(resolveProgramAgeGroups(prog))
  const courseIds = resolveProgramCourseIds(prog)
  formData.value = {
    name: prog.name,
    shortname: prog.shortname,
    description: prog.description || '',
    sponsor: prog.sponsor || '',
    startDate: resolveProgramStartDate(prog),
    videoUrl: resolveProgramVideoUrl(prog),
    whatsappGroupLink: resolveProgramWhatsappGroupLink(prog),
    onboardingSteps: resolveProgramOnboardingSteps(prog),
    ageGroups: [...mapped, ...unmapped],
  }
  unmappedAgeGroups.value = unmapped
  originalImageFileName.value = prog.imageUrl || ''
  imagePreview.value = prog.imageUrl || ''
  imageFile.value = null
  selectedCourseIds.value = courseIds
  courseSearchQuery.value = ''
  activeMenu.value = null
  showModal.value = true
}

watch(
  () => [route.query.editProgramId, programsLoading.value, programsList.value.length],
  () => {
    const requestedProgramId = Number(route.query.editProgramId)
    if (!requestedProgramId || programsLoading.value || showModal.value) return

    const program = programsList.value.find((item) => item.id === requestedProgramId)
    if (program) {
      editProgram(program)
    }
  },
  { immediate: true },
)

const duplicateProgram = (prog: Program) => {
  editingProgramId.value = null
  const { mapped, unmapped } = splitMappedAgeGroups(resolveProgramAgeGroups(prog))
  const courseIds = resolveProgramCourseIds(prog)
  formData.value = {
    name: prog.name + ' (Copy)',
    shortname: prog.shortname + ' Copy',
    description: prog.description || '',
    sponsor: prog.sponsor || '',
    startDate: resolveProgramStartDate(prog),
    videoUrl: resolveProgramVideoUrl(prog),
    whatsappGroupLink: resolveProgramWhatsappGroupLink(prog),
    onboardingSteps: resolveProgramOnboardingSteps(prog),
    ageGroups: [...mapped, ...unmapped],
  }
  unmappedAgeGroups.value = unmapped
  originalImageFileName.value = ''
  imagePreview.value = prog.imageUrl || ''
  imageFile.value = null
  selectedCourseIds.value = courseIds
  courseSearchQuery.value = ''
  activeMenu.value = null
  showModal.value = true
}

const togglePublishStatus = async (programId: number) => {
  if (statusLoadingId.value === programId) return
  statusLoadingId.value = programId

  try {
    const prog = programsList.value.find((p) => p.id === programId)
    if (prog) {
      let newStatus: 'draft' | 'published' | 'archived'

      if (prog.status === 'draft') {
        newStatus = 'published'
      } else if (prog.status === 'published') {
        newStatus = 'archived'
      } else {
        newStatus = 'published'
      }

      // Update via API
      await programService.put(`${programId.toString()}/status`, { status: newStatus })

      prog.status = newStatus
      toast.success(`Program ${newStatus} successfully`)
    }
  } catch (error: unknown) {
    console.error('Failed to update program status:', error)
    const message = error instanceof Error ? error.message : 'Failed to update program status'
    toast.error(message)
  } finally {
    activeMenu.value = null
    statusLoadingId.value = null
  }
}

const deleteProgram = (programId: number) => {
  programToDelete.value = programId
  showDeleteModal.value = true
  activeMenu.value = null
}

const confirmDelete = async () => {
  if (!programToDelete.value || deleteLoadingId.value === programToDelete.value) return
  deleteLoadingId.value = programToDelete.value

  try {
    await programService.delete(programToDelete.value.toString())
    programsList.value = programsList.value.filter((p) => p.id !== programToDelete.value)
    toast.success('Program deleted successfully')
    showDeleteModal.value = false
    programToDelete.value = null
  } catch (error: unknown) {
    console.error('Failed to delete program:', error)
    const message = error instanceof Error ? error.message : 'Failed to delete program'
    toast.error(message)
  } finally {
    deleteLoadingId.value = null
  }
}

const clearAllFilters = () => {
  searchQuery.value = ''
  dateFilter.value = ''
  statusFilter.value = ''
}

const getStatusClass = (status: string) => {
  switch (status) {
    case 'published':
      return 'status-published'
    case 'draft':
      return 'status-draft'
    case 'archived':
      return 'status-archived'
    default:
      return ''
  }
}

const viewProgram = (prog: Program) => {
  router.push({
    name: 'Program Courses',
    params: { slug: prog.slug },
    query: { name: prog.name, id: prog.id.toString() },
  })
}
</script>

<style scoped>
/* Main Container */
.program-library {
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

/* Filter Button */
.filter-button {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.75rem;
  height: 2.75rem;
  border: 1.5px solid var(--theme-border);
  background: var(--theme-surface);
  border-radius: 0.75rem;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.filter-button:hover {
  border-color: #d1d5db;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.filter-button.filter-active {
  border-color: #4f46e5;
  background: #f0f4ff;
  box-shadow:
    0 0 0 3px rgba(79, 70, 229, 0.1),
    0 4px 12px rgba(0, 0, 0, 0.08);
}

.filter-icon {
  width: 1.25rem;
  height: 1.25rem;
  color: var(--theme-text-subtle);
  stroke-width: 1.8;
}

.filter-active .filter-icon {
  color: #4f46e5;
}

.filter-badge {
  position: absolute;
  -top: -0.5rem;
  -right: -0.5rem;
  width: 1.375rem;
  height: 1.375rem;
  background: linear-gradient(135deg, #4f46e5, #6366f1);
  color: white;
  font-size: 0.625rem;
  font-weight: 700;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(79, 70, 229, 0.3);
}

/* Clear Button */
.clear-button {
  padding: 0.75rem 1.25rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--theme-text-subtle);
  background: transparent;
  border: 1.5px solid var(--theme-border);
  border-radius: 0.75rem;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.clear-button:hover {
  color: var(--theme-text-muted);
  border-color: #d1d5db;
  background: #fafafa;
}

/* Programs Grid */
.programs-grid {
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

/* Grid Layout */
.grid {
  display: grid;
}

/* Program Card */
.program-card {
  background: var(--theme-surface);
  border-radius: 0.75rem;
  overflow: hidden;
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

.program-card:hover {
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.12);
  transform: translateY(-6px);
  border-color: #4f46e5;
}

.program-image-container {
  position: relative;
  width: 100%;
  height: 160px;
  overflow: hidden;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.program-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.program-status-badge {
  position: absolute;
  top: 0.75rem;
  left: 0.75rem;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  backdrop-filter: blur(8px);
}

.status-published {
  background: rgba(16, 185, 129, 0.9);
  color: white;
}

.status-draft {
  background: rgba(251, 191, 36, 0.9);
  color: white;
}

.status-archived {
  background: rgba(107, 114, 128, 0.9);
  color: white;
}

.program-content {
  padding: 1rem;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.program-header-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.5rem;
}

.program-title {
  font-size: 1.125rem;
  font-weight: 700;
  color: #111827;
  line-height: 1.3;
  flex: 1;
}

.program-shortname {
  font-size: 0.875rem;
  color: #6366f1;
  font-weight: 600;
  margin-bottom: 0.5rem;
  background: #eef2ff;
  padding: 0.25rem 0.5rem;
  border-radius: 0.375rem;
  width: fit-content;
}

.program-sponsor {
  font-size: 0.8125rem;
  color: #7c3aed;
  font-weight: 600;
  margin-bottom: 0.75rem;
  background: #f3e8ff;
  padding: 0.25rem 0.5rem;
  border-radius: 0.375rem;
  width: fit-content;
}

.program-text {
  color: var(--theme-text-subtle);
  line-height: 1.5;
  margin-bottom: 0.75rem;
  font-size: 0.875rem;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  flex: 1;
}

.program-meta {
  margin-top: auto;
  padding-top: 0.75rem;
  border-top: 1px solid var(--theme-border);
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.program-date {
  font-size: 0.75rem;
  color: var(--theme-text-subtle);
  font-weight: 500;
}

.view-button {
  padding: 0.5rem 0.75rem;
  background: #4f46e5;
  color: white;
  border: none;
  border-radius: 0.375rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  margin-left: auto;
}

.view-button:hover {
  background: #4338ca;
  transform: translateX(2px);
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
  animation: program-lib-spin 0.8s linear infinite;
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

@keyframes program-lib-spin {
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

.program-page {
  width: 100%;
}

.page-panel {
  width: 100%;
  background: var(--theme-surface);
  border-radius: 1rem;
  box-shadow: 0 20px 40px rgba(15, 23, 42, 0.08);
  overflow: hidden;
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

.form-input:focus {
  outline: none;
  border-color: #4f46e5;
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
}

.onboarding-steps {
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
}

.onboarding-step-row {
  display: grid;
  grid-template-columns: auto auto minmax(0, 1fr) auto;
  gap: 0.75rem;
  align-items: flex-start;
  padding: 0.7rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.75rem;
  background: #fff;
  transition: border-color 0.2s, box-shadow 0.2s, opacity 0.2s;
}

.onboarding-step-row.is-dragging {
  opacity: 0.55;
}

.onboarding-step-row.is-drop-target {
  border-color: #4f46e5;
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.12);
}

.onboarding-step-handle {
  width: 2rem;
  height: 2rem;
  border: 1px solid var(--theme-border-strong);
  border-radius: 0.6rem;
  background: var(--theme-surface);
  color: #64748b;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: grab;
  margin-top: 0.35rem;
}

.onboarding-step-handle:active {
  cursor: grabbing;
}

.onboarding-step-handle svg {
  width: 1rem;
  height: 1rem;
}

.onboarding-step-index {
  width: 2rem;
  height: 2rem;
  border-radius: 999px;
  background: #eef2ff;
  color: #4338ca;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.875rem;
  font-weight: 700;
  margin-top: 0.35rem;
}

.onboarding-step-input {
  resize: vertical;
  min-height: 5.5rem;
}

.onboarding-step-add,
.onboarding-step-remove {
  border: 1px solid var(--theme-border-strong);
  background: var(--theme-surface);
  color: #111827;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.onboarding-step-add {
  align-self: flex-start;
  padding: 0.7rem 1rem;
}

.onboarding-step-remove {
  padding: 0.7rem 0.9rem;
}

.onboarding-step-add:hover,
.onboarding-step-remove:hover {
  border-color: #4f46e5;
  color: #4338ca;
}

.onboarding-step-remove:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.course-chips,
.course-chip-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.75rem;
}

.course-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.375rem 0.625rem;
  border-radius: 9999px;
  border: 1px solid var(--theme-border);
  background: var(--theme-surface-soft);
  color: var(--theme-text-muted);
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.course-chip:hover {
  border-color: #c7d2fe;
  background: #eef2ff;
  color: #4338ca;
}

.course-chip.selected {
  border-color: #6366f1;
  background: #eef2ff;
  color: #4338ca;
}

.chip-label {
  max-width: 220px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.chip-remove {
  font-size: 0.7rem;
  color: var(--theme-text-subtle);
  padding-left: 0.25rem;
}

.chip-empty,
.chip-hint {
  font-size: 0.75rem;
  color: var(--theme-text-subtle);
}

.cost-input-container {
  position: relative;
  display: flex;
  align-items: center;
}

.currency-symbol {
  position: absolute;
  left: 0.75rem;
  font-weight: 600;
  color: var(--theme-text-muted);
  font-size: 1rem;
  pointer-events: none;
}

.cost-input {
  padding-left: 2rem;
}

.cost-hint {
  font-size: 0.75rem;
  color: var(--theme-text-subtle);
  margin-top: 0.25rem;
  margin-bottom: 0;
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

/* Toggle Button */
.toggle-container {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.toggle-button {
  position: relative;
  width: 3.5rem;
  height: 2rem;
  background: #10b981;
  border-radius: 9999px;
  border: none;
  cursor: pointer;
  transition: background 0.3s;
}

.toggle-button:hover {
  background: #059669;
}

.toggle-active {
  background: #10b981 !important;
}

.toggle-active:hover {
  background: #059669 !important;
}

.toggle-button:not(.toggle-active) {
  background: #d1d5db;
}

.toggle-button:not(.toggle-active):hover {
  background: #9ca3af;
}

.toggle-slider {
  position: absolute;
  top: 0.25rem;
  left: 0.25rem;
  width: 1.5rem;
  height: 1.5rem;
  background: var(--theme-surface);
  border-radius: 9999px;
  transition: transform 0.3s;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.toggle-active .toggle-slider {
  transform: translateX(1.5rem);
}

.toggle-label {
  font-size: 0.875rem;
  color: var(--theme-text-muted);
  font-weight: 500;
}

/* Trial Section */
.trial-section {
  background: var(--theme-surface-soft);
  padding: 1rem;
  border-radius: 0.5rem;
  border: 1px solid var(--theme-border);
}

.trial-type-selector {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
  margin-top: 0.75rem;
  margin-bottom: 1rem;
}

.radio-option {
  position: relative;
  cursor: pointer;
}

.radio-option input[type='radio'] {
  position: absolute;
  opacity: 0;
  cursor: pointer;
}

.radio-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border: 2px solid #d1d5db;
  border-radius: 0.5rem;
  background: var(--theme-surface);
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--theme-text-muted);
  transition: all 0.2s;
}

.radio-option input[type='radio']:checked+.radio-label {
  border-color: #6366f1;
  background: #eef2ff;
  color: #6366f1;
}

.radio-option:hover .radio-label {
  border-color: #6366f1;
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

.btn-draft {
  padding: 0.625rem 1.5rem;
  background: #f59e0b;
  color: white;
  font-weight: 600;
  border-radius: 0.5rem;
  border: none;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-draft:hover {
  background: #d97706;
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
  z-index: 10;
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

/* Delete Modal */
.delete-modal {
  background: var(--theme-surface);
  border-radius: 0.75rem;
  width: 90%;
  max-width: 20rem;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

.delete-modal-header {
  padding: 1rem 1.25rem;
  border-bottom: 1px solid var(--theme-border);
}

.delete-modal-title {
  font-size: 1.125rem;
  font-weight: 700;
  color: #111827;
  margin: 0;
}

.delete-modal-body {
  padding: 1rem 1.25rem;
}

.delete-modal-text {
  color: var(--theme-text-muted);
  font-size: 0.9375rem;
  font-weight: 500;
  margin: 0 0 0.5rem 0;
}

.delete-modal-hint {
  color: var(--theme-text-subtle);
  font-size: 0.8125rem;
  margin: 0;
}

.delete-modal-footer {
  display: flex;
  gap: 0.75rem;
  padding: 1rem 1.25rem;
  justify-content: flex-end;
}

.delete-modal-btn {
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  border: none;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.delete-modal-cancel {
  background: var(--theme-surface-muted);
  color: var(--theme-text-muted);
  border: 1px solid var(--theme-border-strong);
}

.delete-modal-cancel:hover {
  background: var(--theme-border);
}

.delete-modal-delete {
  background: #ef4444;
  color: white;
}

.delete-modal-delete:hover:not(:disabled) {
  background: #dc2626;
}

/* Filter Modal */
.filter-modal {
  background: var(--theme-surface);
  border-radius: 0.75rem;
  width: 90%;
  max-width: 28rem;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

.filter-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid var(--theme-border);
}

.filter-modal-title {
  font-size: 1.125rem;
  font-weight: 700;
  color: #111827;
  margin: 0;
}

.filter-close-button {
  padding: 0.5rem;
  color: var(--theme-text-subtle);
  transition: color 0.2s;
  border: none;
  background: none;
  cursor: pointer;
  border-radius: 0.375rem;
}

.filter-close-button:hover {
  background: var(--theme-surface-muted);
  color: #111827;
}

.filter-modal-body {
  padding: 1.5rem;
  max-height: 60vh;
  overflow-y: auto;
}

.filter-section {
  margin-bottom: 2rem;
}

.filter-section:last-child {
  margin-bottom: 0;
}

.filter-section-title {
  font-size: 0.875rem;
  font-weight: 700;
  color: var(--theme-text-muted);
  margin: 0 0 0.75rem 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.filter-options {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.filter-checkbox {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.filter-checkbox input[type='radio'] {
  width: 1.25rem;
  height: 1.25rem;
  accent-color: #4f46e5;
  cursor: pointer;
  margin-right: 0.75rem;
  flex-shrink: 0;
}

.filter-checkbox span {
  font-size: 0.875rem;
  color: var(--theme-text-muted);
  user-select: none;
}

.filter-checkbox:hover span {
  color: #111827;
}

.filter-modal-footer {
  display: flex;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  border-top: 1px solid var(--theme-border);
  justify-content: flex-end;
}

.filter-btn-secondary {
  padding: 0.625rem 1.5rem;
  background: #4f46e5;
  color: white;
  font-weight: 600;
  border-radius: 0.5rem;
  border: none;
  cursor: pointer;
  transition: background 0.2s;
}

.filter-btn-secondary:hover {
  background: #4338ca;
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

.page-enter-active,
.page-leave-active {
  transition: opacity 0.3s ease;
}

.page-enter-from,
.page-leave-to {
  opacity: 0;
}

.page-enter-active .page-panel,
.page-leave-active .page-panel {
  transition: transform 0.3s ease;
}

.page-enter-from .page-panel,
.page-leave-to .page-panel {
  transform: translateX(6%);
}

.modal-enter-active .filter-modal,
.modal-leave-active .filter-modal {
  transition: transform 0.3s ease;
}

.modal-enter-from .filter-modal,
.modal-leave-to .filter-modal {
  transform: scale(0.95);
}

@media (max-width: 768px) {
  .onboarding-step-row {
    grid-template-columns: auto minmax(0, 1fr);
  }

  .onboarding-step-remove {
    grid-column: 1 / -1;
    justify-self: flex-end;
  }
}

/* Error Styles */
.form-group.has-error .form-input,
.form-group.has-error textarea,
.form-group.has-error .age-group-checkboxes,
.form-group.has-error .upload-area {
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
