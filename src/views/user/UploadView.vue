<template>
  <section class="min-h-screen bg-gray-50">
    <!-- Top Navigation -->
    <nav class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <!-- Logo -->
          <div class="flex items-center">
            <div class="flex items-center">
              <div class="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center mr-3">
                <i class="fas fa-graduation-cap text-white text-sm"></i>
              </div>
              <span class="text-xl font-bold text-gray-900">LinkSkool Content Hub</span>
            </div>
          </div>
          <!-- User Menu -->
          <div class="flex items-center space-x-4">
            <div class="flex items-center space-x-3">
              <div class="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                <i class="fas fa-user text-gray-600 text-sm"></i>
              </div>
              <span class="text-sm font-medium text-gray-700">{{ currentUser.name }}</span>
            </div>
            <button @click="handleLogout" class="text-gray-500 hover:text-gray-700 cursor-pointer">
              <i class="fas fa-sign-out-alt"></i>
            </button>
          </div>
        </div>
      </div>
    </nav>
    <!-- Main Content -->
    <div class="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <!-- Page Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900">Upload Content</h1>
        <p class="text-gray-600 mt-2">Select a program and course to upload your educational content</p>
      </div>
      <!-- Upload Form -->
      <div class="bg-white rounded-lg shadow-lg p-8">
        <!-- Program Selection -->
        <div class="mb-6">
          <label for="program" class="block text-sm font-medium text-gray-700 mb-2">
            Select Program
          </label>
          <div class="relative">
            <button @click="showProgramDropdown = !showProgramDropdown"
              class="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-left focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors cursor-pointer"
              :class="{ 'border-red-500': uploadError && !selectedProgram }">
              <span class="text-sm">{{ selectedProgram ? selectedProgram.name : 'Choose a program...' }}</span>
              <i
                class="fas fa-chevron-down absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm"></i>
            </button>
            <div v-if="showProgramDropdown"
              class="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
              <div v-for="program in programs" :key="program.id" @click="selectProgram(program)"
                class="px-4 py-3 hover:bg-gray-50 cursor-pointer text-sm border-b border-gray-100 last:border-b-0">
                {{ program.name }}
              </div>
            </div>
          </div>
        </div>
        <!-- Course Selection -->
        <div class="mb-6">
          <label for="course" class="block text-sm font-medium text-gray-700 mb-2">
            Select Course
          </label>
          <div class="relative">
            <button @click="selectedProgram && (showCourseDropdown = !showCourseDropdown)" :disabled="!selectedProgram"
              class="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-left focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors cursor-pointer"
              :class="{
                'border-red-500': uploadError && !selectedCourse,
                'opacity-50 cursor-not-allowed': !selectedProgram
              }">
              <span class="text-sm">{{ selectedCourse ? selectedCourse.name : 'Choose a course...' }}</span>
              <i
                class="fas fa-chevron-down absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm"></i>
            </button>
            <div v-if="showCourseDropdown && selectedProgram"
              class="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
              <div v-for="course in availableCourses" :key="course.id" @click="selectCourse(course)"
                class="px-4 py-3 hover:bg-gray-50 cursor-pointer text-sm border-b border-gray-100 last:border-b-0">
                {{ course.name }}
              </div>
            </div>
          </div>
        </div>
        <!-- File Upload Area -->
        <div v-if="selectedProgram && selectedCourse" class="mb-6">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Upload Document
          </label>
          <div @drop="handleDrop" @dragover.prevent @dragenter.prevent
            class="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-indigo-400 transition-colors"
            :class="{ 'border-indigo-400 bg-indigo-50': isDragging }">
            <div v-if="!selectedFile">
              <i class="fas fa-cloud-upload-alt text-4xl text-gray-400 mb-4"></i>
              <p class="text-lg font-medium text-gray-900 mb-2">Drop your file here</p>
              <p class="text-sm text-gray-600 mb-4">or click to browse</p>
              <input ref="fileInput" type="file" @change="handleFileSelect" accept=".pdf,.doc,.docx,.ppt,.pptx,.txt"
                class="hidden" />
              <button @click="$refs.fileInput.click()"
                class="bg-indigo-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors !rounded-button whitespace-nowrap cursor-pointer">
                Choose File
              </button>
              <p class="text-xs text-gray-500 mt-3">
                Supported formats: PDF, DOC, DOCX, PPT, PPTX, TXT (Max 10MB)
              </p>
            </div>
            <div v-else class="space-y-4">
              <div class="flex items-center justify-center space-x-3">
                <i class="fas fa-file-alt text-2xl text-indigo-600"></i>
                <div class="text-left">
                  <p class="font-medium text-gray-900">{{ selectedFile.name }}</p>
                  <p class="text-sm text-gray-600">{{ formatFileSize(selectedFile.size) }}</p>
                </div>
              </div>
              <div v-if="uploadProgress > 0" class="w-full bg-gray-200 rounded-full h-2">
                <div class="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                  :style="{ width: uploadProgress + '%' }"></div>
              </div>
              <button @click="removeFile" class="text-red-600 hover:text-red-700 text-sm font-medium cursor-pointer">
                <i class="fas fa-times mr-1"></i>
                Remove file
              </button>
            </div>
          </div>
        </div>
        <!-- Error Message -->
        <div v-if="uploadError" class="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div class="flex items-center">
            <i class="fas fa-exclamation-circle text-red-500 mr-2"></i>
            <p class="text-red-700 text-sm">{{ uploadError }}</p>
          </div>
        </div>
        <!-- Success Message -->
        <div v-if="uploadSuccess" class="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div class="flex items-center">
            <i class="fas fa-check-circle text-green-500 mr-2"></i>
            <p class="text-green-700 text-sm">{{ uploadSuccess }}</p>
          </div>
        </div>
        <!-- Upload Button -->
        <div class="flex justify-end">
          <button @click="handleUpload" :disabled="!canUpload || isUploading"
            class="bg-indigo-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors !rounded-button whitespace-nowrap cursor-pointer"
            :class="{ 'opacity-50 cursor-not-allowed': !canUpload || isUploading }">
            <i v-if="isUploading" class="fas fa-spinner fa-spin mr-2"></i>
            {{ isUploading ? 'Uploading...' : 'Upload Content' }}
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue';
// Current user
const currentUser = ref({
  name: 'John Smith',
  role: 'Content Creator'
});
// Upload state
const selectedProgram = ref(null);
const selectedCourse = ref(null);
const selectedFile = ref(null);
const showProgramDropdown = ref(false);
const showCourseDropdown = ref(false);
const isDragging = ref(false);
const uploadProgress = ref(0);
const uploadError = ref('');
const uploadSuccess = ref('');
const isUploading = ref(false);

// Programs and courses data
const programs = ref([
  {
    id: 1,
    name: 'Computer Science',
    courses: [
      { id: 101, name: 'Introduction to Programming' },
      { id: 102, name: 'Data Structures and Algorithms' },
      { id: 103, name: 'Database Management Systems' },
      { id: 104, name: 'Software Engineering' }
    ]
  },
  {
    id: 2,
    name: 'Business Administration',
    courses: [
      { id: 201, name: 'Principles of Management' },
      { id: 202, name: 'Marketing Fundamentals' },
      { id: 203, name: 'Financial Accounting' },
      { id: 204, name: 'Business Strategy' }
    ]
  },
  {
    id: 3,
    name: 'Digital Marketing',
    courses: [
      { id: 301, name: 'Social Media Marketing' },
      { id: 302, name: 'Search Engine Optimization' },
      { id: 303, name: 'Content Marketing Strategy' },
      { id: 304, name: 'Email Marketing Campaigns' }
    ]
  }
]);
// Computed properties
const availableCourses = computed(() => {
  return selectedProgram.value ? selectedProgram.value.courses : [];
});
const canUpload = computed(() => {
  return selectedProgram.value && selectedCourse.value && selectedFile.value && !isUploading.value;
});
const handleLogout = () => {
  resetUploadForm();
};
const selectProgram = (program: any) => {
  selectedProgram.value = program;
  selectedCourse.value = null;
  showProgramDropdown.value = false;
  uploadError.value = '';
};
const selectCourse = (course: any) => {
  selectedCourse.value = course;
  showCourseDropdown.value = false;
  uploadError.value = '';
};
const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files[0]) {
    validateAndSetFile(target.files[0]);
  }
};
const handleDrop = (event: DragEvent) => {
  event.preventDefault();
  isDragging.value = false;
  if (event.dataTransfer?.files && event.dataTransfer.files[0]) {
    validateAndSetFile(event.dataTransfer.files[0]);
  }
};
const validateAndSetFile = (file: File) => {
  const maxSize = 10 * 1024 * 1024; // 10MB
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain'
  ];
  if (file.size > maxSize) {
    uploadError.value = 'File size must be less than 10MB';
    return;
  }
  if (!allowedTypes.includes(file.type)) {
    uploadError.value = 'Please select a valid file format (PDF, DOC, DOCX, PPT, PPTX, TXT)';
    return;
  }
  selectedFile.value = file;
  uploadError.value = '';
  uploadSuccess.value = '';
};
const removeFile = () => {
  selectedFile.value = null;
  uploadProgress.value = 0;
  uploadError.value = '';
  uploadSuccess.value = '';
};
const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};
const handleUpload = async () => {
  if (!canUpload.value) return;
  uploadError.value = '';
  uploadSuccess.value = '';
  isUploading.value = true;
  uploadProgress.value = 0;
  // Simulate file upload with progress
  const uploadInterval = setInterval(() => {
    uploadProgress.value += 10;
    if (uploadProgress.value >= 100) {
      clearInterval(uploadInterval);
      isUploading.value = false;
      uploadSuccess.value = `Successfully uploaded "${selectedFile.value.name}" to ${selectedCourse.value.name}`;
      // Reset form after successful upload
      setTimeout(() => {
        resetUploadForm();
      }, 3000);
    }
  }, 200);
};
const resetUploadForm = () => {
  selectedProgram.value = null;
  selectedCourse.value = null;
  selectedFile.value = null;
  uploadProgress.value = 0;
  uploadError.value = '';
  uploadSuccess.value = '';
  showProgramDropdown.value = false;
  showCourseDropdown.value = false;
};
// Close dropdowns when clicking outside
onMounted(() => {
  document.addEventListener('click', (event) => {
    const target = event.target as HTMLElement;
    if (!target.closest('.relative')) {
      showProgramDropdown.value = false;
      showCourseDropdown.value = false;
    }
  });
});
</script>
