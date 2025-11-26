<template>
  <div class="space-y-8">
    <div>
      <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">Exams</h2>
      <p class="text-gray-600 dark:text-gray-400">Upload and manage your educational content</p>
    </div>

    <!-- Upload Interface -->
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 mb-8">
      <div class="p-6 border-b border-gray-200 dark:border-gray-700">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Upload Questions</h3>
      </div>
      <div class="p-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <!-- Program Selection -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Select Program</label>
            <select v-model="selectedProgram"
              class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer">
              <option value="">-- Choose a program --</option>
              <option v-for="program in programs" :key="program.id" :value="program.id">
                {{ program.name }}
              </option>
            </select>
          </div>

          <!-- Subject Selection (populated based on selected program) -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Select Subject</label>
            <select v-model="selectedSubject" :disabled="!selectedProgram"
              class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
              <option value="">-- Choose a subject --</option>
              <option v-for="course in availableSubjects" :key="course.id" :value="course.id">
                {{ course.name }}
              </option>
            </select>
          </div>
        </div>

        <div class="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
          <i class="fas fa-cloud-upload-alt text-4xl text-gray-400 mb-4"></i>
          <h4 class="text-lg font-medium text-gray-900 dark:text-white mb-2">Drop files here or click to upload</h4>
          <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">Supports CSV, JSON, and WORD formats</p>
          <button
            class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors cursor-pointer">
            Choose Files
          </button>
        </div>

        <!-- Format Templates -->
        <div class="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div v-for="template in uploadTemplates" :key="template.format"
            class="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <div class="flex items-center justify-between mb-2">
              <span class="font-medium text-gray-900 dark:text-white">{{ template.format }}</span>
              <i :class="template.icon" class="text-blue-600"></i>
            </div>
            <p class="text-sm text-gray-600 dark:text-gray-400 mb-3">{{ template.description }}</p>
            <button class="text-blue-600 hover:text-blue-700 text-sm font-medium cursor-pointer">Download
              Template</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Upload History Table -->
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
      <div class="p-6 border-b border-gray-200 dark:border-gray-700">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Upload History</h3>
          <div class="flex items-center space-x-3">
            <div class="relative">
              <i class="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm"></i>
              <input type="text" placeholder="Search uploads..."
                class="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent">
            </div>
          </div>
        </div>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                File Name</th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Format</th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Status</th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Upload Date</th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Actions</th>
            </tr>
          </thead>
          <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            <tr v-for="upload in uploadHistory" :key="upload.id">
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{{
                upload.fileName }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{{ upload.format }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="upload.statusColor" class="px-2 py-1 text-xs font-medium rounded-full">{{
                  upload.status }}</span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{{ upload.date }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button class="text-blue-600 hover:text-blue-900 mr-3 cursor-pointer">View</button>
                <button class="text-red-600 hover:text-red-900 cursor-pointer">Delete</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, watch } from 'vue'

interface Course {
  id: number;
  name: string;
  description: string;
}

interface Program {
  id: number;
  name: string;
  expanded?: boolean;
  courses: Course[];
}

// Program data
const programs = ref<Program[]>([
  {
    id: 1,
    name: 'Computer Science Program',
    expanded: true,
    courses: [
      {
        id: 1,
        name: 'Data Structures & Algorithms',
        description: 'Master data structures and algorithmic problem solving'
      },
      {
        id: 2,
        name: 'Database Management Systems',
        description: 'Learn database design and SQL'
      },
      {
        id: 4,
        name: 'Introduction to Web Development',
        description: 'Learn the fundamentals of web development with HTML, CSS, and JavaScript'
      }
    ]
  },
  {
    id: 2,
    name: 'Mathematics Program',
    expanded: false,
    courses: [
      {
        id: 6,
        name: 'Calculus I',
        description: 'Introduction to differential and integral calculus'
      },
      {
        id: 7,
        name: 'Linear Algebra',
        description: 'Matrices, vectors, and linear transformations'
      }
    ]
  },
  {
    id: 3,
    name: 'Marketing Program',
    expanded: false,
    courses: [
      {
        id: 3,
        name: 'Digital Marketing Strategy',
        description: 'Comprehensive guide to modern digital marketing techniques'
      },
      {
        id: 8,
        name: 'Social Media Marketing',
        description: 'Master social media platforms and campaigns'
      }
    ]
  }
])

const selectedProgram = ref('')
const selectedSubject = ref('')

// Computed property to get available subjects based on selected program
const availableSubjects = computed(() => {
  if (!selectedProgram.value) {
    return []
  }
  const program = programs.value.find(p => p.id === parseInt(selectedProgram.value))
  return program ? program.courses : []
})

// Watch for program changes and reset subject
watch(selectedProgram, () => {
  selectedSubject.value = ''
})

const uploadTemplates = ref([
  {
    format: 'CSV Format',
    description: 'Comma-separated values with question data',
    icon: 'fas fa-file-csv'
  },
  {
    format: 'JSON Format',
    description: 'Structured JSON format for complex questions',
    icon: 'fas fa-file-code'
  },
  {
    format: 'WORD Format',
    description: 'Microsoft Word document with formatted questions',
    icon: 'fas fa-file-word'
  }
])

const uploadHistory = ref([
  {
    id: 1,
    fileName: 'math_questions_batch_1.csv',
    format: 'CSV',
    status: 'Completed',
    statusColor: 'bg-green-100 text-green-800',
    date: '2025-11-13 14:30'
  },
  {
    id: 2,
    fileName: 'physics_exam_questions.json',
    format: 'JSON',
    status: 'Processing',
    statusColor: 'bg-yellow-100 text-yellow-800',
    date: '2025-11-13 13:45'
  },
  {
    id: 3,
    fileName: 'chemistry_quiz_set.docx',
    format: 'WORD',
    status: 'Failed',
    statusColor: 'bg-red-100 text-red-800',
    date: '2025-11-13 12:15'
  }
])
</script>
