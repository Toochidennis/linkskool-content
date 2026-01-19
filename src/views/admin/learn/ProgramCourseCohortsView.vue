<template>
  <div class="cohorts-page">
    <header class="page-header">
      <div class="header-left">
        <button class="back-btn" @click="goBack" aria-label="Go back">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M15 19l-7-7 7-7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </button>
        <div>
          <p class="eyebrow">{{ courseName }} · Cohorts</p>
          <h1 class="page-title">Cohort timeline & health</h1>
          <p class="page-subtitle">Monitor active and upcoming cohorts, enrollment momentum, and lesson
            readiness.</p>
        </div>
      </div>
      <div class="header-actions">
        <button class="filter-btn" :class="{ active: statusFilter }" @click="showFilterModal = true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path
              d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
              stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
          <span v-if="statusFilter" class="filter-badge">1</span>
        </button>
        <button class="primary-btn" @click="openCreateModal">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M12 5v14m-7-7h14" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
          <span style="white-space: nowrap;">New cohort</span>
        </button>
      </div>
    </header>

    <section class="top-stats">
      <div class="stat-card">
        <p class="label">Active cohorts</p>
        <div class="stat-row">
          <span class="stat-number">{{ stats.active }}</span>
          <span class="pill success">Live</span>
        </div>
        <p class="hint">{{ stats.active }} currently teaching</p>
      </div>
      <div class="stat-card">
        <p class="label">Upcoming</p>
        <div class="stat-row">
          <span class="stat-number">{{ stats.upcoming }}</span>
          <span class="pill info">Scheduled</span>
        </div>
        <p class="hint">Starting soon</p>
      </div>
      <div class="stat-card">
        <p class="label">Completed</p>
        <div class="stat-row">
          <span class="stat-number">{{ stats.completed }}</span>
          <span class="pill muted">Wrapped</span>
        </div>
        <p class="hint">Archived for reporting</p>
      </div>
      <div class="stat-card wide">
        <div class="stat-row between">
          <div>
            <p class="label">Total learners</p>
            <p class="stat-number">{{ stats.totalLearners }}</p>
          </div>
          <div class="mini">
            <p class="label">Avg cohort size</p>
            <p class="stat-number sm">{{ stats.avgSize }}</p>
          </div>
          <div class="mini">
            <p class="label">Lessons ready</p>
            <p class="stat-number sm">{{ stats.lessonsReady }}%</p>
          </div>
        </div>
        <div class="progress">
          <div class="bar" :style="{ width: stats.lessonProgress + '%' }"></div>
        </div>
        <p class="hint">Lesson readiness across all cohorts</p>
      </div>
    </section>

    <section class="filters">
      <div class="search-box">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <circle cx="11" cy="11" r="7" stroke-width="2" />
          <line x1="16.5" y1="16.5" x2="21" y2="21" stroke-width="2" stroke-linecap="round" />
        </svg>
        <input v-model="search" type="search" placeholder="Search cohorts by name or code" />
      </div>
      <div class="toggle">
        <label>
          <input type="checkbox" v-model="showOnlyActive" />
          Show only active
        </label>
      </div>
    </section>

    <section class="cohort-stack" v-if="filteredCohorts.length">
      <article v-for="cohort in filteredCohorts" :key="cohort.id" class="cohort-card">
        <div class="cohort-header" @click="toggleExpanded(cohort.id)">
          <div class="title-block">
            <span class="pill" :class="cohort.status">{{ cohort.status }}</span>
            <div>
              <p class="cohort-name">{{ cohort.name }}</p>
              <p class="cohort-meta">{{ cohort.code }} · {{ renderDateRange(cohort.startDate,
                cohort.endDate) }}</p>
            </div>
          </div>
          <div class="header-right">
            <div class="spark">
              <span class="label">Enrolled</span>
              <p class="strong">{{ cohort.participants }}<span class="muted">/{{ cohort.capacity }}</span>
              </p>
            </div>
            <div class="spark">
              <span class="label">Lessons</span>
              <p class="strong">{{ cohort.lessonsReady }}/{{ cohort.totalLessons }}</p>
            </div>
            <div class="spark">
              <span class="label">Time left</span>
              <p class="strong">{{ daysLeft(cohort) }}</p>
            </div>
            <button class="collapse-btn" @click.stop="toggleExpanded(cohort.id)">
              <svg v-if="expanded.has(cohort.id)" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M6 15l6-6 6 6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
              <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M6 9l6 6 6-6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </button>
          </div>
        </div>

        <transition name="fade-slide">
          <div v-if="expanded.has(cohort.id)" class="cohort-body">
            <div class="body-left">
              <div class="banner" :style="{ backgroundImage: `url(${loadImage(cohort.image)})` }">
                <div class="overlay">
                  <p class="overlay-title">{{ cohort.name }}</p>
                  <p class="overlay-sub">{{ cohort.description }}</p>
                </div>
              </div>
              <div class="row">
                <div class="metric">
                  <p class="label">Instruction team</p>
                  <div class="avatars">
                    <span v-for="person in cohort.instructors" :key="person" class="avatar">{{
                      initials(person) }}</span>
                  </div>
                </div>
                <div class="metric">
                  <p class="label">Attendance</p>
                  <p class="strong">{{ cohort.attendance }}%</p>
                </div>
                <div class="metric">
                  <p class="label">Retention</p>
                  <p class="strong">{{ cohort.retention }}%</p>
                </div>
              </div>
              <div class="timeline">
                <div class="line">
                  <div class="cursor" :style="{ left: timelinePosition(cohort) + '%' }"></div>
                </div>
                <div class="timeline-meta">
                  <span>{{ formatDate(cohort.startDate) }}</span>
                  <span>{{ formatDate(cohort.endDate) }}</span>
                </div>
              </div>
            </div>
            <div class="body-right">
              <div class="info-grid">
                <div>
                  <p class="label">Status</p>
                  <p class="strong">{{ cohort.statusLabel }}</p>
                </div>
                <div>
                  <p class="label">Waitlist</p>
                  <p class="strong">{{ cohort.waitlist }}</p>
                </div>
                <div>
                  <p class="label">Start</p>
                  <p class="strong">{{ formatDate(cohort.startDate) }}</p>
                </div>
                <div>
                  <p class="label">End</p>
                  <p class="strong">{{ formatDate(cohort.endDate) }}</p>
                </div>
              </div>
              <div class="pill-row">
                <span class="pill subtle">{{ cohort.delivery }}</span>
                <span class="pill subtle">{{ cohort.timezone }}</span>
              </div>
              <div class="cta-row">
                <button class="ghost" @click="duplicateCohort(cohort)">Duplicate</button>
                <button class="primary-btn" @click="openLessons(cohort)">
                  Go to lessons
                </button>
              </div>
            </div>
          </div>
        </transition>
      </article>
    </section>

    <div v-else class="empty">
      <p class="empty-title">No cohorts yet</p>
      <p class="empty-sub">Create your first cohort to start scheduling lessons.</p>
      <button class="primary-btn" @click="openCreateModal">Create a cohort</button>
    </div>

    <transition name="modal">
      <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
        <div class="modal">
          <header class="modal-header">
            <div>
              <p class="label">New cohort</p>
              <h3>Create a cohort for {{ courseName }}</h3>
            </div>
            <button class="icon" @click="closeModal" aria-label="Close">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M6 6l12 12M6 18L18 6" stroke-width="2" stroke-linecap="round" />
              </svg>
            </button>
          </header>
          <div class="modal-body">
            <div class="field">
              <label>Title</label>
              <input v-model="form.title" type="text" placeholder="Cohort name" />
            </div>
            <div class="field inline">
              <div>
                <label>Code</label>
                <input v-model="form.code" type="text" placeholder="e.g. SPR-2026" />
              </div>
              <div>
                <label>Status</label>
                <select v-model="form.status">
                  <option value="active">Active</option>
                  <option value="upcoming">Upcoming</option>
                  <option value="completed">Completed</option>
                  <option value="paused">Paused</option>
                </select>
              </div>
            </div>
            <div class="field inline">
              <div>
                <label>Start date</label>
                <input v-model="form.startDate" type="date" />
              </div>
              <div>
                <label>End date</label>
                <input v-model="form.endDate" type="date" />
              </div>
            </div>
            <div class="field inline">
              <div>
                <label>Capacity</label>
                <input v-model.number="form.capacity" type="number" min="1" placeholder="50" />
              </div>
              <div>
                <label>Delivery</label>
                <select v-model="form.delivery">
                  <option value="Virtual">Virtual</option>
                  <option value="Hybrid">Hybrid</option>
                  <option value="Onsite">Onsite</option>
                </select>
              </div>
            </div>
            <div class="field">
              <label>Description</label>
              <textarea v-model="form.description" rows="3" placeholder="What makes this cohort unique?" />
            </div>
            <div class="field">
              <label>What You Will Learn</label>
              <div class="rich-editor-wrapper">
                <RichTextEditor :model-value="form.whatYouWillLearn"
                  placeholder="Add learning points as a bulleted list. Press Enter to add each new point..."
                  @update:model-value="(value) => { form.whatYouWillLearn = value; }" />
              </div>
              <p class="field-hint">Use bullet points (•) for each learning outcome. Each point will be displayed with a
                checkmark on the frontend.</p>
            </div>
            <div class="field">
              <label>Zoom Link</label>
              <input v-model="form.zoomUrl" type="url" placeholder="https://zoom.us/j/..." />
            </div>
            <div class="field">
              <label>Cover image</label>
              <div v-if="!imagePreview" class="upload upload-large" @click="triggerUpload" @dragover.prevent
                @drop.prevent="handleDrop">
                <input ref="fileInput" type="file" accept="image/*" class="hidden" @change="handleFile" />
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  style="width: 48px; height: 48px; margin: 0 auto 12px; color: #94a3b8;">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p style="font-weight: 600; margin: 0 0 4px 0;">Drop an image or click to upload</p>
                <p class="hint" style="margin: 0;">PNG, JPG, or GIF (recommended: 1200x600px)</p>
              </div>
              <div v-else class="image-preview-container">
                <img :src="imagePreview" alt="Cover preview" class="preview-image" />
                <button type="button" @click="removeImage" class="remove-image-btn">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Remove
                </button>
              </div>
            </div>

            <!-- Pricing & Access Section -->
            <div style="border-top: 1px solid #e2e8f0; padding-top: 1rem; margin-top: 1rem;">
              <p style="font-weight: 700; margin-bottom: 1rem; color: #0f172a;">💰 Pricing & Access</p>

              <!-- Free/Paid Toggle -->
              <div class="field">
                <label>Access Type</label>
                <div style="display: flex; align-items: center; gap: 1rem;">
                  <button type="button" @click="form.isFree = !form.isFree"
                    style="position: relative; width: 3.5rem; height: 2rem; background: currentColor; border-radius: 999px; border: none; cursor: pointer;"
                    :style="form.isFree ? 'background: #10b981;' : 'background: #d1d5db;'">
                    <span
                      style="position: absolute; top: 0.25rem; left: 0.25rem; width: 1.5rem; height: 1.5rem; background: white; border-radius: 999px; transition: transform 0.3s;"
                      :style="form.isFree ? 'transform: translateX(1.5rem);' : 'transform: translateX(0);'"></span>
                  </button>
                  <span style="font-size: 0.875rem; color: #374151; font-weight: 500;">
                    {{ form.isFree ? 'Free Cohort' : 'Paid Cohort' }}
                  </span>
                </div>
              </div>

              <!-- Cost Input (Only if Paid) -->
              <div v-if="!form.isFree" class="field">
                <label>Cost/Amount</label>
                <div style="position: relative; display: flex; align-items: center;">
                  <span
                    style="position: absolute; left: 0.75rem; font-weight: 600; color: #374151; pointer-events: none;">₦</span>
                  <input v-model.number="form.cost" type="number" min="0" step="0.01" style="padding-left: 2rem;"
                    placeholder="0.00" />
                </div>
                <p style="font-size: 0.75rem; color: #6b7280; margin-top: 0.25rem;">Enter the price for this cohort</p>
              </div>

              <!-- Trial Settings (Only if Paid) -->
              <div v-if="!form.isFree" style="margin-top: 1rem;">
                <label style="font-weight: 700; color: #334155; display: block; margin-bottom: 0.75rem;">Free Trial
                  Setup</label>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; margin-bottom: 1rem;">
                  <label style="position: relative; cursor: pointer;">
                    <input type="radio" v-model="form.trialType" value="watches" name="trial-type"
                      style="position: absolute; opacity: 0;" />
                    <span
                      style="display: flex; align-items: center; gap: 0.5rem; padding: 0.75rem 1rem; border: 2px solid #d1d5db; border-radius: 0.5rem; background: white; font-size: 0.875rem; font-weight: 600; color: #374151; transition: all 0.2s;"
                      :style="form.trialType === 'watches' ? 'border-color: #6366f1; background: #eef2ff; color: #6366f1;' : ''">
                      📺 By Views
                    </span>
                  </label>

                  <label style="position: relative; cursor: pointer;">
                    <input type="radio" v-model="form.trialType" value="days" name="trial-type"
                      style="position: absolute; opacity: 0;" />
                    <span
                      style="display: flex; align-items: center; gap: 0.5rem; padding: 0.75rem 1rem; border: 2px solid #d1d5db; border-radius: 0.5rem; background: white; font-size: 0.875rem; font-weight: 600; color: #374151; transition: all 0.2s;"
                      :style="form.trialType === 'days' ? 'border-color: #6366f1; background: #eef2ff; color: #6366f1;' : ''">
                      📅 By Days
                    </span>
                  </label>
                </div>

                <div v-if="form.trialType" class="field">
                  <label>{{ form.trialType === 'watches' ? 'Number of Free Views' : 'Number of Trial Days' }}</label>
                  <input v-model.number="form.trialValue" type="number" min="1"
                    :placeholder="form.trialType === 'watches' ? 'e.g., 5 videos' : 'e.g., 7 days'" />
                </div>
              </div>
            </div>
          </div>
          <footer class="modal-footer">
            <button class="ghost" @click="closeModal">Cancel</button>
            <button class="primary-btn" :disabled="!isFormValid" @click="saveCohort">Save cohort</button>
          </footer>
        </div>
      </div>
    </transition>

    <!-- Filter Modal -->
    <transition name="modal">
      <div v-if="showFilterModal" class="modal-overlay" @click.self="closeFilterModal">
        <div class="modal filter-modal">
          <header class="modal-header">
            <div>
              <p class="label">Filter Cohorts</p>
              <h3>Filter by status</h3>
            </div>
            <button class="icon" @click="closeFilterModal" aria-label="Close">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M6 6l12 12M6 18L18 6" stroke-width="2" stroke-linecap="round" />
              </svg>
            </button>
          </header>
          <div class="modal-body">
            <div class="filter-options">
              <label class="filter-option" :class="{ active: statusFilter === '' }">
                <input type="radio" v-model="statusFilter" value="" name="status-filter" />
                <span class="radio-custom"></span>
                <span>All Status</span>
              </label>
              <label v-for="item in statusLegend" :key="item.value" class="filter-option"
                :class="{ active: statusFilter === item.value }">
                <input type="radio" v-model="statusFilter" :value="item.value" name="status-filter" />
                <span class="radio-custom"></span>
                <span class="dot" :class="item.value"></span>
                <span>{{ item.label }}</span>
              </label>
            </div>
          </div>
          <footer class="modal-footer">
            <button class="ghost" @click="clearFilter">Clear</button>
            <button class="primary-btn" @click="closeFilterModal">Apply</button>
          </footer>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useToast } from 'vue-toast-notification'
import RichTextEditor from '@/components/RichTextEditor.vue'

type CohortStatus = 'active' | 'upcoming' | 'completed' | 'paused'

type Cohort = {
  id: number
  name: string
  code: string
  image: string
  startDate: string
  endDate: string
  status: CohortStatus
  statusLabel: string
  participants: number
  capacity: number
  waitlist: number
  instructors: string[]
  lessonsReady: number
  totalLessons: number
  attendance: number
  retention: number
  delivery: string
  timezone: string
  description: string
  isFree: boolean
  cost?: number
  trialType?: 'watches' | 'days'
  trialValue?: number
}

const route = useRoute()
const router = useRouter()
const toast = useToast()

const courseSlug = computed(() => route.params.courseSlug as string)
const courseId = computed(() => Number(route.query.courseId) || 0)
const courseName = computed(() => (route.query.courseName as string) || formatTitle(courseSlug.value))

const cohorts = ref<Cohort[]>([
  {
    id: 1,
    name: 'Spring Builders',
    code: 'SPR-2026',
    image: 'https://images.unsplash.com/photo-1489528792649-0cbb86e4aad8?w=1400',
    startDate: '2026-02-05',
    endDate: '2026-03-30',
    status: 'active',
    statusLabel: 'In progress',
    participants: 62,
    capacity: 80,
    waitlist: 6,
    instructors: ['Ada Lovelace', 'Ken Ikeda'],
    lessonsReady: 8,
    totalLessons: 12,
    attendance: 91,
    retention: 88,
    delivery: 'Hybrid',
    timezone: 'GMT+1',
    description: 'Hands-on build focused sprint with weekly demo nights.',
    isFree: false,
    cost: 85000,
    trialType: 'days',
    trialValue: 7
  },
  {
    id: 2,
    name: 'Product Design Studio',
    code: 'PDS-02',
    image: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=1400',
    startDate: '2026-04-10',
    endDate: '2026-05-25',
    status: 'upcoming',
    statusLabel: 'Kickoff scheduled',
    participants: 34,
    capacity: 60,
    waitlist: 0,
    instructors: ['Chidi Okafor'],
    lessonsReady: 4,
    totalLessons: 10,
    attendance: 0,
    retention: 0,
    delivery: 'Virtual',
    timezone: 'GMT+1',
    description: 'Design thinking + visual systems with live critiques.',
    isFree: false,
    cost: 65000,
    trialType: 'watches',
    trialValue: 3
  },
  {
    id: 3,
    name: 'AI Explorers',
    code: 'AI-X1',
    image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1400',
    startDate: '2025-09-01',
    endDate: '2025-11-15',
    status: 'completed',
    statusLabel: 'Wrapped',
    participants: 58,
    capacity: 60,
    waitlist: 0,
    instructors: ['Mary Shen', 'Ola Yusuf'],
    lessonsReady: 10,
    totalLessons: 10,
    attendance: 87,
    retention: 83,
    delivery: 'Hybrid',
    timezone: 'GMT+1',
    description: 'Capstone-heavy AI primer with mentoring pods.',
    isFree: true,
    cost: undefined,
    trialType: undefined,
    trialValue: undefined
  },
  {
    id: 4,
    name: 'Frontend Lab',
    code: 'FE-LAB',
    image: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=1400',
    startDate: '2026-01-10',
    endDate: '2026-02-20',
    status: 'paused',
    statusLabel: 'Temporarily paused',
    participants: 28,
    capacity: 40,
    waitlist: 3,
    instructors: ['Bella Tran'],
    lessonsReady: 6,
    totalLessons: 10,
    attendance: 75,
    retention: 70,
    delivery: 'Onsite',
    timezone: 'GMT+1',
    description: 'UI engineering drills with pair-programming rotations.',
    isFree: false,
    cost: 40000,
    trialType: 'days',
    trialValue: 5
  }
])

const search = ref('')
const statusFilter = ref<CohortStatus | ''>('')
const showOnlyActive = ref(false)
const expanded = ref<Set<number>>(new Set([cohorts.value[0]?.id]))

const showModal = ref(false)
const showFilterModal = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)
const imagePreview = ref<string>('')
const form = ref({
  title: '',
  code: '',
  status: 'active' as CohortStatus,
  startDate: '',
  endDate: '',
  capacity: 40,
  description: '',
  whatYouWillLearn: '',
  delivery: 'Virtual',
  image: '' as string | File,
  zoomUrl: '',
  isFree: true,
  cost: undefined as number | undefined,
  trialType: undefined as 'watches' | 'days' | undefined,
  trialValue: undefined as number | undefined,
})

const statusLegend = [
  { value: 'active', label: 'Active' },
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'paused', label: 'Paused' },
  { value: 'completed', label: 'Completed' }
]

const filteredCohorts = computed(() => {
  const term = search.value.toLowerCase()
  return cohorts.value.filter((c) => {
    const matchesTerm = !term || c.name.toLowerCase().includes(term) || c.code.toLowerCase().includes(term)
    const matchesStatus = !statusFilter.value || c.status === statusFilter.value
    const matchesActive = !showOnlyActive.value || c.status === 'active'
    return matchesTerm && matchesStatus && matchesActive
  })
})

const stats = computed(() => {
  const active = cohorts.value.filter((c) => c.status === 'active').length
  const upcoming = cohorts.value.filter((c) => c.status === 'upcoming').length
  const completed = cohorts.value.filter((c) => c.status === 'completed').length
  const totalLearners = cohorts.value.reduce((acc, c) => acc + c.participants, 0)
  const avgSize = cohorts.value.length ? Math.round(totalLearners / cohorts.value.length) : 0
  const lessonsReady = cohorts.value.reduce((acc, c) => acc + (c.lessonsReady / c.totalLessons || 0), 0)
  const lessonProgress = cohorts.value.length ? Math.round((lessonsReady / cohorts.value.length) * 100) : 0
  return { active, upcoming, completed, totalLearners, avgSize, lessonProgress, lessonsReady: lessonProgress }
})

const isFormValid = computed(() => {
  const basic = Boolean(form.value.title.trim() && form.value.code.trim() && form.value.startDate && form.value.endDate)
  if (!basic) return false

  if (!form.value.isFree) {
    if (form.value.cost === undefined || form.value.cost <= 0) return false
    if (form.value.trialType && (!form.value.trialValue || form.value.trialValue <= 0)) return false
  }

  return true
})

const toggleExpanded = (id: number) => {
  const next = new Set(expanded.value)
  if (next.has(id)) next.delete(id)
  else next.add(id)
  expanded.value = next
}

const goBack = () => router.back()

const formatTitle = (slug?: string) => {
  if (!slug) return 'Course'
  const spaced = slug.replace(/-/g, ' ')
  return spaced.charAt(0).toUpperCase() + spaced.slice(1)
}

const formatDate = (date: string) => {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const renderDateRange = (start: string, end: string) => `${formatDate(start)} → ${formatDate(end)}`

const daysLeft = (cohort: Cohort) => {
  const today = new Date()
  const end = new Date(cohort.endDate)
  const diff = Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  if (cohort.status === 'completed') return 'Done'
  if (diff <= 0) return 'Ends today'
  return `${diff} days`
}

const timelinePosition = (cohort: Cohort) => {
  const start = new Date(cohort.startDate).getTime()
  const end = new Date(cohort.endDate).getTime()
  const today = Date.now()
  if (today <= start) return 4
  if (today >= end) return 96
  return Math.min(96, Math.max(4, ((today - start) / (end - start)) * 100))
}

const loadImage = (src?: string) => {
  if (!src) return 'https://via.placeholder.com/1200x600?text=Cohort'
  if (src.startsWith('http') || src.startsWith('data:')) return src
  return import.meta.env.VITE_ASSETS_BASE_URL + '/' + src
}

const initials = (name: string) => {
  return name
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0]?.toUpperCase())
    .join('')
    .slice(0, 2)
}

const openLessons = (cohort: Cohort) => {
  router.push({
    name: 'Program Course Lessons',
    params: { courseSlug: courseSlug.value },
    query: { courseName: courseName.value, courseId: courseId.value, cohortId: cohort.id }
  })
}

const duplicateCohort = (cohort: Cohort) => {
  const copy = { ...cohort, id: Date.now(), name: `${cohort.name} Copy`, code: cohort.code + '-COPY', status: 'upcoming' as CohortStatus }
  cohorts.value.unshift(copy)
  toast.success('Cohort duplicated')
}

const openCreateModal = () => {
  resetForm()
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
}

const closeFilterModal = () => {
  showFilterModal.value = false
}

const clearFilter = () => {
  statusFilter.value = ''
  showFilterModal.value = false
}

const resetForm = () => {
  form.value = {
    title: '',
    code: '',
    status: 'active',
    startDate: '',
    endDate: '',
    capacity: 40,
    description: '',
    whatYouWillLearn: '',
    delivery: 'Virtual',
    image: '',
    zoomUrl: '',
    isFree: true,
    cost: undefined,
    trialType: undefined,
    trialValue: undefined,
  }
  imagePreview.value = ''
}

const triggerUpload = () => fileInput.value?.click()

const handleFile = (e: Event) => {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    form.value.image = file
    const reader = new FileReader()
    reader.onload = (e) => {
      imagePreview.value = e.target?.result as string
    }
    reader.readAsDataURL(file)
  }
}

const handleDrop = (e: DragEvent) => {
  const file = e.dataTransfer?.files?.[0]
  if (file) {
    form.value.image = file
    const reader = new FileReader()
    reader.onload = (e) => {
      imagePreview.value = e.target?.result as string
    }
    reader.readAsDataURL(file)
  }
}

const removeImage = () => {
  form.value.image = ''
  imagePreview.value = ''
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

const saveCohort = () => {
  if (!isFormValid.value) return
  const newCohort: Cohort = {
    id: Date.now(),
    name: form.value.title,
    code: form.value.code,
    image: typeof form.value.image === 'string' ? form.value.image : URL.createObjectURL(form.value.image),
    startDate: form.value.startDate,
    endDate: form.value.endDate,
    status: form.value.status,
    statusLabel: form.value.status === 'active' ? 'In progress' : form.value.status === 'upcoming' ? 'Kickoff scheduled' : form.value.status === 'completed' ? 'Wrapped' : 'Paused',
    participants: 0,
    capacity: form.value.capacity || 40,
    waitlist: 0,
    instructors: [],
    lessonsReady: 0,
    totalLessons: 0,
    attendance: 0,
    retention: 0,
    delivery: form.value.delivery,
    timezone: 'GMT+1',
    description: form.value.description || 'Cohort details to be added.',
    isFree: form.value.isFree,
    cost: !form.value.isFree ? form.value.cost : undefined,
    trialType: !form.value.isFree ? form.value.trialType : undefined,
    trialValue: !form.value.isFree ? form.value.trialValue : undefined,
  }
  cohorts.value.unshift(newCohort)
  showModal.value = false
  toast.success('Cohort created')
}
</script>

<style scoped>
.cohorts-page {
  min-height: 100vh;
  padding: 2rem 0 3rem;
  color: #0f172a;
}

.page-header {
  display: flex;
  justify-content: space-between;
  gap: 1.5rem;
  align-items: flex-start;
  margin-bottom: 1.5rem;
}

.header-left {
  display: flex;
  gap: 1rem;
}

.back-btn {
  width: 42px;
  height: 42px;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
  background: #fff;
  display: grid;
  place-items: center;
  color: #475569;
  transition: all 0.2s ease;
}

.back-btn:hover {
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.08);
  transform: translateX(-2px);
}

.eyebrow {
  margin: 0;
  color: #64748b;
  font-weight: 600;
  font-size: 0.85rem;
}

.page-title {
  margin: 0.2rem 0;
  font-size: 2rem;
  font-weight: 800;
  letter-spacing: -0.02em;
}

.page-subtitle {
  margin: 0;
  color: #64748b;
}

.header-actions {
  display: flex;
  gap: 0.75rem;
  align-items: center;
}

.filter-btn {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
  border-radius: 10px;
  background: #fff;
  border: 1px solid #e2e8f0;
  color: #475569;
  cursor: pointer;
  transition: all 0.2s ease;
}

.filter-btn:hover {
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.08);
  border-color: #6366f1;
  color: #6366f1;
}

.filter-btn.active {
  background: #e0e7ff;
  border-color: #6366f1;
  color: #6366f1;
}

.filter-btn svg {
  width: 20px;
  height: 20px;
}

.filter-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  width: 18px;
  height: 18px;
  border-radius: 999px;
  background: #6366f1;
  color: #fff;
  font-size: 0.7rem;
  font-weight: 700;
  display: grid;
  place-items: center;
}

.dot {
  width: 10px;
  height: 10px;
  border-radius: 999px;
  background: #cbd5e1;
}

.dot.active {
  background: #22c55e;
}

.dot.upcoming {
  background: #f59e0b;
}

.dot.paused {
  background: #94a3b8;
}

.dot.completed {
  background: #10b981;
}

.primary-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.2rem;
  border-radius: 10px;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: #fff;
  border: none;
  font-weight: 700;
  box-shadow: 0 12px 30px rgba(99, 102, 241, 0.25);
  cursor: pointer;
  transition: transform 0.2s ease;
}

.primary-btn:hover {
  transform: translateY(-1px);
}

.top-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.stat-card {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 1rem;
  padding: 1rem 1.25rem;
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.05);
}

.stat-card.wide {
  grid-column: span 2;
}

.label {
  font-size: 0.85rem;
  color: #64748b;
  margin: 0;
}

.stat-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0.35rem 0;
}

.stat-row.between {
  justify-content: space-between;
  gap: 1rem;
}

.stat-number {
  font-size: 1.8rem;
  font-weight: 800;
  margin: 0;
  color: #0f172a;
}

.stat-number.sm {
  font-size: 1.3rem;
}

.hint {
  color: #94a3b8;
  margin: 0;
  font-size: 0.9rem;
}

.pill {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.35rem 0.75rem;
  border-radius: 999px;
  font-weight: 700;
  text-transform: capitalize;
  border: 1px solid transparent;
}

.pill.success {
  background: #ecfdf3;
  color: #15803d;
  border-color: #bbf7d0;
}

.pill.info {
  background: #eef2ff;
  color: #4338ca;
  border-color: #c7d2fe;
}

.pill.muted {
  background: #f1f5f9;
  color: #475569;
  border-color: #e2e8f0;
}

.pill.active {
  background: #ecfdf3;
  color: #166534;
  border-color: #bbf7d0;
}

.pill.upcoming {
  background: #fef9c3;
  color: #92400e;
  border-color: #fde68a;
}

.pill.paused {
  background: #f8fafc;
  color: #475569;
  border-color: #e2e8f0;
}

.pill.completed {
  background: #e0f2fe;
  color: #075985;
  border-color: #bae6fd;
}

.pill.subtle {
  background: #f8fafc;
  color: #475569;
  border-color: #e2e8f0;
}

.progress {
  height: 8px;
  background: #e2e8f0;
  border-radius: 999px;
  overflow: hidden;
}

.bar {
  height: 100%;
  background: linear-gradient(135deg, #6366f1, #22c55e);
}

.filters {
  display: flex;
  gap: 1rem;
  align-items: center;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.search-box {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.8rem 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  background: #fff;
  box-shadow: 0 6px 18px rgba(15, 23, 42, 0.04);
}

.search-box input {
  border: none;
  outline: none;
  width: 100%;
  font-size: 0.95rem;
}

.search-box svg {
  width: 18px;
  height: 18px;
  color: #94a3b8;
}

.toggle input {
  accent-color: #6366f1;
}

.toggle label {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: #475569;
  font-weight: 600;
}

.cohort-stack {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.cohort-card {
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  background: #fff;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.05);
}

.cohort-header {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem 1.25rem;
  align-items: center;
  cursor: pointer;
}

.title-block {
  display: flex;
  gap: 0.75rem;
  align-items: center;
}

.cohort-name {
  margin: 0;
  font-size: 1.15rem;
  font-weight: 800;
}

.cohort-meta {
  margin: 0.1rem 0 0;
  color: #64748b;
}

.header-right {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.spark {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 0.55rem 0.85rem;
  min-width: 110px;
}

.spark .strong {
  margin: 0.1rem 0 0;
  font-weight: 800;
  color: #0f172a;
}

.spark .muted {
  color: #94a3b8;
  font-weight: 600;
  margin-left: 0.15rem;
}

.collapse-btn {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
  background: #fff;
  display: grid;
  place-items: center;
  color: #475569;
}

.cohort-body {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 1rem;
  padding: 0 1.25rem 1.25rem;
}

.body-left {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.banner {
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  height: 180px;
  background-size: cover;
  background-position: center;
}

.overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(15, 23, 42, 0.35), rgba(15, 23, 42, 0.75));
  color: #e2e8f0;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  gap: 0.25rem;
}

.overlay-title {
  margin: 0;
  font-weight: 800;
  color: #fff;
}

.overlay-sub {
  margin: 0;
  color: #cbd5e1;
  max-width: 80%;
}

.row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 0.75rem;
}

.metric {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 0.75rem;
}

.metric .strong {
  margin: 0.1rem 0 0;
  font-weight: 800;
}

.avatars {
  display: flex;
  gap: 0.35rem;
}

.avatar {
  width: 36px;
  height: 36px;
  border-radius: 999px;
  background: #6366f1;
  color: #fff;
  display: grid;
  place-items: center;
  font-weight: 700;
}

.timeline {
  margin-top: 0.25rem;
}

.line {
  position: relative;
  height: 6px;
  background: #e2e8f0;
  border-radius: 999px;
  overflow: hidden;
}

.cursor {
  position: absolute;
  top: -4px;
  width: 14px;
  height: 14px;
  background: #22c55e;
  border-radius: 50%;
  box-shadow: 0 6px 16px rgba(34, 197, 94, 0.35);
}

.timeline-meta {
  display: flex;
  justify-content: space-between;
  color: #94a3b8;
  font-weight: 600;
  margin-top: 0.35rem;
}

.body-right {
  background: #0f172a;
  color: #e2e8f0;
  border-radius: 14px;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.75rem;
}

.info-grid .strong {
  margin: 0.15rem 0 0;
  font-weight: 800;
}

.pill-row {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.cta-row {
  display: flex;
  justify-content: space-between;
  gap: 0.5rem;
}

.ghost {
  border: 1px solid #334155;
  background: transparent;
  color: #e2e8f0;
  padding: 0.65rem 0.9rem;
  border-radius: 10px;
  font-weight: 700;
  cursor: pointer;
}

.empty {
  text-align: center;
  padding: 3rem 1rem;
  background: #fff;
  border: 1px dashed #e2e8f0;
  border-radius: 16px;
}

.empty-title {
  margin: 0 0 0.35rem;
  font-size: 1.5rem;
  font-weight: 800;
}

.empty-sub {
  margin: 0 0 1rem;
  color: #64748b;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.55);
  display: grid;
  place-items: center;
  z-index: 50;
  padding: 1rem;
}

.modal {
  background: #fff;
  border-radius: 16px;
  width: min(720px, 100%);
  max-height: 90vh;
  overflow: auto;
  box-shadow: 0 30px 60px rgba(15, 23, 42, 0.18);
}

.modal.filter-modal {
  width: min(480px, 100%);
}

.filter-options {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.filter-option {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.85rem 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  background: #f8fafc;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
}

.filter-option:hover {
  border-color: #cbd5e1;
  background: #fff;
}

.filter-option.active {
  border-color: #6366f1;
  background: #eef2ff;
}

.filter-option input[type="radio"] {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}

.radio-custom {
  width: 20px;
  height: 20px;
  border: 2px solid #cbd5e1;
  border-radius: 999px;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.filter-option.active .radio-custom {
  border-color: #6366f1;
  background: #6366f1;
  box-shadow: inset 0 0 0 4px #fff;
}

.filter-option span {
  font-weight: 600;
  color: #334155;
}

.modal-header {
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-body {
  padding: 1.25rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.modal-footer {
  padding: 1.25rem 1.5rem;
  border-top: 1px solid #e2e8f0;
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.field.inline {
  flex-direction: row;
  gap: 1rem;
}

.field.inline>div {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.field label {
  font-weight: 700;
  color: #334155;
}

.field input,
.field select,
.field textarea {
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 0.65rem 0.8rem;
  font-size: 1rem;
  background: #f8fafc;
}

.field textarea {
  resize: vertical;
}

.rich-editor-wrapper {
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  overflow: hidden;
  background: #f8fafc;
  transition: all 0.2s ease;
}

.rich-editor-wrapper:focus-within {
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
  background: #fff;
}

.field-hint {
  font-size: 0.8rem;
  color: #64748b;
  margin: 0.35rem 0 0 0;
  line-height: 1.4;
}

.upload {
  border: 2px dashed #cbd5e1;
  border-radius: 12px;
  padding: 1rem;
  text-align: center;
  color: #475569;
  cursor: pointer;
  background: #f8fafc;
  transition: all 0.2s ease;
}

.upload:hover {
  border-color: #94a3b8;
  background: #f1f5f9;
}

.upload-large {
  padding: 2.5rem 1.5rem;
  min-height: 180px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.image-preview-container {
  position: relative;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  overflow: hidden;
  background: #f8fafc;
}

.preview-image {
  width: 100%;
  height: auto;
  max-height: 300px;
  object-fit: cover;
  display: block;
}

.remove-image-btn {
  position: absolute;
  top: 12px;
  right: 12px;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  background: rgba(239, 68, 68, 0.95);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
  backdrop-filter: blur(4px);
}

.remove-image-btn:hover {
  background: #dc2626;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);
}

.remove-image-btn svg {
  width: 16px;
  height: 16px;
  stroke-width: 2.5;
}

.hidden {
  display: none;
}

.icon {
  border: none;
  background: transparent;
  color: #475569;
  cursor: pointer;
}

.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.2s ease;
}

.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

@media (max-width: 1024px) {
  .cohort-body {
    grid-template-columns: 1fr;
  }

  .header-right {
    flex-wrap: wrap;
  }

  .stat-card.wide {
    grid-column: span 1;
  }
}

@media (max-width: 720px) {
  .page-header {
    flex-direction: column;
  }

  .header-actions {
    width: 100%;
    align-items: flex-start;
  }

  .header-right {
    width: 100%;
    justify-content: flex-start;
  }

  .cohort-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .header-right {
    width: 100%;
  }

  .spark {
    width: 100%;
  }

  .field.inline {
    flex-direction: column;
  }
}
</style>
