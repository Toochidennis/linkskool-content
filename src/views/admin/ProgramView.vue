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
              <span class="font-medium text-gray-900 dark:text-white">{{ program.name }}</span>
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
                  <span class="text-sm font-medium text-gray-900 dark:text-white">{{ course.courseName }}</span>
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
      class="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
      <div @click.stop
        class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Add New Program</h3>
          <button @click="closeModal" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <i class="fas fa-times text-xl"></i>
          </button>
        </div>

        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Program Name</label>
            <input v-model="newProgram.name" type="text" placeholder="Enter program name"
              class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Program Short Name</label>
            <input v-model="newProgram.shortname" type="text" placeholder="Enter program short name"
              class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Select Courses</label>
            <div
              class="flex flex-wrap gap-2 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 min-h-12">
              <button v-for="course in availableCourses" :key="course.id" @click="toggleCourse(course.id)" :class="[
                'px-3 py-1 rounded-full text-sm font-medium transition-colors cursor-pointer whitespace-nowrap',
                newProgram.courseIds.includes(course.id)
                  ? 'bg-blue-600 text-white'
                  : 'bg-white dark:bg-gray-600 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-500 hover:bg-gray-100 dark:hover:bg-gray-500'
              ]">
                <i :class="newProgram.courseIds.includes(course.id) ? 'fas fa-check mr-1' : ''"></i>
                {{ course.courseName }}
              </button>
            </div>
            <p v-if="newProgram.courseIds.length === 0" class="text-sm text-gray-500 dark:text-gray-400 mt-2">
              No courses selected
            </p>
            <p v-else class="text-sm text-gray-600 dark:text-gray-300 mt-2">
              {{ newProgram.courseIds.length }} course(s) selected
            </p>
          </div>
        </div>

        <div class="flex gap-3 mt-6">
          <button @click="closeModal"
            class="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 font-medium transition-colors">
            Cancel
          </button>
          <button @click="addProgram"
            class="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors cursor-pointer">
            Add Program
          </button>
        </div>
      </div>
    </div>

    <!-- Edit Program Modal -->
    <div v-if="showEditModal" @click="closeEditModal"
      class="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
      <div @click.stop
        class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Edit Program</h3>
          <button @click="closeEditModal" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <i class="fas fa-times text-xl"></i>
          </button>
        </div>

        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Program Name</label>
            <input v-model="editingProgram.name" type="text" placeholder="Enter program name"
              class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Program Short Name</label>
            <input v-model="editingProgram.shortname" type="text" placeholder="Enter program short name"
              class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Status</label>
            <div class="flex items-center space-x-3">
              <button @click="editingProgram.isActive = editingProgram.isActive ? 0 : 1" :class="[
                'relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer',
                editingProgram.isActive ? 'bg-green-600' : 'bg-gray-300'
              ]">
                <span :class="[
                  'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                  editingProgram.isActive ? 'translate-x-6' : 'translate-x-1'
                ]"></span>
              </button>
              <span class="text-sm text-gray-600 dark:text-gray-300">{{ editingProgram.isActive ? 'Active' : 'Inactive'
              }}</span>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Select Courses</label>
            <div
              class="flex flex-wrap gap-2 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 min-h-12">
              <button v-for="course in availableCourses" :key="course.id" @click="toggleEditCourse(course.id)" :class="[
                'px-3 py-1 rounded-full text-sm font-medium transition-colors cursor-pointer whitespace-nowrap',
                editingProgram.courseIds.includes(course.id)
                  ? 'bg-blue-600 text-white'
                  : 'bg-white dark:bg-gray-600 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-500 hover:bg-gray-100 dark:hover:bg-gray-500'
              ]">
                <i :class="editingProgram.courseIds.includes(course.id) ? 'fas fa-check mr-1' : ''"></i>
                {{ course.courseName }}
              </button>
            </div>
            <p v-if="editingProgram.courseIds.length === 0" class="text-sm text-gray-500 dark:text-gray-400 mt-2">
              No courses selected
            </p>
            <p v-else class="text-sm text-gray-600 dark:text-gray-300 mt-2">
              {{ editingProgram.courseIds.length }} course(s) selected
            </p>
          </div>
        </div>

        <div class="flex gap-3 mt-6">
          <button @click="closeEditModal"
            class="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 font-medium transition-colors">
            Cancel
          </button>
          <button @click="updateProgram"
            class="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors cursor-pointer">
            Update Program
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
      name: newProgram.value.name,
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
      name: editingProgram.value.name,
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
