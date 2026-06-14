<template>
  <div class="grid w-full gap-4 lg:grid-cols-[320px_minmax(0,1fr)]">
    <aside
      class="min-h-[70vh] overflow-hidden rounded-md border-[0.5px] border-gray-500/50 bg-white dark:border-gray-600/60 dark:bg-gray-800">
      <div class="border-b border-gray-200 p-4 dark:border-gray-700">
        <h2 class="text-base font-bold text-gray-900 dark:text-white">{{ title }}</h2>
        <p class="text-sm text-gray-500 dark:text-gray-400">{{ quiz.length }} questions</p>
      </div>
      <div class="max-h-[calc(100vh-15rem)] overflow-y-auto p-3">
        <button v-for="(question, index) in quiz" :key="question.id" type="button" @click="emit('select', index)"
          :class="activeIndex === index ? 'border-blue-500 bg-blue-50 text-blue-700 dark:border-blue-500 dark:bg-blue-900/20 dark:text-blue-200' : 'border-gray-200 text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-700/50'"
          class="mb-2 flex w-full cursor-pointer items-center gap-3 rounded-xl border px-3 py-3 text-left text-sm">
          <span
            class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-bold text-gray-600 dark:bg-gray-900 dark:text-gray-300">
            {{ index + 1 }}
          </span>
          <span class="min-w-0 flex-1 truncate">{{ plainText(question.questionText) || 'Untitled question' }}</span>
        </button>

        <button type="button" @click="emit('add-question')"
          class="mt-2 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-blue-300 px-3 py-3 text-sm font-semibold text-blue-700 hover:bg-blue-50 dark:border-blue-900 dark:text-blue-200 dark:hover:bg-blue-900/20">
          <i class="fas fa-plus"></i>
          Add question
        </button>
      </div>
    </aside>

    <section
      class="min-h-[70vh] rounded-md border-[0.5px] border-gray-500/50 bg-white p-5 dark:border-gray-600/60 dark:bg-gray-800">
      <div v-if="selectedQuestion" class="space-y-5">
        <div class="flex items-start justify-between gap-4">
          <div>
            <p class="text-xs font-semibold uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400">Edit question</p>
            <h2 class="mt-1 text-xl font-bold text-gray-900 dark:text-white">Question {{ activeIndex + 1 }}</h2>
          </div>
          <button type="button" @click="emit('delete-question', activeIndex)"
            class="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-rose-200 px-3 py-2 text-sm font-semibold text-rose-600 hover:bg-rose-50 dark:border-rose-900/60 dark:text-rose-300 dark:hover:bg-rose-900/20">
            <i class="fas fa-trash"></i>
            Delete
          </button>
        </div>

        <div>
          <label class="text-sm font-semibold text-gray-700 dark:text-gray-200">Question</label>
          <div
            class="mt-2 rounded-xl border border-transparent px-4 py-3 transition-colors focus-within:border-blue-500 focus-within:bg-white focus-within:ring-1 focus-within:ring-blue-500/20 dark:focus-within:border-blue-500 dark:focus-within:bg-gray-900">
            <CardRichText :model-value="selectedQuestion.questionText"
              @update:model-value="selectedQuestion.questionText = $event" :on-paste="questionPasteHandler"
              placeholder="Type or paste the question (with options) — supports $latex$"
              content-class="text-sm text-gray-900 dark:text-white" />
          </div>
        </div>

        <div class="space-y-2">
          <div v-for="(option, index) in selectedQuestion.options" :key="index"
            class="group/opt flex items-center gap-3 rounded-xl border border-transparent px-3 py-2 transition-colors focus-within:border-blue-400 focus-within:bg-white dark:focus-within:bg-gray-900">
            <input v-model="selectedQuestion.correctAnswer" :value="index" type="radio" title="Mark as correct answer"
              class="h-4 w-4 shrink-0 text-blue-600 focus:ring-blue-500" />
            <CardRichText :ref="el => setOptionRef(index, el)" class="min-w-0 flex-1" :model-value="option.text"
              @update:model-value="updateOptionText(index, $event)" single-line :on-paste="mathPasteHandler"
              placeholder="Option" content-class="text-sm text-gray-900 dark:text-white" @enter="addOptionAfter(index)"
              @backspace-empty="onOptionBackspace(index)" />
            <button type="button" @click="deleteOption(index)"
              class="inline-flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-lg text-rose-400 opacity-0 transition hover:bg-rose-50 group-hover/opt:opacity-100 dark:hover:bg-rose-900/20"
              aria-label="Delete option">
              <i class="fas fa-times text-xs"></i>
            </button>
          </div>
          <button type="button" @click="addOption"
            class="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-700">
            <i class="fas fa-plus"></i>
            Add option
          </button>
        </div>

        <div>
          <label class="text-sm font-semibold text-gray-700 dark:text-gray-200">Explanation</label>
          <div
            class="mt-2 rounded-xl border border-transparent px-4 py-3 transition-colors focus-within:border-blue-500 focus-within:bg-white focus-within:ring-1 focus-within:ring-blue-500/20 dark:focus-within:border-blue-500 dark:focus-within:bg-gray-900">
            <CardRichText :model-value="selectedQuestion.explanation"
              @update:model-value="selectedQuestion.explanation = $event" :on-paste="mathPasteHandler"
              placeholder="Explain the correct answer — supports $latex$"
              content-class="text-sm text-gray-900 dark:text-white" />
          </div>
        </div>

        <div>
          <label class="text-sm font-semibold text-gray-700 dark:text-gray-200">Bloom level</label>
          <select v-model="selectedQuestion.bloomLevel"
            class="mt-2 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-white">
            <option value="remember">Remember</option>
            <option value="understand">Understand</option>
            <option value="apply">Apply</option>
            <option value="analyze">Analyze</option>
            <option value="evaluate">Evaluate</option>
            <option value="create">Create</option>
          </select>
        </div>
      </div>

      <div v-else class="flex min-h-[50vh] items-center justify-center text-center">
        <div>
          <div
            class="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-300">
            <i class="fas fa-question"></i>
          </div>
          <h3 class="mt-4 text-lg font-semibold text-gray-900 dark:text-white">No question selected</h3>
          <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">Add or select a question to edit it here.</p>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, ref } from 'vue'
import CardRichText from '@/components/CardRichText.vue'
import { plainText } from '@/utils/html'
import { parseQuestionPaste, smartConvert, canAutoConvert } from '@/utils/quizPaste'
import type { StudyQuizItem } from '@/composables/useTopicContentEditor'

const props = defineProps<{
  quiz: StudyQuizItem[]
  title: string
  activeIndex: number
}>()

const emit = defineEmits<{
  select: [index: number]
  'add-question': []
  'delete-question': [index: number]
}>()

const selectedQuestion = computed(() => props.quiz[props.activeIndex] ?? null)

const optionRefs = ref<Record<number, { focus: () => void } | null>>({})
const setOptionRef = (index: number, el: unknown) => {
  optionRefs.value[index] = el as { focus: () => void } | null
}

const updateOptionText = (index: number, value: string) => {
  const option = selectedQuestion.value?.options[index]
  if (option) {
    option.text = value
  }
}

const addOption = () => {
  const question = selectedQuestion.value
  if (question) {
    question.options.push({ text: `Option ${question.options.length + 1}` })
  }
}

const addOptionAfter = (index: number) => {
  const question = selectedQuestion.value
  if (!question) {
    return
  }
  question.options.splice(index + 1, 0, { text: '' })
  nextTick(() => optionRefs.value[index + 1]?.focus())
}

const deleteOption = (index: number) => {
  const question = selectedQuestion.value
  if (!question || question.options.length <= 2) {
    return
  }
  question.options.splice(index, 1)
  if (question.correctAnswer >= question.options.length) {
    question.correctAnswer = question.options.length - 1
  }
}

const onOptionBackspace = (index: number) => {
  const question = selectedQuestion.value
  const option = question?.options[index]
  if (!question || !option || plainText(option.text) || question.options.length <= 2) {
    return
  }
  deleteOption(index)
  nextTick(() => optionRefs.value[Math.max(0, index - 1)]?.focus())
}

// Smart-convert plain math/chemistry notation on paste (e.g. H2 → $H_{2}$).
const mathPasteHandler = (text: string): string | null => (canAutoConvert(text) ? smartConvert(text) : null)

// Pasting a whole question block fills the question + options + correct answer.
const questionPasteHandler = (text: string): string | false | null => {
  const question = selectedQuestion.value
  if (!question) {
    return null
  }
  const parsed = parseQuestionPaste(text)
  if (parsed.options.length >= 2) {
    question.options = parsed.options.map(option => ({ text: smartConvert(option) }))
    question.correctAnswer =
      typeof parsed.correctOptionIndex === 'number'
        ? parsed.correctOptionIndex
        : Math.min(question.correctAnswer, question.options.length - 1)
    return parsed.question ? smartConvert(parsed.question) : false
  }
  return mathPasteHandler(text)
}
</script>
