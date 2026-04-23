<template>
  <div class="space-y-6">
    <header class="flex flex-wrap items-start justify-between gap-4">
      <div class="space-y-2">
        <p class="text-xs font-semibold uppercase tracking-[0.24em] text-blue-600 dark:text-blue-400">CBT</p>
        <div>
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Exam Types</h1>
          <p class="text-gray-600 dark:text-gray-400">Manage exam types in a single table.</p>
        </div>
      </div>
      <div class="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-600 shadow-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
        <span class="font-semibold text-gray-900 dark:text-white">{{ sortedExamTypes.length }}</span>
        exam type<span v-if="sortedExamTypes.length !== 1">s</span>
      </div>
    </header>

    <section class="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <div class="border-b border-gray-200 px-6 py-4 dark:border-gray-700">
        <div class="flex items-center justify-between gap-3">
          <div>
            <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Exam Types Table</h2>
            <p class="text-sm text-gray-600 dark:text-gray-400">Edit an exam type or open its details page.</p>
          </div>
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead class="bg-gray-50 dark:bg-gray-700/60">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Name</th>
              <th class="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Short Name</th>
              <th class="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Is Active</th>
              <th class="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Display Order</th>
              <th class="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
            <tr v-if="isLoading">
              <td colspan="5" class="px-6 py-10 text-center text-sm text-gray-500 dark:text-gray-400">
                <i class="fas fa-spinner fa-spin mr-2 text-blue-600 dark:text-blue-400"></i>
                Loading exam types...
              </td>
            </tr>

            <tr v-else-if="!sortedExamTypes.length">
              <td colspan="5" class="px-6 py-10 text-center text-sm text-gray-500 dark:text-gray-400">
                No exam types found.
              </td>
            </tr>

            <tr v-else v-for="examType in sortedExamTypes" :key="examType.id" class="hover:bg-gray-50 dark:hover:bg-gray-700/40">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-semibold text-gray-900 dark:text-white">{{ examType.name }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                {{ examType.shortname }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  :class="isExamTypeActive(examType) ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' : 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300'"
                  class="inline-flex rounded-full px-3 py-1 text-xs font-semibold">
                  {{ isExamTypeActive(examType) ? 'Active' : 'Inactive' }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                {{ examType.displayOrder ?? '—' }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div class="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    @click="openEditModal(examType)"
                    class="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-gray-700 transition hover:bg-gray-100 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700 cursor-pointer">
                    <i class="fas fa-pen"></i>
                    Edit
                  </button>
                  <button
                    type="button"
                    @click="goToDetails(examType.id)"
                    class="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-white transition hover:bg-blue-700 cursor-pointer">
                    <i class="fas fa-eye"></i>
                    View Details
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <div
      v-if="showEditModal"
      @click="closeEditModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div
        @click.stop
        class="max-h-[95vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-2xl dark:bg-gray-800">
        <div class="sticky top-0 flex items-start justify-between gap-4 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-5 dark:border-gray-700">
          <div>
            <h3 class="text-2xl font-bold text-white">Edit Exam Type</h3>
            <p class="text-sm text-blue-100">Update the exam type metadata and subject mapping.</p>
          </div>
          <button
            type="button"
            @click="closeEditModal"
            class="rounded-lg p-2 text-blue-100 transition hover:bg-blue-500/70 hover:text-white cursor-pointer">
            <i class="fas fa-times text-xl"></i>
          </button>
        </div>

        <div class="space-y-6 px-6 py-6">
          <section class="space-y-4">
            <div class="flex items-center gap-2">
              <i class="fas fa-info-circle text-blue-600 dark:text-blue-400"></i>
              <h4 class="text-lg font-semibold text-gray-900 dark:text-white">Exam Type Information</h4>
            </div>

            <div class="grid gap-4 md:grid-cols-2">
              <label class="space-y-2">
                <span class="block text-sm font-semibold text-gray-700 dark:text-gray-300">Name</span>
                <input
                  v-model="editingExamType.name"
                  type="text"
                  class="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
                  placeholder="e.g. JAMB" />
              </label>

              <label class="space-y-2">
                <span class="block text-sm font-semibold text-gray-700 dark:text-gray-300">Short Name</span>
                <input
                  v-model="editingExamType.shortname"
                  type="text"
                  class="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
                  placeholder="e.g. JAMB" />
              </label>

              <label class="space-y-2">
                <span class="block text-sm font-semibold text-gray-700 dark:text-gray-300">Display Order</span>
                <input
                  v-model.number="editingExamType.displayOrder"
                  type="number"
                  min="0"
                  class="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
                  placeholder="0" />
              </label>

              <div class="space-y-2">
                <span class="block text-sm font-semibold text-gray-700 dark:text-gray-300">Status</span>
                <button
                  type="button"
                  @click="editingExamType.isActive = editingExamType.isActive ? 0 : 1"
                  :class="editingExamType.isActive ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-gray-600'"
                  class="relative inline-flex h-11 w-20 items-center rounded-full transition cursor-pointer">
                  <span
                    :class="editingExamType.isActive ? 'translate-x-10' : 'translate-x-1'"
                    class="inline-block h-9 w-9 transform rounded-full bg-white shadow transition"></span>
                </button>
              </div>
            </div>
          </section>

          <section class="space-y-4">
            <div class="flex items-center gap-2">
              <i class="fas fa-graduation-cap text-blue-600 dark:text-blue-400"></i>
              <h4 class="text-lg font-semibold text-gray-900 dark:text-white">Subjects</h4>
            </div>

            <div class="rounded-2xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900/40">
              <div v-if="availableCourses.length" class="grid gap-3 sm:grid-cols-2">
                <button
                  v-for="course in availableCourses"
                  :key="course.id"
                  type="button"
                  @click="toggleEditCourse(course.id)"
                  :class="editingExamType.courseIds.includes(course.id)
                    ? 'border-blue-600 bg-blue-600 text-white shadow-sm'
                    : 'border-gray-300 bg-white text-gray-700 hover:border-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200'"
                  class="flex items-center justify-between rounded-xl border px-4 py-3 text-left transition cursor-pointer">
                  <span class="min-w-0">
                    <span class="block truncate font-medium">{{ course.courseName }}</span>
                    <span v-if="course.description" class="block truncate text-xs opacity-80">{{ course.description }}</span>
                  </span>
                  <i :class="editingExamType.courseIds.includes(course.id) ? 'fas fa-check' : 'fas fa-plus'"></i>
                </button>
              </div>

              <div
                class="mt-4 rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800 dark:border-blue-900/50 dark:bg-blue-900/20 dark:text-blue-200">
                <i class="fas fa-info-circle mr-2"></i>
                <span v-if="editingExamType.courseIds.length"> {{ editingExamType.courseIds.length }} subject(s) selected.</span>
                <span v-else>No subjects selected yet.</span>
              </div>
            </div>
          </section>
        </div>

        <div class="flex flex-wrap justify-end gap-3 border-t border-gray-200 bg-gray-50 px-6 py-4 dark:border-gray-700 dark:bg-gray-900/40">
          <button
            type="button"
            @click="closeEditModal"
            class="rounded-lg border border-gray-300 px-4 py-2.5 text-gray-700 transition hover:bg-gray-100 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700 cursor-pointer">
            Cancel
          </button>
          <button
            type="button"
            @click="saveExamType"
            :disabled="isSaving"
            class="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer">
            <i :class="isSaving ? 'fas fa-spinner fa-spin' : 'fas fa-save'"></i>
            {{ isSaving ? 'Saving...' : 'Save Changes' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useToast } from 'vue-toast-notification';
import { useRouter } from 'vue-router';
import type { Course, ExamType } from '@/api/models';
import { courseService, examTypeService } from '@/api/services/serviceFactory';

const $toast = useToast();
const router = useRouter();

const availableCourses = ref<Course[]>([]);
const examTypeStructure = ref<ExamType[]>([]);
const isLoading = ref(false);
const isSaving = ref(false);
const showEditModal = ref(false);

const editingExamType = ref({
  id: 0,
  name: '',
  shortname: '',
  courseIds: [] as number[],
  isActive: 1,
  displayOrder: 0,
});

const normalizeExamType = (examType: ExamType): ExamType => ({
  id: Number(examType.id),
  name: String(examType.name || '').trim(),
  shortname: String(examType.shortname || '').trim(),
  courses: Array.isArray(examType.courses) ? examType.courses : [],
  isActive: Number(examType.isActive ?? 0),
  displayOrder: Number(examType.displayOrder ?? 0),
});

const sortedExamTypes = computed(() =>
  [...examTypeStructure.value].sort((a, b) => {
    const orderDiff = (a.displayOrder ?? 0) - (b.displayOrder ?? 0);
    if (orderDiff !== 0) return orderDiff;
    return a.name.localeCompare(b.name);
  }),
);

const isExamTypeActive = (examType: ExamType) => Number(examType.isActive) === 1;

const loadCourses = async () => {
  try {
    const response = await courseService.get<Course[]>();
    if (response?.data && Array.isArray(response.data)) {
      availableCourses.value = response.data.map(course => ({
        id: Number(course.id),
        courseName: String(course.courseName || '').trim(),
        description: course.description || '',
        videoCount: course.videoCount,
      }));
    }
  } catch (error) {
    console.error('Error fetching courses:', error);
    $toast.error('Failed to load courses');
  }
};

const loadExamTypes = async () => {
  isLoading.value = true;

  try {
    const response = await examTypeService.get<ExamType[]>();
    if (response?.data && Array.isArray(response.data)) {
      examTypeStructure.value = response.data.map(normalizeExamType);
      return;
    }

    examTypeStructure.value = [];
  } catch (error) {
    console.error('Error fetching exam types:', error);
    examTypeStructure.value = [];
    $toast.error('Failed to load exam types');
  } finally {
    isLoading.value = false;
  }
};

const openEditModal = (examType: ExamType) => {
  editingExamType.value = {
    id: examType.id,
    name: examType.name,
    shortname: examType.shortname,
    courseIds: Array.isArray(examType.courses) ? examType.courses.map(course => course.id) : [],
    isActive: Number(examType.isActive ?? 0),
    displayOrder: Number(examType.displayOrder ?? 0),
  };
  showEditModal.value = true;
};

const closeEditModal = () => {
  showEditModal.value = false;
  editingExamType.value = {
    id: 0,
    name: '',
    shortname: '',
    courseIds: [],
    isActive: 1,
    displayOrder: 0,
  };
};

const toggleEditCourse = (courseId: number) => {
  const selectedIds = editingExamType.value.courseIds;
  const nextIndex = selectedIds.indexOf(courseId);

  if (nextIndex >= 0) {
    selectedIds.splice(nextIndex, 1);
    return;
  }

  selectedIds.push(courseId);
};

const saveExamType = async () => {
  if (!editingExamType.value.name.trim()) {
    $toast.warning('Please enter an exam type name');
    return;
  }

  if (!editingExamType.value.shortname.trim()) {
    $toast.warning('Please enter a short name');
    return;
  }

  isSaving.value = true;

  try {
    const response = await examTypeService.put(`${editingExamType.value.id}`, {
      name: editingExamType.value.name.trim(),
      shortname: editingExamType.value.shortname.trim(),
      courseIds: editingExamType.value.courseIds,
      isActive: editingExamType.value.isActive,
      displayOrder: Number(editingExamType.value.displayOrder || 0),
    });

    if (response.success) {
      $toast.success(response.message || 'Exam type updated successfully');
      closeEditModal();
      await loadExamTypes();
    } else {
      $toast.error(response.message || 'Failed to update exam type');
    }
  } catch (error) {
    console.error('Error updating exam type:', error);
    $toast.error('Failed to update exam type');
  } finally {
    isSaving.value = false;
  }
};

const goToDetails = (examTypeId: number) => {
  router.push({
    name: 'Exam Type Details',
    params: { examTypeId: String(examTypeId) },
  });
};

onMounted(() => {
  void loadCourses();
  void loadExamTypes();
});
</script>
