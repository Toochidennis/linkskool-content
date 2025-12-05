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
        <!-- Program & Subject Selection -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Select Program</label>
            <select v-model="selectedProgram"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer text-sm max-h-48 overflow-y-auto">
              <option value="">-- Choose a program --</option>
              <option v-for="program in programs" :key="program.id" :value="program.id">
                {{ program.name }}
              </option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-grayx-700 dark:text-gray-300 mb-1">Select Subject</label>
            <select v-model="selectedSubject" :disabled="!selectedProgram"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer text-sm disabled:opacity-50 disabled:cursor-not-allowed max-h-48 overflow-y-auto">
              <option value="">-- Choose a subject --</option>
              <option v-for="course in availableSubjects" :key="course.id" :value="course.id">
                {{ course.courseName }}
              </option>
            </select>
          </div>
        </div>

        <!-- Upload Sections Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <!-- Individual Files Upload -->
          <div>
            <div
              class="border-2 border-dashed border-blue-300 dark:border-blue-600 rounded-lg p-6 text-center transition-colors cursor-pointer min-h-64 flex flex-col items-center justify-center"
              @dragover.prevent="isDraggingFiles = true" @dragleave.prevent="isDraggingFiles = false"
              @drop.prevent="handleDragDropFiles"
              :class="isDraggingFiles ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-500 dark:border-blue-400' : 'hover:bg-blue-50/50 dark:hover:bg-blue-900/10'">
              <i class="fas fa-cloud-upload-alt text-2xl transition-colors"
                :class="isDraggingFiles ? 'text-blue-500' : 'text-blue-400' + ' mb-2'"></i>
              <h4 class="text-sm font-medium text-gray-900 dark:text-white mb-1">{{ isDraggingFiles ? 'Drop files here'
                : 'Drag & Drop Questions' }}</h4>
              <p class="text-xs text-gray-600 dark:text-gray-400 mb-3">or click to choose - CSV, JSON, WORD, HTML</p>
              <button @click="triggerFileInput"
                class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded text-sm font-medium transition-colors cursor-pointer">
                Choose Files
              </button>
              <input ref="fileInput" type="file" accept=".csv,.json,.doc,.docx,.html" style="display: none"
                @change="handleFileUpload" multiple />
            </div>
            <!-- Selected Files Display -->
            <div v-if="selectedFiles.length > 0" class="mt-3 space-y-2">
              <div v-for="(file, index) in selectedFiles" :key="index"
                class="flex items-center justify-between bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
                <div class="flex items-center space-x-2 flex-1 min-w-0">
                  <i class="fas fa-file text-blue-600"></i>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium text-gray-900 dark:text-white truncate">{{ file.name }}</p>
                    <p class="text-xs text-gray-600 dark:text-gray-400">{{ formatFileSize(file.size) }}</p>
                  </div>
                </div>
                <div class="flex items-center space-x-2 ml-2">
                  <button @click="previewFile(file)"
                    class="text-blue-600 hover:text-blue-700 text-sm font-medium cursor-pointer" title="Preview">
                    <i class="fas fa-eye"></i>
                  </button>
                  <button @click="removeFile(index)"
                    class="text-red-600 hover:text-red-700 text-sm font-medium cursor-pointer" title="Remove">
                    <i class="fas fa-times"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Zipped Files Upload -->
          <div>
            <div
              class="border-2 border-dashed border-green-300 dark:border-green-600 rounded-lg p-6 text-center transition-colors cursor-pointer min-h-64 flex flex-col items-center justify-center"
              @dragover.prevent="isDraggingZip = true" @dragleave.prevent="isDraggingZip = false"
              @drop.prevent="handleDragDropZip"
              :class="isDraggingZip ? 'bg-green-50 dark:bg-green-900/20 border-green-500 dark:border-green-400' : 'hover:bg-green-50/50 dark:hover:bg-green-900/10'">
              <i class="fas fa-file-archive text-2xl transition-colors"
                :class="isDraggingZip ? 'text-green-500' : 'text-green-400' + ' mb-2'"></i>
              <h4 class="text-sm font-medium text-gray-900 dark:text-white mb-1">{{ isDraggingZip ? 'Drop ZIP here' :
                'Drag & Drop ZIP' }}</h4>
              <p class="text-xs text-gray-600 dark:text-gray-400 mb-3">or click to choose - ZIP with images</p>
              <button @click="triggerZipFileInput"
                class="bg-green-600 hover:bg-green-700 text-white px-4 py-1.5 rounded text-sm font-medium transition-colors cursor-pointer">
                Choose Zip File
              </button>
              <input ref="zipFileInput" type="file" accept=".zip" style="display: none" @change="handleZipFileUpload" />
            </div>
            <!-- Selected ZIP File Display -->
            <div v-if="selectedZipFile"
              class="mt-3 flex items-center justify-between bg-green-50 dark:bg-green-900/20 p-3 rounded-lg border border-green-200 dark:border-green-800">
              <div class="flex items-center space-x-2 flex-1 min-w-0">
                <i class="fas fa-file-archive text-green-600"></i>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium text-gray-900 dark:text-white truncate">{{ selectedZipFile.name }}</p>
                  <p class="text-xs text-gray-600 dark:text-gray-400">{{ formatFileSize(selectedZipFile.size) }}</p>
                </div>
              </div>
              <div class="flex items-center space-x-2 ml-2">
                <button @click="previewFile(selectedZipFile)"
                  class="text-green-600 hover:text-green-700 text-sm font-medium cursor-pointer" title="Preview">
                  <i class="fas fa-eye"></i>
                </button>
                <button @click="removeZipFile()"
                  class="text-red-600 hover:text-red-700 text-sm font-medium cursor-pointer" title="Remove">
                  <i class="fas fa-times"></i>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Format Templates -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
          <div v-for="template in uploadTemplates" :key="template.format"
            class="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
            <div class="flex items-center justify-between mb-1">
              <span class="text-xs font-medium text-gray-900 dark:text-white">{{ template.format }}</span>
              <i :class="template.icon" class="text-blue-600 text-sm"></i>
            </div>
            <p class="text-xs text-gray-600 dark:text-gray-400 mb-2">{{ template.description }}</p>
            <button class="text-blue-600 hover:text-blue-700 text-xs font-medium cursor-pointer">Download
              Template</button>
          </div>
        </div>

        <!-- Upload Button Section -->
        <div class="flex gap-3">
          <button v-if="selectedFiles.length > 0" @click="submitUpload" :disabled="isUploading"
            class="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-medium transition-colors cursor-pointer flex items-center justify-center space-x-2">
            <i v-if="!isUploading" class="fas fa-upload"></i>
            <i v-else class="fas fa-spinner animate-spin"></i>
            <span>{{ isUploading ? 'Uploading...' : 'Upload Files' }}</span>
          </button>
          <button v-if="selectedFiles.length > 0 || selectedZipFile" @click="clearAllFiles"
            class="bg-gray-300 hover:bg-gray-400 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white px-6 py-3 rounded-lg font-medium transition-colors cursor-pointer">
            Clear All
          </button>
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
                Course Name</th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Year</th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Date Uploaded</th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Actions</th>
            </tr>
          </thead>
          <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            <tr v-for="upload in uploadHistory" :key="upload.id">
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{{
                upload.courseName }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{{ upload.year }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{{ upload.uploadDate
              }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button @click="viewUpload(upload.id)"
                  class="text-blue-600 hover:text-blue-900 mr-3 cursor-pointer">View</button>
                <button @click="deleteUpload(upload.id)"
                  class="text-red-600 hover:text-red-900 cursor-pointer">Delete</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <!-- Pagination Controls -->
      <div class="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <div class="text-sm text-gray-600 dark:text-gray-400">
          Showing {{ (currentPage - 1) * paginationMeta.perPage + 1 }} to {{ Math.min(currentPage *
            paginationMeta.perPage, paginationMeta.total) }} of {{ paginationMeta.total }} results
        </div>
        <div class="flex items-center space-x-2">
          <button @click="fetchUploadHistory(currentPage - 1)" :disabled="!paginationMeta.hasPrev"
            class="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
            Previous
          </button>
          <div class="flex items-center space-x-1">
            <button v-for="page in visiblePages" :key="page" @click="fetchUploadHistory(page)"
              :class="currentPage === page ? 'bg-blue-600 text-white' : 'border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'"
              class="px-2 py-1 rounded-lg text-sm font-medium transition-colors">
              {{ page }}
            </button>
          </div>
          <button @click="fetchUploadHistory(currentPage + 1)" :disabled="!paginationMeta.hasNext"
            class="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
            Next
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import type { Program, QuestionPayload, Exam } from '@/api/models'
import { programService, questionService, examService } from '@/api/services/serviceFactory';
import { useToast } from 'vue-toast-notification';
import { useQuestionUpload } from '@/composables/useQuestionUpload';
import { getFileFormat, readCSVFile, readHTMLFile, extractImagesFromZip } from '@/composables/useFileUpload';

const $toast = useToast();
const router = useRouter();
const { formatQuestionsData } = useQuestionUpload();

// File upload references
const fileInput = ref<HTMLInputElement>();
const zipFileInput = ref<HTMLInputElement>();

// Drag and drop states
const isDraggingFiles = ref(false);
const isDraggingZip = ref(false);

// Selected files state
const selectedFiles = ref<File[]>([]);
const selectedZipFile = ref<File | null>(null);
const isUploading = ref(false);
const extractedImages = ref<Array<{ name: string; data: string; type: string }>>([]);
const csvData = ref<Array<Record<string, string>>>([]);
const htmlData = ref<Array<Record<string, string>>>([]);

// Program data
const programs = ref<Program[]>([])

const fetchPrograms = async () => {
  try {
    const response = await programService.get()

    if (response && response.data && Array.isArray(response.data)) {
      programs.value = response.data.map((program: Program) => ({
        id: program.id,
        name: program.name,
        shortname: program.shortname,
        expanded: false,
        courses: program.courses || [],
        isActive: program.isActive
      }));
    }
  } catch (error) {
    console.error('Error fetching programs:', error);
    $toast.error('Failed to load programs');
  }
};

onMounted(() => {
  fetchPrograms();
  fetchUploadHistory();
});


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
  // {
  //   format: 'WORD Format',
  //   description: 'Microsoft Word document with formatted questions',
  //   icon: 'fas fa-file-word'
  // },
  {
    format: 'HTML Format',
    description: 'HTML file with formatted questions and content',
    icon: 'fas fa-file-code'
  }
])

const uploadHistory = ref<Exam[]>([])
const currentPage = ref(1)
const paginationMeta = ref<{
  total: number;
  perPage: number;
  currentPage: number;
  lastPage: number;
  hasNext: boolean;
  hasPrev: boolean;
}>({
  total: 0,
  perPage: 10,
  currentPage: 1,
  lastPage: 1,
  hasNext: false,
  hasPrev: false
})

// Computed property to show page numbers around current page
const visiblePages = computed(() => {
  const maxPagesToShow = 7;
  const lastPage = paginationMeta.value.lastPage;
  const current = currentPage.value;

  let startPage = Math.max(1, current - Math.floor(maxPagesToShow / 2));
  const endPage = Math.min(lastPage, startPage + maxPagesToShow - 1);

  // Adjust start if end is at the boundary
  if (endPage - startPage + 1 < maxPagesToShow) {
    startPage = Math.max(1, endPage - maxPagesToShow + 1);
  }

  const pages = [];
  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }
  return pages;
})

const fetchUploadHistory = async (page: number = 1) => {
  try {
    const response = await examService.get(undefined, { page });
    if (response.success && response.data) {
      uploadHistory.value = response.data.data.map((exam: Exam) => ({
        id: exam.id,
        courseName: exam.courseName,
        year: exam.year,
        uploadDate: exam.uploadDate ? new Date(exam.uploadDate).toLocaleString() : 'N/A'
      }));

      // Update pagination metadata
      paginationMeta.value = {
        total: response.data.meta.total,
        perPage: response.data.meta.perPage,
        currentPage: response.data.meta.currentPage,
        lastPage: response.data.meta.lastPage,
        hasNext: response.data.meta.hasNext,
        hasPrev: response.data.meta.hasPrev
      };
      currentPage.value = page;
    }
  } catch (error) {
    console.error('Error fetching upload history:', error);
    $toast.error('Failed to load upload history');
  }
}

// File upload handlers
const triggerFileInput = () => {
  fileInput.value?.click();
};

const processFiles = (files: FileList) => {
  if (!files || files.length === 0) {
    return;
  }

  if (!selectedProgram.value || !selectedSubject.value) {
    $toast.warning('Please select a program and subject before uploading');
    return;
  }

  // Store selected files
  selectedFiles.value = Array.from(files);

  // Read CSV files if present
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    if (!file) continue;

    const ext = file.name.split('.').pop()?.toLowerCase();
    if (ext === 'csv') {
      readCSVFile(file)
        .then(data => {
          csvData.value = data;
          $toast.success(`CSV file loaded: ${data.length} records`);
        })
        .catch((error) => {
          console.error('Error parsing CSV file:', error);
          $toast.error((error as Error).message || 'Failed to parse CSV file');
        });
    } else if (ext === 'html' || ext === 'htm') {
      readHTMLFile(file)
        .then(data => {
          htmlData.value = data;
          $toast.success(`HTML file loaded successfully`);
        })
        .catch((error) => {
          console.error('Error reading HTML file:', error);
          $toast.error((error as Error).message || 'Failed to read HTML file');
        });
    }
  }
};

const handleFileUpload = (event: Event) => {
  const target = event.target as HTMLInputElement;
  processFiles(target.files || new FileList());
  // Reset the input
  target.value = '';
};

const handleDragDropFiles = (event: DragEvent) => {
  isDraggingFiles.value = false;
  const files = event.dataTransfer?.files;
  processFiles(files || new FileList());
};

const triggerZipFileInput = () => {
  zipFileInput.value?.click();
};

const processZipFile = async (files: FileList) => {
  if (!files || files.length === 0) {
    return;
  }

  if (!selectedProgram.value || !selectedSubject.value) {
    $toast.warning('Please select a program and subject before uploading');
    return;
  }

  const zipFile = files[0];
  if (!zipFile) return;

  try {
    // Store selected ZIP file
    selectedZipFile.value = zipFile;

    // Extract images from ZIP file
    const images = await extractImagesFromZip(zipFile);
    extractedImages.value = images;

    $toast.success(`Extracted ${images.length} images from ZIP file`);
  } catch (error) {
    console.error('Error extracting ZIP:', error);
    $toast.error('Failed to extract images from ZIP file');
  }
};

const handleZipFileUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  await processZipFile(target.files || new FileList());
  // Reset the input
  target.value = '';
};

const handleDragDropZip = async (event: DragEvent) => {
  isDraggingZip.value = false;
  const files = event.dataTransfer?.files;
  await processZipFile(files || new FileList());
};

// Format file size display
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

// Remove individual file
const removeFile = (index: number) => {
  selectedFiles.value.splice(index, 1);
  if (selectedFiles.value.length === 0) {
    $toast.info('All files removed');
  }
};

// Remove ZIP file
const removeZipFile = () => {
  selectedZipFile.value = null;
  $toast.info('ZIP file removed');
};

// Preview file
const previewFile = (file: File) => {
  const fileType = file.type;
  const fileName = file.name;

  // Handle different file types
  if (fileType === 'text/csv' || fileName.endsWith('.csv')) {
    previewCSV(file);
  } else if (fileType === 'application/json' || fileName.endsWith('.json')) {
    previewJSON(file);
  } else if (fileType.includes('word') || fileName.endsWith('.doc') || fileName.endsWith('.docx')) {
    $toast.info('WORD document preview not available in browser');
  } else if (fileType === 'application/zip' || fileName.endsWith('.zip')) {
    $toast.info('ZIP file contents preview not available');
  } else {
    $toast.warning('Preview not available for this file type');
  }
};

// Preview CSV file
const previewCSV = (file: File) => {
  const reader = new FileReader();
  reader.onload = (e) => {
    const content = e.target?.result as string;
    const lines = content.split('\n').slice(0, 5); // First 5 lines
    const previewText = lines.join('\n');
    console.log('CSV Preview:', previewText);
    $toast.success(`CSV preview loaded (${lines.length} lines shown)`);
  };
  reader.readAsText(file);
};

// Preview JSON file
const previewJSON = (file: File) => {
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const content = e.target?.result as string;
      const json = JSON.parse(content);
      console.log('JSON Preview:', json);
      $toast.success(`JSON file is valid`);
    } catch {
      $toast.error('Invalid JSON file format');
    }
  };
  reader.readAsText(file);
};

// Submit upload
const submitUpload = async () => {
  if (!selectedProgram.value || !selectedSubject.value) {
    $toast.warning('Please select a program and subject');
    return;
  }

  if (selectedFiles.value.length === 0) {
    $toast.warning('Please select files to upload');
    return;
  }

  isUploading.value = true;

  try {
    const user = localStorage.getItem('user');
    const userObj = user ? JSON.parse(user) : null;

    const settings = {
      examTypeId: parseInt(selectedProgram.value),
      courseId: parseInt(selectedSubject.value),
      courseName: availableSubjects.value.find(c => c.id === parseInt(selectedSubject.value))?.courseName || '',
      description: programs.value.find(p => p.id === parseInt(selectedProgram.value))?.name || '',
      userId: userObj ? userObj.id : null,
      username: userObj ? userObj.username : ''
    };

    const questionPayload: QuestionPayload = {
      settings,
      data: []
    };

    let validationErrors: Array<{ year: number; questionIndex: number; error: string }> = [];

    selectedFiles.value.forEach(file => {
      const format = getFileFormat(file.name);

      switch (format) {
        case 'CSV':
          if (csvData.value.length > 0) {
            const result = formatQuestionsData(
              csvData.value,
              extractedImages.value,
              !!selectedZipFile.value,
            );

            questionPayload.data = result.data;
            validationErrors = result.errors;

            // Show validation errors if any
            if (result.errors.length > 0) {
              result.errors.forEach(error => {
                $toast.error(
                  `Year ${error.year}, Question #${error.questionIndex}: ${error.error}`
                );
              });
            }

            console.log('Question Payload:', questionPayload);
          }

          break;
        case 'JSON':
          console.log(`Processing JSON file: ${file.name}`);
          break;
        case 'WORD':
          console.log(`Processing WORD file: ${file.name}`);
          break;
        case 'HTML':
          console.log(`Processing HTML file: ${file.name}`);
          break;
        default:
          console.warn(`Unsupported file format for file: ${file.name}`);
      }
    });

    // Check if there are validation errors - if so, prevent upload
    if (validationErrors.length > 0) {
      $toast.error('Please fix the validation errors above before uploading');
      return;
    }

    // Post to server
    if (questionPayload.data.length > 0) {
      try {
        const response = await questionService.post(undefined, questionPayload as unknown as Record<string, unknown>);
        console.log('Server Response:', response);
        if (response.success) {
          $toast.success('Questions uploaded to server successfully');
          clearAllFiles();
          // Refresh upload history after successful upload
          await fetchUploadHistory();
        }
      } catch (error) {
        console.error('Server upload error:', error);
        $toast.error('Failed to upload questions to server');
        return;
      }
    } else {
      $toast.warning('No question data to upload');
      return;
    }

  } catch (error) {
    console.error('Upload error:', error);
    $toast.error('Failed to upload files');
  } finally {
    isUploading.value = false;
  }
};

// Clear all files
const clearAllFiles = () => {
  selectedFiles.value = [];
  selectedZipFile.value = null;
  csvData.value = [];
  htmlData.value = [];
  $toast.info('All files cleared');
};

// Delete upload from history
const deleteUpload = async (uploadId: number) => {
  try {
    // Remove from local list
    uploadHistory.value = uploadHistory.value.filter(upload => upload.id !== uploadId);
    $toast.success('Upload deleted successfully');
  } catch (error) {
    console.error('Error deleting upload:', error);
    $toast.error('Failed to delete upload');
  }
};

// View upload in assessment viewer
const viewUpload = (uploadId: number) => {
  router.push({
    name: 'Exam Viewer',
    query: { examId: uploadId }
  });
};
</script>
