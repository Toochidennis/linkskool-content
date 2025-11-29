
import type { YearQuestion } from "@/composables/useQuestionUpload";
import type { Settings } from ".";

export interface QuestionPayload {
  settings: Settings;
  data: YearQuestion[];
}
