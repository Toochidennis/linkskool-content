<template>
  <div class="group/card relative">
    <article draggable="true" @dragstart="emit('dragstart', $event)" @dragenter.prevent="emit('dragenter')"
      @dragover.prevent @drop.prevent="emit('dragend')" @dragend="emit('dragend')" :class="[
        block.type === 'highlight' ? 'border-yellow-200 bg-yellow-50 dark:border-yellow-900/60 dark:bg-yellow-900/20' : '',
        block.type === 'examTip' ? 'border-emerald-200 bg-emerald-50 dark:border-emerald-900/60 dark:bg-emerald-900/20' : '',
        block.type === 'commonMistake' ? 'border-rose-200 bg-rose-50 dark:border-rose-900/60 dark:bg-rose-900/20' : '',
        dragging ? 'opacity-40' : '',
        changed ? 'ring-2 ring-emerald-400/70' : '',
      ]"
      class="group rounded-md border-[0.5px] border-gray-500/50 bg-white p-8 transition focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500/30 dark:border-gray-600/60 dark:bg-gray-800 dark:focus-within:border-blue-400">
      <div v-if="mode === 'edit'"
        class="mb-2 flex items-center gap-0.5 opacity-100 lg:opacity-0 lg:transition lg:group-hover:opacity-100">
        <div class="group/tip relative">
          <button type="button" class="icon-btn cursor-grab" @mousedown="emit('grab')"><i
              class="fas fa-grip-vertical"></i></button>
          <span class="action-tip">Drag to reorder</span>
        </div>
        <div class="group/tip relative">
          <button type="button" class="icon-btn" @click="emit('duplicate')"><i class="fas fa-copy"></i></button>
          <span class="action-tip">Duplicate</span>
        </div>
        <div class="group/tip relative">
          <button type="button" class="icon-btn" @click="recastOpen = !recastOpen"><i
              class="fas fa-arrows-up-down-left-right"></i></button>
          <span class="action-tip">Change heading</span>
          <div v-if="recastOpen" class="fixed inset-0 z-10" @click="recastOpen = false"></div>
          <div v-if="recastOpen"
            class="absolute left-0 top-full z-20 mt-1 grid w-56 gap-1 rounded-xl border border-gray-200 bg-white p-2 shadow-xl dark:border-gray-700 dark:bg-gray-800">
            <p class="px-2 py-1 text-xs font-semibold uppercase tracking-wide text-gray-400">Change heading</p>
            <button v-for="option in recastOptions" :key="option.label" type="button" @click="recast(option)"
              class="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-700">
              <i :class="option.icon" class="w-4 text-xs text-gray-400"></i>
              {{ option.label }}
            </button>
          </div>
        </div>
        <div class="group/tip relative">
          <button type="button" class="icon-btn" @click="emit('agent')"><i
              class="fas fa-wand-magic-sparkles"></i></button>
          <span class="action-tip">Edit with agent</span>
        </div>
        <div class="group/tip relative">
          <button type="button" class="icon-btn" @click="emit('delete')"><i class="fas fa-trash"></i></button>
          <span class="action-tip">Delete</span>
        </div>
      </div>

      <CardRichText :editable="mode === 'edit'" :model-value="block.title || ''"
        @update:model-value="emit('update', { title: $event })" single-line placeholder="Heading"
        content-class="text-4xl font-bold text-gray-900 dark:text-white" class="mb-2" />

      <CardRichText v-if="hasBody" :editable="mode === 'edit'" :model-value="block.body || ''"
        @update:model-value="emit('update', { body: $event })" placeholder="Start typing… use $latex$ for math"
        content-class="text-base leading-relaxed text-gray-700 dark:text-gray-200" />

      <CardRichText v-if="block.type === 'list'" :key="`list-${block.id}-${block.ordered ? 'o' : 'u'}`"
        :editable="mode === 'edit'" list :ordered="block.ordered" :model-value="listHtml"
        @update:model-value="setListItems" placeholder="List item — press Enter for a new line"
        content-class="text-base text-gray-800 dark:text-gray-100" />

      <div v-if="block.type === 'pairs'">
        <div v-if="mode === 'edit'" class="space-y-1">
          <div v-for="(pair, index) in pairs" :key="index"
            class="group/row grid items-start gap-3 border-b border-gray-100 py-2 md:grid-cols-[1fr_1.5fr] dark:border-gray-700/60">
            <CardRichText :ref="el => setPairTermRef(index, el)" :model-value="pair.term"
              @update:model-value="updatePair(index, { term: $event })" single-line placeholder="Term"
              content-class="text-base font-semibold text-gray-900 dark:text-white" @enter="addPairAfter(index)"
              @backspace-empty="onPairBackspace(index)" />
            <CardRichText :model-value="pair.description"
              @update:model-value="updatePair(index, { description: $event })" single-line placeholder="Meaning"
              content-class="text-base text-gray-700 dark:text-gray-200" @enter="addPairAfter(index)"
              @backspace-empty="onPairBackspace(index)" />
          </div>
        </div>
        <dl v-else class="divide-y divide-gray-100 dark:divide-gray-700">
          <div v-for="(pair, index) in pairs" :key="index" class="grid gap-2 py-2 md:grid-cols-[1fr_1.5fr]">
            <dt>
              <CardRichText :editable="false" :model-value="pair.term" single-line
                content-class="font-semibold text-gray-900 dark:text-white" />
            </dt>
            <dd>
              <CardRichText :editable="false" :model-value="pair.description" single-line
                content-class="text-gray-700 dark:text-gray-200" />
            </dd>
          </div>
        </dl>
      </div>

      <div v-if="block.type === 'commonMistake'" class="grid gap-3 md:grid-cols-2">
        <div class="rounded-lg bg-rose-50 p-3 dark:bg-rose-900/20">
          <p class="mb-1 text-xs font-bold uppercase tracking-wide text-rose-600 dark:text-rose-300">
            <i class="fas fa-xmark mr-1"></i>Wrong
          </p>
          <CardRichText :editable="mode === 'edit'" :model-value="block.wrong || ''"
            @update:model-value="emit('update', { wrong: $event })" placeholder="The misconception…"
            content-class="text-sm text-rose-700 dark:text-rose-200" />
        </div>
        <div class="rounded-lg bg-emerald-50 p-3 dark:bg-emerald-900/20">
          <p class="mb-1 text-xs font-bold uppercase tracking-wide text-emerald-600 dark:text-emerald-300">
            <i class="fas fa-check mr-1"></i>Correct
          </p>
          <CardRichText :editable="mode === 'edit'" :model-value="block.correct || ''"
            @update:model-value="emit('update', { correct: $event })" placeholder="The correct idea…"
            content-class="text-sm text-emerald-700 dark:text-emerald-200" />
        </div>
      </div>
    </article>

    <div v-if="mode === 'edit'"
      class="pointer-events-none absolute inset-x-0 top-full z-10 flex h-14 items-center justify-center">
      <div class="group/tip pointer-events-auto relative">
        <button type="button" @click="emit('insert-after')"
          class="inline-flex h-9 w-16 cursor-pointer items-center justify-center rounded-md border-[0.5px] border-gray-400 bg-white text-gray-500 opacity-0 shadow-sm transition hover:border-blue-400 hover:text-blue-600 group-hover/card:opacity-100 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300">
          <i class="fas fa-plus text-sm"></i>
        </button>
        <span class="action-tip">Insert a new block here</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, ref } from 'vue'
import CardRichText from '@/components/CardRichText.vue'
import { plainText } from '@/utils/html'
import { recastOptionsFor } from '@/composables/useTopicContentEditor/blockPresets'
import type { BlockPreset, StudyBlock } from '@/composables/useTopicContentEditor'

const props = defineProps<{
  block: StudyBlock
  mode: 'edit' | 'preview'
  changed?: boolean
  dragging?: boolean
}>()

const emit = defineEmits<{
  update: [patch: Partial<StudyBlock>]
  delete: []
  duplicate: []
  recast: [preset: BlockPreset]
  'insert-after': []
  agent: []
  grab: []
  dragstart: [event: DragEvent]
  dragenter: []
  dragend: []
}>()

const recastOpen = ref(false)
const recastOptions = computed(() => recastOptionsFor(props.block.type))
const hasBody = computed(() =>
  ['text', 'highlight', 'examTip', 'equation', 'workedExample'].includes(props.block.type),
)

const recast = (preset: BlockPreset) => {
  emit('recast', preset)
  recastOpen.value = false
}

// ── List (single bullet/numbered editor) ──
const listHtml = computed(() => {
  const items = Array.isArray(props.block.items) ? (props.block.items as string[]) : []
  const rows = (items.length ? items : ['']).map(item => `<li>${item || '<p></p>'}</li>`).join('')
  const tag = props.block.ordered ? 'ol' : 'ul'
  return `<${tag}>${rows}</${tag}>`
})

const setListItems = (html: string) => {
  const doc = new DOMParser().parseFromString(html, 'text/html')
  const items = Array.from(doc.querySelectorAll('li')).map(li => li.innerHTML)
  emit('update', { items })
}

// ── Pairs ──
const pairs = computed(() =>
  Array.isArray(props.block.items) ? (props.block.items as Array<{ term: string; description: string }>) : [],
)

const pairTermRefs = ref<Record<number, { focus: () => void } | null>>({})
const setPairTermRef = (index: number, el: unknown) => {
  pairTermRefs.value[index] = el as { focus: () => void } | null
}

const updatePair = (index: number, patch: { term?: string; description?: string }) => {
  const items = pairs.value.map((pair, i) => (i === index ? { ...pair, ...patch } : pair))
  emit('update', { items })
}

const addPairAfter = (index: number) => {
  const items = [...pairs.value.slice(0, index + 1), { term: '', description: '' }, ...pairs.value.slice(index + 1)]
  emit('update', { items })
  nextTick(() => pairTermRefs.value[index + 1]?.focus())
}

const onPairBackspace = (index: number) => {
  const pair = pairs.value[index]
  if (!pair || plainText(pair.term) || plainText(pair.description) || pairs.value.length <= 1) {
    return
  }
  emit('update', { items: pairs.value.filter((_, i) => i !== index) })
  nextTick(() => pairTermRefs.value[Math.max(0, index - 1)]?.focus())
}
</script>
