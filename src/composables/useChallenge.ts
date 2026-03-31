import { ref } from 'vue'
import { useToast } from 'vue-toast-notification'
import type { ExamType } from '@/api/models'
import { examTypeService } from '@/api/services/serviceFactory'

export function useChallenge() {
  const toast = useToast()

  const examTypes = ref<ExamType[]>([])
  const isLoading = ref(false)

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

  return {
    examTypes,
    isLoading,
    fetchExamTypes,
  }
}
