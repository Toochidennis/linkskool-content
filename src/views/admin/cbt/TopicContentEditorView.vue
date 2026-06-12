<template>
  <div class="flex h-[calc(100vh-4rem)] min-h-0 flex-col bg-gray-50 dark:bg-gray-900">
    <header class="flex h-16 shrink-0 items-center justify-between gap-4 border-b border-gray-200 bg-white px-4 dark:border-gray-700 dark:bg-gray-800">
      <div class="flex min-w-0 items-center gap-3">
        <button
          type="button"
          @click="goBack"
          class="inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg border border-gray-300 text-gray-600 transition hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700"
          aria-label="Back to topics">
          <i class="fas fa-arrow-left"></i>
        </button>
        <div class="min-w-0">
          <h1 class="truncate text-lg font-bold text-gray-900 dark:text-white">{{ topicName }}</h1>
          <p class="text-xs text-gray-500 dark:text-gray-400">Study content editor</p>
        </div>
      </div>

      <div class="flex items-center gap-3">
        <div class="hidden items-center rounded-lg border border-gray-200 bg-gray-50 p-1 dark:border-gray-700 dark:bg-gray-900 sm:flex">
          <button
            type="button"
            @click="mode = 'edit'"
            :class="mode === 'edit' ? 'bg-white text-gray-900 shadow-sm dark:bg-gray-800 dark:text-white' : 'text-gray-500 dark:text-gray-400'"
            class="cursor-pointer rounded-md px-3 py-1.5 text-sm font-semibold">
            Edit
          </button>
          <button
            type="button"
            @click="mode = 'preview'"
            :class="mode === 'preview' ? 'bg-white text-gray-900 shadow-sm dark:bg-gray-800 dark:text-white' : 'text-gray-500 dark:text-gray-400'"
            class="cursor-pointer rounded-md px-3 py-1.5 text-sm font-semibold">
            Preview
          </button>
        </div>
        <span class="hidden items-center gap-2 text-sm font-medium text-emerald-600 dark:text-emerald-400 sm:inline-flex">
          <span class="h-2 w-2 rounded-full bg-emerald-500"></span>
          {{ savedStatus }}
        </span>
        <button
          type="button"
          @click="saveContent"
          class="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700">
          <i :class="isSaving ? 'fas fa-spinner fa-spin' : 'fas fa-save'"></i>
          Save
        </button>
      </div>
    </header>

    <div class="grid min-h-0 flex-1 grid-cols-[280px_minmax(0,1fr)_360px] overflow-hidden">
      <aside class="flex min-h-0 flex-col border-r border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
        <div class="border-b border-gray-200 px-4 py-4 dark:border-gray-700">
          <p class="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">Outline</p>
        </div>
        <div class="min-h-0 flex-1 overflow-y-auto p-3">
          <section v-for="section in content.contents" :key="section.id" class="mb-3">
            <button
              type="button"
              @click="toggleSection(section.id)"
              class="flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-semibold text-gray-900 hover:bg-gray-50 dark:text-white dark:hover:bg-gray-700/60">
              <i :class="expandedSectionIds.includes(section.id) ? 'fas fa-chevron-down' : 'fas fa-chevron-right'" class="w-3 text-xs text-gray-400"></i>
              <span class="truncate">{{ section.id }}. {{ section.title }}</span>
            </button>

            <div v-if="expandedSectionIds.includes(section.id)" class="mt-1 space-y-1 pl-4">
              <button
                v-for="subsection in section.subsections"
                :key="subsection.id"
                type="button"
                @click="selectSubsection(section.id, subsection.id)"
                :class="activeSubsectionId === subsection.id ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-200' : 'text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700/50'"
                class="flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-left text-sm">
                <span class="h-1.5 w-1.5 rounded-full bg-current"></span>
                <span class="truncate">{{ subsection.title }}</span>
              </button>

              <button
                type="button"
                @click="openSectionQuiz(section.id)"
                class="mt-2 flex w-full cursor-pointer items-center justify-between gap-2 rounded-lg border border-amber-200 px-3 py-2 text-left text-sm font-semibold text-amber-700 hover:bg-amber-50 dark:border-amber-900/60 dark:text-amber-200 dark:hover:bg-amber-900/20">
                <span><i class="fas fa-file-alt mr-2"></i>Section quiz</span>
                <span>{{ section.quiz.length }} Q</span>
              </button>
            </div>
          </section>

          <button
            type="button"
            disabled
            class="mt-2 flex w-full cursor-not-allowed items-center gap-2 rounded-lg border border-dashed border-gray-300 px-3 py-2 text-sm font-semibold text-gray-400 dark:border-gray-700">
            <i class="fas fa-plus"></i>
            Section
          </button>
        </div>
        <div class="border-t border-gray-200 p-3 dark:border-gray-700">
          <button
            type="button"
            @click="openFinalQuiz"
            class="flex w-full cursor-pointer items-center justify-between rounded-xl border border-blue-200 bg-blue-50 px-3 py-3 text-sm font-semibold text-blue-700 dark:border-blue-900/60 dark:bg-blue-900/20 dark:text-blue-200">
            <span><i class="fas fa-bullseye mr-2"></i>Final quiz</span>
            <span>{{ content.finalQuiz.length }} Q</span>
          </button>
        </div>
      </aside>

      <main class="min-h-0 overflow-y-auto bg-gray-100 px-6 py-5 dark:bg-gray-950/40">
        <div v-if="activeSubsection" class="mx-auto max-w-4xl space-y-4">
          <input
            v-if="mode === 'edit'"
            :value="activeSubsection.title"
            @input="updateSubsectionTitle(($event.target as HTMLInputElement).value)"
            class="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-2xl font-bold text-gray-900 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white" />
          <h2 v-else class="px-1 text-3xl font-bold text-gray-900 dark:text-white">{{ activeSubsection.title }}</h2>

          <article
            v-for="block in activeSubsection.cards"
            :key="block.id"
            draggable="true"
            @dragstart="draggedBlockId = block.id"
            @dragover.prevent="dragTargetBlockId = block.id"
            @drop.prevent="dropBlock(block.id)"
            @dragend="clearBlockDrag"
            :class="[
              block.type === 'highlight' ? 'border-yellow-200 bg-yellow-50 dark:border-yellow-900/60 dark:bg-yellow-900/20' : '',
              block.type === 'examTip' ? 'border-emerald-200 bg-emerald-50 dark:border-emerald-900/60 dark:bg-emerald-900/20' : '',
              block.type === 'commonMistake' ? 'border-rose-200 bg-rose-50 dark:border-rose-900/60 dark:bg-rose-900/20' : '',
              dragTargetBlockId === block.id ? 'ring-2 ring-blue-500/20' : '',
            ]"
            class="group rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition dark:border-gray-700 dark:bg-gray-800">
            <div class="mb-3 flex items-center justify-between gap-3">
              <span class="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-gray-500 dark:bg-gray-900 dark:text-gray-400">
                {{ blockLabel(block.type) }}
              </span>
              <div v-if="mode === 'edit'" class="flex items-center gap-1 opacity-100 lg:opacity-0 lg:transition lg:group-hover:opacity-100">
                <button type="button" class="icon-btn cursor-grab" title="Drag"><i class="fas fa-grip-vertical"></i></button>
                <button type="button" class="icon-btn" title="Duplicate" @click="duplicateBlock(block.id)"><i class="fas fa-copy"></i></button>
                <button type="button" class="icon-btn" title="Delete" @click="deleteBlock(block.id)"><i class="fas fa-trash"></i></button>
              </div>
            </div>

            <input
              v-if="mode === 'edit'"
              :value="block.title"
              @input="updateBlock(block.id, { title: ($event.target as HTMLInputElement).value })"
              class="mb-3 w-full rounded-lg border border-transparent bg-transparent px-2 py-1 text-lg font-bold text-gray-900 hover:border-gray-200 focus:border-blue-500 focus:bg-white dark:text-white dark:focus:bg-gray-900" />
            <h3 v-else class="mb-2 text-xl font-bold text-gray-900 dark:text-white">{{ block.title }}</h3>

            <textarea
              v-if="mode === 'edit' && hasBody(block.type)"
              :value="block.body"
              @input="updateBlock(block.id, { body: ($event.target as HTMLTextAreaElement).value })"
              rows="4"
              class="w-full resize-y rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100" />
            <p v-else-if="hasBody(block.type)" class="whitespace-pre-line text-gray-700 dark:text-gray-200">{{ block.body }}</p>

            <div v-if="block.type === 'list'" class="space-y-2">
              <input
                v-for="(_, index) in block.items as string[]"
                :key="index"
                :value="(block.items as string[])[index]"
                :readonly="mode === 'preview'"
                @input="updateListItem(block, index, ($event.target as HTMLInputElement).value)"
                class="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white" />
            </div>

            <div v-if="block.type === 'commonMistake'" class="grid gap-3 md:grid-cols-2">
              <textarea
                :value="block.wrong"
                :readonly="mode === 'preview'"
                @input="updateBlock(block.id, { wrong: ($event.target as HTMLTextAreaElement).value })"
                class="rounded-xl border border-rose-200 bg-white px-3 py-2 text-sm text-rose-700 dark:border-rose-900/60 dark:bg-gray-900 dark:text-rose-200" />
              <textarea
                :value="block.correct"
                :readonly="mode === 'preview'"
                @input="updateBlock(block.id, { correct: ($event.target as HTMLTextAreaElement).value })"
                class="rounded-xl border border-emerald-200 bg-white px-3 py-2 text-sm text-emerald-700 dark:border-emerald-900/60 dark:bg-gray-900 dark:text-emerald-200" />
            </div>
          </article>

          <div v-if="activeSubsection.media.length" class="grid gap-4 sm:grid-cols-2">
            <article
              v-for="media in activeSubsection.media"
              :key="media.url"
              class="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <img :src="media.url" :alt="media.alt || 'Subsection image'" class="h-48 w-full object-cover" />
              <div class="p-3 text-sm text-gray-500 dark:text-gray-400">{{ media.alt || 'Image block' }}</div>
            </article>
          </div>

          <div v-if="mode === 'edit'" class="relative flex justify-center pb-10">
            <button
              type="button"
              @click="addBlockMenuOpen = !addBlockMenuOpen"
              class="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-blue-300 bg-white px-4 py-3 text-sm font-semibold text-blue-700 shadow-sm transition hover:bg-blue-50 dark:border-blue-900 dark:bg-gray-800 dark:text-blue-200 dark:hover:bg-blue-900/20">
              <i class="fas fa-plus"></i>
              Add block
            </button>

            <div
              v-if="addBlockMenuOpen"
              class="absolute bottom-24 z-10 grid w-[340px] gap-2 rounded-2xl border border-gray-200 bg-white p-3 shadow-xl dark:border-gray-700 dark:bg-gray-800">
              <button
                v-for="type in blockTypes"
                :key="type.value"
                type="button"
                @click="addBlock(type.value)"
                class="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2 text-left transition hover:bg-gray-50 dark:hover:bg-gray-700">
                <span class="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100 text-gray-600 dark:bg-gray-900 dark:text-gray-300">
                  <i :class="type.icon"></i>
                </span>
                <span>
                  <span class="block text-sm font-semibold text-gray-900 dark:text-white">{{ type.label }}</span>
                  <span class="block text-xs text-gray-500 dark:text-gray-400">{{ type.description }}</span>
                </span>
              </button>
            </div>
          </div>
        </div>
      </main>

      <aside class="flex min-h-0 flex-col border-l border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
        <div class="border-b border-gray-200 px-4 py-4 dark:border-gray-700">
          <h2 class="text-sm font-bold uppercase tracking-[0.2em] text-gray-900 dark:text-white">
            <i class="fas fa-wand-magic-sparkles mr-2 text-blue-600 dark:text-blue-400"></i>
            AI Assistant
          </h2>
          <div class="mt-3">
            <label class="text-xs font-semibold text-gray-500 dark:text-gray-400">Context</label>
            <select
              v-model="aiScope"
              class="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-white">
              <option value="topic">Whole topic</option>
              <option value="section">Current section</option>
              <option value="subsection">Current subsection</option>
              <option value="block">Selected block</option>
            </select>
          </div>
        </div>

        <div class="min-h-0 flex-1 space-y-4 overflow-y-auto p-4">
          <article
            v-for="message in aiMessages"
            :key="message.id"
            :class="message.role === 'user' ? 'ml-8 bg-blue-600 text-white' : 'mr-8 bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-100'"
            class="rounded-2xl px-4 py-3 text-sm">
            <p>{{ message.body }}</p>
            <div v-if="message.summary" class="mt-3 rounded-xl bg-white/70 p-2 text-xs text-gray-700 dark:bg-gray-800 dark:text-gray-200">
              <p v-for="item in message.summary" :key="`${item.op}-${item.label}`">
                {{ item.op }} - {{ item.label }}
              </p>
            </div>
          </article>
        </div>

        <div class="border-t border-gray-200 p-4 dark:border-gray-700">
          <textarea
            v-model="aiInstruction"
            rows="4"
            placeholder="Ask AI to edit..."
            class="w-full resize-none rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white"></textarea>
          <button
            type="button"
            @click="sendAiInstruction"
            class="mt-3 inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-700 dark:bg-blue-600 dark:hover:bg-blue-700">
            <i class="fas fa-arrow-up"></i>
            Send
          </button>
        </div>
      </aside>
    </div>

    <div v-if="quizEditor.open" class="fixed inset-0 z-[60] bg-white dark:bg-gray-900">
      <div class="flex h-full flex-col">
        <header class="flex h-16 items-center justify-between border-b border-gray-200 px-5 dark:border-gray-700">
          <div>
            <h2 class="text-lg font-bold text-gray-900 dark:text-white">
              {{ quizEditor.type === 'final' ? 'Final Quiz' : 'Section Quiz' }} · {{ activeQuiz.length }} questions
            </h2>
            <p class="text-sm text-gray-500 dark:text-gray-400">Quiz editor scaffold</p>
          </div>
          <button
            type="button"
            @click="closeQuizEditor"
            class="cursor-pointer rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white">
            Done
          </button>
        </header>
        <div class="grid min-h-0 flex-1 grid-cols-[320px_minmax(0,1fr)]">
          <aside class="overflow-y-auto border-r border-gray-200 p-4 dark:border-gray-700">
            <button
              v-for="(question, index) in activeQuiz"
              :key="question.id"
              type="button"
              class="mb-2 flex w-full cursor-pointer items-center gap-3 rounded-xl border border-gray-200 px-3 py-3 text-left text-sm dark:border-gray-700">
              <span class="font-bold text-gray-500">{{ index + 1 }}</span>
              <span class="truncate text-gray-900 dark:text-white">{{ question.questionText }}</span>
            </button>
          </aside>
          <main class="overflow-y-auto p-6">
            <div v-if="activeQuiz[0]" class="mx-auto max-w-3xl space-y-4">
              <label class="text-sm font-semibold text-gray-700 dark:text-gray-200">Question</label>
              <textarea
                v-model="activeQuiz[0].questionText"
                rows="4"
                class="w-full rounded-xl border border-gray-300 px-4 py-3 dark:border-gray-700 dark:bg-gray-800 dark:text-white"></textarea>
              <div v-for="(option, index) in activeQuiz[0].options" :key="index" class="flex items-center gap-3">
                <input v-model="activeQuiz[0].correctAnswer" :value="index" type="radio" />
                <input v-model="option.text" class="flex-1 rounded-lg border border-gray-300 px-3 py-2 dark:border-gray-700 dark:bg-gray-800 dark:text-white" />
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useTopicContentEditor, type StudyBlock, type StudyBlockType } from '@/composables/useTopicContentEditor'

const route = useRoute()
const router = useRouter()
const draggedBlockId = ref<number | null>(null)
const dragTargetBlockId = ref<number | null>(null)

const {
  topicName,
  content,
  activeSubsectionId,
  expandedSectionIds,
  activeSubsection,
  activeQuiz,
  mode,
  isSaving,
  savedStatus,
  addBlockMenuOpen,
  aiInstruction,
  aiScope,
  aiMessages,
  quizEditor,
  loadDummyContent,
  selectSubsection,
  toggleSection,
  updateSubsectionTitle,
  updateBlock,
  addBlock,
  duplicateBlock,
  deleteBlock,
  reorderBlock,
  openSectionQuiz,
  openFinalQuiz,
  closeQuizEditor,
  sendAiInstruction,
  saveContent,
} = useTopicContentEditor()

const blockTypes: Array<{ value: StudyBlockType; label: string; description: string; icon: string }> = [
  { value: 'text', label: 'Text', description: 'Paragraph block', icon: 'fas fa-align-left' },
  { value: 'highlight', label: 'Highlight', description: 'Key idea callout', icon: 'fas fa-star' },
  { value: 'list', label: 'List', description: 'Bulleted points', icon: 'fas fa-list' },
  { value: 'pairs', label: 'Pairs', description: 'Term and meaning', icon: 'fas fa-table-columns' },
  { value: 'workedExample', label: 'Worked example', description: 'Step-by-step explanation', icon: 'fas fa-pen-nib' },
  { value: 'equation', label: 'Equation', description: 'Math or formula', icon: 'fas fa-square-root-variable' },
  { value: 'examTip', label: 'Exam tip', description: 'Exam-focused guidance', icon: 'fas fa-lightbulb' },
  { value: 'commonMistake', label: 'Common mistake', description: 'Wrong vs correct', icon: 'fas fa-triangle-exclamation' },
]

const blockLabel = (type: StudyBlockType) => type.replace(/[A-Z]/g, match => ` ${match.toLowerCase()}`)

const hasBody = (type: StudyBlockType) =>
  ['text', 'highlight', 'examTip', 'equation', 'workedExample'].includes(type)

const updateListItem = (block: StudyBlock, index: number, value: string) => {
  if (!Array.isArray(block.items)) {
    return
  }

  const nextItems = [...(block.items as string[])]
  nextItems[index] = value
  updateBlock(block.id, { items: nextItems })
}

const dropBlock = (targetBlockId: number) => {
  if (draggedBlockId.value !== null) {
    reorderBlock(draggedBlockId.value, targetBlockId)
  }
  clearBlockDrag()
}

const clearBlockDrag = () => {
  draggedBlockId.value = null
  dragTargetBlockId.value = null
}

const goBack = () => {
  router.push({ name: 'Topics' })
}

onMounted(() => {
  const topicNameQuery = typeof route.query.topicName === 'string' ? route.query.topicName : undefined
  loadDummyContent(topicNameQuery)
})
</script>

<style scoped>
.icon-btn {
  display: inline-flex;
  height: 2rem;
  width: 2rem;
  align-items: center;
  justify-content: center;
  border-radius: 0.5rem;
  color: rgb(107 114 128);
  transition: background-color 0.15s ease, color 0.15s ease;
}

.icon-btn:hover {
  background: rgb(243 244 246);
  color: rgb(17 24 39);
}
</style>
