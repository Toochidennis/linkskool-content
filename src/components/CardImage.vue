<template>
  <div
    class="overflow-hidden rounded-xl border-[0.5px] border-gray-400/60 bg-white dark:border-gray-600/60 dark:bg-gray-800">
    <!-- Image present -->
    <template v-if="url">
      <div class="relative">
        <img :src="url" :alt="alt || 'Image'"
          class="max-h-64 w-full bg-gray-50 object-contain dark:bg-gray-900" />
        <div v-if="editable" class="absolute right-2 top-2 flex gap-2">
          <button type="button" @click="triggerPick" title="Replace image"
            class="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg bg-white/90 text-gray-600 shadow hover:bg-white dark:bg-gray-800/90 dark:text-gray-200">
            <i class="fas fa-arrows-rotate"></i>
          </button>
          <button type="button" @click="$emit('remove')" title="Remove image"
            class="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg bg-white/90 text-rose-500 shadow hover:bg-white dark:bg-gray-800/90"
            aria-label="Remove image">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
      <div v-if="editable" class="space-y-2 p-2.5">
        <input v-if="!isLocal" :value="url" @input="$emit('update:url', ($event.target as HTMLInputElement).value)"
          type="url" placeholder="Image link (URL)"
          class="w-full rounded-lg border-[0.5px] border-gray-300 bg-white px-3 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-900 dark:text-white" />
        <input :value="alt" @input="$emit('update:alt', ($event.target as HTMLInputElement).value)"
          placeholder="Alt text (describe the image)"
          class="w-full rounded-lg border-[0.5px] border-gray-300 bg-white px-3 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-900 dark:text-white" />
      </div>
      <p v-else-if="alt" class="p-3 text-sm text-gray-500 dark:text-gray-400">{{ alt }}</p>
    </template>

    <!-- Empty + editable: drop zone + link field -->
    <div v-else-if="editable" class="p-3">
      <div class="mb-2 flex items-center justify-between">
        <span class="text-xs font-semibold uppercase tracking-wide text-gray-400">Image</span>
        <button type="button" @click="$emit('remove')" title="Remove image block" aria-label="Remove image block"
          class="inline-flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg text-rose-400 transition hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-900/20">
          <i class="fas fa-trash text-xs"></i>
        </button>
      </div>
      <div @dragover.prevent.stop="dragging = true" @dragenter.prevent.stop="dragging = true"
        @dragleave.prevent.stop="dragging = false" @drop.prevent.stop="onDrop" @click="triggerPick"
        :class="dragging
          ? 'border-blue-400 bg-blue-50 text-blue-600 dark:border-blue-500 dark:bg-blue-900/20'
          : 'border-gray-300 text-gray-400 hover:border-blue-300 hover:text-blue-500 dark:border-gray-600'"
        class="flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed px-4 py-7 text-center transition">
        <i :class="dragging ? 'fa-hand-pointer' : 'fa-cloud-arrow-up'" class="fas text-2xl"></i>
        <p class="text-sm font-semibold">{{ dragging ? 'Drop the image' : 'Click or drag an image here' }}</p>
        <p class="text-xs text-gray-400">PNG, JPG, GIF, SVG · up to {{ maxMb }}MB</p>
      </div>

      <div class="mt-3 flex items-center gap-2">
        <span class="text-xs font-medium text-gray-400">or</span>
        <input v-model="linkInput" type="url" placeholder="Paste an image link…" @keydown.enter.prevent="applyLink"
          class="min-w-0 flex-1 rounded-lg border-[0.5px] border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-900 dark:text-white" />
        <button type="button" @click="applyLink" :disabled="!linkInput.trim()"
          class="shrink-0 rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40">
          Add
        </button>
      </div>
      <p v-if="error" class="mt-2 text-xs text-rose-500">{{ error }}</p>
      <p v-else-if="uploading" class="mt-2 text-xs text-gray-400">
        <i class="fas fa-spinner fa-spin mr-1"></i>Processing image…
      </p>
    </div>

    <!-- Empty + preview -->
    <div v-else class="flex h-40 items-center justify-center bg-gray-100 text-gray-400 dark:bg-gray-900">
      <i class="fas fa-image text-2xl"></i>
    </div>

    <input ref="fileInput" type="file" accept="image/*" class="hidden" @change="onPick" />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const props = withDefaults(
  defineProps<{
    url: string
    alt?: string
    editable?: boolean
  }>(),
  {
    alt: '',
    editable: true,
  },
)

// A locally-uploaded image is a data URL — there's no meaningful link to edit.
const isLocal = computed(() => props.url.startsWith('data:'))

const emit = defineEmits<{
  'update:url': [value: string]
  'update:alt': [value: string]
  remove: []
}>()

const fileInput = ref<HTMLInputElement | null>(null)
const dragging = ref(false)
const linkInput = ref('')
const error = ref('')
const uploading = ref(false)

const maxBytes = 5 * 1024 * 1024
const maxMb = 5

const triggerPick = () => fileInput.value?.click()

const onPick = (event: Event) => {
  const input = event.target as HTMLInputElement
  void handleFile(input.files?.[0])
  input.value = ''
}

const onDrop = (event: DragEvent) => {
  dragging.value = false
  void handleFile(event.dataTransfer?.files?.[0])
}

const handleFile = async (file?: File | null) => {
  error.value = ''
  if (!file) {
    return
  }
  if (!file.type.startsWith('image/')) {
    error.value = 'Please choose an image file.'
    return
  }
  if (file.size > maxBytes) {
    error.value = `Image must be under ${maxMb}MB.`
    return
  }
  uploading.value = true
  try {
    const url = await uploadImage(file)
    emit('update:url', url)
  } catch {
    error.value = 'Could not read that image. Try again.'
  } finally {
    uploading.value = false
  }
}

// Upload seam: reads the file locally for now. Swap this for
// `POST /public/media/upload` (multipart) → returns { data: { url } } when wiring the API.
const uploadImage = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(new Error('read-failed'))
    reader.readAsDataURL(file)
  })

const applyLink = () => {
  const value = linkInput.value.trim()
  if (!value) {
    return
  }
  emit('update:url', value)
  linkInput.value = ''
}
</script>
