<template>
  <div ref="rootEl" class="rich" :class="{ 'rich--readonly': !editable }" @focusin="onFocusIn">
    <div v-if="editor && editable" class="rich-toolbar"
      :class="placeBelow ? 'rich-toolbar--below' : 'rich-toolbar--above'" @mousedown.prevent>
      <button type="button" class="rt-btn" :class="{ active: editor.isActive('bold') }"
        @click="editor.chain().focus().toggleBold().run()" title="Bold"><strong>B</strong></button>
      <button type="button" class="rt-btn" :class="{ active: editor.isActive('italic') }"
        @click="editor.chain().focus().toggleItalic().run()" title="Italic"><em>I</em></button>
      <button type="button" class="rt-btn" :class="{ active: editor.isActive('underline') }"
        @click="editor.chain().focus().toggleUnderline().run()" title="Underline"><u>U</u></button>
      <button type="button" class="rt-btn" :class="{ active: editor.isActive('strike') }"
        @click="editor.chain().focus().toggleStrike().run()" title="Strikethrough"><s>S</s></button>
      <template v-if="!singleLine && !list">
        <span class="rt-sep"></span>
        <button type="button" class="rt-btn" :class="{ active: editor.isActive('bulletList') }"
          @click="editor.chain().focus().toggleBulletList().run()" title="Bullet list"><i class="fas fa-list-ul"></i></button>
        <button type="button" class="rt-btn" :class="{ active: editor.isActive('orderedList') }"
          @click="editor.chain().focus().toggleOrderedList().run()" title="Numbered list"><i class="fas fa-list-ol"></i></button>
      </template>
      <span class="rt-sep"></span>
      <button type="button" class="rt-btn rt-btn--more" @click="morePanelOpen = true"
        title="Symbols & math (or type $latex$)">
        <i class="fas fa-square-root-variable"></i><span class="rt-more-label">More</span>
      </button>
    </div>
    <editor-content :editor="editor" :class="contentClass" />

    <Teleport to="body">
      <div v-if="morePanelOpen" class="rt-overlay" @click.self="morePanelOpen = false">
        <div class="rt-modal">
          <div class="rt-modal-head">
            <span>Insert symbol or math</span>
            <button type="button" class="rt-modal-close" @click="morePanelOpen = false" aria-label="Close">
              <i class="fas fa-times"></i>
            </button>
          </div>
          <div class="rt-modal-body">
            <div v-for="group in paletteGroups" :key="group.title" class="rt-group">
              <p class="rt-group-title">{{ group.title }}</p>
              <div class="rt-group-grid">
                <button v-for="item in group.items" :key="item.label" type="button" class="rt-sym"
                  :title="item.title" @click="insertItem(item)">{{ item.label }}</button>
              </div>
            </div>
            <div class="rt-group">
              <p class="rt-group-title">Matrix</p>
              <div class="rt-matrix">
                <input v-model.number="matrixRows" type="number" min="1" max="10" class="rt-num" aria-label="Rows" />
                <span class="text-xs font-bold text-gray-400">×</span>
                <input v-model.number="matrixCols" type="number" min="1" max="10" class="rt-num" aria-label="Columns" />
                <button type="button" class="rt-insert" @click="insertMatrix">
                  Insert {{ matrixRows }}×{{ matrixCols }}
                </button>
              </div>
            </div>
            <p class="rt-hint">Tip: you can also type <code>$\latex$</code> directly in any field.</p>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Document from '@tiptap/extension-document'
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
    list?: boolean
    ordered?: boolean
    contentClass?: string
    // Intercept paste: given the plain-text clipboard, return a replacement
    // string to set as this field's content, `false` to swallow the paste
    // without changing content, or null to paste normally.
    onPaste?: (text: string) => string | false | null
  }>(),
  {
    editable: true,
    placeholder: '',
    singleLine: false,
    list: false,
    ordered: false,
    contentClass: '',
    onPaste: undefined,
  },
)

// In list mode the document is locked to a single list (bullet or numbered), so
// the whole field behaves as one free-flowing list: Enter adds an item,
// Backspace removes the line, and the markers are always present.
const ListDocument = Document.extend({
  content: props.ordered ? 'orderedList+' : 'bulletList+',
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  // Single-line fields use these so a parent list/pairs can add/remove rows.
  enter: []
  backspaceEmpty: []
}>()

const placeBelow = ref(false)
const rootEl = ref<HTMLElement | null>(null)

// Flip the toolbar below the field when there isn't room above it
// (e.g. the top-most field, otherwise clipped by the scroll container).
const onFocusIn = () => {
  const top = rootEl.value?.getBoundingClientRect().top ?? 999
  placeBelow.value = top < 120
}

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
      // List mode swaps in a bullet-list-only document; single-line fields drop lists.
      document: props.list ? false : undefined,
      bulletList: props.singleLine ? false : undefined,
      orderedList: props.singleLine ? false : undefined,
    }),
    ...(props.list ? [ListDocument] : []),
    Underline,
    Placeholder.configure({ placeholder: props.placeholder }),
    Mathematics.configure({ katexOptions: { throwOnError: false } }),
  ],
  editorProps: {
    attributes: {
      class: 'rich-content focus:outline-none',
    },
    handleKeyDown: (view, event) => {
      if (props.singleLine && event.key === 'Enter') {
        emit('enter')
        return true
      }
      if (props.singleLine && event.key === 'Backspace' && !view.state.doc.textContent) {
        emit('backspaceEmpty')
        return true
      }
      return false
    },
    handlePaste: (_view, event) => {
      if (!props.onPaste) {
        return false
      }
      const text = event.clipboardData?.getData('text/plain') ?? ''
      if (!text) {
        return false
      }
      const replacement = props.onPaste(text)
      if (replacement == null) {
        return false
      }
      // `false` → swallow the paste but leave this field's content unchanged.
      if (replacement === false) {
        return true
      }
      const instance = editor.value
      if (instance) {
        instance.commands.setContent(replacement, { emitUpdate: false })
        migrateMathStrings(instance)
        emit('update:modelValue', instance.getHTML())
      }
      return true
    },
  },
  onCreate: ({ editor }) => {
    migrateMathStrings(editor)
  },
  onUpdate: ({ editor }) => {
    emit('update:modelValue', editor.getHTML())
  },
})

const focus = () => {
  editor.value?.commands.focus('end')
}

defineExpose({ focus })

// Symbol / math palette behind the "More" button. Items either insert a unicode
// character (text) or a rendered KaTeX inline-math node (latex).
type PaletteItem = { label: string; title: string; text?: string; latex?: string }

const paletteGroups: { title: string; items: PaletteItem[] }[] = [
  {
    title: 'Math',
    items: [
      { label: 'x²', title: 'Superscript', latex: 'x^{2}' },
      { label: 'x₂', title: 'Subscript', latex: 'x_{2}' },
      { label: '√', title: 'Square root', latex: '\\sqrt{x}' },
      { label: 'ⁿ√', title: 'nth root', latex: '\\sqrt[n]{x}' },
      { label: 'a/b', title: 'Fraction', latex: '\\frac{a}{b}' },
      { label: '∫', title: 'Integral', latex: '\\int_{a}^{b}' },
      { label: 'Σ', title: 'Summation', latex: '\\sum_{i=1}^{n}' },
      { label: '∏', title: 'Product', latex: '\\prod_{i=1}^{n}' },
      { label: 'lim', title: 'Limit', latex: '\\lim_{x \\to 0}' },
    ],
  },
  {
    title: 'Arrows',
    items: [
      { label: '→', title: 'Right arrow', text: '→' },
      { label: '←', title: 'Left arrow', text: '←' },
      { label: '↔', title: 'Double-headed arrow', text: '↔' },
      { label: '⇒', title: 'Implies', text: '⇒' },
      { label: '⇔', title: 'If and only if', text: '⇔' },
      { label: '⇌', title: 'Equilibrium (reversible reaction)', text: '⇌' },
    ],
  },
  {
    title: 'Symbols',
    items: [
      { label: '±', title: 'Plus-minus', text: '±' },
      { label: '×', title: 'Multiplication', text: '×' },
      { label: '÷', title: 'Division', text: '÷' },
      { label: '·', title: 'Dot product', text: '·' },
      { label: '°', title: 'Degree', text: '°' },
      { label: '∝', title: 'Proportional to', text: '∝' },
      { label: '≈', title: 'Approximately', text: '≈' },
      { label: '≠', title: 'Not equal', text: '≠' },
      { label: '≤', title: 'Less than or equal', text: '≤' },
      { label: '≥', title: 'Greater than or equal', text: '≥' },
      { label: 'Δ', title: 'Delta', text: 'Δ' },
      { label: 'π', title: 'Pi', text: 'π' },
      { label: 'θ', title: 'Theta', text: 'θ' },
      { label: 'µ', title: 'Mu', text: 'µ' },
      { label: 'Ω', title: 'Omega', text: 'Ω' },
      { label: '∞', title: 'Infinity', text: '∞' },
    ],
  },
]

const morePanelOpen = ref(false)
const matrixRows = ref(2)
const matrixCols = ref(2)

const insertItem = (item: PaletteItem) => {
  if (item.latex) {
    editor.value?.chain().focus().insertInlineMath({ latex: item.latex }).run()
  } else if (item.text) {
    editor.value?.chain().focus().insertContent(item.text).run()
  }
  morePanelOpen.value = false
}

const insertMatrix = () => {
  const rows = Math.min(10, Math.max(1, matrixRows.value || 1))
  const cols = Math.min(10, Math.max(1, matrixCols.value || 1))
  const emptyRow = Array(cols).fill('\\,').join(' & ')
  const body = Array(rows).fill(emptyRow).join(' \\\\ ')
  editor.value?.chain().focus().insertInlineMath({ latex: `\\begin{pmatrix} ${body} \\end{pmatrix}` }).run()
  morePanelOpen.value = false
}

watch(
  () => props.modelValue,
  value => {
    // Don't reset content mid-edit — it would fight the cursor on every keystroke.
    if (editor.value && !editor.value.isFocused && editor.value.getHTML() !== value) {
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
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.12s ease;
  border-radius: 0.5rem;
  border: 0.5px solid rgb(107 114 128 / 0.4);
  background: white;
  padding: 4px;
  box-shadow: 0 8px 24px rgb(0 0 0 / 0.12);
}

/* Reveal the toolbar whenever the field has focus. */
.rich:focus-within .rich-toolbar {
  opacity: 1;
  pointer-events: auto;
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

.rt-btn--more {
  gap: 0.25rem;
  font-weight: 600;
}

.rt-more-label {
  font-size: 0.7rem;
}

.rt-sep {
  width: 1px;
  height: 1.25rem;
  margin: 0 2px;
  background: rgb(107 114 128 / 0.3);
}

/* "More" symbol / math modal (teleported to body). */
.rt-overlay {
  position: fixed;
  inset: 0;
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  background: rgb(0 0 0 / 0.4);
}

.rt-modal {
  width: 100%;
  max-width: 26rem;
  max-height: 80vh;
  overflow-y: auto;
  border-radius: 0.75rem;
  background: white;
  box-shadow: 0 20px 50px rgb(0 0 0 / 0.25);
}

:global(.dark) .rt-modal {
  background: rgb(31 41 55);
  color: rgb(229 231 235);
}

.rt-modal-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid rgb(229 231 235);
  font-weight: 700;
  color: rgb(17 24 39);
}

:global(.dark) .rt-modal-head {
  border-color: rgb(55 65 81);
  color: white;
}

.rt-modal-close {
  display: inline-flex;
  height: 2rem;
  width: 2rem;
  align-items: center;
  justify-content: center;
  border-radius: 0.5rem;
  color: rgb(107 114 128);
  cursor: pointer;
}

.rt-modal-close:hover {
  background: rgb(243 244 246);
  color: rgb(17 24 39);
}

.rt-modal-body {
  padding: 0.75rem 1rem 1rem;
}

.rt-group + .rt-group {
  margin-top: 0.85rem;
}

.rt-group-title {
  margin-bottom: 0.4rem;
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgb(156 163 175);
}

.rt-group-grid {
  display: grid;
  grid-template-columns: repeat(8, minmax(0, 1fr));
  gap: 4px;
}

.rt-sym {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 2.1rem;
  border-radius: 0.5rem;
  border: 1px solid rgb(229 231 235);
  background: white;
  font-size: 0.9rem;
  font-weight: 700;
  color: rgb(55 65 81);
  cursor: pointer;
  transition: background-color 0.12s ease, border-color 0.12s ease, color 0.12s ease;
}

.rt-sym:hover {
  background: rgb(239 246 255);
  border-color: rgb(96 165 250);
  color: rgb(37 99 235);
}

:global(.dark) .rt-sym {
  background: rgb(17 24 39);
  border-color: rgb(55 65 81);
  color: rgb(229 231 235);
}

.rt-matrix {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.rt-num {
  height: 2rem;
  width: 3.25rem;
  border-radius: 0.5rem;
  border: 1px solid rgb(229 231 235);
  text-align: center;
  font-weight: 700;
  color: rgb(55 65 81);
  outline: none;
}

.rt-num:focus {
  border-color: rgb(96 165 250);
}

:global(.dark) .rt-num {
  background: rgb(17 24 39);
  border-color: rgb(55 65 81);
  color: rgb(229 231 235);
}

.rt-insert {
  margin-left: auto;
  border-radius: 0.5rem;
  background: rgb(37 99 235);
  padding: 0.45rem 0.85rem;
  font-size: 0.75rem;
  font-weight: 700;
  color: white;
  cursor: pointer;
}

.rt-insert:hover {
  background: rgb(29 78 216);
}

.rt-hint {
  margin-top: 0.9rem;
  font-size: 0.7rem;
  color: rgb(156 163 175);
}

.rt-hint code {
  border-radius: 0.25rem;
  background: rgb(243 244 246);
  padding: 0.05rem 0.3rem;
}

:global(.dark) .rt-hint code {
  background: rgb(55 65 81);
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
