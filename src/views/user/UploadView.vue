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
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <!-- Individual Files Upload -->
          <div>
            <div class="border-2 border-dashed border-blue-300 dark:border-blue-600 rounded-lg p-4 text-center">
              <i class="fas fa-cloud-upload-alt text-2xl text-blue-400 mb-2"></i>
              <h4 class="text-sm font-medium text-gray-900 dark:text-white mb-1">Upload Questions</h4>
              <p class="text-xs text-gray-600 dark:text-gray-400 mb-3">CSV, JSON, WORD</p>
              <button @click="triggerFileInput"
                class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded text-sm font-medium transition-colors cursor-pointer">
                Choose Files
              </button>
              <input ref="fileInput" type="file" accept=".csv,.json,.doc,.docx" style="display: none"
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
            <div class="border-2 border-dashed border-green-300 dark:border-green-600 rounded-lg p-4 text-center">
              <i class="fas fa-file-archive text-2xl text-green-400 mb-2"></i>
              <h4 class="text-sm font-medium text-gray-900 dark:text-white mb-1">Upload ZIP</h4>
              <p class="text-xs text-gray-600 dark:text-gray-400 mb-3">ZIP with images</p>
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
            <tr v-if="uploadHistory.length === 0">
              <td colspan="5" class="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                No uploads yet
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, watch, onMounted } from 'vue'
import type { Program, QuestionPayload } from '@/api/models'
import { programService, questionService } from '@/api/services/serviceFactory';
import { useToast } from 'vue-toast-notification';
import { useQuestionUpload } from '@/composables/useQuestionUpload';
import { getFileFormat, readCSVFile, extractImagesFromZip } from '@/composables/useFileUpload';

const $toast = useToast();
const { formatQuestionsData } = useQuestionUpload();

// File upload references
const fileInput = ref<HTMLInputElement>();
const zipFileInput = ref<HTMLInputElement>();

// Selected files state
const selectedFiles = ref<File[]>([]);
const selectedZipFile = ref<File | null>(null);
const isUploading = ref(false);
const extractedImages = ref<Array<{ name: string; data: string; type: string }>>([]);
const csvData = ref<Array<Record<string, string>>>([]);

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
  }
])

const uploadHistory = ref<Array<{
  id: number;
  fileName: string;
  format: string;
  status: string;
  statusColor: string;
  date: string;
}>>([])

// File upload handlers
const triggerFileInput = () => {
  fileInput.value?.click();
};

const handleFileUpload = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const files = target.files;

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
    }
  }

  // Reset the input
  target.value = '';
};

const triggerZipFileInput = () => {
  zipFileInput.value?.click();
};

const handleZipFileUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  const files = target.files;

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

  // Reset the input
  target.value = '';
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
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        JSON.parse(content);
        console.log('JSON file is valid');
        $toast.info('JSON file is valid');
      } catch {
        $toast.error('Invalid JSON file');
      }
    };
    reader.readAsText(file);
  } else if (ext === 'zip') {
    $toast.info(`ZIP file: ${file.name} (${formatFileSize(file.size)})`);
  }
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

// Clear all files
const clearAllFiles = () => {
  selectedFiles.value = [];
  selectedZipFile.value = null;
  csvData.value = [];
  extractedImages.value = [];
  $toast.info('All files cleared');
};

// Submit upload to server
const submitUpload = async () => {
  if (!selectedProgram.value || !selectedSubject.value) {
    $toast.warning('Please select a program and subject');
    return;
  }

  isUploading.value = true;

  try {
    // Log upload info
    console.log('Uploading files...');
    console.log('Program ID:', selectedProgram.value);
    console.log('Subject ID:', selectedSubject.value);
    console.log('Selected Files:', selectedFiles.value.map(f => f.name));
    console.log('ZIP File:', selectedZipFile.value?.name);
    console.log('Extracted Images:', extractedImages.value.length > 0 ? extractedImages.value.map(img => img.name) : 'None');
    console.log('CSV Data Rows:', csvData.value.length);

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

    selectedFiles.value.forEach(file => {
      const format = getFileFormat(file.name);

      switch (format) {
        case 'CSV':
          if (csvData.value.length > 0) {
            const questionsData = formatQuestionsData(
              csvData.value,
              extractedImages.value,
              !!selectedZipFile.value,
            );

            questionPayload.data = questionsData;

            console.log('Question Payload:', questionPayload);
          }

          break;
        case 'JSON':
          console.log(`Processing JSON file: ${file.name}`);
          break;
        case 'WORD':
          console.log(`Processing WORD file: ${file.name}`);
          break;
        default:
          console.warn(`Unsupported file format for file: ${file.name}`);
      }
    });

    // Add files to upload history
    for (const file of selectedFiles.value) {
      uploadHistory.value.unshift({
        id: Date.now() + Math.random(),
        fileName: file.name,
        format: getFileFormat(file.name),
        status: 'Completed',
        statusColor: 'bg-green-100 text-green-800',
        date: new Date().toLocaleString()
      });
    }

    if (selectedZipFile.value) {
      uploadHistory.value.unshift({
        id: Date.now(),
        fileName: selectedZipFile.value.name,
        format: 'ZIP',
        status: 'Completed',
        statusColor: 'bg-green-100 text-green-800',
        date: new Date().toLocaleString()
      });
    }

    // Post to server
    if (questionPayload.data.length > 0) {
      try {
        const response = await questionService.post(undefined, questionPayload as unknown as Record<string, unknown>);
        console.log('Server Response:', response);
        $toast.success('Questions uploaded to server successfully');
      } catch (error) {
        console.error('Server upload error:', error);
        $toast.error('Failed to upload questions to server');
        return;
      }
    } else {
      $toast.warning('No question data to upload');
      return;
    }

    clearAllFiles();
  } catch (error) {
    console.error('Upload error:', error);
    $toast.error('Failed to upload files');
  } finally {
    isUploading.value = false;
  }
};
</script>
