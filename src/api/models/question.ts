import type { Answer } from "./answer";
import type { Upload } from "./upload";

export interface Question {
  questionText: string;
  questionFiles?: Upload[];
  instructions?: string;
  instructionId?: number;
  topic?: string;
  topicId?: number;
  passage?: string;
  passageId?: number;
  explanation?: string;
  explanationId?: number;
  questionType: string;
  options?: string[];
  correct: Answer[];
}