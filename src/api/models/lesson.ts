export interface LessonFile {
  file_name: string
  old_file_name?: string
  type: string
  file: string // base64
}

export interface LessonSchedule {
  startDate: string // YYYY-MM-DD
  isFinalLesson: boolean
}

export interface LessonAssignment {
  instructions: string
  file: LessonFile | null
  dueDate: string // YYYY-MM-DD
}

export interface LessonQuiz {
  jsonFile: LessonFile | null
  uploadedAt?: string
}

export interface Lesson {
  lessonId?: number | string
  localId?: string
  courseId: number
  displayOrder: number
  title: string
  description: string
  goal: string // Rich text HTML
  objectives: string // Rich text HTML
  videoUrl: string
  recordedVideoUrl: string
  materialFile: LessonFile | null // PDF only, max 5MB
  writeupContent: string // Rich text HTML content (replaces writeupFiles)
  assignment: LessonAssignment
  quiz: LessonQuiz
  certificateFile?: LessonFile // SVG only for final lesson, max 5MB
  schedule: LessonSchedule
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
