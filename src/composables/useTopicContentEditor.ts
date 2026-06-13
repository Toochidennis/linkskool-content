import { computed, onScopeDispose, ref, watch } from 'vue'
import { useToast } from 'vue-toast-notification'

export type StudyBlockType =
  | 'text'
  | 'highlight'
  | 'list'
  | 'pairs'
  | 'examTip'
  | 'commonMistake'
  | 'equation'
  | 'workedExample'

export interface StudyBlock {
  id: number
  type: StudyBlockType
  title: string
  body?: string
  items?: string[] | Array<{ term: string; description: string }>
  /** For list blocks: render as a numbered (ordered) list instead of bullets. */
  ordered?: boolean
  wrong?: string
  correct?: string
}

export interface StudyQuizOption {
  text: string
}

export interface StudyQuizItem {
  id: number
  questionText: string
  options: StudyQuizOption[]
  correctAnswer: number
  explanation: string
  bloomLevel: string
}

export interface StudyMedia {
  type: 'image'
  url: string
  alt?: string
}

export interface StudySubsection {
  id: number
  title: string
  cards: StudyBlock[]
  media: StudyMedia[]
  diagramNeeded: boolean
}

export interface StudySection {
  id: number
  title: string
  subsections: StudySubsection[]
  quiz: StudyQuizItem[]
}

export interface FormattedStudyContent {
  media: {
    video?: {
      type: 'video'
      title: string
      url: string
      provider: string
      duration: string
      placement: string | null
    }
  }
  contents: StudySection[]
  finalQuiz: StudyQuizItem[]
}

export interface AiSummaryItem {
  op: 'add' | 'edit' | 'remove'
  target?: string
  label: string
  detail?: string
}

export interface AiMessage {
  id: number
  role: 'user' | 'assistant'
  body: string
  summary?: AiSummaryItem[]
  proposalId?: number
  status?: 'pending' | 'applied' | 'discarded'
}

/** A semantic authoring heading. `type` is the underlying card primitive (never shown to authors). */
export interface BlockPreset {
  label: string
  type: StudyBlockType | 'image'
  icon: string
  description: string
  /** Generic escape hatch — creates a card with an empty title. */
  noHeading?: boolean
  /** For list presets: scaffold a numbered list instead of bullets. */
  ordered?: boolean
}

export interface BlockPresetGroup {
  group: string
  presets: BlockPreset[]
}

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
    presets: [
      { label: 'Image', type: 'image', icon: 'fas fa-image', description: 'Image block' },
    ],
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

const familyOf = (type: StudyBlockType): StudyBlockType[] => {
  if (bodyFamily.includes(type)) {
    return bodyFamily
  }
  return [type]
}

const scaffoldFor = (type: StudyBlockType): Omit<StudyBlock, 'id' | 'type' | 'title'> => {
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

const nextId = () => Date.now() + Math.floor(Math.random() * 1000)

const createDummyContent = (): FormattedStudyContent => ({
  media: {
    video: {
      type: 'video',
      title: 'Photosynthesis overview',
      url: 'https://example.com/photosynthesis-video',
      provider: 'youtube',
      duration: '6:42',
      placement: null,
    },
  },
  contents: [
    {
      id: 1,
      title: 'Introduction',
      subsections: [
        {
          id: 11,
          title: 'What Photosynthesis Is',
          diagramNeeded: false,
          media: [{ type: 'image', url: 'https://placehold.co/900x520?text=Leaf+diagram', alt: 'Leaf diagram' }],
          cards: [
            {
              id: 111,
              type: 'text',
              title: 'Definition',
              body: 'Photosynthesis is the process plants use to convert light energy into chemical energy stored as glucose.',
            },
            {
              id: 112,
              type: 'highlight',
              title: 'Key idea',
              body: 'Light energy is transformed into food energy.',
            },
            {
              id: 113,
              type: 'list',
              title: 'What plants need',
              items: ['Sunlight', 'Carbon dioxide', 'Water', 'Chlorophyll'],
            },
          ],
        },
        {
          id: 12,
          title: 'Why It Matters',
          diagramNeeded: true,
          media: [],
          cards: [
            {
              id: 121,
              type: 'examTip',
              title: 'Exam tip',
              body: 'Always mention glucose and oxygen when explaining the products of photosynthesis.',
            },
            {
              id: 122,
              type: 'commonMistake',
              title: 'Common mistake',
              wrong: 'Plants breathe in carbon dioxide and breathe out oxygen only at night.',
              correct: 'Plants take in carbon dioxide during photosynthesis and release oxygen as a product.',
            },
          ],
        },
      ],
      quiz: [
        {
          id: 701,
          questionText: 'What gas is released during photosynthesis?',
          options: [{ text: 'Nitrogen' }, { text: 'Oxygen' }, { text: 'Hydrogen' }, { text: 'Methane' }],
          correctAnswer: 1,
          explanation: 'Oxygen is released as water molecules are split during the light-dependent reactions.',
          bloomLevel: 'understand',
        },
      ],
    },
    {
      id: 2,
      title: 'The Process',
      subsections: [
        {
          id: 21,
          title: 'Light Dependent Stage',
          diagramNeeded: false,
          media: [],
          cards: [
            {
              id: 211,
              type: 'workedExample',
              title: 'Tracing the energy flow',
              body: 'Sunlight is absorbed by chlorophyll, water is split, oxygen is released, and energy carriers are formed.',
            },
            {
              id: 212,
              type: 'equation',
              title: 'Balanced equation',
              body: '$$6CO_2 + 6H_2O \\rightarrow C_6H_{12}O_6 + 6O_2$$',
            },
          ],
        },
      ],
      quiz: [],
    },
  ],
  finalQuiz: [
    {
      id: 801,
      questionText: 'Which pigment traps light energy for photosynthesis?',
      options: [{ text: 'Haemoglobin' }, { text: 'Chlorophyll' }, { text: 'Melanin' }, { text: 'Keratin' }],
      correctAnswer: 1,
      explanation: 'Chlorophyll absorbs light energy in green plants.',
      bloomLevel: 'remember',
    },
  ],
})

export function useTopicContentEditor() {
  const toast = useToast()
  const topicName = ref('Topic content')
  const content = ref<FormattedStudyContent>(createDummyContent())
  const activeSectionId = ref(content.value.contents[0]?.id ?? null)
  const activeSubsectionId = ref(content.value.contents[0]?.subsections[0]?.id ?? null)
  const expandedSectionIds = ref<number[]>(content.value.contents.map(section => section.id))
  const mode = ref<'edit' | 'preview'>('edit')
  const isSaving = ref(false)
  const lastSavedAt = ref<number | null>(null)
  const now = ref(Date.now())
  const addBlockMenuOpen = ref(false)
  // Where the next added card lands: index in cards[], or null to append.
  const pendingInsertIndex = ref<number | null>(null)
  const activeSurface = ref<'content' | 'sectionQuiz' | 'finalQuiz'>('content')
  const activeQuizSectionId = ref<number | null>(null)
  const activeQuizQuestionIndex = ref(0)
  const aiInstruction = ref('')
  const aiScope = ref<'topic' | 'section' | 'subsection'>('subsection')
  const aiMessages = ref<AiMessage[]>([
    {
      id: 1,
      role: 'assistant',
      body: 'Ask for targeted edits. Proposed changes will be reviewed before they affect the draft.',
    },
  ])
  // AI proposal awaiting Apply/Discard, plus ids of blocks changed by the last apply (§9).
  const aiProposal = ref<{ id: number; content: FormattedStudyContent; summary: AiSummaryItem[] } | null>(null)
  const changedBlockIds = ref<number[]>([])

  const activeSection = computed(
    () => content.value.contents.find(section => section.id === activeSectionId.value) ?? null,
  )

  const activeSubsection = computed(
    () => activeSection.value?.subsections.find(subsection => subsection.id === activeSubsectionId.value) ?? null,
  )

  const activeQuiz = computed(() => {
    if (activeSurface.value === 'finalQuiz') {
      return content.value.finalQuiz
    }

    return content.value.contents.find(section => section.id === activeQuizSectionId.value)?.quiz ?? []
  })

  const activeQuizTitle = computed(() => {
    if (activeSurface.value === 'finalQuiz') {
      return 'Final Quiz'
    }

    const section = content.value.contents.find(item => item.id === activeQuizSectionId.value)
    return section ? `${section.title} Quiz` : 'Section Quiz'
  })

  const selectedQuizQuestion = computed(() => activeQuiz.value[activeQuizQuestionIndex.value] ?? null)

  const savedStatus = computed(() => {
    if (isSaving.value) {
      return 'Saving…'
    }
    if (lastSavedAt.value === null) {
      return 'Draft loaded'
    }
    const minutes = Math.floor((now.value - lastSavedAt.value) / 60000)
    if (minutes < 1) {
      return 'Saved just now'
    }
    if (minutes < 60) {
      return `Saved ${minutes}m ago`
    }
    return `Saved ${Math.floor(minutes / 60)}h ago`
  })

  const nextCardId = (cards: StudyBlock[]) => (cards.length ? Math.max(...cards.map(card => card.id)) + 1 : 1)

  const selectSubsection = (sectionId: number, subsectionId: number) => {
    activeSectionId.value = sectionId
    activeSubsectionId.value = subsectionId
    activeSurface.value = 'content'
    changedBlockIds.value = []
  }

  const toggleSection = (sectionId: number) => {
    expandedSectionIds.value = expandedSectionIds.value.includes(sectionId)
      ? expandedSectionIds.value.filter(id => id !== sectionId)
      : [...expandedSectionIds.value, sectionId]
  }

  const updateSubsectionTitle = (title: string) => {
    if (activeSubsection.value) {
      activeSubsection.value.title = title
    }
  }

  const updateBlock = (blockId: number, patch: Partial<StudyBlock>) => {
    if (!activeSubsection.value) {
      return
    }

    const block = activeSubsection.value.cards.find(item => item.id === blockId)
    if (block) {
      Object.assign(block, patch)
    }
  }

  // Add a card (or image) from a semantic heading preset (§6).
  const addPreset = (preset: BlockPreset) => {
    if (!activeSubsection.value) {
      return
    }

    if (preset.type === 'image') {
      activeSubsection.value.media.push({ type: 'image', url: '', alt: '' })
      addBlockMenuOpen.value = false
      pendingInsertIndex.value = null
      return
    }

    const card: StudyBlock = {
      id: nextCardId(activeSubsection.value.cards),
      type: preset.type,
      title: preset.noHeading ? '' : preset.label,
      ...scaffoldFor(preset.type),
    }
    if (preset.type === 'list') {
      card.ordered = !!preset.ordered
    }

    const cards = activeSubsection.value.cards
    const index = pendingInsertIndex.value
    if (index === null || index < 0 || index > cards.length) {
      cards.push(card)
    } else {
      cards.splice(index, 0, card)
    }

    addBlockMenuOpen.value = false
    pendingInsertIndex.value = null
  }

  // Recast a card to a compatible heading; title+body family preserves its body (§5).
  const recastOptionsFor = (type: StudyBlockType): BlockPreset[] => {
    const family = familyOf(type)
    return blockPresetGroups
      .flatMap(group => group.presets)
      .filter(preset => preset.type !== 'image' && !preset.noHeading && family.includes(preset.type as StudyBlockType))
  }

  const changeBlockType = (blockId: number, preset: BlockPreset) => {
    if (!activeSubsection.value || preset.type === 'image') {
      return
    }

    const block = activeSubsection.value.cards.find(item => item.id === blockId)
    if (!block) {
      return
    }

    block.type = preset.type
    block.title = preset.label
    if (preset.type === 'list') {
      block.ordered = !!preset.ordered
    }
  }

  const duplicateBlock = (blockId: number) => {
    if (!activeSubsection.value) {
      return
    }

    const index = activeSubsection.value.cards.findIndex(block => block.id === blockId)
    const block = activeSubsection.value.cards[index]
    if (!block) {
      return
    }

    activeSubsection.value.cards.splice(index + 1, 0, {
      ...JSON.parse(JSON.stringify(block)),
      id: nextCardId(activeSubsection.value.cards),
    })
  }

  const deleteBlock = (blockId: number) => {
    if (!activeSubsection.value) {
      return
    }

    activeSubsection.value.cards = activeSubsection.value.cards.filter(block => block.id !== blockId)
  }

  const reorderBlock = (blockId: number, targetBlockId: number) => {
    if (!activeSubsection.value || blockId === targetBlockId) {
      return
    }

    const nextCards = [...activeSubsection.value.cards]
    const currentIndex = nextCards.findIndex(block => block.id === blockId)
    const targetIndex = nextCards.findIndex(block => block.id === targetBlockId)
    const [block] = nextCards.splice(currentIndex, 1)

    if (!block || targetIndex < 0) {
      return
    }

    nextCards.splice(targetIndex, 0, block)
    activeSubsection.value.cards = nextCards
  }

  const addImage = () => {
    if (activeSubsection.value) {
      activeSubsection.value.media.push({ type: 'image', url: '', alt: '' })
    }
  }

  const updateMedia = (index: number, patch: Partial<StudyMedia>) => {
    const media = activeSubsection.value?.media[index]
    if (media) {
      Object.assign(media, patch)
    }
  }

  const removeMedia = (index: number) => {
    activeSubsection.value?.media.splice(index, 1)
  }

  const openSectionQuiz = (sectionId: number) => {
    activeSurface.value = 'sectionQuiz'
    activeQuizSectionId.value = sectionId
    activeSectionId.value = sectionId
    activeQuizQuestionIndex.value = 0
  }

  const openFinalQuiz = () => {
    activeSurface.value = 'finalQuiz'
    activeQuizSectionId.value = null
    activeQuizQuestionIndex.value = 0
  }

  const selectQuizQuestion = (index: number) => {
    activeQuizQuestionIndex.value = index
  }

  const addQuizQuestion = () => {
    const question: StudyQuizItem = {
      id: nextId(),
      questionText: 'Untitled question',
      options: [{ text: 'Option A' }, { text: 'Option B' }, { text: 'Option C' }, { text: 'Option D' }],
      correctAnswer: 0,
      explanation: '',
      bloomLevel: 'remember',
    }

    activeQuiz.value.push(question)
    activeQuizQuestionIndex.value = activeQuiz.value.length - 1
  }

  const deleteQuizQuestion = (index: number) => {
    activeQuiz.value.splice(index, 1)
    activeQuizQuestionIndex.value = Math.max(0, Math.min(activeQuizQuestionIndex.value, activeQuiz.value.length - 1))
  }

  const addQuizOption = () => {
    if (!selectedQuizQuestion.value) {
      return
    }

    selectedQuizQuestion.value.options.push({ text: `Option ${selectedQuizQuestion.value.options.length + 1}` })
  }

  const deleteQuizOption = (index: number) => {
    if (!selectedQuizQuestion.value || selectedQuizQuestion.value.options.length <= 2) {
      return
    }

    selectedQuizQuestion.value.options.splice(index, 1)
    if (selectedQuizQuestion.value.correctAnswer >= selectedQuizQuestion.value.options.length) {
      selectedQuizQuestion.value.correctAnswer = selectedQuizQuestion.value.options.length - 1
    }
  }

  // Collect card ids that are new or changed between two content versions (§9 diff).
  const diffChangedCardIds = (before: FormattedStudyContent, after: FormattedStudyContent) => {
    const beforeCards = new Map<number, string>()
    for (const section of before.contents) {
      for (const subsection of section.subsections) {
        for (const card of subsection.cards) {
          beforeCards.set(card.id, JSON.stringify(card))
        }
      }
    }

    const changed: number[] = []
    for (const section of after.contents) {
      for (const subsection of section.subsections) {
        for (const card of subsection.cards) {
          const prev = beforeCards.get(card.id)
          if (prev === undefined || prev !== JSON.stringify(card)) {
            changed.push(card.id)
          }
        }
      }
    }
    return changed
  }

  // Mock AI edit: builds a proposed copy of the content for the current scope so the
  // Review/Apply/Discard flow is exercised end-to-end (no live endpoint yet).
  const sendAiInstruction = () => {
    const instruction = aiInstruction.value.trim()
    if (!instruction) {
      return
    }

    aiMessages.value.push({ id: nextId(), role: 'user', body: instruction })

    const proposed: FormattedStudyContent = JSON.parse(JSON.stringify(content.value))
    const summary: AiSummaryItem[] = []
    const targetSubsection = proposed.contents
      .find(section => section.id === activeSectionId.value)
      ?.subsections.find(subsection => subsection.id === activeSubsectionId.value)

    if (targetSubsection) {
      const firstCard = targetSubsection.cards[0]
      if (firstCard && typeof firstCard.body === 'string') {
        firstCard.body = `${firstCard.body} (clarified)`
        summary.push({ op: 'edit', target: 'cards', label: firstCard.title, detail: 'Block content updated' })
      }

      targetSubsection.cards.push({
        id: nextCardId(targetSubsection.cards),
        type: 'workedExample',
        title: 'Worked example',
        body: 'Step-by-step example added by the assistant.',
      })
      summary.push({ op: 'add', target: 'cards', label: 'Worked example', detail: '1 block added' })
    }

    const proposalId = nextId()
    aiProposal.value = { id: proposalId, content: proposed, summary }
    aiMessages.value.push({
      id: nextId(),
      role: 'assistant',
      body: 'Prepared a proposed edit for this scope. Review the changes, then apply or discard.',
      summary,
      proposalId,
      status: 'pending',
    })
    aiInstruction.value = ''
  }

  const applyAiProposal = () => {
    if (!aiProposal.value) {
      return
    }

    const changed = diffChangedCardIds(content.value, aiProposal.value.content)
    content.value = aiProposal.value.content
    changedBlockIds.value = changed

    const message = aiMessages.value.find(item => item.proposalId === aiProposal.value?.id)
    if (message) {
      message.status = 'applied'
    }
    aiProposal.value = null
    toast.success('AI changes applied to draft')
  }

  const discardAiProposal = () => {
    if (!aiProposal.value) {
      return
    }

    const message = aiMessages.value.find(item => item.proposalId === aiProposal.value?.id)
    if (message) {
      message.status = 'discarded'
    }
    aiProposal.value = null
  }

  let autosaveTimer: ReturnType<typeof setTimeout> | null = null
  let suppressAutosave = false

  const saveContent = async () => {
    isSaving.value = true
    console.log('Mock save topic content payload:', { content: content.value })

    window.setTimeout(() => {
      isSaving.value = false
      lastSavedAt.value = Date.now()
      now.value = Date.now()
    }, 400)
  }

  // Debounced autosave (§10). Real PUT is deferred — this drives the indicator + flow.
  watch(
    content,
    () => {
      if (suppressAutosave) {
        return
      }
      if (autosaveTimer) {
        clearTimeout(autosaveTimer)
      }
      autosaveTimer = setTimeout(() => {
        void saveContent()
      }, 1500)
    },
    { deep: true },
  )

  const loadDummyContent = (name?: string) => {
    suppressAutosave = true
    topicName.value = name || 'Topic content'
    content.value = createDummyContent()
    activeSectionId.value = content.value.contents[0]?.id ?? null
    activeSubsectionId.value = content.value.contents[0]?.subsections[0]?.id ?? null
    expandedSectionIds.value = content.value.contents.map(section => section.id)
    activeSurface.value = 'content'
    activeQuizSectionId.value = null
    activeQuizQuestionIndex.value = 0
    changedBlockIds.value = []
    aiProposal.value = null
    // Release the autosave guard after the load-triggered reactivity settles.
    setTimeout(() => {
      suppressAutosave = false
    }, 0)
  }

  const clockTimer = window.setInterval(() => {
    now.value = Date.now()
  }, 30000)

  onScopeDispose(() => {
    window.clearInterval(clockTimer)
    if (autosaveTimer) {
      clearTimeout(autosaveTimer)
    }
  })

  return {
    topicName,
    content,
    activeSectionId,
    activeSubsectionId,
    expandedSectionIds,
    activeSection,
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
    addImage,
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
  }
}
