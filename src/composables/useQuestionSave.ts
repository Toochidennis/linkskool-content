import { ref } from 'vue';
import type { Question } from './useQuestionUpload';

interface QuestionDraft {
  localId: string; // Temporary ID for new questions
  serverIdIfAny?: number; // ID from server once persisted
  isDirty: boolean; // Has unsaved changes
  lastSavedAt: number; // Timestamp
  data: Question;
}

export const useQuestionSave = () => {
  const draftQuestions = ref<Map<string, QuestionDraft>>(new Map());
  const syncQueue = ref<string[]>([]); // IDs of questions pending server sync

  /**
   * Check if a question has minimum required data for server submission
   * Avoids validation errors from incomplete data
   */
  const isValidForSubmission = (question: Question): boolean => {
    // Minimum requirements to avoid server validation errors
    const hasQuestionText = question.questionText?.trim().length > 0;
    const hasOptions = question.options?.length >= 2;
    const hasCorrectAnswer = question.correct?.text?.trim().length > 0;
    const hasQuestionType = question.questionType && ['multiple_choice', 'short_answer'].includes(question.questionType);

    if (!hasQuestionText || !hasQuestionType) {
      return false;
    }

    // For multiple choice, need options and correct answer
    if (question.questionType === 'multiple_choice') {
      return !!(hasOptions && hasCorrectAnswer);
    }

    // For short answer, just need question text
    return true;
  };

  /**
   * Save question to local IndexedDB/localStorage (immediate, always safe)
   * Preserves existing server ID if updating an existing draft
   */
  const saveLocalDraft = (questionId: string, question: Question, serverIdIfAny?: number): void => {
    // Preserve existing server ID if not provided and draft already exists
    const existingDraft = draftQuestions.value.get(questionId);
    const finalServerIdIfAny = serverIdIfAny ?? existingDraft?.serverIdIfAny;

    const draft: QuestionDraft = {
      localId: questionId,
      serverIdIfAny: finalServerIdIfAny,
      isDirty: true,
      lastSavedAt: Date.now(),
      data: JSON.parse(JSON.stringify(question)) // Deep clone
    };
    draftQuestions.value.set(questionId, draft);
    persistToIndexedDB();
  };

  /**
   * Initialize a question from server without marking as dirty
   * Used when questions are loaded from the server for the first time
   */
  const initializeFromServer = (questionId: string, question: Question, serverIdIfAny: number): void => {
    const draft: QuestionDraft = {
      localId: questionId,
      serverIdIfAny,
      isDirty: false, // Not dirty - just loaded from server
      lastSavedAt: Date.now(),
      data: JSON.parse(JSON.stringify(question)) // Deep clone
    };
    draftQuestions.value.set(questionId, draft);
    persistToIndexedDB();
  };

  /**
   * Get questions ready for server submission (only valid ones)
   */
  const getQuestionsReadyForServer = (): Array<{ local: QuestionDraft; isNew: boolean }> => {
    return Array.from(draftQuestions.value.values())
      .filter(draft => draft.isDirty && isValidForSubmission(draft.data))
      .map(draft => ({
        local: draft,
        isNew: !draft.serverIdIfAny || draft.serverIdIfAny <= 0
      }));
  };

  /**
   * After server persists questions, update local mapping
   * Server should return: [{ localId: 'temp-123', serverId: 456 }]
   */
  const updateServerIds = (mappings: Array<{ localId: string; serverId: number }>): void => {
    mappings.forEach(({ localId, serverId }) => {
      const draft = draftQuestions.value.get(localId);
      if (draft) {
        draft.serverIdIfAny = serverId;
        draft.isDirty = false;
      }
    });
    persistToIndexedDB();
  };

  /**
   * Mark a draft as synced (no longer dirty)
   */
  const markAsSynced = (questionIds: string[]): void => {
    questionIds.forEach(id => {
      const draft = draftQuestions.value.get(id);
      if (draft) {
        draft.isDirty = false;
      }
    });
    persistToIndexedDB();
  };

  /**
   * Persist all drafts to localStorage (simplified IndexedDB)
   */
  const persistToIndexedDB = (): void => {
    try {
      const allDrafts = Array.from(draftQuestions.value.values());
      localStorage.setItem('questionDrafts', JSON.stringify(allDrafts));
    } catch (error) {
      console.error('Failed to persist drafts:', error);
    }
  };

  /**
   * Load drafts from localStorage on mount
   */
  const loadDraftsFromIndexedDB = (): void => {
    try {
      const stored = localStorage.getItem('questionDrafts');
      if (stored) {
        const drafts = JSON.parse(stored) as QuestionDraft[];
        drafts.forEach(draft => {
          draftQuestions.value.set(draft.localId, draft);
        });
      }
    } catch (error) {
      console.error('Failed to load drafts:', error);
    }
  };

  /**
   * Clear all drafts (after successful sync to server)
   */
  const clearAllDrafts = (): void => {
    draftQuestions.value.clear();
    localStorage.removeItem('questionDrafts');
  };

  /**
   * Get draft for a specific question
   */
  const getDraft = (questionId: string): QuestionDraft | undefined => {
    return draftQuestions.value.get(questionId);
  };

  /**
   * Check if a question has unsaved changes
   */
  const hasDirtyChanges = (): boolean => {
    return Array.from(draftQuestions.value.values()).some(draft => draft.isDirty);
  };

  return {
    draftQuestions,
    syncQueue,
    isValidForSubmission,
    saveLocalDraft,
    initializeFromServer,
    getQuestionsReadyForServer,
    updateServerIds,
    markAsSynced,
    persistToIndexedDB,
    loadDraftsFromIndexedDB,
    clearAllDrafts,
    getDraft,
    hasDirtyChanges
  };
};
