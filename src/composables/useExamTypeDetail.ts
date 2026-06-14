import { computed, ref } from 'vue'
import type { ExamType } from '@/api/models'
import { examTypeService } from '@/api/services/serviceFactory'

export type ExamTypeCourse = {
  id: number
  courseName: string
  description?: string
  topicCount: number
}

type ExamTypeCoursePayload = {
  id: number
  courseName: string
  description?: string
  topicCount?: number | string
}

const normalizeExamType = (payload: ExamType): ExamType => ({
  id: Number(payload.id),
  name: String(payload.name || '').trim(),
  shortname: String(payload.shortname || '').trim(),
  courses: Array.isArray(payload.courses) ? payload.courses : [],
  isActive: Number(payload.isActive),
  displayOrder: Number(payload.displayOrder),
})

const normalizeExamTypeCourse = (payload: ExamTypeCoursePayload): ExamTypeCourse => ({
  id: Number(payload.id),
  courseName: payload.courseName.trim(),
  description: payload.description ? String(payload.description).trim() : '',
  topicCount: Number(payload.topicCount ?? 0),
})

export function useExamTypeDetail() {
  const examType = ref<ExamType | null>(null)
  const examTypeCourses = ref<ExamTypeCourse[]>([])
  const isLoadingExamTypeDetail = ref(false)

  const isExamTypeActive = computed(() => Number(examType.value?.isActive) === 1)

  const loadExamTypeCourses = async (examTypeId: string) => {
    const response = await examTypeService.get<ExamTypeCoursePayload[]>(`${examTypeId}/courses`)
    examTypeCourses.value = Array.isArray(response?.data)
      ? response.data.map(normalizeExamTypeCourse)
      : []
  }

  const loadExamTypeDetail = async (examTypeId: string) => {
    const normalizedExamTypeId = examTypeId.trim()

    if (!normalizedExamTypeId) {
      examType.value = null
      examTypeCourses.value = []
      return null
    }

    isLoadingExamTypeDetail.value = true

    try {
      const response = await examTypeService.get<ExamType>(normalizedExamTypeId)

      if (!response?.data) {
        examType.value = null
        examTypeCourses.value = []
        return null
      }

      examType.value = normalizeExamType(response.data)
      await loadExamTypeCourses(normalizedExamTypeId)

      return examType.value
    } catch (error) {
      console.error('Error loading exam type details:', error)
      examType.value = null
      examTypeCourses.value = []
      throw error
    } finally {
      isLoadingExamTypeDetail.value = false
    }
  }

  return {
    examType,
    examTypeCourses,
    isExamTypeActive,
    isLoadingExamTypeDetail,
    loadExamTypeDetail,
    loadExamTypeCourses,
  }
}
