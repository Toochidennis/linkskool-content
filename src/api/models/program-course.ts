export interface ProgramCourse {
  id: number;
  slug?: string;
  programId?: number;
  courseName?: string;
  title?: string;
  slogan?: string;
  description?: string;
  category?: string;
  image_url?: string;
  startDate?: string;
  endDate?: string;
  zoomUrl?: string;
  startTime?: string;
  endTime?: string;
  videoCount?: number;
  ageGroups?: string[];
  status?: 'published' | 'draft' | 'archived';
  createdAt?: string;
}

export interface CreateProgramCoursePayload {
  title: string;
  slogan?: string;
  description?: string;
  category?: string;
  image?: File;
  start_date?: string;
  end_date?: string;
  start_time?: string;
  end_time?: string;
  zoom_url?: string;
  age_groups?: string[];
  status?: 'published' | 'draft' | 'archived';
  program_id?: number;
}
