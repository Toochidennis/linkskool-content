import { ref, computed } from 'vue'
import type { Lesson } from '@/api/models/lesson'
import { lessonService } from '@/api/services/serviceFactory'

export const useLesson = () => {
  const lessons = ref<Lesson[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const fetchLessons = async (courseId: number) => {
    loading.value = true
    error.value = null
    try {
      const response = await lessonService.get(`course/${courseId}`)
      if (response.success && response.data) {
        lessons.value = Array.isArray(response.data) ? response.data : [response.data]
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch lessons'
      console.error('Error fetching lessons:', err)
    } finally {
      loading.value = false
    }
  }

  const saveLessons = async (courseId: number, lessonsData: Lesson[]) => {
    loading.value = true
    error.value = null
    try {
      const response = await lessonService.post(`course/${courseId}`, {
        lessons: lessonsData
      })
      if (response.success) {
        lessons.value = lessonsData
        return response
      }
      throw new Error(response.message || 'Failed to save lessons')
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to save lessons'
      console.error('Error saving lessons:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateLesson = async (courseId: number, lesson: Lesson) => {
    loading.value = true
    error.value = null
    try {
      const response = await lessonService.put(`course/${courseId}`, lesson as unknown as Record<string, unknown>)
      if (response.success) {
        const index = lessons.value.findIndex(l => l.lessonId === lesson.lessonId)
        if (index !== -1) {
          lessons.value[index] = lesson
        }
        return response
      }
      throw new Error(response.message || 'Failed to update lesson')
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to update lesson'
      console.error('Error updating lesson:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteLesson = async (courseId: number, lessonId: number | string) => {
    loading.value = true
    error.value = null
    try {
      const response = await lessonService.delete(`course/${courseId}/lesson/${lessonId}`)
      if (response.success) {
        lessons.value = lessons.value.filter(l => l.lessonId !== lessonId)
        return response
      }
      throw new Error(response.message || 'Failed to delete lesson')
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to delete lesson'
      console.error('Error deleting lesson:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    lessons,
    loading: computed(() => loading.value),
    error: computed(() => error.value),
    fetchLessons,
    saveLessons,
    updateLesson,
    deleteLesson
  }
}
