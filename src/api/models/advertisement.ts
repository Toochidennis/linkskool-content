export interface Advertisement {
  id: number;
  title: string;
  content: string;
  actionUrl: string;
  actionText: string;
  displayPosition: 'top' | 'bottom' | 'sidebar' | 'center';
  authorId: number;
  authorName: string;
  isSponsored: boolean;
  status: 'draft' | 'published' | 'archived';
  image: AdvertisementImage;
  createdAt?: string;
  updatedAt?: string;
}

export interface AdvertisementImage {
  fileName: string;
  oldFileName?: string;
  file?: string;
}

export interface CreateAdvertisementPayload {
  title: string;
  content: string;
  action_url: string;
  action_text: string;
  display_position?: 'top' | 'bottom' | 'sidebar' | 'center';
  author_id: number;
  author_name: string;
  is_sponsored: boolean;
  status: 'draft' | 'published' | 'archived';
  image: File;
}
