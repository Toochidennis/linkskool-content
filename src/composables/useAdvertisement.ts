import { advertisementService } from "@/api/services/serviceFactory";
import type { Advertisement, CreateAdvertisementPayload } from '@/api/models';

export const useAdvertisement = () => {
  /**
   * Fetch all advertisements
   */
  const fetchAds = async () => {
    try {
      const response = await advertisementService.get<Advertisement[]>();
      return response.data;
    } catch (error: any) {
      throw {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch advertisements',
        error
      };
    }
  };

  /**
   * Fetch advertisement by ID
   * @param id - Advertisement ID
   */
  const fetchAdById = async (id: number) => {
    try {
      const response = await advertisementService.get<Advertisement>(id.toString());
      return response.data;
    } catch (error: any) {
      throw {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch advertisement',
        error
      };
    }
  };

  /**
   * Create new advertisement with multipart/form-data
   * @param payload - Advertisement data including raw image file
   */
  const createAd = async (payload: CreateAdvertisementPayload) => {
    try {
      const formData = new FormData();

      formData.append('title', payload.title);
      formData.append('content', payload.content);
      formData.append('action_url', payload.action_url);
      formData.append('action_text', payload.action_text);
      formData.append('author_id', payload.author_id.toString());
      formData.append('author_name', payload.author_name);
      formData.append('is_sponsored', payload.is_sponsored ? '1' : '0');
      formData.append('status', payload.status);

      if (payload.display_position) {
        formData.append('display_position', payload.display_position);
      }

      // Append image file - ensure it's a valid File object
      if (payload.image instanceof File) {
        formData.append('image', payload.image);
      } else {
        throw new Error('Invalid image file');
      }

      const response = await advertisementService.post(undefined, formData as unknown as Record<string, unknown>);

      return response;
    } catch (error: any) {
      throw {
        success: false,
        message: error.response?.data?.message || 'Failed to create advertisement',
        error
      };
    }
  };

  /**
   * Update existing advertisement with multipart/form-data
   * @param id - Advertisement ID
   * @param payload - Advertisement data including raw image file (optional)
   */
  const updateAd = async (id: number, payload: Record<string, any>) => {
    try {
      console.log('Updating advertisement with ID:', id);
      // Log FormData contents for debugging
      for (const pair of payload.entries()) {
        console.log(pair[0], pair[1]);
      }

      const response = await advertisementService.post(id.toString(), payload as unknown as Record<string, unknown>);

      return response;
    } catch (error: any) {
      throw {
        success: false,
        message: error.response?.data?.message || 'Failed to update advertisement',
        error
      };
    }
  };

  /**
   * Delete advertisement
   * @param id - Advertisement ID
   */
  const deleteAd = async (id: number) => {
    try {
      const response = await advertisementService.delete(id.toString());
      return response;
    } catch (error: any) {
      throw {
        success: false,
        message: error.response?.data?.message || 'Failed to delete advertisement',
        error
      };
    }
  };

  /**
   * Update advertisement status (publish/archive)
   * @param id - Advertisement ID
   * @param status - New status
   */
  const updateAdStatus = async (id: number, status: 'draft' | 'published' | 'archived') => {
    try {
      const response = await advertisementService.put(`${id}/status`, { status });
      return response;
    } catch (error: any) {
      throw {
        success: false,
        message: error.response?.data?.message || 'Failed to update advertisement status',
        error
      };
    }
  };

  /**
   * Delete an image from an advertisement
   * @param id - Advertisement ID
   * @param fileName - Image file name to delete
   */
  const deleteAdImage = async (id: number, fileName: string) => {
    try {
      const response = await advertisementService.delete(`${id}/images`, { fileName });
      return response;
    } catch (error: any) {
      throw {
        success: false,
        message: error.response?.data?.message || 'Failed to delete advertisement image',
        error
      };
    }
  };

  return {
    fetchAds,
    fetchAdById,
    createAd,
    updateAd,
    deleteAd,
    updateAdStatus,
    deleteAdImage
  };
};
