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

        <!-- Questions List -->
        <div class="questions-wrapper">
            <div v-for="(question, index) in filteredQuestions" :key="question.id" class="question-card"
                :class="{ 'is-edited': editedQuestions.has(question.id) }">
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
                </div>

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
                    <div class="image-input-group">
                        <input v-model="question.questionImage" type="text" class="image-input"
                            placeholder="Enter image URL or filename" @input="handleEdit(question.id)" />
                        <div v-if="question.questionImage" class="image-preview">
                            <img :src="getImageUrl(question.questionImage)" :alt="'Question ' + (index + 1)" />
                        </div>
                    </div>
                </div>

                <!-- Multiple Choice Options -->
                <div v-if="question.questionType === 'multiple_choice'" class="form-section">
                    <label class="section-label">Options</label>
                    <div class="options-list">
                        <div v-for="(option, optIndex) in question.options" :key="optIndex" class="option-item">
                            <div class="option-header">
                                <input type="radio" :name="`correct-${question.id}`"
                                    :checked="question.correct.order === option.order"
                                    @change="setCorrectAnswer(question, option.order)" />
                                <span class="option-label">{{ String.fromCharCode(65 + optIndex) }}</span>
                            </div>
                            <div class="option-content">
                                <div class="editable-content option-text" contenteditable="true"
                                    @blur="(e) => handleOptionEdit(question, optIndex, e)"
                                    @input="handleEdit(question.id)" v-html="option.text"></div>
                                <div class="image-input-group">
                                    <input v-model="option.image" type="text" class="image-input small"
                                        placeholder="Option image URL" @input="handleEdit(question.id)" />
                                    <div v-if="option.image" class="image-preview small">
                                        <img :src="getImageUrl(option.image)"
                                            :alt="`Option ${String.fromCharCode(65 + optIndex)}`" />
                                    </div>
                                </div>
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
                    <input v-model="question.correct.text" type="text" class="answer-input"
                        placeholder="Expected answer" @input="handleEdit(question.id)" />
                </div>

                <!-- Explanation -->
                <div class="form-section">
                    <label class="section-label">Explanation</label>
                    <div class="editable-content" contenteditable="true"
                        @blur="(e) => handleContentEdit(question, 'explanation', e)" @input="handleEdit(question.id)"
                        v-html="question.explanation || 'Click to add explanation...'"></div>
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
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';

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
                        questionImage: i % 2 === 0 ? 'https://via.placeholder.com/600x300?text=Question+Diagram' : '',
                        passage: i % 3 === 0 ? `Read the following passage carefully: This is a sample passage that provides context for the question. It may contain important information needed to answer correctly.` : '',
                        instruction: i === 0 ? 'Choose the most appropriate answer from the options below.' : '',
                        options: [
                            { order: 1, text: 'Option A: First possible answer', image: i % 3 === 0 ? 'https://via.placeholder.com/200x150?text=Option+A' : '' },
                            { order: 2, text: 'Option B: Second possible answer', image: '' },
                            { order: 3, text: 'Option C: Third possible answer', image: i % 4 === 0 ? 'https://via.placeholder.com/200x150?text=Option+C' : '' },
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
const savedIndicator = ref(false);
const isSaving = ref(false);
const editMode = ref(true);

// Filter state
const searchQuery = ref('');
const selectedProgram = ref('');
const selectedCourse = ref('');
const selectedYear = ref<number | ''>('');

// Computed
const filteredCourses = computed(() => {
    if (!selectedProgram.value) return courses;
    return courses;
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
    router.push('/dashboard/question-spreadsheet');
};
</script>

<style scoped>
.form-container {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
    background: #f3f4f6;
}

.filter-bar {
    position: sticky;
    top: 0;
    z-index: 20;
    background: white;
    border-bottom: 1px solid #e5e7eb;
    padding: 12px 16px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
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

.questions-wrapper {
    flex: 1;
    max-width: 800px;
    margin: 0 auto;
    width: 100%;
    padding: 24px 16px;
}

.question-card {
    background: white;
    border-radius: 12px;
    padding: 24px;
    margin-bottom: 24px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    transition: all 0.3s ease;
    animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
    from {
        opacity: 0;
        transform: translateY(20px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.question-card.is-edited {
    border-left: 4px solid #fbbf24;
    box-shadow: 0 4px 12px rgba(251, 191, 36, 0.2);
}

.question-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding-bottom: 16px;
    border-bottom: 2px solid #f3f4f6;
}

.question-number {
    font-size: 16px;
    font-weight: 700;
    color: #667eea;
}

.question-meta {
    display: flex;
    gap: 8px;
    align-items: center;
}

.meta-select,
.meta-input {
    padding: 6px 10px;
    border: 1px solid #e5e7eb;
    border-radius: 6px;
    font-size: 13px;
    transition: all 0.2s ease;
    outline: none;
}

.meta-input.small {
    width: 80px;
}

.meta-select:focus,
.meta-input:focus {
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-section {
    margin-bottom: 20px;
}

.section-label {
    display: block;
    font-size: 14px;
    font-weight: 600;
    color: #374151;
    margin-bottom: 8px;
}

.required {
    color: #ef4444;
}

.editable-content {
    min-height: 40px;
    padding: 12px;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    background: #f9fafb;
    cursor: text;
    transition: all 0.2s ease;
    line-height: 1.6;
}

.editable-content:hover {
    border-color: #667eea;
    background: white;
}

.editable-content:focus {
    outline: none;
    border-color: #667eea;
    background: white;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.editable-content:empty:before {
    content: attr(placeholder);
    color: #9ca3af;
}

.question-text {
    font-size: 16px;
    font-weight: 500;
}

.image-input-group {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.image-input {
    padding: 10px 12px;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    font-size: 14px;
    transition: all 0.2s ease;
    outline: none;
}

.image-input.small {
    padding: 6px 10px;
    font-size: 13px;
}

.image-input:focus {
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.image-preview {
    border-radius: 8px;
    overflow: hidden;
    border: 2px solid #e5e7eb;
    max-width: 100%;
}

.image-preview.small {
    max-width: 200px;
}

.image-preview img {
    width: 100%;
    height: auto;
    display: block;
}

.options-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.option-item {
    display: flex;
    gap: 12px;
    padding: 16px;
    background: #f9fafb;
    border-radius: 8px;
    border: 1px solid #e5e7eb;
    transition: all 0.2s ease;
}

.option-item:hover {
    background: white;
    border-color: #667eea;
}

.option-header {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    padding-top: 8px;
}

.option-header input[type="radio"] {
    width: 20px;
    height: 20px;
    cursor: pointer;
}

.option-label {
    font-weight: 700;
    color: #667eea;
    font-size: 14px;
}

.option-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.option-text {
    font-size: 14px;
}

.add-option-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 16px;
    background: white;
    border: 2px dashed #d1d5db;
    border-radius: 8px;
    color: #6b7280;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    width: 100%;
    justify-content: center;
}

.add-option-btn:hover {
    border-color: #667eea;
    color: #667eea;
    background: #f9fafb;
}

.answer-input {
    width: 100%;
    padding: 12px;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    font-size: 14px;
    transition: all 0.2s ease;
    outline: none;
}

.answer-input:focus {
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 64px 24px;
    text-align: center;
    color: #9ca3af;
}

.empty-state svg {
    margin-bottom: 16px;
}

.empty-state h3 {
    font-size: 20px;
    font-weight: 600;
    color: #4b5563;
    margin: 0 0 8px 0;
}

.empty-state p {
    font-size: 14px;
    margin: 0;
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
    z-index: 100;
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
</style>
