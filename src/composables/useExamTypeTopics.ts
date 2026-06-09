import { computed, ref } from 'vue'
import { useToast } from 'vue-toast-notification'
import { studyService } from '@/api/services/serviceFactory'

export interface ExamTypeTopic {
  id: number
  topicId: number
  topicName: string
}

export interface ExamTypeTopicOption {
  topicId: number
  topicName: string
  courseId: number
  courseName: string
  categoryId?: number
}

const normalizeTopicOptions = (payload: unknown): ExamTypeTopicOption[] => {
  if (!Array.isArray(payload)) {
    return []
  }

  return payload
    .map(item => {
      const candidate = item as Partial<ExamTypeTopicOption> & Record<string, unknown>

      return {
        topicId: Number(candidate.topicId),
        topicName: String(candidate.topicName).trim(),
        courseId: Number(candidate.courseId),
        courseName: String(candidate.courseName).trim(),
        categoryId: candidate.categoryId !== undefined ? Number(candidate.categoryId) : undefined,
      }
    })
    .filter(topic => Number.isFinite(topic.topicId) && Boolean(topic.topicName))
}

const normalizeExamTypeTopics = (payload: unknown): ExamTypeTopic[] => {
  if (!Array.isArray(payload)) {
    return []
  }

  return payload
    .map(item => {
      const candidate = item as Partial<ExamTypeTopic> & Record<string, unknown>

      const topic: ExamTypeTopic = {
        id: Number(candidate.id),
        topicId: Number(candidate.topicId),
        topicName: String(candidate.topicName).trim(),
      }

      return topic
    })
    .filter(topic => Number.isFinite(topic.id) && Number.isFinite(topic.topicId) && Boolean(topic.topicName))
}

export function useExamTypeTopics() {
  const toast = useToast()

  const selectedTopicCourseId = ref<number | null>(null)
  const topicPickerValue = ref<number | null>(null)
  const selectedTopicIds = ref<number[]>([])
  const topicOptions = ref<ExamTypeTopicOption[]>([])
  const examTypeTopics = ref<ExamTypeTopic[]>([])
  const isLoadingTopicOptions = ref(false)
  const isLoadingExamTypeTopics = ref(false)

  const selectedTopics = computed(() => {
    const topicMap = new Map(topicOptions.value.map(topic => [topic.topicId, topic]))

    return selectedTopicIds.value
      .map(topicId => topicMap.get(topicId))
      .filter((topic): topic is ExamTypeTopicOption => Boolean(topic))
  })

  const availableTopicOptions = computed(() =>
    topicOptions.value.filter(topic => !selectedTopicIds.value.includes(topic.topicId)),
  )

  const loadCourseTopics = async (courseId: number | null) => {
    if (courseId === null) {
      topicOptions.value = []
      selectedTopicIds.value = []
      topicPickerValue.value = null
      return
    }

    isLoadingTopicOptions.value = true

    try {
      const response = await studyService.getCourseTopics(courseId)
      topicOptions.value = normalizeTopicOptions(response?.data)
      const assignedTopicIds = new Set(examTypeTopics.value.map(topic => topic.topicId))
      selectedTopicIds.value = topicOptions.value
        .filter(topic => assignedTopicIds.has(topic.topicId))
        .map(topic => topic.topicId)
      topicPickerValue.value = null
    } catch (error) {
      console.error('Error loading topics:', error)
      topicOptions.value = []
      selectedTopicIds.value = []
      topicPickerValue.value = null
      toast.error('Failed to load topics for the selected subject')
    } finally {
      isLoadingTopicOptions.value = false
    }
  }

  const loadExamTypeTopics = async (examTypeId: number | string | null | undefined) => {
    const normalizedExamTypeId = examTypeId == null ? '' : String(examTypeId).trim()

    if (!normalizedExamTypeId) {
      examTypeTopics.value = []
      return
    }

    isLoadingExamTypeTopics.value = true

    try {
      const response = await studyService.getExamTypeTopics(normalizedExamTypeId)
      examTypeTopics.value = normalizeExamTypeTopics(response?.data)
    } catch (error) {
      console.error('Error loading exam type topics:', error)
      examTypeTopics.value = []
      toast.error('Failed to load exam type topics')
    } finally {
      isLoadingExamTypeTopics.value = false
    }
  }

  const setSelectedTopicCourse = async (courseId: number | null) => {
    selectedTopicCourseId.value = courseId
    await loadCourseTopics(courseId)
  }

  const addSelectedTopicById = (topicId: number | null) => {
    if (topicId == null || !Number.isFinite(topicId) || selectedTopicIds.value.includes(topicId)) {
      topicPickerValue.value = null
      return
    }

    selectedTopicIds.value = [...selectedTopicIds.value, topicId]
    topicPickerValue.value = null
  }

  const addSelectedTopic = () => {
    addSelectedTopicById(topicPickerValue.value)
  }

  const addSelectedTopicsById = (topicIds: number[]) => {
    const existingTopicIds = new Set(topicOptions.value.map(topic => topic.topicId))
    const nextTopicIds = topicIds.filter(
      topicId =>
        Number.isFinite(topicId) &&
        existingTopicIds.has(topicId) &&
        !selectedTopicIds.value.includes(topicId),
    )

    if (!nextTopicIds.length) {
      return
    }

    selectedTopicIds.value = [...selectedTopicIds.value, ...nextTopicIds]
  }

  const removeSelectedTopic = (topicId: number) => {
    selectedTopicIds.value = selectedTopicIds.value.filter(id => id !== topicId)
  }

  const removeSelectedTopics = (topicIds: number[]) => {
    const topicIdSet = new Set(topicIds)
    selectedTopicIds.value = selectedTopicIds.value.filter(id => !topicIdSet.has(id))
  }

  const moveSelectedTopic = (topicId: number, direction: 'up' | 'down') => {
    const currentIndex = selectedTopicIds.value.indexOf(topicId)
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1

    if (currentIndex < 0 || targetIndex < 0 || targetIndex >= selectedTopicIds.value.length) {
      return
    }

    const nextTopicIds = [...selectedTopicIds.value]
    const [topic] = nextTopicIds.splice(currentIndex, 1)
    if (topic === undefined) {
      return
    }

    nextTopicIds.splice(targetIndex, 0, topic)
    selectedTopicIds.value = nextTopicIds
  }

  const moveSelectedTopics = (topicIds: number[], direction: 'up' | 'down') => {
    const movingTopicIds = new Set(topicIds)

    if (!movingTopicIds.size) {
      return
    }

    const nextTopicIds = [...selectedTopicIds.value]
    const indexes =
      direction === 'up'
        ? nextTopicIds.map((topicId, index) => ({ topicId, index }))
        : nextTopicIds.map((topicId, index) => ({ topicId, index })).reverse()

    indexes.forEach(({ topicId, index }) => {
      if (!movingTopicIds.has(topicId)) {
        return
      }

      const targetIndex = direction === 'up' ? index - 1 : index + 1
      const targetTopicId = nextTopicIds[targetIndex]
      const canMove =
        targetIndex >= 0 &&
        targetIndex < nextTopicIds.length &&
        targetTopicId !== undefined &&
        !movingTopicIds.has(targetTopicId)

      if (!canMove) {
        return
      }

      const [topic] = nextTopicIds.splice(index, 1)
      if (topic === undefined) {
        return
      }

      nextTopicIds.splice(targetIndex, 0, topic)
    })

    selectedTopicIds.value = nextTopicIds
  }

  const reorderSelectedTopic = (topicId: number, targetTopicId: number) => {
    if (topicId === targetTopicId) {
      return
    }

    const currentIndex = selectedTopicIds.value.indexOf(topicId)
    const targetIndex = selectedTopicIds.value.indexOf(targetTopicId)

    if (currentIndex < 0 || targetIndex < 0) {
      return
    }

    const nextTopicIds = [...selectedTopicIds.value]
    const [topic] = nextTopicIds.splice(currentIndex, 1)
    if (topic === undefined) {
      return
    }

    nextTopicIds.splice(targetIndex, 0, topic)
    selectedTopicIds.value = nextTopicIds
  }

  const saveExamTypeTopics = async (examTypeId: number | string | null | undefined) => {
    const normalizedExamTypeId = examTypeId == null ? '' : String(examTypeId).trim()

    if (!normalizedExamTypeId || selectedTopicCourseId.value === null) {
      return
    }

    await studyService.saveExamTypeTopics(normalizedExamTypeId, {
      courseId: selectedTopicCourseId.value,
      topicIds: selectedTopicIds.value,
    })

    await loadExamTypeTopics(normalizedExamTypeId)
    toast.success('Topics assigned successfully')
  }

  const resetTopicPicker = () => {
    topicPickerValue.value = null
    selectedTopicIds.value = []
    topicOptions.value = []
  }

  return {
    selectedTopicCourseId,
    topicPickerValue,
    selectedTopicIds,
    topicOptions,
    examTypeTopics,
    selectedTopics,
    availableTopicOptions,
    isLoadingTopicOptions,
    isLoadingExamTypeTopics,
    loadCourseTopics,
    loadExamTypeTopics,
    setSelectedTopicCourse,
    addSelectedTopicById,
    addSelectedTopicsById,
    addSelectedTopic,
    removeSelectedTopic,
    removeSelectedTopics,
    moveSelectedTopic,
    moveSelectedTopics,
    reorderSelectedTopic,
    saveExamTypeTopics,
    resetTopicPicker,
  }
}
