export interface News {
  id: number;
  title: string;
  content: string;
  datePosted: string;
  categories: Category[];
  authorId: number;
  authorName: string;
  status: 'draft' | 'published' | 'archived';
  images: NewsImage[];
  createdAt?: string;
  updatedAt?: string;
}

export interface NewsImage {
  fileName: string;
  oldFileName?: string;
  file?: string;
}

export interface OldNewsImage {
  file_name: string;
  old_file_name: string;
  file: string | File;
  is_deleted: boolean;
}

export interface Category {
  id: number;
  name: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateNewsPayload {
  title: string;
  content: string;
  date_posted?: string;
  category_ids: number[];
  author_id: number;
  author_name: string;
  status: 'draft' | 'published' | 'archived';
  images: File[];
  old_images?: Array<{
    file_name: string;
    old_file_name: string;
    file: string | File;
    is_deleted: boolean;
  }>;
}

export interface CreateCategoryPayload {
  name: string;
}
