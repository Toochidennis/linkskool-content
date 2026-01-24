export interface Lesson {
  lessonId?: number | string
  localId?: string
  courseId: number
  cohortId?: number
  programId?: number
  slug?: string
  displayOrder: number
  title: string
  description: string
  status?: 'draft' | 'published' | 'archived'
  goals: string // Rich text HTML
  objectives: string // Rich text HTML
  videoUrl: string
  recordedVideoUrl: string
  thumbnail?: string
  materialFile?: File | null // PDF only, max 5MB
  materialUrl?: string // URL from server
  writeupContent: string // Rich text HTML content (replaces writeupFiles)
  assignmentInstructions: string
  assignmentFile?: File | null
  assignmentUrl?: string // URL from server
  quiz?: File | null
  hasQuiz?: boolean
  certificateFile?: File | null // SVG only for final lesson, max 5MB
  certificateUrl?: string // URL from server
  isFinalLesson: boolean
  lessonDate: string // YYYY-MM-DD
  assignmentDueDate: string // YYYY-MM-DD
  authorName?: string
  authorId?: number
  createdAt?: string
  updatedAt?: string
}

export interface ProgramCourseLesson {
  courseId: number
  slug: string
  title: string
  description: string
  lessons?: Lesson[]
}

// Note: LessonResponse not exported to avoid conflicts; use generic apiResponse patterns
