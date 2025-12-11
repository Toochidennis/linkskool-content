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
          <button class="view-toggle-btn" @click="switchToSpreadsheet">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="18" height="18">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <line x1="9" y1="3" x2="9" y2="21" />
              <line x1="15" y1="3" x2="15" y2="21" />
              <line x1="3" y1="9" x2="21" y2="9" />
              <line x1="3" y1="15" x2="21" y2="15" />
            </svg>
            Spreadsheet View
          </button>
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
      </div>
    </div>

    <!-- Questions List -->
    <div class="questions-wrapper">
      <div v-for="(question, index) in filteredQuestions" :key="question.id" class="question-card"
        :class="{ 'is-edited': editedQuestions.has(question.id), 'is-collapsed': collapsedCards.has(question.id) }"
        @click="handleCardClick(question.id, $event)">
        <!-- Question Header -->
        <div class="question-header">
          <div class="question-number">Question {{ index + 1 }}</div>
          <div class="question-meta">
            <select v-model="question.questionType" class="meta-select" @change="handleEdit(question.id)">
              <option value="multiple_choice">Multiple Choice</option>
              <option value="short_answer">Short Answer</option>
            </select>
            <input v-model.number="question.year" type="number" class="meta-input small" placeholder="Year"
              @input="handleEdit(question.id)" />
            <input v-model="question.topic" type="text" class="meta-input" placeholder="Topic"
              @input="handleEdit(question.id)" />
          </div>
          <div class="question-actions">
            <button class="icon-btn collapse-btn" @click="toggleCardCollapse(question.id, $event)"
              :title="collapsedCards.has(question.id) ? 'Expand' : 'Collapse'">
              <svg v-if="collapsedCards.has(question.id)" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                width="18" height="18">
                <polyline points="18 15 12 9 6 15"></polyline>
              </svg>
              <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" width="18" height="18">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </button>
            <button class="icon-btn delete-btn" @click="deleteQuestion(question.id)" title="Delete question">
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
        <div v-if="collapsedCards.has(question.id)" class="question-preview">
          <!-- Question Text Preview -->
          <div class="preview-question" v-html="question.questionText"></div>

          <!-- Multiple Choice Options Preview -->
          <div v-if="question.questionType === 'multiple_choice'" class="preview-options">
            <div v-for="(option, optIndex) in question.options" :key="optIndex" class="preview-option-item">
              <input type="radio" :name="`preview-${question.id}`" disabled
                :checked="question.correct.order === option.order" />
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
              @blur="(e) => handleContentEdit(question, 'passage', e)" @input="handleEdit(question.id)"
              v-html="question.passage || 'Click to add passage...'"></div>
          </div>

          <!-- Instruction Section -->
          <div v-if="question.instruction || editMode" class="form-section">
            <label class="section-label">Instruction</label>
            <div class="editable-content" contenteditable="true"
              @blur="(e) => handleContentEdit(question, 'instruction', e)" @input="handleEdit(question.id)"
              v-html="question.instruction || 'Click to add instruction...'"></div>
          </div>

          <!-- Question Text -->
          <div class="form-section">
            <label class="section-label">
              Question <span class="required">*</span>
            </label>
            <div class="editable-content question-text" contenteditable="true"
              @blur="(e) => handleContentEdit(question, 'questionText', e)" @input="handleEdit(question.id)"
              v-html="question.questionText"></div>
          </div>

          <!-- Question Image -->
          <div class="form-section">
            <label class="section-label">Question Image</label>
            <div v-if="question.questionImage" class="image-preview-container">
              <img :src="getImageUrl(question.questionImage)" :alt="'Question ' + (index + 1)" class="uploaded-image" />
              <button class="delete-image-btn" @click="deleteQuestionImage(question)" title="Delete image">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="16" height="16">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            <div v-else class="image-upload-zone" @dragover.prevent="handleDragOver($event, 'question', question.id)"
              @dragleave.prevent="handleDragLeave($event, 'question', question.id)"
              @drop.prevent="handleDrop($event, 'question', question.id)"
              @click="triggerFileInput('question', question.id)"
              :class="{ 'dragging': isDragging === `question-${question.id}` }">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="32" height="32" class="upload-icon">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="17 8 12 3 7 8"></polyline>
                <line x1="12" y1="3" x2="12" y2="15"></line>
              </svg>
              <p class="upload-text">Click or drag image here</p>
              <p class="upload-hint">PNG, JPG up to 5MB</p>
            </div>
            <input type="file" :ref="`questionImageInput-${question.id}`" accept="image/*" style="display: none"
              @change="handleFileSelect($event, 'question', question.id)" />
          </div>

          <!-- Multiple Choice Options -->
          <div v-if="question.questionType === 'multiple_choice'" class="form-section">
            <label class="section-label">Options</label>
            <div class="options-list">
              <div v-for="(option, optIndex) in question.options" :key="optIndex" class="option-item">
                <div class="option-row">
                  <input type="radio" :name="`correct-${question.id}`"
                    :checked="question.correct.order === option.order"
                    @change="setCorrectAnswer(question, option.order)" class="option-radio" />
                  <div class="editable-content option-text" contenteditable="true"
                    @blur="(e) => handleOptionEdit(question, optIndex, e)" @input="handleEdit(question.id)"
                    v-html="option.text"></div>
                  <button class="icon-btn delete-option-btn" @click="deleteOption(question, optIndex)"
                    title="Delete option">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="16" height="16">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                </div>
                <div class="option-image-section">
                  <div v-if="option.image" class="image-preview-container small">
                    <img :src="getImageUrl(option.image)" :alt="`Option ${optIndex + 1}`" class="uploaded-image" />
                    <button class="delete-image-btn" @click="deleteOptionImage(question, optIndex)"
                      title="Delete image">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="14" height="14">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                      </svg>
                    </button>
                  </div>
                  <div v-else class="image-upload-zone small"
                    @dragover.prevent="handleDragOver($event, 'option', question.id, optIndex)"
                    @dragleave.prevent="handleDragLeave($event, 'option', question.id, optIndex)"
                    @drop.prevent="handleDrop($event, 'option', question.id, optIndex)"
                    @click="triggerFileInput('option', question.id, optIndex)"
                    :class="{ 'dragging': isDragging === `option-${question.id}-${optIndex}` }">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="20" height="20"
                      class="upload-icon">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                      <polyline points="17 8 12 3 7 8"></polyline>
                      <line x1="12" y1="3" x2="12" y2="15"></line>
                    </svg>
                    <p class="upload-text-small">Add image</p>
                  </div>
                  <input type="file" :ref="`optionImageInput-${question.id}-${optIndex}`" accept="image/*"
                    style="display: none" @change="handleFileSelect($event, 'option', question.id, optIndex)" />
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
              @input="handleEdit(question.id)" />
          </div>

          <!-- Explanation -->
          <div class="form-section">
            <label class="section-label">Explanation</label>
            <div class="editable-content" contenteditable="true"
              @blur="(e) => handleContentEdit(question, 'explanation', e)" @input="handleEdit(question.id)"
              v-html="question.explanation || 'Click to add explanation...'"></div>
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
        <p>Try adjusting your filters</p>
      </div>
    </div>

    <!-- Saving Indicator -->
    <div v-if="isSaving" class="saving-indicator">
      <div class="spinner"></div>
      <span>Saving changes...</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useFilters } from '@/composables/useFilters';

interface Option {
  order: number;
  text: string;
  image: string;
}

interface Question {
  id: string;
  year: number;
  program: string;
  course: string;
  questionType: 'multiple_choice' | 'short_answer';
  questionText: string;
  questionImage: string;
  passage: string;
  instruction: string;
  options: Option[];
  correct: {
    order: number;
    text: string;
  };
  topic: string;
  explanation: string;
}

const router = useRouter();

// Filters
const { filters, fetchFilters } = useFilters();

const allQuestions = ref<Question[]>([]);
const editedQuestions = ref(new Set<string>());
const savedIndicator = ref(false);
const isSaving = ref(false);
const editMode = ref(true);
const collapsedCards = ref(new Set<string>());
const isDragging = ref<string>('');

// Filter state
const searchQuery = ref('');
const selectedProgram = ref('');
const selectedCourse = ref('');
const selectedYear = ref<string | ''>('');

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
      q.topic.toLowerCase().includes(searchQuery.value.toLowerCase());

    const matchesProgram = !selectedProgram.value || q.program === selectedProgram.value;
    const matchesCourse = !selectedCourse.value || q.course === selectedCourse.value;
    const matchesYear = !selectedYear.value || q.year.toString() === selectedYear.value;

    return matchesSearch && matchesProgram && matchesCourse && matchesYear;
  });
});

// Fetch filters on mount and set initial selections
onMounted(async () => {
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

// Auto-save functionality
let saveTimeout: ReturnType<typeof setTimeout>;

const handleEdit = (questionId: string) => {
  editedQuestions.value.add(questionId);
  clearTimeout(saveTimeout);
  isSaving.value = true;

  saveTimeout = setTimeout(() => {
    saveChanges();
  }, 1000);
};

const saveChanges = () => {
  setTimeout(() => {
    isSaving.value = false;
    savedIndicator.value = true;

    setTimeout(() => {
      savedIndicator.value = false;
      editedQuestions.value.clear();
    }, 2000);
  }, 500);
};

const handleContentEdit = (question: Question, field: keyof Question, event: Event) => {
  const target = event.target as HTMLDivElement;
  if (typeof question[field] === 'string') {
    (question[field] as string) = target.innerHTML;
  }
};

const handleOptionEdit = (question: Question, optionIndex: number, event: Event) => {
  const target = event.target as HTMLDivElement;
  if (question.options[optionIndex]) {
    question.options[optionIndex].text = target.innerHTML;
  }
};

const setCorrectAnswer = (question: Question, order: number) => {
  question.correct.order = order;
  const selectedOption = question.options.find(opt => opt.order === order);
  if (selectedOption) {
    question.correct.text = selectedOption.text;
  }
  handleEdit(question.id);
};

const addOption = (question: Question) => {
  const newOrder = question.options.length + 1;
  question.options.push({
    order: newOrder,
    text: `Option ${String.fromCharCode(64 + newOrder)}: New option`,
    image: ''
  });
  handleEdit(question.id);
};

const getImageUrl = (url: string): string => {
  // If it's already a full URL, return it
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  // Otherwise, treat it as a filename and return placeholder
  return `https://via.placeholder.com/400x300?text=${encodeURIComponent(url)}`;
};

const switchToSpreadsheet = () => {
  router.push('/dashboard/assessment-spreadsheet');
};

const toggleCardCollapse = (questionId: string, event?: Event) => {
  if (event) {
    event.stopPropagation();
  }

  if (collapsedCards.value.has(questionId)) {
    // Collapse all other cards (accordion behavior)
    const allQuestionIds = allQuestions.value.map(q => q.id);
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
    const allQuestionIds = allQuestions.value.map(q => q.id);
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

  handleEdit(question.id);
};

const deleteQuestion = (questionId: string) => {
  if (confirm('Are you sure you want to delete this question? This action cannot be undone.')) {
    const index = allQuestions.value.findIndex(q => q.id === questionId);
    if (index !== -1) {
      allQuestions.value.splice(index, 1);
      editedQuestions.value.delete(questionId);
      collapsedCards.value.delete(questionId);
    }
  }
};

// Image upload handlers
const handleDragOver = (event: DragEvent, type: string, questionId: string, optIndex?: number) => {
  event.preventDefault();
  if (type === 'question') {
    isDragging.value = `question-${questionId}`;
  } else {
    isDragging.value = `option-${questionId}-${optIndex}`;
  }
};

const handleDragLeave = (event: DragEvent, type: string, questionId: string, optIndex?: number) => {
  event.preventDefault();
  isDragging.value = '';
};

const handleDrop = async (event: DragEvent, type: string, questionId: string, optIndex?: number) => {
  event.preventDefault();
  isDragging.value = '';

  const files = event.dataTransfer?.files;
  if (files && files.length > 0 && files[0]) {
    await processImageFile(files[0], type, questionId, optIndex);
  }
};

const triggerFileInput = (type: string, questionId: string, optIndex?: number) => {
  const refKey = type === 'question'
    ? `questionImageInput-${questionId}`
    : `optionImageInput-${questionId}-${optIndex}`;

  const input = document.querySelector(`input[ref="${refKey}"]`) as HTMLInputElement;
  if (input) {
    input.click();
  }
};

const handleFileSelect = async (event: Event, type: string, questionId: string, optIndex?: number) => {
  const target = event.target as HTMLInputElement;
  const files = target.files;

  if (files && files.length > 0 && files[0]) {
    await processImageFile(files[0], type, questionId, optIndex);
  }

  // Reset input
  target.value = '';
};

const processImageFile = async (file: File, type: string, questionId: string, optIndex?: number) => {
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

    const question = allQuestions.value.find(q => q.id === questionId);
    if (!question) return;

    if (type === 'question') {
      question.questionImage = result;
    } else if (type === 'option' && optIndex !== undefined) {
      const option = question.options[optIndex];
      if (option) {
        option.image = result;
      }
    }

    handleEdit(questionId);
  };

  reader.readAsDataURL(file);
};

const deleteQuestionImage = (question: Question) => {
  question.questionImage = '';
  handleEdit(question.id);
};

const deleteOptionImage = (question: Question, optIndex: number) => {
  const option = question.options[optIndex];
  if (option) {
    option.image = '';
    handleEdit(question.id);
  }
};
</script>
