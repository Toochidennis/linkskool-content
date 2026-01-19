  export interface Program {
  id: number;
  slug: string;
  name: string;
  shortname: string;
  expanded?: boolean;
  courseCount: number;
  description?: string;
  sponsor?: string;
  imageUrl?: string;
  status: 'published' | 'draft' | 'archived';
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateProgramPayload {
  name: string;
  shortname: string;
  description: string;
  sponsor?: string;
  status: 'published' | 'draft' | 'archived';
  banner_image?: File;
}
