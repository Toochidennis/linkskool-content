import { programService } from "@/api/services/serviceFactory";
import type { Program, CreateProgramPayload } from '@/api/models';

export const useProgram = () => {
  /**
   * Fetch all programs
   */
  const fetchPrograms = async () => {
    try {
      const response = await programService.get<Program[]>();
      return response.data;
    } catch (error: any) {
      throw {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch programs',
        error
      };
    }
  };

  /**
   * Fetch program by ID
   * @param id - Program ID
   */
  const fetchProgramById = async (id: number) => {
    try {
      const response = await programService.get<Program>(id.toString());
      return response.data;
    } catch (error: any) {
      throw {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch program',
        error
      };
    }
  };

  /**
   * Create new program with multipart/form-data
   * @param payload - Program data including raw image file
   */
  const createProgram = async (payload: CreateProgramPayload) => {
    try {
      const formData = new FormData();

      formData.append('name', payload.name);
      formData.append('shortname', payload.shortname);
      formData.append('description', payload.description);
      if (payload.sponsor) {
        formData.append('sponsor', payload.sponsor);
      }
      formData.append('is_free', payload.is_free ? '1' : '0');
      formData.append('status', payload.status);

      if (!payload.is_free && payload.trial_type) {
        formData.append('trial_type', payload.trial_type);
        if (payload.trial_value) {
          formData.append('trial_value', payload.trial_value.toString());
        }
      }

      if (payload.start_date) {
        formData.append('start_date', payload.start_date);
      }

      if (payload.end_date) {
        formData.append('end_date', payload.end_date);
      }

      // Append banner image file - ensure it's a valid File object
      if (payload.banner_image instanceof File) {
        formData.append('banner_image', payload.banner_image);
      }

      const response = await programService.post(undefined, formData as unknown as Record<string, unknown>);

      return response;
    } catch (error: any) {
      throw {
        success: false,
        message: error.response?.data?.message || 'Failed to create program',
        error
      };
    }
  };

  /**
   * Update existing program with multipart/form-data
   * @param id - Program ID
   * @param payload - Program data including raw image file (optional)
   */
  const updateProgram = async (id: number, payload: Record<string, any>) => {
    try {
      console.log('Updating program with ID:', id);
      // Log FormData contents for debugging
      for (const pair of payload.entries()) {
        console.log(pair[0], pair[1]);
      }

      const response = await programService.post(id.toString(), payload as unknown as Record<string, unknown>);

      return response;
    } catch (error: any) {
      throw {
        success: false,
        message: error.response?.data?.message || 'Failed to update program',
        error
      };
    }
  };

  /**
   * Delete program
   * @param id - Program ID
   */
  const deleteProgram = async (id: number) => {
    try {
      const response = await programService.delete(id.toString());
      return response;
    } catch (error: any) {
      throw {
        success: false,
        message: error.response?.data?.message || 'Failed to delete program',
        error
      };
    }
  };

  /**
   * Update program status (publish/archive)
   * @param id - Program ID
   * @param status - New status
   */
  const updateProgramStatus = async (id: number, status: 'draft' | 'published' | 'archived') => {
    try {
      const response = await programService.put(`${id}/status`, { status });
      return response;
    } catch (error: any) {
      throw {
        success: false,
        message: error.response?.data?.message || 'Failed to update program status',
        error
      };
    }
  };

  /**
   * Delete banner image from a program
   * @param id - Program ID
   * @param fileName - Image file name to delete
   */
  const deleteProgramImage = async (id: number, fileName: string) => {
    try {
      const response = await programService.delete(`${id}/images`, { fileName });
      return response;
    } catch (error: any) {
      throw {
        success: false,
        message: error.response?.data?.message || 'Failed to delete program image',
        error
      };
    }
  };

  return {
    fetchPrograms,
    fetchProgramById,
    createProgram,
    updateProgram,
    deleteProgram,
    updateProgramStatus,
    deleteProgramImage
  };
};
