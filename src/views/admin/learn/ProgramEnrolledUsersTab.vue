<template>
  <div class="enrolled-users-tab">
    <div class="users-toolbar">
      <div class="users-toolbar-copy">
        <p class="users-toolbar-title">Enrolled learners</p>
      </div>

      <button type="button" class="filter-trigger" @click="showFilterModal = true">
        <svg class="filter-trigger-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M3 4a1 1 0 011-1h16a1 1 0 01.8 1.6L14 13.5V19a1 1 0 01-.553.894l-4 2A1 1 0 018 21v-7.5L3.2 4.6A1 1 0 013 4z" />
        </svg>
        <span>Filter</span>
        <small v-if="activeFilterCount">{{ activeFilterCount }}</small>
      </button>
    </div>

    <div v-if="summary" class="users-stats">
      <article class="stat-card">
        <span class="stat-label">Profiles</span>
        <strong class="stat-value">{{ formatNumber(summary.totalProfiles) }}</strong>
      </article>
      <article class="stat-card">
        <span class="stat-label">Enrollments</span>
        <strong class="stat-value">{{ formatNumber(summary.totalEnrollments) }}</strong>
      </article>
      <article class="stat-card">
        <span class="stat-label">Successful payments</span>
        <strong class="stat-value">{{ formatNumber(summary.totalSuccessfulPayments) }}</strong>
      </article>
      <article class="stat-card">
        <span class="stat-label">Amount paid</span>
        <strong class="stat-value">{{
          formatMoney(summary.totalAmountPaid, summary.currency)
        }}</strong>
      </article>
      <article class="stat-card">
        <span class="stat-label">Payment conversion</span>
        <strong class="stat-value">{{ formatPercent(paymentConversionRate) }}</strong>
      </article>
    </div>

    <div v-if="activeFilterCount || normalizedSearchQuery" class="active-filters">
      <span class="active-filters-label">Active:</span>

      <button v-if="normalizedSearchQuery" type="button" class="filter-chip" @click="clearSearch">
        Search: {{ normalizedSearchQuery }}
      </button>

      <button v-if="filters.courseId" type="button" class="filter-chip" @click="removeFilter('courseId')">
        Course: {{ selectedCourseName }}
      </button>

      <button v-if="filters.paymentStatus" type="button" class="filter-chip" @click="removeFilter('paymentStatus')">
        Payment: {{ humanize(filters.paymentStatus) }}
      </button>

      <button v-if="filters.enrollmentStatus" type="button" class="filter-chip"
        @click="removeFilter('enrollmentStatus')">
        Enrollment: {{ humanize(filters.enrollmentStatus) }}
      </button>

      <button v-if="filters.enrollmentType" type="button" class="filter-chip" @click="removeFilter('enrollmentType')">
        Type: {{ humanize(filters.enrollmentType) }}
      </button>

      <button type="button" class="filter-chip reset" @click="clearAllState">Clear all</button>
    </div>

    <div v-if="isLoadingProfiles" class="tab-loading-state">
      <div class="tab-loading-spinner"></div>
      <p>Loading enrolled learners...</p>
    </div>

    <div v-else-if="loadError" class="feedback-card error">
      <p class="feedback-title">Unable to load enrolled learners</p>
      <p class="feedback-text">{{ loadError }}</p>
      <button type="button" class="feedback-button" @click="fetchProfiles()">Try again</button>
    </div>

    <div v-else-if="sortedProfiles.length" class="profiles-table-wrap">
      <div class="profiles-table">
        <div class="table-head">
          <button type="button" class="th sortable" @click="setSort('name')">
            Learner {{ renderSortIndicator('name') }}
          </button>
          <button type="button" class="th sortable" @click="setSort('enrollments')">
            Enrollments {{ renderSortIndicator('enrollments') }}
          </button>
          <button type="button" class="th sortable" @click="setSort('successfulPayments')">
            Successful {{ renderSortIndicator('successfulPayments') }}
          </button>
          <button type="button" class="th sortable" @click="setSort('amountPaid')">
            Amount paid {{ renderSortIndicator('amountPaid') }}
          </button>
          <div class="th actions">Action</div>
        </div>

        <template v-for="profile in sortedProfiles" :key="profile.profileId">
          <article class="table-row" :class="{ expanded: isExpanded(profile.profileId) }">
            <div class="td learner-cell">
              <button type="button" class="expand-button" @click="toggleExpanded(profile.profileId)">
                {{ isExpanded(profile.profileId) ? '−' : '+' }}
              </button>
              <div class="profile-avatar">{{ initials(profile.firstName, profile.lastName) }}</div>
              <div class="profile-copy">
                <h3 class="profile-name">{{ fullName(profile.firstName, profile.lastName) }}</h3>
                <p class="profile-meta-inline">{{ profile.email || 'No email provided' }}</p>
              </div>
            </div>
            <div class="td" data-label="Enrollments">{{ formatNumber(profile.summary.totalEnrollments) }}</div>
            <div class="td" data-label="Successful">{{ formatNumber(profile.summary.totalSuccessfulPayments) }}</div>
            <div class="td" data-label="Amount paid">
              {{ formatMoney(profile.summary.totalAmountPaid, profile.summary.currency) }}
            </div>
            <div class="td actions" data-label="Action">
              <button type="button" class="view-button" @click="handleViewDetails(profile)">
                View details
              </button>
            </div>
          </article>

          <div v-if="isExpanded(profile.profileId)" class="expanded-row">
            <div class="expanded-grid">
              <div class="metric-item">
                <span class="metric-label">Phone</span>
                <strong class="metric-value">{{ profile.phone || 'No phone provided' }}</strong>
              </div>
              <div class="metric-item">
                <span class="metric-label">Payment attempts</span>
                <strong class="metric-value">
                  {{ formatNumber(profile.summary.totalPaymentAttempts) }}
                </strong>
              </div>
              <div class="metric-item">
                <span class="metric-label">Pending payments</span>
                <strong class="metric-value">
                  {{ formatNumber(profile.summary.totalPendingPayments) }}
                </strong>
              </div>
              <div class="metric-item">
                <span class="metric-label">Abandoned payments</span>
                <strong class="metric-value">
                  {{ formatNumber(profile.summary.totalAbandonedPayments) }}
                </strong>
              </div>
              <div class="metric-item">
                <span class="metric-label">Payment conversion</span>
                <strong class="metric-value">
                  {{
                    formatPercent(
                      profile.summary.totalPaymentAttempts
                        ? profile.summary.totalSuccessfulPayments /
                        profile.summary.totalPaymentAttempts
                        : 0,
                    )
                  }}
                </strong>
              </div>
            </div>
          </div>
        </template>
      </div>
    </div>

    <div v-else class="feedback-card">
      <p class="feedback-title">No learners found</p>
      <p class="feedback-text">
        {{
          normalizedSearchQuery
            ? 'No profiles match your search on this page. Try another search or clear filters.'
            : 'No profiles were returned for the selected filter combination.'
        }}
      </p>
    </div>

    <div v-if="meta" class="pagination-bar">
      <div class="pagination-summary">
        <span>Page {{ meta.currentPage }} of {{ meta.lastPage }}</span>
        <span>{{ formatNumber(meta.total) }} total profiles</span>
      </div>

      <div class="pagination-actions">
        <label class="limit-select-wrap">
          <span>Rows</span>
          <select v-model.number="filters.limit" class="limit-select" @change="handleLimitChange">
            <option :value="10">10</option>
            <option :value="25">25</option>
            <option :value="50">50</option>
            <option :value="100">100</option>
          </select>
        </label>

        <button type="button" class="page-button" :disabled="!meta.hasPrev || isLoadingProfiles"
          @click="changePage(meta.currentPage - 1)">
          Previous
        </button>
        <button type="button" class="page-button primary" :disabled="!meta.hasNext || isLoadingProfiles"
          @click="changePage(meta.currentPage + 1)">
          Next
        </button>
      </div>
    </div>

    <Transition name="modal">
      <div v-if="showFilterModal" class="modal-overlay" @click.self="closeFilterModal">
        <div class="filter-modal">
          <div class="modal-header">
            <div>
              <h3 class="modal-title">Filter Enrolled Learners</h3>
              <p class="modal-subtitle">Each filter applies a fresh request to the server.</p>
            </div>
            <button type="button" class="modal-close" @click="closeFilterModal">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div class="modal-body">
            <div class="filter-section">
              <label class="filter-label" for="course-filter">Course</label>
              <select id="course-filter" v-model.number="draftFilters.courseId" class="filter-select">
                <option :value="null">All courses</option>
                <option v-for="course in filterOptions.courses" :key="course.id" :value="course.id">
                  {{ course.name }}
                </option>
              </select>
            </div>

            <div class="filter-grid">
              <div class="filter-section">
                <label class="filter-label" for="payment-status-filter">Payment status</label>
                <select id="payment-status-filter" v-model="draftFilters.paymentStatus" class="filter-select">
                  <option value="">All payment statuses</option>
                  <option v-for="status in filterOptions.paymentStatuses" :key="status" :value="status">
                    {{ humanize(status) }}
                  </option>
                </select>
              </div>

              <div class="filter-section">
                <label class="filter-label" for="enrollment-status-filter">Enrollment status</label>
                <select id="enrollment-status-filter" v-model="draftFilters.enrollmentStatus" class="filter-select">
                  <option value="">All enrollment statuses</option>
                  <option v-for="status in filterOptions.enrollmentStatuses" :key="status" :value="status">
                    {{ humanize(status) }}
                  </option>
                </select>
              </div>

              <div class="filter-section">
                <label class="filter-label" for="enrollment-type-filter">Enrollment type</label>
                <select id="enrollment-type-filter" v-model="draftFilters.enrollmentType" class="filter-select">
                  <option value="">All enrollment types</option>
                  <option v-for="type in filterOptions.enrollmentTypes" :key="type" :value="type">
                    {{ humanize(type) }}
                  </option>
                </select>
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <button type="button" class="ghost-button" @click="resetFilters">Reset</button>
            <button type="button" class="primary-button" @click="applyFilters">
              Apply filters
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type {
  ProgramEnrollmentAnalysisFilterOptions,
  ProgramEnrollmentAnalysisParams,
  ProgramEnrollmentAnalysisProfile,
  ProgramEnrollmentAnalysisSummary,
} from '@/composables/useProgramEnrollmentAnalysis'
import { useProgramEnrollmentAnalysis } from '@/composables/useProgramEnrollmentAnalysis'

interface Props {
  programId: number
  searchQuery?: string
}

const props = defineProps<Props>()
const router = useRouter()
const route = useRoute()

const emit = defineEmits<{
  (e: 'update:count', value: number): void
}>()

const {
  payload,
  isLoadingProfiles,
  fetchEnrollmentProfiles,
} = useProgramEnrollmentAnalysis()

const showFilterModal = ref(false)
const loadError = ref('')

const filters = reactive<
  Required<Omit<ProgramEnrollmentAnalysisParams, 'cohortId'>> & { cohortId: number | null }
>({
  page: 1,
  limit: 25,
  courseId: null,
  cohortId: null,
  paymentStatus: '',
  enrollmentStatus: '',
  enrollmentType: '',
})

const draftFilters = reactive({
  courseId: null as number | null,
  paymentStatus: '',
  enrollmentStatus: '',
  enrollmentType: '',
})

const profiles = computed(() => payload.value.profiles)
const normalizedSearchQuery = computed(() => (props.searchQuery || '').trim().toLowerCase())
const filteredProfiles = computed(() => {
  if (!normalizedSearchQuery.value) return profiles.value

  return profiles.value.filter((profile) => {
    const name = fullName(profile.firstName, profile.lastName).toLowerCase()
    const email = (profile.email || '').toLowerCase()
    const phone = (profile.phone || '').toLowerCase()
    return (
      name.includes(normalizedSearchQuery.value) ||
      email.includes(normalizedSearchQuery.value) ||
      phone.includes(normalizedSearchQuery.value)
    )
  })
})
const summary = computed<ProgramEnrollmentAnalysisSummary | null>(() => payload.value.summary)
const filterOptions = computed<ProgramEnrollmentAnalysisFilterOptions>(
  () => payload.value.filterOptions,
)
const meta = computed(() => payload.value.meta)

const activeFilterCount = computed(() => {
  let count = 0
  if (filters.courseId) count += 1
  if (filters.paymentStatus) count += 1
  if (filters.enrollmentStatus) count += 1
  if (filters.enrollmentType) count += 1
  return count
})

type SortKey = 'name' | 'enrollments' | 'successfulPayments' | 'amountPaid'

const sortBy = ref<SortKey>('amountPaid')
const sortDirection = ref<'asc' | 'desc'>('desc')
const expandedProfileIds = ref<number[]>([])

const paymentConversionRate = computed(() => {
  if (!summary.value?.totalPaymentAttempts) return 0
  return summary.value.totalSuccessfulPayments / summary.value.totalPaymentAttempts
})

const sortedProfiles = computed(() => {
  const sorted = [...filteredProfiles.value]

  sorted.sort((a, b) => {
    let aValue: number | string = ''
    let bValue: number | string = ''

    if (sortBy.value === 'name') {
      aValue = fullName(a.firstName, a.lastName).toLowerCase()
      bValue = fullName(b.firstName, b.lastName).toLowerCase()
    }

    if (sortBy.value === 'enrollments') {
      aValue = a.summary.totalEnrollments
      bValue = b.summary.totalEnrollments
    }

    if (sortBy.value === 'successfulPayments') {
      aValue = a.summary.totalSuccessfulPayments
      bValue = b.summary.totalSuccessfulPayments
    }

    if (sortBy.value === 'amountPaid') {
      aValue = a.summary.totalAmountPaid
      bValue = b.summary.totalAmountPaid
    }

    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortDirection.value === 'asc'
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue)
    }

    const diff = Number(aValue) - Number(bValue)
    return sortDirection.value === 'asc' ? diff : -diff
  })

  return sorted
})

const selectedCourseName = computed(() => {
  if (!filters.courseId) return 'Course'
  return filterOptions.value.courses.find((course) => course.id === filters.courseId)?.name || 'Course'
})

const setSort = (key: SortKey) => {
  if (sortBy.value === key) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
    return
  }

  sortBy.value = key
  sortDirection.value = key === 'name' ? 'asc' : 'desc'
}

const renderSortIndicator = (key: SortKey) => {
  if (sortBy.value !== key) return '↕'
  return sortDirection.value === 'asc' ? '↑' : '↓'
}

const isExpanded = (profileId: number) => expandedProfileIds.value.includes(profileId)

const toggleExpanded = (profileId: number) => {
  if (isExpanded(profileId)) {
    expandedProfileIds.value = expandedProfileIds.value.filter((id) => id !== profileId)
    return
  }
  expandedProfileIds.value = [...expandedProfileIds.value, profileId]
}

const syncDraftFilters = () => {
  draftFilters.courseId = filters.courseId
  draftFilters.paymentStatus = filters.paymentStatus
  draftFilters.enrollmentStatus = filters.enrollmentStatus
  draftFilters.enrollmentType = filters.enrollmentType
}

const fetchProfiles = async () => {
  if (!props.programId) return

  loadError.value = ''

  try {
    const data = await fetchEnrollmentProfiles(props.programId, {
      page: filters.page,
      limit: filters.limit,
      courseId: filters.courseId,
      cohortId: filters.cohortId,
      paymentStatus: filters.paymentStatus,
      enrollmentStatus: filters.enrollmentStatus,
      enrollmentType: filters.enrollmentType,
    })

    emit('update:count', data.meta?.total ?? data.profiles.length)
    syncStateToQuery()
  } catch (error) {
    const maybeError = error as { response?: { data?: { message?: string } }; message?: string }
    loadError.value =
      maybeError?.response?.data?.message ||
      maybeError?.message ||
      'Failed to load enrollment analysis profiles'
    emit('update:count', 0)
  }
}

const getSingleQueryValue = (value: unknown): string => {
  if (Array.isArray(value)) return String(value[0] || '')
  return String(value || '')
}

const hydrateFiltersFromQuery = () => {
  const qPage = Number(getSingleQueryValue(route.query.usersPage))
  const qLimit = Number(getSingleQueryValue(route.query.usersLimit))
  const qCourseId = Number(getSingleQueryValue(route.query.usersCourseId))

  filters.page = Number.isFinite(qPage) && qPage > 0 ? qPage : 1
  filters.limit = Number.isFinite(qLimit) && qLimit > 0 ? qLimit : 25
  filters.courseId = Number.isFinite(qCourseId) && qCourseId > 0 ? qCourseId : null
  filters.paymentStatus = getSingleQueryValue(route.query.usersPaymentStatus)
  filters.enrollmentStatus = getSingleQueryValue(route.query.usersEnrollmentStatus)
  filters.enrollmentType = getSingleQueryValue(route.query.usersEnrollmentType)
}

const syncStateToQuery = () => {
  const nextQuery = {
    ...route.query,
    tab: 'users',
    usersPage: String(filters.page),
    usersLimit: String(filters.limit),
    usersCourseId: filters.courseId ? String(filters.courseId) : undefined,
    usersPaymentStatus: filters.paymentStatus || undefined,
    usersEnrollmentStatus: filters.enrollmentStatus || undefined,
    usersEnrollmentType: filters.enrollmentType || undefined,
  }

  router.replace({ query: nextQuery })
}

const applyFilters = async () => {
  filters.page = 1
  filters.courseId = draftFilters.courseId
  filters.paymentStatus = draftFilters.paymentStatus
  filters.enrollmentStatus = draftFilters.enrollmentStatus
  filters.enrollmentType = draftFilters.enrollmentType
  showFilterModal.value = false
  await fetchProfiles()
}

const resetFilters = async () => {
  filters.page = 1
  filters.courseId = null
  filters.cohortId = null
  filters.paymentStatus = ''
  filters.enrollmentStatus = ''
  filters.enrollmentType = ''
  syncDraftFilters()
  showFilterModal.value = false
  await fetchProfiles()
}

const removeFilter = async (
  key: 'courseId' | 'paymentStatus' | 'enrollmentStatus' | 'enrollmentType',
) => {
  filters.page = 1

  if (key === 'courseId') filters.courseId = null
  if (key === 'paymentStatus') filters.paymentStatus = ''
  if (key === 'enrollmentStatus') filters.enrollmentStatus = ''
  if (key === 'enrollmentType') filters.enrollmentType = ''

  syncDraftFilters()
  await fetchProfiles()
}

const clearSearch = async () => {
  await router.replace({
    query: {
      ...route.query,
      q: undefined,
    },
  })
}

const clearAllState = async () => {
  await clearSearch()
  await resetFilters()
}

const closeFilterModal = () => {
  syncDraftFilters()
  showFilterModal.value = false
}

const changePage = async (page: number) => {
  if (!meta.value) return
  if (page < 1 || page > meta.value.lastPage || page === filters.page) return
  filters.page = page
  await fetchProfiles()
}

const handleLimitChange = async () => {
  filters.page = 1
  await fetchProfiles()
}

const handleViewDetails = async (profile: ProgramEnrollmentAnalysisProfile) => {
  await router.push({
    name: 'Program Enrollment Profile',
    params: {
      programId: String(props.programId),
      profileId: String(profile.profileId),
    },
    query: {
      programSlug: payload.value.program?.slug || '',
      programName: payload.value.program?.name || '',
      tab: 'users',
      q: props.searchQuery || undefined,
      usersPage: String(filters.page),
      usersLimit: String(filters.limit),
      usersCourseId: filters.courseId ? String(filters.courseId) : undefined,
      usersPaymentStatus: filters.paymentStatus || undefined,
      usersEnrollmentStatus: filters.enrollmentStatus || undefined,
      usersEnrollmentType: filters.enrollmentType || undefined,
    },
  })
}

const initials = (firstName: string, lastName: string) =>
  `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase()

const fullName = (firstName: string, lastName: string) =>
  [firstName, lastName].filter(Boolean).join(' ').trim() || 'Unnamed profile'

const humanize = (value: string) =>
  value.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase())

const formatNumber = (value: number) => new Intl.NumberFormat('en-NG').format(value || 0)

const formatMoney = (value: number, currency = 'NGN') =>
  new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: currency || 'NGN',
    maximumFractionDigits: 0,
  }).format(value || 0)

const formatPercent = (value: number) => `${Math.round((value || 0) * 100)}%`

watch(
  () => props.programId,
  async () => {
    filters.page = 1
    syncDraftFilters()
    await fetchProfiles()
  },
)

onMounted(async () => {
  hydrateFiltersFromQuery()
  syncDraftFilters()
  await fetchProfiles()
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
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 0.9rem;
  margin-bottom: 1rem;
}

.active-filters {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.55rem;
  margin-bottom: 1rem;
}

.active-filters-label {
  color: #475569;
  font-size: 0.8rem;
  font-weight: 700;
}

.filter-chip {
  border: 1px solid #c7d2fe;
  background: #eef2ff;
  color: #3730a3;
  border-radius: 999px;
  padding: 0.35rem 0.65rem;
  font-size: 0.75rem;
  font-weight: 700;
  cursor: pointer;
}

.filter-chip.reset {
  border-color: #fecaca;
  background: #fff1f2;
  color: #9f1239;
}

.stat-card,
.summary-card {
  border: 1px solid #dbe3ee;
  border-radius: 1rem;
  background: linear-gradient(180deg, #fff 0%, #f8fafc 100%);
  padding: 1rem;
}

.stat-label,
.summary-label,
.metric-label {
  display: block;
  color: #64748b;
  font-size: 0.8rem;
  font-weight: 600;
  margin-bottom: 0.35rem;
}

.stat-value,
.summary-value,
.metric-value {
  color: #0f172a;
  font-size: 1.25rem;
  font-weight: 800;
}

.profiles-table-wrap,
.feedback-card {
  border: 1px solid #dbe3ee;
  border-radius: 1rem;
  background: #fff;
}

.profiles-table {
  overflow: hidden;
}

.table-head,
.table-row {
  display: grid;
  grid-template-columns: minmax(0, 2.2fr) minmax(0, 0.8fr) minmax(0, 0.9fr) minmax(0, 1fr) auto;
  gap: 1rem;
  padding: 0.9rem 1rem;
  align-items: center;
}

.table-head {
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
}

.th {
  border: none;
  background: transparent;
  color: #475569;
  text-align: left;
  font-size: 0.76rem;
  font-weight: 800;
  letter-spacing: 0.02em;
  text-transform: uppercase;
}

.th.sortable {
  cursor: pointer;
}

.table-row {
  border-bottom: 1px solid #eef2f7;
}

.table-row.expanded {
  background: #fbfdff;
}

.td {
  color: #0f172a;
  font-weight: 700;
  font-size: 0.9rem;
}

.learner-cell {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.expand-button {
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 0.4rem;
  border: 1px solid #cbd5e1;
  background: #fff;
  color: #334155;
  font-weight: 700;
  cursor: pointer;
}

.profile-meta-inline {
  margin: 0.2rem 0 0;
  color: #64748b;
  font-size: 0.8rem;
}

.expanded-row {
  padding: 0 1rem 1rem;
  border-bottom: 1px solid #eef2f7;
  background: #fbfdff;
}

.expanded-grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 0.7rem;
}

.profile-main {
  display: flex;
  align-items: center;
  gap: 0.9rem;
  min-width: 0;
}

.profile-avatar {
  width: 3rem;
  height: 3rem;
  border-radius: 999px;
  background: linear-gradient(135deg, #4f46e5, #2563eb);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  flex-shrink: 0;
}

.profile-avatar.large {
  width: 4rem;
  height: 4rem;
  font-size: 1rem;
}

.profile-copy {
  min-width: 0;
}

.profile-heading {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  flex-wrap: wrap;
}

.profile-name {
  margin: 0;
  color: #0f172a;
  font-size: 1rem;
  font-weight: 800;
}

.profile-meta {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  margin-top: 0.35rem;
  color: #64748b;
  font-size: 0.84rem;
}

.profile-metrics {
  display: none;
}

.metric-item {
  border: 1px solid #eef2f7;
  border-radius: 0.85rem;
  background: #f8fafc;
  padding: 0.8rem;
}

.profile-actions {
  display: flex;
  justify-content: flex-end;
}

.view-button,
.feedback-button,
.primary-button,
.ghost-button,
.page-button {
  border-radius: 0.75rem;
  padding: 0.7rem 0.95rem;
  font-size: 0.84rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
}

.view-button,
.ghost-button,
.page-button {
  border: 1px solid #cbd5e1;
  background: #fff;
  color: #0f172a;
}

.view-button:hover,
.ghost-button:hover,
.page-button:hover:not(:disabled) {
  border-color: #4f46e5;
  color: #4338ca;
}

.primary-button,
.feedback-button,
.page-button.primary {
  border: 1px solid #4338ca;
  background: linear-gradient(135deg, #4f46e5, #4338ca);
  color: #fff;
}

.page-button:disabled {
  opacity: 0.55;
  cursor: not-allowed;
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

.pagination-bar {
  margin-top: 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  border: 1px solid #dbe3ee;
  border-radius: 1rem;
  background: #fff;
  padding: 1rem 1.1rem;
}

.pagination-summary {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  color: #64748b;
  font-size: 0.85rem;
  font-weight: 600;
}

.pagination-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.limit-select-wrap {
  display: inline-flex;
  align-items: center;
  gap: 0.55rem;
  color: #475569;
  font-size: 0.84rem;
  font-weight: 700;
}

.limit-select,
.filter-select {
  width: 100%;
  border: 1px solid #cbd5e1;
  border-radius: 0.8rem;
  padding: 0.8rem 0.9rem;
  color: #0f172a;
  background: #fff;
}

.limit-select {
  width: auto;
  padding-right: 2rem;
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

.filter-modal {
  width: min(100%, 48rem);
  border-radius: 1.15rem;
  background: #fff;
  box-shadow: 0 28px 60px rgba(15, 23, 42, 0.22);
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

.filter-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
}

.filter-section+.filter-section {
  margin-top: 1rem;
}

.filter-label {
  display: block;
  margin: 0 0 0.55rem;
  color: #334155;
  font-weight: 700;
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

@media (max-width: 1100px) {
  .table-head {
    display: none;
  }

  .table-row {
    grid-template-columns: 1fr;
    gap: 0.45rem;
  }

  .td.actions,
  .th.actions {
    justify-content: flex-start;
  }

  .profile-actions,
  .expanded-grid {
    justify-content: flex-start;
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .users-stats {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 768px) {

  .profiles-table-wrap {
    border: none;
    background: transparent;
  }

  .profiles-table {
    display: flex;
    flex-direction: column;
    gap: 0.8rem;
  }

  .table-row {
    border: 1px solid #dbe3ee;
    border-radius: 1rem;
    background: #fff;
    padding: 0.85rem;
    gap: 0.6rem;
  }

  .table-row:last-of-type {
    border-bottom: 1px solid #dbe3ee;
  }

  .td {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
  }

  .td[data-label]::before {
    content: attr(data-label);
    color: #64748b;
    font-size: 0.76rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.01em;
  }

  .learner-cell {
    align-items: flex-start;
    justify-content: flex-start;
    border-bottom: 1px solid #eef2f7;
    padding-bottom: 0.6rem;
    margin-bottom: 0.1rem;
  }

  .expanded-row {
    border: 1px solid #e2e8f0;
    border-top: none;
    border-radius: 0 0 1rem 1rem;
    margin-top: -0.8rem;
    margin-bottom: 0.8rem;
    padding: 0.8rem;
  }

  .users-toolbar,
  .modal-header,
  .modal-footer,
  .pagination-bar {
    flex-direction: column;
    align-items: stretch;
  }

  .filter-trigger,
  .view-button,
  .page-button {
    width: 100%;
    justify-content: center;
  }

  .filter-grid,
  .expanded-grid,
  .users-stats {
    grid-template-columns: 1fr;
  }

  .pagination-actions {
    width: 100%;
  }
}
</style>
