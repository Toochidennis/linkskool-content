<template>
  <div ref="rootEl" :class="stageBg"
    class="fixed inset-0 z-[60] flex flex-col text-gray-900 transition-colors duration-700">
    <!-- Top bar -->
    <div class="flex shrink-0 items-center justify-between gap-4 px-6 py-3">
      <p class="truncate text-sm font-medium text-gray-500">{{ currentLabel }}</p>
      <div class="flex items-center gap-4">
        <span class="text-sm tabular-nums text-gray-500">{{ currentIndex + 1 }} / {{ slides.length }}</span>
        <button type="button" @click="emit('exit')" title="Exit (Esc)"
          class="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg text-gray-500 transition hover:bg-gray-200 hover:text-gray-900">
          <i class="fas fa-times"></i>
        </button>
      </div>
    </div>

    <!-- Slide stage -->
    <div class="slide-stage relative flex min-h-0 flex-1 items-center justify-center overflow-hidden px-16 pb-6">
      <Transition :name="direction >= 0 ? 'slide-next' : 'slide-prev'" mode="out-in">
        <div :key="currentIndex" class="flex max-h-full w-full max-w-5xl items-center justify-center overflow-y-auto">
          <template v-if="current">
            <!-- Section divider -->
            <div v-if="current.kind === 'section'" class="pcard w-full text-center" :style="cardDelay(0)">
              <p class="mb-4 text-base font-semibold uppercase tracking-[0.3em] text-blue-600">Section</p>
              <h1 class="text-6xl font-bold leading-tight text-gray-900">{{ current.title }}</h1>
            </div>

            <!-- Single card -->
            <div v-else-if="current.kind === 'card'" class="w-full">
              <div v-if="current.showContext" class="pcard mb-6 border-l-4 border-blue-500 pl-4" :style="cardDelay(0)">
                <p class="text-sm font-semibold uppercase tracking-[0.25em] text-blue-600">{{ current.sectionTitle }}</p>
                <CardRichText :editable="false" :model-value="current.subsectionTitle" single-line
                  content-class="text-2xl font-bold text-gray-500" />
              </div>
              <div class="pcard" :style="cardDelay(current.showContext ? 1 : 0)">
                <StudyCard :block="current.card" mode="preview" bare />
              </div>
            </div>

            <!-- Image -->
            <div v-else-if="current.kind === 'image'" class="w-full">
              <div v-if="current.showContext" class="pcard mb-6 border-l-4 border-blue-500 pl-4" :style="cardDelay(0)">
                <p class="text-sm font-semibold uppercase tracking-[0.25em] text-blue-600">{{ current.sectionTitle }}</p>
                <CardRichText :editable="false" :model-value="current.subsectionTitle" single-line
                  content-class="text-2xl font-bold text-gray-500" />
              </div>
              <figure class="pcard w-full text-center" :style="cardDelay(current.showContext ? 1 : 0)">
                <img :src="current.media.url" :alt="current.media.alt || 'Image'"
                  class="mx-auto max-h-[64vh] w-auto rounded-2xl object-contain shadow-lg" />
                <figcaption v-if="current.media.alt" class="mt-4 text-base text-gray-500">{{ current.media.alt }}</figcaption>
              </figure>
            </div>

            <!-- Quiz question -->
            <div v-else class="w-full space-y-6">
              <p class="pcard text-base font-semibold uppercase tracking-[0.2em] text-amber-600" :style="cardDelay(0)">
                {{ current.label }} · {{ current.number }}/{{ current.total }}
              </p>
              <div class="pcard" :style="cardDelay(1)">
                <CardRichText :editable="false" :model-value="current.question.questionText"
                  content-class="text-3xl font-bold text-gray-900" />
              </div>
              <ul class="space-y-3">
                <li v-for="(option, i) in current.question.options" :key="i"
                  class="pcard flex items-center gap-4 rounded-2xl border px-5 py-4" :style="cardDelay(i + 2)"
                  :class="i === current.question.correctAnswer ? 'border-emerald-400 bg-emerald-50' : 'border-gray-200 bg-white'">
                  <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-base font-bold"
                    :class="i === current.question.correctAnswer ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-600'">
                    {{ String.fromCharCode(65 + i) }}
                  </span>
                  <CardRichText class="min-w-0 flex-1" :editable="false" :model-value="option.text" single-line
                    content-class="text-lg text-gray-800" />
                  <i v-if="i === current.question.correctAnswer" class="fas fa-check text-emerald-600"></i>
                </li>
              </ul>
              <div v-if="explanationText(current.question)" class="pcard rounded-2xl border border-gray-200 bg-white p-5"
                :style="cardDelay(current.question.options.length + 2)">
                <p class="mb-1 text-xs font-bold uppercase tracking-wide text-gray-400">Explanation</p>
                <CardRichText :editable="false" :model-value="current.question.explanation"
                  content-class="text-base text-gray-700" />
              </div>
            </div>
          </template>
        </div>
      </Transition>

      <!-- Nav arrows -->
      <button type="button" @click="prev" :disabled="currentIndex === 0" title="Previous (←)"
        class="absolute left-4 top-1/2 inline-flex h-11 w-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-gray-100 text-gray-700 shadow-sm transition hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-30">
        <i class="fas fa-chevron-left"></i>
      </button>
      <button type="button" @click="next" :disabled="currentIndex === slides.length - 1" title="Next (→)"
        class="absolute right-4 top-1/2 inline-flex h-11 w-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-gray-100 text-gray-700 shadow-sm transition hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-30">
        <i class="fas fa-chevron-right"></i>
      </button>
    </div>

    <!-- Progress -->
    <div class="h-1 w-full shrink-0 bg-gray-200">
      <div class="h-full bg-blue-600 transition-all duration-300"
        :style="{ width: `${((currentIndex + 1) / slides.length) * 100}%` }"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import CardRichText from '@/components/CardRichText.vue'
import StudyCard from '@/components/StudyCard.vue'
import { plainText } from '@/utils/html'
import type { FormattedStudyContent, StudyBlock, StudyMedia, StudyQuizItem } from '@/composables/useTopicContentEditor'

const props = defineProps<{
  content: FormattedStudyContent
}>()

const emit = defineEmits<{
  exit: []
}>()

type Slide =
  | { kind: 'section'; title: string }
  | { kind: 'card'; sectionTitle: string; subsectionTitle: string; card: StudyBlock; showContext: boolean }
  | { kind: 'image'; sectionTitle: string; subsectionTitle: string; media: StudyMedia; showContext: boolean }
  | { kind: 'quiz'; label: string; question: StudyQuizItem; number: number; total: number }

const slides = computed<Slide[]>(() => {
  const out: Slide[] = []
  for (const section of props.content.contents) {
    out.push({ kind: 'section', title: section.title })
    for (const subsection of section.subsections) {
      // Show the section/subsection context only once — on the subsection's first slide.
      let showContext = true
      for (const card of subsection.cards) {
        out.push({ kind: 'card', sectionTitle: section.title, subsectionTitle: subsection.title, card, showContext })
        showContext = false
      }
      for (const media of subsection.media) {
        out.push({ kind: 'image', sectionTitle: section.title, subsectionTitle: subsection.title, media, showContext })
        showContext = false
      }
    }
    section.quiz.forEach((question, i) =>
      out.push({ kind: 'quiz', label: `${section.title} · Quiz`, question, number: i + 1, total: section.quiz.length }),
    )
  }
  props.content.finalQuiz.forEach((question, i) =>
    out.push({ kind: 'quiz', label: 'Final Quiz', question, number: i + 1, total: props.content.finalQuiz.length }),
  )
  return out
})

const currentIndex = ref(0)
const direction = ref(1)
const current = computed(() => slides.value[currentIndex.value] ?? null)

// Breadcrumb shown in the top bar: keeps section/subsection context on every slide.
const currentLabel = computed(() => {
  const slide = current.value
  if (!slide) return ''
  if (slide.kind === 'section') return ''
  if (slide.kind === 'quiz') return slide.label
  return `${slide.sectionTitle} › ${plainText(slide.subsectionTitle) || 'Untitled'}`
})

// Slide background softly tints to match the current card's type.
const TYPE_BG: Record<string, string> = {
  highlight: 'bg-yellow-50',
  examTip: 'bg-emerald-50',
  commonMistake: 'bg-rose-50',
  equation: 'bg-indigo-50',
  workedExample: 'bg-sky-50',
}

const stageBg = computed(() => {
  const slide = current.value
  if (!slide) return 'bg-gray-50'
  if (slide.kind === 'card') return TYPE_BG[slide.card.type] ?? 'bg-gray-50'
  if (slide.kind === 'quiz') return 'bg-amber-50'
  if (slide.kind === 'section') return 'bg-blue-50'
  return 'bg-gray-50'
})

const cardDelay = (i: number) => ({ '--d': `${i * 80}ms` })
const explanationText = (question: StudyQuizItem) => plainText(question.explanation)

const next = () => {
  if (currentIndex.value < slides.value.length - 1) {
    direction.value = 1
    currentIndex.value += 1
  }
}

const prev = () => {
  if (currentIndex.value > 0) {
    direction.value = -1
    currentIndex.value -= 1
  }
}

watch(
  () => slides.value.length,
  length => {
    if (currentIndex.value > length - 1) {
      currentIndex.value = Math.max(0, length - 1)
    }
  },
)

const onKey = (event: KeyboardEvent) => {
  if (event.key === 'ArrowRight' || event.key === 'PageDown' || event.key === ' ') {
    event.preventDefault()
    next()
  } else if (event.key === 'ArrowLeft' || event.key === 'PageUp') {
    event.preventDefault()
    prev()
  } else if (event.key === 'Escape') {
    emit('exit')
  }
}

// ── Native fullscreen ──
const rootEl = ref<HTMLElement | null>(null)
let exiting = false

const onFullscreenChange = () => {
  // User left fullscreen (Esc / system UI) → leave present mode too.
  if (!document.fullscreenElement && !exiting) {
    emit('exit')
  }
}

onMounted(() => {
  window.addEventListener('keydown', onKey)
  document.addEventListener('fullscreenchange', onFullscreenChange)
  document.body.style.overflow = 'hidden'
  // Best-effort — falls back to the full-viewport overlay if the browser blocks it.
  rootEl.value?.requestFullscreen?.().catch(() => {})
})

onBeforeUnmount(() => {
  exiting = true
  window.removeEventListener('keydown', onKey)
  document.removeEventListener('fullscreenchange', onFullscreenChange)
  document.body.style.overflow = ''
  if (document.fullscreenElement) {
    void document.exitFullscreen?.()
  }
})
</script>

<style scoped>
/* Scale all rich-text content up for the full-screen slide. Because the size
   class sits on the wrapper and `.rich-content` uses `em`, every field (titles,
   body, lists, quiz, KaTeX) grows proportionally. */
.slide-stage :deep(.rich-content) {
  font-size: 1.4em;
}

/* Per-element staggered entrance on each slide. */
.pcard {
  animation: card-in 0.5s cubic-bezier(0.22, 1, 0.36, 1) both;
  animation-delay: var(--d, 0ms);
}

@keyframes card-in {
  from {
    opacity: 0;
    transform: translateY(16px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Direction-aware slide transitions. */
.slide-next-enter-active,
.slide-next-leave-active,
.slide-prev-enter-active,
.slide-prev-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}

.slide-next-enter-from {
  opacity: 0;
  transform: translateX(48px);
}

.slide-next-leave-to {
  opacity: 0;
  transform: translateX(-48px);
}

.slide-prev-enter-from {
  opacity: 0;
  transform: translateX(-48px);
}

.slide-prev-leave-to {
  opacity: 0;
  transform: translateX(48px);
}
</style>
