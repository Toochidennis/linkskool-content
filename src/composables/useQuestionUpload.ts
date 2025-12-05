export interface ExtractedImage {
  name: string;
  data: string;
  type: string;
}

export interface Settings {
  examTypeId: number;
  courseId: number;
  courseName: string;
  description: string;
  userId: number | null;
  username: string | null;
}

export interface QuestionFile {
  file_name: string;
  old_file_name: string;
  type: string;
  file: string;
}

export interface Option {
  order: number;
  text: string;
  optionFiles: QuestionFile[];
}

export interface Question {
  questionText: string;
  questionFiles: QuestionFile[];
  instruction?: string;
  instructionId?: number;
  topic?: string;
  topicId?: number;
  passageId?: number;
  explanationId?: number;
  questionType: string;
  passage: string;
  explanation: string;
  options: Option[];
  correct: {
    order: number;
    text: string;
  };
  year?: number;
}

export interface YearQuestion {
  year: number;
  questions: Question[];
}

export interface ValidationError {
  year: number;
  questionIndex: number;
  questionText: string;
  error: string;
}

export const useQuestionUpload = () => {
  /**
   * Get image from extracted images by name and convert to pure base64
   */
  const getImageByName = (
    imageName: string,
    extractedImages: ExtractedImage[]
  ): string => {
    if (!imageName || extractedImages.length === 0) return '';
    const image = extractedImages.find(
      img => img.name.toLowerCase() === imageName.toLowerCase()
    );
    if (!image) return '';

    // Extract pure base64 from Data URL (removes "data:image/...;base64," prefix)
    const base64String = image.data.split(',')[1] || image.data;
    return base64String;
  };

  /**
   * Process image files for questions
   */
  const processQuestionFiles = (
    row: Record<string, string>,
    extractedImages: ExtractedImage[],
    hasZipFile: boolean
  ): QuestionFile[] => {
    const files: QuestionFile[] = [];
    const questionImageName = row['question_image'];

    if (hasZipFile && questionImageName && questionImageName.trim()) {
      const base64Image = getImageByName(questionImageName, extractedImages);
      if (base64Image) {
        files.push({
          file_name: questionImageName,
          old_file_name: '',
          type: 'image',
          file: base64Image
        });
      }
    }
    return files;
  };

  /**
   * Process image files for options
   */
  const processOptionFiles = (
    row: Record<string, string>,
    optionNumber: number,
    extractedImages: ExtractedImage[],
    hasZipFile: boolean
  ): QuestionFile[] => {
    const files: QuestionFile[] = [];
    const optionImageKey = `option_${optionNumber}_image`;
    const optionImageName = row[optionImageKey];

    if (hasZipFile && optionImageName && optionImageName.trim()) {
      const base64Image = getImageByName(optionImageName, extractedImages);
      if (base64Image) {
        files.push({
          file_name: optionImageName.split('.')[0] || `option_${optionNumber}`,
          old_file_name: optionImageName,
          type: 'image',
          file: base64Image
        });
      }
    }
    return files;
  };

  /**
   * Format CSV data into structured questions grouped by year
   */
  const formatQuestionsData = (
    csvData: Array<Record<string, string>>,
    extractedImages: ExtractedImage[],
    hasZipFile: boolean
  ): { data: YearQuestion[]; errors: ValidationError[] } => {
    // Group questions by year
    const yearMap = new Map<string, Array<Record<string, string>>>();
    const validationErrors: ValidationError[] = [];

    csvData.forEach((row) => {
      const year = row['year'] || '';
      if (!year) return; // Skip rows without year
      if (!yearMap.has(year)) {
        yearMap.set(year, []);
      }
      yearMap.get(year)?.push(row);
    });

    // Convert to desired format
    const data = Array.from(yearMap.entries()).map(([year, questions]) => ({
      year: parseInt(year),
      questions: questions.map((row, questionIndex) => {
        // Determine question type - default to multiple_choice
        const questionType = (row['question_type'] || 'multiple_choice').toLowerCase();
        const isShortAnswer = questionType === 'short_answer';
        const questionText = row['question_text'] || '';

        // Validate question text is not empty
        if (!questionText.trim()) {
          validationErrors.push({
            year: parseInt(year),
            questionIndex: questionIndex + 1,
            questionText: 'N/A',
            error: `Question text is empty`
          });
        }

        let options: Option[] = [];
        let correct: { order: number; text: string };

        if (isShortAnswer) {
          // For short answer questions
          options = [];
          const answerText = row['answer'] || '';

          if (!answerText.trim()) {
            validationErrors.push({
              year: parseInt(year),
              questionIndex: questionIndex + 1,
              questionText,
              error: `Short answer question has no answer provided`
            });
          }

          correct = {
            order: 0,
            text: answerText
          };
        } else {
          // For multiple choice questions
          // Dynamically build options array - only include non-empty options
          for (let i = 1; i <= 6; i++) {
            const optionTextKey = `option_${i}_text`;
            const optionText = row[optionTextKey];

            // Only add option if text is not empty
            if (optionText && optionText.trim()) {
              options.push({
                order: i,
                text: optionText,
                optionFiles: processOptionFiles(row, i, extractedImages, hasZipFile)
              });
            }
          }

          // Get correct answer - the answer key holds 1-based index (A=1, B=2, etc.)
          const answerIndex = parseInt(row['answer'] || '0') || 0;
          const answerText = answerIndex > 0 ? (row[`option_${answerIndex}_text`] || '') : '';

          if (!answerText.trim()) {
            validationErrors.push({
              year: parseInt(year),
              questionIndex: questionIndex + 1,
              questionText,
              error: `Multiple choice question has no valid answer selected or answer text is empty`
            });
          }

          correct = {
            order: answerIndex,
            text: answerText
          };
        }

        return {
          questionText,
          passage: row['passage'] || '',
          passageId: row['passage_id'] ? parseInt(row['passage_id']) : 0,
          questionType: questionType === 'short_answer' ? 'short_answer' : 'multiple_choice',
          instruction: row['instruction'] || '',
          topic: row['topic'] || '',
          topicId: row['topic_id'] ? parseInt(row['topic_id']) : 0,
          questionFiles: processQuestionFiles(row, extractedImages, hasZipFile),
          explanation: row['explanation'] || '',
          explanationId: row['explanation_id'] ? parseInt(row['explanation_id']) : 0,
          options: options,
          correct: correct
        };
      })
    })).sort((a, b) => b.year - a.year); // Sort by year descending

    return { data, errors: validationErrors };
  };

  return {
    getImageByName,
    processQuestionFiles,
    processOptionFiles,
    formatQuestionsData
  };
};
