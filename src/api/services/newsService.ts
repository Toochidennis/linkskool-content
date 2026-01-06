import { BaseService } from './baseService';
import { client } from '../client';
import type { News, Category, CreateNewsPayload, CreateCategoryPayload, ApiResponse } from '../models';

class NewsService extends BaseService<News> {
  constructor() {
    super('news');
  }

  /**
   * Fetch all categories
   */
  async fetchCategories(): Promise<ApiResponse<Category[]>> {
    try {
      const response = await client.get<ApiResponse<Category[]>>('/categories');
      return response.data;
    } catch (error: any) {
      throw {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch categories',
        error
      };
    }
  }

  /**
   * Create a new category
   * @param payload - Category data with name only
   */
  async createCategory(payload: CreateCategoryPayload): Promise<ApiResponse<Category>> {
    try {
      const response = await client.post<ApiResponse<Category>>('/categories', payload);
      return response.data;
    } catch (error: any) {
      throw {
        success: false,
        message: error.response?.data?.message || 'Failed to create category',
        error
      };
    }
  }

  /**
   * Fetch all news
   */
  async fetchNews(): Promise<ApiResponse<News[]>> {
    try {
      const response = await this.get();
      return response.data;
    } catch (error: any) {
      throw {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch news',
        error
      };
    }
  }

  /**
   * Fetch news by ID
   */
  async fetchNewsById(id: number): Promise<ApiResponse<News>> {
    try {
      const response = await this.get(id.toString());
      return response;
    } catch (error: any) {
      throw {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch news',
        error
      };
    }
  }

  /**
   * Create new news with multipart/form-data
   * @param payload - News data including raw image files
   */
  async createNews(payload: CreateNewsPayload): Promise<ApiResponse<News>> {
    try {
      const formData = new FormData();

      formData.append('title', payload.title);
      formData.append('content', payload.content);

      // Append category IDs as array
      payload.category_ids.forEach((id, index) => {
        formData.append(`category_ids[${index}]`, id.toString());
      });

      formData.append('author_id', payload.author_id.toString());
      formData.append('author_name', payload.author_name);
      formData.append('status', payload.status);

      if (payload.date_posted) {
        formData.append('date_posted', payload.date_posted);
      }

      // Append images
      payload.images.forEach((image, index) => {
        formData.append(`images[${index}]`, image);
      });

      const response = await client.post<ApiResponse<News>>('/news',formData);

      return response.data;
    } catch (error: any) {
      throw {
        success: false,
        message: error.response?.data?.message || 'Failed to create news',
        error
      };
    }
  }

  /**
   * Update existing news with multipart/form-data
   * @param id - News ID
   * @param payload - News data including raw image files
   */
  async updateNews(id: number, payload: Partial<CreateNewsPayload>): Promise<ApiResponse<News>> {
    try {
      const formData = new FormData();

      if (payload.title) formData.append('title', payload.title);
      if (payload.content) formData.append('content', payload.content);

      // Append category IDs as array if provided
      if (payload.category_ids && payload.category_ids.length > 0) {
        payload.category_ids.forEach((id, index) => {
          formData.append(`category_ids[${index}]`, id.toString());
        });
      }

      if (payload.author_id) formData.append('author_id', payload.author_id.toString());
      if (payload.author_name) formData.append('author_name', payload.author_name);
      if (payload.status) formData.append('status', payload.status);
      if (payload.date_posted) formData.append('date_posted', payload.date_posted);

      // Append images if provided
      if (payload.images && payload.images.length > 0) {
        payload.images.forEach((image, index) => {
          formData.append(`images[${index}]`, image);
        });
      }

      const response = await client.post<ApiResponse<News>>( `/news/${id}`, formData);

      return response.data;
    } catch (error: any) {
      throw {
        success: false,
        message: error.response?.data?.message || 'Failed to update news',
        error
      };
    }
  }

  /**
   * Delete news
   * @param id - News ID
   */
  async deleteNews(id: number): Promise<ApiResponse<void>> {
    try {
      const response = await this.delete(id.toString());
      return response;
    } catch (error: any) {
      throw {
        success: false,
        message: error.response?.data?.message || 'Failed to delete news',
        error
      };
    }
  }

  /**
   * Update news status (publish/archive)
   * @param id - News ID
   * @param status - New status
   */
  async updateNewsStatus(id: number, status: 'draft' | 'published' | 'archived'): Promise<ApiResponse<News>> {
    try {
      const response = await client.put<ApiResponse<News>>(
        `/news/${id}/status`,
        { status }
      );
      return response.data;
    } catch (error: any) {
      throw {
        success: false,
        message: error.response?.data?.message || 'Failed to update news status',
        error
      };
    }
  }
}

export const newsService = new NewsService();
