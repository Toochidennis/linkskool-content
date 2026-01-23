<template>
  <div class="rich-editor">
    <div v-if="editor" class="editor-toolbar">
      <button @click="editor.chain().focus().toggleBold().run()" :class="{ active: editor.isActive('bold') }"
        class="toolbar-btn" title="Bold (Ctrl+B)">
        <strong>B</strong>
      </button>
      <button @click="editor.chain().focus().toggleItalic().run()" :class="{ active: editor.isActive('italic') }"
        class="toolbar-btn" title="Italic (Ctrl+I)">
        <em>I</em>
      </button>
      <button @click="editor.chain().focus().toggleUnderline().run()" :class="{ active: editor.isActive('underline') }"
        class="toolbar-btn" title="Underline (Ctrl+U)">
        <u>U</u>
      </button>
      <button @click="editor.chain().focus().toggleStrike().run()" :class="{ active: editor.isActive('strike') }"
        class="toolbar-btn" title="Strikethrough">
        <s>S</s>
      </button>
      <div class="toolbar-separator"></div>
      <button @click="editor.chain().focus().toggleBulletList().run()"
        :class="{ active: editor.isActive('bulletList') }" class="toolbar-btn" title="Bullet List">
        • List
      </button>
      <button @click="editor.chain().focus().toggleOrderedList().run()"
        :class="{ active: editor.isActive('orderedList') }" class="toolbar-btn" title="Numbered List">
        1. List
      </button>
    </div>
    <editor-content :editor="editor" class="editor-content" />
  </div>
</template>

<script setup lang="ts">
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import { watch, onBeforeUnmount } from 'vue'

const props = defineProps<{
  modelValue: string
  placeholder?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const editor = useEditor({
  content: props.modelValue,
  extensions: [
    StarterKit.configure({
      heading: false,
      blockquote: false,
      code: false,
      codeBlock: false,
      horizontalRule: false,
    }),
    Underline,
  ],
  editorProps: {
    attributes: {
      class: 'prose prose-sm focus:outline-none',
      'data-placeholder': props.placeholder || '',
    },
  },
  onUpdate: ({ editor }) => {
    emit('update:modelValue', editor.getHTML())
  },
})

watch(
  () => props.modelValue,
  (value) => {
    const isSame = editor.value?.getHTML() === value
    if (!isSame && editor.value) {
      editor.value.commands.setContent(value, { emitUpdate: false })
    }
  }
)

onBeforeUnmount(() => {
  editor.value?.destroy()
})
</script>

<style scoped lang="css">
.rich-editor {
  display: flex;
  flex-direction: column;
  border-radius: 8px;
  background: var(--theme-surface);
  overflow: hidden;
  border: 1px solid var(--theme-border);
}

.editor-toolbar {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 12px;
  background: var(--theme-surface-soft);
  border-bottom: 1px solid var(--theme-border);
  flex-wrap: wrap;
}

.toolbar-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 36px;
  height: 36px;
  padding: 0 10px;
  background: var(--theme-surface);
  border: 1px solid var(--theme-border);
  border-radius: 6px;
  cursor: pointer;
  color: var(--theme-text-subtle);
  font-weight: 600;
  font-size: 14px;
  transition: all 0.2s ease;
}

.toolbar-btn:hover {
  background: var(--theme-surface);
  border-color: #667eea;
  color: #667eea;
}

.toolbar-btn.active {
  background: #667eea;
  color: white;
  border-color: #667eea;
}

.toolbar-separator {
  width: 1px;
  height: 24px;
  background: var(--theme-border);
  margin: 0 4px;
}

.editor-content {
  flex: 1;
  background: var(--theme-surface);
}

:deep(.ProseMirror) {
  min-height: 120px;
  padding: 12px;
  outline: none;
  font-size: 14px;
  line-height: 1.6;
  color: var(--theme-text-muted);
  word-wrap: break-word;
}

:deep(.ProseMirror:empty:before) {
  content: attr(data-placeholder);
  color: var(--theme-text-subtle);
  font-style: italic;
  pointer-events: none;
  position: absolute;
}

:deep(.ProseMirror ul),
:deep(.ProseMirror ol) {
  padding-left: 20px;
  margin: 8px 0;
}

:deep(.ProseMirror li) {
  margin: 4px 0;
}

:deep(.ProseMirror p) {
  margin: 4px 0;
}

:deep(.ProseMirror strong) {
  font-weight: 600;
}

:deep(.ProseMirror em) {
  font-style: italic;
}

:deep(.ProseMirror u) {
  text-decoration: underline;
}

:deep(.ProseMirror s) {
  text-decoration: line-through;
}

:deep(.ProseMirror ul) {
  list-style-type: disc;
}

:deep(.ProseMirror ol) {
  list-style-type: decimal;
}
</style>
