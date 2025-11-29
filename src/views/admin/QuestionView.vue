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
import { ref, computed, watch, onMounted } from 'vue'
import type { Program, QuestionPayload } from '@/api/models'
import { programService, questionService } from '@/api/services/serviceFactory';
import { useToast } from 'vue-toast-notification';
import { useQuestionUpload } from '@/composables/useQuestionUpload';

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
      readCSVFile(file);
    }
  }

  // Reset the input
  target.value = '';
};

const triggerZipFileInput = () => {
  zipFileInput.value?.click();
};

const handleZipFileUpload = (event: Event) => {
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

  // Store selected ZIP file
  selectedZipFile.value = zipFile;

  // Extract images from ZIP file
  extractImagesFromZip(zipFile);

  // Reset the input
  target.value = '';
};

// Extract images from ZIP file
const extractImagesFromZip = async (zipFile: File) => {
  try {
    // Import JSZip dynamically
    const JSZip = (await import('jszip')).default;
    const zip = new JSZip();
    const content = await zip.loadAsync(zipFile);

    const images: Array<{ name: string; data: string; type: string }> = [];
    const allowedExtensions = ['jpg', 'jpeg', 'png'];
    const rejectedFiles: string[] = [];
    const fileReaderPromises: Promise<void>[] = [];

    // Iterate through all files in the ZIP
    for (const [fileName, file] of Object.entries(content.files)) {
      if (!file.dir) {
        const ext = fileName.split('.').pop()?.toLowerCase() || '';

        // Check if it's an allowed image file
        if (allowedExtensions.includes(ext)) {
          try {
            const fileReaderPromise = new Promise<void>(async (resolve, reject) => {
              try {
                const fileData = await file.async('arraybuffer');
                const blob = new Blob([fileData], { type: `image/${ext === 'jpg' ? 'jpeg' : ext}` });
                const reader = new FileReader();

                reader.onload = (e) => {
                  const dataUrl = e.target?.result as string;
                  images.push({
                    name: fileName,
                    data: dataUrl,
                    type: `image/${ext === 'jpg' ? 'jpeg' : ext}`
                  });
                  resolve();
                };

                reader.onerror = () => {
                  console.error(`Error reading image ${fileName}`);
                  reject(new Error(`Failed to read ${fileName}`));
                };

                reader.readAsDataURL(blob);
              } catch (error) {
                console.error(`Error extracting image ${fileName}:`, error);
                reject(error);
              }
            });

            fileReaderPromises.push(fileReaderPromise);
          } catch (error) {
            console.error(`Error extracting image ${fileName}:`, error);
          }
        } else {
          // Track rejected files
          rejectedFiles.push(fileName);
        }
      }
    }

    // Wait for all FileReader operations to complete
    await Promise.all(fileReaderPromises);

    // Store extracted images
    extractedImages.value = images;

    // Show results
    console.log(`Extracted ${images.length} images from ZIP file`);

    if (rejectedFiles.length > 0) {
      console.warn(`Rejected ${rejectedFiles.length} non-image files:`, rejectedFiles);
      $toast.warning(`Extracted ${images.length} images. Rejected ${rejectedFiles.length} files (only JPG, JPEG, PNG allowed)`);
    } else {
      $toast.success(`Extracted ${images.length} images from ZIP file`);
    }
  } catch (error) {
    console.error('Error extracting ZIP file:', error);
    $toast.error('Failed to extract images from ZIP file');
  }
};

// Read and parse CSV file
const readCSVFile = (file: File) => {
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const content = e.target?.result as string;
      const lines = content.split('\n').map(line => line.trim()).filter(line => line.length > 0);

      if (lines.length < 2) {
        $toast.warning('CSV file must have headers and at least one data row');
        return;
      }

      // Parse CSV headers (first row)
      const headers = parseCSVLine(lines[0] || '');

      // Parse CSV data rows
      const data: Array<Record<string, string>> = [];
      for (let i = 1; i < lines.length; i++) {
        const values = parseCSVLine(lines[i] || '');
        const row: Record<string, string> = {};

        headers.forEach((header, index) => {
          row[header] = values[index] || '';
        });

        data.push(row);
      }

      // Store CSV data
      csvData.value = data;

      console.log(`CSV file parsed: ${data.length} rows, ${headers.length} columns`);
      console.log('CSV Headers:', headers);
      console.log('CSV Data:', data);

      $toast.success(`CSV file loaded: ${data.length} records`);
    } catch (error) {
      console.error('Error parsing CSV file:', error);
      $toast.error('Failed to parse CSV file');
    }
  };
  reader.readAsText(file);
};

// Helper function to parse CSV line (handles quoted values and commas)
const parseCSVLine = (line: string): string[] => {
  const result: string[] = [];
  let current = '';
  let insideQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        // Handle escaped quotes
        current += '"';
        i++;
      } else {
        // Toggle quote state
        insideQuotes = !insideQuotes;
      }
    } else if (char === ',' && !insideQuotes) {
      // End of field
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }

  // Add the last field
  result.push(current.trim());

  return result;
};

// Helper function to get file format from filename
const getFileFormat = (fileName: string): string => {
  const extension = fileName.split('.').pop()?.toUpperCase() || '';
  if (extension === 'CSV') return 'CSV';
  if (extension === 'JSON') return 'JSON';
  if (extension === 'DOC' || extension === 'DOCX') return 'WORD';
  return extension;
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

// Clear all files
const clearAllFiles = () => {
  selectedFiles.value = [];
  selectedZipFile.value = null;
  $toast.info('All files cleared');
};
</script>
