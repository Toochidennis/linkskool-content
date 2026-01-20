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
          <p class="page-subtitle">Create and manage course lessons with comprehensive content</p>
        </div>
        <div class="header-actions">
          <span v-if="isSaving" class="saving-status">
            <span class="spinner"></span>
            Saving...
          </span>
          <span v-else-if="savedIndicator" class="saved-status">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
            </svg>
            Saved
          </span>
          <button class="add-lesson-btn" @click="addNewLesson">
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
          <button class="btn-primary" @click="addNewLesson">Create First Lesson</button>
        </div>

        <div v-else class="lessons-grid" @dragover.prevent @drop="handleDrop">
          <div v-for="(lesson, index) in lessons" :key="lesson.lessonId || lesson.localId" class="lesson-item"
            draggable="true" @dragstart="handleDragStart($event, index)" @dragend="handleDragEnd" :data-index="index">
            <div class="lesson-card" :class="{
              'is-edited': editedLessons.has(String(lesson.lessonId)),
              'is-final': lesson.schedule.isFinalLesson,
              'is-collapsed': collapsedCards.has(String(lesson.lessonId)),
            }" @click="handleCardClick(String(lesson.lessonId), $event)">
              <!-- Card Header -->
              <div class="lesson-card-header">
                <div class="lesson-header-info">
                  <div class="lesson-badge" :class="lesson.schedule.isFinalLesson ? 'final' : 'regular'">
                    {{ lesson.schedule.isFinalLesson ? ' Final' : `Lesson ${index + 1}` }}
                  </div>
                  <h3 class="lesson-title" v-if="collapsedCards.has(String(lesson.lessonId))">
                    {{ lesson.title || 'Untitled Lesson' }}
                  </h3>
                </div>
                <div class="lesson-display-order">
                  <label class="order-label">Order:</label>
                  <input v-model.number="lesson.displayOrder" type="number" class="order-input" min="1"
                    @change="markEdited(lesson)" @click.stop />
                </div>
                <div class="lesson-card-actions">
                  <button class="icon-btn collapse-btn" @click="toggleCollapse(String(lesson.lessonId), $event)"
                    :title="collapsedCards.has(String(lesson.lessonId)) ? 'Expand' : 'Collapse'">
                    <svg v-if="collapsedCards.has(String(lesson.lessonId))" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor">
                      <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                    <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <polyline points="18 15 12 9 6 15"></polyline>
                    </svg>
                  </button>
                  <button class="icon-btn duplicate-btn" @click="duplicateLesson(lesson, $event)" title="Duplicate">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                    </svg>
                  </button>
                  <button class="icon-btn delete-btn" @click="deleteLesson(lesson, $event)" title="Delete">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <polyline points="3 6 5 6 21 6"></polyline>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                      <line x1="10" y1="11" x2="10" y2="17"></line>
                      <line x1="14" y1="11" x2="14" y2="17"></line>
                    </svg>
                  </button>
                </div>
              </div>

              <!-- Collapsed Preview -->
              <div v-if="collapsedCards.has(String(lesson.lessonId))" class="lesson-preview">
                <p class="preview-description">{{ lesson.description || 'No description' }}</p>
                <div class="preview-stats">
                  <div class="stat-item">
                    <span class="stat-label">Status:</span>
                    <span class="stat-value">{{
                      editedLessons.has(String(lesson.lessonId)) ? '✏️ Unsaved' : '✅ Saved'
                      }}</span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-label">Date:</span>
                    <span class="stat-value">📅 {{ formatDate(lesson.schedule.startDate) }}</span>
                  </div>
                </div>
                <div class="preview-meta">
                  <span v-if="lesson.videoUrl" class="meta-tag video">📹 Video</span>
                  <span v-if="lesson.recordedVideoUrl" class="meta-tag recorded">🎥 Recorded</span>
                  <span v-if="lesson.materialFile" class="meta-tag material">📄 Material File</span>
                  <span v-if="lesson.writeupContent" class="meta-tag writeup">📝 Write-up</span>
                  <span v-if="lesson.assignment.instructions" class="meta-tag assignment">✍️ Assignment</span>
                  <span v-if="lesson.quiz.jsonFile" class="meta-tag quiz">❓ Quiz</span>
                  <span v-if="lesson.schedule.isFinalLesson" class="meta-tag final-badge">🎓 Final Lesson</span>
                </div>
              </div>

              <!-- Expanded Form -->
              <div v-else class="lesson-form">
                <!-- Form Action Buttons (Top) -->
                <div class="form-actions-top">
                  <button v-if="editedLessons.has(String(lesson.lessonId))" class="btn-save"
                    @click="saveLesson(lesson, $event)">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                      <polyline points="17 21 17 13 7 13 7 21"></polyline>
                      <polyline points="7 3 7 8 15 8"></polyline>
                    </svg>
                    Save Changes
                  </button>
                  <button v-if="editedLessons.has(String(lesson.lessonId))" class="btn-discard"
                    @click="discardChanges(lesson, $event)">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="8" y1="12" x2="16" y2="12"></line>
                    </svg>
                    Discard
                  </button>
                </div>
                <!-- Basic Information Section -->
                <div class="form-section">
                  <h4 class="section-title">Basic Information</h4>
                  <div class="form-row">
                    <div class="form-group">
                      <label class="form-label">
                        Lesson Title
                        <span class="required">*</span>
                      </label>
                      <input v-model="lesson.title" type="text" class="form-input" placeholder="Enter lesson title..."
                        @change="markEdited(lesson)" />
                    </div>
                  </div>

                  <div class="form-row">
                    <div class="form-group full">
                      <label class="form-label">
                        Description
                        <span class="required">*</span>
                      </label>
                      <textarea v-model="lesson.description" class="form-textarea"
                        placeholder="Brief description of the lesson..." rows="3"
                        @change="markEdited(lesson)"></textarea>
                    </div>
                  </div>
                </div>

                <!-- Goal & Objectives Section -->
                <div v-if="!lesson.schedule.isFinalLesson" class="form-section">
                  <h4 class="section-title">Learning Outcomes</h4>
                  <div class="form-row">
                    <div class="form-group full">
                      <label class="form-label">Goal</label>
                      <div class="rich-editor-wrapper">
                        <RichTextEditor :model-value="lesson.goal" placeholder="What is the main goal of this lesson?"
                          @update:model-value="
                            (value) => {
                              lesson.goal = value
                            }
                          " @blur="markEdited(lesson)" />
                      </div>
                      <p class="form-hint">Use formatting for better presentation</p>
                    </div>
                  </div>

                  <div class="form-row">
                    <div class="form-group full">
                      <label class="form-label">Objectives</label>
                      <div class="rich-editor-wrapper">
                        <RichTextEditor :model-value="lesson.objectives"
                          placeholder="Enter learning objectives... (bullet points, bold, italic, etc.)"
                          @update:model-value="
                            (value) => {
                              lesson.objectives = value
                            }
                          " @blur="markEdited(lesson)" />
                      </div>
                      <p class="form-hint">Use formatting for better presentation</p>
                    </div>
                  </div>
                </div>

                <!-- Video & Materials Section -->
                <div v-if="!lesson.schedule.isFinalLesson" class="form-section">
                  <h4 class="section-title">Video & Materials</h4>
                  <div class="form-row">
                    <div class="form-group full">
                      <label class="form-label">Video URL</label>
                      <input v-model="lesson.videoUrl" type="url" class="form-input"
                        placeholder="https://youtube.com/... or https://vimeo.com/..." @change="markEdited(lesson)" />
                      <p class="form-hint">Link to YouTube, Vimeo, or other video platform</p>
                    </div>
                  </div>

                  <div class="form-row">
                    <div class="form-group full">
                      <label class="form-label">Recorded Video URL</label>
                      <input v-model="lesson.recordedVideoUrl" type="url" class="form-input"
                        placeholder="Link to recorded session..." @change="markEdited(lesson)" />
                      <p class="form-hint">Optional: Link to recorded lesson session</p>
                    </div>
                  </div>

                  <div class="form-row">
                    <div class="form-group full">
                      <label class="form-label">Material File (PDF, Max 5MB)</label>
                      <FileUploadZone accept=".pdf" :max-size="5242880"
                        @files-selected="(files) => handleMaterialUpload(lesson, files)" />
                      <div v-if="lesson.materialFile" class="file-list">
                        <div class="file-item">
                          <span class="file-name">{{ lesson.materialFile.file_name }}</span>
                          <button class="btn-remove" @click="removeMaterialFile(lesson)">
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div class="form-row">
                    <div class="form-group full">
                      <label class="form-label">Material Write-up (Alternative to Video)</label>
                      <div class="rich-editor-wrapper">
                        <RichTextEditor :model-value="lesson.writeupContent"
                          placeholder="Write detailed material content, notes, or reading materials..."
                          @update:model-value="
                            (value) => {
                              lesson.writeupContent = value
                            }
                          " @blur="markEdited(lesson)" />
                      </div>
                      <p class="form-hint">Use formatting for structured content</p>
                    </div>
                  </div>
                </div>

                <!-- Assignment Section -->
                <div v-if="!lesson.schedule.isFinalLesson" class="form-section">
                  <h4 class="section-title">Assignment</h4>
                  <div class="form-row">
                    <div class="form-group full">
                      <label class="form-label">Assignment Instructions</label>
                      <div class="rich-editor-wrapper">
                        <RichTextEditor :model-value="lesson.assignment.instructions"
                          placeholder="Provide detailed assignment instructions..." @update:model-value="
                            (value) => {
                              lesson.assignment.instructions = value
                            }
                          " @blur="markEdited(lesson)" />
                      </div>
                    </div>
                  </div>

                  <div class="form-row">
                    <div class="form-group full">
                      <label class="form-label">Assignment File (PDF, Max 5MB)</label>
                      <FileUploadZone accept=".pdf" :max-size="5242880"
                        @files-selected="(files) => handleAssignmentUpload(lesson, files)" />
                      <div v-if="lesson.assignment.file" class="file-list">
                        <div class="file-item">
                          <span class="file-name">{{ lesson.assignment.file.file_name }}</span>
                          <button class="btn-remove" @click="removeAssignmentFile(lesson)">
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Quiz Section -->
                <div v-if="!lesson.schedule.isFinalLesson" class="form-section">
                  <h4 class="section-title">❓ Quiz</h4>
                  <div class="form-row">
                    <div class="form-group full">
                      <label class="form-label">Upload Quiz (JSON Format)</label>
                      <FileUploadZone accept=".json" :max-size="5242880"
                        @files-selected="(files) => handleQuizUpload(lesson, files)" />
                      <p class="form-hint">Upload quiz in JSON format only</p>
                      <div v-if="lesson.quiz.jsonFile" class="file-list">
                        <div class="file-item">
                          <span class="file-name">{{ lesson.quiz.jsonFile.file_name }}</span>
                          <button class="btn-remove" @click="removeQuizFile(lesson)">Remove</button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Final Lesson Configuration -->
                <div class="form-section">
                  <h4 class="section-title">Lesson Settings</h4>
                  <div class="form-row">
                    <div class="form-group">
                      <label class="checkbox-label">
                        <input v-model="lesson.schedule.isFinalLesson" type="checkbox" @change="markEdited(lesson)" />
                        <span>Mark as Final Lesson</span>
                      </label>
                      <p class="form-hint">
                        Final lessons only require title, description, video URL, and certificate
                      </p>
                    </div>
                  </div>

                  <!-- Certificate Section (Only for Final Lesson) -->
                  <div v-if="lesson.schedule.isFinalLesson" class="form-row">
                    <div class="form-group full">
                      <label class="form-label">
                        Certificate Template (SVG, Max 5MB)
                        <span class="required">*</span>
                      </label>
                      <FileUploadZone accept=".svg" :max-size="5242880"
                        @files-selected="(files) => handleCertificateUpload(lesson, files)" />
                      <p class="form-hint">SVG format only for scalability and professionalism</p>
                      <div v-if="lesson.certificateFile" class="file-list">
                        <div class="file-item">
                          <span class="file-name">{{ lesson.certificateFile.file_name }}</span>
                          <button class="btn-remove" @click="removeCertificateFile(lesson)">
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Schedule Section - For All Lessons -->
                  <div class="form-row">
                    <div v-if="!lesson.schedule.isFinalLesson" class="form-group">
                      <label class="form-label">Lesson Date</label>
                      <input v-model="lesson.schedule.startDate" type="date" class="form-input"
                        @change="markEdited(lesson)" />
                    </div>
                    <div v-else class="form-group">
                      <label class="form-label">
                        Completion Date
                        <span class="required">*</span>
                      </label>
                      <input v-model="lesson.schedule.startDate" type="date" class="form-input"
                        @change="markEdited(lesson)" />
                    </div>
                  </div>

                  <!-- Assignment Due Date (Regular Lessons Only) -->
                  <div v-if="!lesson.schedule.isFinalLesson" class="form-row">
                    <div class="form-group">
                      <label class="form-label">Assignment Due Date</label>
                      <input v-model="lesson.assignment.dueDate" type="date" class="form-input"
                        @change="markEdited(lesson)" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Saving Indicator -->
    <div v-if="isSaving" class="save-indicator">
      <div class="spinner"></div>
      <span>Saving changes...</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { Lesson } from '@/api/models/lesson'
import RichTextEditor from '@/components/RichTextEditor.vue'
import FileUploadZone from '@/components/FileUploadZone.vue'
import { useLesson } from '@/composables/useLesson'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const { lessons, fetchLessons, sendLesson, packageLesson } = useLesson()

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
const editedLessons = ref(new Set<string>())
const collapsedCards = ref(new Set<string>())
const isSaving = ref(false)
const savedIndicator = ref(false)

const createEmptyLesson = (): Lesson => {
  const today = new Date().toISOString().split('T')[0] || new Date().toLocaleDateString('en-CA')
  return {
    lessonId: `temp-${Date.now()}`,
    courseId: courseId.value,
    displayOrder: lessons.value.length + 1,
    title: '',
    description: '',
    goal: '',
    objectives: '',
    videoUrl: '',
    recordedVideoUrl: '',
    materialFile: null,
    writeupContent: '',
    assignment: {
      instructions: '',
      file: null,
      dueDate: today as string,
    },
    quiz: {
      jsonFile: null,
    },
    schedule: {
      startDate: today as string,
      isFinalLesson: false,
    },
  }
}

onMounted(async () => {
  // Extract course info from route if available
  if (courseSlug.value) {
    courseTitle.value = formatCourseSlug(courseSlug.value)
  }

  // Load lessons from server
  if (courseId.value > 0) {
    try {
      await fetchLessons(courseId.value)
    } catch (err) {
      console.error('Failed to load lessons:', err)
    }
  }

  // Add default empty lesson on first load
  if (lessons.value.length === 0) {
    const defaultLesson = createEmptyLesson()
    lessons.value.push(defaultLesson)
  }
})

const addNewLesson = () => {
  const newLesson = createEmptyLesson()
  lessons.value.push(newLesson)
  collapsedCards.value.delete(String(newLesson.lessonId))
}

const markEdited = (lesson: Lesson) => {
  editedLessons.value.add(String(lesson.lessonId))
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

const saveLesson = async (lesson: Lesson, event: Event) => {
  event.stopPropagation()

  // Validate required fields
  if (!lesson.title || !lesson.title.trim()) {
    alert('Lesson title is required')
    return
  }

  // Validate material file (compulsory)
  if (!lesson.materialFile || !lesson.materialFile.file) {
    alert('Material file is required. Please upload a PDF material file before saving.')
    return
  }

  // Validate required route parameters
  if (!programId.value || !cohortId.value || !courseId.value) {
    alert('Missing required program, cohort, or course information')
    return
  }

  // Validate author information
  if (!authStore.user?.id || !authStore.user?.username) {
    alert('User information not available. Please log in again.')
    return
  }

  try {
    isSaving.value = true

    // Package the single lesson as FormData
    const formData = packageLesson(
      lesson,
      programId.value,
      courseId.value,
      cohortId.value,
      authStore.user.username,
      authStore.user.id,
    )

    console.log('Saving data ', formData)
    // Send to server
    const response = await sendLesson(formData)

    isSaving.value = false
    savedIndicator.value = true
    editedLessons.value.delete(String(lesson.lessonId))

    // Update lesson ID if it was a temporary one
    if (response.data?.lessonId) {
      lesson.lessonId = response.data.lessonId
    }

    setTimeout(() => {
      savedIndicator.value = false
    }, 3000)
  } catch (err) {
    console.error('Error saving lesson:', err)
    alert(err instanceof Error ? err.message : 'Failed to save lesson')
    isSaving.value = false
  }
}

const discardChanges = (lesson: Lesson, event: Event) => {
  event.stopPropagation()
  if (confirm('Are you sure you want to discard changes to this lesson?')) {
    editedLessons.value.delete(String(lesson.lessonId))
    // In a real app, you might refetch from server here
  }
}

const toggleCollapse = (lessonId: string, event: Event) => {
  event.stopPropagation()

  if (collapsedCards.value.has(lessonId)) {
    // Expand this card and collapse others
    lessons.value.forEach((l) => {
      const id = String(l.lessonId)
      if (id !== lessonId) {
        collapsedCards.value.add(id)
      }
    })
    collapsedCards.value.delete(lessonId)
  } else {
    collapsedCards.value.add(lessonId)
  }
}

const handleCardClick = (lessonId: string, event: Event) => {
  if (collapsedCards.value.has(lessonId)) {
    const target = event.target as HTMLElement
    if (target.closest('button') || target.closest('input') || target.closest('select')) {
      return
    }

    lessons.value.forEach((l) => {
      const id = String(l.lessonId)
      if (id !== lessonId) {
        collapsedCards.value.add(id)
      }
    })
    collapsedCards.value.delete(lessonId)
  }
}

const duplicateLesson = (lesson: Lesson, event: Event) => {
  event.stopPropagation()

  const duplicated = JSON.parse(JSON.stringify(lesson))
  duplicated.lessonId = `temp-${Date.now()}`
  duplicated.localId = undefined

  const index = lessons.value.findIndex((l) => l.lessonId === lesson.lessonId)
  if (index !== -1) {
    lessons.value.splice(index + 1, 0, duplicated)
    markEdited(duplicated)
  }
}

const deleteLesson = (lesson: Lesson, event: Event) => {
  event.stopPropagation()

  if (confirm('Are you sure you want to delete this lesson? This action cannot be undone.')) {
    const index = lessons.value.findIndex((l) => l.lessonId === lesson.lessonId)
    if (index !== -1) {
      lessons.value.splice(index, 1)
      editedLessons.value.delete(String(lesson.lessonId))
      collapsedCards.value.delete(String(lesson.lessonId))
      markEdited({} as Lesson)
    }
  }
}

const handleMaterialUpload = async (lesson: Lesson, files: File[]) => {
  const file = files[0]
  if (!file) return

  if (!file.name.endsWith('.pdf')) {
    alert('Only PDF files are allowed for materials')
    return
  }
  if (file.size > 5242880) {
    alert('File size must not exceed 5MB')
    return
  }

  const base64 = await fileToBase64(file)
  lesson.materialFile = {
    file_name: file.name,
    type: 'pdf',
    file: base64,
  }
  markEdited(lesson)
}

const handleAssignmentUpload = async (lesson: Lesson, files: File[]) => {
  const file = files[0]
  if (!file) return

  if (!file.name.endsWith('.pdf')) {
    alert('Only PDF files are allowed for assignments')
    return
  }
  if (file.size > 5242880) {
    alert('File size must not exceed 5MB')
    return
  }

  const base64 = await fileToBase64(file)
  lesson.assignment.file = {
    file_name: file.name,
    type: 'pdf',
    file: base64,
  }
  markEdited(lesson)
}

const handleQuizUpload = async (lesson: Lesson, files: File[]) => {
  const file = files[0]
  if (!file || !file.name.endsWith('.json')) {
    alert('Only JSON files are allowed for quizzes')
    return
  }

  const base64 = await fileToBase64(file)
  lesson.quiz.jsonFile = {
    file_name: file.name,
    type: 'json',
    file: base64,
  }
  markEdited(lesson)
}

const handleCertificateUpload = async (lesson: Lesson, files: File[]) => {
  const file = files[0]
  if (!file || !file.name.endsWith('.svg')) {
    alert('Only SVG files are allowed for certificates')
    return
  }
  if (file.size > 5242880) {
    alert('File size must not exceed 5MB')
    return
  }

  const base64 = await fileToBase64(file)
  lesson.certificateFile = {
    file_name: file.name,
    type: 'svg',
    file: base64,
  }
  markEdited(lesson)
}

const removeMaterialFile = (lesson: Lesson) => {
  lesson.materialFile = null
  markEdited(lesson)
}

const removeAssignmentFile = (lesson: Lesson) => {
  lesson.assignment.file = null
  markEdited(lesson)
}

const removeQuizFile = (lesson: Lesson) => {
  lesson.quiz.jsonFile = null
  markEdited(lesson)
}

const removeCertificateFile = (lesson: Lesson) => {
  lesson.certificateFile = undefined
  markEdited(lesson)
}

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      const base64 = result.split(',')[1] || result
      resolve(base64)
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
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

.lesson-card.is-collapsed {
  cursor: pointer;
}

.lesson-card.is-collapsed:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.15);
  border-left-color: #667eea;
}

.lesson-card.is-final {
  border-left-color: #8b5cf6;
}

.lesson-card.is-final.is-collapsed:hover {
  border-left-color: #8b5cf6;
  box-shadow: 0 8px 20px rgba(139, 92, 246, 0.15);
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

.icon-btn.collapse-btn:hover {
  color: #667eea;
  border-color: #667eea;
  background: #f0f4ff;
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
</style>
