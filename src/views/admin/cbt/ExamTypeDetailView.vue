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
        <p class="mt-2 text-lg font-semibold text-gray-900 dark:text-white">{{ examTypeCourses.length }}</p>
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
      <div class="space-y-4 p-6">
        <div class="flex items-center justify-between gap-3">
          <div>
            <h3 class="text-base font-semibold text-gray-900 dark:text-white">Courses</h3>
            <p class="text-sm text-gray-600 dark:text-gray-400">Assign and reorder topics for each course in this exam type.</p>
          </div>
        </div>

        <div v-if="examTypeCourses.length" class="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
          <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead class="bg-gray-50 dark:bg-gray-900/40">
              <tr>
                <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Course</th>
                <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Description</th>
                <th class="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Topics</th>
                <th class="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Action</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
              <tr v-for="course in examTypeCourses" :key="course.id" class="hover:bg-gray-50 dark:hover:bg-gray-700/40">
                <td class="px-4 py-4">
                  <div class="text-sm font-semibold text-gray-900 dark:text-white">{{ course.courseName }}</div>
                </td>
                <td class="px-4 py-4 text-sm text-gray-600 dark:text-gray-300">
                  {{ course.description || 'No description available.' }}
                </td>
                <td class="px-4 py-4 text-center">
                  <span class="inline-flex min-w-10 justify-center rounded-full bg-gray-100 px-3 py-1 text-sm font-semibold text-gray-700 dark:bg-gray-900/60 dark:text-gray-200">
                    {{ course.topicCount }}
                  </span>
                </td>
                <td class="px-4 py-4 text-right">
                  <button
                    type="button"
                    @click="openTopicAssignmentModal(course.id)"
                    class="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-blue-700">
                    <i class="fas fa-link"></i>
                    Assign Topics
                  </button>
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
    </section>

    <TopicAssignmentModal
      v-if="showTopicAssignmentModal"
      :course="selectedTopicCourse"
      :available-topics="availableTopicOptions"
      :selected-topics="selectedTopics"
      :selected-topic-course-id="selectedTopicCourseId"
      :is-loading-topic-options="isLoadingTopicOptions"
      @close="closeTopicAssignmentModal"
      @save="saveTopicAssignments"
      @add-topic="addSelectedTopicById"
      @add-topics="addSelectedTopicsById"
      @remove-topic="removeSelectedTopic"
      @move-topic="moveSelectedTopic"
      @move-selected="moveSelectedTopics"
      @reorder-topic="reorderSelectedTopic" />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useToast } from 'vue-toast-notification';
import { useRoute, useRouter } from 'vue-router';
import TopicAssignmentModal from '@/components/admin/cbt/TopicAssignmentModal.vue';
import { useExamTypeDetail } from '@/composables/useExamTypeDetail';
import { useExamTypeTopics } from '@/composables/useExamTypeTopics';

const toast = useToast();
const route = useRoute();
const router = useRouter();

const showTopicAssignmentModal = ref(false);

const {
  examType,
  examTypeCourses,
  isExamTypeActive,
  isLoadingExamTypeDetail,
  loadExamTypeDetail,
  loadExamTypeCourses,
} = useExamTypeDetail();

const {
  availableTopicOptions,
  selectedTopics,
  selectedTopicCourseId,
  isLoadingTopicOptions,
  loadExamTypeTopics,
  setSelectedTopicCourse,
  addSelectedTopicById,
  addSelectedTopicsById,
  removeSelectedTopic,
  moveSelectedTopic,
  moveSelectedTopics,
  reorderSelectedTopic,
  saveExamTypeTopics,
} = useExamTypeTopics();

const isLoading = computed(() => isLoadingExamTypeDetail.value);

const examCourses = computed(() => examTypeCourses.value);

const selectedTopicCourse = computed(() =>
  examCourses.value.find(course => course.id === selectedTopicCourseId.value) ?? null,
);

const goBack = () => {
  router.push({ name: 'Exam Types' });
};

const loadExamType = async () => {
  const examTypeId = String(route.params.examTypeId || '').trim();

  try {
    const loadedExamType = await loadExamTypeDetail(examTypeId);
    if (loadedExamType) {
      await loadExamTypeTopics(examTypeId);
    }
  } catch (error) {
    toast.error('Failed to load exam type details');
    console.error('Error loading exam type details:', error);
  }
};

const openTopicAssignmentModal = (courseId: number) => {
  void setSelectedTopicCourse(courseId);
  showTopicAssignmentModal.value = true;
};

const closeTopicAssignmentModal = () => {
  showTopicAssignmentModal.value = false;
};

const saveTopicAssignments = async () => {
  const examTypeId = String(route.params.examTypeId || '').trim();

  if (!examTypeId) {
    return;
  }

  await saveExamTypeTopics(examTypeId);
  await loadExamTypeCourses(examTypeId);
  showTopicAssignmentModal.value = false;
};

watch(
  () => route.params.examTypeId,
  () => {
    void loadExamType();
  },
  { immediate: true },
);
</script>
