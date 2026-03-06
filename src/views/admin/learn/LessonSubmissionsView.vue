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
        <div class="pill">{{ submissionsMeta.total }} submissions</div>
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

    <section class="pagination-toolbar" v-if="submissionsMeta.totalPages > 0">
      <div class="pagination-left">
        <label for="submissions-limit">Rows</label>
        <select id="submissions-limit" v-model.number="pageLimit" class="type-filter" @change="onLimitChange">
          <option :value="10">10</option>
          <option :value="20">20</option>
          <option :value="50">50</option>
          <option :value="100">100</option>
        </select>
      </div>
      <div class="pagination-right">
        <button class="ghost-btn small" :disabled="!submissionsMeta.hasPrevPage || isLoading" @click="goToPreviousPage">
          Previous
        </button>
        <span>Page {{ submissionsMeta.page }} of {{ submissionsMeta.totalPages }}</span>
        <button class="ghost-btn small" :disabled="!submissionsMeta.hasNextPage || isLoading" @click="goToNextPage">
          Next
        </button>
      </div>
    </section>

    <section v-if="isAutoGrading" class="autograde-progress">
      <div class="spinner"></div>
      <div class="autograde-progress-copy">
        <p>Auto grading in progress...</p>
        <div class="autograde-progress-bar">
          <span></span>
        </div>
      </div>
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

    <section v-else-if="autoGradePageOpen" class="autograde-page">
      <div class="panel-header">
        <div>
          <h2>Auto Grade Results</h2>
          <p>
            Batch {{ autoGradeBatchId || 'N/A' }}:
            {{ autoGradeSummary.processed }} processed, {{ autoGradeSummary.failed }} failed
          </p>
        </div>
        <button class="ghost-btn small" @click="closeAutoGradePage">Back to submissions</button>
      </div>
      <div class="autograde-body">
        <div class="autograde-table-wrap">
          <table class="autograde-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Submitted</th>
                <th>Assignment</th>
                <th>Score</th>
                <th>Comment</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in autoGradeRows" :key="row.submissionId">
                <td>{{ row.studentName || `#${row.profileId}` }}</td>
                <td>
                  <div class="submitted-cell">
                    <p class="submitted-type">{{ typeLabel(row.submitted.submissionType) }}</p>
                    <p class="submitted-text" v-if="submittedTextPreview(row)">{{ submittedTextPreview(row) }}</p>
                    <a
                      v-if="row.submitted.linkUrl"
                      :href="normalizedLink(row.submitted.linkUrl)"
                      target="_blank"
                      rel="noopener"
                    >
                      {{ row.submitted.linkUrl }}
                    </a>
                    <ul v-if="row.submitted.files?.length" class="submitted-files">
                      <li v-for="(file, idx) in row.submitted.files" :key="`${row.submissionId}-file-${idx}`">
                        <div class="file-actions">
                          <button class="ghost-btn" @click="previewSubmissionFile(file)">Preview</button>
                          <a class="ghost-btn" :href="resolveFileUrl(file)" target="_blank" rel="noopener">
                            {{ submissionFileDisplayName(file, idx) }}
                          </a>
                        </div>
                      </li>
                    </ul>
                    <p v-if="!hasSubmittedContent(row.submitted)" class="muted">
                      No content provided
                    </p>
                  </div>
                </td>
                <td>
                  <div v-if="row.assignmentUrl" class="file-actions">
                    <button class="ghost-btn" @click="previewAssignmentUrl(row)">Preview</button>
                    <a class="ghost-btn" :href="normalizedLink(row.assignmentUrl)" target="_blank" rel="noopener">
                      Open
                    </a>
                  </div>
                  <span v-else class="muted">No URL</span>
                </td>
                <td>
                  <input v-model.number="row.score" type="number" min="0" max="100" step="0.1" class="form-input autograde-score" />
                </td>
                <td>
                  <textarea v-model.trim="row.comment" class="form-textarea autograde-comment"></textarea>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <label class="notify-check">
          <input type="checkbox" v-model="autoGradeNotifyStudent" />
          <span>Notify students after grading</span>
        </label>
        <div class="grading-actions">
          <button class="primary-btn" :disabled="isSubmittingAutoGradeResults || autoGradeRows.length === 0" @click="submitAutoGradeResults">
            {{ isSubmittingAutoGradeResults ? 'Saving...' : 'Grade Selected' }}
          </button>
        </div>
      </div>
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
          <button class="ghost-btn small" :disabled="bulkAutoGradeCount === 0 || isAutoGrading" @click="openAutoGradePage">
            {{ isAutoGrading ? 'Auto grading...' : `Auto Grade Selected (${bulkAutoGradeCount})` }}
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
            <div class="content-indicators">
              <span class="content-dot" :class="{ active: hasTextSubmission(item) }" title="Has text content">T</span>
              <span class="content-dot" :class="{ active: hasLinkSubmission(item) }" title="Has link">L</span>
              <span class="content-dot" :class="{ active: hasFileSubmission(item) }" title="Has files">F</span>
            </div>
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
  LessonSubmissionsMeta,
  SubmissionAutoGradeResult,
  SubmissionAutoGradeSummary,
  SubmissionBulkGradePayload,
  SubmissionFile,
  SubmissionGradePayload,
  SubmissionType,
} from '@/api/models/submission'
import { useLesson } from '@/composables/useLesson'

const route = useRoute()
const router = useRouter()
const toast = useToast()
const authStore = useAuthStore()
const {
  fetchLessonAssignments,
  autoGradeLessonSubmissions,
  gradeLessonSubmission,
  notifyLessonSubmissions,
} = useLesson()

const courseName = computed(() => (route.query.courseName as string) || 'Course')
const lessonTitle = computed(() => (route.query.lessonTitle as string) || 'Lesson Submissions')
const lessonId = computed(() => {
  const raw = route.query.lessonId ?? route.query.id
  const value = Number(raw)
  return Number.isFinite(value) && value > 0 ? value : 0
})
//const cohortId = computed(() => Number(route.query.cohortId) || 0)

const isLoading = ref(false)
const loadError = ref('')
const searchQuery = ref('')
type SubmissionTypeFilter = '' | 'upload' | 'text' | 'link' | 'mixed'
type GradingFilter = '' | 'graded' | 'ungraded'
type NotificationFilter = '' | 'notified' | 'pending'
type SubmissionStatusFilter = '' | 'graded' | 'ungraded' | 'notified'

const typeFilter = ref<SubmissionTypeFilter>('')
const gradingFilter = ref<GradingFilter>('')
const notificationFilter = ref<NotificationFilter>('')
const submissions = ref<LessonSubmission[]>([])
const currentPage = ref(1)
const pageLimit = ref(20)
const submissionsMeta = ref<LessonSubmissionsMeta>({
  page: 1,
  limit: 20,
  total: 0,
  totalPages: 0,
  hasNextPage: false,
  hasPrevPage: false,
})
const selectedSubmission = ref<LessonSubmission | null>(null)
const selectedSubmissionIds = ref<Set<number>>(new Set())
const isSavingGrade = ref(false)
const isBulkNotifying = ref(false)
const isAutoGrading = ref(false)
const isSubmittingAutoGradeResults = ref(false)

const filePreviewOpen = ref(false)
const filePreviewUrl = ref('')
const filePreviewTitle = ref('')
const autoGradePageOpen = ref(false)
const autoGradeNotifyStudent = ref(true)
const autoGradeBatchId = ref<string | number | null>(null)
const autoGradeSummary = ref<SubmissionAutoGradeSummary>({
  total: 0,
  processed: 0,
  failed: 0,
})
const autoGradeRows = ref<SubmissionAutoGradeResult[]>([])

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

const canBulkNotify = (row: LessonSubmission) => isGraded(row)

const hasTextSubmission = (row: LessonSubmission) => Boolean((row.submission.textContent || '').trim())

const hasLinkSubmission = (row: LessonSubmission) => Boolean((row.submission.linkUrl || '').trim())

const hasFileSubmission = (row: LessonSubmission) =>
  Array.isArray(row.submission.files) && row.submission.files.length > 0

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

const bulkAutoGradeCount = computed(() =>
  submissions.value.reduce((count, row) => (
    selectedSubmissionIds.value.has(row.id) && !isGraded(row) ? count + 1 : count
  ), 0),
)

const allVisibleSelected = computed(() => {
  const visible = filteredSubmissions.value
  if (visible.length === 0) return false
  return visible.every((item) => selectedSubmissionIds.value.has(item.id))
})

const resolvedStatusFilter = computed<SubmissionStatusFilter>(() => {
  if (notificationFilter.value === 'notified') return 'notified'
  if (gradingFilter.value === 'graded' || gradingFilter.value === 'ungraded') {
    return gradingFilter.value
  }
  return ''
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

watch(gradingFilter, (value) => {
  if (value && notificationFilter.value) {
    notificationFilter.value = ''
  }
})

watch(notificationFilter, (value) => {
  if (value && gradingFilter.value) {
    gradingFilter.value = ''
  }
})

watch([typeFilter, gradingFilter, notificationFilter], async () => {
  if (!lessonId.value) return
  currentPage.value = 1
  await loadSubmissions(1)
})

const selectSubmission = (row: LessonSubmission) => {
  selectedSubmission.value = row
}

const toggleSubmissionSelection = (submissionId: number) => {
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
  const visible = filteredSubmissions.value
  if (allVisibleSelected.value) {
    visible.forEach((item) => next.delete(item.id))
  } else {
    visible.forEach((item) => next.add(item.id))
  }
  selectedSubmissionIds.value = next
}

const bulkNotifySelected = async () => {
  if (isBulkNotifying.value) return

  const submissionIds = submissions.value
    .filter((row) => selectedSubmissionIds.value.has(row.id) && canBulkNotify(row))
    .map((row) => row.id)
  if (submissionIds.length === 0) {
    toast.error('Only graded submissions can be notified.', {
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
    const notifiedIds = new Set(submissionIds)
    submissions.value = submissions.value.map((row) => {
      if (!notifiedIds.has(row.id)) return row
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

const previewAssignmentUrl = (row: SubmissionAutoGradeResult) => {
  if (!row.assignmentUrl) {
    toast.error('No assignment URL found.', { position: 'top-right', duration: 2500 })
    return
  }
  filePreviewTitle.value = `Assignment Preview - ${row.studentName || `#${row.profileId}`}`
  filePreviewUrl.value = normalizedLink(row.assignmentUrl)
  filePreviewOpen.value = true
}

const closeFilePreview = () => {
  filePreviewOpen.value = false
  filePreviewUrl.value = ''
  filePreviewTitle.value = ''
}

const hasSubmittedContent = (submitted: {
  textContent?: string | null
  linkUrl?: string | null
  files?: SubmissionFile[] | null
}) => {
  const hasText = Boolean((submitted.textContent || '').trim())
  const hasLink = Boolean((submitted.linkUrl || '').trim())
  const hasFiles = Array.isArray(submitted.files) && submitted.files.length > 0
  return hasText || hasLink || hasFiles
}

const closeAutoGradePage = async () => {
  autoGradePageOpen.value = false
  autoGradeRows.value = []
  autoGradeBatchId.value = null
  autoGradeSummary.value = { total: 0, processed: 0, failed: 0 }
  autoGradeNotifyStudent.value = true
  await loadSubmissions(currentPage.value)
}

const submittedTextPreview = (row: SubmissionAutoGradeResult) => {
  const text = row.submitted.textContent || ''
  if (!text) return ''
  return text.length > 180 ? `${text.slice(0, 180)}...` : text
}

const openAutoGradePage = async () => {
  if (isAutoGrading.value) return
  const candidateSubmissions = submissions.value
    .filter((row) => selectedSubmissionIds.value.has(row.id) && !isGraded(row))
    .filter((row) => hasSubmittedContent({
      textContent: row.submission.textContent,
      linkUrl: row.submission.linkUrl,
      files: row.submission.files,
    }))
  const submissionIds = candidateSubmissions.map((row) => row.id)

  if (submissionIds.length === 0) {
    toast.error('Select at least one ungraded submission with content for auto grading.', {
      position: 'top-right',
      duration: 3000,
    })
    return
  }

  isAutoGrading.value = true
  try {
    const response = await autoGradeLessonSubmissions({
      submissionIds,
      gradedBy: authStore.user?.id || null,
    })
    const rows = Array.isArray(response?.results) ? response.results : []
    if (rows.length === 0) {
      toast.error('Auto grade returned no results for selected submissions.', {
        position: 'top-right',
        duration: 3000,
      })
      return
    }
    autoGradeRows.value = rows.map((row) => ({
      ...row,
      score: Number(row.score ?? 0),
      comment: row.comment || '',
    }))
    autoGradeBatchId.value = response.batchId
    autoGradeSummary.value = response.summary || { total: submissionIds.length, processed: rows.length, failed: 0 }
    autoGradePageOpen.value = true
  } catch (error) {
    console.error('Failed to auto grade selected submissions:', error)
    toast.error('Failed to auto grade selected submissions. Please try again.', {
      position: 'top-right',
      duration: 3000,
    })
  } finally {
    isAutoGrading.value = false
  }
}

const submitAutoGradeResults = async () => {
  if (isSubmittingAutoGradeResults.value || autoGradeRows.value.length === 0) return

  const gradedBy = authStore.user?.id || null
  const filteredRows = autoGradeRows.value.filter((row) => hasSubmittedContent(row.submitted))
  if (filteredRows.length === 0) {
    toast.error('No submittable rows found. Empty submissions were excluded.', {
      position: 'top-right',
      duration: 3000,
    })
    return
  }
  const skippedRows = autoGradeRows.value.length - filteredRows.length
  const results = filteredRows.map((row) => ({
    submissionId: row.submissionId,
    score: Math.max(0, Math.min(100, Number(row.score || 0))),
    comment: row.comment || '',
  }))

  if (!gradedBy) {
    toast.error('Missing grader identity. Please login again.', {
      position: 'top-right',
      duration: 3000,
    })
    return
  }

  const payload: SubmissionBulkGradePayload = {
    gradedBy,
    notifyStudent: autoGradeNotifyStudent.value,
    results,
  }

  isSubmittingAutoGradeResults.value = true
  try {
    await gradeLessonSubmission(payload)
    const now = new Date().toISOString()
    const resultsBySubmissionId = new Map(results.map((item) => [item.submissionId, item]))
    submissions.value = submissions.value.map((row) => {
      const graded = resultsBySubmissionId.get(row.id)
      if (!graded) return row
      return {
        ...row,
        grading: {
          ...row.grading,
          assignedScore: graded.score,
          comment: graded.comment,
          gradedBy,
          gradedAt: now,
        },
        notification: autoGradeNotifyStudent.value
          ? {
            ...row.notification,
            notifiedBy: gradedBy,
            notifiedAt: now,
          }
          : row.notification,
      }
    })
    if (selectedSubmission.value) {
      const updated = submissions.value.find((item) => item.id === selectedSubmission.value?.id)
      selectedSubmission.value = updated || selectedSubmission.value
    }
    if (skippedRows > 0) {
      toast.info(`${skippedRows} empty submission(s) were skipped.`, {
        position: 'top-right',
        duration: 3000,
      })
    }
    toast.success(`Saved grades for ${results.length} submission(s).`, {
      position: 'top-right',
      duration: 2500,
    })
    await closeAutoGradePage()
  } catch (error) {
    console.error('Failed to save auto grade results:', error)
    toast.error('Failed to save auto grade results. Please try again.', {
      position: 'top-right',
      duration: 3000,
    })
  } finally {
    isSubmittingAutoGradeResults.value = false
  }
}

const loadSubmissions = async (page?: number | Event) => {
  const targetPage = typeof page === 'number' ? page : currentPage.value
  if (!lessonId.value) {
    loadError.value = 'Missing lesson identifier.'
    return
  }

  isLoading.value = true
  loadError.value = ''
  try {
    const status = resolvedStatusFilter.value || undefined
    const submissionType = typeFilter.value || undefined
    const response = await fetchLessonAssignments(lessonId.value, targetPage, pageLimit.value, {
      status,
      submissionType,
    })
    const rows = response.data
    submissions.value = rows
    submissionsMeta.value = response.meta
    currentPage.value = response.meta.page
    selectedSubmissionIds.value = new Set()
    selectedSubmission.value = rows[0] || null
  } catch (error) {
    console.error('Failed to load lesson submissions:', error)
    loadError.value = 'Failed to fetch submissions from server.'
  } finally {
    isLoading.value = false
  }
}

const goToNextPage = async () => {
  if (!submissionsMeta.value.hasNextPage || isLoading.value) return
  await loadSubmissions(currentPage.value + 1)
}

const goToPreviousPage = async () => {
  if (!submissionsMeta.value.hasPrevPage || isLoading.value) return
  await loadSubmissions(currentPage.value - 1)
}

const onLimitChange = async () => {
  currentPage.value = 1
  await loadSubmissions(1)
}

const saveGrade = async () => {
  if (!selectedSubmission.value || isSavingGrade.value) return
  if (gradeForm.value.assignedScore === null || Number.isNaN(Number(gradeForm.value.assignedScore))) {
    toast.error('Score is required before saving grade.', { position: 'top-right', duration: 2500 })
    return
  }

  isSavingGrade.value = true
  try {
    const gradedBy = authStore.user?.id || null
    await gradeLessonSubmission({
      gradedBy,
      notifyStudent: gradeForm.value.notifyStudent,
      results: [{
        submissionId: selectedSubmission.value.id,
        score: Number(gradeForm.value.assignedScore),
        comment: gradeForm.value.comment || '',
      }],
    })
    selectedSubmission.value.grading.assignedScore = Number(gradeForm.value.assignedScore)
    selectedSubmission.value.grading.comment = gradeForm.value.comment
    selectedSubmission.value.grading.gradedAt = new Date().toISOString()
    selectedSubmission.value.grading.gradedBy = gradedBy
    if (gradeForm.value.notifyStudent) {
      selectedSubmission.value.notification.notifiedBy = gradedBy
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

.pagination-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.pagination-left,
.pagination-right {
  display: inline-flex;
  align-items: center;
  gap: 0.55rem;
}

.pagination-right span {
  font-size: 0.85rem;
  color: var(--theme-text-subtle);
}

.autograde-progress {
  border: 1px solid var(--theme-border);
  background: var(--theme-surface);
  border-radius: 12px;
  padding: 0.75rem;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.7rem;
}

.autograde-progress-copy {
  flex: 1;
}

.autograde-progress-copy p {
  margin: 0 0 0.4rem;
  font-size: 0.85rem;
  color: var(--theme-text-muted);
}

.autograde-progress-bar {
  width: 100%;
  height: 6px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--theme-border) 70%, transparent);
  overflow: hidden;
}

.autograde-progress-bar span {
  display: block;
  width: 35%;
  height: 100%;
  border-radius: 999px;
  background: #0284c7;
  animation: progress-slide 1.1s ease-in-out infinite;
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

.content-indicators {
  margin-top: 0.45rem;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
}

.content-dot {
  width: 20px;
  height: 20px;
  border-radius: 999px;
  border: 1px solid var(--theme-border);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 0.63rem;
  font-weight: 700;
  color: var(--theme-text-subtle);
  background: var(--theme-surface);
}

.content-dot.active {
  background: #dbeafe;
  border-color: #60a5fa;
  color: #1e3a8a;
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

@keyframes progress-slide {
  0% {
    transform: translateX(-120%);
  }
  100% {
    transform: translateX(320%);
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

.autograde-page {
  background: var(--theme-surface);
  color: var(--theme-text);
  border-radius: 14px;
  border: 1px solid var(--theme-border);
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

.autograde-body {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

.autograde-table-wrap {
  border: 1px solid var(--theme-border);
  border-radius: 10px;
  overflow: auto;
  min-height: 0;
  flex: 1;
}

.autograde-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.86rem;
}

.autograde-table th,
.autograde-table td {
  border-bottom: 1px solid var(--theme-border);
  padding: 0.6rem;
  text-align: left;
  vertical-align: top;
}

.autograde-table thead th {
  position: sticky;
  top: 0;
  background: var(--theme-bg);
  z-index: 1;
}

.autograde-score {
  min-width: 90px;
  max-width: 120px;
}

.autograde-comment {
  min-width: 260px;
  min-height: 70px;
}

.submitted-cell {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.submitted-type {
  margin: 0;
  font-size: 0.75rem;
  color: var(--theme-text-subtle);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.submitted-text {
  margin: 0;
  white-space: pre-wrap;
}

.submitted-files {
  margin: 0;
  padding-left: 1rem;
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

  .pagination-toolbar {
    flex-direction: column;
    align-items: flex-start;
  }

  .autograde-comment {
    min-width: 180px;
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
