import { ref, computed } from 'vue'
import type { Lesson } from '@/api/models/lesson'
import { programService } from '@/api/services/serviceFactory'

interface QuizQuestion {
  question_text: string
  answer: number
  [key: string]: string | number
}

export const useLesson = () => {
  const lessons = ref<Lesson[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const fetchLessons = async (courseId: number) => {
    loading.value = true
    error.value = null
    try {
      const response = await programService.get(`course/${courseId}`)
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

  /**
   * Validate quiz JSON to ensure no empty keys and flexible option count
   */
  const validateQuizJson = (jsonContent: string): QuizQuestion[] => {
    try {
      const questions = JSON.parse(jsonContent)
      const quizArray = Array.isArray(questions) ? questions : [questions]

      return quizArray.filter((q) => {
        // Check required fields
        if (!q.question_text || String(q.question_text).trim() === '') return false
        if (q.answer === undefined || q.answer === null) return false

        // Find all option fields (option_1_text, option_2_text, etc.)
        const optionFields = Object.keys(q).filter((key) => key.match(/^option_\d+_text$/))

        // Must have at least one option and all options must be non-empty
        if (optionFields.length === 0) return false

        return optionFields.every((field) => q[field] && String(q[field]).trim() !== '')
      })
    } catch (err) {
      console.error('Invalid quiz JSON:', err)
      return []
    }
  }

  /**
   * Package lesson data as FormData for multipart file upload
   */
  const packageLesson = (
    lesson: Lesson,
    programId: number,
    courseId: number,
    cohortId: number,
    authorName: string,
    authorId: number,
  ): FormData => {
    const formData = new FormData()

    // Append basic fields
    formData.append('program_id', String(programId))
    formData.append('course_id', String(courseId))
    formData.append('cohort_id', String(cohortId))
    formData.append('title', lesson.title || '')
    formData.append('description', lesson.description || '')
    formData.append('goals', lesson.goal || '')
    formData.append('objectives', lesson.objectives || '')
    formData.append('video_url', lesson.videoUrl || '')
    formData.append('recorded_video_url', lesson.recordedVideoUrl || '')
    formData.append('display_order', String(lesson.displayOrder || 1))
    formData.append('write_up_content', lesson.writeupContent || '')
    formData.append('assignment_instructions', lesson.assignment?.instructions || '')
    formData.append('assignment_due_date', lesson.assignment?.dueDate || '')
    formData.append('is_final_lesson', String(lesson.schedule?.isFinalLesson || false))
    formData.append('author_name', authorName)
    formData.append('author_id', String(authorId))
    formData.append(
      'lesson_date',
      lesson.schedule?.startDate || new Date().toISOString().split('T')[0] || '',
    )

    // Helper function to convert base64 to Blob
    const base64ToBlob = (base64: string, mimeType: string): Blob => {
      const byteCharacters = atob(base64)
      const byteNumbers = new Array(byteCharacters.length)
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i)
      }
      const byteArray = new Uint8Array(byteNumbers)
      return new Blob([byteArray], { type: mimeType })
    }

    // Append material file if present
    if (lesson.materialFile?.file) {
      const blob = base64ToBlob(lesson.materialFile.file, 'application/pdf')
      formData.append('material', blob, lesson.materialFile.file_name)
    }

    // Append assignment file if present
    if (lesson.assignment?.file?.file) {
      const blob = base64ToBlob(lesson.assignment.file.file, 'application/pdf')
      formData.append('assignment', blob, lesson.assignment.file.file_name)
    }

    // Append certificate if it's a final lesson
    if (lesson.schedule?.isFinalLesson && lesson.certificateFile?.file) {
      const blob = base64ToBlob(lesson.certificateFile.file, 'image/svg+xml')
      formData.append('certificate', blob, lesson.certificateFile.file_name)
    }

    // Append quiz file if present
    if (lesson.quiz?.jsonFile?.file) {
      const blob = base64ToBlob(lesson.quiz.jsonFile.file, 'application/json')
      formData.append('quiz', blob, lesson.quiz.jsonFile.file_name)
    }

    return formData
  }

  const sendLesson = async (formData: FormData) => {
    loading.value = true
    error.value = null
    try {
      const response = await programService.post(
        'cohorts/lessons',
        formData as unknown as Record<string, unknown>,
      )
      if (response.success) {
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
      const response = await programService.post(
        `cohorts/lessons/{id}`,
        lesson as unknown as Record<string, unknown>,
      )
      if (response.success) {
        const index = lessons.value.findIndex((l) => l.lessonId === lesson.lessonId)
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
      const response = await programService.delete(`course/${courseId}/lesson/${lessonId}`)
      if (response.success) {
        lessons.value = lessons.value.filter((l) => l.lessonId !== lessonId)
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
    sendLesson,
    updateLesson,
    deleteLesson,
    packageLesson,
    validateQuizJson,
  }
}
