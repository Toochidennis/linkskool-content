import { examService } from "@/api/services/serviceFactory";
import type { Question } from "./useQuestionUpload";
import { ref } from "vue";

export const useAssessment = () => {
  const questions = ref<Question[]>([]);

  const fetchAssessments = async (examId: number) => {
    try {
      const response = await examService.get<Question[]>(`${examId}/questions`);
      // console.log("Assessment response:", response);
      questions.value = response.data || [];
      // console.log("Fetched assessments:", questions.value);
    } catch (error) {
      console.error("Failed to fetch assessments:", error);
    }
  };


  return {
    questions,
    fetchAssessments,
  };
}
