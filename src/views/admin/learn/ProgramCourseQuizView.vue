<template>
  <div class="quiz-page">
    <header class="quiz-header">
      <div class="header-left">
        <button class="back-btn" @click="goBack" aria-label="Go back">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M19 12H5M12 19l-7-7 7-7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </button>
        <div>
          <p class="eyebrow">{{ courseTitle }} - Quiz</p>
          <h1 class="page-title">{{ lessonTitle || 'Lesson Quiz' }}</h1>
          <p class="page-subtitle">Build multiple-choice questions for this lesson</p>
        </div>
      </div>
      <div class="header-actions">
        <button class="ghost-btn" @click="openPreview" :disabled="questions.length === 0">
          Preview
        </button>
        <button class="primary-btn" @click="addQuestion">Add question</button>
      </div>
    </header>

    <section v-if="isLoading" class="state-card">
      <p>Loading quiz questions...</p>
    </section>

    <section v-else class="quiz-body">
      <div v-if="questions.length === 0" class="empty-state">
        <h3>No questions yet</h3>
        <p>Create your first quiz question to get started.</p>
        <button class="primary-btn" @click="addQuestion">Add first question</button>
      </div>

      <div v-else class="question-list">
        <article v-for="(question, index) in questions" :key="question.localId" class="question-card"
          :class="{ collapsed: !isExpanded(question) }">
          <header class="card-header" @click="toggleQuestion(question)">
            <div class="card-title">
              <span class="index-pill">Question {{ index + 1 }}</span>
              <span v-if="question.isDirty" class="status-pill warn">Unsaved changes</span>
              <span v-else class="status-pill saved">Saved</span>
            </div>
            <div class="card-actions">
              <button class="icon-action" @click.stop="duplicateQuestion(question)" aria-label="Duplicate question">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <rect x="9" y="9" width="13" height="13" rx="2"></rect>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
              </button>
              <button class="icon-action danger" @click.stop="deleteQuestion(question)"
                aria-label="Delete question">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M8 6v-2a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                  <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"></path>
                  <line x1="10" y1="11" x2="10" y2="17"></line>
                  <line x1="14" y1="11" x2="14" y2="17"></line>
                </svg>
              </button>
              <button v-if="question.isDirty" class="primary-btn small" :disabled="question.isSaving"
                @click.stop="saveQuestion(question)">
                {{ question.isSaving ? 'Saving...' : 'Save' }}
              </button>
            </div>
          </header>

          <div v-if="!isExpanded(question)" class="question-preview">
            <p class="preview-question">{{ question.questionText || 'Untitled question' }}</p>
            <div class="preview-options">
              <div v-for="(option, optionIndex) in question.options" :key="optionIndex" class="preview-option"
                :class="{ selected: question.correctIndex === optionIndex }">
                <span class="preview-letter">{{ String.fromCharCode(65 + optionIndex) }}</span>
                <span class="preview-text">{{ option.text || '—' }}</span>
              </div>
            </div>
          </div>

          <div v-else>
            <div class="form-group">
              <label>Question</label>
              <textarea v-model="question.questionText" rows="2" class="form-textarea"
                placeholder="Type your question here..." @input="markDirty(question)" />
            </div>

            <div class="options-group">
              <label>Options</label>
              <div class="option-row" v-for="(option, optionIndex) in question.options" :key="optionIndex">
                <label class="option-radio">
                  <input type="radio" :name="`correct-${question.localId}`" :value="optionIndex"
                    v-model="question.correctIndex" @change="markDirty(question)" />
                  <span class="radio-control"></span>
                </label>
                <input v-model="option.text" type="text" class="option-input" placeholder="Option text"
                  @input="markDirty(question)" />
                <button v-if="question.options.length > 2" class="icon-btn"
                  @click="removeOption(question, optionIndex)">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M6 6l12 12M6 18L18 6" stroke-width="2" stroke-linecap="round" />
                  </svg>
                </button>
              </div>
              <button class="link-btn" @click="addOption(question)">Add option</button>
            </div>

            <div class="correct-hint" v-if="question.correctIndex === null">
              Select the correct answer to enable saving.
            </div>
          </div>
        </article>
      </div>
    </section>

    <QuizPreviewModal :is-open="previewOpen" :questions="previewQuestions" :loading="false" :error="null"
      @close="closePreview" @retry="closePreview" />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useToast } from 'vue-toast-notification'
import type { QuizQuestion } from '@/api/models/quiz'
import QuizPreviewModal from '@/components/QuizPreviewModal.vue'
import { useLesson } from '@/composables/useLesson'

type EditableOption = {
  text: string
}

type EditableQuestion = {
  localId: string
  questionId?: number
  questionText: string
  options: EditableOption[]
  correctIndex: number | null
  isDirty: boolean
  isSaving: boolean
}

const route = useRoute()
const router = useRouter()
const toast = useToast()

const { fetchQuizQuestions, saveQuizQuestion, deleteQuiz } = useLesson()

const cohortId = computed(() => Number(route.query.cohortId) || 0)
const programId = computed(() => Number(route.query.programId) || 0)
const courseId = computed(() => Number(route.query.courseId) || 0)
const lessonId = computed(() => route.query.lessonId as string | number)
const courseTitle = computed(() => (route.query.courseName as string) || 'Course')
const lessonTitle = computed(() => (route.query.lessonTitle as string) || '')

const questions = ref<EditableQuestion[]>([])
const isLoading = ref(false)
const previewOpen = ref(false)
const expandedQuestionId = ref<string | null>(null)

const createLocalId = () => `q-${Date.now()}-${Math.random().toString(16).slice(2)}`

const resolveCorrectIndex = (question: QuizQuestion, options: EditableOption[]) => {
  const optionTexts = options.map((opt) => opt.text)
  const rawOrder = question.correct?.order
  if (typeof rawOrder === 'number') {
    if (rawOrder >= 0 && rawOrder < options.length) return rawOrder
    if (rawOrder > 0 && rawOrder <= options.length) return rawOrder - 1
  }
  const matchIndex = optionTexts.findIndex((text) => text && text === question.correct?.text)
  return matchIndex >= 0 ? matchIndex : null
}

const normalizeQuestion = (question: QuizQuestion): EditableQuestion => {
  const options =
    question.options && question.options.length > 0
      ? question.options.map((opt) => ({ text: opt.text || '' }))
      : [{ text: '' }, { text: '' }]

  return {
    localId: createLocalId(),
    questionId: Number(question.questionId) || undefined,
    questionText: question.questionText || '',
    options,
    correctIndex: resolveCorrectIndex(question, options),
    isDirty: false,
    isSaving: false,
  }
}

const loadQuiz = async () => {
  if (!lessonId.value) return
  isLoading.value = true
  try {
    const data = await fetchQuizQuestions(lessonId.value)
    questions.value = data.map(normalizeQuestion)
    expandedQuestionId.value = null
  } catch (error) {
    console.error('Failed to load quiz questions:', error)
    toast.error('Failed to load quiz questions.', { position: 'top-right', duration: 4000 })
  } finally {
    isLoading.value = false
  }
}

const markDirty = (question: EditableQuestion) => {
  question.isDirty = true
}

const addQuestion = () => {
  const newQuestion = {
    localId: createLocalId(),
    questionText: '',
    options: [{ text: '' }, { text: '' }],
    correctIndex: null,
    isDirty: true,
    isSaving: false,
  }
  questions.value.unshift(newQuestion)
  expandedQuestionId.value = newQuestion.localId
}

const duplicateQuestion = (question: EditableQuestion) => {
  const newQuestion = {
    localId: createLocalId(),
    questionText: question.questionText,
    options: question.options.map((opt) => ({ text: opt.text })),
    correctIndex: question.correctIndex,
    isDirty: true,
    isSaving: false,
  }
  questions.value.splice(questions.value.indexOf(question) + 1, 0, newQuestion)
  expandedQuestionId.value = newQuestion.localId
}

const deleteQuestion = async (question: EditableQuestion) => {
  const index = questions.value.indexOf(question)
  if (index === -1) return
  if (!confirm('Delete this question? This action cannot be undone.')) {
    return
  }
  if (question.questionId) {
    try {
      await deleteQuiz(question.questionId)
      toast.success('Question deleted', { position: 'top-right', duration: 2000 })
    } catch (err) {
      console.error('Failed to delete quiz question:', err)
      toast.error('Failed to delete question. Please try again.', {
        position: 'top-right',
        duration: 4000,
      })
      return
    }
  }
  questions.value.splice(index, 1)
  if (expandedQuestionId.value === question.localId) {
    expandedQuestionId.value = null
  }
}

const addOption = (question: EditableQuestion) => {
  question.options.push({ text: '' })
  markDirty(question)
}

const removeOption = (question: EditableQuestion, index: number) => {
  if (question.options.length <= 2) return
  question.options.splice(index, 1)
  if (question.correctIndex === index) {
    question.correctIndex = null
  } else if (question.correctIndex !== null && question.correctIndex > index) {
    question.correctIndex -= 1
  }
  markDirty(question)
}

const validateQuestion = (question: EditableQuestion) => {
  if (!question.questionText.trim()) return 'Question text is required'
  if (question.options.some((opt) => !opt.text.trim())) return 'All options must have text'
  if (question.correctIndex === null) return 'Please select the correct answer'
  return ''
}

const saveQuestion = async (question: EditableQuestion) => {
  if (!lessonId.value || !cohortId.value || !programId.value) {
    toast.error('Missing lesson, cohort, or program information.', { position: 'top-right', duration: 3000 })
    return
  }

  const error = validateQuestion(question)
  if (error) {
    toast.error(error, { position: 'top-right', duration: 3000 })
    return
  }

  const correctIndex = question.correctIndex ?? 0
  const payload: Record<string, unknown> = {
    question_text: question.questionText.trim(),
    options: question.options.map((opt, index) => ({
      text: opt.text.trim(),
      order: index + 1,
    })),
    correct: {
      text: question.options[correctIndex]?.text.trim() || '',
      order: correctIndex + 1,
    },
  }

  if (question.questionId) {
    payload.question_id = question.questionId
  }

  if (cohortId.value <= 0 || programId.value <= 0 || courseId.value <= 0) {
    console.log('Invalid cohortId, programId, or courseId:', cohortId.value, programId.value, courseId.value)
    toast.error('Invalid cohort, program, or course information.', { position: 'top-right', duration: 3000 })
    return
  }

  payload.cohort_id = cohortId.value
  payload.program_id = programId.value
  payload.course_id = courseId.value
  question.isSaving = true

  try {
    const response = await saveQuizQuestion(lessonId.value, payload)
    const savedId = response?.data?.questionId ?? response?.data?.question_id
    if (savedId) {
      question.questionId = Number(savedId)
    }
    question.isDirty = false
    toast.success('Question saved', { position: 'top-right', duration: 2000 })
  } catch (err) {
    console.error('Failed to save quiz question:', err)
    toast.error('Failed to save question. Please try again.', {
      position: 'top-right',
      duration: 4000,
    })
  } finally {
    question.isSaving = false
  }
}

const previewQuestions = computed<QuizQuestion[]>(() =>
  questions.value.map((question, index) => ({
    questionId: question.questionId ?? index + 1,
    questionText: question.questionText,
    options: question.options.map((opt) => ({ text: opt.text, optionFiles: [] })),
    correct: {
      text:
        question.correctIndex !== null
          ? question.options[question.correctIndex]?.text || ''
          : '',
      order: question.correctIndex !== null ? question.correctIndex + 1 : 0,
    },
  })),
)

const openPreview = () => {
  previewOpen.value = true
}

const closePreview = () => {
  previewOpen.value = false
}

const isExpanded = (question: EditableQuestion) => expandedQuestionId.value === question.localId

const toggleQuestion = (question: EditableQuestion) => {
  expandedQuestionId.value = isExpanded(question) ? null : question.localId
}

const goBack = () => {
  router.back()
}

onMounted(() => {
  loadQuiz()
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

* {
  font-family:
    'Inter',
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    sans-serif;
}

.quiz-page {
  min-height: 100vh;
  padding: 2rem 1.5rem 3rem;
  background: var(--theme-bg);
  color: var(--theme-text);
}

.quiz-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.back-btn {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  border: 1px solid var(--theme-border);
  background: var(--theme-surface);
  display: grid;
  place-items: center;
  color: var(--theme-text-muted);
  cursor: pointer;
}

.back-btn:hover {
  border-color: #cbd5e1;
  color: var(--theme-text);
}

.eyebrow {
  margin: 0;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--theme-text-muted);
}

.page-title {
  margin: 0.25rem 0;
  font-size: 1.5rem;
  font-weight: 700;
}

.page-subtitle {
  margin: 0;
  color: var(--theme-text-muted);
}

.header-actions {
  display: flex;
  gap: 0.75rem;
  align-items: center;
}

.primary-btn,
.ghost-btn {
  border-radius: 10px;
  padding: 0.65rem 1.1rem;
  font-weight: 600;
  cursor: pointer;
  border: none;
}

.primary-btn {
  background: #4f46e5;
  color: #fff;
  box-shadow: 0 10px 25px rgba(79, 70, 229, 0.25);
}

.primary-btn.small {
  padding: 0.45rem 0.9rem;
  font-size: 0.85rem;
}

.ghost-btn {
  background: var(--theme-surface);
  border: 1px solid var(--theme-border);
  color: var(--theme-text-muted);
}

.ghost-btn:hover {
  border-color: #cbd5e1;
  color: var(--theme-text);
}

.state-card {
  background: var(--theme-surface);
  border: 1px solid var(--theme-border);
  border-radius: 14px;
  padding: 1.5rem;
}

.quiz-body {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.empty-state {
  text-align: center;
  background: var(--theme-surface);
  border: 1px dashed #e2e8f0;
  border-radius: 16px;
  padding: 2.5rem 1.5rem;
}

.empty-state h3 {
  margin: 0 0 0.5rem;
  font-size: 1.4rem;
}

.empty-state p {
  margin: 0 0 1.5rem;
  color: var(--theme-text-muted);
}

.question-list {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.question-card {
  background: var(--theme-surface);
  border-radius: 16px;
  border: 1px solid var(--theme-border);
  padding: 1.25rem 1.5rem;
  box-shadow: 0 12px 30px rgba(15, 23, 42, 0.04);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
  cursor: pointer;
}

.card-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.index-pill {
  background: #eef2ff;
  color: #3730a3;
  font-weight: 700;
  padding: 0.25rem 0.6rem;
  border-radius: 999px;
  font-size: 0.75rem;
}

.status-pill {
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.2rem 0.5rem;
  border-radius: 999px;
}

.status-pill.warn {
  background: #fef3c7;
  color: #92400e;
}

.status-pill.saved {
  background: #ecfdf3;
  color: #166534;
}

.card-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.icon-action {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  border: 1px solid var(--theme-border);
  background: var(--theme-surface);
  display: grid;
  place-items: center;
  cursor: pointer;
  color: var(--theme-text-muted);
  transition: all 0.2s ease;
}

.icon-action svg {
  width: 18px;
  height: 18px;
}

.icon-action:hover {
  border-color: #cbd5e1;
  color: var(--theme-text);
  box-shadow: 0 6px 16px rgba(15, 23, 42, 0.08);
}

.icon-action.danger {
  color: #dc2626;
}

.icon-action.danger:hover {
  border-color: #fecaca;
  background: #fef2f2;
  color: #b91c1c;
}

.question-card.collapsed {
  padding-bottom: 1rem;
}

.question-preview {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.preview-question {
  margin: 0;
  font-weight: 600;
  color: var(--theme-text);
}

.preview-options {
  display: grid;
  gap: 0.5rem;
}

.preview-option {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.5rem 0.75rem;
  border-radius: 10px;
  border: 1px solid var(--theme-border);
  background: var(--theme-bg);
  color: var(--theme-text-muted);
}

.preview-option.selected {
  border-color: #4f46e5;
  background: #eef2ff;
  color: #312e81;
  font-weight: 600;
}

.preview-letter {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 8px;
  background: #e2e8f0;
  font-size: 0.75rem;
  font-weight: 700;
}

.preview-option.selected .preview-letter {
  background: #4f46e5;
  color: #fff;
}

.preview-text {
  flex: 1;
  font-size: 0.9rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.form-group label,
.options-group label {
  font-weight: 600;
  color: var(--theme-text-muted);
}

.form-textarea {
  border: 1px solid var(--theme-border);
  border-radius: 12px;
  padding: 0.75rem 0.9rem;
  font-size: 0.95rem;
  resize: vertical;
  background: var(--theme-bg);
}

.options-group {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.option-row {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.option-radio {
  display: flex;
  align-items: center;
}

.option-radio input {
  display: none;
}

.radio-control {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: 2px solid #cbd5e1;
  display: inline-block;
  position: relative;
}

.option-radio input:checked+.radio-control {
  border-color: #4f46e5;
  background: radial-gradient(circle, #4f46e5 45%, transparent 46%);
}

.option-input {
  flex: 1;
  border: 1px solid var(--theme-border);
  border-radius: 10px;
  padding: 0.55rem 0.75rem;
  background: var(--theme-bg);
}

.icon-btn {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: 1px solid var(--theme-border);
  background: var(--theme-surface);
  display: grid;
  place-items: center;
  cursor: pointer;
  color: #ef4444;
}

.icon-btn svg {
  width: 16px;
  height: 16px;
}

.link-btn {
  background: transparent;
  border: none;
  color: #4f46e5;
  font-weight: 600;
  cursor: pointer;
  width: fit-content;
  padding: 0;
}

.correct-hint {
  margin-top: 0.75rem;
  font-size: 0.85rem;
  color: var(--theme-text-subtle);
}

@media (max-width: 900px) {
  .quiz-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .header-actions {
    width: 100%;
    justify-content: flex-start;
  }
}
</style>
