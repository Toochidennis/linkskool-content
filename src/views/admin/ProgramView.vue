<template>
  <div class="space-y-8">
    <div>
      <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">Program Setup</h2>
      <p class="text-gray-600 dark:text-gray-400">Manage your educational program structure</p>
    </div>
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
      <div class="p-6 border-b border-gray-200 dark:border-gray-700">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Program Structure</h3>
          <button @click="showModal = true"
            class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer whitespace-nowrap">
            <i class="fas fa-plus mr-2"></i>Add Program
          </button>
        </div>
      </div>
      <div class="p-6">
        <div v-for="program in programStructure" :key="program.id" class="mb-4">
          <div class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div class="flex items-center">
              <button @click="program.expanded = !program.expanded" class="mr-3 cursor-pointer">
                <i :class="program.expanded ? 'fas fa-chevron-down' : 'fas fa-chevron-right'"
                  class="text-gray-400 text-sm"></i>
              </button>
              <i class="fas fa-folder text-blue-600 mr-2"></i>
              <span class="font-medium text-gray-900 dark:text-white">{{ capitalize(program.name) }}</span>
            </div>
            <div class="flex items-center space-x-4">
              <div class="flex items-center space-x-2">
                <button @click="openEditModal(program)" class="text-gray-400 hover:text-blue-600 cursor-pointer">
                  <i class="fas fa-edit text-sm"></i>
                </button>
                <button @click="openDeleteModal(program)" class="text-gray-400 hover:text-red-600 cursor-pointer">
                  <i class="fas fa-trash text-sm"></i>
                </button>
              </div>
            </div>
          </div>
          <div v-if="program.expanded" class="ml-6 mt-2">
            <div v-for="course in program.courses" :key="course.id" class="mb-2">
              <div class="flex items-center justify-between p-2 bg-gray-100 dark:bg-gray-600 rounded-lg">
                <div class="flex items-center">
                  <i class="fas fa-book text-green-600 mr-2 text-sm"></i>
                  <span class="text-sm font-medium text-gray-900 dark:text-white">{{ capitalize(course.courseName)
                    }}</span>
                </div>
                <div class="flex items-center space-x-2">
                  <button class="text-gray-400 hover:text-blue-600 cursor-pointer">
                    <i class="fas fa-edit text-xs"></i>
                  </button>
                  <button class="text-gray-400 hover:text-red-600 cursor-pointer">
                    <i class="fas fa-trash text-xs"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Add Program Modal -->
    <div v-if="showModal" @click="closeModal"
      class="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div @click.stop
        class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[95vh] overflow-y-auto">

        <!-- Modal Header -->
        <div
          class="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6 flex items-center justify-between border-b border-blue-600">
          <div>
            <h3 class="text-2xl font-bold text-white mb-1">Add New Program</h3>
            <p class="text-blue-100 text-sm">Create a new educational program and assign courses</p>
          </div>
          <button @click="closeModal"
            class="text-blue-100 hover:text-white transition-colors p-2 hover:bg-blue-500 rounded-lg">
            <i class="fas fa-times text-2xl"></i>
          </button>
        </div>

        <!-- Modal Content -->
        <div class="p-8">
          <div class="space-y-6">
            <!-- Program Information Section -->
            <div>
              <h4 class="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <i class="fas fa-book-open text-blue-600 mr-2"></i>
                Program Information
              </h4>
              <div
                class="space-y-4 bg-gray-50 dark:bg-gray-700/50 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                <!-- Program Name -->
                <div>
                  <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Program Name</label>
                  <input v-model="newProgram.name" type="text" placeholder="e.g., Bachelor of Science"
                    class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" />
                  <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">Full name of the program</p>
                </div>

                <!-- Program Short Name -->
                <div>
                  <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Short Name</label>
                  <input v-model="newProgram.shortname" type="text" placeholder="e.g., BSC"
                    class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" />
                  <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">Abbreviated name for quick reference</p>
                </div>
              </div>
            </div>

            <!-- Courses Section -->
            <div>
              <h4 class="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <i class="fas fa-graduation-cap text-blue-600 mr-2"></i>
                Assign Courses
              </h4>
              <div class="bg-gray-50 dark:bg-gray-700/50 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                <div class="flex flex-wrap gap-3">
                  <button v-for="course in availableCourses" :key="course.id" @click="toggleCourse(course.id)" :class="[
                    'px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer whitespace-nowrap',
                    newProgram.courseIds.includes(course.id)
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:border-blue-500 hover:shadow-sm'
                  ]">
                    <i :class="newProgram.courseIds.includes(course.id) ? 'fas fa-check mr-2' : 'fas fa-plus mr-2'"></i>
                    {{ course.courseName }}
                  </button>
                </div>
                <div
                  class="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <p class="text-sm text-blue-800 dark:text-blue-300">
                    <i class="fas fa-info-circle mr-2"></i>
                    <span v-if="newProgram.courseIds.length === 0">No courses selected yet</span>
                    <span v-else>{{ newProgram.courseIds.length }} course(s) selected</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Modal Footer -->
        <div
          class="bg-gray-50 dark:bg-gray-700/50 px-8 py-4 border-t border-gray-200 dark:border-gray-700 flex gap-3 justify-end sticky bottom-0">
          <button @click="closeModal"
            class="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 font-semibold transition-colors cursor-pointer">
            Cancel
          </button>
          <button @click="addProgram"
            class="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors cursor-pointer shadow-md hover:shadow-lg">
            <i class="fas fa-plus mr-2"></i>Add Program
          </button>
        </div>
      </div>
    </div>

    <!-- Edit Program Modal -->
    <div v-if="showEditModal" @click="closeEditModal"
      class="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div @click.stop
        class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[95vh] overflow-y-auto">

        <!-- Modal Header -->
        <div
          class="sticky top-0 bg-gradient-to-r from-amber-600 to-amber-700 px-8 py-6 flex items-center justify-between border-b border-amber-600">
          <div>
            <h3 class="text-2xl font-bold text-white mb-1">Edit Program</h3>
            <p class="text-amber-100 text-sm">Update program details and course assignments</p>
          </div>
          <button @click="closeEditModal"
            class="text-amber-100 hover:text-white transition-colors p-2 hover:bg-amber-500 rounded-lg">
            <i class="fas fa-times text-2xl"></i>
          </button>
        </div>

        <!-- Modal Content -->
        <div class="p-8">
          <div class="space-y-6">
            <!-- Program Information Section -->
            <div>
              <h4 class="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <i class="fas fa-book-open text-amber-600 mr-2"></i>
                Program Information
              </h4>
              <div
                class="space-y-4 bg-gray-50 dark:bg-gray-700/50 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                <!-- Program Name -->
                <div>
                  <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Program Name</label>
                  <input v-model="editingProgram.name" type="text" placeholder="e.g., Bachelor of Science"
                    class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all" />
                  <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">Full name of the program</p>
                </div>

                <!-- Program Short Name -->
                <div>
                  <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Short Name</label>
                  <input v-model="editingProgram.shortname" type="text" placeholder="e.g., BSC"
                    class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all" />
                  <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">Abbreviated name for quick reference</p>
                </div>
              </div>
            </div>

            <!-- Status Section -->
            <div>
              <h4 class="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <i class="fas fa-toggle-on text-amber-600 mr-2"></i>
                Status
              </h4>
              <div class="bg-gray-50 dark:bg-gray-700/50 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                <div class="flex items-center justify-between">
                  <div>
                    <p class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Program Status</p>
                    <p class="text-xs text-gray-500 dark:text-gray-400">Enable or disable this program</p>
                  </div>
                  <button @click="editingProgram.isActive = editingProgram.isActive ? 0 : 1" :class="[
                    'relative inline-flex h-8 w-14 items-center rounded-full transition-all cursor-pointer shadow-sm',
                    editingProgram.isActive ? 'bg-green-500' : 'bg-gray-300'
                  ]">
                    <span :class="[
                      'inline-block h-6 w-6 transform rounded-full bg-white transition-transform shadow-md',
                      editingProgram.isActive ? 'translate-x-7' : 'translate-x-1'
                    ]"></span>
                  </button>
                </div>
                <div
                  class="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <p class="text-sm text-blue-800 dark:text-blue-300">
                    <i class="fas fa-info-circle mr-2"></i>
                    <span>
                      {{
                        editingProgram.isActive ?
                          'This program is currently active'
                          : 'This program is currently inactive' }}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            <!-- Courses Section -->
            <div>
              <h4 class="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <i class="fas fa-graduation-cap text-amber-600 mr-2"></i>
                Assign Courses
              </h4>
              <div class="bg-gray-50 dark:bg-gray-700/50 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                <div class="flex flex-wrap gap-3">
                  <button v-for="course in availableCourses" :key="course.id" @click="toggleEditCourse(course.id)"
                    :class="[
                      'px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer whitespace-nowrap',
                      editingProgram.courseIds.includes(course.id)
                        ? 'bg-amber-600 text-white shadow-md'
                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:border-amber-500 hover:shadow-sm'
                    ]">
                    <i
                      :class="editingProgram.courseIds.includes(course.id) ? 'fas fa-check mr-2' : 'fas fa-plus mr-2'"></i>
                    {{ course.courseName }}
                  </button>
                </div>
                <div
                  class="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <p class="text-sm text-blue-800 dark:text-blue-300">
                    <i class="fas fa-info-circle mr-2"></i>
                    <span v-if="editingProgram.courseIds.length === 0">No courses selected yet</span>
                    <span v-else>{{ editingProgram.courseIds.length }} course(s) selected</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Modal Footer -->
        <div
          class="bg-gray-50 dark:bg-gray-700/50 px-8 py-4 border-t border-gray-200 dark:border-gray-700 flex gap-3 justify-end sticky bottom-0">
          <button @click="closeEditModal"
            class="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 font-semibold transition-colors cursor-pointer">
            Cancel
          </button>
          <button @click="updateProgram"
            class="px-8 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-semibold transition-colors cursor-pointer shadow-md hover:shadow-lg">
            <i class="fas fa-save mr-2"></i>Update Program
          </button>
        </div>
      </div>
    </div>

    <!-- Delete Program Modal -->
    <div v-if="showDeleteModal" @click="closeDeleteModal"
      class="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
      <div @click.stop class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 w-full max-w-sm">
        <div class="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 dark:bg-red-900 mb-4 mx-auto">
          <i class="fas fa-trash text-red-600 dark:text-red-400 text-lg"></i>
        </div>
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2 text-center">Delete Program</h3>
        <p class="text-gray-600 dark:text-gray-300 mb-6 text-center">Are you sure you want to delete this program? This
          action cannot be undone.</p>
        <div class="flex gap-3">
          <button @click="closeDeleteModal"
            class="flex-1 px-4 py-2 border border-gray-300 dark:bord  er-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 font-medium transition-colors">
            Cancel
          </button>
          <button @click="confirmDelete"
            class="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors cursor-pointer">
            Delete
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useToast } from 'vue-toast-notification';
import type { Program, Course } from '@/api/models';
import { programService, courseService } from '@/api/services/serviceFactory';

const $toast = useToast();

// Available courses from the system
const availableCourses = ref<Course[]>([]);

// Program structure
const programStructure = ref<Program[]>([]);

const fetchCourses = async () => {
  try {
    const response = await courseService.get()

    if (response && response.data && Array.isArray(response.data)) {
      availableCourses.value = response.data;
    }
  } catch (error) {
    console.error('Error fetching courses:', error);
  }
};

const fetchPrograms = async () => {
  try {
    const response = await programService.get()

    if (response && response.data && Array.isArray(response.data)) {
      programStructure.value = response.data.map((program: Program) => ({
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
  fetchCourses();
  fetchPrograms();
});

const showModal = ref(false);
const showEditModal = ref(false);
const showDeleteModal = ref(false);
const deletingProgramId = ref<number | null>(null);

const newProgram = ref({
  name: '',
  shortname: '',
  courseIds: [] as number[],
  isActive: 1
});

const editingProgram = ref({
  id: 0,
  name: '',
  shortname: '',
  courseIds: [] as number[],
  isActive: 1
});

const toggleCourse = (courseId: number) => {
  const index = newProgram.value.courseIds.indexOf(courseId);
  if (index > -1) {
    newProgram.value.courseIds.splice(index, 1);
  } else {
    newProgram.value.courseIds.push(courseId);
  }
};

const toggleEditCourse = (courseId: number) => {
  const index = editingProgram.value.courseIds.indexOf(courseId);
  if (index > -1) {
    editingProgram.value.courseIds.splice(index, 1);
  } else {
    editingProgram.value.courseIds.push(courseId);
  }
};

const capitalize = (str: string): string => {
  if (!str) return '';
  return str
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const addProgram = async () => {
  if (!newProgram.value.name.trim()) {
    $toast.warning('Please enter a program name');
    return;
  }

  if (newProgram.value.courseIds.length === 0) {
    $toast.warning('Please select at least one course');
    return;
  }

  try {
    const response = await programService.post(undefined, {
      name: capitalize(newProgram.value.name),
      shortname: newProgram.value.shortname,
      courseIds: newProgram.value.courseIds,
      isActive: newProgram.value.isActive
    });

    if (response.success) {
      $toast.success(response.message || 'Program added successfully');
      closeModal();
      await fetchPrograms();
    }
  } catch (error) {
    console.error('Error adding program:', error);
    $toast.error('Failed to add program');
  }
};

const openEditModal = (program: Program & { expanded?: boolean }) => {
  editingProgram.value = {
    id: program.id,
    name: program.name,
    shortname: program.shortname || '',
    courseIds: program.courses ? program.courses.map(c => c.id) : [],
    isActive: program.isActive || 1
  };
  showEditModal.value = true;
};

const updateProgram = async () => {
  if (!editingProgram.value.name.trim()) {
    $toast.warning('Please enter a program name');
    return;
  }

  if (editingProgram.value.courseIds.length === 0) {
    $toast.warning('Please select at least one course');
    return;
  }

  try {
    const response = await programService.put(`${editingProgram.value.id}`, {
      name: capitalize(editingProgram.value.name),
      shortname: editingProgram.value.shortname,
      courseIds: editingProgram.value.courseIds,
      isActive: editingProgram.value.isActive
    });

    if (response.success) {
      $toast.success(response.message || 'Program updated successfully');
      closeEditModal();
      await fetchPrograms();
    }
  } catch (error) {
    console.error('Error updating program:', error);
    $toast.error('Failed to update program');
  }
};

const closeModal = () => {
  showModal.value = false;
  newProgram.value = { name: '', shortname: '', courseIds: [], isActive: 1 };
};

const openDeleteModal = (program: Program) => {
  deletingProgramId.value = program.id;
  showDeleteModal.value = true;
};

const confirmDelete = async () => {
  if (deletingProgramId.value === null) {
    return;
  }

  try {
    const response = await programService.delete(`${deletingProgramId.value}`);

    if (response.success) {
      $toast.success(response.message || 'Program deleted successfully');
      closeDeleteModal();
      await fetchPrograms();
    }
  } catch (error) {
    console.error('Error deleting program:', error);
    $toast.error('Failed to delete program');
  }
};

const closeDeleteModal = () => {
  showDeleteModal.value = false;
  deletingProgramId.value = null;
};

const closeEditModal = () => {
  showEditModal.value = false;
  editingProgram.value = { id: 0, name: '', shortname: '', courseIds: [], isActive: 1 };
};

</script>
