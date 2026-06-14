import type { BlockPreset, BlockPresetGroup, StudyBlock, StudyBlockType } from './types'

// §6 — the heading → type catalog. Authors pick a heading; it scaffolds a card
// of the underlying `type`. The raw type is an internal detail, never surfaced.
export const blockPresetGroups: BlockPresetGroup[] = [
  {
    group: 'Explain',
    presets: [
      { label: 'Definition', type: 'text', icon: 'fas fa-align-left', description: 'Plain definition paragraph' },
      { label: 'Explanation', type: 'text', icon: 'fas fa-align-left', description: 'Explanatory paragraph' },
      { label: 'Key Idea', type: 'highlight', icon: 'fas fa-star', description: 'Emphasised key idea' },
      { label: 'Why It Matters', type: 'highlight', icon: 'fas fa-star', description: 'Relevance callout' },
      { label: 'Background / Terminology', type: 'text', icon: 'fas fa-book', description: 'Context or vocabulary' },
      { label: 'Memory Tip', type: 'text', icon: 'fas fa-brain', description: 'Mnemonic or memory aid' },
    ],
  },
  {
    group: 'Facts & lists',
    presets: [
      { label: 'Key Points', type: 'list', icon: 'fas fa-list', description: 'Bulleted key points' },
      { label: 'Applications / Uses', type: 'list', icon: 'fas fa-list', description: 'Where it is used' },
      { label: 'Steps / Procedure', type: 'list', icon: 'fas fa-list-ol', description: 'Ordered procedure', ordered: true },
      { label: 'Parts / Components', type: 'list', icon: 'fas fa-list', description: 'Constituent parts' },
    ],
  },
  {
    group: 'Relationships',
    presets: [
      { label: 'Types / Classification', type: 'pairs', icon: 'fas fa-table-columns', description: 'Term ↔ meaning pairs' },
      { label: 'Comparison / Differences', type: 'pairs', icon: 'fas fa-table-columns', description: 'Compare two things' },
      { label: 'Advantages & Disadvantages', type: 'pairs', icon: 'fas fa-table-columns', description: 'Pros and cons' },
      { label: 'Cause & Effect', type: 'pairs', icon: 'fas fa-table-columns', description: 'Cause ↔ effect pairs' },
    ],
  },
  {
    group: 'Callouts',
    presets: [
      { label: 'Exam Tip', type: 'examTip', icon: 'fas fa-lightbulb', description: 'Exam-focused guidance' },
      { label: 'Common Mistake', type: 'commonMistake', icon: 'fas fa-triangle-exclamation', description: 'Wrong vs correct' },
      { label: 'Misconception Alert', type: 'text', icon: 'fas fa-circle-exclamation', description: 'Clear up a misconception' },
    ],
  },
  {
    group: 'Examples & math',
    presets: [
      { label: 'Worked Example', type: 'workedExample', icon: 'fas fa-pen-nib', description: 'Step-by-step example' },
      { label: 'Equation / Formula', type: 'equation', icon: 'fas fa-square-root-variable', description: 'Math or formula' },
    ],
  },
  {
    group: 'Media',
    presets: [{ label: 'Image', type: 'image', icon: 'fas fa-image', description: 'Image block' }],
  },
  {
    group: '',
    presets: [
      { label: 'Text block (no heading)', type: 'text', icon: 'fas fa-paragraph', description: 'Generic paragraph, no title', noHeading: true },
    ],
  },
]

// Card types that share a title+body shape and can be recast into one another (§5).
const bodyFamily: StudyBlockType[] = ['text', 'highlight', 'examTip', 'workedExample', 'equation']

export const familyOf = (type: StudyBlockType): StudyBlockType[] => {
  if (bodyFamily.includes(type)) {
    return bodyFamily
  }
  return [type]
}

export const scaffoldFor = (type: StudyBlockType): Omit<StudyBlock, 'id' | 'type' | 'title'> => {
  switch (type) {
    case 'list':
      return { items: [''] }
    case 'pairs':
      return { items: [{ term: '', description: '' }] }
    case 'commonMistake':
      return { wrong: '', correct: '' }
    default:
      return { body: '' }
  }
}

// Compatible headings a card can be recast into (same underlying shape family).
export const recastOptionsFor = (type: StudyBlockType): BlockPreset[] => {
  const family = familyOf(type)
  return blockPresetGroups
    .flatMap(group => group.presets)
    .filter(preset => preset.type !== 'image' && !preset.noHeading && family.includes(preset.type as StudyBlockType))
}
