<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="show" class="modal-overlay" @click.self="handleClose">
        <div class="modal-container">
          <!-- Modal Header -->
          <div class="modal-header">
            <h2 class="modal-title">{{ isEditMode ? 'Edit Lesson' : 'Add New Lesson' }}</h2>
            <button class="close-btn" @click="handleClose" title="Close">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M18 6L6 18M6 6l12 12" stroke-width="2" stroke-linecap="round" />
              </svg>
            </button>
          </div>

          <!-- Modal Body -->
          <div class="modal-body">
            <div class="lesson-form">
              <!-- Basic Information Section -->
              <div class="form-section">
                <h4 class="section-title">Basic Information</h4>
                <div class="form-row">
                  <div class="form-group" :class="{ 'has-error': fieldErrors.title }">
                    <label class="form-label">
                      Lesson Title
                      <span class="required">*</span>
                    </label>
                    <input v-model="localLesson.title" type="text" class="form-input"
                      placeholder="Enter lesson title..." @blur="handleBlur('title')" @input="handleInput('title')" />
                    <span v-if="fieldErrors.title" class="error-message">{{
                      fieldErrors.title
                      }}</span>
                  </div>
                </div>

                <div class="form-row">
                  <div class="form-group" :class="{ 'has-error': fieldErrors.displayOrder }">
                    <label class="form-label">Display Order<span class="required">*</span></label>
                    <input v-model.number="localLesson.displayOrder" type="number" class="form-input" min="1"
                      @blur="handleBlur('displayOrder')" @input="handleInput('displayOrder')" />
                    <span v-if="fieldErrors.displayOrder" class="error-message">{{
                      fieldErrors.displayOrder
                      }}</span>
                  </div>
                </div>

                <div class="form-row">
                  <div class="form-group full" :class="{ 'has-error': fieldErrors.description }">
                    <label class="form-label">
                      Description
                      <span class="required">*</span>
                    </label>
                    <textarea v-model="localLesson.description" class="form-textarea"
                      placeholder="Brief description of the lesson..." rows="3" @blur="handleBlur('description')"
                      @input="handleInput('description')"></textarea>
                    <span v-if="fieldErrors.description" class="error-message">{{
                      fieldErrors.description
                      }}</span>
                  </div>
                </div>
              </div>

              <!-- Goal & Objectives Section -->
              <div v-if="!localLesson.isFinalLesson" class="form-section">
                <h4 class="section-title">Learning Outcomes</h4>
                <div class="form-row">
                  <div class="form-group full" :class="{ 'has-error': fieldErrors.goals }">
                    <label class="form-label">Goal<span class="required">*</span></label>
                    <div class="rich-editor-wrapper">
                      <RichTextEditor :model-value="localLesson.goals"
                        placeholder="What is the main goal of this lesson?" @update:model-value="
                          (value) => {
                            localLesson.goals = value
                            handleInput('goals')
                          }
                        " @blur="handleBlur('goals')" />
                    </div>
                    <span v-if="fieldErrors.goals" class="error-message">{{
                      fieldErrors.goals
                      }}</span>
                    <p v-else class="form-hint">Use formatting for better presentation</p>
                  </div>
                </div>

                <div class="form-row">
                  <div class="form-group full">
                    <label class="form-label">Objectives</label>
                    <div class="rich-editor-wrapper">
                      <RichTextEditor :model-value="localLesson.objectives"
                        placeholder="Enter learning objectives... (bullet points, bold, italic, etc.)"
                        @update:model-value="
                          (value) => {
                            localLesson.objectives = value
                          }
                        " />
                    </div>
                    <p class="form-hint">Use formatting for better presentation</p>
                  </div>
                </div>
              </div>

              <!-- Video & Materials Section -->
              <div v-if="!localLesson.isFinalLesson" class="form-section">
                <h4 class="section-title">Video & Materials</h4>
                <div class="form-row">
                  <div class="form-group full" :class="{ 'has-error': fieldErrors.videoUrl }">
                    <label class="form-label">Video URL<span class="required">*</span></label>
                    <input v-model="localLesson.videoUrl" type="url" class="form-input"
                      placeholder="https://youtube.com/... or https://vimeo.com/..." @blur="handleBlur('videoUrl')"
                      @input="handleInput('videoUrl')" />
                    <span v-if="fieldErrors.videoUrl" class="error-message">{{
                      fieldErrors.videoUrl
                      }}</span>
                    <p v-else class="form-hint">Link to YouTube, Vimeo, or other video platform</p>
                  </div>
                </div>

                <div class="form-row">
                  <div class="form-group full">
                    <label class="form-label">Recorded Video URL</label>
                    <input v-model="localLesson.recordedVideoUrl" type="url" class="form-input"
                      placeholder="Link to recorded session..." />
                    <p class="form-hint">Optional: Link to recorded lesson session</p>
                  </div>
                </div>

                <div class="form-row">
                  <div class="form-group full">
                    <label class="form-label">Material File (PDF, Max 15MB)</label>
                    <FileUploadZone accept=".pdf" :max-size="15728640" @files-selected="handleMaterialUpload" />
                    <div v-if="localLesson.materialFile || localLesson.materialUrl" class="file-list">
                      <div class="file-item">
                        <span class="file-name">{{
                          (localLesson.materialFile as any)?.file_name ||
                          localLesson.materialFile?.name ||
                          'Existing Material File'
                          }}</span>
                        <button class="btn-remove" @click="removeMaterialFile">Remove</button>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="form-row">
                  <div class="form-group full">
                    <label class="form-label">Material Write-up (Alternative to Video)</label>
                    <div class="rich-editor-wrapper">
                      <RichTextEditor :model-value="localLesson.writeupContent"
                        placeholder="Write detailed material content, notes, or reading materials..."
                        @update:model-value="
                          (value) => {
                            localLesson.writeupContent = value
                          }
                        " />
                    </div>
                    <p class="form-hint">Use formatting for structured content</p>
                  </div>
                </div>
              </div>

              <!-- Assignment Section -->
              <div v-if="!localLesson.isFinalLesson" class="form-section">
                <h4 class="section-title">Assignment</h4>
                <div class="form-row">
                  <div class="form-group full" :class="{ 'has-error': fieldErrors.assignmentInstructions }">
                    <label class="form-label">Assignment Instructions</label>
                    <div class="rich-editor-wrapper">
                      <RichTextEditor :model-value="localLesson.assignmentInstructions"
                        placeholder="Provide detailed assignment instructions..." @update:model-value="
                          (value) => {
                            localLesson.assignmentInstructions = value
                            handleInput('assignmentInstructions')
                          }
                        " />
                    </div>
                    <span v-if="fieldErrors.assignmentInstructions" class="error-message">{{
                      fieldErrors.assignmentInstructions
                      }}</span>
                  </div>
                </div>

                <div class="form-row">
                  <div class="form-group full">
                    <label class="form-label">Assignment File (PDF, Max 5MB)</label>
                    <FileUploadZone accept=".pdf" :max-size="5242880" @files-selected="handleAssignmentUpload" />
                    <div v-if="localLesson.assignmentFile || localLesson.assignmentUrl" class="file-list">
                      <div class="file-item">
                        <span class="file-name">{{
                          (localLesson.assignmentFile as any)?.file_name ||
                          localLesson.assignmentFile?.name ||
                          'Existing Assignment File'
                          }}</span>
                        <button class="btn-remove" @click="removeAssignmentFile">Remove</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Quiz Section -->
              <div v-if="!localLesson.isFinalLesson" class="form-section">
                <h4 class="section-title">❓ Quiz</h4>
                <div class="form-row">
                  <div class="form-group full">
                    <label class="form-label">Upload Quiz (JSON Format)</label>
                    <FileUploadZone accept=".json" :max-size="5242880" @files-selected="handleQuizUpload" />
                    <p class="form-hint">Upload quiz in JSON format only</p>
                    <div v-if="localLesson.quiz || localLesson.hasQuiz" class="file-list">
                      <div class="file-item">
                        <span class="file-name">{{
                          (localLesson.quiz as any)?.file_name ||
                          localLesson.quiz?.name ||
                          'Existing Quiz'
                          }}</span>
                        <button class="btn-remove" @click="removeQuizFile">Remove</button>
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
                      <input v-model="localLesson.isFinalLesson" type="checkbox" />
                      <span>Mark as Final Lesson</span>
                    </label>
                    <p class="form-hint">
                      Final lessons only require title, description, video URL, and certificate
                    </p>
                  </div>
                </div>

                <!-- Certificate Section (Only for Final Lesson) -->
                <div v-if="localLesson.isFinalLesson" class="form-row">
                  <div class="form-group full">
                    <label class="form-label">
                      Certificate Template (SVG, Max 5MB)
                      <span class="required">*</span>
                    </label>
                    <FileUploadZone accept=".svg" :max-size="5242880" @files-selected="handleCertificateUpload" />
                    <p class="form-hint">SVG format only for scalability and professionalism</p>
                    <div v-if="localLesson.certificateFile || localLesson.certificateUrl" class="file-list">
                      <div class="file-item">
                        <span class="file-name">{{
                          (localLesson.certificateFile as any)?.file_name ||
                          localLesson.certificateFile?.name ||
                          'Existing Certificate File'
                          }}</span>
                        <button class="btn-remove" @click="removeCertificateFile">Remove</button>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Schedule Section - For All Lessons -->
                <div class="form-row">
                  <div v-if="!localLesson.isFinalLesson" class="form-group"
                    :class="{ 'has-error': fieldErrors.lessonDate }">
                    <label class="form-label">Lesson Date<span class="required">*</span></label>
                    <input v-model="localLesson.lessonDate" type="date" class="form-input"
                      @blur="handleBlur('lessonDate')" @change="handleInput('lessonDate')" />
                    <span v-if="fieldErrors.lessonDate" class="error-message">{{
                      fieldErrors.lessonDate
                      }}</span>
                  </div>
                  <div v-else class="form-group" :class="{ 'has-error': fieldErrors.lessonDate }">
                    <label class="form-label">
                      Completion Date
                      <span class="required">*</span>
                    </label>
                    <input v-model="localLesson.lessonDate" type="date" class="form-input"
                      @blur="handleBlur('lessonDate')" @change="handleInput('lessonDate')" />
                    <span v-if="fieldErrors.lessonDate" class="error-message">{{
                      fieldErrors.lessonDate
                      }}</span>
                  </div>
                </div>

                <!-- Assignment Due Date (Regular Lessons Only) -->
                <div v-if="!localLesson.isFinalLesson" class="form-row">
                  <div class="form-group" :class="{ 'has-error': fieldErrors.assignmentDueDate }">
                    <label class="form-label">Assignment Due Date</label>
                    <input v-model="localLesson.assignmentDueDate" type="date" class="form-input"
                      @blur="handleBlur('assignmentDueDate')" @change="handleInput('assignmentDueDate')" />
                    <span v-if="fieldErrors.assignmentDueDate" class="error-message">{{
                      fieldErrors.assignmentDueDate
                      }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Modal Footer -->
          <div class="modal-footer">
            <button class="btn-cancel" @click="handleClose" :disabled="isSaving">Cancel</button>
            <button class="btn-submit" @click="handleSave" :disabled="isSaving">
              <span v-if="isSaving">Saving...</span>
              <span v-else>{{ isEditMode ? 'Update Lesson' : 'Create Lesson' }}</span>
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { Lesson } from '@/api/models/lesson'
import RichTextEditor from '@/components/RichTextEditor.vue'
import FileUploadZone from '@/components/FileUploadZone.vue'

interface Props {
  show: boolean
  lesson?: Lesson | null
  isEditMode?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  show: false,
  lesson: null,
  isEditMode: false,
})

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'save', lesson: Lesson): void
}>()

const localLesson = ref<Lesson>({
  lessonId: '',
  courseId: 0,
  displayOrder: 1,
  title: '',
  description: '',
  goals: '',
  objectives: '',
  videoUrl: '',
  recordedVideoUrl: '',
  materialFile: null,
  writeupContent: '',
  assignmentInstructions: '',
  assignmentFile: null,
  assignmentDueDate: '',
  quiz: null,
  lessonDate: '',
  isFinalLesson: false,
  certificateFile: null,
})

const fieldErrors = ref<Record<string, string>>({})
const isSaving = ref(false)

watch(
  () => props.lesson,
  (newLesson) => {
    if (newLesson) {
      localLesson.value = JSON.parse(JSON.stringify(newLesson))
    } else {
      const today = new Date().toISOString().split('T')[0] || ''
      localLesson.value = {
        lessonId: `temp-${Date.now()}`,
        courseId: 0,
        displayOrder: 1,
        title: '',
        description: '',
        goals: '',
        objectives: '',
        videoUrl: '',
        recordedVideoUrl: '',
        materialFile: null,
        writeupContent: '',
        assignmentInstructions: '',
        assignmentFile: null,
        assignmentDueDate: today,
        quiz: null,
        lessonDate: today,
        isFinalLesson: false,
        certificateFile: null,
      }
    }
  },
  { immediate: true, deep: true },
)

watch(
  () => props.show,
  (newShow) => {
    if (!newShow) {
      isSaving.value = false
    }
  },
)

const validateField = (fieldName: string): string => {
  switch (fieldName) {
    case 'title':
      return localLesson.value.title?.trim() ? '' : 'Lesson title is required'
    case 'description':
      return localLesson.value.description?.trim() ? '' : 'Description is required'
    case 'goals':
      return localLesson.value.goals?.trim() ? '' : 'Goals are required'
    case 'videoUrl':
      return localLesson.value.videoUrl?.trim() ? '' : 'Video URL is required'
    case 'materialFile':
      return localLesson.value.materialFile || localLesson.value.materialUrl
        ? ''
        : 'Material file is required'
    case 'quiz':
      return localLesson.value.quiz || localLesson.value.hasQuiz ? '' : 'Quiz file is required'
    case 'lessonDate':
      return localLesson.value.lessonDate?.trim() ? '' : 'Lesson date is required'
    case 'displayOrder':
      if (!localLesson.value.displayOrder || localLesson.value.displayOrder < 1)
        return 'Display order must be greater than 0'
      return ''
    case 'certificateFile':
      if (
        localLesson.value.isFinalLesson &&
        !localLesson.value.certificateFile &&
        !localLesson.value.certificateUrl
      )
        return 'Certificate template is required for final lessons'
      return ''
    case 'assignmentInstructions':
      if (localLesson.value.assignmentFile && !localLesson.value.assignmentInstructions?.trim())
        return 'Assignment instructions are required when assignment file is uploaded'
      return ''
    case 'assignmentDueDate':
      if (localLesson.value.assignmentFile && !localLesson.value.assignmentDueDate?.trim())
        return 'Assignment due date is required when assignment file is uploaded'
      return ''
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

const handleClose = () => {
  if (isSaving.value) return
  fieldErrors.value = {}
  emit('close')
}

const handleSave = () => {
  if (isSaving.value) return

  // Validate all fields
  const errors: Record<string, string> = {}
  const fieldsToValidate = [
    'title',
    'description',
    'goals',
    'videoUrl',
    'materialFile',
    'quiz',
    'lessonDate',
    'displayOrder',
    'certificateFile',
    'assignmentInstructions',
    'assignmentDueDate',
  ]

  fieldsToValidate.forEach((field) => {
    const error = validateField(field)
    if (error) errors[field] = error
  })

  fieldErrors.value = errors

  if (Object.keys(errors).length > 0) {
    // Show the first error in an alert
    const firstError = Object.values(errors)[0]
    alert(firstError || 'Please fix the errors before submitting')
    return
  }

  isSaving.value = true
  emit('save', localLesson.value)
}

const handleMaterialUpload = (files: File[]) => {
  const file = files[0]
  if (!file) return

  if (!file.name.endsWith('.pdf')) {
    alert('Only PDF files are allowed for materials')
    return
  }
  if (file.size > 15728640) {
    alert('File size must not exceed 15MB')
    return
  }

  // Track old URL if it exists for deletion
  if (localLesson.value.materialUrl) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ; (localLesson.value as any).oldMaterialUrl = localLesson.value.materialUrl
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  localLesson.value.materialFile = file as any
  clearFieldError('materialFile')
}

const handleAssignmentUpload = (files: File[]) => {
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

  // Track old URL if it exists for deletion
  if (localLesson.value.assignmentUrl) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ; (localLesson.value as any).oldAssignmentUrl = localLesson.value.assignmentUrl
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  localLesson.value.assignmentFile = file as any
  clearFieldError('assignmentFile')
  clearFieldError('assignmentInstructions')
  clearFieldError('assignmentDueDate')
}

const handleQuizUpload = (files: File[]) => {
  const file = files[0]
  if (!file || !file.name.endsWith('.json')) {
    alert('Only JSON files are allowed for quizzes')
    return
  }

  // Validate and clean JSON
  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const content = e.target?.result as string

      // Remove trailing commas before closing brackets/braces
      const cleanedContent = content
        .replace(/,(\s*[}\]])/g, '$1') // Remove trailing commas before } or ]
        .trim()

      // Validate JSON by parsing it
      JSON.parse(cleanedContent)

      // Create a new cleaned file
      const cleanedFile = new File([cleanedContent], file.name, { type: 'application/json' })

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      localLesson.value.quiz = cleanedFile as any
      clearFieldError('quiz')
    } catch (error) {
      alert('Invalid JSON file. Please check the file format and remove any syntax errors.')
      console.error('JSON validation error:', error)
    }
  }

  reader.onerror = () => {
    alert('Failed to read the quiz file')
  }

  reader.readAsText(file)
}

const handleCertificateUpload = (files: File[]) => {
  const file = files[0]
  if (!file || !file.name.endsWith('.svg')) {
    alert('Only SVG files are allowed for certificates')
    return
  }
  if (file.size > 5242880) {
    alert('File size must not exceed 5MB')
    return
  }

  // Track old URL if it exists for deletion
  if (localLesson.value.certificateUrl) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ; (localLesson.value as any).oldCertificateUrl = localLesson.value.certificateUrl
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  localLesson.value.certificateFile = file as any
  clearFieldError('certificateFile')
}

const removeMaterialFile = () => {
  localLesson.value.materialFile = null
  // Also clear the URL so validation doesn't pass on empty state
  localLesson.value.materialUrl = undefined
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ; (localLesson.value as any).oldMaterialUrl = undefined
  // Trigger validation
  handleBlur('materialFile')
}

const removeAssignmentFile = () => {
  localLesson.value.assignmentFile = null
  // Also clear the URL
  localLesson.value.assignmentUrl = undefined
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ; (localLesson.value as any).oldAssignmentUrl = undefined
}

const removeQuizFile = () => {
  localLesson.value.quiz = null
  // Also clear the hasQuiz flag
  localLesson.value.hasQuiz = false
  // Trigger validation
  handleBlur('quiz')
}

const removeCertificateFile = () => {
  localLesson.value.certificateFile = null
  // Also clear the URL
  localLesson.value.certificateUrl = undefined
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ; (localLesson.value as any).oldCertificateUrl = undefined
  // Trigger validation if final lesson
  if (localLesson.value.isFinalLesson) {
    handleBlur('certificateFile')
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

* {
  font-family:
    'Inter',
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    sans-serif;
}

/* Modal Overlay */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10001;
  padding: 20px;
  overflow-y: auto;
}

.modal-container {
  background: var(--theme-surface);
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  width: 100%;
  max-width: 900px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  animation: slideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(40px) scale(0.95);
  }

  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* Modal Header */
.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px 32px;
  border-bottom: 1px solid var(--theme-border);
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px 16px 0 0;
}

.modal-title {
  font-size: 22px;
  font-weight: 700;
  color: white;
  margin: 0;
}

.close-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  color: white;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: rotate(90deg);
}

.close-btn svg {
  width: 20px;
  height: 20px;
  stroke-width: 2;
}

/* Modal Body */
.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 32px;
}

/* Modal Footer */
.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 20px 32px;
  border-top: 1px solid var(--theme-border);
  background: var(--theme-surface-soft);
  border-radius: 0 0 16px 16px;
}

.btn-cancel,
.btn-submit {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-cancel {
  background: var(--theme-surface-muted);
  color: var(--theme-text-muted);
}

.btn-cancel:hover {
  background: var(--theme-border);
}

.btn-submit {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.btn-submit:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(102, 126, 234, 0.4);
}

.btn-submit:disabled,
.btn-cancel:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Form Styles */
.lesson-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.form-section {
  padding-bottom: 20px;
  border-bottom: 1px solid #f3f4f6;
}

.form-section:last-child {
  border-bottom: none;
}

.section-title {
  font-size: 15px;
  font-weight: 700;
  color: var(--theme-text);
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
  color: var(--theme-text-muted);
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
  border: 1px solid var(--theme-border);
  border-radius: 8px;
  font-size: 14px;
  font-family: inherit;
  transition: all 0.2s ease;
  outline: none;
  background: var(--theme-surface);
}

.form-input:focus,
.form-textarea:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  background: var(--theme-surface);
}

.form-textarea {
  resize: vertical;
  min-height: 80px;
}

.form-hint {
  font-size: 12px;
  color: var(--theme-text-subtle);
  margin: 4px 0 0 0;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  color: var(--theme-text-muted);
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

.rich-editor-wrapper {
  border: 1px solid var(--theme-border);
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.2s ease;
}

.rich-editor-wrapper:focus-within {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

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

/* Transitions */
.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal-container,
.modal-leave-to .modal-container {
  transform: translateY(40px) scale(0.95);
}

/* Error states */
.form-group.has-error .form-input,
.form-group.has-error .form-textarea,
.form-group.has-error .rich-editor-wrapper {
  border-color: #ef4444 !important;
  background: #fef2f2 !important;
}

.form-group.has-error .form-input:focus,
.form-group.has-error .form-textarea:focus,
.form-group.has-error .rich-editor-wrapper:focus-within {
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1) !important;
}

.error-message {
  display: block;
  color: #dc2626;
  font-size: 12px;
  font-weight: 600;
  margin-top: 4px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.error-message::before {
  content: '⚠';
  font-size: 14px;
}

/* Responsive */
@media (max-width: 768px) {
  .modal-container {
    max-height: 95vh;
    margin: 10px;
  }

  .modal-header,
  .modal-body,
  .modal-footer {
    padding: 16px 20px;
  }

  .form-row {
    grid-template-columns: 1fr;
  }
}
</style>
