import { ref } from "vue";
import { assessmentService } from "@/api/services/serviceFactory";

export interface AssessmentFilter {
  examTypeId: number;
  examImage: string;
  examTitle: string;
  examDesc: string | null;
  examShortname: string;
  examDisplayOrder: number;
  courses: {
    courseId: number;
    courseName: string;
    years: {
      examId: number;
      year: string;
    }[];
  }[];
}


export const useFilters = () => {
  const filters = ref<AssessmentFilter[] | []>([]);
  const loading = ref(false);

  const fetchFilters = async () => {
    loading.value = true;
    try {
      const response = await assessmentService.get<AssessmentFilter[]>();
      // console.log("Filters response:", response);
      filters.value = response.data || [];
    } catch (error) {
      console.error("Failed to fetch filters:", error);
    } finally {
      loading.value = false;
    }
  };

  return {
    filters,
    loading,
    fetchFilters
  };
}
