<template>
  <span v-if="as === 'span'" v-html="rendered"></span>
  <div v-else v-html="rendered"></div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import katex from 'katex'

const props = withDefaults(
  defineProps<{
    text?: string
    as?: 'div' | 'span'
  }>(),
  {
    text: '',
    as: 'div',
  },
)

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')

const renderSegment = (expression: string, displayMode: boolean) => {
  try {
    return katex.renderToString(expression, { displayMode, throwOnError: false })
  } catch {
    return escapeHtml(displayMode ? `$$${expression}$$` : `$${expression}$`)
  }
}

// Splits text on $$…$$ (block) and $…$ (inline), rendering the math parts with
// KaTeX and leaving the surrounding prose escaped and newline-aware.
const rendered = computed(() => {
  const source = props.text ?? ''
  const pattern = /\$\$([\s\S]+?)\$\$|\$([^$\n]+?)\$/g
  let result = ''
  let lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = pattern.exec(source)) !== null) {
    result += escapeHtml(source.slice(lastIndex, match.index)).replace(/\n/g, '<br>')
    if (match[1] !== undefined) {
      result += renderSegment(match[1], true)
    } else if (match[2] !== undefined) {
      result += renderSegment(match[2], false)
    }
    lastIndex = pattern.lastIndex
  }

  result += escapeHtml(source.slice(lastIndex)).replace(/\n/g, '<br>')
  return result
})
</script>
