<template>
  <aside class="flex min-h-0 flex-col border-r border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
    <div class="border-b border-gray-200 px-4 py-4 dark:border-gray-700">
      <p class="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">Outline</p>
    </div>
    <div class="min-h-0 flex-1 overflow-y-auto p-3">
      <section v-for="section in sections" :key="section.id" class="mb-3">
        <button type="button" @click="emit('toggle-section', section.id)"
          class="flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-semibold text-gray-900 hover:bg-gray-50 dark:text-white dark:hover:bg-gray-700/60">
          <i :class="expandedSectionIds.includes(section.id) ? 'fas fa-chevron-down' : 'fas fa-chevron-right'"
            class="w-3 text-xs text-gray-400"></i>
          <span class="truncate">{{ section.id }}. {{ section.title }}</span>
        </button>

        <div v-if="expandedSectionIds.includes(section.id)" class="mt-1 space-y-1 pl-4">
          <button v-for="subsection in section.subsections" :key="subsection.id" type="button"
            @click="emit('select-subsection', section.id, subsection.id)"
            :class="activeSurface === 'content' && activeSubsectionId === subsection.id ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-200' : 'text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700/50'"
            class="flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-left text-sm">
            <span class="h-1.5 w-1.5 rounded-full bg-current"></span>
            <span class="truncate">{{ plainText(subsection.title) }}</span>
          </button>

          <button type="button" @click="emit('open-section-quiz', section.id)"
            :class="activeSurface === 'sectionQuiz' && activeQuizSectionId === section.id ? 'bg-amber-50 ring-2 ring-amber-500/20 dark:bg-amber-900/20' : 'hover:bg-amber-50 dark:hover:bg-amber-900/20'"
            class="mt-2 flex w-full cursor-pointer items-center justify-between gap-2 rounded-lg border border-amber-200 px-3 py-2 text-left text-sm font-semibold text-amber-700 dark:border-amber-900/60 dark:text-amber-200">
            <span><i class="fas fa-file-alt mr-2"></i>Section quiz</span>
            <span>{{ section.quiz.length }} Q</span>
          </button>
        </div>
      </section>

      <button type="button" disabled
        class="mt-2 flex w-full cursor-not-allowed items-center gap-2 rounded-lg border border-dashed border-gray-300 px-3 py-2 text-sm font-semibold text-gray-400 dark:border-gray-700">
        <i class="fas fa-plus"></i>
        Section
      </button>
    </div>
    <div class="border-t border-gray-200 p-3 dark:border-gray-700">
      <button type="button" @click="emit('open-final-quiz')"
        :class="activeSurface === 'finalQuiz' ? 'ring-2 ring-blue-500/20' : ''"
        class="flex w-full cursor-pointer items-center justify-between rounded-xl border border-blue-200 bg-blue-50 px-3 py-3 text-sm font-semibold text-blue-700 dark:border-blue-900/60 dark:bg-blue-900/20 dark:text-blue-200">
        <span><i class="fas fa-bullseye mr-2"></i>Final quiz</span>
        <span>{{ finalQuizCount }} Q</span>
      </button>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { plainText } from '@/utils/html'
import type { StudySection } from '@/composables/useTopicContentEditor'

defineProps<{
  sections: StudySection[]
  finalQuizCount: number
  expandedSectionIds: number[]
  activeSurface: 'content' | 'sectionQuiz' | 'finalQuiz'
  activeSubsectionId: number | null
  activeQuizSectionId: number | null
}>()

const emit = defineEmits<{
  'toggle-section': [sectionId: number]
  'select-subsection': [sectionId: number, subsectionId: number]
  'open-section-quiz': [sectionId: number]
  'open-final-quiz': []
}>()
</script>
