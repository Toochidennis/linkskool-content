export interface LearningCourse {
  id: number;
  slug: string;
  courseName?: string;
  title: string;
  slogan?: string;
  description?: string;
  category?: string;
  imageUrl: string;
  createdAt?: string;
}

export interface CreateLearningCoursePayload {
  title: string;
  slogan?: string;
  description?: string;
  category?: string;
  image: File;
}
