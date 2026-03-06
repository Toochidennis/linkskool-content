import { newsService } from '../api/services/serviceFactory';
import type { News, Category, CreateNewsPayload, CreateCategoryPayload } from '../api/models';


export const useAnnouncement = () => {

  /**
   * Fetch all categories
   */
  const fetchCategories = async () => {
    try {
      const response = await newsService.get<Category[]>('categories');
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
  const createCategory = async (payload: CreateCategoryPayload) => {
    try {
      const response = await newsService.post('categories', payload as unknown as Record<string, unknown>);
      return response;
    } catch (error: any) {
      throw {
        success: false,
        message: error.response?.data?.message || 'Failed to create category',
        error
      };
    }
  }

  const fetchNews = async () => {
    try {
      const response = await newsService.get<News[]>('admin');
      return response.data;
    } catch (error: any) {
      throw {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch news',
        error
      };
    }
  }

  const fetchNewsById = async (id: number) => {
    try {
      const response = await newsService.get<News>(id.toString());
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
   * Create new news with multipart/form-data
   * @param payload - News data including raw image files
   */
  const createNews = async (payload: CreateNewsPayload) => {
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

      if (payload.deadline) {
        formData.append('deadline', payload.deadline);
      }

      formData.append('notify', payload.notify ? '1' : '0');

      payload.images.forEach((image) => {
        formData.append('images[]', image, image.name);
      });

      const response = await newsService.post(undefined, formData as unknown as Record<string, unknown>);

      return response;
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
   * @param payload - Complete news data including all fields, raw image files, and old_images array for tracking changes
   */
  const updateNews = async (id: number, payload: CreateNewsPayload) => {
    try {
      const formData = new FormData();

      // Always send all required fields
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

      if (payload.deadline) {
        formData.append('deadline', payload.deadline);
      }

      formData.append('notify', payload.notify ? '1' : '0');

      // Append old_images array if provided - tracks existing images and their deletion status
      if (payload.old_images && payload.old_images.length > 0) {
        payload.old_images.forEach((oldImage, index) => {
          formData.append(`old_images[${index}][file_name]`, oldImage.file_name);
          formData.append(`old_images[${index}][old_file_name]`, oldImage.old_file_name);
          formData.append(`old_images[${index}][is_deleted]`, oldImage.is_deleted.toString());

          // Append file data (only if it's a File object, not a string/path)
          if (oldImage.file instanceof File) {
            formData.append(`old_images[${index}][file]`, oldImage.file);
          } else if (typeof oldImage.file === 'string') {
            // If it's a base64 string or data URL, we need to convert it to a File
            formData.append(`old_images[${index}][file]`, oldImage.file);
          }
        });
      }

      // Append new images
      if (payload.images && payload.images.length > 0) {
        payload.images.forEach((image) => {
          formData.append('images[]', image, image.name);
        });
      }

      formData.append('_method', 'PUT');

      const response = await newsService.post(id.toString(), formData as unknown as Record<string, unknown>);

      return response;
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
  const deleteNews = async (id: number) => {
    try {
      const response = await newsService.delete(id.toString());
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
  const updateNewsStatus = async (id: number, status: 'draft' | 'published' | 'archived') => {
    try {
      const response = await newsService.put(`${id}/status`, { status });
      return response;
    } catch (error: any) {
      throw {
        success: false,
        message: error.response?.data?.message || 'Failed to update news status',
        error
      };
    }
  }

  const notifyNews = async (id: number, notifiedBy: number) => {
    try {
      const response = await newsService.put(`${id}/notify`, {
        notified_by: notifiedBy
      });
      return response;
    } catch (error: any) {
      throw {
        success: false,
        message: error.response?.data?.message || 'Failed to notify news',
        error
      };
    }
  }


  return {
    fetchCategories,
    createCategory,
    fetchNews,
    fetchNewsById,
    createNews,
    updateNews,
    deleteNews,
    updateNewsStatus,
    notifyNews
  }
}
