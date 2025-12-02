<template>
  <div class="space-y-8">
    <div>
      <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">Course Management</h2>
      <p class="text-gray-600 dark:text-gray-400">Manage courses and related information</p>
    </div>

    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
      <div class="p-6 border-b border-gray-200 dark:border-gray-700">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Courses</h3>
          <div class="flex items-center space-x-3">
            <div class="relative">
              <i class="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm"></i>
              <input type="text" placeholder="Search courses..."
                class="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            </div>
            <button @click="showModal = true"
              class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer whitespace-nowrap">
              <i class="fas fa-plus mr-2"></i>Add Course
            </button>
          </div>
        </div>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Name
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Description
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            <tr v-for="course in courseList" :key="course.id">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center space-x-3">
                  <div class="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900">
                    <span class="text-sm font-bold text-blue-600 dark:text-blue-300">{{
                      course.courseName.charAt(0).toUpperCase() }}</span>
                  </div>
                  <div class="text-sm font-medium text-gray-900 dark:text-white">{{ course.courseName }}</div>
                </div>
              </td>
              <td class="px-6 py-4">
                <div class="text-sm text-gray-600 dark:text-gray-300">{{ course.description }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button @click="openEditModal(course)"
                  class="text-blue-600 hover:text-blue-900 mr-3 cursor-pointer">Edit</button>
                <button @click="deleteCourse(course.id)"
                  class="text-red-600 hover:text-red-900 cursor-pointer">Delete</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Add Course Modal -->
    <div v-if="showModal" @click="closeModal"
      class="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-40">
      <div @click.stop class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 w-full max-w-md">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
            {{ isEditing ? 'Edit Course' : 'Add New Course' }}
          </h3>
          <button @click="closeModal" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <i class="fas fa-times text-xl"></i>
          </button>
        </div>

        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Course Name</label>
            <input v-model="newCourse.courseName" type="text" placeholder="Enter course name" required
              class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
            <textarea v-model="newCourse.description" placeholder="Enter course description" rows="4"
              class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"></textarea>
          </div>
        </div>

        <div class="flex gap-3 mt-6">
          <button @click="closeModal"
            class="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 font-medium transition-colors">
            Cancel
          </button>
          <button @click="isEditing ? updateCourse() : addCourse()" :disabled="isLoading"
            class="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg cursor-pointer font-medium transition-colors flex items-center justify-center gap-2">
            <i v-if="isLoading" class="fas fa-spinner fa-spin"></i>
            {{ isLoading ? (isEditing ? 'Updating...' : 'Adding...') : (isEditing ? 'Update Course' : 'Add Course') }}
          </button>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" @click="showDeleteModal = false"
      class="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-40">
      <div @click.stop class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 w-full max-w-sm">
        <div class="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 dark:bg-red-900 mb-4">
          <i class="fas fa-trash text-red-600 dark:text-red-400 text-lg"></i>
        </div>
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">Delete Course</h3>
        <p class="text-gray-600 dark:text-gray-300 mb-6">Are you sure you want to delete this course? This action cannot
          be undone.</p>
        <div class="flex gap-3">
          <button @click="showDeleteModal = false"
            class="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 font-medium transition-colors">
            Cancel
          </button>
          <button @click="confirmDelete" :disabled="isLoading"
            class="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-lg cursor-pointer font-medium transition-colors flex items-center justify-center gap-2">
            <i v-if="isLoading" class="fas fa-spinner fa-spin"></i>
            {{ isLoading ? 'Deleting...' : 'Delete' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useToast } from 'vue-toast-notification'
import type { Course } from '@/api/models'
import { courseService } from '@/api/services/serviceFactory'

const $toast = useToast()

const showModal = ref(false)
const showDeleteModal = ref(false)
const courseList = ref<Course[]>([])
const isLoading = ref(false)
const isEditing = ref(false)
const editingCourseId = ref<number | null>(null)
const newCourse = ref({
  courseName: '',
  description: ''
})

const capitalize = (str: string): string => {
  if (!str) return '';
  return str
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const fetchCourses = async () => {
  try {
    const response = await courseService.get()

    if (response && response.data && Array.isArray(response.data)) {
      courseList.value = response.data.map((courseData: Course) => ({
        id: courseData.id,
        courseName: capitalize(courseData.courseName),
        description: courseData.description || ''
      }))
    }
  } catch (e) {
    console.error('Error fetching courses:', e)
    $toast.error('Failed to load courses')
  }
}

onMounted(() => {
  fetchCourses()
})

const closeModal = () => {
  showModal.value = false
  isEditing.value = false
  editingCourseId.value = null
  newCourse.value = { courseName: '', description: '' }
}

const openEditModal = (course: Course) => {
  isEditing.value = true
  editingCourseId.value = course.id
  newCourse.value = {
    courseName: course.courseName,
    description: course.description || ''
  }
  showModal.value = true
}

const addCourse = async () => {
  if (!newCourse.value.courseName.trim()) {
    $toast.warning('Please enter a course name')
    return
  }

  isLoading.value = true

  try {
    const response = await courseService.post('', {
      courseName: newCourse.value.courseName,
      description: newCourse.value.description
    })

    if (response.success) {
      $toast.success(response.message || 'Course added successfully')
      closeModal()
      await fetchCourses()
    } else {
      $toast.error(response.message || 'Failed to add course')
    }
  } catch (e) {
    console.error('Error adding course:', e)
    $toast.error('Failed to add course')
  } finally {
    isLoading.value = false
  }
}

const updateCourse = async () => {
  if (!newCourse.value.courseName.trim()) {
    $toast.warning('Please enter a course name')
    return
  }

  if (!editingCourseId.value) {
    $toast.error('Course ID is missing')
    return
  }

  isLoading.value = true

  try {
    const response = await courseService.put(`${editingCourseId.value}`, {
      courseName: newCourse.value.courseName,
      description: newCourse.value.description
    })

    if (response.success) {
      $toast.success(response.message || 'Course updated successfully')
      closeModal()
      await fetchCourses()
    } else {
      $toast.error(response.message || 'Failed to update course')
    }
  } catch (e) {
    console.error('Error updating course:', e)
    $toast.error('Failed to update course')
  } finally {
    isLoading.value = false
  }
}

const deleteCourse = (courseId: number) => {
  editingCourseId.value = courseId
  showDeleteModal.value = true
}

const confirmDelete = async () => {
  if (!editingCourseId.value) {
    $toast.error('Course ID is missing')
    return
  }

  isLoading.value = true

  try {
    const response = await courseService.delete(`${editingCourseId.value}`)
    console.log('Delete response:', response)
    if (response.success) {
      $toast.success(response.message || 'Course deleted successfully')
      showDeleteModal.value = false
      editingCourseId.value = null
      await fetchCourses()
    } else {
      $toast.error(response.message || 'Failed to delete course')
    }
  } catch (e: unknown) {
    const error = e as { response?: { status?: number; data?: { message?: string } }; message?: string };
    console.error('Error deleting course:', error)
    console.error('Error details:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    })
    $toast.error(error.response?.data?.message || 'Failed to delete course')
  } finally {
    isLoading.value = false
  }
}
</script>
