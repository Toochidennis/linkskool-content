<template>
  <div class="enrolled-users-tab">
    <div class="users-toolbar">
      <div class="users-toolbar-copy">
        <p class="users-toolbar-title">Enrolled learners</p>
        <p class="users-toolbar-subtitle">
          Review who joined this program, what they enrolled in, and how payment is tracking.
        </p>
      </div>

      <button type="button" class="filter-trigger" @click="showFilterModal = true">
        <svg class="filter-trigger-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M3 4a1 1 0 011-1h16a1 1 0 01.8 1.6L14 13.5V19a1 1 0 01-.553.894l-4 2A1 1 0 018 21v-7.5L3.2 4.6A1 1 0 013 4z"
          />
        </svg>
        <span>Filter</span>
        <small v-if="activeFilterCount">{{ activeFilterCount }}</small>
      </button>
    </div>

    <div class="users-stats">
      <article class="stat-card">
        <span class="stat-label">Learners</span>
        <strong class="stat-value">{{ users.length }}</strong>
      </article>
      <article class="stat-card">
        <span class="stat-label">Filtered</span>
        <strong class="stat-value">{{ filteredUsers.length }}</strong>
      </article>
      <article class="stat-card">
        <span class="stat-label">Paid enrollments</span>
        <strong class="stat-value">{{ paidEnrollmentCount }}</strong>
      </article>
      <article class="stat-card">
        <span class="stat-label">Pending enrollments</span>
        <strong class="stat-value">{{ pendingEnrollmentCount }}</strong>
      </article>
    </div>

    <div v-if="isLoading" class="tab-loading-state">
      <div class="tab-loading-spinner"></div>
      <p>Loading enrolled learners...</p>
    </div>

    <div v-else-if="loadError" class="feedback-card error">
      <p class="feedback-title">Unable to load enrolled learners</p>
      <p class="feedback-text">{{ loadError }}</p>
      <button type="button" class="feedback-button" @click="fetchEnrolledUsers">Try again</button>
    </div>

    <div v-else-if="filteredUsers.length" class="users-table-card">
      <div class="users-table-wrap">
        <table class="users-table">
          <thead>
            <tr>
              <th>Learner</th>
              <th>Courses</th>
              <th>Paid</th>
              <th>Outstanding</th>
              <th>Payment status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="user in filteredUsers"
              :key="user.id"
              class="users-row"
              @click="openUserDetails(user)"
            >
              <td>
                <div class="learner-cell">
                  <div class="learner-avatar">
                    <img v-if="user.avatarUrl" :src="user.avatarUrl" :alt="user.fullName" />
                    <span v-else>{{ initials(user.fullName) }}</span>
                  </div>
                  <div class="learner-copy">
                    <p class="learner-name">{{ user.fullName }}</p>
                    <p class="learner-meta">
                      {{ user.email || user.username || 'No contact provided' }}
                    </p>
                  </div>
                </div>
              </td>
              <td>{{ user.totalCourses }}</td>
              <td>{{ user.paidCourses }}</td>
              <td>{{ user.outstandingCourses }}</td>
              <td>
                <span class="payment-pill" :class="user.paymentSummary.tone">
                  {{ user.paymentSummary.label }}
                </span>
              </td>
              <td class="users-row-action">
                <button type="button" class="view-button" @click.stop="openUserDetails(user)">
                  View details
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div v-else class="feedback-card">
      <p class="feedback-title">No learners match the current view</p>
      <p class="feedback-text">
        {{
          props.searchQuery || selectedCourseFilter || selectedPaymentFilter
            ? 'Try clearing your search or filters.'
            : 'No enrolled learners have been returned for this program yet.'
        }}
      </p>
    </div>

    <Transition name="modal">
      <div v-if="showFilterModal" class="modal-overlay" @click.self="showFilterModal = false">
        <div class="filter-modal">
          <div class="modal-header">
            <div>
              <h3 class="modal-title">Filter Enrolled Learners</h3>
              <p class="modal-subtitle">Narrow the list by course and payment status.</p>
            </div>
            <button type="button" class="modal-close" @click="showFilterModal = false">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
            <div class="filter-section">
              <label class="filter-label" for="course-filter">Course</label>
              <select id="course-filter" v-model="selectedCourseFilter" class="filter-select">
                <option value="">All courses</option>
                <option
                  v-for="course in availableCourses"
                  :key="course.value"
                  :value="course.value"
                >
                  {{ course.label }}
                </option>
              </select>
            </div>

            <div class="filter-section">
              <p class="filter-label">Payment status</p>
              <div class="filter-options">
                <label
                  v-for="status in paymentStatusOptions"
                  :key="status.value"
                  class="filter-option"
                >
                  <input
                    v-model="selectedPaymentFilter"
                    type="radio"
                    name="payment-status"
                    :value="status.value"
                  />
                  <span>{{ status.label }}</span>
                </label>
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <button type="button" class="ghost-button" @click="resetFilters">Reset</button>
            <button type="button" class="primary-button" @click="showFilterModal = false">
              Apply
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <Transition name="modal">
      <div v-if="selectedUser" class="modal-overlay" @click.self="selectedUser = null">
        <div class="details-modal">
          <div class="modal-header">
            <div class="details-heading">
              <div class="learner-avatar large">
                <img
                  v-if="selectedUser.avatarUrl"
                  :src="selectedUser.avatarUrl"
                  :alt="selectedUser.fullName"
                />
                <span v-else>{{ initials(selectedUser.fullName) }}</span>
              </div>
              <div>
                <h3 class="modal-title">{{ selectedUser.fullName }}</h3>
                <p class="modal-subtitle">
                  {{ selectedUser.email || selectedUser.username || 'No contact provided' }}
                </p>
              </div>
            </div>
            <button type="button" class="modal-close" @click="selectedUser = null">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <div class="details-summary">
            <article class="summary-card">
              <span class="summary-label">Courses enrolled</span>
              <strong class="summary-value">{{ selectedUser.totalCourses }}</strong>
            </article>
            <article class="summary-card">
              <span class="summary-label">Courses paid for</span>
              <strong class="summary-value">{{ selectedUser.paidCourses }}</strong>
            </article>
            <article class="summary-card">
              <span class="summary-label">Outstanding</span>
              <strong class="summary-value">{{ selectedUser.outstandingCourses }}</strong>
            </article>
          </div>

          <div class="details-list">
            <div class="details-list-header">
              <p>Enrollment details</p>
              <span>{{ selectedUser.courses.length }} entries</span>
            </div>

            <article
              v-for="course in selectedUser.courses"
              :key="course.entryKey"
              class="details-item"
            >
              <div>
                <p class="details-course">{{ course.courseTitle }}</p>
                <p class="details-meta">
                  {{ course.cohortTitle || 'No cohort specified' }}
                  <span v-if="course.enrolledAt">• {{ formatDate(course.enrolledAt) }}</span>
                </p>
              </div>
              <div class="details-payment">
                <span class="payment-pill" :class="paymentTone(course.paymentStatus)">
                  {{ formatPaymentStatus(course.paymentStatus) }}
                </span>
                <p v-if="course.paymentLabel" class="details-amount">{{ course.paymentLabel }}</p>
              </div>
            </article>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useToast } from 'vue-toast-notification'
import { programService } from '@/api/services/serviceFactory'

interface Props {
  programId: number
  searchQuery?: string
}

interface EnrollmentCourseDetail {
  entryKey: string
  courseId: number | null
  courseTitle: string
  cohortTitle: string
  paymentStatus: string
  paymentLabel: string
  enrolledAt: string
}

interface EnrolledUserSummary {
  id: number | string
  fullName: string
  email: string
  username: string
  avatarUrl: string
  courses: EnrollmentCourseDetail[]
  totalCourses: number
  paidCourses: number
  outstandingCourses: number
  paymentSummary: {
    label: string
    tone: string
  }
}

type RawRecord = Record<string, unknown>

const props = withDefaults(defineProps<Props>(), {
  searchQuery: '',
})

const emit = defineEmits<{
  (e: 'update:count', value: number): void
}>()

const toast = useToast()

const users = ref<EnrolledUserSummary[]>([])
const selectedUser = ref<EnrolledUserSummary | null>(null)
const isLoading = ref(false)
const loadError = ref('')
const showFilterModal = ref(false)
const selectedCourseFilter = ref('')
const selectedPaymentFilter = ref('')

const paymentStatusOptions = [
  { value: '', label: 'All payment statuses' },
  { value: 'paid', label: 'Paid' },
  { value: 'partial', label: 'Partially paid' },
  { value: 'pending', label: 'Pending' },
  { value: 'unpaid', label: 'Unpaid' },
  { value: 'failed', label: 'Failed' },
  { value: 'refunded', label: 'Refunded' },
]

const enrolledUsersEndpoints = ['enrollments/users', 'enrollments', 'users', 'students']

const normalizedSearchQuery = computed(() => props.searchQuery.trim().toLowerCase())

const availableCourses = computed(() => {
  const map = new Map<string, string>()

  users.value.forEach((user) => {
    user.courses.forEach((course) => {
      if (course.courseTitle) {
        map.set(String(course.courseId ?? course.courseTitle), course.courseTitle)
      }
    })
  })

  return [...map.entries()]
    .map(([value, label]) => ({ value, label }))
    .sort((a, b) => a.label.localeCompare(b.label))
})

const filteredUsers = computed(() => {
  return users.value.filter((user) => {
    const matchesSearch =
      !normalizedSearchQuery.value ||
      [
        user.fullName,
        user.email,
        user.username,
        ...user.courses.map((course) => course.courseTitle),
      ]
        .join(' ')
        .toLowerCase()
        .includes(normalizedSearchQuery.value)

    const matchesCourse =
      !selectedCourseFilter.value ||
      user.courses.some((course) => {
        const courseKey = String(course.courseId ?? course.courseTitle)
        return courseKey === selectedCourseFilter.value
      })

    const matchesPayment =
      !selectedPaymentFilter.value ||
      user.courses.some(
        (course) => normalizePaymentStatus(course.paymentStatus) === selectedPaymentFilter.value,
      )

    return matchesSearch && matchesCourse && matchesPayment
  })
})

const paidEnrollmentCount = computed(() =>
  users.value.reduce(
    (total, user) =>
      total + user.courses.filter((course) => isPaidStatus(course.paymentStatus)).length,
    0,
  ),
)

const pendingEnrollmentCount = computed(() =>
  users.value.reduce(
    (total, user) =>
      total +
      user.courses.filter((course) =>
        ['pending', 'partial', 'unpaid'].includes(normalizePaymentStatus(course.paymentStatus)),
      ).length,
    0,
  ),
)

const activeFilterCount = computed(() => {
  let total = 0
  if (selectedCourseFilter.value) total += 1
  if (selectedPaymentFilter.value) total += 1
  return total
})

const resetFilters = () => {
  selectedCourseFilter.value = ''
  selectedPaymentFilter.value = ''
}

const fetchEnrolledUsers = async () => {
  if (!props.programId) {
    users.value = []
    emit('update:count', 0)
    return
  }

  isLoading.value = true
  loadError.value = ''

  let lastError: unknown = null

  try {
    for (const endpoint of enrolledUsersEndpoints) {
      try {
        const response = await programService.get(`${props.programId}/${endpoint}`)
        const normalizedUsers = normalizeUsersPayload(response?.data)
        users.value = normalizedUsers
        emit('update:count', normalizedUsers.length)
        return
      } catch (error) {
        lastError = error
      }
    }

    throw lastError || new Error('Failed to load enrolled learners')
  } catch (error) {
    console.error('Failed to fetch enrolled users:', error)
    users.value = []
    emit('update:count', 0)
    loadError.value = extractErrorMessage(error)
    toast.error(loadError.value || 'Failed to load enrolled learners')
  } finally {
    isLoading.value = false
  }
}

const openUserDetails = (user: EnrolledUserSummary) => {
  selectedUser.value = user
}

const normalizeUsersPayload = (payload: unknown): EnrolledUserSummary[] => {
  const list = extractList(payload)
  const groupedUsers = new Map<string, EnrolledUserSummary>()

  list.forEach((item, index) => {
    if (!isRecord(item)) return

    const nestedEntries = extractNestedEnrollmentEntries(item)

    if (nestedEntries.length > 0) {
      nestedEntries.forEach((entry, entryIndex) => {
        appendUserEnrollment(groupedUsers, item, entry, `${index}-${entryIndex}`)
      })
      return
    }

    appendUserEnrollment(groupedUsers, item, item, `${index}`)
  })

  return [...groupedUsers.values()]
    .map((user) => finalizeUserSummary(user))
    .sort((a, b) => a.fullName.localeCompare(b.fullName))
}

const appendUserEnrollment = (
  groupedUsers: Map<string, EnrolledUserSummary>,
  userSource: RawRecord,
  courseSource: RawRecord,
  suffix: string,
) => {
  const userId = getUserId(userSource, courseSource, suffix)
  const existing = groupedUsers.get(userId) || createUserSummary(userSource, courseSource, userId)
  existing.courses.push(normalizeCourseDetail(courseSource, suffix))
  groupedUsers.set(userId, existing)
}

const createUserSummary = (
  userSource: RawRecord,
  courseSource: RawRecord,
  userId: string,
): EnrolledUserSummary => ({
  id: userId,
  fullName: getUserName(userSource, courseSource),
  email: getString(courseSource, ['email']) || getString(userSource, ['email']),
  username: getString(courseSource, ['username']) || getString(userSource, ['username']),
  avatarUrl: resolveAvatarUrl(courseSource) || resolveAvatarUrl(userSource),
  courses: [],
  totalCourses: 0,
  paidCourses: 0,
  outstandingCourses: 0,
  paymentSummary: {
    label: 'Unknown',
    tone: 'unknown',
  },
})

const finalizeUserSummary = (user: EnrolledUserSummary): EnrolledUserSummary => {
  const dedupedCourses = dedupeCourses(user.courses)
  const paidCourses = dedupedCourses.filter((course) => isPaidStatus(course.paymentStatus)).length
  const outstandingCourses = dedupedCourses.length - paidCourses

  return {
    ...user,
    courses: dedupedCourses.sort((a, b) => a.courseTitle.localeCompare(b.courseTitle)),
    totalCourses: dedupedCourses.length,
    paidCourses,
    outstandingCourses,
    paymentSummary: buildPaymentSummary(dedupedCourses),
  }
}

const dedupeCourses = (courses: EnrollmentCourseDetail[]) => {
  const map = new Map<string, EnrollmentCourseDetail>()

  courses.forEach((course) => {
    const key = String(course.courseId ?? course.courseTitle)
      .trim()
      .toLowerCase()
    const current = map.get(key)

    if (!current) {
      map.set(key, course)
      return
    }

    const currentScore = paymentPriority(current.paymentStatus)
    const nextScore = paymentPriority(course.paymentStatus)
    if (nextScore >= currentScore) {
      map.set(key, course)
    }
  })

  return [...map.values()]
}

const normalizeCourseDetail = (source: RawRecord, suffix: string): EnrollmentCourseDetail => {
  const paymentStatus = resolvePaymentStatus(source)
  const amountPaid = resolveAmount(source, ['amountPaid', 'paidAmount', 'paymentAmount', 'paid'])
  const amountDue = resolveAmount(source, ['amountDue', 'price', 'amount', 'cost'])

  return {
    entryKey: `${getString(source, ['id']) || suffix}-${getString(source, ['courseId']) || getString(source, ['courseName']) || suffix}`,
    courseId: getNumber(source, ['courseId']),
    courseTitle: getCourseTitle(source),
    cohortTitle: getString(source, ['cohortTitle', 'cohortName', 'batchName']) || '',
    paymentStatus,
    paymentLabel: formatCurrencyLabel(amountPaid, amountDue, paymentStatus),
    enrolledAt: getString(source, ['enrolledAt', 'createdAt', 'joinedAt', 'paymentDate']) || '',
  }
}

const buildPaymentSummary = (courses: EnrollmentCourseDetail[]) => {
  if (!courses.length) {
    return { label: 'Unknown', tone: 'unknown' }
  }

  const statuses = courses.map((course) => normalizePaymentStatus(course.paymentStatus))

  if (statuses.every((status) => status === 'paid')) {
    return { label: 'Fully paid', tone: 'paid' }
  }

  if (statuses.some((status) => status === 'partial')) {
    return { label: 'Partially paid', tone: 'partial' }
  }

  if (statuses.some((status) => status === 'failed')) {
    return { label: 'Payment issue', tone: 'failed' }
  }

  if (statuses.some((status) => status === 'pending')) {
    return { label: 'Pending payment', tone: 'pending' }
  }

  if (statuses.some((status) => status === 'unpaid')) {
    return { label: 'Unpaid', tone: 'unpaid' }
  }

  if (statuses.some((status) => status === 'refunded')) {
    return { label: 'Refunded', tone: 'refunded' }
  }

  return { label: formatPaymentStatus(statuses[0] || 'unknown'), tone: statuses[0] || 'unknown' }
}

const extractNestedEnrollmentEntries = (record: RawRecord): RawRecord[] => {
  const keys = ['courses', 'enrollments', 'items', 'payments', 'programCourses']

  for (const key of keys) {
    const value = record[key]
    if (Array.isArray(value)) {
      return value.filter(isRecord)
    }
  }

  return []
}

const extractList = (payload: unknown): RawRecord[] => {
  if (Array.isArray(payload)) {
    return payload.filter(isRecord)
  }

  if (!isRecord(payload)) {
    return []
  }

  const candidates = ['users', 'enrollments', 'items', 'data', 'results', 'students']

  for (const key of candidates) {
    const value = payload[key]
    if (Array.isArray(value)) {
      return value.filter(isRecord)
    }
  }

  return []
}

const getUserId = (userSource: RawRecord, courseSource: RawRecord, fallback: string) => {
  const nestedUser = getRecord(userSource.user) || getRecord(courseSource.user)
  const idCandidate =
    getNumber(nestedUser, ['id']) ||
    getNumber(userSource, ['userId', 'studentId', 'learnerId', 'id']) ||
    getNumber(courseSource, ['userId', 'studentId', 'learnerId'])

  return String(idCandidate || fallback)
}

const getUserName = (userSource: RawRecord, courseSource: RawRecord) => {
  const nestedUser = getRecord(userSource.user) || getRecord(courseSource.user)
  const fullName =
    getString(nestedUser, ['fullName', 'name']) ||
    getString(userSource, ['fullName', 'name']) ||
    getString(courseSource, ['fullName', 'name'])

  if (fullName) return fullName

  const firstName =
    getString(nestedUser, ['firstName']) ||
    getString(userSource, ['firstName']) ||
    getString(courseSource, ['firstName'])
  const lastName =
    getString(nestedUser, ['lastName']) ||
    getString(userSource, ['lastName']) ||
    getString(courseSource, ['lastName'])
  const joinedName = [firstName, lastName].filter(Boolean).join(' ').trim()

  return (
    joinedName ||
    getString(userSource, ['email', 'username']) ||
    getString(courseSource, ['email', 'username']) ||
    'Unnamed learner'
  )
}

const getCourseTitle = (source: RawRecord) => {
  const course = getRecord(source.course)
  return (
    getString(course, ['title', 'name']) ||
    getString(source, ['courseTitle', 'courseName', 'title', 'name']) ||
    'Untitled course'
  )
}

const resolvePaymentStatus = (source: RawRecord) => {
  const payment = getRecord(source.payment)
  const rawStatus =
    getString(payment, ['status']) ||
    getString(source, ['paymentStatus', 'paymentState', 'billingStatus']) ||
    ''

  if (rawStatus) {
    return normalizePaymentStatus(rawStatus)
  }

  const isPaid = source.isPaid
  if (typeof isPaid === 'boolean') {
    return isPaid ? 'paid' : 'unpaid'
  }

  return 'unknown'
}

const normalizePaymentStatus = (value: string) => {
  const status = value.toLowerCase().trim()

  if (['paid', 'successful', 'success', 'completed'].includes(status)) return 'paid'
  if (['partial', 'partially_paid', 'partially paid'].includes(status)) return 'partial'
  if (['pending', 'processing', 'initiated'].includes(status)) return 'pending'
  if (['unpaid', 'not_paid', 'due'].includes(status)) return 'unpaid'
  if (['failed', 'declined'].includes(status)) return 'failed'
  if (['refunded'].includes(status)) return 'refunded'

  return status || 'unknown'
}

const formatPaymentStatus = (value: string) => {
  const normalized = normalizePaymentStatus(value)
  if (normalized === 'paid') return 'Paid'
  if (normalized === 'partial') return 'Partially paid'
  if (normalized === 'pending') return 'Pending'
  if (normalized === 'unpaid') return 'Unpaid'
  if (normalized === 'failed') return 'Failed'
  if (normalized === 'refunded') return 'Refunded'
  if (normalized === 'unknown') return 'Unknown'
  return normalized.charAt(0).toUpperCase() + normalized.slice(1)
}

const paymentTone = (value: string) => normalizePaymentStatus(value)

const paymentPriority = (value: string) => {
  const status = normalizePaymentStatus(value)
  if (status === 'paid') return 5
  if (status === 'partial') return 4
  if (status === 'pending') return 3
  if (status === 'unpaid') return 2
  if (status === 'failed') return 1
  return 0
}

const isPaidStatus = (value: string) => normalizePaymentStatus(value) === 'paid'

const resolveAmount = (source: RawRecord, keys: string[]) => {
  const nestedPayment = getRecord(source.payment)
  return getNumber(source, keys) || getNumber(nestedPayment, keys)
}

const formatCurrencyLabel = (
  amountPaid: number | null,
  amountDue: number | null,
  paymentStatus: string,
) => {
  if (amountPaid && amountDue) {
    return `${formatCurrency(amountPaid)} of ${formatCurrency(amountDue)}`
  }

  if (amountPaid) {
    return `${formatCurrency(amountPaid)} paid`
  }

  if (amountDue && normalizePaymentStatus(paymentStatus) !== 'paid') {
    return `${formatCurrency(amountDue)} due`
  }

  return ''
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0,
  }).format(value)
}

const resolveAvatarUrl = (source?: RawRecord | null) => {
  if (!source) return ''
  const value = getString(source, ['avatarUrl', 'pictureRef', 'picture', 'imageUrl'])
  if (!value) return ''
  if (value.startsWith('http') || value.startsWith('data:')) return value
  return `${import.meta.env.VITE_ASSETS_BASE_URL}/${value}`
}

const getRecord = (value: unknown): RawRecord | null => (isRecord(value) ? value : null)

const getString = (source: RawRecord | null | undefined, keys: string[]) => {
  if (!source) return ''
  for (const key of keys) {
    const value = source[key]
    if (typeof value === 'string' && value.trim()) {
      return value.trim()
    }
  }
  return ''
}

const getNumber = (source: RawRecord | null | undefined, keys: string[]) => {
  if (!source) return null
  for (const key of keys) {
    const value = source[key]
    if (typeof value === 'number' && Number.isFinite(value)) {
      return value
    }
    if (typeof value === 'string' && value.trim() !== '') {
      const parsed = Number(value)
      if (Number.isFinite(parsed)) {
        return parsed
      }
    }
  }
  return null
}

const isRecord = (value: unknown): value is RawRecord =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const initials = (value: string) =>
  value
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('')

const formatDate = (value: string) => {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Date unavailable'
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

const extractErrorMessage = (error: unknown) => {
  if (error && typeof error === 'object') {
    const maybeError = error as {
      response?: { data?: { message?: string } }
      message?: string
    }

    return (
      maybeError.response?.data?.message || maybeError.message || 'Failed to load enrolled learners'
    )
  }

  return 'Failed to load enrolled learners'
}

watch(
  () => props.programId,
  () => {
    resetFilters()
    selectedUser.value = null
    fetchEnrolledUsers()
  },
)

onMounted(() => {
  fetchEnrolledUsers()
})
</script>

<style scoped>
.enrolled-users-tab {
  animation: fade-in-up 0.35s ease-out;
}

.users-toolbar {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1rem;
}

.users-toolbar-title {
  margin: 0 0 0.2rem;
  color: #0f172a;
  font-size: 1rem;
  font-weight: 800;
}

.users-toolbar-subtitle {
  margin: 0;
  color: #64748b;
  font-size: 0.88rem;
}

.filter-trigger {
  display: inline-flex;
  align-items: center;
  gap: 0.55rem;
  border: 1px solid #cbd5e1;
  background: #fff;
  color: #0f172a;
  padding: 0.72rem 0.95rem;
  border-radius: 0.85rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
}

.filter-trigger:hover {
  border-color: #4f46e5;
  color: #4338ca;
  box-shadow: 0 12px 26px rgba(79, 70, 229, 0.12);
}

.filter-trigger-icon {
  width: 1rem;
  height: 1rem;
}

.filter-trigger small {
  min-width: 1.2rem;
  padding: 0.1rem 0.38rem;
  border-radius: 999px;
  background: #4f46e5;
  color: #fff;
  font-size: 0.72rem;
  text-align: center;
}

.users-stats {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.9rem;
  margin-bottom: 1rem;
}

.stat-card,
.summary-card {
  border: 1px solid #dbe3ee;
  border-radius: 1rem;
  background: linear-gradient(180deg, #fff 0%, #f8fafc 100%);
  padding: 1rem;
}

.stat-label,
.summary-label {
  display: block;
  color: #64748b;
  font-size: 0.8rem;
  font-weight: 600;
  margin-bottom: 0.35rem;
}

.stat-value,
.summary-value {
  color: #0f172a;
  font-size: 1.55rem;
  font-weight: 800;
}

.users-table-card,
.feedback-card {
  border: 1px solid #dbe3ee;
  border-radius: 1rem;
  background: #fff;
}

.users-table-wrap {
  overflow-x: auto;
}

.users-table {
  width: 100%;
  border-collapse: collapse;
}

.users-table th,
.users-table td {
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid #eef2f7;
}

.users-table th {
  color: #64748b;
  font-size: 0.76rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.users-row {
  cursor: pointer;
  transition: background 0.2s ease;
}

.users-row:hover {
  background: #f8fafc;
}

.users-row:last-child td {
  border-bottom: none;
}

.learner-cell {
  display: flex;
  align-items: center;
  gap: 0.85rem;
}

.learner-avatar {
  width: 2.75rem;
  height: 2.75rem;
  border-radius: 999px;
  background: linear-gradient(135deg, #4f46e5, #2563eb);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  overflow: hidden;
  flex-shrink: 0;
}

.learner-avatar.large {
  width: 3.5rem;
  height: 3.5rem;
}

.learner-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.learner-name,
.details-course {
  margin: 0;
  color: #0f172a;
  font-weight: 800;
}

.learner-meta,
.details-meta,
.details-amount {
  margin: 0.2rem 0 0;
  color: #64748b;
  font-size: 0.82rem;
}

.users-row-action {
  text-align: right;
}

.view-button,
.feedback-button,
.primary-button,
.ghost-button {
  border-radius: 0.75rem;
  padding: 0.7rem 0.95rem;
  font-size: 0.84rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
}

.view-button,
.ghost-button {
  border: 1px solid #cbd5e1;
  background: #fff;
  color: #0f172a;
}

.view-button:hover,
.ghost-button:hover {
  border-color: #4f46e5;
  color: #4338ca;
}

.primary-button,
.feedback-button {
  border: 1px solid #4338ca;
  background: linear-gradient(135deg, #4f46e5, #4338ca);
  color: #fff;
}

.feedback-card {
  padding: 2rem;
  text-align: center;
}

.feedback-card.error {
  border-color: #fecaca;
  background: #fff7f7;
}

.feedback-title {
  margin: 0 0 0.4rem;
  color: #0f172a;
  font-size: 1rem;
  font-weight: 800;
}

.feedback-text {
  margin: 0 0 1rem;
  color: #64748b;
}

.tab-loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.7rem;
  padding: 3rem 1.5rem;
  color: #64748b;
}

.tab-loading-spinner {
  width: 2rem;
  height: 2rem;
  border: 3px solid #dbeafe;
  border-top-color: #4f46e5;
  border-radius: 999px;
  animation: spin 0.8s linear infinite;
}

.payment-pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  padding: 0.3rem 0.62rem;
  font-size: 0.74rem;
  font-weight: 800;
  text-transform: capitalize;
}

.payment-pill.paid {
  color: #166534;
  background: #dcfce7;
}

.payment-pill.partial {
  color: #92400e;
  background: #fef3c7;
}

.payment-pill.pending {
  color: #1d4ed8;
  background: #dbeafe;
}

.payment-pill.unpaid,
.payment-pill.failed {
  color: #b91c1c;
  background: #fee2e2;
}

.payment-pill.refunded {
  color: #6d28d9;
  background: #ede9fe;
}

.payment-pill.unknown {
  color: #475569;
  background: #e2e8f0;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.25rem;
  z-index: 70;
}

.filter-modal,
.details-modal {
  width: min(100%, 42rem);
  border-radius: 1.15rem;
  background: #fff;
  box-shadow: 0 28px 60px rgba(15, 23, 42, 0.22);
}

.details-modal {
  width: min(100%, 56rem);
}

.modal-header,
.modal-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1.1rem 1.2rem;
}

.modal-header {
  border-bottom: 1px solid #eef2f7;
}

.modal-footer {
  border-top: 1px solid #eef2f7;
}

.modal-title {
  margin: 0;
  color: #0f172a;
  font-size: 1.1rem;
  font-weight: 800;
}

.modal-subtitle {
  margin: 0.24rem 0 0;
  color: #64748b;
  font-size: 0.85rem;
}

.modal-close {
  border: none;
  background: transparent;
  color: #64748b;
  cursor: pointer;
}

.modal-body {
  padding: 1.2rem;
}

.filter-section + .filter-section {
  margin-top: 1rem;
}

.filter-label {
  display: block;
  margin: 0 0 0.55rem;
  color: #334155;
  font-weight: 700;
}

.filter-select {
  width: 100%;
  border: 1px solid #cbd5e1;
  border-radius: 0.8rem;
  padding: 0.8rem 0.9rem;
  color: #0f172a;
}

.filter-options {
  display: grid;
  gap: 0.7rem;
}

.filter-option {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.8rem;
  padding: 0.8rem 0.9rem;
  color: #334155;
}

.details-heading {
  display: flex;
  align-items: center;
  gap: 0.9rem;
}

.details-summary {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.9rem;
  padding: 1.2rem;
}

.details-list {
  padding: 0 1.2rem 1.2rem;
}

.details-list-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.8rem;
  color: #475569;
  font-size: 0.84rem;
  font-weight: 700;
}

.details-list-header p {
  margin: 0;
  color: #0f172a;
}

.details-item {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.95rem 0;
  border-top: 1px solid #eef2f7;
}

.details-payment {
  text-align: right;
}

.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.22s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

@keyframes fade-in-up {
  from {
    opacity: 0;
    transform: translateY(16px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 900px) {
  .users-stats,
  .details-summary {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 768px) {
  .users-toolbar,
  .modal-header,
  .modal-footer,
  .details-item {
    flex-direction: column;
    align-items: stretch;
  }

  .filter-trigger {
    width: 100%;
    justify-content: center;
  }

  .users-stats,
  .details-summary {
    grid-template-columns: 1fr;
  }

  .users-table th,
  .users-table td {
    padding: 0.85rem 0.75rem;
  }

  .users-row-action,
  .details-payment {
    text-align: left;
  }
}
</style>
