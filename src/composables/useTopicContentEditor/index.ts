import { computed, onScopeDispose, ref, watch } from 'vue'
import { useToast } from 'vue-toast-notification'
import type {
  AiMessage,
  AiSummaryItem,
  BlockPreset,
  FormattedStudyContent,
  StudyBlock,
  StudyBlockType,
  StudyMedia,
  StudyQuizItem,
} from './types'
import { blockPresetGroups, recastOptionsFor, scaffoldFor } from './blockPresets'
import { studyService } from '@/api/services/serviceFactory'

export * from './types'
export { blockPresetGroups, recastOptionsFor, scaffoldFor, familyOf } from './blockPresets'

const nextId = () => Date.now() + Math.floor(Math.random() * 1000)

const emptyContent = (): FormattedStudyContent => ({ media: {}, contents: [], finalQuiz: [] })

// The key converter in client.ts handles snake↔camel for object keys, but card
// `type` is a string *value* (`common_mistake`), so map those at the boundary.
const TYPE_FROM_API: Record<string, StudyBlockType> = {
  common_mistake: 'commonMistake',
  exam_tip: 'examTip',
  worked_example: 'workedExample',
}
const TYPE_TO_API: Record<string, string> = {
  commonMistake: 'common_mistake',
  examTip: 'exam_tip',
  workedExample: 'worked_example',
}

const remapCardTypes = (content: FormattedStudyContent, map: Record<string, string>): FormattedStudyContent => {
  const clone = JSON.parse(JSON.stringify(content)) as FormattedStudyContent
  for (const section of clone.contents ?? []) {
    for (const subsection of section.subsections ?? []) {
      for (const card of subsection.cards ?? []) {
        const mapped = map[card.type as string]
        if (mapped) {
          card.type = mapped as StudyBlockType
        }
      }
    }
  }
  return clone
}

export function useTopicContentEditor() {
  const toast = useToast()
  const topicId = ref<number | null>(null)
  const topicName = ref('Topic content')
  const content = ref<FormattedStudyContent>(emptyContent())
  const activeSectionId = ref<number | null>(null)
  const activeSubsectionId = ref<number | null>(null)
  const expandedSectionIds = ref<number[]>([])
  const mode = ref<'edit' | 'preview'>('edit')
  const isLoadingContent = ref(false)
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

  // Block-scoped AI edit triggered from a card's "Edit with agent" modal.
  // Mock for now — swap for the block-scoped endpoint later.
  const requestBlockAiEdit = (blockId: number, instruction: string) => {
    const trimmed = instruction.trim()
    if (!trimmed) {
      return
    }
    console.log('Mock block AI edit:', { blockId, instruction: trimmed })
    toast.success('Agent updated this card')
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
  let saveInFlight = false
  let pendingSave = false
  let dirty = false

  const saveContent = async () => {
    if (topicId.value === null) {
      return
    }
    // Never run two saves at once; remember if an edit landed mid-flight so the
    // latest content still gets persisted (without firing parallel requests).
    if (saveInFlight) {
      pendingSave = true
      return
    }

    saveInFlight = true
    dirty = false
    isSaving.value = true
    const payload = { content: remapCardTypes(content.value, TYPE_TO_API) as unknown as Record<string, unknown> }
    console.log('[study] saving topic content', topicId.value, payload)

    try {
      const response = await studyService.saveTopicContent(topicId.value, payload)
      console.log('[study] save response', response)
      lastSavedAt.value = Date.now()
      now.value = Date.now()
    } catch (error) {
      console.error('[study] failed to save topic content', error)
      toast.error('Could not save content')
    } finally {
      isSaving.value = false
      saveInFlight = false
      if (pendingSave) {
        pendingSave = false
        void saveContent()
      }
    }
  }

  // Debounced background autosave. The save only pushes — it never refetches or
  // replaces `content`, so it can't disrupt the editor.
  watch(
    content,
    () => {
      if (suppressAutosave) {
        return
      }
      dirty = true
      if (autosaveTimer) {
        clearTimeout(autosaveTimer)
      }
      autosaveTimer = setTimeout(() => {
        void saveContent()
      }, 1500)
    },
    { deep: true },
  )

  // Persist any pending edit immediately (leaving the page / closing the tab),
  // so the debounce window can't drop the last change.
  const flushSave = () => {
    if (autosaveTimer) {
      clearTimeout(autosaveTimer)
      autosaveTimer = null
    }
    if (dirty) {
      void saveContent()
    }
  }

  const onBeforeUnload = () => {
    flushSave()
  }
  window.addEventListener('beforeunload', onBeforeUnload)

  const applyLoadedContent = (loaded: FormattedStudyContent, name?: string) => {
    suppressAutosave = true
    topicName.value = name || topicName.value || 'Topic content'
    content.value = remapCardTypes(loaded, TYPE_FROM_API)
    activeSectionId.value = content.value.contents[0]?.id ?? null
    activeSubsectionId.value = content.value.contents[0]?.subsections[0]?.id ?? null
    expandedSectionIds.value = content.value.contents.map(section => section.id)
    activeSurface.value = 'content'
    activeQuizSectionId.value = null
    activeQuizQuestionIndex.value = 0
    changedBlockIds.value = []
    aiProposal.value = null
    // Release the autosave guard once the load-triggered reactivity settles.
    setTimeout(() => {
      suppressAutosave = false
    }, 0)
  }

  const loadContent = async (id: number, fallbackName?: string) => {
    topicId.value = id
    isLoadingContent.value = true
    try {
      const response = await studyService.getTopicContent(id)
      console.log('[study] topic content response', response)
      const data = (response?.data ?? {}) as {
        topicName?: string
        topicContent?: FormattedStudyContent
        content?: FormattedStudyContent
      } & Partial<FormattedStudyContent>
      const loaded = data.topicContent ?? data.content ?? (data as FormattedStudyContent)
      applyLoadedContent(loaded?.contents ? loaded : emptyContent(), data.topicName ?? fallbackName)
    } catch (error) {
      console.error('[study] failed to load topic content', error)
      applyLoadedContent(emptyContent(), fallbackName)
      toast.error('Could not load topic content')
    } finally {
      isLoadingContent.value = false
    }
  }

  const clockTimer = window.setInterval(() => {
    now.value = Date.now()
  }, 30000)

  onScopeDispose(() => {
    // Leaving the editor (route change/unmount): flush the last edit, then clean up.
    flushSave()
    window.removeEventListener('beforeunload', onBeforeUnload)
    window.clearInterval(clockTimer)
    if (autosaveTimer) {
      clearTimeout(autosaveTimer)
    }
  })

  return {
    topicId,
    topicName,
    content,
    isLoadingContent,
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
    loadContent,
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
    requestBlockAiEdit,
    applyAiProposal,
    discardAiProposal,
    saveContent,
  }
}
