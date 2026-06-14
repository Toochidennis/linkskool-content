<template>
  <div class="flex h-[calc(100vh-4rem)] min-h-0 flex-col bg-gray-50 dark:bg-gray-900">
    <header
      class="flex h-16 shrink-0 items-center justify-between gap-4 border-b border-gray-200 bg-white px-4 dark:border-gray-700 dark:bg-gray-800">
      <div class="flex min-w-0 items-center gap-3">
        <button type="button" @click="goBack"
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
        <button type="button" @click="mode = 'edit'"
          :class="mode === 'edit' ? 'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900/60 dark:bg-blue-900/20 dark:text-blue-200' : 'border-gray-200 text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700'"
          class="hidden cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold sm:inline-flex">
          <i class="fas fa-pen"></i>
          Edit
        </button>
        <button type="button" @click="mode = 'preview'"
          :class="mode === 'preview' ? 'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900/60 dark:bg-blue-900/20 dark:text-blue-200' : 'border-gray-200 text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700'"
          class="hidden cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold sm:inline-flex">
          <i class="fas fa-display"></i>
          Present
        </button>
        <button type="button" @click="showAgentPanel = !showAgentPanel"
          :class="showAgentPanel ? 'border-purple-200 bg-purple-50 text-purple-700 dark:border-purple-900/60 dark:bg-purple-900/20 dark:text-purple-200' : 'border-gray-200 text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700'"
          class="inline-flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold">
          <i class="fas fa-wand-magic-sparkles"></i>
          Agent
        </button>
        <span
          class="hidden items-center gap-2 text-sm font-medium text-emerald-600 dark:text-emerald-400 sm:inline-flex">
          <span class="h-2 w-2 rounded-full bg-emerald-500"></span>
          {{ savedStatus }}
        </span>
        <button type="button" @click="saveContent"
          class="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700">
          <i :class="isSaving ? 'fas fa-spinner fa-spin' : 'fas fa-save'"></i>
          Save
        </button>
      </div>
    </header>

    <div :class="showAgentPanel ? 'grid-cols-[280px_minmax(0,1fr)_360px]' : 'grid-cols-[280px_minmax(0,1fr)]'"
      class="grid min-h-0 flex-1 overflow-hidden">
      <TopicOutline :sections="content.contents" :final-quiz-count="content.finalQuiz.length"
        :expanded-section-ids="expandedSectionIds" :active-surface="activeSurface"
        :active-subsection-id="activeSubsectionId" :active-quiz-section-id="activeQuizSectionId"
        @toggle-section="toggleSection" @select-subsection="selectSubsection" @open-section-quiz="openSectionQuiz"
        @open-final-quiz="openFinalQuiz" />

      <main class="min-h-0 overflow-y-auto bg-gray-100 px-6 py-5 dark:bg-gray-950/40 lg:px-8">
        <div v-if="activeSurface === 'content' && activeSubsection" class="w-full space-y-14">
          <CardRichText :editable="mode === 'edit'" :model-value="activeSubsection.title"
            @update:model-value="updateSubsectionTitle($event)" single-line placeholder="Subsection title"
            content-class="text-4xl font-bold text-gray-900 dark:text-white" class="px-1" />

          <TransitionGroup tag="div" name="card" class="space-y-14">
            <StudyCard v-for="block in activeSubsection.cards" :key="block.id" :block="block" :mode="mode"
              :changed="isChanged(block.id)" :dragging="draggedBlockId === block.id"
              @update="updateBlock(block.id, $event)" @delete="deleteBlock(block.id)"
              @duplicate="duplicateBlock(block.id)" @recast="changeBlockType(block.id, $event)"
              @insert-after="openBlockPaletteAfter(block.id)" @agent="openAgentModal(block.id)"
              @grab="dragFromHandle = true" @dragstart="onBlockDragStart($event, block.id)"
              @dragenter="onBlockDragEnter(block.id)" @dragend="clearBlockDrag" />
          </TransitionGroup>

          <div v-if="activeSubsection.media.length" class="grid gap-4 sm:grid-cols-2">
            <CardImage v-for="(media, index) in activeSubsection.media" :key="index" :url="media.url" :alt="media.alt"
              :editable="mode === 'edit'" @update:url="updateMedia(index, { url: $event })"
              @update:alt="updateMedia(index, { alt: $event })" @remove="removeMedia(index)" />
          </div>

            <div v-if="mode === 'edit' && !activeSubsection.cards.length" class="flex justify-center pb-10">
              <button type="button" @click="openBlockPalette"
                class="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-blue-300 bg-white px-4 py-3 text-sm font-semibold text-blue-700 shadow-sm transition hover:bg-blue-50 dark:border-blue-900 dark:bg-gray-800 dark:text-blue-200 dark:hover:bg-blue-900/20">
                <i class="fas fa-plus"></i>
                Add block
              </button>
            </div>
        </div>

        <QuizEditor v-else-if="activeSurface === 'sectionQuiz' || activeSurface === 'finalQuiz'" :quiz="activeQuiz"
          :title="activeQuizTitle" :active-index="activeQuizQuestionIndex" @select="selectQuizQuestion"
          @add-question="addQuizQuestion" @delete-question="deleteQuizQuestion" />
      </main>

      <AgentPanel v-if="showAgentPanel" :messages="aiMessages" v-model:instruction="aiInstruction"
        v-model:scope="aiScope" :proposal-id="aiProposal?.id ?? null" @send="sendAiInstruction" @apply="applyAiProposal"
        @discard="discardAiProposal" @close="showAgentPanel = false" />
    </div>

    <Teleport to="body">
      <div v-if="addBlockMenuOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
        @click.self="addBlockMenuOpen = false">
        <div
          class="flex max-h-[80vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-gray-700 dark:bg-gray-800">
          <div class="flex items-center justify-between gap-3 border-b border-gray-200 px-4 py-3 dark:border-gray-700">
            <h2 class="text-base font-bold text-gray-900 dark:text-white">Add a block</h2>
            <button type="button" @click="addBlockMenuOpen = false"
              class="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-gray-500 transition hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
              aria-label="Close">
              <i class="fas fa-times"></i>
            </button>
          </div>
          <div class="border-b border-gray-200 p-3 dark:border-gray-700">
            <input v-model="blockFilter" placeholder="Filter blocks…"
              class="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white" />
          </div>
          <div class="min-h-0 flex-1 space-y-2 overflow-y-auto p-3">
            <div v-for="group in filteredPresetGroups" :key="group.group || 'generic'">
              <p v-if="group.group"
                class="px-1 pb-1 pt-2 text-[0.7rem] font-bold uppercase tracking-[0.15em] text-gray-400">
                {{ group.group }}
              </p>
              <hr v-else class="my-1 border-gray-200 dark:border-gray-700" />
              <button v-for="preset in group.presets" :key="preset.label" type="button" @click="addPreset(preset)"
                class="flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2 text-left transition hover:bg-gray-50 dark:hover:bg-gray-700">
                <span
                  class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-600 dark:bg-gray-900 dark:text-gray-300">
                  <i :class="preset.icon"></i>
                </span>
                <span>
                  <span class="block text-sm font-semibold text-gray-900 dark:text-white">{{ preset.label }}</span>
                  <span class="block text-xs text-gray-500 dark:text-gray-400">{{ preset.description }}</span>
                </span>
              </button>
            </div>
            <p v-if="!filteredPresetGroups.length" class="px-2 py-3 text-center text-sm text-gray-400">No blocks match.
            </p>
          </div>
        </div>
      </div>
    </Teleport>

    <Teleport to="body">
      <div v-if="agentBlock" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
        @click.self="closeAgentModal">
        <div class="w-full max-w-md overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-gray-700 dark:bg-gray-800">
          <div class="flex items-start justify-between gap-3 border-b border-gray-200 px-4 py-3 dark:border-gray-700">
            <div class="min-w-0">
              <h2 class="flex items-center gap-2 text-base font-bold text-gray-900 dark:text-white">
                <i class="fas fa-wand-magic-sparkles text-blue-600 dark:text-blue-400"></i>
                Edit with agent
              </h2>
              <p class="mt-0.5 truncate text-xs text-gray-500 dark:text-gray-400">
                {{ plainText(agentBlock.title) || 'Untitled' }}
              </p>
            </div>
            <button type="button" @click="closeAgentModal"
              class="inline-flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg text-gray-500 transition hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
              aria-label="Close">
              <i class="fas fa-times"></i>
            </button>
          </div>
          <div class="p-4">
            <div
              class="relative rounded-xl border border-gray-300 bg-white transition focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-900">
              <textarea v-model="agentPrompt" rows="4" autofocus
                placeholder="Describe the change for this card…  (Enter to send, Shift+Enter for newline)"
                class="w-full resize-none rounded-xl bg-transparent py-2.5 pl-3 pr-12 text-sm text-gray-900 focus:outline-none dark:text-white"
                @keydown.enter.exact.prevent="submitAgentEdit"></textarea>
              <button type="button" @click="submitAgentEdit" :disabled="!agentPrompt.trim()" aria-label="Send"
                class="absolute bottom-2 right-2 inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg bg-blue-600 text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40">
                <i class="fas fa-arrow-up text-xs"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onBeforeUnmount, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import CardRichText from '@/components/CardRichText.vue'
import CardImage from '@/components/CardImage.vue'
import StudyCard from '@/components/StudyCard.vue'
import QuizEditor from '@/components/QuizEditor.vue'
import AgentPanel from '@/components/AgentPanel.vue'
import TopicOutline from '@/components/TopicOutline.vue'
import { plainText } from '@/utils/html'
import { useTopicContentEditor } from '@/composables/useTopicContentEditor'

const route = useRoute()
const router = useRouter()
const draggedBlockId = ref<number | null>(null)
const dragFromHandle = ref(false)
const showAgentPanel = ref(false)
const blockFilter = ref('')

const {
  topicName,
  content,
  activeSubsectionId,
  expandedSectionIds,
  activeSubsection,
  activeQuiz,
  activeQuizTitle,
  activeSurface,
  activeQuizSectionId,
  activeQuizQuestionIndex,
  mode,
  isSaving,
  savedStatus,
  addBlockMenuOpen,
  pendingInsertIndex,
  aiInstruction,
  aiScope,
  aiMessages,
  aiProposal,
  changedBlockIds,
  blockPresetGroups,
  loadContent,
  selectSubsection,
  toggleSection,
  updateSubsectionTitle,
  updateBlock,
  addPreset,
  changeBlockType,
  duplicateBlock,
  deleteBlock,
  reorderBlock,
  updateMedia,
  removeMedia,
  openSectionQuiz,
  openFinalQuiz,
  selectQuizQuestion,
  addQuizQuestion,
  deleteQuizQuestion,
  sendAiInstruction,
  requestBlockAiEdit,
  applyAiProposal,
  discardAiProposal,
  saveContent,
} = useTopicContentEditor()

// Filtered add-block palette — matches heading labels or group names (§6).
const filteredPresetGroups = computed(() => {
  const query = blockFilter.value.trim().toLowerCase()
  if (!query) {
    return blockPresetGroups
  }
  return blockPresetGroups
    .map(group => ({
      group: group.group,
      presets: group.presets.filter(
        preset => preset.label.toLowerCase().includes(query) || group.group.toLowerCase().includes(query),
      ),
    }))
    .filter(group => group.presets.length > 0)
})

const openBlockPalette = () => {
  pendingInsertIndex.value = null
  blockFilter.value = ''
  addBlockMenuOpen.value = true
}

// Open the palette to insert a new card right after the given card.
const openBlockPaletteAfter = (blockId: number) => {
  const cards = activeSubsection.value?.cards ?? []
  const index = cards.findIndex(card => card.id === blockId)
  pendingInsertIndex.value = index >= 0 ? index + 1 : null
  blockFilter.value = ''
  addBlockMenuOpen.value = true
}

const isChanged = (blockId: number) => changedBlockIds.value.includes(blockId)

// Per-card "Edit with agent" prompt modal (scoped to a single block).
const agentBlockId = ref<number | null>(null)
const agentPrompt = ref('')
const agentBlock = computed(() => activeSubsection.value?.cards.find(card => card.id === agentBlockId.value) ?? null)

const openAgentModal = (blockId: number) => {
  agentBlockId.value = blockId
  agentPrompt.value = ''
}

const closeAgentModal = () => {
  agentBlockId.value = null
  agentPrompt.value = ''
}

const submitAgentEdit = () => {
  if (agentBlockId.value === null || !agentPrompt.value.trim()) {
    return
  }
  requestBlockAiEdit(agentBlockId.value, agentPrompt.value)
  closeAgentModal()
}

// Disarm handle-dragging once the pointer is released (covers a click on the
// handle that never turned into a drag).
const disarmDragHandle = () => {
  dragFromHandle.value = false
}

const handleSaveShortcut = (event: KeyboardEvent) => {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 's') {
    event.preventDefault()
    void saveContent()
  }
}

// Only start a drag when it originates from the grip handle, so editing text
// inside a card never kicks off a reorder.
const onBlockDragStart = (event: DragEvent, blockId: number) => {
  if (!dragFromHandle.value) {
    event.preventDefault()
    return
  }
  draggedBlockId.value = blockId
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move'
  }
}

// Live reorder: as the dragged card passes over another, swap it into place so
// the list animates under the cursor (TransitionGroup handles the motion).
const onBlockDragEnter = (targetBlockId: number) => {
  if (draggedBlockId.value !== null && draggedBlockId.value !== targetBlockId) {
    reorderBlock(draggedBlockId.value, targetBlockId)
  }
}

const clearBlockDrag = () => {
  draggedBlockId.value = null
  dragFromHandle.value = false
}

const goBack = () => {
  router.push({ name: 'Topics' })
}

onMounted(() => {
  const topicNameQuery = typeof route.query.topicName === 'string' ? route.query.topicName : undefined
  const topicId = Number(route.params.topicId)
  if (Number.isFinite(topicId)) {
    void loadContent(topicId, topicNameQuery)
  }
  window.addEventListener('keydown', handleSaveShortcut)
  window.addEventListener('mouseup', disarmDragHandle)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleSaveShortcut)
  window.removeEventListener('mouseup', disarmDragHandle)
})
</script>

<style scoped>
.icon-btn {
  display: inline-flex;
  height: 1.5rem;
  width: 1.5rem;
  align-items: center;
  justify-content: center;
  border-radius: 0.375rem;
  font-size: 0.75rem;
  color: rgb(107 114 128);
  transition: background-color 0.15s ease, color 0.15s ease;
}

.icon-btn:hover {
  background: rgb(243 244 246);
  color: rgb(17 24 39);
}

.action-tip {
  position: absolute;
  left: 50%;
  bottom: 100%;
  z-index: 30;
  margin-bottom: 0.25rem;
  transform: translateX(-50%);
  white-space: nowrap;
  border-radius: 0.375rem;
  background: rgb(17 24 39);
  padding: 0.2rem 0.45rem;
  font-size: 0.7rem;
  font-weight: 600;
  color: white;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.15s ease;
}

.group\/tip:hover .action-tip {
  opacity: 1;
}

/* Smooth card reordering during drag (TransitionGroup). */
.card-move {
  transition: transform 0.25s ease;
}

.card-enter-active,
.card-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.card-enter-from,
.card-leave-to {
  opacity: 0;
  transform: translateY(0.5rem);
}

.card-leave-active {
  position: absolute;
  width: 100%;
}
</style>
