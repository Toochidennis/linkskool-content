<template>
  <div class="space-y-6">
    <header class="flex flex-wrap items-start justify-between gap-4">
      <div class="flex items-start gap-4">
        <button
          type="button"
          @click="goBack"
          class="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-gray-300 bg-white text-gray-600 transition hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 cursor-pointer"
          aria-label="Back to exam types">
          <i class="fas fa-arrow-left"></i>
        </button>

        <div class="space-y-1">
          <p class="text-xs font-semibold uppercase tracking-[0.24em] text-blue-600 dark:text-blue-400">Exam Type Details</p>
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white">{{ examType?.name || 'Exam Type' }}</h1>
          <p class="text-gray-600 dark:text-gray-400">
            View the exam type metadata, its subjects, and the topic assignment workspace.
          </p>
        </div>
      </div>

      <div v-if="examType" class="flex flex-wrap items-center gap-3">
        <span
          :class="isExamTypeActive ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' : 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300'"
          class="inline-flex rounded-full px-3 py-1 text-xs font-semibold">
          {{ isExamTypeActive ? 'Active' : 'Inactive' }}
        </span>
        <span class="inline-flex rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
          {{ examType.shortname }}
        </span>
      </div>
    </header>

    <section
      v-if="isLoading"
      class="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white px-5 py-4 text-gray-600 shadow-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
      <i class="fas fa-spinner fa-spin text-blue-600 dark:text-blue-400"></i>
      <span>Loading exam type details...</span>
    </section>

    <section
      v-else-if="examType"
      class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <article class="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <p class="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Short Name</p>
        <p class="mt-2 text-lg font-semibold text-gray-900 dark:text-white">{{ examType.shortname }}</p>
      </article>
      <article class="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <p class="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Status</p>
        <p class="mt-2 text-lg font-semibold" :class="isExamTypeActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'">
          {{ isExamTypeActive ? 'Active' : 'Inactive' }}
        </p>
      </article>
      <article class="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <p class="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Display Order</p>
        <p class="mt-2 text-lg font-semibold text-gray-900 dark:text-white">{{ examType.displayOrder ?? '—' }}</p>
      </article>
      <article class="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <p class="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Subjects</p>
        <p class="mt-2 text-lg font-semibold text-gray-900 dark:text-white">{{ examType.courses.length }}</p>
      </article>
    </section>

    <section v-else class="rounded-2xl border border-gray-200 bg-white px-6 py-10 text-center shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <div class="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-300">
        <i class="fas fa-layer-group"></i>
      </div>
      <h2 class="mt-4 text-xl font-semibold text-gray-900 dark:text-white">Exam type not found</h2>
      <p class="mt-2 text-gray-600 dark:text-gray-400">The requested exam type could not be loaded.</p>
      <button
        type="button"
        @click="goBack"
        class="mt-6 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-white transition hover:bg-blue-700 cursor-pointer">
        <i class="fas fa-arrow-left"></i>
        Back to exam types
      </button>
    </section>

    <section v-if="examType" class="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <div class="border-b border-gray-200 px-6 py-4 dark:border-gray-700">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Exam Type Tabs</h2>
            <p class="text-sm text-gray-600 dark:text-gray-400">Use the courses tab to review current courses.</p>
          </div>
        <div class="flex items-center rounded-xl bg-gray-100 p-1 dark:bg-gray-900/60">
          <button
              v-for="tab in tabs"
              :key="tab.key"
              type="button"
              @click="activeTab = tab.key"
              :class="activeTab === tab.key ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white'"
              class="rounded-lg px-4 py-2 text-sm font-semibold transition cursor-pointer">
              {{ tab.label }}
            </button>
          </div>
        </div>
      </div>

      <div class="p-6">
        <div v-if="activeTab === 'courses'" class="space-y-4">
          <div class="flex items-center justify-between gap-3">
            <div>
              <h3 class="text-base font-semibold text-gray-900 dark:text-white">Courses</h3>
              <p class="text-sm text-gray-600 dark:text-gray-400">These are the courses currently attached to this exam type.</p>
            </div>
          </div>

          <div v-if="examType.courses.length" class="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
            <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead class="bg-gray-50 dark:bg-gray-900/40">
                <tr>
                  <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Course</th>
                  <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Description</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
                <tr v-for="course in examType.courses" :key="course.id" class="hover:bg-gray-50 dark:hover:bg-gray-700/40">
                  <td class="px-4 py-4">
                    <div class="text-sm font-semibold text-gray-900 dark:text-white">{{ course.courseName }}</div>
                  </td>
                  <td class="px-4 py-4 text-sm text-gray-600 dark:text-gray-300">
                    {{ course.description || 'No description available.' }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div v-else class="rounded-2xl border border-dashed border-gray-300 bg-gray-50 px-6 py-10 text-center dark:border-gray-600 dark:bg-gray-900/30">
            <div class="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300">
              <i class="fas fa-book"></i>
            </div>
            <h3 class="mt-4 text-lg font-semibold text-gray-900 dark:text-white">No subjects attached</h3>
            <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">This exam type does not have any courses assigned yet.</p>
          </div>
        </div>

        <div v-else class="space-y-4">
          <div class="flex items-center justify-between gap-3">
            <div>
              <h3 class="text-base font-semibold text-gray-900 dark:text-white">Topics</h3>
              <p class="text-sm text-gray-600 dark:text-gray-400">This tab starts empty and is ready for course assignment.</p>
            </div>
            <button
              type="button"
              @click="openTopicAssignmentModal"
              class="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-white transition hover:bg-blue-700 cursor-pointer">
              <i class="fas fa-link"></i>
              Assign Courses to Topics
            </button>
          </div>

          <div v-if="assignedTopicCourses.length" class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <article
              v-for="course in assignedTopicCourses"
              :key="course.id"
              class="rounded-2xl border border-gray-200 bg-gray-50 p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900/40">
              <p class="text-sm font-semibold text-gray-900 dark:text-white">{{ course.courseName }}</p>
              <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">Ready for topic-level assignment.</p>
            </article>
          </div>

          <div v-else class="rounded-2xl border border-dashed border-gray-300 bg-gray-50 px-6 py-10 text-center dark:border-gray-600 dark:bg-gray-900/30">
            <div class="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300">
              <i class="fas fa-sitemap"></i>
            </div>
            <h3 class="mt-4 text-lg font-semibold text-gray-900 dark:text-white">No topic assignments yet</h3>
            <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">Use the button above to prepare courses for the topics tab.</p>
          </div>
        </div>
      </div>
    </section>

    <div
      v-if="showTopicAssignmentModal"
      @click="closeTopicAssignmentModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div
        @click.stop
        class="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl dark:bg-gray-800">
        <div class="flex items-start justify-between gap-4 border-b border-gray-200 px-6 py-5 dark:border-gray-700">
          <div>
            <h3 class="text-2xl font-bold text-gray-900 dark:text-white">Assign Courses to Topics</h3>
            <p class="text-sm text-gray-600 dark:text-gray-400">Pick the courses that should be available on the Topics tab.</p>
          </div>
          <button
            type="button"
            @click="closeTopicAssignmentModal"
            class="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white cursor-pointer">
            <i class="fas fa-times text-xl"></i>
          </button>
        </div>

        <div class="space-y-4 px-6 py-6">
          <div v-if="examType?.courses.length" class="grid gap-3 sm:grid-cols-2">
            <button
              v-for="course in examType?.courses || []"
              :key="course.id"
              type="button"
              @click="toggleDraftTopicCourse(course.id)"
              :class="draftTopicCourseIds.includes(course.id)
                ? 'border-blue-600 bg-blue-600 text-white shadow-sm'
                : 'border-gray-300 bg-white text-gray-700 hover:border-blue-500 dark:border-gray-600 dark:bg-gray-900/40 dark:text-gray-200'"
              class="flex items-center justify-between rounded-xl border px-4 py-3 text-left transition cursor-pointer">
              <span class="min-w-0">
                <span class="block truncate font-medium">{{ course.courseName }}</span>
                <span v-if="course.description" class="block truncate text-xs opacity-80">{{ course.description }}</span>
              </span>
              <i :class="draftTopicCourseIds.includes(course.id) ? 'fas fa-check' : 'fas fa-plus'"></i>
            </button>
          </div>

          <div
            class="rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800 dark:border-blue-900/50 dark:bg-blue-900/20 dark:text-blue-200">
            <i class="fas fa-info-circle mr-2"></i>
            {{ draftTopicCourseIds.length }} course(s) selected for the Topics tab.
          </div>
        </div>

        <div class="flex justify-end gap-3 border-t border-gray-200 bg-gray-50 px-6 py-4 dark:border-gray-700 dark:bg-gray-900/40">
          <button
            type="button"
            @click="closeTopicAssignmentModal"
            class="rounded-lg border border-gray-300 px-4 py-2.5 text-gray-700 transition hover:bg-gray-100 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700 cursor-pointer">
            Cancel
          </button>
          <button
            type="button"
            @click="saveTopicAssignments"
            class="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-white transition hover:bg-blue-700 cursor-pointer">
            <i class="fas fa-save"></i>
            Save Assignment
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useToast } from 'vue-toast-notification';
import { useRoute, useRouter } from 'vue-router';
import type { ExamType } from '@/api/models';
import { examTypeService } from '@/api/services/serviceFactory';

const toast = useToast();
const route = useRoute();
const router = useRouter();

const examType = ref<ExamType | null>(null);
const isLoading = ref(false);
const activeTab = ref<'courses' | 'topics'>('courses');
const showTopicAssignmentModal = ref(false);
const assignedTopicCourseIds = ref<number[]>([]);
const draftTopicCourseIds = ref<number[]>([]);

const tabs = [
  { key: 'courses', label: 'Courses' },
  { key: 'topics', label: 'Topics' },
] as const;

const normalizeExamType = (payload: ExamType): ExamType => ({
  id: Number(payload.id),
  name: String(payload.name || '').trim(),
  shortname: String(payload.shortname || '').trim(),
  courses: Array.isArray(payload.courses) ? payload.courses : [],
  isActive: Number(payload.isActive ?? 0),
  displayOrder: Number(payload.displayOrder ?? 0),
});

const isExamTypeActive = computed(() => Number(examType.value?.isActive ?? 0) === 1);

const assignedTopicCourses = computed(() => {
  const courses = examType.value?.courses ?? [];
  return courses.filter(course => assignedTopicCourseIds.value.includes(course.id));
});

const goBack = () => {
  router.push({ name: 'Exam Types' });
};

const loadExamType = async () => {
  const examTypeId = String(route.params.examTypeId || '').trim();

  if (!examTypeId) {
    examType.value = null;
    return;
  }

  isLoading.value = true;

  try {
    const response = await examTypeService.get<ExamType>(examTypeId);
    if (response?.data) {
      examType.value = normalizeExamType(response.data);
      assignedTopicCourseIds.value = [];
      draftTopicCourseIds.value = [];
      activeTab.value = 'courses';
      return;
    }

    examType.value = null;
  } catch (error) {
    console.error('Error loading exam type details:', error);
    examType.value = null;
    toast.error('Failed to load exam type details');
  } finally {
    isLoading.value = false;
  }
};

const openTopicAssignmentModal = () => {
  draftTopicCourseIds.value = [...assignedTopicCourseIds.value];
  showTopicAssignmentModal.value = true;
};

const closeTopicAssignmentModal = () => {
  showTopicAssignmentModal.value = false;
};

const toggleDraftTopicCourse = (courseId: number) => {
  const currentIndex = draftTopicCourseIds.value.indexOf(courseId);

  if (currentIndex >= 0) {
    draftTopicCourseIds.value.splice(currentIndex, 1);
    return;
  }

  draftTopicCourseIds.value.push(courseId);
};

const saveTopicAssignments = () => {
  assignedTopicCourseIds.value = [...draftTopicCourseIds.value];
  showTopicAssignmentModal.value = false;
  toast.success('Topic course assignment updated');
};

watch(
  () => route.params.examTypeId,
  () => {
    void loadExamType();
  },
  { immediate: true },
);
</script>
