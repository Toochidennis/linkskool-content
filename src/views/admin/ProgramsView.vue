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
            <div class="flex items-center space-x-2">
              <button class="text-gray-400 hover:text-blue-600 cursor-pointer">
                <i class="fas fa-edit text-sm"></i>
              </button>
              <button class="text-gray-400 hover:text-red-600 cursor-pointer">
                <i class="fas fa-trash text-sm"></i>
              </button>
            </div>
          </div>
          <div v-if="program.expanded" class="ml-6 mt-2">
            <div v-for="course in program.courses" :key="course.id" class="mb-2">
              <div class="flex items-center justify-between p-2 bg-gray-100 dark:bg-gray-600 rounded-lg">
                <div class="flex items-center">
                  <i class="fas fa-book text-green-600 mr-2 text-sm"></i>
                  <span class="text-sm font-medium text-gray-900 dark:text-white">{{ course.name }}</span>
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
    <div v-if="showModal" class="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
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
                {{ course.name }}
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
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

interface Course {
  id: number;
  name: string;
  description: string;
}

interface Program {
  id: number;
  name: string;
  expanded: boolean;
  courses: Course[];
}

// Available courses from the system
const availableCourses = ref<Course[]>([
  { id: 1, name: 'Introduction to Web Development', description: 'Learn the fundamentals of web development with HTML, CSS, and JavaScript' },
  { id: 2, name: 'Advanced Python Programming', description: 'Master advanced Python concepts and build scalable applications' },
  { id: 3, name: 'Digital Marketing Strategy', description: 'Comprehensive guide to modern digital marketing techniques' },
  { id: 4, name: 'Data Structures & Algorithms', description: 'Master data structures and algorithmic problem solving' },
  { id: 5, name: 'Database Management Systems', description: 'Learn database design and SQL' },
  { id: 6, name: 'Calculus I', description: 'Introduction to differential and integral calculus' }
]);

// Program structure
const programStructure = ref<Program[]>([
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
      }
    ]
  },
  {
    id: 2,
    name: 'Mathematics Program',
    expanded: false,
    courses: [
      {
        id: 3,
        name: 'Calculus I',
        description: 'Introduction to differential and integral calculus'
      }
    ]
  }
]);

const showModal = ref(false);

const newProgram = ref({
  name: '',
  shortname: '',
  courseIds: [] as number[]
});

const toggleCourse = (courseId: number) => {
  const index = newProgram.value.courseIds.indexOf(courseId);
  if (index > -1) {
    newProgram.value.courseIds.splice(index, 1);
  } else {
    newProgram.value.courseIds.push(courseId);
  }
};

const addProgram = () => {
  if (newProgram.value.name.trim() && newProgram.value.courseIds.length > 0) {
    const selectedCourses = availableCourses.value.filter(c =>
      newProgram.value.courseIds.includes(c.id)
    );

    const program: Program = {
      id: Math.max(...programStructure.value.map(p => p.id), 0) + 1,
      name: newProgram.value.name,
      expanded: false,
      courses: selectedCourses
    };

    programStructure.value.push(program);
    closeModal();
  }
};

const closeModal = () => {
  showModal.value = false;
  newProgram.value = { name: '', shortname: '', courseIds: [] };
};
</script>
