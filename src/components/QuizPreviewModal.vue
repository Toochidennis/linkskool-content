<template>
  <Teleport to="body">
    <div v-if="isOpen" class="quiz-overlay" @click="handleClose">
      <div class="quiz-modal" @click.stop>
        <!-- Header -->
        <div class="quiz-header">
          <div class="quiz-title">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <circle cx="12" cy="12" r="10"></circle>
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
              <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
            <h2>Quiz Preview</h2>
          </div>
          <button class="quiz-close-btn" @click="handleClose">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="quiz-loading">
          <div class="spinner-large"></div>
          <p>Loading quiz...</p>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="quiz-error">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          <p>{{ error }}</p>
          <button class="btn-retry" @click="$emit('retry')">Retry</button>
        </div>

        <!-- Quiz Content -->
        <div v-else-if="questions.length > 0" class="quiz-content">
          <!-- Question Header with Counter and Show Answer -->
          <div class="question-top-bar">
            <span class="question-counter">Question {{ currentQuestionIndex + 1 }} of {{ questions.length }}</span>
            <button class="btn-toggle-answer" @click="showAnswer = !showAnswer">
              <svg v-if="!showAnswer" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
              <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path
                  d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24">
                </path>
                <line x1="1" y1="1" x2="23" y2="23"></line>
              </svg>
              {{ showAnswer ? 'Hide' : 'Show' }} Answer
            </button>
          </div>

          <!-- Question Text -->
          <div class="question-section">
            <div class="question-text" v-html="currentQuestion?.questionText || ''"></div>
          </div>

          <!-- Options -->
          <div class="options-section">
            <div v-for="(option, index) in currentQuestion?.options || []" :key="index" class="option-card" :class="{
              selected: selectedAnswers[currentQuestionIndex] === index,
              correct:
                showAnswer && currentQuestion && option.text === currentQuestion.correct.text,
              incorrect:
                showAnswer &&
                currentQuestion &&
                selectedAnswers[currentQuestionIndex] === index &&
                option.text !== currentQuestion.correct.text,
            }" @click="selectAnswer(index)">
              <div class="option-marker">{{ String.fromCharCode(65 + index) }}</div>
              <div class="option-content">
                <p class="option-text">{{ option.text }}</p>
                <div v-if="option.optionFiles && option.optionFiles.length > 0" class="option-files">
                  <img v-for="(file, fileIndex) in option.optionFiles" :key="fileIndex" :src="file"
                    alt="Option image" />
                </div>
              </div>
              <div v-if="showAnswer" class="option-indicator">
                <svg v-if="currentQuestion && option.text === currentQuestion.correct.text" viewBox="0 0 24 24"
                  fill="currentColor">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                </svg>
                <svg v-else-if="selectedAnswers[currentQuestionIndex] === index" viewBox="0 0 24 24"
                  fill="currentColor">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-else class="quiz-empty">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M9 11l3 3L22 4"></path>
            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
          </svg>
          <p>No questions available</p>
        </div>

        <!-- Navigation Footer -->
        <div v-if="questions.length > 0 && !loading && !error" class="quiz-footer">
          <button class="btn-nav btn-previous" :disabled="currentQuestionIndex === 0" @click="previousQuestion">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
            Previous
          </button>

          <button class="btn-nav btn-next" :disabled="currentQuestionIndex === questions.length - 1"
            @click="nextQuestion">
            Next
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { QuizQuestion } from '@/api/models/quiz'

interface Props {
  isOpen: boolean
  questions: QuizQuestion[]
  loading?: boolean
  error?: string | null
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  error: null,
})

const emit = defineEmits<{
  close: []
  retry: []
}>()

const currentQuestionIndex = ref(0)
const selectedAnswers = ref<Record<number, number>>({})
const showAnswer = ref(false)

const currentQuestion = computed(() => {
  return props.questions[currentQuestionIndex.value]
})

const selectAnswer = (optionIndex: number) => {
  selectedAnswers.value[currentQuestionIndex.value] = optionIndex
}

const nextQuestion = () => {
  if (currentQuestionIndex.value < props.questions.length - 1) {
    currentQuestionIndex.value++
    showAnswer.value = false
  }
}

const previousQuestion = () => {
  if (currentQuestionIndex.value > 0) {
    currentQuestionIndex.value--
    showAnswer.value = false
  }
}

const handleClose = () => {
  currentQuestionIndex.value = 0
  selectedAnswers.value = {}
  showAnswer.value = false
  emit('close')
}
</script>

<style scoped>
.quiz-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(15, 23, 42, 0.72);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  animation: fadeIn 0.3s ease;
  padding: 20px;
  backdrop-filter: blur(6px);
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

.quiz-modal {
  background: var(--theme-bg);
  border-radius: 18px;
  width: 100%;
  max-width: 820px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  border: 1px solid var(--theme-border);
  box-shadow:
    0 30px 70px rgba(15, 23, 42, 0.35),
    0 0 0 1px rgba(255, 255, 255, 0.6) inset;
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    transform: translateY(40px);
    opacity: 0;
  }

  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.quiz-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 26px;
  border-bottom: 1px solid var(--theme-border);
  background: linear-gradient(135deg, #fff7ed 0%, #fef3c7 100%);
  border-radius: 18px 18px 0 0;
}

.quiz-title {
  display: flex;
  align-items: center;
  gap: 12px;
  color: var(--theme-text);
}

.quiz-title svg {
  width: 28px;
  height: 28px;
  stroke-width: 2;
}

.quiz-title h2 {
  margin: 0;
  font-size: 24px;
  font-weight: 700;
}

.quiz-close-btn {
  width: 36px;
  height: 36px;
  background: rgba(255, 255, 255, 0.7);
  border: 1px solid rgba(148, 163, 184, 0.5);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  color: var(--theme-text-muted);
}

.quiz-close-btn:hover {
  background: rgba(255, 255, 255, 0.95);
  transform: rotate(90deg);
}

.quiz-close-btn svg {
  width: 20px;
  height: 20px;
  stroke-width: 2;
}

.quiz-loading,
.quiz-error,
.quiz-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 32px;
  gap: 16px;
  color: var(--theme-text-subtle);
}

.spinner-large {
  width: 48px;
  height: 48px;
  border: 4px solid #f3f4f6;
  border-top-color: #667eea;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.quiz-error svg,
.quiz-empty svg {
  width: 64px;
  height: 64px;
  stroke-width: 1.5;
  color: #d1d5db;
}

.btn-retry {
  padding: 10px 24px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-retry:hover {
  background: #5568d3;
}

.quiz-content {
  flex: 1;
  overflow-y: auto;
  padding: 20px 22px 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.question-top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 14px;
  background: var(--theme-surface);
  border-radius: 12px;
  border: 1px solid var(--theme-border);
}

.question-counter {
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.02em;
  color: #b45309;
}

.btn-toggle-answer {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 7px 14px;
  background: var(--theme-surface);
  border: 1px solid #f59e0b;
  border-radius: 999px;
  font-weight: 600;
  font-size: 12px;
  color: #b45309;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-toggle-answer:hover {
  background: #f59e0b;
  color: var(--theme-text);
}

.btn-toggle-answer svg {
  width: 16px;
  height: 16px;
  stroke-width: 2;
}

.question-section {
  padding: 16px 18px;
  background: var(--theme-surface);
  border-radius: 14px;
  border: 1px solid var(--theme-border);
  box-shadow: 0 8px 20px rgba(15, 23, 42, 0.05);
}

.question-text {
  font-size: 15px;
  font-weight: 600;
  color: var(--theme-text);
  line-height: 1.55;
}

.options-section {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.option-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  background: var(--theme-surface);
  border: 1px solid var(--theme-border);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.option-card:hover {
  border-color: #f59e0b;
  box-shadow: 0 6px 16px rgba(245, 158, 11, 0.12);
}

.option-card.selected {
  border-color: #f59e0b;
  background: #fffbeb;
}

.option-card.correct {
  border-color: #22c55e;
  background: #f0fdf4;
}

.option-card.incorrect {
  border-color: #ef4444;
  background: #fff1f2;
}

.option-marker {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 30px;
  height: 30px;
  background: var(--theme-bg);
  border: 1px solid var(--theme-border);
  border-radius: 9px;
  font-weight: 700;
  color: var(--theme-text-muted);
  transition: all 0.2s ease;
}

.option-card.selected .option-marker {
  background: #f59e0b;
  border-color: #f59e0b;
  color: var(--theme-text);
}

.option-card.correct .option-marker {
  background: #22c55e;
  border-color: #22c55e;
  color: white;
}

.option-card.incorrect .option-marker {
  background: #ef4444;
  border-color: #ef4444;
  color: white;
}

.option-content {
  flex: 1;
}

.option-text {
  margin: 0;
  font-size: 14px;
  color: var(--theme-text-muted);
  line-height: 1.5;
}

.option-files {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}

.option-files img {
  max-width: 72px;
  max-height: 72px;
  border-radius: 8px;
  object-fit: cover;
}

.option-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
}

.option-indicator svg {
  width: 20px;
  height: 20px;
}

.option-card.correct .option-indicator {
  color: #10b981;
}

.option-card.incorrect .option-indicator {
  color: #ef4444;
}

.quiz-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 18px;
  border-top: 1px solid var(--theme-border);
  background: var(--theme-surface);
  border-radius: 0 0 18px 18px;
  gap: 16px;
}

.btn-nav {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  background: var(--theme-surface);
  border: 1px solid var(--theme-border);
  border-radius: 10px;
  font-weight: 600;
  font-size: 13px;
  color: var(--theme-text-muted);
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-nav:hover:not(:disabled) {
  border-color: #f59e0b;
  color: #b45309;
  background: #fffbeb;
}

.btn-nav:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-nav svg {
  width: 18px;
  height: 18px;
  stroke-width: 2;
}

@media (max-width: 768px) {
  .quiz-modal {
    max-height: 95vh;
    border-radius: 12px;
  }

  .quiz-header {
    padding: 16px 20px;
  }

  .quiz-title h2 {
    font-size: 18px;
  }

  .quiz-content {
    padding: 16px;
    gap: 16px;
  }

  .question-text {
    font-size: 15px;
  }

  .quiz-footer {
    padding: 12px 16px;
  }

  .question-top-bar {
    flex-direction: column;
    gap: 10px;
    align-items: stretch;
  }

  .btn-toggle-answer {
    justify-content: center;
  }
}
</style>
