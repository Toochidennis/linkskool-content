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
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Select Subject</label>
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
                <button class="text-blue-600 hover:text-blue-900 mr-3 cursor-pointer">View</button>
                <!-- Delete removed from history -->
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
import type { Program, Exam } from '@/api/models'
import { programService, questionService, examService } from '@/api/services/serviceFactory';
import { useToast } from 'vue-toast-notification';
import { useQuestionUpload } from '@/composables/useQuestionUpload';
import { readCSVFile, readHTMLFile, readJSONFile, readDocxFile, extractZipForValidation } from '@/composables/useFileUpload';

const $toast = useToast();
const { formatQuestionsData } = useQuestionUpload();

// File upload references
const zipFileInput = ref<HTMLInputElement>();

// Selected files state
const selectedZipFile = ref<File | null>(null);
const isUploading = ref(false);
const extractedImages = ref<Array<{ name: string; data: string; type: string }>>([]);
const csvData = ref<Array<Record<string, string>>>([]);
const jsonData = ref<Array<Record<string, string>>>([]);
const htmlData = ref<Array<Record<string, string>>>([]);

// Drag and drop states
const isDraggingZip = ref(false);

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

// File upload handlers (individual file upload removed)

// individual file upload handlers removed

const triggerZipFileInput = () => {
  zipFileInput.value?.click();
};

const docxParsed = ref<null | { data: Array<Record<string, string>>; images: { filename: string; data: string; type: string }[] }>(null);

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

// Preview file content
const previewFile = (file: File) => {
  const ext = file.name.split('.').pop()?.toLowerCase();

  if (ext === 'csv') {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      const lines = content.split('\n').slice(0, 5);
      console.log('CSV Preview:', lines.join('\n'));
      $toast.info('CSV preview (first 5 lines) logged to console');
    };
    reader.readAsText(file);
  } else if (ext === 'json') {
    readJSONFile(file)
      .then(data => {
        const previewData = data.slice(0, 5);
        console.log('JSON Preview:', previewData);
        $toast.info('JSON preview (first 5 records) logged to console');
      })
      .catch((error) => {
        console.error('Error reading JSON file:', error);
        $toast.error((error as Error).message || 'Failed to read JSON file');
      });
  } else if (ext === 'zip') {
    $toast.info(`ZIP file: ${file.name} (${formatFileSize(file.size)})`);
  }
};

// individual file removal removed

// Remove ZIP file
const removeZipFile = () => {
  selectedZipFile.value = null;
  $toast.info('ZIP file removed');
};

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

// Submit upload to server
const submitUpload = async () => {
  if (!selectedProgram.value || !selectedSubject.value) {
    $toast.warning('Please select a program and subject');
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

// batch upload removed — server accepts zipped file + settings
</script>
