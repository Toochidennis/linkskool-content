<template>
  <div class="upload-zone" :class="{ dragging: isDragging }" @dragover.prevent="isDragging = true"
    @dragleave.prevent="isDragging = false" @drop.prevent="handleDrop" @click="triggerFileInput">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" class="upload-icon">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
      <polyline points="17 8 12 3 7 8"></polyline>
      <line x1="12" y1="3" x2="12" y2="15"></line>
    </svg>
    <p class="upload-text">Click or drag files here</p>
    <p class="upload-hint">{{ acceptText }} • Max {{ maxSizeMB }}MB</p>
    <input ref="fileInput" type="file" :accept="accept" :multiple="multiple" style="display: none"
      @change="handleFileSelect" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const props = withDefaults(
  defineProps<{
    accept?: string
    maxSize?: number // in bytes
    multiple?: boolean
  }>(),
  {
    accept: '*',
    maxSize: 10485760, // 10MB default
    multiple: false
  }
)

const emit = defineEmits<{
  'files-selected': [files: File[]]
}>()

const fileInput = ref<HTMLInputElement>()
const isDragging = ref(false)

const acceptText = computed(() => {
  if (props.accept === '.pdf') return 'PDF only'
  if (props.accept === '.json') return 'JSON only'
  if (props.accept === '.svg') return 'SVG only'
  return 'All files'
})

const maxSizeMB = computed(() => props.maxSize / 1024 / 1024)

const triggerFileInput = () => {
  fileInput.value?.click()
}

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  const files = Array.from(target.files || [])
  processFiles(files)
}

const handleDrop = (event: DragEvent) => {
  isDragging.value = false
  const files = Array.from(event.dataTransfer?.files || [])
  processFiles(files)
}

const processFiles = (files: File[]) => {
  const validFiles: File[] = []

  for (const file of files) {
    // Check file type
    if (props.accept !== '*') {
      const acceptedTypes = props.accept.split(',').map((type) => type.trim())
      const isValidType = acceptedTypes.some((type) => {
        if (type.startsWith('.')) {
          return file.name.toLowerCase().endsWith(type)
        }
        return file.type.includes(type)
      })

      if (!isValidType) {
        console.warn(`File ${file.name} does not match accepted types: ${props.accept}`)
        continue
      }
    }

    // Check file size
    if (file.size > props.maxSize) {
      console.warn(`File ${file.name} exceeds max size of ${props.maxSize} bytes`)
      continue
    }

    validFiles.push(file)
  }

  if (validFiles.length > 0) {
    emit('files-selected', validFiles)
    // Reset input
    if (fileInput.value) {
      fileInput.value.value = ''
    }
  }
}
</script>

<style scoped lang="css">
.upload-zone {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 140px;
  padding: 24px;
  border: 2px dashed var(--theme-border-strong);
  border-radius: 12px;
  background: var(--theme-surface-soft);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.upload-zone:hover {
  border-color: #667eea;
  background: #f0f4ff;
  transform: translateY(-2px);
}

.upload-zone.dragging {
  border-color: #667eea;
  background: #e0e7ff;
  transform: scale(1.02);
}

.upload-icon {
  width: 40px;
  height: 40px;
  color: var(--theme-text-subtle);
  margin-bottom: 12px;
  stroke-width: 1.5;
  transition: color 0.3s ease;
}

.upload-zone:hover .upload-icon,
.upload-zone.dragging .upload-icon {
  color: #667eea;
}

.upload-text {
  font-size: 14px;
  font-weight: 600;
  color: var(--theme-text-muted);
  margin: 0 0 4px 0;
}

.upload-hint {
  font-size: 12px;
  color: var(--theme-text-subtle);
  margin: 0;
}
</style>
