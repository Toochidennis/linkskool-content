<template>
  <div class="space-y-8">
    <div class="flex items-start justify-between">
      <div>
        <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">Assessments</h2>
        <p class="text-gray-600 dark:text-gray-400">Upload and manage your educational content</p>
      </div>
      <router-link to="/dashboard/assessment-form"
        class="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors cursor-pointer shadow-sm hover:shadow-md">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="18" height="18">
          <path
            d="M9 5H7a2 2 0 00-2 2v12a2 2 f0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        Preview Assessment
      </router-link>
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
        <div class="grid grid-cols-1 md:grid-cols-1 gap-4 mb-6">
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
          <button v-if="selectedZipFile" @click="submitUpload" :disabled="isUploading"
            class="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-medium transition-colors cursor-pointer flex items-center justify-center space-x-2">
            <i v-if="!isUploading" class="fas fa-upload"></i>
            <i v-else class="fas fa-spinner animate-spin"></i>
            <span>{{ isUploading ? 'Uploading...' : 'Upload ZIP' }}</span>
          </button>
          <button v-if="selectedZipFile" @click="clearAllFiles"
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
                Description</th>
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
                upload.description }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{{
                upload.courseName }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{{ upload.year }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{{ upload.uploadDate
                }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button @click="viewUpload(upload.id)"
                  class="text-blue-600 hover:text-blue-900 mr-3 cursor-pointer">View</button>
                <button @click="openDeleteModal(upload)"
                  class="text-red-600 hover:text-red-900 cursor-pointer">Delete</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <!-- Delete Confirmation Modal -->
      <div v-if="showDeleteModal" @click="closeDeleteModal"
        class="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div @click.stop class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-sm">
          <div class="p-8">
            <div
              class="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 dark:bg-red-900 mb-4 mx-auto">
              <i class="fas fa-trash text-red-600 dark:text-red-400 text-lg"></i>
            </div>
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2 text-center">Delete Upload</h3>
            <p class="text-gray-600 dark:text-gray-300 mb-4 text-center">
              Are you sure you want to delete <strong>{{ deletingUpload?.description }}</strong>? This action cannot be
              undone.
            </p>
            <div class="flex gap-3">
              <button @click="closeDeleteModal"
                class="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 font-semibold transition-colors cursor-pointer">
                Cancel
              </button>
              <button @click="confirmDelete" :disabled="isDeleting"
                class="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition-colors cursor-pointer shadow-md hover:shadow-lg disabled:shadow-none">
                <i :class="isDeleting ? 'fas fa-spinner fa-spin mr-2' : 'fas fa-trash mr-2'"></i>{{ isDeleting ?
                  'Deleting...' : 'Delete' }}
              </button>
            </div>
          </div>
        </div>
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
import type { Program, Exam } from '@/api/models'
import { programService, questionService, examService } from '@/api/services/serviceFactory';
import { useToast } from 'vue-toast-notification';
import { useQuestionUpload } from '@/composables/useQuestionUpload';
import { readCSVFile, readHTMLFile, readJSONFile, readDocxFile, extractZipForValidation } from '@/composables/useFileUpload';

const $toast = useToast();
const router = useRouter();
const { formatQuestionsData } = useQuestionUpload();

const zipFileInput = ref<HTMLInputElement>();
const isDraggingZip = ref(false);
const selectedZipFile = ref<File | null>(null);
const isUploading = ref(false);
const extractedImages = ref<Array<{ name: string; data: string; type: string }>>([]);
const csvData = ref<Array<Record<string, string>>>([]);
const htmlData = ref<Array<Record<string, string>>>([]);
const jsonData = ref<Array<Record<string, string>>>([]);
const docxParsed = ref<null | { data: Array<Record<string, string>>; images: { filename: string; data: string; type: string }[] }>(null);

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
        isActive: program.isActive,
        displayOrder: program.displayOrder || 0
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
  {
    format: 'WORD Format',
    description: 'Microsoft Word document with formatted questions',
    icon: 'fas fa-file-word'
  },
  // {
  //   format: 'HTML Format',
  //   description: 'HTML file with formatted questions and content',
  //   icon: 'fas fa-file-code'
  // }
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
        description: exam.description,
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

// Deletion modal state & handlers
const showDeleteModal = ref(false)
const deletingUpload = ref<Exam | null>(null)
const isDeleting = ref(false)

const openDeleteModal = (upload: Exam) => {
  deletingUpload.value = upload
  showDeleteModal.value = true
}

const closeDeleteModal = () => {
  showDeleteModal.value = false
  deletingUpload.value = null
}

const confirmDelete = async () => {
  if (!deletingUpload.value) return
  try {
    isDeleting.value = true
    const user = localStorage.getItem('user')
    const userObj = user ? JSON.parse(user) : null
    const response = await examService.delete(undefined, {
      examId: deletingUpload.value.id,
      userId: userObj?.id,
      username: userObj?.username
    })
    if (response.success) {
      $toast.success('Upload deleted successfully')
      await fetchUploadHistory(currentPage.value)
      closeDeleteModal()
    } else {
      $toast.error(response.message || 'Failed to delete upload')
    }
  } catch (error) {
    console.error('Error deleting upload:', error)
    $toast.error('Failed to delete upload')
  } finally {
    isDeleting.value = false
  }
}

// File upload handlers


const triggerZipFileInput = () => {
  zipFileInput.value?.click();
};

const processZipFile = async (files?: FileList | null) => {
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
    selectedZipFile.value = zipFile;

    const { images, dataFiles } = await extractZipForValidation(zipFile);
    extractedImages.value = images;

    // reset parsed data holders
    csvData.value = [];
    jsonData.value = [];
    htmlData.value = [];
    docxParsed.value = null;

    if (dataFiles.length > 0) {
      const preferred = dataFiles.sort((a, b) => {
        const aExt = a.name.split('.').pop() || '';
        const bExt = b.name.split('.').pop() || '';
        const order = ['csv', 'json', 'html', 'htm', 'docx'];
        return order.indexOf(aExt) - order.indexOf(bExt);
      });

      const fileEntry = preferred[0];
      if (!fileEntry) {
        $toast.info('No valid data file found inside ZIP');
      } else {
        const ext = fileEntry.name.split('.').pop()?.toLowerCase();
        const fileObj = new File([fileEntry.blob], fileEntry.name, { type: fileEntry.blob.type });

        try {
          if (ext === 'csv') {
            const rows = await readCSVFile(fileObj);
            csvData.value = rows;
            $toast.success(`CSV loaded from ZIP: ${rows.length} records`);
          } else if (ext === 'json') {
            const rows = await readJSONFile(fileObj);
            jsonData.value = rows;
            $toast.success(`JSON loaded from ZIP: ${rows.length} records`);
          } else if (ext === 'html' || ext === 'htm') {
            const rows = await readHTMLFile(fileObj);
            htmlData.value = rows;
            $toast.success('HTML loaded from ZIP');
          } else if (ext === 'docx') {
            const parsed = await readDocxFile(fileObj);
            // merge docx images into extracted images for validations
            if (parsed.images && parsed.images.length > 0) {
              const extra = parsed.images.map(i => ({ name: i.filename, data: i.data, type: i.type }));
              extractedImages.value = extractedImages.value.concat(extra);
            }
            if (parsed.data && parsed.data.length > 0) {
              csvData.value = parsed.data as Array<Record<string, string>>;
              $toast.success(`DOCX loaded from ZIP: ${parsed.data.length} records`);
            }
          }
        } catch (err) {
          console.error('Error parsing data file from ZIP:', err);
          $toast.error('Failed to parse data file inside ZIP for validation');
        }
      }
    } else {
      $toast.info('No data file found inside ZIP for validation');
    }

    $toast.success(`Extracted ${images.length} images from ZIP file`);
  } catch (error) {
    console.error('Error extracting ZIP:', error);
    $toast.error('Failed to extract images from ZIP file');
  }
};

const handleZipFileUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  await processZipFile(target.files || undefined);
  // Reset the input
  target.value = '';
};

const handleDragDropZip = async (event: DragEvent) => {
  isDraggingZip.value = false;
  const files = event.dataTransfer?.files;
  await processZipFile(files || undefined);
};

// Format file size display
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

// (individual file upload removed)

// Remove ZIP file
const removeZipFile = () => {
  selectedZipFile.value = null;
  $toast.info('ZIP file removed');
};

// Preview ZIP file (basic)
const previewFile = (file: File) => {
  if (file && (file.type === 'application/zip' || file.name.endsWith('.zip'))) {
    $toast.info('ZIP file preview: validation data available in UI logs');
  } else {
    $toast.warning('Preview not available for this file type');
  }
};

// Submit upload
const submitUpload = async () => {
  if (!selectedProgram.value || !selectedSubject.value) {
    $toast.warning('Please select a program and subject');
    return;
  }

  if (!selectedZipFile.value) {
    $toast.warning('Please select a ZIP file to upload');
    return;
  }

  // Inform user about upload time
  $toast.info('Large question files may take time to upload. Please wait...', {
    duration: 5000
  });

  isUploading.value = true;

  try {
    const user = localStorage.getItem('user');
    const userObj = user ? JSON.parse(user) : null;

    const settings = {
      exam_type_id: parseInt(selectedProgram.value),
      course_id: parseInt(selectedSubject.value),
      course_name: availableSubjects.value.find(c => c.id === parseInt(selectedSubject.value))?.courseName || '',
      title: programs.value.find(p => p.id === parseInt(selectedProgram.value))?.name || '',
      description: '',
      duration: 1800,
      user_id: userObj ? userObj.id : null,
      username: userObj ? userObj.username : ''
    };

    // Determine parsed rows from ZIP (if available) for validation
    let parsedRows: Array<Record<string, string>> | null = null;
    if (csvData.value.length > 0) parsedRows = csvData.value;
    else if (jsonData.value.length > 0) parsedRows = jsonData.value;
    else if (htmlData.value.length > 0) parsedRows = htmlData.value;
    else if (docxParsed.value && Array.isArray(docxParsed.value.data)) parsedRows = docxParsed.value.data as Array<Record<string, string>>;

    // If parsedRows exist, validate before sending
    if (parsedRows && parsedRows.length > 0) {
      const result = formatQuestionsData(parsedRows, extractedImages.value, !!selectedZipFile.value);
      console.log('Data ', result.data);
      if (result.errors.length > 0) {
        result.errors.forEach(error => {
          $toast.error(`Year ${error.year}, Question #${error.questionIndex}: ${error.error}`);
        });
        $toast.error('Please fix the validation errors above before uploading');
        return;
      }
    }

    // Build FormData and send the ZIP file with settings
    const form = new FormData();
    form.append('file', selectedZipFile.value as File);
    // append settings as array fields so backend validates as array
    Object.entries(settings).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        form.append(`settings[${key}]`, String(value));
      }
    });

    try {
      const response = await questionService.post(undefined, form as unknown as Record<string, unknown>);
      if (response.success) {
        $toast.success('Questions uploaded successfully');
        clearAllFiles();
        await fetchUploadHistory();
      } else {
        $toast.error(response.message || 'Failed to upload questions');
      }
    } catch (err) {
      console.error('Upload error:', err);
      $toast.error('Failed to upload questions');
    }

  } catch (error) {
    console.error('Upload error:', error);
    $toast.error('Failed to upload questions');
  } finally {
    isUploading.value = false;
  }
};

// batch upload removed: server now accepts zipped file + settings

// Clear all files
const clearAllFiles = () => {
  selectedZipFile.value = null;
  csvData.value = [];
  htmlData.value = [];
  jsonData.value = [];
  docxParsed.value = null;
  extractedImages.value = [];
  $toast.info('All files cleared');
};

// Delete functionality removed from upload history

// View upload in assessment viewer
const viewUpload = (uploadId: number) => {
  router.push({
    name: 'Exam Viewer',
    query: { examId: uploadId }
  });
};
</script>
