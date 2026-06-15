<template>
  <div class="flex h-[calc(100vh-7rem)] min-h-0 flex-col gap-6 overflow-hidden">
    <header class="flex shrink-0 items-start gap-3">
      <button
        type="button"
        @click="goBack"
        class="mt-1 inline-flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-gray-300 text-gray-600 transition hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700"
        aria-label="Back">
        <i class="fas fa-arrow-left"></i>
      </button>
      <div class="min-w-0">
        <p class="text-xs font-semibold uppercase tracking-[0.24em] text-blue-600 dark:text-blue-400">Topic Workspace</p>
        <h1 class="mt-2 truncate text-3xl font-bold text-gray-900 dark:text-white">Topic: {{ topicTitle }}</h1>
        <p class="mt-2 text-gray-600 dark:text-gray-400">Manage subtopics and their nested learning points.</p>
      </div>
    </header>

    <section class="grid min-h-0 flex-1 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800 lg:grid-cols-[320px_minmax(0,1fr)]">
      <aside class="flex min-h-0 flex-col border-b border-gray-200 dark:border-gray-700 lg:border-b-0 lg:border-r">
        <div class="border-b border-gray-200 p-5 dark:border-gray-700">
          <div class="flex items-start justify-between gap-3">
            <div>
              <h2 class="text-sm font-semibold uppercase tracking-wide text-gray-900 dark:text-white">Subtopics</h2>
              <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">{{ subtopics.length }} loaded</p>
            </div>
            <span
              v-if="isLoadingSubtopics"
              class="inline-flex items-center gap-2 rounded-full bg-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
              <i class="fas fa-spinner fa-spin"></i>
              Loading
            </span>
          </div>

          <div class="relative mt-4">
            <i class="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-sm text-gray-400"></i>
            <input
              v-model="searchQuery"
              type="search"
              placeholder="Search subtopics..."
              class="w-full rounded-xl border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-900 dark:text-white" />
          </div>
        </div>

        <div class="min-h-0 flex-1 overflow-y-auto p-3">
          <button
            v-for="subtopic in filteredSubtopics"
            :key="subtopic.subtopicId"
            type="button"
            @click="loadSubtopicDetail(subtopic.subtopicId)"
            :class="[
              selectedSubtopicId === subtopic.subtopicId
                ? 'border-blue-500 bg-blue-50 text-blue-800 ring-2 ring-blue-500/10 dark:border-blue-500 dark:bg-blue-900/20 dark:text-blue-100'
                : 'border-transparent text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-700/50',
            ]"
            class="mb-1 flex w-full cursor-pointer items-center gap-3 rounded-xl border px-3 py-3 text-left transition">
            <span
              :class="selectedSubtopicId === subtopic.subtopicId ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'"
              class="h-2.5 w-2.5 shrink-0 rounded-full"></span>
            <span class="min-w-0 flex-1 truncate text-sm font-medium">{{ subtopic.subtopicName }}</span>
          </button>

          <div v-if="!filteredSubtopics.length" class="px-3 py-10 text-center text-sm text-gray-500 dark:text-gray-400">
            No subtopics match this search.
          </div>
        </div>
      </aside>

      <main class="min-h-0 overflow-hidden">
        <div v-if="isLoadingSubtopicDetail" class="flex min-h-[52vh] items-center justify-center text-gray-600 dark:text-gray-300">
          <span class="inline-flex items-center gap-3">
            <i class="fas fa-spinner fa-spin text-blue-600 dark:text-blue-400"></i>
            Loading subtopic detail...
          </span>
        </div>

        <div v-else-if="selectedSubtopicDetail" class="flex h-full min-h-0 flex-col">
          <div class="shrink-0 space-y-6 border-b border-gray-200 px-5 py-5 dark:border-gray-700 lg:px-6 lg:py-6">
            <div class="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Edit Subtopic</h2>
                <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">Update the title and order its sub-subtopics.</p>
              </div>
              <span class="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600 dark:bg-gray-900/60 dark:text-gray-300">
                {{ selectedSubtopicDetail.subSubtopics.length }} items
              </span>
            </div>

            <div>
              <label class="text-sm font-semibold text-gray-800 dark:text-gray-100" for="subtopic-title">Title</label>
              <input
                id="subtopic-title"
                :value="selectedSubtopicDetail.subtopicName"
                type="text"
                @input="handleTitleInput"
                class="mt-2 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-900 dark:text-white" />
            </div>
          </div>

          <section class="flex min-h-0 flex-1 flex-col overflow-hidden">
            <div class="shrink-0 flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 bg-gray-50 px-5 py-3 dark:border-gray-700 dark:bg-gray-900/40 lg:px-6">
              <div>
                <h3 class="text-sm font-semibold text-gray-900 dark:text-white">Sub-subtopics</h3>
                <p class="text-xs text-gray-500 dark:text-gray-400">
                  {{ selectedSubtopicDetail.subSubtopics.length }} items. Drag to reorder.
                </p>
              </div>
              <button
                type="button"
                @click="handleAddSubSubtopic"
                class="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-blue-700">
                <i class="fas fa-plus"></i>
                Add
              </button>
            </div>

            <div
              ref="subSubtopicsListRef"
              class="min-h-0 flex-1 divide-y divide-gray-200 overflow-y-auto dark:divide-gray-700"
              @dragover.prevent="handleListDragOver">
              <article
                v-for="(item, index) in selectedSubtopicDetail.subSubtopics"
                :key="`${item}-${index}`"
                draggable="true"
                @dragstart="startDrag($event, index)"
                @dragover.prevent="setDragTarget($event, index)"
                @drop.prevent="dropSubSubtopic(index)"
                @dragend="clearDrag"
                :class="[
                  draggedSubSubtopicIndex === index ? 'opacity-60' : '',
                  dragTargetSubSubtopicIndex === index ? 'bg-blue-50 dark:bg-blue-900/20' : 'bg-white dark:bg-gray-800',
                ]"
                class="flex items-center gap-3 px-4 py-3 transition">
                <button
                  type="button"
                  class="cursor-grab text-gray-400 active:cursor-grabbing dark:text-gray-500"
                  aria-label="Drag sub-subtopic">
                  <i class="fas fa-grip-vertical"></i>
                </button>
                <span class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-bold text-gray-600 dark:bg-gray-900 dark:text-gray-300">
                  {{ index + 1 }}
                </span>

                <input
                  v-if="editingSubSubtopicIndex === index"
                  v-model="editSubSubtopicTitle"
                  type="text"
                  data-active-sub-subtopic-input="true"
                  class="min-w-0 flex-1 rounded-lg border border-blue-300 bg-white px-3 py-2 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500/20 dark:border-blue-700 dark:bg-gray-900 dark:text-white"
                  @keyup.enter="commitSubSubtopicEdit"
                  @blur="commitSubSubtopicEdit" />
                <span v-else class="min-w-0 flex-1 truncate text-sm font-medium text-gray-900 dark:text-white">
                  {{ item }}
                </span>

                <button
                  type="button"
                  @click="startEditingSubSubtopic(index, item)"
                  class="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg text-gray-500 transition hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
                  aria-label="Edit sub-subtopic">
                  <i class="fas fa-pen text-xs"></i>
                </button>
                <button
                  type="button"
                  @click="deleteSubSubtopic(index)"
                  class="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg text-rose-500 transition hover:bg-rose-50 hover:text-rose-700 dark:hover:bg-rose-900/20"
                  aria-label="Delete sub-subtopic">
                  <i class="fas fa-trash text-xs"></i>
                </button>
              </article>
            </div>
          </section>

          <footer class="shrink-0 flex flex-wrap items-center justify-between gap-4 border-t border-gray-200 bg-white px-5 py-4 dark:border-gray-700 dark:bg-gray-800 lg:px-6">
            <p
              :class="selectedSubtopicDetail.subSubtopics.length >= MIN_SUB_SUBTOPICS ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'"
              class="text-sm font-semibold">
              Minimum {{ MIN_SUB_SUBTOPICS }} required
            </p>
            <div class="flex items-center gap-3">
              <button
                type="button"
                @click="resetSelectedDetail"
                class="cursor-pointer rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-100 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700">
                Cancel
              </button>
              <button
                type="button"
                @click="saveSelectedSubtopic"
                :disabled="!canSave"
                class="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60">
                <i :class="isSavingSubtopic ? 'fas fa-spinner fa-spin' : 'fas fa-save'"></i>
                Save
              </button>
            </div>
          </footer>
        </div>

        <div v-else class="flex min-h-[52vh] items-center justify-center px-6 text-center">
          <div>
            <div class="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-300">
              <i class="fas fa-list-ul"></i>
            </div>
            <h2 class="mt-4 text-lg font-semibold text-gray-900 dark:text-white">No subtopic selected</h2>
            <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">Choose a subtopic from the list to edit it.</p>
          </div>
        </div>
      </main>
    </section>
  </div>
</template>

<script setup lang="ts">
import { nextTick, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useTopicSubtopics } from '@/composables/useTopicSubtopics'

const route = useRoute()
const router = useRouter()

const draggedSubSubtopicIndex = ref<number | null>(null)
const dragTargetSubSubtopicIndex = ref<number | null>(null)
const subSubtopicsListRef = ref<HTMLElement | null>(null)

const {
  MIN_SUB_SUBTOPICS,
  topicTitle,
  subtopics,
  filteredSubtopics,
  selectedSubtopicId,
  selectedSubtopicDetail,
  searchQuery,
  editingSubSubtopicIndex,
  editSubSubtopicTitle,
  isLoadingSubtopics,
  isLoadingSubtopicDetail,
  isSavingSubtopic,
  canSave,
  loadTopicSubtopics,
  loadSubtopicDetail,
  updateSelectedTitle,
  addSubSubtopic,
  startEditingSubSubtopic,
  commitSubSubtopicEdit,
  deleteSubSubtopic,
  reorderSubSubtopic,
  resetSelectedDetail,
  saveSelectedSubtopic,
} = useTopicSubtopics()

const goBack = () => {
  // Return to the caller (the subject's topics page); fall back to Topics.
  if (window.history.length > 1) {
    router.back()
  } else {
    router.push({ name: 'Topics' })
  }
}

const handleTitleInput = (event: Event) => {
  updateSelectedTitle((event.target as HTMLInputElement).value)
}

const handleAddSubSubtopic = async () => {
  addSubSubtopic()
  await nextTick()

  subSubtopicsListRef.value?.scrollTo({
    top: subSubtopicsListRef.value.scrollHeight,
    behavior: 'smooth',
  })

  const activeInput = subSubtopicsListRef.value?.querySelector<HTMLInputElement>(
    '[data-active-sub-subtopic-input="true"]',
  )
  activeInput?.focus()
  activeInput?.select()
}

const startDrag = (event: DragEvent, subSubtopicIndex: number) => {
  draggedSubSubtopicIndex.value = subSubtopicIndex
  dragTargetSubSubtopicIndex.value = subSubtopicIndex
  event.dataTransfer?.setData('text/plain', String(subSubtopicIndex))
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move'
  }
}

const scrollDragContainer = (event: DragEvent) => {
  const container = subSubtopicsListRef.value
  if (!container) {
    return
  }

  const edgeSize = 72
  const maxStep = 18
  const rect = container.getBoundingClientRect()
  const topDistance = event.clientY - rect.top
  const bottomDistance = rect.bottom - event.clientY

  if (topDistance < edgeSize) {
    const intensity = 1 - Math.max(topDistance, 0) / edgeSize
    container.scrollTop -= Math.ceil(maxStep * intensity)
    return
  }

  if (bottomDistance < edgeSize) {
    const intensity = 1 - Math.max(bottomDistance, 0) / edgeSize
    container.scrollTop += Math.ceil(maxStep * intensity)
  }
}

const handleListDragOver = (event: DragEvent) => {
  if (draggedSubSubtopicIndex.value === null) {
    return
  }

  scrollDragContainer(event)
}

const setDragTarget = (event: DragEvent, subSubtopicIndex: number) => {
  if (draggedSubSubtopicIndex.value === null) {
    return
  }

  scrollDragContainer(event)
  dragTargetSubSubtopicIndex.value = subSubtopicIndex
}

const dropSubSubtopic = (targetSubSubtopicIndex: number) => {
  if (draggedSubSubtopicIndex.value === null) {
    return
  }

  reorderSubSubtopic(draggedSubSubtopicIndex.value, targetSubSubtopicIndex)
  clearDrag()
}

const clearDrag = () => {
  draggedSubSubtopicIndex.value = null
  dragTargetSubSubtopicIndex.value = null
}

onMounted(() => {
  const topicId = String(route.params.topicId || '').trim()
  const topicName = typeof route.query.topicName === 'string' ? route.query.topicName : undefined

  if (topicId) {
    void loadTopicSubtopics(topicId, topicName)
  }
})
</script>
