<template>
    <div class="lesson-form-page">
        <!-- Header -->
        <div class="form-header">
            <button class="back-btn" @click="handleCancel" :disabled="isSaving">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M19 12H5M12 19l-7-7 7-7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
            </button>
            <div class="header-info">
                <h1 class="page-title">{{ isEditMode ? 'Edit Lesson' : 'Add New Lesson' }}</h1>
                <p class="page-subtitle">
                    {{ isEditMode ? 'Update lesson details' : 'Create a new lesson for your course' }}
                </p>
            </div>
            <button class="save-btn" @click="handleSave" :disabled="isSaving">
                <svg v-if="isSaving" class="spinner-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <circle cx="12" cy="12" r="10" stroke-width="2" />
                </svg>
                <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                    <polyline points="17 21 17 13 7 13 7 21" />
                    <polyline points="7 3 7 8 15 8" />
                </svg>
                <span>{{ isSaving ? 'Saving...' : 'Save Lesson' }}</span>
            </button>
        </div>

        <!-- Form Content -->
        <div class="form-content">
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
                                placeholder="Enter lesson title..." @blur="handleBlur('title')"
                                @input="handleInput('title')" />
                            <span v-if="fieldErrors.title" class="error-message">{{ fieldErrors.title }}</span>
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
                                placeholder="Brief description of the lesson..." rows="3"
                                @blur="handleBlur('description')" @input="handleInput('description')"></textarea>
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
                            <span v-if="fieldErrors.goals" class="error-message">{{ fieldErrors.goals }}</span>
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
                                placeholder="https://youtube.com/... or https://vimeo.com/..."
                                @blur="handleBlur('videoUrl')" @input="handleInput('videoUrl')" />
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
                            <label class="form-label">Material File (PDF, Max 2MB)</label>
                            <FileUploadZone accept=".pdf" :max-size="2097152" @files-selected="handleMaterialUpload" />
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
                            <label class="form-label">Assignment File (PDF, Max 2MB)</label>
                            <FileUploadZone accept=".pdf" :max-size="2097152"
                                @files-selected="handleAssignmentUpload" />
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
                            <FileUploadZone accept=".svg" :max-size="5242880"
                                @files-selected="handleCertificateUpload" />
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
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useToast } from 'vue-toast-notification'
import type { Lesson } from '@/api/models/lesson'
import RichTextEditor from '@/components/RichTextEditor.vue'
import FileUploadZone from '@/components/FileUploadZone.vue'
import { useLesson } from '@/composables/useLesson'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const toast = useToast()
const authStore = useAuthStore()

const { packageLesson, saveLesson, updateLesson } = useLesson()

const isEditMode = ref(false)
const isSaving = ref(false)
const fieldErrors = ref<Record<string, string>>({})
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
    lessonDate: '',
    isFinalLesson: false,
    certificateFile: null,
})

onMounted(() => {
    // Get lesson data from route state
    const lessonData = history.state?.lesson
    const mode = history.state?.mode

    if (mode === 'edit' && lessonData) {
        isEditMode.value = true
        localLesson.value = JSON.parse(JSON.stringify(lessonData))
    } else {
        // New lesson
        const today = new Date().toISOString().split('T')[0] || ''
        const courseId = Number(route.query.courseId)
        const displayOrder = Number(route.query.displayOrder) || 1

        localLesson.value = {
            lessonId: `temp-${Date.now()}`,
            courseId: courseId || 0,
            displayOrder: displayOrder,
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
            lessonDate: today,
            isFinalLesson: false,
            certificateFile: null,
        }
    }
})

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
        case 'assignmentDueDate':
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

const handleCancel = () => {
    if (isSaving.value) return

    if (confirm('Are you sure you want to cancel? Any unsaved changes will be lost.')) {
        router.back()
    }
}

const handleSave = async () => {
    if (isSaving.value) return

    // Validate required route parameters
    const programId = Number(route.query.programId)
    const cohortId = Number(route.query.cohortId)
    const courseId = Number(route.query.courseId)

    if (!programId || !cohortId || !courseId) {
        toast.error('Missing required program, cohort, or course information', {
            position: 'top-right',
            duration: 5000,
        })
        return
    }

    // Validate author information
    if (!authStore.user?.id || !authStore.user?.username) {
        toast.error('User information not available. Please log in again.', {
            position: 'top-right',
            duration: 5000,
        })
        return
    }

    // Validate all fields
    const errors: Record<string, string> = {}
    const fieldsToValidate = [
        'title',
        'description',
        'goals',
        'videoUrl',
        'materialFile',
        'lessonDate',
        'displayOrder',
        'certificateFile',
    ]

    fieldsToValidate.forEach((field) => {
        const error = validateField(field)
        if (error) errors[field] = error
    })

    fieldErrors.value = errors

    if (Object.keys(errors).length > 0) {
        const firstError = Object.values(errors)[0]
        toast.error(firstError || 'Please fix the errors before submitting', {
            position: 'top-right',
            duration: 5000,
        })
        return
    }

    try {
        isSaving.value = true
        toast.info(isEditMode.value ? 'Updating lesson...' : 'Creating lesson...', {
            position: 'top-right',
            duration: 2000,
        })

        // Package the single lesson as FormData
        const formData = packageLesson(
            localLesson.value,
            programId,
            courseId,
            authStore.user.username,
            authStore.user.id,
        )

        // Send to server
        if (
            isEditMode.value &&
            localLesson.value.lessonId &&
            !String(localLesson.value.lessonId).startsWith('temp-')
        ) {
            await updateLesson(Number(localLesson.value.lessonId), cohortId, formData)
        } else {
            await saveLesson(cohortId, formData)
        }

        toast.success(
            isEditMode.value ? 'Lesson updated successfully!' : 'Lesson created successfully!',
            {
                position: 'top-right',
                duration: 3000,
            },
        )

        // Navigate back with success indicator
        router.back()
    } catch (err) {
        console.error('Error saving lesson:', err)
        const errorMessage =
            err instanceof Error ? err.message : 'Failed to save lesson. Please try again.'
        toast.error(errorMessage, {
            position: 'top-right',
            duration: 5000,
        })
    } finally {
        isSaving.value = false
    }
}

const handleMaterialUpload = (files: File[]) => {
    const file = files[0]
    if (!file) return

    if (!file.name.endsWith('.pdf')) {
        toast.error('Only PDF files are allowed for materials', {
            position: 'top-right',
            duration: 3000,
        })
        return
    }
    if (file.size > 2097152) {
        toast.error('File size must not exceed 2MB', {
            position: 'top-right',
            duration: 3000,
        })
        return
    }

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
        toast.error('Only PDF files are allowed for assignments', {
            position: 'top-right',
            duration: 3000,
        })
        return
    }
    if (file.size > 2097152) {
        toast.error('File size must not exceed 2MB', {
            position: 'top-right',
            duration: 3000,
        })
        return
    }

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

const handleCertificateUpload = (files: File[]) => {
    const file = files[0]
    if (!file || !file.name.endsWith('.svg')) {
        toast.error('Only SVG files are allowed for certificates', {
            position: 'top-right',
            duration: 3000,
        })
        return
    }
    if (file.size > 5242880) {
        toast.error('File size must not exceed 5MB', {
            position: 'top-right',
            duration: 3000,
        })
        return
    }

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
    localLesson.value.materialUrl = undefined
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ; (localLesson.value as any).oldMaterialUrl = undefined
    handleBlur('materialFile')
}

const removeAssignmentFile = () => {
    localLesson.value.assignmentFile = null
    localLesson.value.assignmentUrl = undefined
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ; (localLesson.value as any).oldAssignmentUrl = undefined
}

const removeCertificateFile = () => {
    localLesson.value.certificateFile = null
    localLesson.value.certificateUrl = undefined
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ; (localLesson.value as any).oldCertificateUrl = undefined
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

.lesson-form-page {
    height: 100vh;
    background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

/* Header */
.form-header {
    position: sticky;
    top: 0;
    z-index: 40;
    background: var(--theme-surface);
    border-bottom: 1px solid var(--theme-border);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
    backdrop-filter: blur(10px);
    background-color: rgba(255, 255, 255, 0.95);
    display: flex;
    align-items: center;
    gap: 20px;
    padding: 16px 24px;
}

.back-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    background: var(--theme-surface-muted);
    border: 1px solid var(--theme-border);
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    color: var(--theme-text-subtle);
    flex-shrink: 0;
}

.back-btn:hover:not(:disabled) {
    background: var(--theme-surface);
    border-color: #667eea;
    color: #667eea;
    transform: translateX(-2px);
}

.back-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
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
    color: var(--theme-text);
    margin: 0 0 4px 0;
    letter-spacing: -0.5px;
}

.page-subtitle {
    font-size: 13px;
    color: var(--theme-text-subtle);
    margin: 0;
    font-weight: 500;
}

.save-btn {
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
    flex-shrink: 0;
}

.save-btn:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(102, 126, 234, 0.4);
}

.save-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.save-btn svg {
    width: 18px;
    height: 18px;
    stroke-width: 2;
}

.spinner-icon {
    animation: spin 1s linear infinite;
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}

/* Form Content */
.form-content {
    flex: 1;
    padding: 32px 24px;
    max-width: 900px;
    margin: 0 auto;
    width: 100%;
    display: flex;
    flex-direction: column;
    min-height: 0;
}

.lesson-form {
    background: var(--theme-surface);
    border-radius: 16px;
    padding: 32px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    flex: 1;
    overflow-y: auto;
}

.form-section {
    margin-bottom: 32px;
    padding-bottom: 24px;
    border-bottom: 1px solid #f3f4f6;
}

.form-section:last-child {
    border-bottom: none;
    margin-bottom: 0;
}

.section-title {
    font-size: 15px;
    font-weight: 700;
    color: var(--theme-text);
    margin: 0 0 20px 0;
    display: flex;
    align-items: center;
    gap: 8px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.form-row {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 20px;
    margin-bottom: 20px;
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
    padding: 12px 14px;
    border: 2px solid var(--theme-border);
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
    min-height: 100px;
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
    border: 2px solid var(--theme-border);
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
    padding: 12px 14px;
    background: #f0fdf4;
    border: 1px solid #86efac;
    border-radius: 8px;
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
    padding: 6px 12px;
    background: #ef4444;
    color: white;
    border: none;
    border-radius: 6px;
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

@media (max-width: 768px) {
    .form-header {
        padding: 12px 16px;
    }

    .page-title {
        font-size: 18px;
    }

    .form-content {
        padding: 16px;
    }

    .lesson-form {
        padding: 20px;
    }

    .form-row {
        grid-template-columns: 1fr;
    }
}
</style>
