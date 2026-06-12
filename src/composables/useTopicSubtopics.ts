import { computed, ref } from 'vue'
import { useToast } from 'vue-toast-notification'
import { studyService } from '@/api/services/serviceFactory'

export interface TopicSubtopicListItem {
  subtopicId: number | string
  subtopicName: string
}

export interface SubtopicDetail {
  subtopicId: number | string
  subtopicName: string
  subSubtopics: string[]
}

const MIN_SUB_SUBTOPICS = 3

const cloneDetail = (detail: SubtopicDetail): SubtopicDetail => ({
  ...detail,
  subSubtopics: [...detail.subSubtopics],
})

export function useTopicSubtopics() {
  const toast = useToast()

  const topicTitle = ref('Topic')
  const subtopics = ref<TopicSubtopicListItem[]>([])
  const selectedSubtopicId = ref<number | string | null>(null)
  const selectedSubtopicDetail = ref<SubtopicDetail | null>(null)
  const originalSubtopicDetail = ref<SubtopicDetail | null>(null)
  const searchQuery = ref('')
  const editingSubSubtopicIndex = ref<number | null>(null)
  const editSubSubtopicTitle = ref('')
  const isLoadingSubtopics = ref(false)
  const isLoadingSubtopicDetail = ref(false)
  const isSavingSubtopic = ref(false)

  const filteredSubtopics = computed(() => {
    const query = searchQuery.value.trim().toLowerCase()

    if (!query) {
      return subtopics.value
    }

    return subtopics.value.filter(subtopic => subtopic.subtopicName.toLowerCase().includes(query))
  })

  const canSave = computed(
    () =>
      Boolean(selectedSubtopicDetail.value?.subtopicName.trim()) &&
      (selectedSubtopicDetail.value?.subSubtopics.length ?? 0) >= MIN_SUB_SUBTOPICS &&
      !isSavingSubtopic.value,
  )

  const setTopicTitle = (title: string | null | undefined) => {
    const nextTitle = String(title || '').trim()
    topicTitle.value = nextTitle || 'Topic'
  }

  const loadSubtopicDetail = async (subtopicId: number | string) => {
    selectedSubtopicId.value = subtopicId
    isLoadingSubtopicDetail.value = true

    try {
      const response = await studyService.getSubtopicDetail(subtopicId)

      const detail = response?.data as SubtopicDetail | undefined
      selectedSubtopicDetail.value = detail ?? null
      originalSubtopicDetail.value = detail ? cloneDetail(detail) : null
    } catch (error) {
      console.error('Error loading subtopic detail:', error)
      selectedSubtopicDetail.value = null
      originalSubtopicDetail.value = null
    } finally {
      isLoadingSubtopicDetail.value = false
    }
  }

  const loadTopicSubtopics = async (topicId: number | string, topicName?: string) => {
    setTopicTitle(topicName)
    isLoadingSubtopics.value = true

    try {
      const response = await studyService.getTopicSubtopics(topicId)
      subtopics.value = response?.data as TopicSubtopicListItem[]
    } catch (error) {
      console.error('Error loading topic subtopics:', error)
      subtopics.value = []
    } finally {
      isLoadingSubtopics.value = false
    }

    const firstSubtopic = subtopics.value[0]
    if (firstSubtopic) {
      await loadSubtopicDetail(firstSubtopic.subtopicId)
    }
  }

  const updateSelectedTitle = (subtopicName: string) => {
    if (!selectedSubtopicDetail.value) {
      return
    }

    selectedSubtopicDetail.value = {
      ...selectedSubtopicDetail.value,
      subtopicName,
    }
  }

  const addSubSubtopic = () => {
    if (!selectedSubtopicDetail.value) {
      return
    }

    const newIndex = selectedSubtopicDetail.value.subSubtopics.length
    selectedSubtopicDetail.value = {
      ...selectedSubtopicDetail.value,
      subSubtopics: [...selectedSubtopicDetail.value.subSubtopics, 'Untitled sub-subtopic'],
    }
    editingSubSubtopicIndex.value = newIndex
    editSubSubtopicTitle.value = 'Untitled sub-subtopic'
  }

  const startEditingSubSubtopic = (index: number, title: string) => {
    editingSubSubtopicIndex.value = index
    editSubSubtopicTitle.value = title
  }

  const commitSubSubtopicEdit = () => {
    if (!selectedSubtopicDetail.value || editingSubSubtopicIndex.value === null) {
      return
    }

    const title = editSubSubtopicTitle.value.trim()

    if (!title) {
      return
    }

    selectedSubtopicDetail.value = {
      ...selectedSubtopicDetail.value,
      subSubtopics: selectedSubtopicDetail.value.subSubtopics.map((item, index) =>
        index === editingSubSubtopicIndex.value ? title : item,
      ),
    }
    editingSubSubtopicIndex.value = null
    editSubSubtopicTitle.value = ''
  }

  const deleteSubSubtopic = (subSubtopicIndex: number) => {
    if (!selectedSubtopicDetail.value) {
      return
    }

    selectedSubtopicDetail.value = {
      ...selectedSubtopicDetail.value,
      subSubtopics: selectedSubtopicDetail.value.subSubtopics.filter((_, index) => index !== subSubtopicIndex),
    }
  }

  const reorderSubSubtopic = (subSubtopicIndex: number, targetSubSubtopicIndex: number) => {
    if (!selectedSubtopicDetail.value || subSubtopicIndex === targetSubSubtopicIndex) {
      return
    }

    const nextItems = [...selectedSubtopicDetail.value.subSubtopics]
    const [item] = nextItems.splice(subSubtopicIndex, 1)
    if (!item) {
      return
    }

    nextItems.splice(targetSubSubtopicIndex, 0, item)
    selectedSubtopicDetail.value = {
      ...selectedSubtopicDetail.value,
      subSubtopics: nextItems,
    }
  }

  const resetSelectedDetail = () => {
    if (originalSubtopicDetail.value) {
      selectedSubtopicDetail.value = cloneDetail(originalSubtopicDetail.value)
    }
  }

  const saveSelectedSubtopic = async () => {
    if (!selectedSubtopicDetail.value || !canSave.value) {
      toast.error(`Add at least ${MIN_SUB_SUBTOPICS} sub-subtopics before saving`)
      return
    }

    isSavingSubtopic.value = true

    const payload = {
      subtopicName: selectedSubtopicDetail.value.subtopicName.trim(),
      subSubtopics: selectedSubtopicDetail.value.subSubtopics.map(item => item.trim()),
    }

    try {
      await studyService.saveSubtopicDetail(selectedSubtopicDetail.value.subtopicId, payload)
      originalSubtopicDetail.value = cloneDetail(selectedSubtopicDetail.value)
      toast.success('Subtopic saved')
    } catch (error) {
      console.error('Error saving subtopic detail:', error)
      toast.error('Failed to save subtopic changes')
    } finally {
      isSavingSubtopic.value = false
    }
  }

  return {
    MIN_SUB_SUBTOPICS,
    topicTitle,
    subtopics,
    filteredSubtopics,
    selectedSubtopicId,
    selectedSubtopicDetail,
    searchQuery,
    editingSubSubtopicIndex,
    editSubSubtopicTitle,
    isLoadingSubtopics,
    isLoadingSubtopicDetail,
    isSavingSubtopic,
    canSave,
    loadTopicSubtopics,
    loadSubtopicDetail,
    updateSelectedTitle,
    addSubSubtopic,
    startEditingSubSubtopic,
    commitSubSubtopicEdit,
    deleteSubSubtopic,
    reorderSubSubtopic,
    resetSelectedDetail,
    saveSelectedSubtopic,
  }
}
