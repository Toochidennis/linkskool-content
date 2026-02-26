<template>
  <div class="program-course-library">
    <div class="header-shell">
      <div class="header-section">
        <div class="header-left">
          <div class="back-button" @click="goBack">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </div>
          <div>
            <h1 class="header-title">{{ programName }}</h1>
            <p class="header-subtitle">{{ activeTab === 'courses' ? 'Courses attached to this program' : 'Curriculum flow for learner progression' }}</p>
          </div>
        </div>

        <div class="header-right">
          <div class="search-container">
            <svg class="search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              v-model="searchQuery"
              type="text"
              :placeholder="activeTab === 'courses' ? 'Search courses...' : 'Search cohorts in flow...'"
              class="search-input"
            />
          </div>
        </div>
      </div>

      <div class="tab-switcher" role="tablist" aria-label="Program views">
        <button
          class="tab-btn"
          :class="{ active: activeTab === 'courses' }"
          role="tab"
          :aria-selected="activeTab === 'courses'"
          @click="activeTab = 'courses'"
        >
          <span>Courses</span>
          <small>{{ coursesList.length }}</small>
        </button>
        <button
          class="tab-btn"
          :class="{ active: activeTab === 'curriculum' }"
          role="tab"
          :aria-selected="activeTab === 'curriculum'"
          @click="activeTab = 'curriculum'"
        >
          <span>Curriculum Flow</span>
          <small>{{ learningPathList.length }}</small>
        </button>
      </div>
    </div>

    <div v-if="isLoading" class="loading-state">
      <div class="loading-spinner"></div>
      <p>{{ activeTab === 'courses' ? 'Loading courses...' : 'Loading curriculum flow...' }}</p>
    </div>

    <template v-else>
      <div v-if="activeTab === 'courses' && filteredCoursesList.length > 0" class="courses-grid">
        <div
          v-for="course in filteredCoursesList"
          :key="course.id"
          class="course-card"
          @click="navigateToCohorts(course)"
        >
          <div class="course-image-container">
            <img :src="loadImage(course.imageUrl || '')" :alt="course.title" class="course-image" />
          </div>
          <div class="course-content">
            <div class="course-header-row">
              <h3 class="course-title">{{ course.title }}</h3>
            </div>
            <p v-if="course.slogan" class="course-slogan">{{ course.slogan }}</p>
            <p class="course-text">{{ course.description || 'No description available.' }}</p>
          </div>
        </div>
      </div>

      <div v-else-if="activeTab === 'curriculum'" class="flow-wrap">
        <div class="flow-banner">
          <p class="flow-title">Build the program flow</p>
          <p class="flow-subtitle">
            Drag cohorts from Available into Program Flow, then reorder to control learner progression.
          </p>
        </div>

        <div class="flow-board">
          <section
            class="pool-card"
            :class="{ 'drop-zone': dropZoneTarget === 'available' }"
            @dragover.prevent="handleCardDragOver('available')"
            @drop.prevent="handleDropOnCard('available')"
          >
            <div class="pool-header">
              <h3>Available Cohorts</h3>
              <span>{{ availableCohorts.length }}</span>
            </div>

            <div v-if="filteredAvailableCohorts.length" class="flow-list">
              <article
                v-for="cohort in filteredAvailableCohorts"
                :key="cohort.id"
                class="flow-item"
                :class="{ dragging: draggingCohortId === cohort.id }"
                draggable="true"
                @dragstart="handleDragStart(cohort.id, 'available')"
                @dragend="handleDragEnd"
              >
                <div class="flow-left">
                  <div class="drag-handle" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path d="M8 6h.01M8 12h.01M8 18h.01M16 6h.01M16 12h.01M16 18h.01" stroke-width="2.5" stroke-linecap="round" />
                    </svg>
                  </div>
                  <div class="flow-content">
                    <p class="flow-name">{{ cohort.title }}</p>
                    <p class="flow-meta">
                      <span>{{ cohort.courseName || 'No course assigned' }}</span>
                      <span>{{ renderDateRange(cohort.startDate, cohort.endDate) }}</span>
                    </p>
                    <p class="flow-description">{{ cohort.description || 'No cohort description provided.' }}</p>
                  </div>
                </div>

                <div class="flow-right">
                  <span class="status-pill" :class="cohort.status">{{ cohort.status }}</span>
                  <span class="flow-count">{{ cohort.participants || 0 }} / {{ cohort.capacity || 0 }} learners</span>
                </div>
              </article>
            </div>

            <p v-else class="pool-empty">
              {{ searchQuery ? 'No available cohorts match your search.' : 'No cohorts available to add.' }}
            </p>
          </section>

          <section
            class="pool-card primary"
            :class="{ 'drop-zone': dropZoneTarget === 'flow' }"
            @dragover.prevent="handleCardDragOver('flow')"
            @drop.prevent="handleDropOnCard('flow')"
          >
            <div class="pool-header">
              <h3>Program Flow</h3>
              <span>{{ learningPathList.length }}</span>
            </div>

            <div v-if="filteredLearningPath.length" class="flow-list">
              <article
                v-for="cohort in filteredLearningPath"
                :key="cohort.id"
                class="flow-item"
                :class="{
                  dragging: draggingCohortId === cohort.id,
                  'drop-target': dropTargetId === cohort.id && draggingCohortId !== cohort.id,
                }"
                draggable="true"
                @dragstart="handleDragStart(cohort.id, 'flow')"
                @dragover.prevent="handleDragOverFlowItem(cohort.id)"
                @drop.prevent="handleDropOnFlowItem(cohort.id)"
                @dragend="handleDragEnd"
              >
                <div class="flow-left">
                  <div class="drag-handle" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path d="M8 6h.01M8 12h.01M8 18h.01M16 6h.01M16 12h.01M16 18h.01" stroke-width="2.5" stroke-linecap="round" />
                    </svg>
                  </div>
                  <div class="flow-order">{{ cohort.sequence }}</div>
                  <div class="flow-content">
                    <p class="flow-name">{{ cohort.title }}</p>
                    <p class="flow-meta">
                      <span>{{ cohort.courseName || 'No course assigned' }}</span>
                      <span>{{ renderDateRange(cohort.startDate, cohort.endDate) }}</span>
                    </p>
                    <p class="flow-description">{{ cohort.description || 'No cohort description provided.' }}</p>
                  </div>
                </div>

                <div class="flow-right">
                  <span class="status-pill" :class="cohort.status">{{ cohort.status }}</span>
                  <span class="flow-count">{{ cohort.participants || 0 }} / {{ cohort.capacity || 0 }} learners</span>
                </div>
              </article>
            </div>

            <p v-else class="pool-empty">
              {{ searchQuery ? 'No flow cohorts match your search.' : 'Drop cohorts here to create the program flow.' }}
            </p>
          </section>
        </div>
      </div>

      <div v-else class="empty-state">
        <svg class="empty-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
          />
        </svg>
        <p class="empty-text">
          {{
            searchQuery
              ? activeTab === 'courses'
                ? 'No courses match your search'
                : 'No cohorts match your search'
              : activeTab === 'courses'
                ? 'No courses found for this program.'
                : 'No cohorts found in this program flow.'
          }}
        </p>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useToast } from 'vue-toast-notification'
import { learningCourseService, programService } from '@/api/services/serviceFactory'
import type { ProgramCourse } from '@/api/models'

type TabKey = 'courses' | 'curriculum'
type CohortStatus = 'upcoming' | 'ongoing' | 'completed'

interface LearningPathCohort {
  id: number
  title: string
  code?: string
  imageUrl?: string
  startDate: string
  endDate: string
  status: CohortStatus
  participants?: number
  capacity?: number
  description?: string
  courseName?: string
  sequence: number
  inFlow: boolean
  isActive?: boolean
}

type DragSource = 'available' | 'flow'
type BillingTrialType = 'views' | 'days' | null

interface CohortApiRow {
  id: number
  programId: number
  courseId: number
  slug: string
  title: string
  courseName: string
  status: CohortStatus
  startDate: string
  endDate: string
  description: string
  benefits: string
  capacity: number
  deliveryMode: string
  isFree: number
  createdAt: string
  updatedAt: string
  code: string | null
  cost: number | null
  imageUrl: string | null
  instructorName: string | null
  trialType: BillingTrialType
  trialValue: number | null
  zoomLink: string | null
}

interface ProgramFlowApiRow extends CohortApiRow {
  flowOrder: number
  isActive: boolean | number | string
}

type CohortsApiResponse = CohortApiRow[] & {
  programFlow?: ProgramFlowApiRow[]
}

type CohortsApiPayloadObject = {
  availableCohorts: CohortApiRow[]
  programFlow: ProgramFlowApiRow[]
}

const router = useRouter()
const route = useRoute()
const toast = useToast()

const activeTab = ref<TabKey>('courses')
const coursesList = ref<ProgramCourse[]>([])
const learningPathList = ref<LearningPathCohort[]>([])
const availableCohorts = ref<LearningPathCohort[]>([])
const searchQuery = ref('')
const isLoading = ref(false)
const hasLoadedCurriculum = ref(false)

const draggingCohortId = ref<number | null>(null)
const draggingSource = ref<DragSource | null>(null)
const dropTargetId = ref<number | null>(null)
const dropZoneTarget = ref<DragSource | null>(null)

const programName = computed(() => (route.query.name as string) || 'Program Courses')
const programId = computed(() => parseInt(route.query.id as string, 10) || 0)

const reindexLearningPath = () => {
  learningPathList.value = learningPathList.value.map((cohort, index) => ({
    ...cohort,
    sequence: index + 1,
    inFlow: true,
  }))
}

const fetchCourses = async () => {
  if (!programId.value) {
    toast.error('Program ID not found')
    return
  }

  isLoading.value = true
  try {
    const response = await learningCourseService.get(`program/${programId.value}`)
    coursesList.value = Array.isArray(response.data) ? response.data : []
  } catch (error: unknown) {
    console.error('Failed to fetch courses:', error)
    const message = error instanceof Error ? error.message : 'Failed to load courses'
    toast.error(message)
  } finally {
    isLoading.value = false
  }
}

const parseBoolean = (value: boolean | number | string | undefined) =>
  value === true || value === 1 || value === '1' || value === 'true'

const normalizeStatus = (value: string): CohortStatus => {
  if (value === 'ongoing' || value === 'completed' || value === 'upcoming') {
    return value
  }
  return 'upcoming'
}

const normalizeCohort = (
  row: CohortApiRow | ProgramFlowApiRow,
  index: number,
  options?: { forceInFlow?: boolean },
): LearningPathCohort => {
  const normalizedStatus = normalizeStatus(String(row.status).toLowerCase())
  const rawSequence = 'flowOrder' in row ? row.flowOrder : undefined
  const parsedSequence = Number(rawSequence)
  const hasFlowSequence =
    rawSequence !== undefined &&
    rawSequence !== null &&
    String(rawSequence).trim() !== '' &&
    Number.isFinite(parsedSequence) &&
    parsedSequence > 0

  return {
    id: row.id,
    title: row.title,
    code: row.code || '',
    imageUrl: row.imageUrl || '',
    startDate: row.startDate,
    endDate: row.endDate,
    status: normalizedStatus,
    participants: 0,
    capacity: row.capacity,
    description: row.description,
    courseName: row.courseName,
    sequence: hasFlowSequence ? parsedSequence : index + 1,
    inFlow: options?.forceInFlow ?? hasFlowSequence,
    isActive: 'isActive' in row ? parseBoolean(row.isActive) : true,
  }
}

const fetchProgramCohorts = async () => {
  if (!programId.value) {
    toast.error('Program ID not found')
    return
  }

  isLoading.value = true
  try {
    const response = await programService.get(`${programId.value}/cohorts`)
    const payload = (response.data || []) as CohortsApiResponse | CohortsApiPayloadObject
    const availableRows = Array.isArray(payload)
      ? payload
      : Array.isArray(payload.availableCohorts)
        ? payload.availableCohorts
        : []
    const flowRows = Array.isArray(payload.programFlow) ? payload.programFlow : []

    learningPathList.value = flowRows
      .map((row, index) => normalizeCohort(row, index, { forceInFlow: true }))
      .filter((cohort) => cohort.id)
      .sort((a, b) => a.sequence - b.sequence)

    availableCohorts.value = availableRows
      .map((row, index) => normalizeCohort(row, index, { forceInFlow: false }))
      .filter((cohort) => cohort.id)
      .map((cohort) => ({ ...cohort, sequence: 0, inFlow: false }))

    reindexLearningPath()
    hasLoadedCurriculum.value = true
  } catch (error: unknown) {
    console.error('Failed to fetch program cohorts:', error)
    const message = error instanceof Error ? error.message : 'Failed to load curriculum flow'
    toast.error(message)
  } finally {
    isLoading.value = false
  }
}

const loadImage = (image: string) => {
  if (!image) return 'https://via.placeholder.com/1200x400?text=Course+Banner'
  if (image.startsWith('data:') || image.startsWith('http')) {
    return image
  }
  return import.meta.env.VITE_ASSETS_BASE_URL + '/' + image
}

const filteredCoursesList = computed(() => {
  let filtered = [...coursesList.value]

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(
      (course) =>
        course.title?.toLowerCase().includes(query) ||
        (course.slogan && course.slogan.toLowerCase().includes(query)) ||
        (course.description && course.description.toLowerCase().includes(query)),
    )
  }

  return filtered
})

const filteredLearningPath = computed(() => {
  if (!searchQuery.value) return learningPathList.value

  const query = searchQuery.value.toLowerCase()
  return learningPathList.value.filter(
    (cohort) =>
      cohort.title.toLowerCase().includes(query) ||
      cohort.status.toLowerCase().includes(query) ||
      cohort.courseName?.toLowerCase().includes(query) ||
      cohort.code?.toLowerCase().includes(query),
  )
})

const filteredAvailableCohorts = computed(() => {
  if (!searchQuery.value) return availableCohorts.value

  const query = searchQuery.value.toLowerCase()
  return availableCohorts.value.filter(
    (cohort) =>
      cohort.title.toLowerCase().includes(query) ||
      cohort.status.toLowerCase().includes(query) ||
      cohort.courseName?.toLowerCase().includes(query) ||
      cohort.code?.toLowerCase().includes(query),
  )
})

const goBack = () => {
  router.back()
}

const navigateToCohorts = (course: ProgramCourse) => {
  router.push({
    name: 'Program Course Cohorts',
    params: {
      courseSlug: course.slug || course.id?.toString(),
    },
    query: {
      courseName: course.title,
      courseId: course.id,
      programId: programId.value,
    },
  })
}

const renderDateRange = (start: string, end: string) => {
  if (!start && !end) return 'Date not set'
  const startDate = formatDate(start)
  const endDate = formatDate(end)
  return `${startDate} - ${endDate}`
}

const formatDate = (value: string) => {
  if (!value) return 'TBD'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'TBD'
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

const persistLearningPathOrder = async () => {
  if (!programId.value) return

  const cohortIds = learningPathList.value.map((cohort) => cohort.id)
  try {
    await programService.put(`${programId.value}/cohorts/sequence`, {
      cohort_ids: cohortIds,
    })
  } catch {
    // Reorder endpoint may not be available in all environments.
  }
}

const handleDragStart = (cohortId: number, source: DragSource) => {
  draggingCohortId.value = cohortId
  draggingSource.value = source
  dropTargetId.value = source === 'flow' ? cohortId : null
  dropZoneTarget.value = source
}

const handleDragOverFlowItem = (cohortId: number) => {
  dropTargetId.value = cohortId
  dropZoneTarget.value = 'flow'
}

const handleCardDragOver = (target: DragSource) => {
  dropZoneTarget.value = target
}

const handleDropOnFlowItem = async (targetCohortId: number) => {
  if (!draggingCohortId.value || !draggingSource.value) {
    handleDragEnd()
    return
  }

  if (draggingSource.value === 'flow' && draggingCohortId.value === targetCohortId) {
    handleDragEnd()
    return
  }

  const targetIndex = learningPathList.value.findIndex((cohort) => cohort.id === targetCohortId)
  if (targetIndex < 0) {
    handleDragEnd()
    return
  }

  if (draggingSource.value === 'flow') {
    const currentIndex = learningPathList.value.findIndex(
      (cohort) => cohort.id === draggingCohortId.value,
    )
    if (currentIndex < 0) {
      handleDragEnd()
      return
    }
    const updated = [...learningPathList.value]
    const [moved] = updated.splice(currentIndex, 1)
    if (!moved) {
      handleDragEnd()
      return
    }
    updated.splice(targetIndex, 0, moved)
    learningPathList.value = updated
  } else {
    const sourceIndex = availableCohorts.value.findIndex(
      (cohort) => cohort.id === draggingCohortId.value,
    )
    if (sourceIndex < 0) {
      handleDragEnd()
      return
    }
    const updatedAvailable = [...availableCohorts.value]
    const [moved] = updatedAvailable.splice(sourceIndex, 1)
    if (!moved) {
      handleDragEnd()
      return
    }
    availableCohorts.value = updatedAvailable
    learningPathList.value = [
      ...learningPathList.value.slice(0, targetIndex),
      { ...moved, inFlow: true },
      ...learningPathList.value.slice(targetIndex),
    ]
  }

  reindexLearningPath()
  handleDragEnd()
  await persistLearningPathOrder()
}

const handleDropOnCard = async (target: DragSource) => {
  if (!draggingCohortId.value || !draggingSource.value) {
    handleDragEnd()
    return
  }

  if (target === 'flow') {
    if (draggingSource.value === 'available') {
      const sourceIndex = availableCohorts.value.findIndex(
        (cohort) => cohort.id === draggingCohortId.value,
      )
      if (sourceIndex >= 0) {
        const updatedAvailable = [...availableCohorts.value]
        const [moved] = updatedAvailable.splice(sourceIndex, 1)
        if (moved) {
          availableCohorts.value = updatedAvailable
          learningPathList.value = [...learningPathList.value, { ...moved, inFlow: true }]
          reindexLearningPath()
          await persistLearningPathOrder()
        }
      }
    } else {
      const sourceIndex = learningPathList.value.findIndex(
        (cohort) => cohort.id === draggingCohortId.value,
      )
      if (sourceIndex >= 0 && sourceIndex !== learningPathList.value.length - 1) {
        const updatedFlow = [...learningPathList.value]
        const [moved] = updatedFlow.splice(sourceIndex, 1)
        if (moved) {
          updatedFlow.push(moved)
          learningPathList.value = updatedFlow
          reindexLearningPath()
          await persistLearningPathOrder()
        }
      }
    }
  }

  if (target === 'available' && draggingSource.value === 'flow') {
    const sourceIndex = learningPathList.value.findIndex((cohort) => cohort.id === draggingCohortId.value)
    if (sourceIndex >= 0) {
      const updatedFlow = [...learningPathList.value]
      const [moved] = updatedFlow.splice(sourceIndex, 1)
      if (moved) {
        learningPathList.value = updatedFlow
        availableCohorts.value = [...availableCohorts.value, { ...moved, inFlow: false, sequence: 0 }]
        reindexLearningPath()
        await persistLearningPathOrder()
      }
    }
  }

  handleDragEnd()
}

const handleDragEnd = () => {
  draggingCohortId.value = null
  draggingSource.value = null
  dropTargetId.value = null
  dropZoneTarget.value = null
}

watch(activeTab, async (tab) => {
  searchQuery.value = ''
  if (tab === 'curriculum' && !hasLoadedCurriculum.value) {
    await fetchProgramCohorts()
  }
})

onMounted(() => {
  fetchCourses()
})
</script>

<style scoped>
.program-course-library {
  min-height: 100vh;
  position: relative;
  padding-bottom: 2rem;
}

.header-shell {
  margin-bottom: 2rem;
  padding: 1.25rem;
  border-radius: 1rem;
  background: linear-gradient(135deg, #f8fafc 0%, #eef2ff 70%, #eff6ff 100%);
  border: 1px solid #e2e8f0;
}

.header-section {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1.5rem;
  margin-bottom: 1rem;
}

.header-left {
  flex: 1;
  display: flex;
  align-items: flex-start;
  gap: 0.9rem;
}

.back-button {
  padding: 0.5rem;
  background: var(--theme-surface);
  border: 1px solid var(--theme-border);
  border-radius: 0.5rem;
  color: var(--theme-text-subtle);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  margin-top: 0.2rem;
}

.back-button:hover {
  background: var(--theme-surface-soft);
  border-color: #4f46e5;
  color: #4f46e5;
}

.header-title {
  font-size: 1.9rem;
  font-weight: 800;
  color: #0f172a;
  margin: 0 0 0.4rem 0;
  letter-spacing: -0.02em;
}

.header-subtitle {
  font-size: 0.95rem;
  color: #475569;
  margin: 0;
  font-weight: 500;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-shrink: 0;
}

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
  width: 1.2rem;
  height: 1.2rem;
  color: #64748b;
  pointer-events: none;
}

.search-input {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.75rem;
  border: 1.5px solid #cbd5e1;
  background: #fff;
  border-radius: 0.75rem;
  font-size: 0.875rem;
  color: #0f172a;
  transition: all 0.25s;
}

.search-input:hover {
  border-color: #94a3b8;
}

.search-input:focus {
  outline: none;
  border-color: #4f46e5;
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.14);
}

.tab-switcher {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  background: #fff;
  border: 1px solid #dbe3ee;
  border-radius: 0.75rem;
  padding: 0.3rem;
}

.tab-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  border: none;
  background: transparent;
  color: #475569;
  font-weight: 700;
  font-size: 0.86rem;
  border-radius: 0.55rem;
  padding: 0.56rem 0.8rem;
  cursor: pointer;
  transition: all 0.2s;
}

.tab-btn small {
  min-width: 1.2rem;
  text-align: center;
  font-size: 0.72rem;
  border-radius: 999px;
  background: #e2e8f0;
  color: #334155;
  padding: 0.15rem 0.4rem;
}

.tab-btn.active {
  color: #0f172a;
  background: linear-gradient(135deg, #eef2ff, #f5f3ff);
}

.tab-btn.active small {
  background: #4f46e5;
  color: #fff;
}

.courses-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1rem;
  animation: fadeInUp 0.4s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(16px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.course-card {
  background: var(--theme-surface);
  border-radius: 0.75rem;
  overflow: visible;
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.07);
  transition: all 0.25s;
  border: 1px solid var(--theme-border);
  display: flex;
  flex-direction: column;
  cursor: pointer;
}

.course-card:hover {
  box-shadow: 0 18px 34px rgba(15, 23, 42, 0.12);
  transform: translateY(-5px);
  border-color: #4f46e5;
}

.course-image-container {
  position: relative;
  width: 100%;
  height: 160px;
  overflow: hidden;
  background: linear-gradient(135deg, #6366f1 0%, #3b82f6 100%);
}

.course-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.course-content {
  padding: 1rem;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.course-header-row {
  margin-bottom: 0.5rem;
}

.course-title {
  font-size: 1.075rem;
  font-weight: 700;
  color: #0f172a;
  line-height: 1.3;
}

.course-slogan {
  font-size: 0.82rem;
  color: #4f46e5;
  font-weight: 700;
  margin-bottom: 0.5rem;
  background: #eef2ff;
  padding: 0.24rem 0.5rem;
  border-radius: 0.36rem;
  width: fit-content;
}

.course-text {
  color: #64748b;
  line-height: 1.48;
  margin-bottom: 0.75rem;
  font-size: 0.875rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  flex: 1;
}

.flow-wrap {
  animation: fadeInUp 0.35s ease-out;
}

.flow-board {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
}

.pool-card {
  border: 1px solid #dbe3ee;
  border-radius: 1rem;
  background: #ffffff;
  min-height: 22rem;
  padding: 0.9rem;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.pool-card.primary {
  border-color: #c7d2fe;
  background: linear-gradient(180deg, #ffffff 0%, #eef2ff 100%);
}

.pool-card.drop-zone {
  border-color: #4f46e5;
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.15);
}

.pool-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.75rem;
}

.pool-header h3 {
  margin: 0;
  font-size: 0.92rem;
  font-weight: 800;
  color: #0f172a;
}

.pool-header span {
  font-size: 0.74rem;
  font-weight: 700;
  color: #4338ca;
  background: #e0e7ff;
  border-radius: 999px;
  padding: 0.2rem 0.5rem;
}

.pool-empty {
  margin: 0;
  color: #64748b;
  font-size: 0.84rem;
  text-align: center;
  border: 1px dashed #cbd5e1;
  border-radius: 0.75rem;
  padding: 1.5rem 0.8rem;
  background: #f8fafc;
}

.flow-banner {
  border: 1px solid #c7d2fe;
  background: linear-gradient(120deg, #eef2ff 0%, #f5f3ff 100%);
  border-radius: 0.9rem;
  padding: 1rem;
  margin-bottom: 1rem;
}

.flow-title {
  margin: 0 0 0.3rem;
  color: #0f172a;
  font-size: 0.98rem;
  font-weight: 800;
}

.flow-subtitle {
  margin: 0;
  color: #4f46e5;
  font-size: 0.86rem;
}

.flow-list {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

.flow-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.95rem;
  border: 1px solid #dbe3ee;
  border-radius: 0.9rem;
  background: #fff;
  transition: transform 0.18s, box-shadow 0.18s, border-color 0.18s;
}

.flow-item:hover {
  border-color: #a5b4fc;
  box-shadow: 0 10px 24px rgba(8, 47, 73, 0.08);
}

.flow-item.dragging {
  opacity: 0.55;
}

.flow-item.drop-target {
  border-color: #4f46e5;
  transform: translateY(-1px);
}

.flow-left {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  min-width: 0;
  flex: 1;
}

.drag-handle {
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.6rem;
  color: #64748b;
  border: 1px solid #e2e8f0;
  background: #f8fafc;
  cursor: grab;
}

.drag-handle svg {
  width: 1rem;
  height: 1rem;
}

.flow-order {
  width: 2rem;
  height: 2rem;
  border-radius: 999px;
  background: #4f46e5;
  color: #fff;
  font-weight: 800;
  font-size: 0.83rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.flow-content {
  min-width: 0;
}

.flow-name {
  margin: 0;
  color: #0f172a;
  font-size: 0.95rem;
  font-weight: 800;
}

.flow-meta {
  margin: 0.2rem 0 0;
  display: flex;
  flex-wrap: wrap;
  gap: 0.55rem;
  color: #4f46e5;
  font-size: 0.78rem;
  font-weight: 600;
}

.flow-description {
  margin: 0.34rem 0 0;
  color: #64748b;
  font-size: 0.82rem;
  line-height: 1.42;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.flow-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.35rem;
  flex-shrink: 0;
}

.status-pill {
  font-size: 0.74rem;
  font-weight: 700;
  padding: 0.22rem 0.52rem;
  border-radius: 999px;
  text-transform: capitalize;
}

.status-pill.ongoing {
  color: #1e40af;
  background: #dbeafe;
}

.status-pill.upcoming {
  color: #1d4ed8;
  background: #dbeafe;
}

.status-pill.completed {
  color: #475569;
  background: #e2e8f0;
}

.flow-count {
  color: #64748b;
  font-size: 0.74rem;
  font-weight: 600;
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
  animation: program-course-spin 0.8s linear infinite;
}

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
  color: #cbd5e1;
  margin-bottom: 1rem;
}

.empty-text {
  color: #64748b;
  font-size: 1rem;
}

@keyframes program-course-spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 768px) {
  .header-shell {
    padding: 1rem;
  }

  .header-section {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .header-right {
    width: 100%;
  }

  .search-container {
    max-width: 100%;
  }

  .tab-switcher {
    width: 100%;
    justify-content: space-between;
  }

  .tab-btn {
    flex: 1;
    justify-content: center;
  }

  .flow-item {
    flex-direction: column;
    align-items: flex-start;
  }

  .flow-board {
    grid-template-columns: 1fr;
  }

  .flow-right {
    width: 100%;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
}
</style>
