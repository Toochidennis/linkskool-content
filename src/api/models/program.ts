import type { Course } from "./course";

export interface Program {
  id: number;
  name: string;
  shortname: string;
  expanded?: boolean;
  courses: Course[];
  isActive: number;
  displayOrder?: number;
  description?: string;
  sponsor?: string;
  bannerImage?: {
    fileName: string;
    filePath: string;
    fileSize: number;
  };
  isFree: boolean;
  trialType?: 'watches' | 'days';
  trialValue?: number;
  startDate?: string;
  endDate?: string;
  status: 'published' | 'draft' | 'archived';
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateProgramPayload {
  name: string;
  shortname: string;
  description: string;
  sponsor?: string;
  is_free: boolean;
  trial_type?: 'watches' | 'days';
  trial_value?: number;
  start_date?: string;
  end_date?: string;
  status: 'published' | 'draft' | 'archived';
  banner_image?: File;
}
