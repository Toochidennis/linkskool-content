export interface LessonFile {
  file_name: string;
  old_file_name?: string;
  type: string;
  file: string; // base64
}

export interface LessonSchedule {
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  isFinalLesson: boolean;
}

export interface LessonAssignment {
  instructions: string;
  files: LessonFile[];
  schedule: LessonSchedule;
}

export interface LessonQuiz {
  jsonFile: LessonFile | null;
  uploadedAt?: string;
}

export interface Lesson {
  lessonId?: number | string;
  localId?: string;
  courseId: number;
  title: string;
  description: string;
  goal: string; // Rich text HTML
  objectives: string; // Rich text HTML
  videoUrl: string;
  recordedVideoUrl: string;
  materialFiles: LessonFile[]; // PDFs only, max 10MB
  writeupContent: string; // Rich text HTML content (replaces writeupFiles)
  assignment: LessonAssignment;
  quiz: LessonQuiz;
  certificateFile?: LessonFile; // SVG only for final lesson, max 10MB
  schedule: LessonSchedule;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProgramCourseLesson {
  courseId: number;
  slug: string;
  title: string;
  description: string;
  lessons?: Lesson[];
}

// Note: LessonResponse not exported to avoid conflicts; use generic apiResponse patterns
