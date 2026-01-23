<template>
  <div class="form-container">
    <!-- Filter Bar -->
    <div class="filter-bar">
      <div class="filter-header">
        <h1 class="title">Assessment View</h1>
        <div class="filter-actions">
          <div class="filter-stats">
            <span class="stat-badge">{{ filteredQuestions.length }} questions</span>
            <span class="stat-badge success">{{ savedIndicator ? 'Saved' : 'Ready' }}</span>
          </div>
          <!-- <button class="view-toggle-btn" @click="switchToSpreadsheet">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="18" height="18">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <line x1="9" y1="3" x2="9" y2="21" />
              <line x1="15" y1="3" x2="15" y2="21" />
              <line x1="3" y1="9" x2="21" y2="9" />
              <line x1="3" y1="15" x2="21" y2="15" />
            </svg>
            Spreadsheet View
          </button> -->
        </div>
      </div>

      <div class="filter-controls">
        <div class="search-box">
          <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input v-model="searchQuery" type="text" placeholder="Search questions..." class="search-input" />
        </div>

        <select v-model="selectedProgram" class="filter-select">
          <option v-for="program in programs" :key="program" :value="program">
            {{ program }}
          </option>
        </select>

        <select v-model="selectedCourse" class="filter-select">
          <option v-for="course in filteredCourses" :key="course" :value="course">
            {{ course }}
          </option>
        </select>

        <select v-model="selectedYear" class="filter-select">
          <option v-for="year in years" :key="year" :value="year">
            {{ year }}
          </option>
        </select>
        <div style="color: #666; font-size: 12px; margin-left: 10px;">{{ loadingStatus }}</div>
      </div>
    </div>

    <!-- Questions List -->
    <div class="questions-wrapper">
      <div v-for="(question, index) in filteredQuestions"
        :key="question.questionId && question.questionId > 0 ? question.questionId : question.localId || `new-${index}`"
        class="question-container">
        <div class="question-card"
          :class="{ 'is-edited': editedQuestions.has(String(question.questionId)), 'is-collapsed': collapsedCards.has(String(question.questionId)) }"
          @click="handleCardClick(String(question.questionId!), $event)">
          <!-- Question Header -->
          <div class="question-header">
            <div class="question-number">Question {{ index + 1 }}</div>
            <div class="question-meta">
              <select v-model="question.questionType" class="meta-select"
                @change="handleEdit(String(question.questionId!))">
                <option value="multiple_choice">Multiple Choice</option>
                <option value="short_answer">Short Answer</option>
              </select>
              <input v-model.number="question.year" type="number" class="meta-input small" placeholder="Year"
                @input="handleEdit(String(question.questionId!))" />
              <input v-model="question.topic" type="text" class="meta-input" placeholder="Topic"
                @input="handleEdit(String(question.questionId!))" />
            </div>
            <div class="question-actions">
              <button class="icon-btn collapse-btn" @click="toggleCardCollapse(String(question.questionId!), $event)"
                :title="collapsedCards.has(String(question.questionId)) ? 'Expand' : 'Collapse'">
                <svg v-if="collapsedCards.has(String(question.questionId))" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" width="18" height="18">
                  <polyline points="18 15 12 9 6 15"></polyline>
                </svg>
                <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" width="18" height="18">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </button>
              <button class="icon-btn duplicate-btn" @click="duplicateQuestion(question, $event)"
                title="Duplicate question">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="18" height="18">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
              </button>
              <button class="icon-btn delete-btn" @click="deleteQuestion(String(question.questionId!))"
                title="Delete question">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="18" height="18">
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2">
                  </path>
                  <line x1="10" y1="11" x2="10" y2="17"></line>
                  <line x1="14" y1="11" x2="14" y2="17"></line>
                </svg>
              </button>
            </div>
          </div>

          <!-- Preview Mode (Collapsed) -->
          <div v-if="collapsedCards.has(String(question.questionId))" class="question-preview">
            <!-- Question Text Preview -->
            <div class="preview-question" v-html="question.questionText"></div>

            <!-- Multiple Choice Options Preview -->
            <div v-if="question.questionType === 'multiple_choice'" class="preview-options">
              <div v-for="(option, optIndex) in question.options" :key="optIndex" class="preview-option-item">
                <input type="radio" :name="`preview-${question.questionId}`" disabled
                  :checked="Number(question.correct.order) === Number(option.order)" />
                <span class="preview-option-text" v-html="option.text"></span>
              </div>
            </div>

            <!-- Short Answer Preview -->
            <div v-if="question.questionType === 'short_answer'" class="preview-short-answer">
              <div class="preview-answer-line"></div>
            </div>
          </div>

          <!-- Edit Mode (Expanded) -->
          <div v-else class="question-content">
            <!-- Passage Section -->
            <div v-if="question.passage || editMode" class="form-section">
              <label class="section-label">Passage</label>
              <div class="editable-content" contenteditable="true"
                :data-placeholder="question.passage ? '' : 'Add passage text here...'"
                @input="(e) => handleContentEdit(question, 'passage', e)" v-html="question.passage"></div>
            </div>

            <!-- Instruction Section -->
            <div v-if="question.instruction || editMode" class="form-section">
              <label class="section-label">Instruction</label>
              <div class="editable-content" contenteditable="true"
                :data-placeholder="question.instruction ? '' : 'Add instruction for this question...'"
                @input="(e) => handleContentEdit(question, 'instruction', e)" v-html="question.instruction"></div>
            </div>

            <!-- Question Text -->
            <div class="form-section">
              <label class="section-label">
                Question <span class="required">*</span>
              </label>
              <div class="editable-content question-text" contenteditable="true"
                :data-placeholder="question.questionText ? '' : 'Enter your question here...'"
                @input="(e) => handleContentEdit(question, 'questionText', e)" v-html="question.questionText"></div>
            </div>

            <!-- Question Image -->
            <div class="form-section">
              <label class="section-label">Question Image</label>
              <div v-if="question.questionFiles && question.questionFiles.length > 0" class="image-preview-container">
                <img :src="getImageUrl(question.questionFiles[0]?.file_name || question.questionFiles[0]?.file || '')"
                  :alt="'Question ' + (index + 1)" class="uploaded-image" />
                <button class="delete-image-btn" @click="deleteQuestionImage(question)" title="Delete image">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="16" height="16">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>
              <div v-else class="image-upload-zone"
                @dragover.prevent="handleDragOver($event, 'question', question.questionId!)"
                @dragleave.prevent="handleDragLeave($event)"
                @drop.prevent="handleDrop($event, 'question', question.questionId!)"
                @click="triggerFileInput('question', question.questionId!)"
                :class="{ 'dragging': isDragging === `question-${question.questionId}` }">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="32" height="32" class="upload-icon">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="17 8 12 3 7 8"></polyline>
                  <line x1="12" y1="3" x2="12" y2="15"></line>
                </svg>
                <p class="upload-text">Click or drag image here</p>
                <p class="upload-hint">PNG, JPG up to 5MB</p>
              </div>
              <input type="file" :data-input-id="`question-${question.questionId}`" accept="image/*"
                style="display: none" @change="handleFileSelect($event, 'question', question.questionId!)" />
            </div>

            <!-- Multiple Choice Options -->
            <div v-if="question.questionType === 'multiple_choice'" class="form-section">
              <label class="section-label">Options</label>
              <div class="options-list">
                <div v-for="(option, optIndex) in question.options" :key="optIndex" class="option-item">
                  <div class="option-row">
                    <input type="radio" :name="`correct-${question.questionId}`"
                      :checked="Number(question.correct.order) === Number(option.order)"
                      @change="setCorrectAnswer(question, option.order)" class="option-radio" />
                    <div class="editable-content option-text" contenteditable="true"
                      :data-placeholder="option.text ? '' : `Option ${String.fromCharCode(64 + option.order)}`"
                      @input="(e) => handleOptionEdit(question, optIndex, e)" v-html="option.text"></div>
                    <button class="icon-btn delete-option-btn" @click="deleteOption(question, optIndex)"
                      title="Delete option">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="16" height="16">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                      </svg>
                    </button>
                  </div>
                  <div class="option-image-section">
                    <div v-if="option.optionFiles && option.optionFiles.length > 0"
                      class="image-preview-container small">
                      <img :src="getImageUrl(option.optionFiles[0]?.file_name || option.optionFiles[0]?.file || '')"
                        :alt="`Option ${optIndex + 1}`" class="uploaded-image" />
                      <button class="delete-image-btn" @click="deleteOptionImage(question, optIndex)"
                        title="Delete image">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="14" height="14">
                          <line x1="18" y1="6" x2="6" y2="18"></line>
                          <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                      </button>
                    </div>
                    <div v-else class="image-upload-zone small"
                      @dragover.prevent="handleDragOver($event, 'option', question.questionId!, optIndex)"
                      @dragleave.prevent="handleDragLeave($event)"
                      @drop.prevent="handleDrop($event, 'option', question.questionId!, optIndex)"
                      @click="triggerFileInput('option', question.questionId!, optIndex)"
                      :class="{ 'dragging': isDragging === `option-${question.questionId}-${optIndex}` }">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="20" height="20"
                        class="upload-icon">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                        <polyline points="17 8 12 3 7 8"></polyline>
                        <line x1="12" y1="3" x2="12" y2="15"></line>
                      </svg>
                      <p class="upload-text">Click or drag image here</p>
                      <p class="upload-hint">PNG, JPG up to 5MB</p>
                    </div>
                    <input type="file" :data-input-id="`option-${question.questionId}-${optIndex}`" accept="image/*"
                      style="display: none"
                      @change="handleFileSelect($event, 'option', question.questionId!, optIndex)" />
                  </div>
                </div>
              </div>
              <button class="add-option-btn" @click="addOption(question)">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="16" height="16">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Add Option
              </button>
            </div>

            <!-- Short Answer -->
            <div v-if="question.questionType === 'short_answer'" class="form-section">
              <label class="section-label">Answer</label>
              <input v-model="question.correct.text" type="text" class="answer-input" placeholder="Expected answer"
                @input="handleEdit(String(question.questionId!))" />
            </div>

            <!-- Explanation -->
            <div class="form-section">
              <label class="section-label">Explanation</label>
              <div class="editable-content" contenteditable="true"
                :data-placeholder="question.explanation ? '' : 'Add explanation for the answer...'"
                @input="(e) => handleContentEdit(question, 'explanation', e)" v-html="question.explanation"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="filteredQuestions.length === 0" class="empty-state">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="48" height="48">
          <path d="M9 11l3 3L22 4" />
          <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
        </svg>
        <h3>No questions found</h3>
        <p>Loaded: {{ allQuestions.length }} | Filtered: {{ filteredQuestions.length }}</p>
        <p>Try adjusting your filters</p>
      </div>
    </div>

    <!-- Saving Indicator -->
    <div v-if="isSaving" class="saving-indicator">
      <div class="spinner"></div>
      <span>Saving changes...</span>
    </div>

    <!-- Floating Action Card -->
    <FloatingActionCard @duplicate="handleFloatingCardDuplicate" @add="handleFloatingCardAdd"
      @delete="handleFloatingCardDelete" @close="() => { }" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from 'vue';
import { useFilters } from '@/composables/useFilters';
import { useAssessment } from "@/composables/useAssessment";
import { useFloatingActionCard } from '@/composables/useFloatingActionCard';
import { useQuestionSave } from '@/composables/useQuestionSave';
import FloatingActionCard from '@/components/FloatingActionCard.vue';
import type { Question, QuestionFile } from '@/composables/useQuestionUpload';
import { questionService } from '@/api/services/serviceFactory';

// Filters
const { filters, fetchFilters } = useFilters();
const { questions, fetchAssessments } = useAssessment();
const { activeCard } = useFloatingActionCard();
const { saveLocalDraft, initializeFromServer, loadDraftsFromIndexedDB, isValidForSubmission } = useQuestionSave();

type LocalQuestion = Question & { localId?: string };

const allQuestions = ref<LocalQuestion[]>([]);
const editedQuestions = ref(new Set<string>());
const savedIndicator = ref(false);
const isSaving = ref(false);
const editMode = ref(true);
const collapsedCards = ref(new Set<string>());
const isDragging = ref<string>('');
const loadingStatus = ref<string>('initial');
const tempIdCounter = ref(-1);

// Filter state
const searchQuery = ref('');
const selectedProgram = ref('');
const selectedCourse = ref('');
const selectedYear = ref<string | ''>('');
const currentExamId = ref<number | null>(null);

// Computed properties for filters
const programs = computed(() => {
  return filters.value.map(filter => filter.examShortname);
});

const filteredCourses = computed(() => {
  // Get courses for selected program
  const selectedFilter = filters.value.find(
    filter => filter.examShortname === selectedProgram.value
  );
  return selectedFilter?.courses.map(course => course.courseName) || [];
});

const years = computed(() => {
  // Get years for selected program and course
  const selectedFilter = filters.value.find(
    filter => filter.examShortname === selectedProgram.value
  );
  const selectedCourseData = selectedFilter?.courses.find(
    course => course.courseName === selectedCourse.value
  );
  return selectedCourseData?.years.map(y => y.year).sort((a, b) => Number(b) - Number(a)) || [];
});

const filteredQuestions = computed(() => {
  return allQuestions.value.filter((q) => {
    const matchesSearch =
      !searchQuery.value ||
      q.questionText.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      q.topic?.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      q.passage?.toLowerCase().includes(searchQuery.value.toLowerCase());

    return matchesSearch;
  });
});

// Watch for filter changes and fetch new assessments
const loadQuestionsForSelection = async () => {
  loadingStatus.value = 'Loading...';
  if (!selectedProgram.value || !selectedCourse.value || !selectedYear.value) {
    loadingStatus.value = 'Missing filters';
    return;
  }

  // Find the exam ID for selected filters
  const programFilter = filters.value.find(f => f.examShortname === selectedProgram.value);
  if (!programFilter) {
    loadingStatus.value = 'Program not found';
    return;
  }

  const courseData = programFilter.courses.find(c => c.courseName === selectedCourse.value);
  if (!courseData) {
    loadingStatus.value = 'Course not found';
    return;
  }

  const yearData = courseData.years.find(y => y.year === selectedYear.value);
  if (!yearData || !yearData.examId) {
    loadingStatus.value = 'Year/Exam ID not found';
    return;
  }

  loadingStatus.value = `Fetching exam ${yearData.examId}...`;
  // Store the current exam ID
  currentExamId.value = yearData.examId;
  // Fetch questions for the exam
  try {
    await fetchAssessments(yearData.examId);

    // Transform server data: Convert 0-based correct.order to 1-based for UI
    allQuestions.value = transformQuestionsFromServer(questions.value);

    // Clear edited questions tracker when loading fresh from server
    editedQuestions.value.clear();

    // Initialize drafts for all server questions with their correct server IDs
    // Mark them as NOT dirty since they're just loaded from server
    allQuestions.value.forEach(question => {
      if (question.questionId && question.questionId > 0) {
        initializeFromServer(String(question.questionId), question, question.questionId);
      }
    });

    loadingStatus.value = `Loaded ${allQuestions.value.length} questions`;
  } catch (error) {
    console.error('Error loading questions:', error);
    loadingStatus.value = 'Error loading questions';
  }
};

// Auto-select the first course and year when program changes
watch(selectedProgram, (program) => {
  const programFilter = filters.value.find(f => f.examShortname === program);
  const firstCourse = programFilter?.courses?.[0];

  selectedCourse.value = firstCourse?.courseName || '';

  const firstYear = firstCourse?.years
    ? [...firstCourse.years].sort((a, b) => Number(b.year) - Number(a.year))[0]
    : undefined;
  selectedYear.value = firstYear?.year || '';
});

// Auto-select the first year when course changes
watch(selectedCourse, (course) => {
  const programFilter = filters.value.find(f => f.examShortname === selectedProgram.value);
  const courseData = programFilter?.courses.find(c => c.courseName === course);

  const firstYear = courseData?.years
    ? [...courseData.years].sort((a, b) => Number(b.year) - Number(a.year))[0]
    : undefined;
  selectedYear.value = firstYear?.year || '';
});

// Scroll to top when filters change
const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

watch([searchQuery, selectedProgram, selectedCourse, selectedYear], () => {
  scrollToTop();
});

// Fetch filters on mount and set initial selections
onMounted(async () => {
  // Load any saved drafts from previous sessions
  loadDraftsFromIndexedDB();

  await fetchFilters();

  // Set first program
  if (filters.value.length > 0) {
    const firstProgram = filters.value[0];
    if (firstProgram) {
      selectedProgram.value = firstProgram.examShortname;

      // Set first course for the selected program
      if (firstProgram.courses.length > 0) {
        const firstCourse = firstProgram.courses[0];
        if (firstCourse) {
          selectedCourse.value = firstCourse.courseName;

          // Set first year for the selected course (most recent year)
          if (firstCourse.years.length > 0) {
            const sortedYears = [...firstCourse.years].sort((a, b) => Number(b.year) - Number(a.year));
            const mostRecentYear = sortedYears[0];
            if (mostRecentYear) {
              selectedYear.value = mostRecentYear.year;
            }
          }
        }
      }
    }
  }
});

// Watch for filter changes
watch([selectedProgram, selectedCourse, selectedYear], async (newVals) => {
  // Only reload if all selections are made
  if (newVals[0] && newVals[1] && newVals[2]) {
    await loadQuestionsForSelection();
  }
}, { immediate: false });

/**
 * Transform questions from server format to UI format
 * Server uses 0-based correct.order (0=A, 1=B, 2=C, 3=D)
 * UI uses 1-based option.order (1=A, 2=B, 3=C, 4=D)
 */
const transformQuestionsFromServer = (serverQuestions: Question[]): Question[] => {
  return serverQuestions.map(question => {
    if (question.questionType === 'multiple_choice' && question.correct) {
      // Ensure correct.order is a number (server might return it as string)
      const serverOrder = Number(question.correct.order);
      const uiOrder = serverOrder + 1;
      const matchingOption = question.options.find(opt => opt.order === uiOrder);

      // console.log(`Q${question.questionId}: Converting correct answer from server 0-based (${serverOrder}) to UI 1-based (${uiOrder}), matching option: ${matchingOption?.text}`);

      return {
        ...question,
        // Ensure all numeric fields are actually numbers
        questionId: Number(question.questionId),
        correct: {
          order: uiOrder,
          text: matchingOption?.text || question.correct.text
        },
        options: question.options.map(opt => ({
          ...opt,
          order: Number(opt.order)
        }))
      };
    }
    return {
      ...question,
      questionId: Number(question.questionId),
      options: question.options.map(opt => ({
        ...opt,
        order: Number(opt.order)
      }))
    };
  });
};

// Auto-save functionality
let saveTimeout: ReturnType<typeof setTimeout>;

const handleEdit = (questionId: string) => {
  editedQuestions.value.add(questionId);
  // console.log(`Question ${questionId} marked as edited. Total edited: ${editedQuestions.value.size}`);

  // Immediately save to local draft
  const question = allQuestions.value.find(q => String(q.questionId) === questionId);
  if (question) {
    saveLocalDraft(questionId, question);
  }

  clearTimeout(saveTimeout);
  isSaving.value = true;

  saveTimeout = setTimeout(() => {
    // console.log(`Auto-saving ${editedQuestions.value.size} edited question(s) to server...`);
    saveToServer();
  }, 3000); // Increased debounce time for more changes to batch
};

/**
 * Package question images according to the specification
 * Rules:
 * 1. New image on existing question (no old image): filename, old_file_name (optional), file (base64), type
 * 2. New image replacing existing: file_name (required), old_file_name (required), type, file (base64)
 * 3. No new image, old ones exist: return as-is
 * 4. No images: return []
 */
const packageQuestionImages = (questionFiles: QuestionFile[]): QuestionFile[] => {
  if (!questionFiles || questionFiles.length === 0) {
    return [];
  }

  return questionFiles.map(file => {
    const packaged: QuestionFile = {
      file_name: file.file_name,
      old_file_name: file.old_file_name || '',
      type: file.type,
      file: file.file
    };
    return packaged;
  });
};

/**
 * Package option images according to the specification
 */
const packageOptionImages = (optionFiles: QuestionFile[]): QuestionFile[] => {
  if (!optionFiles || optionFiles.length === 0) {
    return [];
  }

  return optionFiles.map(file => {
    const packaged: QuestionFile = {
      file_name: file.file_name,
      old_file_name: file.old_file_name || '',
      type: file.type,
      file: file.file
    };
    return packaged;
  });
};

/**
 * Package settings separately as in AssessmentView
 */
const packageSettings = () => {
  const user = localStorage.getItem('user');
  const userObj = user ? JSON.parse(user) : null;

  // Search for IDs in the filter object using the selected names
  const programFilter = filters.value.find(f => f.examShortname === selectedProgram.value);
  const examTypeId = programFilter?.examTypeId || 0;

  const courseData = programFilter?.courses.find(c => c.courseName === selectedCourse.value);
  const courseId = courseData?.courseId || 0;

  const year = selectedYear.value ? parseInt(selectedYear.value, 10) : 0;

  return {
    examId: currentExamId.value || 0,
    examTypeId,
    courseId,
    year,
    courseName: selectedCourse.value || '',
    title: selectedProgram.value || '',
    description: '',
    duration: 1800,
    userId: userObj ? userObj.id : null,
    username: userObj ? userObj.username : ''
  };
};

const saveToServer = async () => {
  try {
    isSaving.value = true;

    // Filter questions: Only NEW (questionId <= 0) or EDITED (in editedQuestions Set)
    const questionsToSend = allQuestions.value
      .filter(question => {
        const id = question.questionId || 0;
        const isNew = id <= 0;
        const isEdited = editedQuestions.value.has(String(id));
        return isNew || isEdited;
      })
      .filter(question => isValidForSubmission(question)) // Only send valid questions
      .map(question => {
        const isShortAnswer = question.questionType === 'short_answer';

        // For multiple choice: filter out empty options (no text and no images)
        let filteredOptions = question.options;
        let correctOrder = 0;

        if (!isShortAnswer) {
          // Filter out options that have neither text nor images
          filteredOptions = question.options.filter(opt => {
            const hasText = opt.text?.trim().length > 0;
            const hasImage = opt.optionFiles && opt.optionFiles.length > 0;
            return hasText || hasImage;
          });

          // Find the correct option in the FILTERED list
          const correctOption = filteredOptions.find(opt =>
            opt.text?.trim().toLowerCase() === question.correct.text?.trim().toLowerCase()
          );

          if (correctOption) {
            // Find the index in the filtered array (0-based for server)
            correctOrder = filteredOptions.findIndex(opt => opt.order === correctOption.order);
            // console.log(`Q${question.questionId}: Original options: ${question.options.length}, Filtered: ${filteredOptions.length}, Correct order: ${correctOrder}`);
          } else {
            console.warn(`Q${question.questionId}: Correct option not found in filtered options!`);
          }
        }

        const isNew = !question.questionId || question.questionId <= 0;
        // console.log('Packaging question for server:', question.questionId, 'isNew:', isNew);

        return {
          questionId: isNew ? 0 : question.questionId,
          questionText: question.questionText,
          questionFiles: packageQuestionImages(question.questionFiles),
          passage: question.passage || '',
          passageId: question.passageId || 0,
          instruction: question.instruction || '',
          instructionId: question.instructionId || 0,
          topic: question.topic || '',
          topicId: question.topicId || 0,
          explanation: question.explanation || '',
          explanationId: question.explanationId || 0,
          questionType: question.questionType,
          options: isShortAnswer ? [] : filteredOptions.map((option, idx) => ({
            order: idx + 1,  // Re-number sequentially: 1, 2, 3, 4...
            text: option.text,
            optionFiles: packageOptionImages(option.optionFiles)
          })),
          correct: {
            order: correctOrder,
            text: question.correct.text
          },
          year: question.year || 0
        };
      });

    if (questionsToSend.length === 0) {
      // Nothing to save to server
      isSaving.value = false;
      // console.log('No new or edited questions ready for server save');
      return;
    }

    const settings = packageSettings();

    const payload = {
      settings,
      questions: questionsToSend
    };

    // console.log('Saving to server (only new/edited questions):', payload);
    // console.log(`Sending ${questionsToSend.length} out of ${allQuestions.value.length} total questions`);

    try {
      const response = await questionService.put(undefined, payload as unknown as Record<string, unknown>);

      if (response.success) {
        // console.log('Server response:', response);
        // console.log("Assessments updated successfully on server.");
      } else {
        console.error("Server responded with an error:", response.message);
      }
    }
    catch (error) {
      console.error("Failed to update assessments:", error);
    }

    // For now, simulate success
    setTimeout(async () => {
      // After successful save, refetch to get real IDs from server
      await fetchAssessments(currentExamId.value || 0);

      // Transform server data: Convert 0-based correct.order to 1-based for UI
      const transformedQuestions = transformQuestionsFromServer(questions.value);

      // Replace the array completely to force Vue reactivity
      allQuestions.value = [];
      await nextTick();
      allQuestions.value = transformedQuestions;

      // Reinitialize drafts for all questions (mark as not dirty after successful save)
      transformedQuestions.forEach(question => {
        if (question.questionId && question.questionId > 0) {
          initializeFromServer(String(question.questionId), question, question.questionId);
        }
      });

      isSaving.value = false;
      savedIndicator.value = true;

      setTimeout(() => {
        savedIndicator.value = false;
        editedQuestions.value.clear();
      }, 2000);
    }, 500);
  } catch (error) {
    console.error('Error saving to server:', error);
    isSaving.value = false;
    // Draft still saved locally, so no data loss
  }
};

// Helper function to save cursor position
const saveCursorPosition = (element: HTMLElement) => {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return null;

  const range = selection.getRangeAt(0);
  const preCaretRange = range.cloneRange();
  preCaretRange.selectNodeContents(element);
  preCaretRange.setEnd(range.endContainer, range.endOffset);
  const caretOffset = preCaretRange.toString().length;

  return caretOffset;
};

// Helper function to restore cursor position
const restoreCursorPosition = (element: HTMLElement, offset: number) => {
  const selection = window.getSelection();
  if (!selection) return;

  let charCount = 0;
  let foundNode: Node | null = null;
  let foundOffset = 0;

  const traverseNodes = (node: Node): boolean => {
    if (node.nodeType === Node.TEXT_NODE) {
      const textLength = node.textContent?.length || 0;
      if (charCount + textLength >= offset) {
        foundNode = node;
        foundOffset = offset - charCount;
        return true;
      }
      charCount += textLength;
    } else {
      for (let i = 0; i < node.childNodes.length; i++) {
        const childNode = node.childNodes[i];
        if (childNode && traverseNodes(childNode)) {
          return true;
        }
      }
    }
    return false;
  };

  traverseNodes(element);

  if (foundNode) {
    const range = document.createRange();
    range.setStart(foundNode, foundOffset);
    range.collapse(true);
    selection.removeAllRanges();
    selection.addRange(range);
  }
};

const handleContentEdit = (question: Question, field: keyof Question, event: Event) => {
  const target = event.target as HTMLDivElement;

  // Save cursor position before updating
  const cursorPos = saveCursorPosition(target);

  if (typeof question[field] === 'string') {
    (question[field] as string) = target.innerHTML;
  }

  // Restore cursor position after Vue re-render
  nextTick(() => {
    if (cursorPos !== null) {
      restoreCursorPosition(target, cursorPos);
    }
  });

  // Mark as edited after updating the value
  handleEdit(String(question.questionId!));
};

const handleOptionEdit = (question: Question, optionIndex: number, event: Event) => {
  const target = event.target as HTMLDivElement;

  // Save cursor position before updating
  const cursorPos = saveCursorPosition(target);

  if (question.options[optionIndex]) {
    question.options[optionIndex].text = target.innerHTML;
  }

  // Restore cursor position after Vue re-render
  nextTick(() => {
    if (cursorPos !== null) {
      restoreCursorPosition(target, cursorPos);
    }
  });

  // Mark as edited after updating the value
  handleEdit(String(question.questionId!));
};

const setCorrectAnswer = (question: Question, order: number) => {
  question.correct.order = order;
  const selectedOption = question.options.find(opt => opt.order === order);
  if (selectedOption) {
    question.correct.text = selectedOption.text;
  }
  handleEdit(String(question.questionId!));
};

const addOption = (question: Question) => {
  const newOrder = question.options.length + 1;
  question.options.push({
    order: newOrder,
    text: `Option ${String.fromCharCode(64 + newOrder)}: New option`,
    optionFiles: []
  });
  handleEdit(String(question.questionId!));
};

const getImageUrl = (imageData: string): string => {
  console.log('Getting image URL for data:', imageData);
  if (!imageData) return '';

  // If it's already a full URL, return it
  if (imageData.startsWith('http://') || imageData.startsWith('https://')) {
    return imageData;
  }

  // If it's a data URL (newly uploaded base64), return as is
  if (imageData.startsWith('data:')) {
    return imageData;
  }

  // If it looks like base64 data (long string without path separators), prepend data URL prefix
  if (imageData.length > 100 && !imageData.includes('/') && !imageData.includes('\\')) {
    return `data:image/jpeg;base64,${imageData}`;
  }

  // Otherwise, assume it's a file path from server - prepend ASSET_URL
  const assetsBaseUrl = import.meta.env.VITE_ASSETS_BASE_URL || '';
  return `${assetsBaseUrl}${imageData}`;
}

// const switchToSpreadsheet = () => {
//   router.push('/dashboard/assessment-spreadsheet');
// };

const toggleCardCollapse = (questionId: string, event?: Event) => {
  if (event) {
    event.stopPropagation();
  }

  if (collapsedCards.value.has(questionId)) {
    // Collapse all other cards (accordion behavior)
    const allQuestionIds = allQuestions.value.map(q => String(q.questionId));
    allQuestionIds.forEach(id => {
      if (id !== questionId) {
        collapsedCards.value.add(id);
      }
    });

    // Expand this card
    collapsedCards.value.delete(questionId);
  } else {
    // Collapse this card
    collapsedCards.value.add(questionId);
  }
};

const handleCardClick = (questionId: string, event: Event) => {
  // Only expand if the card is collapsed
  if (collapsedCards.value.has(questionId)) {
    // Don't trigger if clicking on interactive elements
    const target = event.target as HTMLElement;
    if (target.closest('button') || target.closest('input') || target.closest('select')) {
      return;
    }

    // Collapse all other cards (accordion behavior)
    const allQuestionIds = allQuestions.value.map(q => String(q.questionId));
    allQuestionIds.forEach(id => {
      if (id !== questionId) {
        collapsedCards.value.add(id);
      }
    });

    // Expand this card
    collapsedCards.value.delete(questionId);
  }
};

const deleteOption = (question: Question, optionIndex: number) => {
  if (question.options.length <= 2) {
    alert('A question must have at least 2 options');
    return;
  }

  const deletedOption = question.options[optionIndex];
  if (!deletedOption) return;

  question.options.splice(optionIndex, 1);

  // Re-order remaining options
  question.options.forEach((opt, idx) => {
    opt.order = idx + 1;
  });

  // Update correct answer if the deleted option was correct
  if (question.correct.order === deletedOption.order) {
    question.correct.order = 1;
    const firstOption = question.options[0];
    if (firstOption) {
      question.correct.text = firstOption.text;
    }
  } else if (question.correct.order > deletedOption.order) {
    question.correct.order--;
  }

  handleEdit(String(question.questionId!));
};

const deleteQuestion = (questionId: string) => {
  if (confirm('Are you sure you want to delete this question? This action cannot be undone.')) {
    const index = allQuestions.value.findIndex(q => String(q.questionId) === questionId);
    if (index !== -1) {
      allQuestions.value.splice(index, 1);
      editedQuestions.value.delete(questionId);
      collapsedCards.value.delete(questionId);
    }
  }
};

const nextTempId = (): number => {
  const id = tempIdCounter.value;
  tempIdCounter.value -= 1;
  return id;
};

const duplicateQuestion = (question: Question, event?: Event) => {
  if (event) {
    event.stopPropagation();
  }

  // Create a deep copy of the question
  const duplicatedQuestion: LocalQuestion = {
    questionId: nextTempId(),
    localId: `temp-${Date.now()}`,
    questionText: question.questionText,
    questionFiles: [...question.questionFiles.map(f => ({ ...f }))],
    instruction: question.instruction,
    topic: question.topic,
    passage: question.passage,
    explanation: question.explanation,
    questionType: question.questionType,
    options: question.options.map(opt => ({
      order: opt.order,
      text: opt.text,
      optionFiles: [...opt.optionFiles.map(f => ({ ...f }))]
    })),
    correct: {
      order: question.correct.order,
      text: question.correct.text
    },
    year: question.year
  };

  // Find the index of the current question and insert after it
  const currentIndex = allQuestions.value.findIndex(q => q.questionId === question.questionId);
  if (currentIndex !== -1) {
    allQuestions.value.splice(currentIndex + 1, 0, duplicatedQuestion);
    // Save to local draft only (don't trigger server save immediately)
    saveLocalDraft(String(duplicatedQuestion.questionId), duplicatedQuestion);
  }
};

const addQuestionAfter = (index: number) => {
  // Create a new blank question with empty fields (placeholders will show via CSS)
  const newQuestion: LocalQuestion = {
    questionId: nextTempId(),
    localId: `temp-${Date.now()}`,
    questionText: '',
    questionFiles: [],
    passage: '',
    explanation: '',
    questionType: 'multiple_choice',
    options: [
      { order: 1, text: '', optionFiles: [] },
      { order: 2, text: '', optionFiles: [] },
      { order: 3, text: '', optionFiles: [] },
      { order: 4, text: '', optionFiles: [] }
    ],
    correct: { order: 0, text: '' },  // No option selected initially
    year: selectedYear.value ? Number(selectedYear.value) : undefined
  };

  // Insert after the current index
  allQuestions.value.splice(index + 1, 0, newQuestion);
  // Expand the new question
  collapsedCards.value.delete(String(newQuestion.questionId));
  // Save to local draft only (don't trigger server save immediately)
  saveLocalDraft(String(newQuestion.questionId), newQuestion);
};

// Image upload handlers
const handleDragOver = (event: DragEvent, type: string, questionId: number, optIndex?: number) => {
  event.preventDefault();
  if (type === 'question') {
    isDragging.value = `question-${questionId}`;
  } else {
    isDragging.value = `option-${questionId}-${optIndex}`;
  }
};

const handleDragLeave = (event: DragEvent) => {
  event.preventDefault();
  isDragging.value = '';
};

const handleDrop = async (event: DragEvent, type: string, questionId: number, optIndex?: number) => {
  event.preventDefault();
  isDragging.value = '';

  const files = event.dataTransfer?.files;
  if (files && files.length > 0 && files[0]) {
    await processImageFile(files[0], type, questionId, optIndex);
  }
};

const triggerFileInput = (type: string, questionId: number, optIndex?: number) => {
  const selector = type === 'question'
    ? `input[data-input-id="question-${questionId}"]`
    : `input[data-input-id="option-${questionId}-${optIndex}"]`;

  const input = document.querySelector(selector) as HTMLInputElement;
  if (input) {
    input.click();
  }
};

const handleFileSelect = async (event: Event, type: string, questionId: number, optIndex?: number) => {
  const target = event.target as HTMLInputElement;
  const files = target.files;

  if (files && files.length > 0 && files[0]) {
    await processImageFile(files[0], type, questionId, optIndex);
  }

  // Reset input
  target.value = '';
};

const processImageFile = async (file: File, type: string, questionId: number, optIndex?: number) => {
  // Validate file type
  if (!file.type.startsWith('image/')) {
    alert('Please upload an image file');
    return;
  }

  // Validate file size (5MB)
  if (file.size > 5 * 1024 * 1024) {
    alert('Image size should not exceed 5MB');
    return;
  }

  // Convert to base64
  const reader = new FileReader();
  reader.onload = (e) => {
    const result = e.target?.result as string;

    const question = allQuestions.value.find(q => q.questionId === questionId);
    if (!question) return;

    // Extract pure base64 from Data URL (removes "data:image/...;base64," prefix)
    const base64String = result.split(',')[1] || result;

    if (type === 'question') {
      // Apply packaging rules for question images
      const existingFile = question.questionFiles?.[0];
      const newFile: QuestionFile = {
        file_name: file.name,
        old_file_name: existingFile?.file_name || '', // Rule 2: old_file_name if replacing, empty if new
        type: 'image',
        file: base64String
      };
      question.questionFiles = [newFile];
    } else if (type === 'option' && optIndex !== undefined) {
      const option = question.options[optIndex];
      if (option) {
        // Apply packaging rules for option images
        const existingFile = option.optionFiles?.[0];
        const newFile: QuestionFile = {
          file_name: file.name,
          old_file_name: existingFile?.file_name || '', // Rule 2: old_file_name if replacing, empty if new
          type: 'image',
          file: base64String
        };
        option.optionFiles = [newFile];
      }
    }

    handleEdit(String(questionId));
  };

  reader.readAsDataURL(file);
};

const deleteQuestionImage = (question: Question) => {
  question.questionFiles = [];
  handleEdit(String(question.questionId!));
};

const deleteOptionImage = (question: Question, optIndex: number) => {
  const option = question.options[optIndex];
  if (option) {
    option.optionFiles = [];
    handleEdit(String(question.questionId!));
  }
};

/**
 * Handle floating action card events
 */
const handleFloatingCardDuplicate = () => {
  // Get the active card element directly from the composable
  if (!activeCard.value.element) return;

  const activeIndex = allQuestions.value.findIndex(() => {
    const cards = document.querySelectorAll('.question-card');
    for (const card of cards) {
      if (card === activeCard.value.element) return true;
    }
    return false;
  });

  if (activeIndex !== -1 && allQuestions.value[activeIndex]) {
    duplicateQuestion(allQuestions.value[activeIndex]);
    // Scroll to the duplicated card (inserted right after current)
    nextTick(() => {
      const newCard = document.querySelectorAll('.question-card')[activeIndex + 1];
      if (newCard) {
        newCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });
  }
};

const handleFloatingCardAdd = () => {
  // Get the active card element directly from the composable
  if (!activeCard.value.element) return;

  const activeIndex = allQuestions.value.findIndex(() => {
    const cards = document.querySelectorAll('.question-card');
    for (const card of cards) {
      if (card === activeCard.value.element) return true;
    }
    return false;
  });

  if (activeIndex !== -1) {
    addQuestionAfter(activeIndex);
    // Scroll to the new card (inserted right after current)
    nextTick(() => {
      const newCard = document.querySelectorAll('.question-card')[activeIndex + 1];
      if (newCard) {
        newCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });
  }
};

const handleFloatingCardDelete = () => {
  // Get the active card element directly from the composable
  if (!activeCard.value.element) return;

  const activeIndex = allQuestions.value.findIndex(() => {
    const cards = document.querySelectorAll('.question-card');
    for (const card of cards) {
      if (card === activeCard.value.element) return true;
    }
    return false;
  });

  if (activeIndex !== -1 && allQuestions.value[activeIndex]) {
    deleteQuestion(String(allQuestions.value[activeIndex].questionId!));
  }
};
</script>
