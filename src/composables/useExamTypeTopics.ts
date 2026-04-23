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

  const selectedTopics = computed(() =>
    topicOptions.value.filter(topic => selectedTopicIds.value.includes(topic.topicId)),
  )

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

  const addSelectedTopic = () => {
    const topicId = topicPickerValue.value

    if (topicId == null || !Number.isFinite(topicId) || selectedTopicIds.value.includes(topicId)) {
      topicPickerValue.value = null
      return
    }

    selectedTopicIds.value = [...selectedTopicIds.value, topicId]
    topicPickerValue.value = null
  }

  const removeSelectedTopic = (topicId: number) => {
    selectedTopicIds.value = selectedTopicIds.value.filter(id => id !== topicId)
  }

  const saveExamTypeTopics = async (examTypeId: number | string | null | undefined) => {
    const normalizedExamTypeId = examTypeId == null ? '' : String(examTypeId).trim()

    if (!normalizedExamTypeId || selectedTopicCourseId.value === null || selectedTopicIds.value.length === 0) {
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
    addSelectedTopic,
    removeSelectedTopic,
    saveExamTypeTopics,
    resetTopicPicker,
  }
}
