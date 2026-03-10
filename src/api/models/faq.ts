export interface Faq {
  id: number;
  question: string;
  answer: string;
  authorName?: string;
  authorId?: number;
  author_name?: string;
  author_id?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateFaqPayload {
  question: string;
  answer: string;
}
