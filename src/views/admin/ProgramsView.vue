<template>
  <section>
    <div class="mb-8">
      <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">Program Setup</h2>
      <p class="text-gray-600 dark:text-gray-400">Manage your educational program structure</p>
    </div>
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <!-- Program Hierarchy Tree -->
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div class="p-6 border-b border-gray-200 dark:border-gray-700">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Program Structure</h3>
            <button
              class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer whitespace-nowrap !rounded-button">
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
                    <button @click="course.expanded = !course.expanded" class="mr-3 cursor-pointer">
                      <i :class="course.expanded ? 'fas fa-chevron-down' : 'fas fa-chevron-right'"
                        class="text-gray-400 text-xs"></i>
                    </button>
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
                <div v-if="course.expanded" class="ml-6 mt-1">
                  <div v-for="exam in course.exams" :key="exam.id"
                    class="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded-lg mb-1">
                    <div class="flex items-center">
                      <i class="fas fa-file-alt text-orange-600 mr-2 text-sm"></i>
                      <span class="text-sm text-gray-900 dark:text-white">{{ exam.name }}</span>
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
      </div>
      <!-- Quick Actions -->
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div class="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Quick Actions</h3>
        </div>
        <div class="p-6 space-y-4">
          <button
            class="w-full flex items-center p-4 bg-blue-50 dark:bg-blue-900 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-800 transition-colors cursor-pointer whitespace-nowrap !rounded-button">
            <i class="fas fa-plus-circle text-blue-600 mr-3"></i>
            <div class="text-left">
              <div class="font-medium text-gray-900 dark:text-white">Create New Program</div>
              <div class="text-sm text-gray-600 dark:text-gray-400">Set up a new educational program</div>
            </div>
          </button>
          <button
            class="w-full flex items-center p-4 bg-green-50 dark:bg-green-900 rounded-lg hover:bg-green-100 dark:hover:bg-green-800 transition-colors cursor-pointer whitespace-nowrap !rounded-button">
            <i class="fas fa-book-open text-green-600 mr-3"></i>
            <div class="text-left">
              <div class="font-medium text-gray-900 dark:text-white">Add Course</div>
              <div class="text-sm text-gray-600 dark:text-gray-400">Create a new course within a program</div>
            </div>
          </button>
          <button
            class="w-full flex items-center p-4 bg-orange-50 dark:bg-orange-900 rounded-lg hover:bg-orange-100 dark:hover:bg-orange-800 transition-colors cursor-pointer whitespace-nowrap !rounded-button">
            <i class="fas fa-clipboard-list text-orange-600 mr-3"></i>
            <div class="text-left">
              <div class="font-medium text-gray-900 dark:text-white">Create Exam</div>
              <div class="text-sm text-gray-600 dark:text-gray-400">Set up a new examination</div>
            </div>
          </button>
          <button
            class="w-full flex items-center p-4 bg-purple-50 dark:bg-purple-900 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-800 transition-colors cursor-pointer whitespace-nowrap !rounded-button">
            <i class="fas fa-download text-purple-600 mr-3"></i>
            <div class="text-left">
              <div class="font-medium text-gray-900 dark:text-white">Import Structure</div>
              <div class="text-sm text-gray-600 dark:text-gray-400">Import program structure from file</div>
            </div>
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue';

// Program structure
const programStructure = ref([
  {
    id: 1,
    name: 'Computer Science Program',
    expanded: true,
    courses: [
      {
        id: 1,
        name: 'Data Structures & Algorithms',
        expanded: true,
        exams: [
          { id: 1, name: 'Midterm Exam' },
          { id: 2, name: 'Final Exam' },
          { id: 3, name: 'Practical Assessment' }
        ]
      },
      {
        id: 2,
        name: 'Database Management Systems',
        expanded: false,
        exams: [
          { id: 4, name: 'Theory Exam' },
          { id: 5, name: 'Lab Exam' }
        ]
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
        expanded: false,
        exams: [
          { id: 6, name: 'Quiz 1' },
          { id: 7, name: 'Quiz 2' },
          { id: 8, name: 'Final Exam' }
        ]
      }
    ]
  }
]);
</script>
