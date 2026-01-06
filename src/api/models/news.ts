export interface News {
  id: number;
  title: string;
  content: string;
  date_posted: string;
  categories: Category[];
  author_id: number;
  author_name: string;
  status: 'draft' | 'published' | 'archived';
  images: NewsImage[];
  created_at?: string;
  updated_at?: string;
}

export interface NewsImage {
  id: number;
  image_url: string;
  news_id: number;
}

export interface Category {
  id: number;
  name: string;
  created_at?: string;
  updated_at?: string;
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
}

export interface CreateCategoryPayload {
  name: string;
}
