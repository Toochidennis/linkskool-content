import { ref } from 'vue'
import type { Lesson } from '@/api/models/lesson'
import type { QuizQuestion } from '@/api/models/quiz'
import type {
  LessonSubmission,
  SubmissionAutoGradePayload,
  SubmissionAutoGradeResponse,
  SubmissionBulkGradePayload,
  LessonSubmissionsMeta,
  LessonSubmissionsPage,
  SubmissionBulkNotifyPayload,
} from '@/api/models/submission'
import { lessonSubmissionService, programService } from '@/api/services/serviceFactory'

export function useLesson() {
  const lessons = ref<Lesson[]>([])
  const normalizeAssignmentSubmissionType = (
    value: unknown,
  ): Lesson['assignmentSubmissionType'] => {
    const normalized = String(value || '').toLowerCase()
    if (normalized === 'upload' || normalized === 'text' || normalized === 'link' || normalized === 'mixed') {
      return normalized
    }
    return ''
  }

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
      assignmentSubmissionType: normalizeAssignmentSubmissionType(
        serverLesson.assignmentSubmissionType || serverLesson.assignment_submission_type,
      ),
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const transformSubmissionFromServer = (row: any): LessonSubmission => {
    const files = Array.isArray(row?.submission?.files)
      ? row.submission.files
      : Array.isArray(row?.submission?.file)
        ? row.submission.file
        : []

    return {
      id: Number(row?.id || 0),
      lessonId: Number(row?.lesson_id || row?.lessonId || 0),
      cohortId: row?.cohort_id ?? row?.cohortId ?? null,
      profile: {
        id: Number(row?.profile?.id || row?.profile_id || 0),
        firstName: row?.profile?.first_name ?? row?.profile?.firstName ?? row?.first_name ?? null,
        lastName: row?.profile?.last_name ?? row?.profile?.lastName ?? row?.last_name ?? null,
        fullName: row?.profile?.full_name ?? row?.profile?.fullName ?? null,
      },
      submission: {
        type: row?.submission?.type ?? row?.submission_type ?? null,
        textContent: row?.submission?.text_content ?? row?.submission?.textContent ?? row?.text_content ?? null,
        linkUrl: row?.submission?.link_url ?? row?.submission?.linkUrl ?? row?.link_url ?? null,
        files: files.length
          ? files.map((file: any) => ({
            fileName: file?.file_name || file?.fileName || '',
            oldFileName: file?.old_file_name || file?.oldFileName || '',
            file: file?.file || '',
            type: file?.type || '',
          }))
          : null,
        quizScore: row?.submission?.quiz_score ?? row?.submission?.quizScore ?? row?.quiz_score ?? null,
      },
      grading: {
        assignedScore: row?.grading?.assigned_score ?? row?.grading?.assignedScore ?? row?.assigned_score ?? null,
        remark: row?.grading?.remark ?? row?.remark ?? null,
        comment: row?.grading?.comment ?? row?.comment ?? null,
        gradedBy: row?.grading?.graded_by ?? row?.grading?.gradedBy ?? row?.graded_by ?? null,
        gradedAt: row?.grading?.graded_at ?? row?.grading?.gradedAt ?? row?.graded_at ?? null,
      },
      notification: {
        notifiedBy:
          row?.notification?.notified_by ??
          row?.notification?.notifiedBy ??
          row?.notified_by ??
          null,
        notifiedAt:
          row?.notification?.notified_at ??
          row?.notification?.notifiedAt ??
          row?.notified_at ??
          null,
      },
      createdAt: row?.created_at ?? row?.createdAt ?? null,
      updatedAt: row?.updated_at ?? row?.updatedAt ?? null,
    }
  }

  const fetchLessonSubmissions = async (
    lessonId: number | string,
    cohortId?: number | string | null,
  ): Promise<LessonSubmission[]> => {
    const candidatePaths: string[] = []
    if (cohortId) {
      candidatePaths.push(`cohorts/${cohortId}/lessons/${lessonId}/submissions`)
    }
    candidatePaths.push(`lessons/${lessonId}/submissions`)
    candidatePaths.push(`cohorts/lessons/${lessonId}/submissions`)

    let lastError: unknown = null
    for (const path of candidatePaths) {
      try {
        const response = await programService.get(path)
        const list = Array.isArray(response?.data) ? response.data : []
        return list.map(transformSubmissionFromServer)
      } catch (error) {
        lastError = error
      }
    }

    if (lastError) throw lastError
    return []
  }

  const fetchLessonAssignments = async (
    lessonId: number | string,
    page = 1,
    limit = 20,
  ): Promise<LessonSubmissionsPage> => {
    try {
      const response = await lessonSubmissionService.get(
        `${lessonId}/submissions`,
        { page, limit },
      )
      const list = Array.isArray(response?.data?.data) ? response.data.data : []
      const metaRaw = response?.data?.meta || {}
      const meta: LessonSubmissionsMeta = {
        page: Number(metaRaw.page || page),
        limit: Number(metaRaw.limit || limit),
        total: Number(metaRaw.total || 0),
        totalPages: Number(metaRaw.totalPages || 0),
        hasNextPage: Boolean(metaRaw.hasNextPage),
        hasPrevPage: Boolean(metaRaw.hasPrevPage),
      }
      return {
        data: list.map(transformSubmissionFromServer),
        meta,
      }
    } catch (error) {
      console.error('Error fetching lesson assignments:', error)
      throw error
    }
  }

  const gradeLessonSubmission = async (payload: SubmissionBulkGradePayload) => {
    try {
      return await lessonSubmissionService.post(
        'submissions/grade',
        payload as unknown as Record<string, unknown>,
      )
    } catch (error) {
      console.error('Error grading lesson submission:', error)
      throw error
    }
  }

  const autoGradeLessonSubmissions = async (
    payload: SubmissionAutoGradePayload,
  ): Promise<SubmissionAutoGradeResponse> => {
    try {
      const response = await lessonSubmissionService.post<SubmissionAutoGradeResponse>(
        'submissions/auto-grade',
        payload as unknown as Record<string, unknown>,
      )
      return response?.data as SubmissionAutoGradeResponse
    } catch (error) {
      console.error('Error auto-grading lesson submissions:', error)
      throw error
    }
  }

  const notifyLessonSubmissions = async (payload: SubmissionBulkNotifyPayload) => {
    const data: Record<string, unknown> = {
      submissionIds: payload.submissionIds,
      gradedBy: payload.gradedBy,
    }

    try {
      return await programService.post('submissions/notify', data)
    } catch (error) {
      console.error('Error notifying lesson submissions:', error)
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
    formData.append('assignment_submission_type', lesson.assignmentSubmissionType || '')
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
    fetchLessonSubmissions,
    fetchLessonAssignments,
    autoGradeLessonSubmissions,
    gradeLessonSubmission,
    notifyLessonSubmissions,
    updateStatus,
    packageLesson,
    saveLesson,
    updateLesson,
    deleteLesson,
  }
}
