export interface ProgramCourse {
  id: number;
  slug: string;
  programId: number;
  courseName?: string;
  title: string;
  slogan?: string;
  description?: string;
  category?: string;
  imageUrl: string;
  ageGroups?: string[];
  status?: 'published' | 'draft' | 'archived';
  createdAt?: string;
}

export interface CreateProgramCoursePayload {
  title: string;
  slogan?: string;
  description?: string;
  category?: string;
  image: File;
  age_groups?: string[];
  status: 'published' | 'draft' | 'archived';
  program_id: number;
}
