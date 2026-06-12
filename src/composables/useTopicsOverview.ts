import { computed, ref } from 'vue'
import { studyService } from '@/api/services/serviceFactory'

export interface TopicCourse {
  courseId: number
  courseName: string
  topicCount: number
}

export interface TopicSummary {
  totalCourses: number
  totalTopics: number
  averageTopicsPerCourse: number
  mostTopics: TopicCourse | null
  fewestTopics: TopicCourse | null
}

export interface TopicOverviewResponse {
  data: {
    courses: TopicCourse[]
    summary: TopicSummary
  }
}

export interface CourseTopic {
  id: number
  name: string
  questionsCount: number
}

export interface TopicCategory {
  categoryId: number
  categoryName: string
  topics: CourseTopic[]
}

const emptySummary: TopicSummary = {
  totalCourses: 0,
  totalTopics: 0,
  averageTopicsPerCourse: 0,
  mostTopics: null,
  fewestTopics: null,
}

const separator = '_'

const apiKey = (parts: string[]) => parts.join(separator)

const getPayloadValue = (payload: Record<string, unknown>, camelKey: string, apiKeyParts: string[]) =>
  payload[camelKey] ?? payload[apiKey(apiKeyParts)]

const normalizeCourse = (payload: unknown): TopicCourse => {
  const candidate = payload as Record<string, unknown>

  return {
    courseId: Number(getPayloadValue(candidate, 'courseId', ['course', 'id'])),
    courseName: String(getPayloadValue(candidate, 'courseName', ['course', 'name']) || '').trim(),
    topicCount: Number(getPayloadValue(candidate, 'topicCount', ['topic', 'count']) || 0),
  }
}

const isValidCourse = (course: TopicCourse) =>
  Number.isFinite(course.courseId) && Boolean(course.courseName) && Number.isFinite(course.topicCount)

const normalizeTopic = (payload: unknown): CourseTopic => {
  const candidate = payload as Record<string, unknown>

  return {
    id: Number(getPayloadValue(candidate, 'topicId', ['topic', 'id'])),
    name: String(getPayloadValue(candidate, 'topicName', ['topic', 'name']) || '').trim(),
    questionsCount: 0,
  }
}

const isValidTopic = (topic: CourseTopic) => Number.isFinite(topic.id) && Boolean(topic.name)

const normalizeCategory = (payload: unknown): TopicCategory => {
  const candidate = payload as Record<string, unknown>
  const topicsPayload = candidate.topics

  return {
    categoryId: Number(getPayloadValue(candidate, 'categoryId', ['category', 'id'])),
    categoryName: String(getPayloadValue(candidate, 'categoryName', ['category', 'name']) || '').trim(),
    topics: Array.isArray(topicsPayload) ? topicsPayload.map(normalizeTopic).filter(isValidTopic) : [],
  }
}

const isValidCategory = (category: TopicCategory) =>
  Number.isFinite(category.categoryId) && Boolean(category.categoryName)

const normalizeCourseTopics = (payload: unknown): TopicCategory[] => {
  if (!Array.isArray(payload)) {
    return []
  }

  return payload.map(normalizeCategory).filter(isValidCategory)
}

const normalizeOverviewData = (payload: unknown): TopicOverviewResponse['data'] | null => {
  const candidate = payload as Partial<TopicOverviewResponse['data']> | null | undefined

  if (!candidate || !Array.isArray(candidate.courses) || !candidate.summary) {
    return null
  }

  const courses = candidate.courses.map(normalizeCourse).filter(isValidCourse)
  const summaryCandidate = candidate.summary as unknown as Record<string, unknown>
  const mostTopicsPayload = getPayloadValue(summaryCandidate, 'mostTopics', ['most', 'topics'])
  const fewestTopicsPayload = getPayloadValue(summaryCandidate, 'fewestTopics', ['fewest', 'topics'])

  if (!courses.length || !mostTopicsPayload || !fewestTopicsPayload) {
    return null
  }

  return {
    courses,
    summary: {
      totalCourses: Number(getPayloadValue(summaryCandidate, 'totalCourses', ['total', 'courses']) || courses.length),
      totalTopics: Number(getPayloadValue(summaryCandidate, 'totalTopics', ['total', 'topics']) || 0),
      averageTopicsPerCourse: Number(
        getPayloadValue(summaryCandidate, 'averageTopicsPerCourse', ['average', 'topics', 'per', 'course']) || 0,
      ),
      mostTopics: normalizeCourse(mostTopicsPayload),
      fewestTopics: normalizeCourse(fewestTopicsPayload),
    },
  }
}

export function useTopicsOverview() {
  const courses = ref<TopicCourse[]>([])
  const summary = ref<TopicSummary>({ ...emptySummary })
  const selectedCourseId = ref<number>(0)
  const selectedCourseTopicCategories = ref<TopicCategory[]>([])
  const isLoadingTopicsOverview = ref(false)
  const isLoadingCourseTopics = ref(false)

  const selectedCourse = computed(
    () => courses.value.find(course => course.courseId === selectedCourseId.value) ?? courses.value[0] ?? null,
  )

  const selectedCourseTopicsCount = computed(() =>
    selectedCourseTopicCategories.value.reduce((total, category) => total + category.topics.length, 0),
  )

  const loadCourseTopics = async (courseId: number) => {
    if (!Number.isFinite(courseId)) {
      return
    }

    isLoadingCourseTopics.value = true

    try {
      const response = await studyService.getCourseTopics(courseId)
      selectedCourseTopicCategories.value = normalizeCourseTopics(response?.data)
    } catch (error) {
      selectedCourseTopicCategories.value = []
      console.error('Error loading course topics:', error)
    } finally {
      isLoadingCourseTopics.value = false
    }
  }

  const selectCourse = (courseId: number) => {
    if (courses.value.some(course => course.courseId === courseId)) {
      selectedCourseId.value = courseId
      void loadCourseTopics(courseId)
    }
  }

  const loadTopicsOverview = async () => {
    isLoadingTopicsOverview.value = true

    try {
      const response = await studyService.getTopicsOverview()

      const overviewData = normalizeOverviewData(response?.data)

      if (!overviewData) {
        return
      }

      courses.value = overviewData.courses
      summary.value = overviewData.summary

      if (!courses.value.some(course => course.courseId === selectedCourseId.value)) {
        selectedCourseId.value = courses.value[0]?.courseId ?? 0
      }

      if (selectedCourseId.value) {
        await loadCourseTopics(selectedCourseId.value)
      }
    } catch (error) {
      console.error('Error loading topics overview:', error)
    } finally {
      isLoadingTopicsOverview.value = false
    }
  }

  return {
    courses,
    summary,
    selectedCourseId,
    selectedCourse,
    selectedCourseTopicCategories,
    selectedCourseTopicsCount,
    isLoadingTopicsOverview,
    isLoadingCourseTopics,
    loadTopicsOverview,
    loadCourseTopics,
    selectCourse,
  }
}
