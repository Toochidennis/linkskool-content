<template>
  <div ref="rootEl" class="rich" :class="{ 'rich--readonly': !editable }">
    <div v-if="editor && editable && focused" class="rich-toolbar"
      :class="placeBelow ? 'rich-toolbar--below' : 'rich-toolbar--above'" @mousedown.prevent>
      <button type="button" class="rt-btn" :class="{ active: editor.isActive('bold') }"
        @click="editor.chain().focus().toggleBold().run()" title="Bold"><strong>B</strong></button>
      <button type="button" class="rt-btn" :class="{ active: editor.isActive('italic') }"
        @click="editor.chain().focus().toggleItalic().run()" title="Italic"><em>I</em></button>
      <button type="button" class="rt-btn" :class="{ active: editor.isActive('underline') }"
        @click="editor.chain().focus().toggleUnderline().run()" title="Underline"><u>U</u></button>
      <button type="button" class="rt-btn" :class="{ active: editor.isActive('strike') }"
        @click="editor.chain().focus().toggleStrike().run()" title="Strikethrough"><s>S</s></button>
      <template v-if="!singleLine">
        <span class="rt-sep"></span>
        <button type="button" class="rt-btn" :class="{ active: editor.isActive('bulletList') }"
          @click="editor.chain().focus().toggleBulletList().run()" title="Bullet list"><i class="fas fa-list-ul"></i></button>
        <button type="button" class="rt-btn" :class="{ active: editor.isActive('orderedList') }"
          @click="editor.chain().focus().toggleOrderedList().run()" title="Numbered list"><i class="fas fa-list-ol"></i></button>
      </template>
      <span class="rt-sep"></span>
      <button type="button" class="rt-btn" @click="insertMath" title="Insert math (or type $latex$)">
        <i class="fas fa-square-root-variable"></i>
      </button>
    </div>
    <editor-content :editor="editor" />
  </div>
</template>

<script setup lang="ts">
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Placeholder from '@tiptap/extension-placeholder'
import { Mathematics, migrateMathStrings } from '@tiptap/extension-mathematics'
import { ref, watch, onBeforeUnmount } from 'vue'

const props = withDefaults(
  defineProps<{
    modelValue: string
    editable?: boolean
    placeholder?: string
    singleLine?: boolean
    contentClass?: string
  }>(),
  {
    editable: true,
    placeholder: '',
    singleLine: false,
    contentClass: '',
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const focused = ref(false)
const placeBelow = ref(false)
const rootEl = ref<HTMLElement | null>(null)

const editor = useEditor({
  content: props.modelValue,
  editable: props.editable,
  extensions: [
    StarterKit.configure({
      heading: false,
      blockquote: false,
      code: false,
      codeBlock: false,
      horizontalRule: false,
      // Single-line fields (titles, list items, pair cells) carry no block lists.
      bulletList: props.singleLine ? false : undefined,
      orderedList: props.singleLine ? false : undefined,
    }),
    Underline,
    Placeholder.configure({ placeholder: props.placeholder }),
    Mathematics.configure({ katexOptions: { throwOnError: false } }),
  ],
  editorProps: {
    attributes: {
      class: `rich-content focus:outline-none ${props.contentClass}`.trim(),
    },
    handleKeyDown: (_view, event) => {
      // Keep single-line fields on one line.
      if (props.singleLine && event.key === 'Enter') {
        return true
      }
      return false
    },
  },
  onCreate: ({ editor }) => {
    migrateMathStrings(editor)
  },
  onFocus: () => {
    focused.value = true
    // Flip the toolbar below the field when there isn't room above it
    // (e.g. the top-most field, otherwise clipped by the scroll container).
    const top = rootEl.value?.getBoundingClientRect().top ?? 999
    placeBelow.value = top < 120
  },
  onBlur: () => {
    focused.value = false
  },
  onUpdate: ({ editor }) => {
    emit('update:modelValue', editor.getHTML())
  },
})

const insertMath = () => {
  editor.value?.chain().focus().insertInlineMath({ latex: 'x^2' }).run()
}

watch(
  () => props.modelValue,
  value => {
    if (editor.value && editor.value.getHTML() !== value) {
      editor.value.commands.setContent(value, { emitUpdate: false })
      migrateMathStrings(editor.value)
    }
  },
)

watch(
  () => props.editable,
  value => {
    editor.value?.setEditable(value)
  },
)

onBeforeUnmount(() => {
  editor.value?.destroy()
})
</script>

<style scoped>
.rich {
  position: relative;
}

.rich-toolbar {
  position: absolute;
  left: 0;
  z-index: 30;
  display: flex;
  align-items: center;
  gap: 2px;
  border-radius: 0.5rem;
  border: 0.5px solid rgb(107 114 128 / 0.4);
  background: white;
  padding: 4px;
  box-shadow: 0 8px 24px rgb(0 0 0 / 0.12);
}

.rich-toolbar--above {
  top: -2.75rem;
}

.rich-toolbar--below {
  top: 100%;
  margin-top: 0.35rem;
}

:global(.dark) .rich-toolbar {
  background: rgb(31 41 55);
  border-color: rgb(75 85 99 / 0.6);
}

.rt-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 1.75rem;
  height: 1.75rem;
  padding: 0 0.4rem;
  border-radius: 0.375rem;
  font-size: 0.8rem;
  color: rgb(75 85 99);
  cursor: pointer;
  transition: background-color 0.15s ease, color 0.15s ease;
}

.rt-btn:hover {
  background: rgb(243 244 246);
  color: rgb(17 24 39);
}

.rt-btn.active {
  background: rgb(37 99 235);
  color: white;
}

.rt-sep {
  width: 1px;
  height: 1.25rem;
  margin: 0 2px;
  background: rgb(107 114 128 / 0.3);
}

/* Borderless, free-flow editing surface. */
:deep(.rich-content) {
  outline: none;
  word-wrap: break-word;
}

:deep(.rich-content p) {
  margin: 0.25rem 0;
}

:deep(.rich-content p:first-child) {
  margin-top: 0;
}

:deep(.rich-content p:last-child) {
  margin-bottom: 0;
}

:deep(.rich-content p.is-editor-empty:first-child::before) {
  content: attr(data-placeholder);
  color: rgb(156 163 175);
  pointer-events: none;
  float: left;
  height: 0;
}

:deep(.rich-content ul) {
  list-style: disc;
  padding-left: 1.25rem;
  margin: 0.25rem 0;
}

:deep(.rich-content ol) {
  list-style: decimal;
  padding-left: 1.25rem;
  margin: 0.25rem 0;
}

:deep(.rich-content li) {
  margin: 0.15rem 0;
}

:deep(.rich-content strong) {
  font-weight: 700;
}

:deep(.rich-content u) {
  text-decoration: underline;
}

:deep(.rich-content s) {
  text-decoration: line-through;
}

/* Inline math nodes get a subtle affordance while editing. */
:deep(.rich-content .Tiptap-mathematics-editor),
:deep(.rich-content [data-type='inline-math']),
:deep(.rich-content [data-type='block-math']) {
  cursor: pointer;
}

.rich--readonly :deep(.rich-content [data-type='inline-math']),
.rich--readonly :deep(.rich-content [data-type='block-math']) {
  cursor: default;
}
</style>
