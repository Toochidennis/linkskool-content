import { ref } from 'vue'
import type { Lesson } from '@/api/models/lesson'
import type { QuizQuestion } from '@/api/models/quiz'
import { programService } from '@/api/services/serviceFactory'

export function useLesson() {
  const lessons = ref<Lesson[]>([])

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const transformLessonFromServer = (serverLesson: any): Lesson => {
    const zoomInfoRaw = serverLesson.zoomInfo || serverLesson.zoom_info || {}
    return {
      lessonId: serverLesson.id,
      programId: serverLesson.programId,
      courseId: serverLesson.courseId,
      cohortId: serverLesson.cohortId,
      slug: serverLesson.slug,
      title: serverLesson.title,
      description: serverLesson.description,
      status:
        (serverLesson.status ??
          serverLesson.lessonStatus ??
          serverLesson.lesson_status ??
          'draft') as 'draft' | 'published' | 'archived',
      goals: serverLesson.goals || '',
      objectives: serverLesson.objectives || '',
      videoUrl: serverLesson.videoUrl || '',
      recordedVideoUrl: serverLesson.recordedVideoUrl || '',
      thumbnail: serverLesson.thumbnail,
      displayOrder: serverLesson.displayOrder,
      writeupContent: serverLesson.writeupContent || '',
      assignmentInstructions: serverLesson.assignmentInstructions || '',
      assignmentDueDate: serverLesson.assignmentDueDate || '',
      isFinalLesson: serverLesson.isFinalLesson === 1,
      lessonDate: serverLesson.lessonDate,
      materialUrl: serverLesson.materialUrl,
      assignmentUrl: serverLesson.assignmentUrl,
      certificateUrl: serverLesson.certificateUrl,
      hasQuiz: serverLesson.hasQuiz,
      authorName: serverLesson.authorName,
      authorId: serverLesson.authorId,
      createdAt: serverLesson.createdAt,
      updatedAt: serverLesson.updatedAt,
      zoomInfo: {
        url: zoomInfoRaw.url || '',
        meetingId: zoomInfoRaw.meetingId || zoomInfoRaw.meeting_id || '',
        passcode: zoomInfoRaw.passcode || '',
        startTime: zoomInfoRaw.startTime || zoomInfoRaw.start_time || zoomInfoRaw.starttime || '',
        endTime: zoomInfoRaw.endTime || zoomInfoRaw.end_time || zoomInfoRaw.endtime || '',
      },
    }
  }

  const fetchLessons = async (cohortId: number) => {
    try {
      const response = await programService.get(`cohorts/${cohortId}/lessons`)

      if (response.success && response.data) {
        lessons.value = response.data.map(transformLessonFromServer)
      } else {
        lessons.value = []
      }
    } catch (error) {
      console.error('Error fetching lessons:', error)
      lessons.value = []
      throw error
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const transformQuizQuestionFromServer = (question: any): QuizQuestion => {
    const options = Array.isArray(question.options) ? question.options : []
    return {
      questionId: question.questionId ?? question.question_id,
      questionText: question.questionText ?? question.question_text ?? '',
      options: options.map((opt: any) => ({
        text: opt.text ?? '',
        optionFiles: opt.optionFiles || opt.option_files || [],
      })),
      correct: {
        text: question.correct?.text ?? '',
        order: question.correct?.order ?? 0,
      },
    }
  }

  const fetchQuizQuestions = async (lessonId: number | string) => {
    try {
      const response = await programService.get(`lessons/${lessonId}/quizzes`)
      if (response.success && response.data) {
        return response.data.map(transformQuizQuestionFromServer)
      }
      return []
    } catch (error) {
      console.error('Error fetching quiz questions:', error)
      throw error
    }
  }

  const saveQuizQuestion = async (
    lessonId: number | string,
    payload: Record<string, unknown>,
  ) => {
    try {
      return await programService.post(
        `lessons/${lessonId}/quizzes`,
        payload as Record<string, unknown>,
      )
    } catch (error) {
      console.error('Error saving quiz question:', error)
      throw error
    }
  }

  const deleteQuiz = async (quizId: number) => {
    try {
      return await programService.delete(
        `lessons/quizzes/${quizId}`,
      )
    } catch (error) {
      console.error('Error deleting quiz question:', error)
      throw error
    }
  }

  const updateStatus = async (lessonId: number, status: string) => {
    try {
      const response = await programService.put(
        `cohorts/lessons/${lessonId}/status`,
        { status } as Record<string, unknown>,
      )

      return response
    } catch (error) {
      console.error('Error updating status:', error)
      throw error
    }
  }

  const packageLesson = (
    lesson: Lesson,
    programId: number,
    courseId: number,
    authorName: string,
    authorId: number,
  ): FormData => {
    const formData = new FormData()

    // Add lesson data
    formData.append('program_id', programId.toString())
    formData.append('course_id', courseId.toString())
    formData.append('author_name', authorName)
    formData.append('author_id', authorId.toString())
    formData.append('title', lesson.title || '')
    formData.append('description', lesson.description || '')
    formData.append('status', (lesson.status || 'draft').toString().toLowerCase())
    formData.append('display_order', lesson.displayOrder?.toString() || '1')
    formData.append('goals', lesson.goals || '')
    formData.append('objectives', lesson.objectives || '')
    formData.append('video_url', lesson.videoUrl || '')
    formData.append('recorded_video_url', lesson.recordedVideoUrl || '')
    formData.append('writeup_content', lesson.writeupContent || '')
    formData.append('assignment_instructions', lesson.assignmentInstructions || '')
    formData.append('assignment_due_date', lesson.assignmentDueDate || '')
    formData.append('lesson_date', lesson.lessonDate || '')
    formData.append('is_final_lesson', lesson.isFinalLesson ? '1' : '0')
    const zoomInfo = lesson.zoomInfo || {}
    formData.append('zoom_info[url]', zoomInfo.url || '')
    formData.append('zoom_info[meeting_id]', zoomInfo.meetingId || '')
    formData.append('zoom_info[passcode]', zoomInfo.passcode || '')
    formData.append('zoom_info[start_time]', zoomInfo.startTime || '')
    formData.append('zoom_info[end_time]', zoomInfo.endTime || '')

    // Add files - with old URL tracking for deletion
    if (lesson.materialFile) {
      formData.append('material', lesson.materialFile)

      // If a new material file is uploaded and an old URL exists, send it for deletion
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const oldMaterialUrl = (lesson as any).oldMaterialUrl
      if (oldMaterialUrl) {
        formData.append('old_material_url', oldMaterialUrl)
      }
    }

    if (lesson.assignmentFile) {
      formData.append('assignment', lesson.assignmentFile)

      // If a new assignment file is uploaded and an old URL exists, send it for deletion
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const oldAssignmentUrl = (lesson as any).oldAssignmentUrl
      if (oldAssignmentUrl) {
        formData.append('old_assignment_url', oldAssignmentUrl)
      }
    }

    if (lesson.certificateFile) {
      formData.append('certificate', lesson.certificateFile)

      // If a new certificate file is uploaded and an old URL exists, send it for deletion
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const oldCertificateUrl = (lesson as any).oldCertificateUrl
      if (oldCertificateUrl) {
        formData.append('old_certificate_url', oldCertificateUrl)
      }
    }

    return formData
  }

  const saveLesson = async (cohortId: number, formData: FormData) => {
    try {
      const response = await programService.post(
        `cohorts/${cohortId}/lessons`,
        formData as unknown as Record<string, unknown>,
      )

      return response
    } catch (error) {
      console.error('Error sending lesson:', error)
      throw error
    }
  }

  const updateLesson = async (lessonId: number, cohortId: number, formData: FormData) => {
    try {
      const response = await programService.post(
        `cohorts/${cohortId}/lessons/${lessonId}`,
        formData as unknown as Record<string, unknown>,
      )

      return response
    } catch (error) {
      console.error('Error sending lesson:', error)
      throw error
    }
  }

  const deleteLesson = async (lessonId: number) => {
    try {
      const response = programService.delete(
        `cohorts/lessons/${lessonId}`,
      )

      return response
    } catch (error) {
      console.error('Error deleting lesson:', error)
      throw error
    }
  }

  return {
    lessons,
    fetchLessons,
    fetchQuizQuestions,
    saveQuizQuestion,
    deleteQuiz,
    updateStatus,
    packageLesson,
    saveLesson,
    updateLesson,
    deleteLesson,
  }
}
