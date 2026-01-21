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
                  <div class="form-group">
                    <label class="form-label">
                      Lesson Title
                      <span class="required">*</span>
                    </label>
                    <input v-model="localLesson.title" type="text" class="form-input"
                      placeholder="Enter lesson title..." />
                  </div>
                </div>

                <div class="form-row">
                  <div class="form-group">
                    <label class="form-label">Display Order</label>
                    <input v-model.number="localLesson.displayOrder" type="number" class="form-input" min="1" />
                  </div>
                </div>

                <div class="form-row">
                  <div class="form-group full">
                    <label class="form-label">
                      Description
                      <span class="required">*</span>
                    </label>
                    <textarea v-model="localLesson.description" class="form-textarea"
                      placeholder="Brief description of the lesson..." rows="3"></textarea>
                  </div>
                </div>
              </div>

              <!-- Goal & Objectives Section -->
              <div v-if="!localLesson.isFinalLesson" class="form-section">
                <h4 class="section-title">Learning Outcomes</h4>
                <div class="form-row">
                  <div class="form-group full">
                    <label class="form-label">Goal</label>
                    <div class="rich-editor-wrapper">
                      <RichTextEditor :model-value="localLesson.goals"
                        placeholder="What is the main goal of this lesson?" @update:model-value="
                          (value) => {
                            localLesson.goals = value
                          }
                        " />
                    </div>
                    <p class="form-hint">Use formatting for better presentation</p>
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
                  <div class="form-group full">
                    <label class="form-label">Video URL</label>
                    <input v-model="localLesson.videoUrl" type="url" class="form-input"
                      placeholder="https://youtube.com/... or https://vimeo.com/..." />
                    <p class="form-hint">Link to YouTube, Vimeo, or other video platform</p>
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
                    <label class="form-label">Material File (PDF, Max 5MB)</label>
                    <FileUploadZone accept=".pdf" :max-size="5242880" @files-selected="handleMaterialUpload" />
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
                  <div class="form-group full">
                    <label class="form-label">Assignment Instructions</label>
                    <div class="rich-editor-wrapper">
                      <RichTextEditor :model-value="localLesson.assignmentInstructions"
                        placeholder="Provide detailed assignment instructions..." @update:model-value="
                          (value) => {
                            localLesson.assignmentInstructions = value
                          }
                        " />
                    </div>
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
                  <div v-if="!localLesson.isFinalLesson" class="form-group">
                    <label class="form-label">Lesson Date</label>
                    <input v-model="localLesson.lessonDate" type="date" class="form-input" />
                  </div>
                  <div v-else class="form-group">
                    <label class="form-label">
                      Completion Date
                      <span class="required">*</span>
                    </label>
                    <input v-model="localLesson.lessonDate" type="date" class="form-input" />
                  </div>
                </div>

                <!-- Assignment Due Date (Regular Lessons Only) -->
                <div v-if="!localLesson.isFinalLesson" class="form-row">
                  <div class="form-group">
                    <label class="form-label">Assignment Due Date</label>
                    <input v-model="localLesson.assignmentDueDate" type="date" class="form-input" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Modal Footer -->
          <div class="modal-footer">
            <button class="btn-cancel" @click="handleClose">Cancel</button>
            <button class="btn-submit" @click="handleSave">
              {{ isEditMode ? 'Update Lesson' : 'Create Lesson' }}
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

const handleClose = () => {
  emit('close')
}

const handleSave = () => {
  // Validate required fields
  if (!localLesson.value.title || !localLesson.value.title.trim()) {
    alert('Lesson title is required')
    return
  }

  if (!localLesson.value.description || !localLesson.value.description.trim()) {
    alert('Lesson description is required')
    return
  }

  // Goals are required
  if (!localLesson.value.goals || !localLesson.value.goals.trim()) {
    alert('Goals are required')
    return
  }

  // Material file is required
  if (!localLesson.value.materialFile && !localLesson.value.materialUrl) {
    alert('Material file is required. Please upload a PDF material file before saving.')
    return
  }

  // Video URL is required
  if (!localLesson.value.videoUrl || !localLesson.value.videoUrl.trim()) {
    alert('Video URL is required')
    return
  }

  // Lesson date is required
  if (!localLesson.value.lessonDate || !localLesson.value.lessonDate.trim()) {
    alert('Lesson date is required')
    return
  }

  // Display order is required
  if (!localLesson.value.displayOrder || localLesson.value.displayOrder < 1) {
    alert('Display order is required and must be greater than 0')
    return
  }

  // Quiz is required
  if (!localLesson.value.quiz && !localLesson.value.hasQuiz) {
    alert('Quiz file is required. Please upload a JSON quiz file before saving.')
    return
  }

  // If assignment file exists, validate instructions and due date
  if (localLesson.value.assignmentFile) {
    if (
      !localLesson.value.assignmentInstructions ||
      !localLesson.value.assignmentInstructions.trim()
    ) {
      alert('Assignment instructions are required when assignment file is uploaded')
      return
    }
    if (!localLesson.value.assignmentDueDate || !localLesson.value.assignmentDueDate.trim()) {
      alert('Assignment due date is required when assignment file is uploaded')
      return
    }
  }

  // If final lesson, certificate is required
  if (
    localLesson.value.isFinalLesson &&
    !localLesson.value.certificateFile &&
    !localLesson.value.certificateUrl
  ) {
    alert('Certificate template is required for final lessons')
    return
  }

  emit('save', localLesson.value)
}

const handleMaterialUpload = (files: File[]) => {
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

  // Track old URL if it exists for deletion
  if (localLesson.value.materialUrl) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ; (localLesson.value as any).oldMaterialUrl = localLesson.value.materialUrl
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  localLesson.value.materialFile = file as any
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
}

const handleQuizUpload = (files: File[]) => {
  const file = files[0]
  if (!file || !file.name.endsWith('.json')) {
    alert('Only JSON files are allowed for quizzes')
    return
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  localLesson.value.quiz = file as any
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
}

const removeMaterialFile = () => {
  localLesson.value.materialFile = null
  // Also clear the URL so validation doesn't pass on empty state
  localLesson.value.materialUrl = undefined
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ; (localLesson.value as any).oldMaterialUrl = undefined
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
}

const removeCertificateFile = () => {
  localLesson.value.certificateFile = null
  // Also clear the URL
  localLesson.value.certificateUrl = undefined
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ; (localLesson.value as any).oldCertificateUrl = undefined
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
  z-index: 9999;
  padding: 20px;
  overflow-y: auto;
}

.modal-container {
  background: white;
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
  border-bottom: 1px solid #e5e7eb;
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
  border-top: 1px solid #e5e7eb;
  background: #f9fafb;
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
  background: #f3f4f6;
  color: #374151;
}

.btn-cancel:hover {
  background: #e5e7eb;
}

.btn-submit {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.btn-submit:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(102, 126, 234, 0.4);
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
