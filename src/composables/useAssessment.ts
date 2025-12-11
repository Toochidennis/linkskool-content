import { assessmentService } from "@/api/services/serviceFactory";

export const useAssessment = () => {
  const fetchAssessments = async () => {
    try {
      const response = await assessmentService.get<AssessmentFilter[]>();
      return response.data || [];
    } catch (error) {
      console.error("Failed to fetch assessments:", error);
      return [];
    }
  };

  return {
    fetchAssessments
  };
}
