import { computed, reactive, ref } from 'vue'
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

export interface StudySubsection {
  id: number
  title: string
  cards: StudyBlock[]
  media: Array<{ type: 'image'; url: string; alt?: string }>
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

export interface AiMessage {
  id: number
  role: 'user' | 'assistant'
  body: string
  summary?: Array<{ op: 'add' | 'edit' | 'remove'; label: string }>
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
              body: '6CO2 + 6H2O -> C6H12O6 + 6O2',
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

const blockDefaults: Record<StudyBlockType, Omit<StudyBlock, 'id' | 'type'>> = {
  text: { title: 'New text', body: '' },
  highlight: { title: 'Key idea', body: '' },
  list: { title: 'New list', items: [''] },
  pairs: { title: 'Term pairs', items: [{ term: '', description: '' }] },
  examTip: { title: 'Exam tip', body: '' },
  commonMistake: { title: 'Common mistake', wrong: '', correct: '' },
  equation: { title: 'Equation', body: '' },
  workedExample: { title: 'Worked example', body: '' },
}

export function useTopicContentEditor() {
  const toast = useToast()
  const topicName = ref('Topic content')
  const content = ref<FormattedStudyContent>(createDummyContent())
  const activeSectionId = ref(content.value.contents[0]?.id ?? null)
  const activeSubsectionId = ref(content.value.contents[0]?.subsections[0]?.id ?? null)
  const expandedSectionIds = ref<number[]>(content.value.contents.map(section => section.id))
  const mode = ref<'edit' | 'preview'>('edit')
  const isSaving = ref(false)
  const savedStatus = ref('Draft loaded')
  const addBlockMenuOpen = ref(false)
  const aiInstruction = ref('')
  const aiScope = ref<'topic' | 'section' | 'subsection' | 'block'>('subsection')
  const aiMessages = ref<AiMessage[]>([
    {
      id: 1,
      role: 'assistant',
      body: 'Ask for targeted edits. Proposed changes will be reviewed before they affect the draft.',
    },
  ])
  const quizEditor = reactive<{
    open: boolean
    type: 'section' | 'final'
    sectionId: number | null
  }>({
    open: false,
    type: 'final',
    sectionId: null,
  })

  const activeSection = computed(
    () => content.value.contents.find(section => section.id === activeSectionId.value) ?? null,
  )

  const activeSubsection = computed(
    () => activeSection.value?.subsections.find(subsection => subsection.id === activeSubsectionId.value) ?? null,
  )

  const activeQuiz = computed(() => {
    if (quizEditor.type === 'final') {
      return content.value.finalQuiz
    }

    return content.value.contents.find(section => section.id === quizEditor.sectionId)?.quiz ?? []
  })

  const selectSubsection = (sectionId: number, subsectionId: number) => {
    activeSectionId.value = sectionId
    activeSubsectionId.value = subsectionId
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

  const addBlock = (type: StudyBlockType) => {
    if (!activeSubsection.value) {
      return
    }

    activeSubsection.value.cards.push({
      id: nextId(),
      type,
      ...blockDefaults[type],
    })
    addBlockMenuOpen.value = false
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
      id: nextId(),
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

  const openSectionQuiz = (sectionId: number) => {
    quizEditor.open = true
    quizEditor.type = 'section'
    quizEditor.sectionId = sectionId
  }

  const openFinalQuiz = () => {
    quizEditor.open = true
    quizEditor.type = 'final'
    quizEditor.sectionId = null
  }

  const closeQuizEditor = () => {
    quizEditor.open = false
  }

  const sendAiInstruction = () => {
    const instruction = aiInstruction.value.trim()
    if (!instruction) {
      return
    }

    aiMessages.value.push({ id: nextId(), role: 'user', body: instruction })
    aiMessages.value.push({
      id: nextId(),
      role: 'assistant',
      body: 'Mock response: I prepared a targeted edit proposal for this scope.',
      summary: [
        { op: 'edit', label: 'Current subsection copy' },
        { op: 'add', label: 'Worked example card' },
      ],
    })
    aiInstruction.value = ''
  }

  const saveContent = async () => {
    isSaving.value = true
    console.log('Mock save topic content payload:', { content: content.value })

    window.setTimeout(() => {
      isSaving.value = false
      savedStatus.value = 'Saved just now'
      toast.success('Content saved locally')
    }, 400)
  }

  const loadDummyContent = (name?: string) => {
    topicName.value = name || 'Topic content'
    content.value = createDummyContent()
    activeSectionId.value = content.value.contents[0]?.id ?? null
    activeSubsectionId.value = content.value.contents[0]?.subsections[0]?.id ?? null
    expandedSectionIds.value = content.value.contents.map(section => section.id)
  }

  return {
    topicName,
    content,
    activeSectionId,
    activeSubsectionId,
    expandedSectionIds,
    activeSection,
    activeSubsection,
    activeQuiz,
    mode,
    isSaving,
    savedStatus,
    addBlockMenuOpen,
    aiInstruction,
    aiScope,
    aiMessages,
    quizEditor,
    loadDummyContent,
    selectSubsection,
    toggleSection,
    updateSubsectionTitle,
    updateBlock,
    addBlock,
    duplicateBlock,
    deleteBlock,
    reorderBlock,
    openSectionQuiz,
    openFinalQuiz,
    closeQuizEditor,
    sendAiInstruction,
    saveContent,
  }
}
