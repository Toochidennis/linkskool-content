<template>
  <div class="challenge-create-view">
    <header class="create-header">
      <div>
        <button class="back-link" type="button" @click="goBack">
          <i class="fas fa-arrow-left"></i>
          <span>Back to challenge list</span>
        </button>
        <p class="header-eyebrow">Challenge Builder</p>
        <h1 class="header-title">Create {{ examTypeName }} Challenge</h1>
        <p class="header-subtitle">
          Set up challenge details and configure subject coverage before publishing.
        </p>
      </div>

      <div class="header-actions">
        <button class="btn-secondary" type="button" @click="saveDraft">Save Draft</button>
        <button class="btn-primary" type="button" :disabled="!isFormReady" @click="createChallenge">
          Create Challenge
        </button>
      </div>
    </header>

    <section class="collapsible-card">
      <button class="collapsible-card__header" type="button" @click="isDetailsOpen = !isDetailsOpen">
        <div>
          <p class="collapsible-card__eyebrow">Step 1</p>
          <h2>Challenge Details</h2>
        </div>
        <i class="fas" :class="isDetailsOpen ? 'fa-chevron-up' : 'fa-chevron-down'"></i>
      </button>

      <div v-if="isDetailsOpen" class="collapsible-card__body">
        <div class="form-grid two-columns">
          <div class="form-group full-width">
            <label>Title</label>
            <input v-model="form.title" type="text" class="form-input"
              placeholder="e.g. JAMB Master Challenge - Week 1" />
          </div>

          <div class="form-group full-width">
            <label>Description</label>
            <RichTextEditor v-model="form.description"
              placeholder="Briefly describe the objective, target audience, and structure of this challenge." />
          </div>

          <div class="form-group">
            <label>Start Date</label>
            <input v-model="form.startDate" type="date" class="form-input" />
          </div>

          <div class="form-group">
            <label>End Date</label>
            <input v-model="form.endDate" type="date" class="form-input" />
          </div>

          <div class="form-group">
            <label>Start Time</label>
            <input v-model="form.startTime" type="time" class="form-input" />
          </div>

          <div class="form-group">
            <label>End Time</label>
            <input v-model="form.endTime" type="time" class="form-input" />
          </div>

          <div class="form-group">
            <label>Duration (minutes)</label>
            <input v-model.number="form.duration" type="number" min="1" class="form-input" placeholder="60" />
          </div>

          <div class="form-group">
            <label>Reward</label>
            <input v-model="form.reward" type="text" class="form-input"
              placeholder="e.g. Scholarship badge + 5,000 points" />
          </div>
        </div>
      </div>
    </section>

    <section class="collapsible-card">
      <button class="collapsible-card__header" type="button" @click="isSubjectsOpen = !isSubjectsOpen">
        <div>
          <p class="collapsible-card__eyebrow">Step 2</p>
          <h2>Subject Configuration</h2>
        </div>
        <i class="fas" :class="isSubjectsOpen ? 'fa-chevron-up' : 'fa-chevron-down'"></i>
      </button>

      <div v-if="isSubjectsOpen" class="collapsible-card__body">
        <div class="subjects-toolbar">
          <p>
            Select up to <strong>4 subjects</strong>. Each subject can have <strong>multiple
              years</strong>.
          </p>
          <button type="button" class="btn-outline" :disabled="!canAddSubject || !subjectCatalog.length"
            @click="addSubjectRow">
            <i class="fas fa-plus"></i>
            <span>Add Subject</span>
          </button>
        </div>

        <div class="subject-counter">{{ subjectRows.length }} / {{ maxSubjects }} subjects selected</div>
        <p v-if="isLoadingSubjects" class="subject-loading-note">Loading subjects and years...</p>
        <p v-else-if="!subjectCatalog.length" class="subject-loading-note">No subject data available for this exam type.
        </p>

        <div class="subject-list">
          <article v-for="(row, index) in subjectRows" :key="row.id" class="subject-card">
            <header class="subject-card__header">
              <h3>Subject {{ index + 1 }}</h3>
              <button v-if="subjectRows.length > 1" type="button" class="remove-subject"
                @click="removeSubjectRow(row.id)">
                Remove
              </button>
            </header>

            <div class="form-grid three-columns">
              <div class="form-group">
                <label>Subject</label>
                <select v-model="row.subject" class="form-input" :disabled="!subjectCatalog.length"
                  @change="handleSubjectChange(row.id)">
                  <option value="" disabled>Select a subject</option>
                  <option v-for="option in getSubjectOptions(row.id)" :key="option" :value="option">
                    {{ option }}
                  </option>
                </select>
              </div>

              <div class="form-group years-group">
                <label>Years</label>
                <div class="years-selector">
                  <button type="button" class="year-select-trigger form-input" @click="toggleYearDropdown(row.id)">
                    <span>{{ row.years.length ? `${row.years.length} year(s) selected` : 'Select years' }}</span>
                    <i class="fas" :class="row.isYearDropdownOpen ? 'fa-chevron-up' : 'fa-chevron-down'"></i>
                  </button>

                  <div v-if="row.isYearDropdownOpen" class="year-dropdown">
                    <input v-model="row.yearSearch" type="text" class="year-search-input"
                      placeholder="Search year..." />

                    <div class="year-options">
                      <button v-for="year in getFilteredYearOptions(row.id)" :key="year" type="button"
                        class="year-option" :class="{ 'year-option--selected': row.years.includes(year) }"
                        @click="toggleYear(row.id, year)">
                        <span>{{ year }}</span>
                        <i v-if="row.years.includes(year)" class="fas fa-check"></i>
                      </button>
                    </div>
                  </div>
                </div>

                <div class="year-chip-list">
                  <span v-for="year in row.years" :key="year" class="year-chip">
                    {{ year }}
                    <button type="button" @click="removeYear(row.id, year)">
                      <i class="fas fa-times"></i>
                    </button>
                  </span>
                </div>
              </div>

              <div class="form-group">
                <label>Questions</label>
                <input v-model.number="row.questions" type="number" min="1" class="form-input" placeholder="20" />
              </div>
            </div>
          </article>
        </div>

        <footer class="subject-summary">
          <div>
            <p class="subject-summary__label">Subjects Selected</p>
            <p class="subject-summary__value">{{ selectedSubjectCount }}</p>
          </div>
          <div>
            <p class="subject-summary__label">Total Questions</p>
            <p class="subject-summary__value">{{ totalQuestions }}</p>
          </div>
          <div>
            <p class="subject-summary__label">Total Years</p>
            <p class="subject-summary__value">{{ totalYearsTagged }}</p>
          </div>
        </footer>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useToast } from 'vue-toast-notification'
import RichTextEditor from '@/components/RichTextEditor.vue'
import { useChallenge } from '@/composables/useChallenge'

interface SubjectRow {
  id: number
  subject: string
  years: number[]
  yearSearch: string
  isYearDropdownOpen: boolean
  questions: number | null
}

const maxSubjects = 4

const route = useRoute()
const router = useRouter()
const toast = useToast()
const { subjectsWithYears, isLoadingSubjects, fetchSubjectsWithYears } = useChallenge()

const isDetailsOpen = ref(true)
const isSubjectsOpen = ref(true)

const form = ref({
  title: '',
  description: '',
  startDate: '',
  endDate: '',
  startTime: '',
  endTime: '',
  duration: null as number | null,
  reward: '',
})

const subjectRows = ref<SubjectRow[]>([
  {
    id: 1,
    subject: '',
    years: [],
    yearSearch: '',
    isYearDropdownOpen: false,
    questions: null,
  },
])

const examTypeName = computed(() => {
  const value = route.query.name
  return typeof value === 'string' && value.trim() ? value : 'Exam Type'
})

const canAddSubject = computed(() => subjectRows.value.length < maxSubjects)

const subjectCatalog = computed(() => subjectsWithYears.value.map(subject => subject.courseName))

const selectedSubjects = computed(() =>
  subjectRows.value.map(row => row.subject).filter(Boolean),
)

const selectedSubjectCount = computed(() => selectedSubjects.value.length)

const getYearsSelectedByOtherRows = (rowId: number, subjectName: string) => {
  const years = new Set<number>()

  if (!subjectName) {
    return years
  }

  subjectRows.value.forEach(row => {
    if (row.id !== rowId && row.subject === subjectName) {
      row.years.forEach(year => years.add(year))
    }
  })

  return years
}

const subjectYearMap = computed(() => {
  const map = new Map<string, number[]>()

  subjectsWithYears.value.forEach(subject => {
    const years = Array.from(new Set(subject.years.map(item => item.year))).sort((a, b) => b - a)
    map.set(subject.courseName, years)
  })

  return map
})

const totalQuestions = computed(() =>
  subjectRows.value.reduce((sum, row) => sum + (row.questions || 0), 0),
)

const totalYearsTagged = computed(() =>
  subjectRows.value.reduce((sum, row) => sum + row.years.length, 0),
)

const getPlainText = (value: string) =>
  value
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

const isFormReady = computed(() => {
  const hasCoreDetails =
    form.value.title.trim() &&
    getPlainText(form.value.description) &&
    form.value.startDate &&
    form.value.endDate &&
    form.value.startTime &&
    form.value.endTime &&
    (form.value.duration || 0) > 0

  const subjectConfigReady = subjectRows.value.every(
    row => row.subject && row.years.length > 0 && (row.questions || 0) > 0,
  )

  return Boolean(hasCoreDetails && subjectConfigReady)
})

const getSubjectOptions = (rowId: number) => {
  const currentRow = subjectRows.value.find(row => row.id === rowId)
  const currentValue = currentRow?.subject

  return subjectCatalog.value.filter((subject: string) => {
    if (subject === currentValue) {
      return true
    }

    return !selectedSubjects.value.includes(subject)
  })
}

const getYearOptionsForSubject = (subjectName: string) => {
  const years = subjectYearMap.value.get(subjectName)
  return Array.isArray(years) ? years : []
}

const addSubjectRow = () => {
  if (!canAddSubject.value) {
    return
  }

  subjectRows.value.push({
    id: Date.now(),
    subject: '',
    years: [],
    yearSearch: '',
    isYearDropdownOpen: false,
    questions: null,
  })
}

const removeSubjectRow = (id: number) => {
  subjectRows.value = subjectRows.value.filter(row => row.id !== id)
}

const handleSubjectChange = (rowId: number) => {
  const row = subjectRows.value.find(item => item.id === rowId)
  if (!row) return

  const allowedYears = new Set(getYearOptionsForSubject(row.subject))
  const usedYearsInSameSubject = getYearsSelectedByOtherRows(rowId, row.subject)

  row.years = row.years.filter(
    year => allowedYears.has(year) && !usedYearsInSameSubject.has(year),
  )
  row.yearSearch = ''
}

const toggleYearDropdown = (rowId: number) => {
  const row = subjectRows.value.find(item => item.id === rowId)
  if (!row) return

  subjectRows.value.forEach(subjectRow => {
    if (subjectRow.id !== rowId) {
      subjectRow.isYearDropdownOpen = false
    }
  })

  row.isYearDropdownOpen = !row.isYearDropdownOpen
}

const getFilteredYearOptions = (rowId: number) => {
  const row = subjectRows.value.find(item => item.id === rowId)
  if (!row) {
    return []
  }

  const availableYears = getYearOptionsForSubject(row.subject)
  if (!availableYears.length) {
    return []
  }

  const yearsInOtherRows = getYearsSelectedByOtherRows(rowId, row.subject)
  const selectableYears = availableYears.filter(
    year => row.years.includes(year) || !yearsInOtherRows.has(year),
  )

  const query = row.yearSearch.trim().toLowerCase()
  if (!query) {
    return selectableYears
  }

  return selectableYears.filter(year => String(year).includes(query))
}

const toggleYear = (rowId: number, year: number) => {
  const row = subjectRows.value.find(item => item.id === rowId)
  if (!row) return

  if (row.years.includes(year)) {
    row.years = row.years.filter(item => item !== year)
    return
  }

  const yearsInOtherRows = getYearsSelectedByOtherRows(rowId, row.subject)
  if (yearsInOtherRows.has(year)) {
    toast.warning(`Year ${year} is already selected in another ${row.subject} row`)
    return
  }

  row.years.push(year)
  row.years.sort((a, b) => b - a)
}

const removeYear = (rowId: number, year: number) => {
  const row = subjectRows.value.find(item => item.id === rowId)
  if (!row) return

  row.years = row.years.filter(item => item !== year)
}

const goBack = () => {
  router.push({
    name: 'Challenge Detail',
    params: { examTypeId: String(route.params.examTypeId || '') },
    query: {
      name: route.query.name,
      shortname: route.query.shortname,
    },
  })
}

const saveDraft = () => {
  toast.success('Draft saved locally (demo mode)')
}

const createChallenge = () => {
  if (!isFormReady.value) {
    toast.error('Complete all required fields before creating the challenge')
    return
  }

  toast.success('Challenge created (demo mode)')
}

onMounted(() => {
  const examTypeId = Number(route.params.examTypeId)
  if (!Number.isInteger(examTypeId) || examTypeId <= 0) {
    return
  }

  fetchSubjectsWithYears(examTypeId).catch(() => undefined)
})
</script>

<style scoped>
.challenge-create-view {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
}

.create-header {
  border-radius: 1.2rem;
  border: 1px solid var(--theme-border);
  background: linear-gradient(145deg, var(--theme-surface) 0%, var(--theme-surface-soft) 100%);
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.06);
  padding: 1.2rem;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
}

.back-link {
  border: none;
  background: transparent;
  padding: 0;
  margin-bottom: 0.75rem;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--theme-text-muted);
  font-weight: 600;
  cursor: pointer;
}

.header-eyebrow {
  margin: 0;
  font-size: 0.74rem;
  font-weight: 700;
  letter-spacing: 0.13em;
  text-transform: uppercase;
  color: var(--theme-accent);
}

.header-title {
  margin: 0.25rem 0;
  font-size: 1.7rem;
  color: var(--theme-text);
}

.header-subtitle {
  margin: 0;
  color: var(--theme-text-muted);
  max-width: 700px;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 0.65rem;
}

.btn-primary,
.btn-secondary,
.btn-outline {
  border: none;
  cursor: pointer;
  font-weight: 600;
}

.btn-primary,
.btn-secondary {
  border-radius: 0.75rem;
  padding: 0.7rem 1rem;
}

.btn-primary {
  background: var(--theme-accent);
  color: var(--theme-surface);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-secondary {
  background: var(--theme-surface-muted);
  color: var(--theme-text);
}

.collapsible-card {
  border-radius: 1.2rem;
  border: 1px solid var(--theme-border);
  background: var(--theme-surface);
  box-shadow: 0 10px 28px rgba(15, 23, 42, 0.05);
}

.collapsible-card__header {
  width: 100%;
  border: none;
  background: transparent;
  padding: 1rem 1.1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  text-align: left;
  cursor: pointer;
}

.collapsible-card__eyebrow {
  margin: 0;
  font-size: 0.72rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--theme-accent);
  font-weight: 700;
}

.collapsible-card__header h2 {
  margin: 0.2rem 0 0;
  font-size: 1.1rem;
  color: var(--theme-text);
}

.collapsible-card__body {
  padding: 0 1.1rem 1.1rem;
}

.form-grid {
  display: grid;
  gap: 0.9rem;
}

.two-columns {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.three-columns {
  grid-template-columns: 1.2fr 1.8fr 1fr;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
}

.form-group label {
  color: var(--theme-text-muted);
  font-weight: 600;
  font-size: 0.87rem;
}

.form-input {
  width: 100%;
  border: 1px solid var(--theme-border-strong);
  border-radius: 0.75rem;
  padding: 0.68rem 0.8rem;
  font-size: 0.9rem;
  background: var(--theme-surface);
  color: var(--theme-text);
}

.form-input:focus {
  outline: none;
  border-color: var(--theme-accent);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--theme-accent) 20%, transparent);
}

.full-width {
  grid-column: 1 / -1;
}

.subjects-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
  margin-bottom: 0.75rem;
}

.subjects-toolbar p {
  margin: 0;
  color: var(--theme-text-muted);
}

.btn-outline {
  border: 1px solid var(--theme-border-strong);
  border-radius: 0.75rem;
  padding: 0.6rem 0.85rem;
  background: var(--theme-surface);
  color: var(--theme-text);
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
}

.btn-outline:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.subject-counter {
  font-size: 0.83rem;
  color: var(--theme-text-muted);
  margin-bottom: 0.7rem;
}

.subject-loading-note {
  margin: -0.3rem 0 0.75rem;
  font-size: 0.82rem;
  color: var(--theme-text-subtle);
}

.subject-list {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

.subject-card {
  border: 1px solid var(--theme-border);
  border-radius: 1rem;
  background: var(--theme-surface-soft);
  padding: 0.9rem;
}

.subject-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

.subject-card__header h3 {
  margin: 0;
  font-size: 0.95rem;
  color: var(--theme-text);
}

.remove-subject {
  border: none;
  background: color-mix(in srgb, var(--theme-danger) 15%, var(--theme-surface));
  color: var(--theme-danger);
  font-weight: 600;
  border-radius: 9999px;
  padding: 0.3rem 0.65rem;
  cursor: pointer;
}

.years-selector {
  position: relative;
}

.year-select-trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.6rem;
  cursor: pointer;
}

.year-select-trigger i {
  color: var(--theme-text-subtle);
}

.year-dropdown {
  position: absolute;
  top: calc(100% + 0.4rem);
  left: 0;
  right: 0;
  border: 1px solid var(--theme-border-strong);
  border-radius: 0.75rem;
  background: var(--theme-surface);
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.12);
  z-index: 20;
  overflow: hidden;
}

.year-search-input {
  width: 100%;
  border: none;
  border-bottom: 1px solid var(--theme-border);
  padding: 0.6rem 0.75rem;
  font-size: 0.85rem;
  background: var(--theme-surface);
  color: var(--theme-text);
}

.year-search-input:focus {
  outline: none;
  border-bottom-color: var(--theme-accent);
}

.year-options {
  max-height: 200px;
  overflow-y: auto;
  padding: 0.35rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.year-option {
  border: none;
  background: transparent;
  color: var(--theme-text);
  border-radius: 0.5rem;
  padding: 0.45rem 0.55rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  font-size: 0.84rem;
}

.year-option:hover {
  background: var(--theme-accent-soft);
}

.year-option--selected {
  background: var(--theme-accent-soft);
  color: var(--theme-accent);
  font-weight: 700;
}

.year-chip-list {
  margin-top: 0.55rem;
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
}

.year-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  background: var(--theme-accent-soft);
  color: var(--theme-accent);
  border-radius: 9999px;
  padding: 0.2rem 0.5rem;
  font-size: 0.78rem;
  font-weight: 700;
}

.year-chip button {
  border: none;
  background: transparent;
  color: inherit;
  cursor: pointer;
  padding: 0;
}

.subject-summary {
  margin-top: 0.95rem;
  border-radius: 0.9rem;
  background: var(--theme-accent);
  color: var(--theme-surface);
  padding: 0.8rem 0.9rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.9rem;
  flex-wrap: wrap;
}

.subject-summary__label {
  margin: 0;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  opacity: 0.75;
}

.subject-summary__value {
  margin: 0.18rem 0 0;
  font-size: 1.35rem;
  font-weight: 800;
}

@media (max-width: 900px) {
  .challenge-create-view {
    padding: 1rem;
  }

  .two-columns,
  .three-columns {
    grid-template-columns: 1fr;
  }

  .header-actions {
    width: 100%;
    justify-content: flex-end;
  }
}
</style>
