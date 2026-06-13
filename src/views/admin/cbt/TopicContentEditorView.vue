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
        <button
          type="button"
          @click="mode = 'edit'"
          :class="mode === 'edit' ? 'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900/60 dark:bg-blue-900/20 dark:text-blue-200' : 'border-gray-200 text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700'"
          class="hidden cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold sm:inline-flex">
          <i class="fas fa-pen"></i>
          Edit
        </button>
        <button
          type="button"
          @click="mode = 'preview'"
          :class="mode === 'preview' ? 'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900/60 dark:bg-blue-900/20 dark:text-blue-200' : 'border-gray-200 text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700'"
          class="hidden cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold sm:inline-flex">
          <i class="fas fa-display"></i>
          Present
        </button>
        <button
          type="button"
          @click="showAgentPanel = !showAgentPanel"
          :class="showAgentPanel ? 'border-purple-200 bg-purple-50 text-purple-700 dark:border-purple-900/60 dark:bg-purple-900/20 dark:text-purple-200' : 'border-gray-200 text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700'"
          class="inline-flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold">
          <i class="fas fa-wand-magic-sparkles"></i>
          Agent
        </button>
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

    <div
      :class="showAgentPanel ? 'grid-cols-[280px_minmax(0,1fr)_360px]' : 'grid-cols-[280px_minmax(0,1fr)]'"
      class="grid min-h-0 flex-1 overflow-hidden">
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
                :class="activeSurface === 'content' && activeSubsectionId === subsection.id ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-200' : 'text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700/50'"
                class="flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-left text-sm">
                <span class="h-1.5 w-1.5 rounded-full bg-current"></span>
                <span class="truncate">{{ subsection.title }}</span>
              </button>

              <button
                type="button"
                @click="openSectionQuiz(section.id)"
                :class="activeSurface === 'sectionQuiz' && activeQuizSectionId === section.id ? 'bg-amber-50 ring-2 ring-amber-500/20 dark:bg-amber-900/20' : 'hover:bg-amber-50 dark:hover:bg-amber-900/20'"
                class="mt-2 flex w-full cursor-pointer items-center justify-between gap-2 rounded-lg border border-amber-200 px-3 py-2 text-left text-sm font-semibold text-amber-700 dark:border-amber-900/60 dark:text-amber-200">
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
            :class="activeSurface === 'finalQuiz' ? 'ring-2 ring-blue-500/20' : ''"
            class="flex w-full cursor-pointer items-center justify-between rounded-xl border border-blue-200 bg-blue-50 px-3 py-3 text-sm font-semibold text-blue-700 dark:border-blue-900/60 dark:bg-blue-900/20 dark:text-blue-200">
            <span><i class="fas fa-bullseye mr-2"></i>Final quiz</span>
            <span>{{ content.finalQuiz.length }} Q</span>
          </button>
        </div>
      </aside>

      <main class="min-h-0 overflow-y-auto bg-gray-100 px-6 py-5 dark:bg-gray-950/40 lg:px-8">
        <div v-if="activeSurface === 'content' && activeSubsection" class="w-full space-y-4">
          <input
            v-if="mode === 'edit'"
            :value="activeSubsection.title"
            @input="updateSubsectionTitle(($event.target as HTMLInputElement).value)"
            class="w-full rounded-md border border-gray-200 bg-white px-4 py-3 text-2xl font-bold text-gray-900 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white" />
          <h2 v-else class="px-1 text-3xl font-bold text-gray-900 dark:text-white">{{ activeSubsection.title }}</h2>

          <div v-for="block in activeSubsection.cards" :key="block.id" class="group/card">
          <article
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
              isChanged(block.id) ? 'ring-2 ring-emerald-400/70' : '',
            ]"
            class="group rounded-md border-[0.5px] border-gray-500/50 bg-white p-4 transition dark:border-gray-600/60 dark:bg-gray-800">
            <div v-if="mode === 'edit'" class="mb-2 flex items-center gap-0.5 opacity-100 lg:opacity-0 lg:transition lg:group-hover:opacity-100">
              <div class="group/tip relative">
                <button type="button" class="icon-btn cursor-grab"><i class="fas fa-grip-vertical"></i></button>
                <span class="action-tip">Drag to reorder</span>
              </div>
              <div class="group/tip relative">
                <button type="button" class="icon-btn" @click="duplicateBlock(block.id)"><i class="fas fa-copy"></i></button>
                <span class="action-tip">Duplicate</span>
              </div>
              <div class="group/tip relative">
                <button type="button" class="icon-btn" @click="toggleRecastMenu(block.id)"><i class="fas fa-arrows-up-down-left-right"></i></button>
                <span class="action-tip">Change heading</span>
                <div v-if="recastMenuBlockId === block.id" class="fixed inset-0 z-10" @click="recastMenuBlockId = null"></div>
                <div
                  v-if="recastMenuBlockId === block.id"
                  class="absolute left-0 top-full z-20 mt-1 grid w-56 gap-1 rounded-xl border border-gray-200 bg-white p-2 shadow-xl dark:border-gray-700 dark:bg-gray-800">
                  <p class="px-2 py-1 text-xs font-semibold uppercase tracking-wide text-gray-400">Change heading</p>
                  <button
                    v-for="option in recastOptionsFor(block.type)"
                    :key="option.label"
                    type="button"
                    @click="recastBlock(block.id, option)"
                    class="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-700">
                    <i :class="option.icon" class="w-4 text-xs text-gray-400"></i>
                    {{ option.label }}
                  </button>
                </div>
              </div>
              <div class="group/tip relative">
                <button type="button" class="icon-btn" @click="showAgentPanel = true"><i class="fas fa-wand-magic-sparkles"></i></button>
                <span class="action-tip">Edit with agent</span>
              </div>
              <div class="group/tip relative">
                <button type="button" class="icon-btn" @click="deleteBlock(block.id)"><i class="fas fa-trash"></i></button>
                <span class="action-tip">Delete</span>
              </div>
            </div>

            <input
              v-if="mode === 'edit'"
              :value="block.title"
              @input="updateBlock(block.id, { title: ($event.target as HTMLInputElement).value })"
              placeholder="Heading (optional)"
              class="mb-3 w-full rounded-lg border border-transparent bg-transparent px-2 py-1 text-2xl font-bold text-gray-900 hover:border-gray-200 focus:border-blue-500 focus:bg-white dark:text-white dark:focus:bg-gray-900" />
            <h3 v-else-if="block.title" class="mb-2 text-2xl font-bold text-gray-900 dark:text-white">{{ block.title }}</h3>

            <textarea
              v-if="mode === 'edit' && hasBody(block.type)"
              :value="block.body"
              @input="updateBlock(block.id, { body: ($event.target as HTMLTextAreaElement).value })"
              rows="4"
              placeholder="Supports math: $x^2$ inline, $$…$$ block"
              class="w-full resize-y rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100" />
            <MathContent v-else-if="hasBody(block.type)" :text="block.body" class="text-gray-700 dark:text-gray-200" />

            <div v-if="block.type === 'list'">
              <div v-if="mode === 'edit'" class="space-y-2">
                <div v-for="(_, index) in (block.items as string[])" :key="index" class="flex items-center gap-2">
                  <input
                    :value="(block.items as string[])[index]"
                    @input="updateListItem(block, index, ($event.target as HTMLInputElement).value)"
                    class="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white" />
                  <button
                    type="button"
                    @click="removeListItem(block, index)"
                    class="inline-flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20"
                    aria-label="Remove item">
                    <i class="fas fa-times"></i>
                  </button>
                </div>
                <button
                  type="button"
                  @click="addListItem(block)"
                  class="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-semibold text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700">
                  <i class="fas fa-plus"></i>
                  Add item
                </button>
              </div>
              <ul v-else class="list-disc space-y-1 pl-5 text-gray-700 dark:text-gray-200">
                <li v-for="(item, index) in (block.items as string[])" :key="index">
                  <MathContent :text="item" as="span" />
                </li>
              </ul>
            </div>

            <div v-if="block.type === 'pairs'">
              <div v-if="mode === 'edit'" class="space-y-2">
                <div
                  v-for="(pair, index) in pairItems(block)"
                  :key="index"
                  class="grid gap-2 rounded-xl border border-gray-200 p-2 md:grid-cols-[1fr_1.5fr_auto] dark:border-gray-700">
                  <input
                    :value="pair.term"
                    @input="updatePairItem(block, index, { term: ($event.target as HTMLInputElement).value })"
                    placeholder="Term"
                    class="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-semibold dark:border-gray-700 dark:bg-gray-900 dark:text-white" />
                  <input
                    :value="pair.description"
                    @input="updatePairItem(block, index, { description: ($event.target as HTMLInputElement).value })"
                    placeholder="Meaning"
                    class="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white" />
                  <button
                    type="button"
                    @click="removePairItem(block, index)"
                    class="inline-flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center self-center rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20"
                    aria-label="Remove pair">
                    <i class="fas fa-times"></i>
                  </button>
                </div>
                <button
                  type="button"
                  @click="addPairItem(block)"
                  class="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-semibold text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700">
                  <i class="fas fa-plus"></i>
                  Add pair
                </button>
              </div>
              <dl v-else class="divide-y divide-gray-100 dark:divide-gray-700">
                <div v-for="(pair, index) in pairItems(block)" :key="index" class="grid gap-2 py-2 md:grid-cols-[1fr_1.5fr]">
                  <dt class="font-semibold text-gray-900 dark:text-white"><MathContent :text="pair.term" as="span" /></dt>
                  <dd class="text-gray-700 dark:text-gray-200"><MathContent :text="pair.description" as="span" /></dd>
                </div>
              </dl>
            </div>

            <div v-if="block.type === 'commonMistake'">
              <div v-if="mode === 'edit'" class="grid gap-3 md:grid-cols-2">
                <textarea
                  :value="block.wrong"
                  @input="updateBlock(block.id, { wrong: ($event.target as HTMLTextAreaElement).value })"
                  class="rounded-xl border border-rose-200 bg-white px-3 py-2 text-sm text-rose-700 dark:border-rose-900/60 dark:bg-gray-900 dark:text-rose-200" />
                <textarea
                  :value="block.correct"
                  @input="updateBlock(block.id, { correct: ($event.target as HTMLTextAreaElement).value })"
                  class="rounded-xl border border-emerald-200 bg-white px-3 py-2 text-sm text-emerald-700 dark:border-emerald-900/60 dark:bg-gray-900 dark:text-emerald-200" />
              </div>
              <div v-else class="space-y-2">
                <p class="flex gap-2 text-rose-700 dark:text-rose-300"><i class="fas fa-xmark mt-1"></i><MathContent :text="block.wrong" as="span" /></p>
                <p class="flex gap-2 text-emerald-700 dark:text-emerald-300"><i class="fas fa-check mt-1"></i><MathContent :text="block.correct" as="span" /></p>
              </div>
            </div>
          </article>

            <div v-if="mode === 'edit'" class="relative flex h-4 items-center justify-center">
              <button
                type="button"
                @click="openBlockPaletteAfter(block.id)"
                title="Add block here"
                class="inline-flex h-6 w-6 cursor-pointer items-center justify-center rounded-full border-[0.5px] border-gray-400 bg-white text-gray-500 opacity-0 shadow-sm transition hover:border-blue-400 hover:text-blue-600 group-hover/card:opacity-100 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300">
                <i class="fas fa-plus text-[0.65rem]"></i>
              </button>
            </div>
          </div>

          <div v-if="activeSubsection.media.length" class="grid gap-4 sm:grid-cols-2">
            <article
              v-for="(media, index) in activeSubsection.media"
              :key="index"
              class="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <div class="relative">
                <img
                  v-if="media.url"
                  :src="media.url"
                  :alt="media.alt || 'Subsection image'"
                  class="h-48 w-full object-cover" />
                <div
                  v-else
                  class="flex h-48 w-full items-center justify-center bg-gray-100 text-gray-400 dark:bg-gray-900">
                  <i class="fas fa-image text-2xl"></i>
                </div>
                <button
                  v-if="mode === 'edit'"
                  type="button"
                  @click="removeMedia(index)"
                  class="absolute right-2 top-2 inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg bg-white/90 text-rose-500 shadow hover:bg-white dark:bg-gray-800/90"
                  aria-label="Remove image">
                  <i class="fas fa-trash"></i>
                </button>
              </div>
              <div v-if="mode === 'edit'" class="space-y-2 p-3">
                <input
                  :value="media.url"
                  @input="updateMedia(index, { url: ($event.target as HTMLInputElement).value })"
                  placeholder="Image URL (upload coming soon)"
                  class="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white" />
                <input
                  :value="media.alt"
                  @input="updateMedia(index, { alt: ($event.target as HTMLInputElement).value })"
                  placeholder="Alt text"
                  class="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white" />
              </div>
              <div v-else-if="media.alt" class="p-3 text-sm text-gray-500 dark:text-gray-400">{{ media.alt }}</div>
            </article>
          </div>

          <div v-if="mode === 'edit' && !activeSubsection.cards.length" class="flex justify-center pb-10">
            <button
              type="button"
              @click="openBlockPalette"
              class="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-blue-300 bg-white px-4 py-3 text-sm font-semibold text-blue-700 shadow-sm transition hover:bg-blue-50 dark:border-blue-900 dark:bg-gray-800 dark:text-blue-200 dark:hover:bg-blue-900/20">
              <i class="fas fa-plus"></i>
              Add block
            </button>
          </div>
        </div>

        <div v-else-if="activeSurface === 'sectionQuiz' || activeSurface === 'finalQuiz'" class="grid w-full gap-4 lg:grid-cols-[320px_minmax(0,1fr)]">
          <aside class="min-h-[70vh] overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <div class="border-b border-gray-200 p-4 dark:border-gray-700">
              <h2 class="text-base font-bold text-gray-900 dark:text-white">{{ activeQuizTitle }}</h2>
              <p class="text-sm text-gray-500 dark:text-gray-400">{{ activeQuiz.length }} questions</p>
            </div>
            <div class="max-h-[calc(100vh-15rem)] overflow-y-auto p-3">
              <button
                v-for="(question, index) in activeQuiz"
                :key="question.id"
                type="button"
                @click="selectQuizQuestion(index)"
                :class="activeQuizQuestionIndex === index ? 'border-blue-500 bg-blue-50 text-blue-700 dark:border-blue-500 dark:bg-blue-900/20 dark:text-blue-200' : 'border-gray-200 text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-700/50'"
                class="mb-2 flex w-full cursor-pointer items-start gap-3 rounded-xl border px-3 py-3 text-left text-sm">
                <span class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-bold text-gray-600 dark:bg-gray-900 dark:text-gray-300">
                  {{ index + 1 }}
                </span>
                <span class="min-w-0 flex-1 truncate">{{ question.questionText }}</span>
              </button>

              <button
                type="button"
                @click="addQuizQuestion"
                class="mt-2 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-blue-300 px-3 py-3 text-sm font-semibold text-blue-700 hover:bg-blue-50 dark:border-blue-900 dark:text-blue-200 dark:hover:bg-blue-900/20">
                <i class="fas fa-plus"></i>
                Add question
              </button>
            </div>
          </aside>

          <section class="min-h-[70vh] rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <div v-if="selectedQuizQuestion" class="space-y-5">
              <div class="flex items-start justify-between gap-4">
                <div>
                  <p class="text-xs font-semibold uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400">Edit question</p>
                  <h2 class="mt-1 text-xl font-bold text-gray-900 dark:text-white">Question {{ activeQuizQuestionIndex + 1 }}</h2>
                </div>
                <button
                  type="button"
                  @click="deleteQuizQuestion(activeQuizQuestionIndex)"
                  class="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-rose-200 px-3 py-2 text-sm font-semibold text-rose-600 hover:bg-rose-50 dark:border-rose-900/60 dark:text-rose-300 dark:hover:bg-rose-900/20">
                  <i class="fas fa-trash"></i>
                  Delete
                </button>
              </div>

              <div>
                <label class="text-sm font-semibold text-gray-700 dark:text-gray-200">Question</label>
                <textarea
                  v-model="selectedQuizQuestion.questionText"
                  rows="4"
                  class="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white"></textarea>
              </div>

              <div class="space-y-3">
                <div
                  v-for="(option, index) in selectedQuizQuestion.options"
                  :key="index"
                  class="flex items-center gap-3 rounded-xl border border-gray-200 px-3 py-2 dark:border-gray-700">
                  <input
                    v-model="selectedQuizQuestion.correctAnswer"
                    :value="index"
                    type="radio"
                    class="h-4 w-4 text-blue-600 focus:ring-blue-500" />
                  <span class="w-6 text-sm font-bold text-gray-500">{{ String.fromCharCode(65 + index) }}</span>
                  <input
                    v-model="option.text"
                    class="min-w-0 flex-1 rounded-lg border border-transparent bg-transparent px-2 py-1 text-sm text-gray-900 focus:border-blue-500 focus:bg-white dark:text-white dark:focus:bg-gray-900" />
                  <button
                    type="button"
                    @click="deleteQuizOption(index)"
                    class="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20"
                    aria-label="Delete option">
                    <i class="fas fa-times"></i>
                  </button>
                </div>
                <button
                  type="button"
                  @click="addQuizOption"
                  class="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-700">
                  <i class="fas fa-plus"></i>
                  Add option
                </button>
              </div>

              <div>
                <label class="text-sm font-semibold text-gray-700 dark:text-gray-200">Explanation</label>
                <textarea
                  v-model="selectedQuizQuestion.explanation"
                  rows="3"
                  class="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white"></textarea>
              </div>

              <div>
                <label class="text-sm font-semibold text-gray-700 dark:text-gray-200">Bloom level</label>
                <select
                  v-model="selectedQuizQuestion.bloomLevel"
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
                <div class="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-300">
                  <i class="fas fa-question"></i>
                </div>
                <h3 class="mt-4 text-lg font-semibold text-gray-900 dark:text-white">No question selected</h3>
                <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">Add or select a question to edit it here.</p>
              </div>
            </div>
          </section>
        </div>
      </main>

      <aside v-if="showAgentPanel" class="flex min-h-0 flex-col border-l border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
        <div class="border-b border-gray-200 px-4 py-4 dark:border-gray-700">
          <div class="flex items-start justify-between gap-3">
            <h2 class="text-sm font-bold uppercase tracking-[0.2em] text-gray-900 dark:text-white">
              <i class="fas fa-wand-magic-sparkles mr-2 text-blue-600 dark:text-blue-400"></i>
              Linkskool
            </h2>
            <button
              type="button"
              @click="showAgentPanel = false"
              class="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-gray-500 transition hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
              aria-label="Close Linkskool agent">
              <i class="fas fa-times"></i>
            </button>
          </div>
          <div class="mt-3">
            <label class="text-xs font-semibold text-gray-500 dark:text-gray-400">Context</label>
            <select
              v-model="aiScope"
              class="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-white">
              <option value="subsection">Current subsection</option>
              <option value="section">Current section</option>
              <option value="topic">Whole topic</option>
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
            <div v-if="message.summary && message.summary.length" class="mt-3 space-y-1 rounded-xl bg-white/70 p-2 text-xs text-gray-700 dark:bg-gray-800 dark:text-gray-200">
              <p v-for="item in message.summary" :key="`${item.op}-${item.label}`" class="flex items-center gap-2">
                <span
                  :class="item.op === 'add' ? 'bg-emerald-100 text-emerald-700' : item.op === 'remove' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'"
                  class="inline-flex w-12 justify-center rounded px-1 py-0.5 text-[0.65rem] font-bold uppercase">
                  {{ item.op }}
                </span>
                <span>{{ item.label }}<span v-if="item.detail" class="text-gray-400"> — {{ item.detail }}</span></span>
              </p>
            </div>
            <div
              v-if="message.proposalId && aiProposal && aiProposal.id === message.proposalId"
              class="mt-3 flex gap-2">
              <button
                type="button"
                @click="applyAiProposal"
                class="inline-flex cursor-pointer items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700">
                <i class="fas fa-check"></i> Apply
              </button>
              <button
                type="button"
                @click="discardAiProposal"
                class="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700">
                <i class="fas fa-xmark"></i> Discard
              </button>
            </div>
            <p v-else-if="message.status === 'applied'" class="mt-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              <i class="fas fa-check"></i> Applied to draft
            </p>
            <p v-else-if="message.status === 'discarded'" class="mt-2 text-xs font-semibold text-gray-400">
              <i class="fas fa-xmark"></i> Discarded
            </p>
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

    <Teleport to="body">
      <div
        v-if="addBlockMenuOpen"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
        @click.self="addBlockMenuOpen = false">
        <div class="flex max-h-[80vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-gray-700 dark:bg-gray-800">
          <div class="flex items-center justify-between gap-3 border-b border-gray-200 px-4 py-3 dark:border-gray-700">
            <h2 class="text-base font-bold text-gray-900 dark:text-white">Add a block</h2>
            <button
              type="button"
              @click="addBlockMenuOpen = false"
              class="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-gray-500 transition hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
              aria-label="Close">
              <i class="fas fa-times"></i>
            </button>
          </div>
          <div class="border-b border-gray-200 p-3 dark:border-gray-700">
            <input
              v-model="blockFilter"
              placeholder="Filter blocks…"
              class="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white" />
          </div>
          <div class="min-h-0 flex-1 space-y-2 overflow-y-auto p-3">
            <div v-for="group in filteredPresetGroups" :key="group.group || 'generic'">
              <p v-if="group.group" class="px-1 pb-1 pt-2 text-[0.7rem] font-bold uppercase tracking-[0.15em] text-gray-400">
                {{ group.group }}
              </p>
              <hr v-else class="my-1 border-gray-200 dark:border-gray-700" />
              <button
                v-for="preset in group.presets"
                :key="preset.label"
                type="button"
                @click="addPreset(preset)"
                class="flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2 text-left transition hover:bg-gray-50 dark:hover:bg-gray-700">
                <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-600 dark:bg-gray-900 dark:text-gray-300">
                  <i :class="preset.icon"></i>
                </span>
                <span>
                  <span class="block text-sm font-semibold text-gray-900 dark:text-white">{{ preset.label }}</span>
                  <span class="block text-xs text-gray-500 dark:text-gray-400">{{ preset.description }}</span>
                </span>
              </button>
            </div>
            <p v-if="!filteredPresetGroups.length" class="px-2 py-3 text-center text-sm text-gray-400">No blocks match.</p>
          </div>
        </div>
      </div>
    </Teleport>

  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onBeforeUnmount, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import MathContent from '@/components/MathContent.vue'
import { useTopicContentEditor, type StudyBlock, type StudyBlockType } from '@/composables/useTopicContentEditor'

const route = useRoute()
const router = useRouter()
const draggedBlockId = ref<number | null>(null)
const dragTargetBlockId = ref<number | null>(null)
const showAgentPanel = ref(false)
const blockFilter = ref('')
const recastMenuBlockId = ref<number | null>(null)

const {
  topicName,
  content,
  activeSubsectionId,
  expandedSectionIds,
  activeSubsection,
  activeQuiz,
  activeQuizTitle,
  selectedQuizQuestion,
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
  loadDummyContent,
  selectSubsection,
  toggleSection,
  updateSubsectionTitle,
  updateBlock,
  addPreset,
  recastOptionsFor,
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
  addQuizOption,
  deleteQuizOption,
  sendAiInstruction,
  applyAiProposal,
  discardAiProposal,
  saveContent,
} = useTopicContentEditor()

const hasBody = (type: StudyBlockType) =>
  ['text', 'highlight', 'examTip', 'equation', 'workedExample'].includes(type)

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

const toggleRecastMenu = (blockId: number) => {
  recastMenuBlockId.value = recastMenuBlockId.value === blockId ? null : blockId
}

const recastBlock = (blockId: number, preset: ReturnType<typeof recastOptionsFor>[number]) => {
  changeBlockType(blockId, preset)
  recastMenuBlockId.value = null
}

const updateListItem = (block: StudyBlock, index: number, value: string) => {
  if (!Array.isArray(block.items)) {
    return
  }

  const nextItems = [...(block.items as string[])]
  nextItems[index] = value
  updateBlock(block.id, { items: nextItems })
}

const pairItems = (block: StudyBlock) =>
  Array.isArray(block.items) ? (block.items as Array<{ term: string; description: string }>) : []

const updatePairItem = (block: StudyBlock, index: number, patch: { term?: string; description?: string }) => {
  const items = pairItems(block).map((pair, i) => (i === index ? { ...pair, ...patch } : pair))
  updateBlock(block.id, { items })
}

const addPairItem = (block: StudyBlock) => {
  updateBlock(block.id, { items: [...pairItems(block), { term: '', description: '' }] })
}

const removePairItem = (block: StudyBlock, index: number) => {
  updateBlock(block.id, { items: pairItems(block).filter((_, i) => i !== index) })
}

const addListItem = (block: StudyBlock) => {
  const items = Array.isArray(block.items) ? (block.items as string[]) : []
  updateBlock(block.id, { items: [...items, ''] })
}

const removeListItem = (block: StudyBlock, index: number) => {
  const items = Array.isArray(block.items) ? (block.items as string[]) : []
  updateBlock(block.id, { items: items.filter((_, i) => i !== index) })
}

const isChanged = (blockId: number) => changedBlockIds.value.includes(blockId)

const handleSaveShortcut = (event: KeyboardEvent) => {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 's') {
    event.preventDefault()
    void saveContent()
  }
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
  window.addEventListener('keydown', handleSaveShortcut)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleSaveShortcut)
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
</style>
