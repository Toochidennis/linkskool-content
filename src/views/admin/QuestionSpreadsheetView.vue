<template>
  <div class="spreadsheet-container">
    <!-- Filter Bar -->
    <div class="filter-bar">
      <div class="filter-header">
        <h1 class="title">Assessment View</h1>
        <div class="filter-actions">
          <div class="filter-stats">
            <span class="stat-badge">{{ filteredQuestions.length }} questions</span>
            <span class="stat-badge success">{{ savedIndicator ? 'Saved' : 'Ready' }}</span>
          </div>
          <button class="view-toggle-btn" @click="switchToForm">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="18" height="18">
              <path
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Form View
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
          <option value="">All Programs</option>
          <option v-for="program in programs" :key="program" :value="program">
            {{ program }}
          </option>
        </select>

        <select v-model="selectedCourse" class="filter-select">
          <option value="">All Courses</option>
          <option v-for="course in filteredCourses" :key="course" :value="course">
            {{ course }}
          </option>
        </select>

        <select v-model="selectedYear" class="filter-select">
          <option value="">All Years</option>
          <option v-for="year in years" :key="year" :value="year">
            {{ year }}
          </option>
        </select>
      </div>
    </div>

    <!-- Spreadsheet Table -->
    <div class="spreadsheet-wrapper" @scroll="handleScroll">
      <table class="spreadsheet-table">
        <thead class="spreadsheet-header" :class="{ 'is-sticky': isHeaderSticky }">
          <tr>
            <th class="cell-header cell-index">#</th>
            <th class="cell-header cell-type">Type</th>
            <th class="cell-header cell-passage">Passage</th>
            <th class="cell-header cell-instruction">Instruction</th>
            <th class="cell-header cell-question">Question</th>
            <th class="cell-header cell-question-image">Question Image</th>
            <template v-if="maxOptionsCount > 0">
              <template v-for="i in maxOptionsCount" :key="i">
                <th class="cell-header cell-option">Option {{ String.fromCharCode(64 + i) }} Text</th>
                <th class="cell-header cell-option-image">Option {{ String.fromCharCode(64 + i) }} Image</th>
              </template>
            </template>
            <th class="cell-header cell-answer">Correct Answer</th>
            <th class="cell-header cell-topic">Topic</th>
            <th class="cell-header cell-explanation">Explanation</th>
            <th class="cell-header cell-year">Year</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(question, index) in filteredQuestions" :key="question.id" class="spreadsheet-row"
            :class="{ 'row-edited': editedQuestions.has(question.id) }">
            <td class="cell cell-index">{{ index + 1 }}</td>
            <td class="cell cell-type">
              <select v-model="question.questionType" class="cell-select" @change="handleCellEdit(question.id)">
                <option value="multiple_choice">Multiple Choice</option>
                <option value="short_answer">Short Answer</option>
              </select>
            </td>
            <td class="cell cell-passage" @click="toggleExpand(question.id, 'passage')">
              <div class="cell-content" :class="{ 'is-expanded': expandedCells.has(`${question.id}-passage`) }"
                contenteditable="true" @blur="(e) => handleRichTextEdit(question, 'passage', e)"
                @input="handleCellEdit(question.id)" v-html="question.passage"></div>
            </td>
            <td class="cell cell-instruction" @click="toggleExpand(question.id, 'instruction')">
              <div class="cell-content" :class="{ 'is-expanded': expandedCells.has(`${question.id}-instruction`) }"
                contenteditable="true" @blur="(e) => handleRichTextEdit(question, 'instruction', e)"
                @input="handleCellEdit(question.id)" v-html="question.instruction"></div>
            </td>
            <td class="cell cell-question" @click="toggleExpand(question.id, 'question')">
              <div class="cell-content" :class="{ 'is-expanded': expandedCells.has(`${question.id}-question`) }"
                contenteditable="true" @blur="(e) => handleRichTextEdit(question, 'questionText', e)"
                @input="handleCellEdit(question.id)" v-html="question.questionText"></div>
            </td>
            <td class="cell cell-question-image">
              <input v-model="question.questionImage" type="text" class="cell-input" placeholder="Image URL or filename"
                @input="handleCellEdit(question.id)" />
            </td>
            <template v-for="i in maxOptionsCount" :key="`option-${i}`">
              <td class="cell cell-option">
                <div v-if="question.options[i - 1]" class="cell-content"
                  :class="{ 'is-expanded': expandedCells.has(`${question.id}-option-${i}-text`) }"
                  contenteditable="true" @click="toggleExpand(question.id, `option-${i}-text`)"
                  @blur="(e) => handleOptionTextEdit(question, i - 1, e)" @input="handleCellEdit(question.id)"
                  v-html="question.options[i - 1].text"></div>
                <div v-else class="cell-empty">-</div>
              </td>
              <td class="cell cell-option-image">
                <input v-if="question.options[i - 1]" v-model="question.options[i - 1].image" type="text"
                  class="cell-input" placeholder="Image URL or filename" @input="handleCellEdit(question.id)" />
                <div v-else class="cell-empty">-</div>
              </td>
            </template>
            <td class="cell cell-answer">
              <select v-model="question.correct.order" class="cell-select" @change="handleCellEdit(question.id)">
                <option v-for="(option, idx) in question.options" :key="idx" :value="idx + 1">
                  {{ String.fromCharCode(65 + idx) }}
                </option>
              </select>
            </td>
            <td class="cell cell-topic">
              <input v-model="question.topic" type="text" class="cell-input" @input="handleCellEdit(question.id)" />
            </td>
            <td class="cell cell-explanation" @click="toggleExpand(question.id, 'explanation')">
              <div class="cell-content" :class="{ 'is-expanded': expandedCells.has(`${question.id}-explanation`) }"
                contenteditable="true" @blur="(e) => handleRichTextEdit(question, 'explanation', e)"
                @input="handleCellEdit(question.id)" v-html="question.explanation"></div>
            </td>
            <td class="cell cell-year">
              <input v-model.number="question.year" type="number" class="cell-input"
                @input="handleCellEdit(question.id)" />
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Loading Indicator -->
      <div v-if="isSaving" class="saving-indicator">
        <div class="spinner"></div>
        <span>Saving changes...</span>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

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

// Dummy Data
const programs = ['JAMB', 'WAEC', 'NECO', 'POST-UTME'];
const courses = ['Mathematics', 'English', 'Physics', 'Chemistry', 'Biology', 'Economics'];
const years = [2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015];

// Generate dummy questions
const generateDummyQuestions = (): Question[] => {
  const questions: Question[] = [];
  let id = 1;

  programs.forEach((program) => {
    courses.slice(0, 3).forEach((course) => {
      years.slice(0, 3).forEach((year) => {
        for (let i = 0; i < 5; i++) {
          questions.push({
            id: `q-${id++}`,
            year,
            program,
            course,
            questionType: Math.random() > 0.2 ? 'multiple_choice' : 'short_answer',
            questionText: `What is the ${course.toLowerCase()} concept related to <strong>topic ${i + 1}</strong> in ${year}? This question tests your understanding of fundamental principles.`,
            questionImage: i % 2 === 0 ? 'question_diagram.png' : '',
            passage: i % 3 === 0 ? `Read the following passage carefully: This is a sample passage that provides context for the question. It may contain important information needed to answer correctly.` : '',
            instruction: i === 0 ? 'Choose the most appropriate answer from the options below.' : '',
            options: [
              { order: 1, text: 'Option A: First possible answer', image: 'option_a.png' },
              { order: 2, text: 'Option B: Second possible answer', image: '' },
              { order: 3, text: 'Option C: Third possible answer', image: 'option_c.png' },
              { order: 4, text: 'Option D: Fourth possible answer', image: '' },
            ],
            correct: {
              order: Math.floor(Math.random() * 4) + 1,
              text: 'Option A',
            },
            topic: `Topic ${i + 1}`,
            explanation: `The correct answer is explained by considering the fundamental principles of ${course.toLowerCase()}. This concept is crucial for understanding advanced topics.`,
          });
        }
      });
    });
  });

  return questions;
};

const allQuestions = ref<Question[]>(generateDummyQuestions());
const editedQuestions = ref(new Set<string>());
const expandedCells = ref(new Set<string>());
const savedIndicator = ref(false);
const isSaving = ref(false);
const isHeaderSticky = ref(false);

// Filter state
const searchQuery = ref('');
const selectedProgram = ref('');
const selectedCourse = ref('');
const selectedYear = ref<number | ''>('');

// Computed
const maxOptionsCount = computed(() => {
  return Math.max(...allQuestions.value.map(q => q.options.length), 4);
});

const filteredCourses = computed(() => {
  if (!selectedProgram.value) return courses;
  return courses; // In a real app, filter courses by program
});

const filteredQuestions = computed(() => {
  return allQuestions.value.filter((q) => {
    const matchesSearch =
      !searchQuery.value ||
      q.questionText.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      q.topic.toLowerCase().includes(searchQuery.value.toLowerCase());

    const matchesProgram = !selectedProgram.value || q.program === selectedProgram.value;
    const matchesCourse = !selectedCourse.value || q.course === selectedCourse.value;
    const matchesYear = !selectedYear.value || q.year === selectedYear.value;

    return matchesSearch && matchesProgram && matchesCourse && matchesYear;
  });
});

// Auto-save functionality
let saveTimeout: ReturnType<typeof setTimeout>;

const handleCellEdit = (questionId: string) => {
  editedQuestions.value.add(questionId);

  clearTimeout(saveTimeout);
  isSaving.value = true;

  saveTimeout = setTimeout(() => {
    saveChanges();
  }, 1000); // Auto-save after 1 second of inactivity
};

const saveChanges = () => {
  // Simulate API call
  setTimeout(() => {
    isSaving.value = false;
    savedIndicator.value = true;

    setTimeout(() => {
      savedIndicator.value = false;
      editedQuestions.value.clear();
    }, 2000);
  }, 500);
};

const handleRichTextEdit = (question: Question, field: string, event: Event) => {
  const target = event.target as HTMLDivElement;
  (question as any)[field] = target.innerHTML;
};

const handleOptionTextEdit = (question: Question, optionIndex: number, event: Event) => {
  const target = event.target as HTMLDivElement;
  question.options[optionIndex].text = target.innerHTML;
};

const toggleExpand = (questionId: string, cellType: string) => {
  const key = `${questionId}-${cellType}`;
  if (expandedCells.value.has(key)) {
    expandedCells.value.delete(key);
  } else {
    expandedCells.value.add(key);
  }
};

const handleScroll = (event: Event) => {
  const target = event.target as HTMLDivElement;
  isHeaderSticky.value = target.scrollTop > 0;
};

const switchToForm = () => {
  router.push('/dashboard/question-form');
};
</script>

<style scoped>
.spreadsheet-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #f9fafb;
  gap: 0;
}

.filter-bar {
  position: sticky;
  top: 0;
  z-index: 20;
  background: white;
  border-bottom: 1px solid #e5e7eb;
  padding: 12px 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  animation: slideDown 0.5s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.filter-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.filter-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.title {
  font-size: 18px;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
}

.filter-stats {
  display: flex;
  gap: 12px;
}

.view-toggle-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.view-toggle-btn:hover {
  background: #5568d3;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.stat-badge {
  padding: 4px 10px;
  border-radius: 12px;
  background: #f3f4f6;
  color: #4b5563;
  font-size: 12px;
  font-weight: 600;
  transition: all 0.3s ease;
}

.stat-badge.success {
  background: #10b981;
  color: white;
  animation: pulse 2s infinite;
}

@keyframes pulse {

  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0.7;
  }
}

.filter-controls {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  gap: 12px;
}

.search-box {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 12px;
  width: 18px;
  height: 18px;
  color: #9ca3af;
  pointer-events: none;
}

.search-input {
  width: 100%;
  padding: 8px 12px 8px 40px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.3s ease;
  outline: none;
}

.search-input:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.filter-select {
  padding: 8px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  background: white;
  cursor: pointer;
  transition: all 0.3s ease;
  outline: none;
}

.filter-select:hover {
  border-color: #667eea;
}

.filter-select:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.spreadsheet-wrapper {
  flex: 1;
  overflow: auto;
  background: white;
  animation: fadeIn 0.5s ease-out 0.1s both;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.98);
  }

  to {
    opacity: 1;
    transform: scale(1);
  }
}

.spreadsheet-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
}

.spreadsheet-header {
  position: sticky;
  top: 0;
  z-index: 10;
  background: #f9fafb;
  transition: all 0.3s ease;
}

.spreadsheet-header.is-sticky {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.cell-header {
  padding: 10px 12px;
  text-align: left;
  font-weight: 600;
  font-size: 12px;
  color: #374151;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-bottom: 2px solid #e5e7eb;
  white-space: nowrap;
  background: #f9fafb;
}

.spreadsheet-row {
  transition: all 0.2s ease;
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-10px);
  }

  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.spreadsheet-row:hover {
  background: #f9fafb;
}

.spreadsheet-row.row-edited {
  background: #fef3c7;
  animation: highlight 0.5s ease-out;
}

@keyframes highlight {
  0% {
    background: #fef3c7;
  }

  50% {
    background: #fde68a;
  }

  100% {
    background: #fef3c7;
  }
}

.cell {
  padding: 8px 12px;
  border-bottom: 1px solid #e5e7eb;
  vertical-align: top;
}

.cell-index {
  width: 60px;
  font-weight: 600;
  color: #9ca3af;
}

.cell-year {
  min-width: 120px;
  width: 120px;
}

.cell-type {
  min-width: 180px;
  width: 180px;
}

.cell-passage,
.cell-instruction {
  min-width: 250px;
  max-width: 350px;
}

.cell-question-image {
  min-width: 200px;
  max-width: 250px;
}

.cell-question,
.cell-explanation {
  min-width: 300px;
  max-width: 400px;
}

.cell-option {
  min-width: 250px;
  max-width: 350px;
}

.cell-option-image {
  min-width: 200px;
  max-width: 250px;
}

.cell-answer {
  width: 120px;
}

.cell-topic {
  min-width: 250px;
  width: 250px;
}

.cell-empty {
  color: #d1d5db;
  font-style: italic;
  text-align: center;
  padding: 8px;
}

.cell-input,
.cell-select {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.2s ease;
  outline: none;
  background: white;
}

.cell-input:focus,
.cell-select:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.cell-content {
  max-height: 60px;
  overflow: hidden;
  cursor: pointer;
  padding: 8px 12px;
  border: 1px solid transparent;
  border-radius: 8px;
  transition: all 0.3s ease;
  line-height: 1.6;
}

.cell-content:hover {
  border-color: #667eea;
  background: #f9fafb;
}

.cell-content.is-expanded {
  max-height: none;
  border-color: #667eea;
  background: #f9fafb;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.1);
}

.cell-content[contenteditable="true"]:focus {
  outline: none;
  border-color: #667eea;
  background: white;
}

.options-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.option-item {
  display: flex;
  gap: 8px;
  align-items: flex-start;
}

.option-label {
  font-weight: 600;
  color: #667eea;
  min-width: 24px;
}

.option-text {
  flex: 1;
  padding: 4px 8px;
  border: 1px solid transparent;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.option-text:hover {
  border-color: #667eea;
  background: white;
}

.option-text[contenteditable="true"]:focus {
  outline: none;
  border-color: #667eea;
  background: white;
}

.saving-indicator {
  position: fixed;
  bottom: 32px;
  right: 32px;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 24px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
  font-weight: 600;
  color: #374151;
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.spinner {
  width: 20px;
  height: 20px;
  border: 3px solid #e5e7eb;
  border-top-color: #667eea;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}



/* Custom scrollbar */
.spreadsheet-wrapper::-webkit-scrollbar {
  width: 12px;
  height: 12px;
}

.spreadsheet-wrapper::-webkit-scrollbar-track {
  background: #f3f4f6;
  border-radius: 6px;
}

.spreadsheet-wrapper::-webkit-scrollbar-thumb {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 6px;
}

.spreadsheet-wrapper::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(135deg, #5568d3 0%, #6a3f8f 100%);
}
</style>
