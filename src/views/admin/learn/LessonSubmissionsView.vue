<template>
  <div class="submissions-page">
    <header class="page-header">
      <div class="header-left">
        <button class="back-btn" @click="goBack" aria-label="Back to lessons">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M19 12H5M12 19l-7-7 7-7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </button>
        <div>
          <p class="eyebrow">{{ courseName }}</p>
          <h1 class="page-title">{{ lessonTitle || 'Lesson Submissions' }}</h1>
          <p class="page-subtitle">Review submissions, preview content, and grade students.</p>
        </div>
      </div>
      <div class="header-right">
        <div class="pill">{{ filteredSubmissions.length }} submissions</div>
      </div>
    </header>

    <section class="toolbar">
      <div class="search-wrap">
        <input v-model.trim="searchQuery" type="text" placeholder="Search student name..." class="search-input" />
      </div>
      <select v-model="typeFilter" class="type-filter">
        <option value="">All types</option>
        <option value="upload">Upload</option>
        <option value="text">Text</option>
        <option value="link">Link</option>
        <option value="mixed">Mixed</option>
      </select>
      <select v-model="gradingFilter" class="type-filter">
        <option value="">All grading</option>
        <option value="graded">Graded</option>
        <option value="ungraded">Ungraded</option>
      </select>
      <select v-model="notificationFilter" class="type-filter">
        <option value="">All notifications</option>
        <option value="notified">Notified</option>
        <option value="pending">Yet to be notified</option>
      </select>
    </section>

    <section v-if="isLoading" class="state-card">
      <div class="spinner"></div>
      <p>Loading submissions...</p>
    </section>

    <section v-else-if="loadError" class="state-card error">
      <h3>Unable to load submissions</h3>
      <p>{{ loadError }}</p>
      <button class="primary-btn" @click="loadSubmissions">Retry</button>
    </section>

    <section v-else-if="filteredSubmissions.length === 0" class="state-card empty">
      <h3>No submissions found</h3>
      <p>No assignment submissions exist yet, or none match your filters.</p>
    </section>

    <section v-else class="content-grid">
      <aside class="submission-list">
        <div class="list-actions">
          <button class="ghost-btn small" @click="toggleSelectAllVisible">
            {{ allVisibleSelected ? 'Clear Visible' : 'Select Visible' }}
          </button>
          <button class="primary-btn small" :disabled="bulkNotifyCount === 0 || isBulkNotifying" @click="bulkNotifySelected">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M15 17h5l-1.4-1.4a2 2 0 0 1-.6-1.4V11a6 6 0 0 0-12 0v3.2a2 2 0 0 1-.6 1.4L4 17h5" />
              <path d="M9 17a3 3 0 0 0 6 0" />
            </svg>
            {{ isBulkNotifying ? 'Notifying...' : `Notify Selected (${bulkNotifyCount})` }}
          </button>
        </div>

        <div v-for="item in filteredSubmissions" :key="item.id" class="submission-row">
          <label class="row-check" @click.stop>
            <input type="checkbox" :checked="selectedSubmissionIds.has(item.id)"
              :disabled="!canBulkNotify(item)"
              @change="toggleSubmissionSelection(item.id)" />
          </label>
          <button class="submission-item" :class="{ active: selectedSubmission?.id === item.id }" @click="selectSubmission(item)">
            <div class="item-top">
              <h4>{{ displayName(item) }}</h4>
              <span class="type-chip" :class="`type-${normalizeType(item.submission.type)}`">
                {{ typeLabel(item.submission.type) }}
              </span>
            </div>
            <p class="item-meta">
              Submitted {{ formatDate(item.createdAt) }}
            </p>
            <p class="item-grade" v-if="isGraded(item)">
              Score: {{ item.grading.assignedScore }}
            </p>
            <p class="item-grade success" v-if="isNotified(item)">
              Notified {{ formatDate(item.notification.notifiedAt) }}
            </p>
            <div class="status-badges">
              <span class="status-badge" :class="isGraded(item) ? 'status-graded' : 'status-ungraded'">
                {{ isGraded(item) ? 'Graded' : 'Ungraded' }}
              </span>
              <span class="status-badge" :class="isNotified(item) ? 'status-notified' : 'status-not-notified'">
                {{ isNotified(item) ? 'Notified' : 'Not notified' }}
              </span>
            </div>
          </button>
        </div>
      </aside>

      <article v-if="selectedSubmission" class="preview-panel">
        <div class="panel-header">
          <div>
            <h2>{{ displayName(selectedSubmission) }}</h2>
            <p>Submitted {{ formatDate(selectedSubmission.createdAt) }}</p>
          </div>
          <span class="type-chip large" :class="`type-${normalizeType(selectedSubmission.submission.type)}`">
            {{ typeLabel(selectedSubmission.submission.type) }}
          </span>
        </div>

        <section class="panel-block">
          <h3>Submission Preview</h3>

          <div v-if="normalizeType(selectedSubmission.submission.type) === 'upload'" class="preview-files">
            <template v-if="selectedSubmission.submission.files?.length">
              <div class="file-row" v-for="(file, idx) in selectedSubmission.submission.files" :key="`${file.fileName}-${idx}`">
                <div>
                  <p class="file-name">{{ submissionFileDisplayName(file, idx) }}</p>
                  <p class="file-meta">{{ file.type || 'file' }}</p>
                </div>
                <div class="file-actions">
                  <button class="ghost-btn" @click="previewSubmissionFile(file)">Preview</button>
                  <a class="ghost-btn" :href="resolveFileUrl(file)" target="_blank" rel="noopener">Open</a>
                </div>
              </div>
            </template>
            <p v-else class="muted">No files were attached.</p>
          </div>

          <div v-else-if="normalizeType(selectedSubmission.submission.type) === 'text'" class="preview-text">
            <p v-if="selectedSubmission.submission.textContent" class="text-content">
              {{ selectedSubmission.submission.textContent }}
            </p>
            <p v-else class="muted">No text content provided.</p>
          </div>

          <div v-else-if="normalizeType(selectedSubmission.submission.type) === 'link'" class="preview-link">
            <template v-if="selectedSubmission.submission.linkUrl">
              <a :href="normalizedLink(selectedSubmission.submission.linkUrl)" target="_blank" rel="noopener">
                {{ selectedSubmission.submission.linkUrl }}
              </a>
            </template>
            <p v-else class="muted">No link provided.</p>
          </div>

          <div v-else class="preview-mixed">
            <p class="muted">Submission type is mixed or unspecified. Showing available content:</p>
            <ul class="mixed-list">
              <li>Text: {{ selectedSubmission.submission.textContent ? 'Available' : 'Not provided' }}</li>
              <li>Link: {{ selectedSubmission.submission.linkUrl ? 'Available' : 'Not provided' }}</li>
              <li>Files: {{ selectedSubmission.submission.files?.length || 0 }}</li>
            </ul>
          </div>
        </section>

        <section class="panel-block grading-block">
          <h3>Grade Submission</h3>
          <div class="form-row">
            <label>Score</label>
            <input v-model.number="gradeForm.assignedScore" type="number" min="0" step="0.01" class="form-input"
              placeholder="Enter score" />
          </div>
          <div class="form-row">
            <label>Comment</label>
            <textarea v-model.trim="gradeForm.comment" class="form-textarea"
              placeholder="Add grading feedback for the student"></textarea>
          </div>
          <label class="notify-check">
            <input type="checkbox" v-model="gradeForm.notifyStudent" />
            <span>Notify student</span>
          </label>
          <div class="grading-actions">
            <button class="primary-btn" :disabled="isSavingGrade" @click="saveGrade">
              {{ isSavingGrade ? 'Saving...' : 'Save Grade' }}
            </button>
          </div>
        </section>
      </article>
    </section>

    <Teleport to="body">
      <div v-if="filePreviewOpen" class="file-overlay" @click="closeFilePreview">
        <div class="file-modal" @click.stop>
          <div class="file-header">
            <h3>{{ filePreviewTitle }}</h3>
            <button class="close-btn" @click="closeFilePreview" aria-label="Close preview">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
          <div class="file-body">
            <iframe v-if="filePreviewUrl" :src="filePreviewUrl" title="Submission File Preview"></iframe>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useToast } from 'vue-toast-notification'
import { useAuthStore } from '@/stores/auth'
import type {
  LessonSubmission,
  SubmissionFile,
  SubmissionGradePayload,
  SubmissionType,
} from '@/api/models/submission'
import { useLesson } from '@/composables/useLesson'

const route = useRoute()
const router = useRouter()
const toast = useToast()
const authStore = useAuthStore()
const { fetchLessonAssignments, gradeLessonSubmission, notifyLessonSubmissions } = useLesson()

const courseName = computed(() => (route.query.courseName as string) || 'Course')
const lessonTitle = computed(() => (route.query.lessonTitle as string) || 'Lesson Submissions')
const lessonId = computed(() => Number(route.query.lessonId) || 0)
//const cohortId = computed(() => Number(route.query.cohortId) || 0)

const isLoading = ref(false)
const loadError = ref('')
const searchQuery = ref('')
const typeFilter = ref('')
const gradingFilter = ref('')
const notificationFilter = ref('')
const submissions = ref<LessonSubmission[]>([])
const selectedSubmission = ref<LessonSubmission | null>(null)
const selectedSubmissionIds = ref<Set<number>>(new Set())
const isSavingGrade = ref(false)
const isBulkNotifying = ref(false)

const filePreviewOpen = ref(false)
const filePreviewUrl = ref('')
const filePreviewTitle = ref('')

const gradeForm = ref<SubmissionGradePayload>({
  assignedScore: null,
  comment: '',
  gradedBy: null,
  notifyStudent: true,
})

const normalizeType = (value: LessonSubmission['submission']['type']): SubmissionType | string => {
  const type = String(value || '').toLowerCase()
  if (type === 'upload' || type === 'text' || type === 'link' || type === 'mixed') {
    return type
  }
  return ''
}

const typeLabel = (value: LessonSubmission['submission']['type']) => {
  const type = normalizeType(value)
  if (type === 'upload') return 'Upload'
  if (type === 'text') return 'Text'
  if (type === 'link') return 'Link'
  if (type === 'mixed') return 'Mixed'
  return 'Unknown'
}

const displayName = (row: LessonSubmission) =>
  row.profile.fullName || [row.profile.firstName, row.profile.lastName].filter(Boolean).join(' ') || 'Unknown Student'

const isGraded = (row: LessonSubmission) => row.grading.assignedScore !== null

const isNotified = (row: LessonSubmission) => row.notification.notifiedAt !== null

const canBulkNotify = (row: LessonSubmission) => isGraded(row) && !isNotified(row)

const filteredSubmissions = computed(() =>
  submissions.value.filter((row) => {
    const name = displayName(row).toLowerCase()
    const type = normalizeType(row.submission.type)
    const matchesSearch = !searchQuery.value || name.includes(searchQuery.value.toLowerCase())
    const matchesType = !typeFilter.value || type === typeFilter.value
    const matchesGrading =
      !gradingFilter.value ||
      (gradingFilter.value === 'graded' ? isGraded(row) : !isGraded(row))
    const matchesNotification =
      !notificationFilter.value ||
      (notificationFilter.value === 'notified' ? isNotified(row) : !isNotified(row))
    return matchesSearch && matchesType && matchesGrading && matchesNotification
  }),
)

//const selectedCount = computed(() => selectedSubmissionIds.value.size)

const bulkNotifyCount = computed(() =>
  submissions.value.reduce((count, row) => (
    selectedSubmissionIds.value.has(row.id) && canBulkNotify(row) ? count + 1 : count
  ), 0),
)

const allVisibleSelected = computed(() => {
  const eligibleVisible = filteredSubmissions.value.filter(canBulkNotify)
  if (eligibleVisible.length === 0) return false
  return eligibleVisible.every((item) => selectedSubmissionIds.value.has(item.id))
})

const hydrateGradeForm = (row: LessonSubmission | null) => {
  if (!row) {
    gradeForm.value = { assignedScore: null, comment: '', gradedBy: null, notifyStudent: true }
    return
  }
  gradeForm.value = {
    assignedScore: row.grading.assignedScore,
    comment: row.grading.comment || '',
    gradedBy: authStore.user?.id || null,
    notifyStudent: true,
  }
}

watch(selectedSubmission, (value) => {
  hydrateGradeForm(value)
})

const selectSubmission = (row: LessonSubmission) => {
  selectedSubmission.value = row
}

const toggleSubmissionSelection = (submissionId: number) => {
  const row = submissions.value.find((item) => item.id === submissionId)
  if (!row || !canBulkNotify(row)) return
  const next = new Set(selectedSubmissionIds.value)
  if (next.has(submissionId)) {
    next.delete(submissionId)
  } else {
    next.add(submissionId)
  }
  selectedSubmissionIds.value = next
}

const toggleSelectAllVisible = () => {
  const next = new Set(selectedSubmissionIds.value)
  const eligibleVisible = filteredSubmissions.value.filter(canBulkNotify)
  if (allVisibleSelected.value) {
    eligibleVisible.forEach((item) => next.delete(item.id))
  } else {
    eligibleVisible.forEach((item) => next.add(item.id))
  }
  selectedSubmissionIds.value = next
}

const bulkNotifySelected = async () => {
  if (isBulkNotifying.value) return

  const submissionIds = submissions.value
    .filter((row) => selectedSubmissionIds.value.has(row.id) && canBulkNotify(row))
    .map((row) => row.id)
  if (submissionIds.length === 0) {
    toast.error('Only graded and not-yet-notified submissions can be notified.', {
      position: 'top-right',
      duration: 3000,
    })
    return
  }
  const gradedBy = authStore.user?.id || null

  isBulkNotifying.value = true
  try {
    await notifyLessonSubmissions({
      submissionIds,
      gradedBy,
    })

    const now = new Date().toISOString()
    submissions.value = submissions.value.map((row) => {
      if (!selectedSubmissionIds.value.has(row.id)) return row
      return {
        ...row,
        notification: {
          ...row.notification,
          notifiedAt: now,
          notifiedBy: gradedBy,
        },
      }
    })

    toast.success(`Notifications sent for ${submissionIds.length} student(s).`, {
      position: 'top-right',
      duration: 2500,
    })
  } catch (error) {
    console.error('Failed to notify selected submissions:', error)
    toast.error('Failed to notify selected students. Please try again.', {
      position: 'top-right',
      duration: 3000,
    })
  } finally {
    isBulkNotifying.value = false
  }
}

const formatDate = (value: string | null) => {
  if (!value) return 'Unknown date'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Unknown date'
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

const normalizedLink = (link: string) => {
  if (!link) return ''
  return /^https?:\/\//i.test(link) ? link : `https://${link}`
}

const sanitizeFilePathForName = (value: string) => {
  const normalized = value.replace(/\\/g, '/')
  const withoutKnownPrefix = normalized.replace(/^assets\/elearning\/lrm\//i, '')
  const segments = withoutKnownPrefix.split('/').filter(Boolean)
  return segments[segments.length - 1] || ''
}

const submissionFileDisplayName = (file: SubmissionFile, index = 0) => {
  const source = file.fileName || file.oldFileName || ''
  const cleaned = sanitizeFilePathForName(source)
  return cleaned || `File ${index + 1}`
}

const resolveFileUrl = (file: SubmissionFile) => {
  const source = file.fileName || file.oldFileName || ''
  if (!source) return ''
  if (source.startsWith('http://') || source.startsWith('https://')) return source
  if (source.startsWith('data:')) return source
  if (source.length > 100 && !source.includes('/') && !source.includes('\\')) {
    return `data:application/pdf;base64,${source}`
  }
  const base = String(import.meta.env.VITE_ASSETS_BASE_URL || '')
  const cleanBase = base.endsWith('/') ? base.slice(0, -1) : base
  const cleanPath = source.startsWith('/') ? source : `/${source}`
  return `${cleanBase}${cleanPath}`
}

const previewSubmissionFile = (file: SubmissionFile) => {
  const url = resolveFileUrl(file)
  if (!url) {
    toast.error('No preview URL found for this file.', { position: 'top-right', duration: 2500 })
    return
  }
  filePreviewTitle.value = submissionFileDisplayName(file)
  filePreviewUrl.value = url
  filePreviewOpen.value = true
}

const closeFilePreview = () => {
  filePreviewOpen.value = false
  filePreviewUrl.value = ''
  filePreviewTitle.value = ''
}

const loadSubmissions = async () => {
  if (!lessonId.value) {
    loadError.value = 'Missing lesson identifier.'
    return
  }

  isLoading.value = true
  loadError.value = ''
  try {
    const rows = await fetchLessonAssignments(lessonId.value)
    submissions.value = rows
    selectedSubmissionIds.value = new Set()
    selectedSubmission.value = rows[0] || null
  } catch (error) {
    console.error('Failed to load lesson submissions:', error)
    loadError.value = 'Failed to fetch submissions from server.'
  } finally {
    isLoading.value = false
  }
}

const saveGrade = async () => {
  if (!selectedSubmission.value || isSavingGrade.value) return
  if (gradeForm.value.assignedScore === null || Number.isNaN(Number(gradeForm.value.assignedScore))) {
    toast.error('Score is required before saving grade.', { position: 'top-right', duration: 2500 })
    return
  }

  isSavingGrade.value = true
  try {
    await gradeLessonSubmission(
      selectedSubmission.value.id,
      gradeForm.value,
    )
    selectedSubmission.value.grading.assignedScore = Number(gradeForm.value.assignedScore)
    selectedSubmission.value.grading.comment = gradeForm.value.comment
    selectedSubmission.value.grading.gradedAt = new Date().toISOString()
    if (gradeForm.value.notifyStudent) {
      selectedSubmission.value.notification.notifiedAt = new Date().toISOString()
    }
    toast.success('Grade saved successfully.', { position: 'top-right', duration: 2500 })
  } catch (error) {
    console.error('Failed to save grade:', error)
    toast.error('Failed to save grade. Please try again.', { position: 'top-right', duration: 3000 })
  } finally {
    isSavingGrade.value = false
  }
}

const goBack = () => {
  router.back()
}

onMounted(() => {
  loadSubmissions()
})
</script>

<style scoped>
.submissions-page {
  min-height: 100vh;
  background-color: var(--theme-bg);
  background-image:
    radial-gradient(circle at top right, rgba(14, 165, 233, 0.08), transparent 45%),
    radial-gradient(circle at top left, rgba(16, 185, 129, 0.08), transparent 35%);
  background:
    var(--theme-bg);
  color: var(--theme-text);
  padding: 1.5rem;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1rem;
}

.header-left {
  display: flex;
  gap: 0.85rem;
}

.back-btn {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  border: 1px solid var(--theme-border);
  background: var(--theme-surface);
  color: var(--theme-text-muted);
  cursor: pointer;
}

.back-btn svg {
  width: 18px;
  height: 18px;
}

.eyebrow {
  margin: 0 0 0.3rem;
  font-size: 0.75rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--theme-text-subtle);
}

.page-title {
  margin: 0;
  font-size: 1.4rem;
}

.page-subtitle {
  margin: 0.3rem 0 0;
  color: var(--theme-text-subtle);
  font-size: 0.92rem;
}

.pill {
  padding: 0.4rem 0.75rem;
  border-radius: 999px;
  border: 1px solid var(--theme-border);
  background: var(--theme-surface);
  font-size: 0.78rem;
  color: var(--theme-text-muted);
}

.toolbar {
  display: grid;
  grid-template-columns: minmax(220px, 1fr) repeat(3, minmax(140px, 170px));
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.search-wrap {
  min-width: 0;
}

.type-filter {
  min-width: 0;
}

.search-input,
.type-filter,
.form-input,
.form-textarea {
  width: 100%;
  border: 1px solid var(--theme-border);
  border-radius: 10px;
  background: var(--theme-surface);
  color: var(--theme-text);
  padding: 0.65rem 0.8rem;
}

.form-textarea {
  min-height: 110px;
  resize: vertical;
}

.state-card {
  border: 1px solid var(--theme-border);
  background: var(--theme-surface);
  border-radius: 14px;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.7rem;
}

.state-card.error {
  border-color: rgba(239, 68, 68, 0.45);
  background: color-mix(in srgb, var(--theme-surface) 82%, #ef4444 18%);
}

.content-grid {
  display: grid;
  grid-template-columns: minmax(260px, 320px) 1fr;
  gap: 1rem;
}

.submission-list {
  border: 1px solid var(--theme-border);
  border-radius: 14px;
  background: var(--theme-surface);
  padding: 0.65rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  max-height: calc(100vh - 220px);
  overflow: auto;
}

.list-actions {
  position: sticky;
  top: 0;
  z-index: 2;
  display: flex;
  gap: 0.5rem;
  padding: 0.5rem;
  border: 1px solid var(--theme-border);
  border-radius: 10px;
  background: color-mix(in srgb, var(--theme-surface) 92%, transparent);
  backdrop-filter: blur(6px);
}

.submission-row {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 0.45rem;
  align-items: start;
}

.row-check {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 42px;
}

.row-check input {
  width: 16px;
  height: 16px;
  accent-color: #0284c7;
  cursor: pointer;
}

.submission-item {
  border: 1px solid var(--theme-border);
  border-radius: 12px;
  background: var(--theme-bg);
  color: inherit;
  text-align: left;
  padding: 0.7rem;
  cursor: pointer;
}

.submission-item.active {
  border-color: #0ea5e9;
  box-shadow: 0 0 0 2px rgba(14, 165, 233, 0.15);
}

.item-top {
  display: flex;
  justify-content: space-between;
  gap: 0.5rem;
  align-items: center;
}

.item-top h4 {
  margin: 0;
  font-size: 0.9rem;
}

.item-meta,
.item-grade {
  margin: 0.35rem 0 0;
  font-size: 0.75rem;
  color: var(--theme-text-subtle);
}

.item-grade.pending {
  color: #b45309;
}

.item-grade.success {
  color: #059669;
}

.status-badges {
  margin-top: 0.5rem;
  display: flex;
  gap: 0.35rem;
  flex-wrap: wrap;
}

.status-badge {
  display: inline-flex;
  padding: 0.18rem 0.5rem;
  border-radius: 999px;
  font-size: 0.67rem;
  font-weight: 700;
  line-height: 1.3;
}

.status-graded {
  background: #dcfce7;
  color: #166534;
}

.status-ungraded {
  background: #fef3c7;
  color: #92400e;
}

.status-notified {
  background: #dbeafe;
  color: #1e3a8a;
}

.status-not-notified {
  background: #e2e8f0;
  color: #334155;
}

.preview-panel {
  border: 1px solid var(--theme-border);
  border-radius: 14px;
  background: var(--theme-surface);
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
}

.panel-header h2 {
  margin: 0;
  font-size: 1.1rem;
}

.panel-header p {
  margin: 0.35rem 0 0;
  font-size: 0.8rem;
  color: var(--theme-text-subtle);
}

.panel-block {
  border: 1px solid var(--theme-border);
  border-radius: 12px;
  padding: 0.9rem;
  background: var(--theme-bg);
}

.panel-block h3 {
  margin: 0 0 0.8rem;
  font-size: 0.95rem;
}

.preview-files {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.file-row {
  border: 1px solid var(--theme-border);
  border-radius: 10px;
  padding: 0.6rem 0.7rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.6rem;
  background: var(--theme-surface);
}

.file-name {
  margin: 0;
  font-size: 0.85rem;
  font-weight: 600;
}

.file-meta {
  margin: 0.25rem 0 0;
  font-size: 0.75rem;
  color: var(--theme-text-subtle);
}

.file-actions {
  display: flex;
  gap: 0.45rem;
}

.text-content {
  margin: 0;
  white-space: pre-wrap;
  line-height: 1.55;
}

.preview-link a {
  color: #0284c7;
  text-decoration: none;
  word-break: break-word;
}

.mixed-list {
  margin: 0.4rem 0 0;
  padding-left: 1.1rem;
}

.mixed-list li {
  margin: 0.3rem 0;
}

.muted {
  margin: 0;
  color: var(--theme-text-subtle);
}

.type-chip {
  display: inline-flex;
  padding: 0.2rem 0.55rem;
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
}

.type-chip.large {
  font-size: 0.75rem;
}

.type-upload {
  background: #dbeafe;
  color: #1e3a8a;
}

.type-text {
  background: #dcfce7;
  color: #166534;
}

.type-link {
  background: #fef3c7;
  color: #92400e;
}

.type-mixed,
.type- {
  background: #e2e8f0;
  color: #334155;
}

.form-row {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  margin-bottom: 0.8rem;
}

.form-row label {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--theme-text-muted);
}

.notify-check {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0.2rem 0 0.9rem;
  font-size: 0.85rem;
}

.grading-actions {
  display: flex;
  justify-content: flex-end;
}

.primary-btn,
.ghost-btn {
  border: none;
  border-radius: 9px;
  padding: 0.55rem 0.85rem;
  font-weight: 600;
  cursor: pointer;
}

.primary-btn.small,
.ghost-btn.small {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.75rem;
  padding: 0.45rem 0.65rem;
}

.primary-btn.small svg {
  width: 14px;
  height: 14px;
}

.primary-btn {
  background: #0284c7;
  color: #fff;
}

.ghost-btn {
  background: var(--theme-surface);
  border: 1px solid var(--theme-border);
  color: var(--theme-text-muted);
  text-decoration: none;
}

.spinner {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 2px solid #dbeafe;
  border-top-color: #0284c7;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.file-overlay {
  position: fixed;
  inset: 0;
  background: rgba(2, 6, 23, 0.75);
  display: grid;
  place-items: center;
  z-index: 100;
}

.file-modal {
  width: min(90vw, 980px);
  height: min(86vh, 780px);
  background: var(--theme-surface);
  color: var(--theme-text);
  border-radius: 14px;
  overflow: hidden;
  display: grid;
  grid-template-rows: auto 1fr;
}

.file-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.7rem 0.9rem;
  border-bottom: 1px solid var(--theme-border);
}

.file-header h3 {
  margin: 0;
  font-size: 0.9rem;
}

.close-btn {
  border: 1px solid var(--theme-border);
  border-radius: 8px;
  background: var(--theme-surface);
  color: var(--theme-text-muted);
  width: 30px;
  height: 30px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.close-btn svg {
  width: 14px;
  height: 14px;
}

.file-body iframe {
  width: 100%;
  height: 100%;
  border: 0;
  background: var(--theme-surface);
}

@media (max-width: 940px) {
  .content-grid {
    grid-template-columns: 1fr;
  }

  .submission-list {
    max-height: 280px;
  }

  .toolbar {
    grid-template-columns: 1fr;
  }
}

/* Ensure this page adapts even when system dark mode is active without explicit .dark class */
:global(html.dark) .submissions-page {
  background-color: var(--theme-bg);
}

@media (prefers-color-scheme: dark) {
  :global(html:not(.dark)) .submissions-page {
    background-color: #0f172a;
    color: #e2e8f0;
  }

  :global(html:not(.dark)) .submission-list,
  :global(html:not(.dark)) .preview-panel,
  :global(html:not(.dark)) .state-card,
  :global(html:not(.dark)) .panel-block,
  :global(html:not(.dark)) .file-row,
  :global(html:not(.dark)) .submission-item,
  :global(html:not(.dark)) .search-input,
  :global(html:not(.dark)) .type-filter,
  :global(html:not(.dark)) .form-input,
  :global(html:not(.dark)) .form-textarea,
  :global(html:not(.dark)) .ghost-btn,
  :global(html:not(.dark)) .pill,
  :global(html:not(.dark)) .back-btn,
  :global(html:not(.dark)) .close-btn,
  :global(html:not(.dark)) .file-modal {
    background: #111827;
    color: #e2e8f0;
    border-color: #334155;
  }
}
</style>
