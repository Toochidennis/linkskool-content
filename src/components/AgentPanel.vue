<template>
  <aside class="flex min-h-0 flex-col border-l border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
    <div class="border-b border-gray-200 px-4 py-4 dark:border-gray-700">
      <div class="flex items-start justify-between gap-3">
        <h2 class="text-sm font-bold uppercase tracking-[0.2em] text-gray-900 dark:text-white">
          <i class="fas fa-wand-magic-sparkles mr-2 text-blue-600 dark:text-blue-400"></i>
          Linkskool
        </h2>
        <button type="button" @click="emit('close')"
          class="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-gray-500 transition hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
          aria-label="Close Linkskool agent">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <div class="mt-3">
        <label class="text-xs font-semibold text-gray-500 dark:text-gray-400">Context</label>
        <select :value="scope" @change="emit('update:scope', ($event.target as HTMLSelectElement).value)"
          class="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-white">
          <option value="subsection">Current subsection</option>
          <option value="section">Current section</option>
          <option value="topic">Whole topic</option>
        </select>
      </div>
    </div>

    <div class="min-h-0 flex-1 space-y-4 overflow-y-auto p-4">
      <article v-for="message in messages" :key="message.id"
        :class="message.role === 'user' ? 'ml-8 bg-blue-600 text-white' : 'mr-8 bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-100'"
        class="rounded-2xl px-4 py-3 text-sm">
        <p>{{ message.body }}</p>
        <div v-if="message.summary && message.summary.length"
          class="mt-3 space-y-1 rounded-xl bg-white/70 p-2 text-xs text-gray-700 dark:bg-gray-800 dark:text-gray-200">
          <p v-for="item in message.summary" :key="`${item.op}-${item.label}`" class="flex items-center gap-2">
            <span
              :class="item.op === 'add' ? 'bg-emerald-100 text-emerald-700' : item.op === 'remove' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'"
              class="inline-flex w-12 justify-center rounded px-1 py-0.5 text-[0.65rem] font-bold uppercase">
              {{ item.op }}
            </span>
            <span>{{ item.label }}<span v-if="item.detail" class="text-gray-400"> — {{ item.detail }}</span></span>
          </p>
        </div>
        <div v-if="message.proposalId && proposalId === message.proposalId" class="mt-3 flex gap-2">
          <button type="button" @click="emit('apply')"
            class="inline-flex cursor-pointer items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700">
            <i class="fas fa-check"></i> Apply
          </button>
          <button type="button" @click="emit('discard')"
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
      <div
        class="relative rounded-xl border border-gray-300 bg-white transition focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-900">
        <textarea :value="instruction" @input="emit('update:instruction', ($event.target as HTMLTextAreaElement).value)"
          rows="3" placeholder="Ask AI to edit…  (Enter to send, Shift+Enter for newline)"
          class="w-full resize-none rounded-xl bg-transparent py-2.5 pl-3 pr-12 text-sm text-gray-900 focus:outline-none dark:text-white"
          @keydown.enter.exact.prevent="emit('send')"></textarea>
        <button type="button" @click="emit('send')" :disabled="!instruction.trim()" aria-label="Send"
          class="absolute bottom-2 right-2 inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg bg-gray-900 text-white transition hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-blue-600 dark:hover:bg-blue-700">
          <i class="fas fa-arrow-up text-xs"></i>
        </button>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import type { AiMessage } from '@/composables/useTopicContentEditor'

defineProps<{
  messages: AiMessage[]
  instruction: string
  scope: 'topic' | 'section' | 'subsection'
  proposalId: number | null
}>()

const emit = defineEmits<{
  'update:instruction': [value: string]
  'update:scope': [value: string]
  send: []
  apply: []
  discard: []
  close: []
}>()
</script>
