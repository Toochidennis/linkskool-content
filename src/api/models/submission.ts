export type SubmissionType = 'upload' | 'text' | 'link' | 'mixed' | ''

export interface SubmissionFile {
  fileName: string
  oldFileName: string
  file: string
  type: string
}

export interface SubmissionProfile {
  id: number
  firstName: string | null
  lastName: string | null
  fullName: string | null
}

export interface LessonSubmission {
  id: number
  lessonId: number
  cohortId: number | string | null
  profile: SubmissionProfile
  submission: {
    type: SubmissionType | string | null
    textContent: string | null
    linkUrl: string | null
    files: SubmissionFile[] | null
    quizScore: number | null
  }
  grading: {
    assignedScore: number | null
    remark: string | null
    comment: string | null
    gradedBy: number | null
    gradedAt: string | null
  }
  notification: {
    notifiedBy: number | null
    notifiedAt: string | null
  }
  createdAt: string | null
  updatedAt: string | null
}

export interface LessonSubmissionsMeta {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

export interface LessonSubmissionsPage {
  data: LessonSubmission[]
  meta: LessonSubmissionsMeta
}

export interface SubmissionAutoGradeResult {
  submissionId: number
  profileId: number
  studentName: string | null
  lessonId: number
  assignmentUrl: string | null
  submitted: {
    submissionType: string | null
    textContent: string | null
    linkUrl: string | null
    files: SubmissionFile[] | null
  }
  score: number
  comment: string
  status: string
}

export interface SubmissionAutoGradeSummary {
  total: number
  processed: number
  failed: number
}

export interface SubmissionAutoGradeResponse {
  batchId: string | number
  results: SubmissionAutoGradeResult[]
  summary: SubmissionAutoGradeSummary
}

export interface SubmissionAutoGradePayload {
  submissionIds: number[]
  gradedBy: number | null
}

export interface SubmissionGradeResultPayload {
  submissionId: number
  score: number
  comment: string
}

export interface SubmissionBulkGradePayload {
  gradedBy: number | null
  notifyStudent?: boolean
  results: SubmissionGradeResultPayload[]
}

export interface SubmissionGradePayload {
  assignedScore: number | null
  comment: string
  gradedBy: number | null
  notifyStudent: boolean
}

export interface SubmissionBulkNotifyPayload {
  submissionIds: number[]
  gradedBy: number | null
}
