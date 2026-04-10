import { ref } from 'vue'
import { useToast } from 'vue-toast-notification'
import type { ExamType } from '@/api/models'
import { assessmentService, examTypeService } from '@/api/services/serviceFactory'

export interface ChallengeSubjectYear {
  examId: number
  year: number
}

export interface ChallengeSubjectOption {
  courseId: number
  courseName: string
  years: ChallengeSubjectYear[]
}

export function useChallenge() {
  const toast = useToast()

  const examTypes = ref<ExamType[]>([])
  const isLoading = ref(false)
  const subjectsWithYears = ref<ChallengeSubjectOption[]>([])
  const isLoadingSubjects = ref(false)

  const normalizeExamType = (examType: ExamType): ExamType => ({
    id: examType.id,
    name: examType.name,
    shortname: examType.shortname,
    expanded: false,
    courses: Array.isArray(examType.courses) ? examType.courses : [],
    isActive: examType.isActive,
    displayOrder: examType.displayOrder || 0,
  })

  const fetchExamTypes = async () => {
    isLoading.value = true

    try {
      const response = await examTypeService.get<ExamType[]>()

      if (response?.data && Array.isArray(response.data)) {
        examTypes.value = response.data.map(normalizeExamType)
        return
      }

      examTypes.value = []
    } catch (error) {
      console.error('Error fetching exam types:', error)
      examTypes.value = []
      toast.error('Failed to load exam types')
      throw error
    } finally {
      isLoading.value = false
    }
  }

  const fetchSubjectsWithYears = async (examTypeId: number | string) => {
    isLoadingSubjects.value = true

    try {
      const response = await assessmentService.get<ChallengeSubjectOption[]>(`${examTypeId}/courses`)

      const payload = response?.data
      const list = Array.isArray(payload) ? payload : []

      subjectsWithYears.value = list
        .map(item => {
          const years = Array.isArray(item?.years)
            ? item.years
              .map(yearItem => ({
                examId: Number(yearItem?.examId ?? 0),
                year: Number(yearItem?.year ?? 0),
              }))
              .filter(yearItem => Number.isFinite(yearItem.year) && yearItem.year > 0)
            : []

          return {
            courseId: Number(item?.courseId ?? 0),
            courseName: String(item?.courseName ?? '').trim(),
            years,
          }
        })
        .filter(item => item.courseId > 0 && item.courseName)

      return subjectsWithYears.value
    } catch (error) {
      console.error('Error fetching challenge subjects:', error)
      subjectsWithYears.value = []
      toast.error('Failed to load challenge subjects')
      throw error
    } finally {
      isLoadingSubjects.value = false
    }
  }

  return {
    examTypes,
    isLoading,
    fetchExamTypes,
    subjectsWithYears,
    isLoadingSubjects,
    fetchSubjectsWithYears,
  }
}
