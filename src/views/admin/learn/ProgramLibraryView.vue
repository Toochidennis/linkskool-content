<template>
  <div class="program-library">
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

    <!-- Grid View -->
    <div v-if="filteredProgramsList.length > 0" class="programs-grid" @click="closeMenuOutside">
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
          <p v-if="program.sponsor" class="program-sponsor"> {{ program.sponsor }}</p>
          <p class="program-text">{{ program.description }}</p>
          <div class="program-meta">
            <span class="program-date">📚 {{ program.courseCount }}
              {{ program.courseCount === 1 ? 'Course' : 'Courses' }}</span>
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

    <!-- Modal -->
    <Transition name="modal">
      <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
        <div class="modal-container">
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
            <div class="form-group">
              <label class="form-label">Program Title <span class="required">*</span></label>
              <input v-model="formData.name" type="text" required class="form-input"
                placeholder="e.g., Kids Coding Bootcamp" />
            </div>

            <!-- Slogan/Short Name -->
            <div class="form-group">
              <label class="form-label">Slogan/Short Name <span class="required">*</span></label>
              <input v-model="formData.shortname" type="text" required class="form-input"
                placeholder="e.g., KCB, WebDev Pro" />
            </div>

            <!-- Description/Purpose -->
            <div class="form-group">
              <label class="form-label">Description/Purpose <span class="required">*</span></label>
              <textarea v-model="formData.description" required rows="4" class="form-input"
                placeholder="Describe what this program offers and its objectives..."></textarea>
            </div>

            <!-- Sponsor/Host -->
            <div class="form-group">
              <label class="form-label">Sponsor/Host</label>
              <input v-model="formData.sponsor" type="text" class="form-input"
                placeholder="e.g., Digital Dreams Limited, Company Name" />
            </div>

            <!-- Banner Image -->
            <div class="form-group">
              <label class="form-label">Banner Image <span class="required">*</span></label>
              <div class="upload-area" @click="triggerFileInput" @dragover.prevent @drop.prevent="handleDrop">
                <input ref="fileInput" type="file" accept="image/*" @change="handleFileSelect" class="hidden" />
                <svg class="upload-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <p class="upload-text">Click to upload or drag and drop</p>
                <p class="upload-hint">PNG, JPG up to 10MB (Recommended: 1200x400px)</p>
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
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toast-notification'
import type { Program } from '@/api/models'
import { programService } from '@/api/services/serviceFactory'

const toast = useToast()
const router = useRouter()

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

// Filter states
const searchQuery = ref('')
const dateFilter = ref('')
const statusFilter = ref('')

const formData = ref({
  name: '',
  shortname: '',
  description: '',
  sponsor: '',
})

// Fetch programs from API
const fetchPrograms = async () => {
  try {
    const response = await programService.get()
    if (response.data) {
      programsList.value = Array.isArray(response.data) ? response.data : []
    }
    console.log('Loaded programs from backend')
  } catch (error: unknown) {
    console.error('Failed to fetch programs:', error)
    const message = error instanceof Error ? error.message : 'Failed to load programs'
    toast.error(message)
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
})

const isFormValid = computed(() => {
  const basicValid =
    formData.value.name.trim() !== '' &&
    formData.value.shortname.trim() !== '' &&
    formData.value.description.trim() !== '' &&
    (imageFile.value !== null || (editingProgramId.value && imagePreview.value))

  return basicValid
})

const openModal = () => {
  editingProgramId.value = null
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  resetForm()
}

const resetForm = () => {
  formData.value = {
    name: '',
    shortname: '',
    description: '',
    sponsor: '',
  }
  imagePreview.value = ''
  imageFile.value = null
  editingProgramId.value = null
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

const handleSubmit = async (status: 'published' | 'draft' | 'archived') => {
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
  formData.value = {
    name: prog.name,
    shortname: prog.shortname,
    description: prog.description || '',
    sponsor: prog.sponsor || '',
  }
  originalImageFileName.value = prog.imageUrl || ''
  imagePreview.value = prog.imageUrl || ''
  imageFile.value = null
  activeMenu.value = null
  showModal.value = true
}

const duplicateProgram = (prog: Program) => {
  editingProgramId.value = null
  formData.value = {
    name: prog.name + ' (Copy)',
    shortname: prog.shortname + ' Copy',
    description: prog.description || '',
    sponsor: prog.sponsor || '',
  }
  originalImageFileName.value = ''
  imagePreview.value = prog.imageUrl || ''
  imageFile.value = null
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
    query: { name: prog.name },
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
  color: #6b7280;
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
  color: #9ca3af;
  flex-shrink: 0;
  pointer-events: none;
}

.search-input {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.75rem;
  border: 1.5px solid #e5e7eb;
  background: white;
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
  border: 1.5px solid #e5e7eb;
  background: white;
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
  color: #6b7280;
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
  color: #6b7280;
  background: transparent;
  border: 1.5px solid #e5e7eb;
  border-radius: 0.75rem;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.clear-button:hover {
  color: #374151;
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
  background: white;
  border-radius: 0.75rem;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid #e5e7eb;
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
  color: #6b7280;
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
  border-top: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.program-date {
  font-size: 0.75rem;
  color: #6b7280;
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
  color: #6b7280;
  font-size: 1rem;
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
  background: white;
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
  border-bottom: 1px solid #e5e7eb;
}

.modal-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #111827;
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

.modal-body {
  padding: 1.5rem;
}

.modal-footer {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
  padding-top: 1.5rem;
  margin-top: 1.5rem;
  border-top: 1px solid #e5e7eb;
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
  color: #374151;
  margin-bottom: 0.5rem;
}

.required {
  color: #ef4444;
}

.form-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  transition: all 0.2s;
}

.form-input:focus {
  outline: none;
  border-color: #4f46e5;
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
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
  color: #374151;
  font-size: 1rem;
  pointer-events: none;
}

.cost-input {
  padding-left: 2rem;
}

.cost-hint {
  font-size: 0.75rem;
  color: #6b7280;
  margin-top: 0.25rem;
  margin-bottom: 0;
}

/* Age Group Checkboxes */
.age-group-checkboxes {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  padding: 1rem;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
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
  color: #374151;
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
  background: white;
  border-radius: 9999px;
  transition: transform 0.3s;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.toggle-active .toggle-slider {
  transform: translateX(1.5rem);
}

.toggle-label {
  font-size: 0.875rem;
  color: #374151;
  font-weight: 500;
}

/* Trial Section */
.trial-section {
  background: #f9fafb;
  padding: 1rem;
  border-radius: 0.5rem;
  border: 1px solid #e5e7eb;
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
  background: white;
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
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
  border: 2px dashed #d1d5db;
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
  color: #9ca3af;
}

.upload-text {
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.25rem;
}

.upload-hint {
  font-size: 0.75rem;
  color: #9ca3af;
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
  border: 2px solid #e5e7eb;
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
  background: white;
  color: #374151;
  font-weight: 600;
  border-radius: 0.5rem;
  border: 1px solid #d1d5db;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-secondary:hover {
  background: #f9fafb;
}

/* Menu Dropdown */
.menu-container {
  position: relative;
}

.menu-button {
  padding: 0.25rem;
  background: transparent;
  border: none;
  color: #6b7280;
  cursor: pointer;
  border-radius: 0.375rem;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.menu-button:hover {
  background: #f3f4f6;
  color: #111827;
}

.menu-dropdown {
  position: absolute;
  right: 0;
  top: 100%;
  margin-top: 0.25rem;
  background: white;
  border-radius: 0.5rem;
  box-shadow:
    0 10px 15px -3px rgba(0, 0, 0, 0.1),
    0 4px 6px -2px rgba(0, 0, 0, 0.05);
  border: 1px solid #e5e7eb;
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
  background: white;
  border: none;
  color: #374151;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
  text-align: left;
}

.menu-item:hover {
  background: #f9fafb;
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
  background: white;
  border-radius: 0.75rem;
  width: 90%;
  max-width: 20rem;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

.delete-modal-header {
  padding: 1rem 1.25rem;
  border-bottom: 1px solid #e5e7eb;
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
  color: #374151;
  font-size: 0.9375rem;
  font-weight: 500;
  margin: 0 0 0.5rem 0;
}

.delete-modal-hint {
  color: #6b7280;
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
  background: #f3f4f6;
  color: #374151;
  border: 1px solid #d1d5db;
}

.delete-modal-cancel:hover {
  background: #e5e7eb;
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
  background: white;
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
  border-bottom: 1px solid #e5e7eb;
}

.filter-modal-title {
  font-size: 1.125rem;
  font-weight: 700;
  color: #111827;
  margin: 0;
}

.filter-close-button {
  padding: 0.5rem;
  color: #6b7280;
  transition: color 0.2s;
  border: none;
  background: none;
  cursor: pointer;
  border-radius: 0.375rem;
}

.filter-close-button:hover {
  background: #f3f4f6;
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
  color: #374151;
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
  color: #374151;
  user-select: none;
}

.filter-checkbox:hover span {
  color: #111827;
}

.filter-modal-footer {
  display: flex;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  border-top: 1px solid #e5e7eb;
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

.modal-enter-active .filter-modal,
.modal-leave-active .filter-modal {
  transition: transform 0.3s ease;
}

.modal-enter-from .filter-modal,
.modal-leave-to .filter-modal {
  transform: scale(0.95);
}
</style>
