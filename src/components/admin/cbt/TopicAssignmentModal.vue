<template>
  <div
    @click="$emit('close')"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
    <div
      @click.stop
      class="flex h-[92vh] max-h-[92vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-gray-800">
      <div class="flex items-start justify-between gap-4 border-b border-gray-200 px-6 py-5 dark:border-gray-700">
        <div>
          <h3 class="text-2xl font-bold text-gray-900 dark:text-white">Assign Courses to Topics</h3>
          <p class="text-sm text-gray-600 dark:text-gray-400">
            Select a subject, choose its topics, then drag or move topics into the saved order.
          </p>
        </div>
        <button
          type="button"
          @click="$emit('close')"
          class="cursor-pointer rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white">
          <i class="fas fa-times text-xl"></i>
        </button>
      </div>

      <div
        :class="step === 'subjects' ? 'overflow-y-auto' : 'overflow-hidden'"
        class="min-h-0 flex-1 px-6 py-6">
        <div v-if="step === 'subjects'" class="flex h-full min-h-[520px] flex-col gap-4">
          <div class="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p class="text-sm font-semibold text-gray-900 dark:text-white">Subjects</p>
              <p class="text-sm text-gray-600 dark:text-gray-400">Choose the subject whose topics you want to manage.</p>
            </div>
            <div class="relative w-full sm:w-80">
              <i class="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-sm text-gray-400"></i>
              <input
                v-model="subjectSearchQuery"
                type="search"
                placeholder="Search subjects..."
                class="w-full rounded-xl border border-gray-300 bg-white py-3 pl-10 pr-4 text-sm text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-900 dark:text-white" />
            </div>
          </div>

          <div
            v-if="filteredCourses.length"
            class="grid flex-1 content-start gap-3 overflow-y-auto pr-1 sm:grid-cols-2 lg:grid-cols-3">
            <button
              v-for="course in filteredCourses"
              :key="course.id"
              type="button"
              @click="selectSubject(course.id)"
              class="group flex min-h-28 cursor-pointer flex-col justify-between rounded-xl border border-gray-200 bg-white p-4 text-left transition hover:border-blue-300 hover:bg-blue-50 dark:border-gray-700 dark:bg-gray-900/40 dark:hover:border-blue-700 dark:hover:bg-blue-900/20">
              <span>
                <span class="block text-sm font-semibold text-gray-900 dark:text-white">{{ course.courseName }}</span>
                <span class="mt-1 line-clamp-2 block text-xs text-gray-500 dark:text-gray-400">
                  {{ course.description || 'No description available.' }}
                </span>
              </span>
              <span class="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-blue-600 dark:text-blue-300">
                Manage topics
                <i class="fas fa-arrow-right transition group-hover:translate-x-1"></i>
              </span>
            </button>
          </div>

          <div
            v-else
            class="flex flex-1 items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-gray-50 px-6 py-10 text-center dark:border-gray-600 dark:bg-gray-900/30">
            <div>
              <div class="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300">
                <i class="fas fa-book"></i>
              </div>
              <h4 class="mt-4 text-base font-semibold text-gray-900 dark:text-white">No subjects found</h4>
              <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">Try another search term.</p>
            </div>
          </div>
        </div>

        <div v-else class="flex h-full min-h-0 flex-col gap-4">
          <div class="flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              @click="showSubjects"
              class="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-100 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700">
              <i class="fas fa-arrow-left"></i>
              Subjects
            </button>

            <div class="text-left sm:text-right">
              <p class="text-sm font-semibold text-gray-900 dark:text-white">{{ selectedCourse?.courseName || 'Subject topics' }}</p>
              <p class="text-xs text-gray-500 dark:text-gray-400">{{ selectedTopics.length }} selected topic(s)</p>
            </div>
          </div>

          <div
            v-if="isLoadingTopicOptions"
            class="flex flex-1 items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-gray-50 text-sm text-gray-600 dark:border-gray-600 dark:bg-gray-900/30 dark:text-gray-300">
            Loading topics...
          </div>

          <div v-else class="grid min-h-0 flex-1 grid-rows-[minmax(0,1fr)_minmax(0,1fr)] gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(360px,0.95fr)] lg:grid-rows-1">
            <section class="flex min-h-0 flex-col overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-700">
              <div class="border-b border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900/40">
                <div class="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h4 class="text-sm font-semibold text-gray-900 dark:text-white">Available Topics</h4>
                    <p class="text-xs text-gray-500 dark:text-gray-400">Click a topic to move it into the selected list.</p>
                  </div>
                  <button
                    type="button"
                    @click="addVisibleTopics"
                    :disabled="!filteredAvailableTopics.length"
                    class="cursor-pointer rounded-lg border border-blue-200 px-3 py-2 text-xs font-semibold text-blue-700 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-blue-900/60 dark:text-blue-200 dark:hover:bg-blue-900/20">
                    Add all
                  </button>
                </div>
                <div class="relative mt-3">
                  <i class="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-sm text-gray-400"></i>
                  <input
                    v-model="topicSearchQuery"
                    type="search"
                    placeholder="Search topics..."
                    class="w-full rounded-xl border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-900 dark:text-white" />
                </div>
              </div>

              <div class="min-h-0 flex-1 overflow-y-auto p-3">
                <button
                  v-for="topic in filteredAvailableTopics"
                  :key="topic.topicId"
                  type="button"
                  @click="$emit('add-topic', topic.topicId)"
                  class="mb-2 flex w-full cursor-pointer items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 text-left transition hover:border-blue-300 hover:bg-blue-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-blue-700 dark:hover:bg-blue-900/20">
                  <span class="min-w-0">
                    <span class="block truncate text-sm font-medium text-gray-900 dark:text-white">{{ topic.topicName }}</span>
                    <span class="block truncate text-xs text-gray-500 dark:text-gray-400">{{ topic.courseName }}</span>
                  </span>
                  <i class="fas fa-plus text-sm text-blue-600 dark:text-blue-300"></i>
                </button>

                <p v-if="!filteredAvailableTopics.length" class="px-2 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                  No available topics match this search.
                </p>
              </div>
            </section>

            <section class="flex min-h-0 flex-col overflow-hidden rounded-2xl border border-blue-200 bg-blue-50/40 dark:border-blue-900/50 dark:bg-blue-900/10">
              <div class="border-b border-blue-200 bg-blue-50 p-4 dark:border-blue-900/50 dark:bg-blue-900/20">
                <div class="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h4 class="text-sm font-semibold text-gray-900 dark:text-white">Selected Order</h4>
                    <p class="text-xs text-gray-500 dark:text-gray-400">Drag topics to reorder. Select multiple topics to move them together.</p>
                  </div>
                  <div class="flex items-center gap-2">
                    <button
                      type="button"
                      @click="$emit('move-selected', checkedSelectedTopicIds, 'up')"
                      :disabled="!checkedSelectedTopicIds.length"
                      class="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-blue-200 bg-white text-blue-700 transition hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-blue-900/60 dark:bg-gray-900 dark:text-blue-200 dark:hover:bg-blue-900/30"
                      aria-label="Move selected topics up">
                      <i class="fas fa-arrow-up"></i>
                    </button>
                    <button
                      type="button"
                      @click="$emit('move-selected', checkedSelectedTopicIds, 'down')"
                      :disabled="!checkedSelectedTopicIds.length"
                      class="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-blue-200 bg-white text-blue-700 transition hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-blue-900/60 dark:bg-gray-900 dark:text-blue-200 dark:hover:bg-blue-900/30"
                      aria-label="Move selected topics down">
                      <i class="fas fa-arrow-down"></i>
                    </button>
                  </div>
                </div>
              </div>

              <div class="min-h-0 flex-1 overflow-y-auto p-3">
                <article
                  v-for="(topic, index) in selectedTopics"
                  :key="topic.topicId"
                  draggable="true"
                  @dragstart="startDrag($event, topic.topicId)"
                  @dragover.prevent="setDragTarget(topic.topicId)"
                  @drop.prevent="dropTopic(topic.topicId)"
                  @dragend="clearDrag"
                  :class="[
                    'mb-2 flex items-center gap-3 rounded-xl border bg-white px-3 py-3 shadow-sm transition dark:bg-gray-800',
                    draggedTopicId === topic.topicId
                      ? 'border-blue-400 opacity-60'
                      : dragTargetTopicId === topic.topicId
                        ? 'border-blue-500 ring-2 ring-blue-500/20'
                        : 'border-blue-100 dark:border-blue-900/40',
                  ]">
                  <button
                    type="button"
                    class="cursor-grab text-gray-400 active:cursor-grabbing dark:text-gray-500"
                    aria-label="Drag topic">
                    <i class="fas fa-grip-vertical"></i>
                  </button>
                  <input
                    v-model="checkedSelectedTopicIds"
                    :value="topic.topicId"
                    type="checkbox"
                    class="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-900" />
                  <span class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700 dark:bg-blue-900/40 dark:text-blue-200">
                    {{ index + 1 }}
                  </span>
                  <span class="min-w-0 flex-1">
                    <span class="block truncate text-sm font-medium text-gray-900 dark:text-white">{{ topic.topicName }}</span>
                  </span>
                  <div class="flex shrink-0 items-center gap-1">
                    <button
                      type="button"
                      @click="$emit('move-topic', topic.topicId, 'up')"
                      :disabled="index === 0"
                      class="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-gray-500 transition hover:bg-gray-100 hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-30 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
                      aria-label="Move topic up">
                      <i class="fas fa-chevron-up text-xs"></i>
                    </button>
                    <button
                      type="button"
                      @click="$emit('move-topic', topic.topicId, 'down')"
                      :disabled="index === selectedTopics.length - 1"
                      class="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-gray-500 transition hover:bg-gray-100 hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-30 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
                      aria-label="Move topic down">
                      <i class="fas fa-chevron-down text-xs"></i>
                    </button>
                    <button
                      type="button"
                      @click="removeTopic(topic.topicId)"
                      class="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-rose-500 transition hover:bg-rose-50 hover:text-rose-700 dark:hover:bg-rose-900/20"
                      aria-label="Remove topic">
                      <i class="fas fa-times text-xs"></i>
                    </button>
                  </div>
                </article>

                <div
                  v-if="!selectedTopics.length"
                  class="flex h-full min-h-60 items-center justify-center rounded-xl border border-dashed border-blue-200 bg-white/60 px-4 py-8 text-center dark:border-blue-900/50 dark:bg-gray-900/30">
                  <div>
                    <div class="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300">
                      <i class="fas fa-list-ol"></i>
                    </div>
                    <p class="mt-3 text-sm font-semibold text-gray-900 dark:text-white">No selected topics</p>
                    <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">Add topics from the left pane.</p>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>

      <div class="flex justify-end gap-3 border-t border-gray-200 bg-gray-50 px-6 py-4 dark:border-gray-700 dark:bg-gray-900/40">
        <button
          type="button"
          @click="$emit('close')"
          class="cursor-pointer rounded-lg border border-gray-300 px-4 py-2.5 text-gray-700 transition hover:bg-gray-100 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700">
          Cancel
        </button>
        <button
          v-if="step === 'topics'"
          type="button"
          @click="$emit('save')"
          :disabled="selectedTopicCourseId === null"
          class="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60">
          <i class="fas fa-save"></i>
          Save Assignment
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { Course } from '@/api/models/course'
import type { ExamTypeTopicOption } from '@/composables/useExamTypeTopics'

const props = defineProps<{
  courses: Course[]
  availableTopics: ExamTypeTopicOption[]
  selectedTopics: ExamTypeTopicOption[]
  selectedTopicCourseId: number | null
  isLoadingTopicOptions: boolean
}>()

const emit = defineEmits<{
  close: []
  save: []
  'select-course': [courseId: number]
  'add-topic': [topicId: number]
  'add-topics': [topicIds: number[]]
  'remove-topic': [topicId: number]
  'move-topic': [topicId: number, direction: 'up' | 'down']
  'move-selected': [topicIds: number[], direction: 'up' | 'down']
  'reorder-topic': [topicId: number, targetTopicId: number]
}>()

const step = ref<'subjects' | 'topics'>('subjects')
const subjectSearchQuery = ref('')
const topicSearchQuery = ref('')
const checkedSelectedTopicIds = ref<number[]>([])
const draggedTopicId = ref<number | null>(null)
const dragTargetTopicId = ref<number | null>(null)

const selectedCourse = computed(() =>
  props.courses.find(course => course.id === props.selectedTopicCourseId) ?? null,
)

const filteredCourses = computed(() => {
  const searchTerm = subjectSearchQuery.value.trim().toLowerCase()

  if (!searchTerm) {
    return props.courses
  }

  return props.courses.filter(course => {
    const courseName = String(course.courseName || '').toLowerCase()
    const description = String(course.description || '').toLowerCase()

    return courseName.includes(searchTerm) || description.includes(searchTerm)
  })
})

const filteredAvailableTopics = computed(() => {
  const searchTerm = topicSearchQuery.value.trim().toLowerCase()

  if (!searchTerm) {
    return props.availableTopics
  }

  return props.availableTopics.filter(topic => topic.topicName.toLowerCase().includes(searchTerm))
})

const selectSubject = (courseId: number) => {
  checkedSelectedTopicIds.value = []
  topicSearchQuery.value = ''
  step.value = 'topics'
  emit('select-course', courseId)
}

const showSubjects = () => {
  checkedSelectedTopicIds.value = []
  step.value = 'subjects'
}

const addVisibleTopics = () => {
  emit('add-topics', filteredAvailableTopics.value.map(topic => topic.topicId))
}

const removeTopic = (topicId: number) => {
  checkedSelectedTopicIds.value = checkedSelectedTopicIds.value.filter(id => id !== topicId)
  emit('remove-topic', topicId)
}

const startDrag = (event: DragEvent, topicId: number) => {
  draggedTopicId.value = topicId
  dragTargetTopicId.value = topicId
  event.dataTransfer?.setData('text/plain', String(topicId))
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move'
  }
}

const setDragTarget = (topicId: number) => {
  if (draggedTopicId.value === null) {
    return
  }

  dragTargetTopicId.value = topicId
}

const dropTopic = (targetTopicId: number) => {
  if (draggedTopicId.value === null) {
    return
  }

  emit('reorder-topic', draggedTopicId.value, targetTopicId)
  clearDrag()
}

const clearDrag = () => {
  draggedTopicId.value = null
  dragTargetTopicId.value = null
}

watch(
  () => props.selectedTopics.map(topic => topic.topicId),
  topicIds => {
    const topicIdSet = new Set(topicIds)
    checkedSelectedTopicIds.value = checkedSelectedTopicIds.value.filter(id => topicIdSet.has(id))
  },
)
</script>
