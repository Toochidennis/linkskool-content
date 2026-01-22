export interface Program {
  id: number;
  slug: string;
  name: string;
  shortname: string;
  expanded?: boolean;
  courseCount?: number;
  description?: string;
  sponsor?: string;
  imageUrl?: string;
  status: 'published' | 'draft' | 'archived';
  createdAt?: string;
  updatedAt?: string;
  ageGroups?: Array<{ min: number; max: number | null }>;
  courses?: Array<{ id: number; title: string }>;
}

export interface CreateProgramPayload {
  name: string;
  shortname: string;
  description: string;
  sponsor?: string;
  status: 'published' | 'draft' | 'archived';
  banner_image?: File;
}
