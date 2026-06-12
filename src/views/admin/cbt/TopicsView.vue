<template>
  <div class="space-y-6">
    <header>
      <div>
        <p class="text-xs font-semibold uppercase tracking-[0.24em] text-blue-600 dark:text-blue-400">CBT Topics</p>
        <h1 class="mt-2 text-3xl font-bold text-gray-900 dark:text-white">Topics Overview</h1>
        <p class="mt-2 text-gray-600 dark:text-gray-400">Review topic distribution across subjects.</p>
      </div>
    </header>

    <section class="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
      <article
        v-for="stat in stats"
        :key="stat.label"
        class="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div class="flex items-start justify-between gap-4">
          <div>
            <p class="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">{{ stat.label }}</p>
            <p class="mt-3 text-2xl font-bold text-gray-900 dark:text-white">{{ stat.value }}</p>
            <p v-if="stat.description" class="mt-1 text-sm text-gray-500 dark:text-gray-400">{{ stat.description }}</p>
          </div>
          <span
            class="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300">
            <i :class="stat.icon"></i>
          </span>
        </div>
      </article>
    </section>

    <section class="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <div class="border-b border-gray-200 p-5 dark:border-gray-700">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Subjects</h2>
            <p class="text-sm text-gray-600 dark:text-gray-400">Select a subject to view sample topics.</p>
          </div>

          <span
            v-if="isLoadingTopicsOverview"
            class="inline-flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
            <i class="fas fa-spinner fa-spin"></i>
            Loading
          </span>
          <span
            v-else-if="selectedCourse"
            class="inline-flex rounded-full bg-gray-100 px-3 py-1 text-sm font-semibold text-gray-700 dark:bg-gray-900/60 dark:text-gray-200">
            {{ formatNumber(selectedCourse.topicCount) }} topics
          </span>
        </div>
      </div>

      <div class="border-b border-gray-200 px-5 dark:border-gray-700">
        <div v-if="courses.length" class="flex gap-2 overflow-x-auto py-4">
          <button
            v-for="course in courses"
            :key="course.courseId"
            type="button"
            @click="selectCourse(course.courseId)"
            :class="[
              selectedCourseId === course.courseId
                ? 'border-blue-600 bg-blue-600 text-white shadow-sm'
                : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700',
            ]"
            class="inline-flex shrink-0 cursor-pointer items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold transition">
            <span>{{ course.courseName }}</span>
            <span
              :class="selectedCourseId === course.courseId ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600 dark:bg-gray-900/60 dark:text-gray-300'"
              class="rounded-full px-2 py-0.5 text-xs">
              {{ formatCompactNumber(course.topicCount) }}
            </span>
          </button>
        </div>
        <div v-else class="py-4 text-sm text-gray-500 dark:text-gray-400">
          {{ isLoadingTopicsOverview ? 'Loading subjects...' : 'No subjects found.' }}
        </div>
      </div>

      <div v-if="selectedCourse" class="p-5">
        <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 class="text-base font-semibold text-gray-900 dark:text-white">{{ selectedCourse.courseName }} Topics</h3>
            <p class="text-sm text-gray-600 dark:text-gray-400">
              {{ formatNumber(selectedCourseTopicsCount) }} topics grouped by category.
            </p>
          </div>

          <span
            v-if="isLoadingCourseTopics"
            class="inline-flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
            <i class="fas fa-spinner fa-spin"></i>
            Loading topics
          </span>
        </div>

        <div v-if="selectedCourseTopicCategories.length" class="space-y-5">
          <section
            v-for="category in selectedCourseTopicCategories"
            :key="category.categoryId"
            class="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900/30">
            <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h4 class="font-semibold text-gray-900 dark:text-white">{{ category.categoryName }}</h4>
                <p class="text-sm text-gray-600 dark:text-gray-400">{{ formatNumber(category.topics.length) }} topics</p>
              </div>
            </div>

            <div class="divide-y divide-gray-200 overflow-hidden rounded-lg border border-gray-200 bg-white dark:divide-gray-700 dark:border-gray-700 dark:bg-gray-800">
              <article
                v-for="topic in category.topics"
                :key="topic.id"
                class="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
                <div class="min-w-0">
                  <h5 class="truncate font-semibold text-gray-900 dark:text-white">{{ topic.name }}</h5>
                  <p class="text-sm text-gray-600 dark:text-gray-400">
                    {{ formatNumber(topic.questionsCount) }} linked questions
                  </p>
                </div>
                <button
                  type="button"
                  @click="openSubtopics(topic)"
                  class="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-blue-200 px-3 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-50 dark:border-blue-900/60 dark:text-blue-200 dark:hover:bg-blue-900/20">
                  <i class="fas fa-list-ul"></i>
                  View subtopics
                </button>
              </article>
            </div>
          </section>
        </div>

        <div v-else class="rounded-xl border border-dashed border-gray-300 px-6 py-10 text-center dark:border-gray-600">
          <h4 class="text-base font-semibold text-gray-900 dark:text-white">No topics found</h4>
          <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">
            {{ isLoadingCourseTopics ? 'Loading topics for this subject...' : 'This subject has no topics yet.' }}
          </p>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useTopicsOverview } from '@/composables/useTopicsOverview'
import type { CourseTopic } from '@/composables/useTopicsOverview'

const router = useRouter()
const {
  courses,
  summary,
  selectedCourseId,
  selectedCourse,
  selectedCourseTopicCategories,
  selectedCourseTopicsCount,
  isLoadingTopicsOverview,
  isLoadingCourseTopics,
  loadTopicsOverview,
  selectCourse,
} = useTopicsOverview()

const numberFormatter = new Intl.NumberFormat('en-NG')
const compactNumberFormatter = new Intl.NumberFormat('en-NG', {
  notation: 'compact',
  maximumFractionDigits: 1,
})

const formatNumber = (value: number) => numberFormatter.format(value || 0)

const formatCompactNumber = (value: number) => compactNumberFormatter.format(value || 0)

const openSubtopics = (topic: CourseTopic) => {
  router.push({
    name: 'Topic Subtopics',
    params: { topicId: topic.id },
    query: { topicName: topic.name },
  })
}

const stats = computed(() => [
  {
    label: 'Total Subjects',
    value: formatNumber(summary.value.totalCourses),
    description: 'Subjects with topics',
    icon: 'fas fa-book',
  },
  {
    label: 'Total Topics',
    value: formatNumber(summary.value.totalTopics),
    description: 'Across all subjects',
    icon: 'fas fa-layer-group',
  },
  {
    label: 'Average Topics',
    value: formatNumber(summary.value.averageTopicsPerCourse),
    description: 'Per subject',
    icon: 'fas fa-chart-line',
  },
  {
    label: 'Highest Subject',
    value: summary.value.mostTopics?.courseName ?? '—',
    description: summary.value.mostTopics
      ? `${formatNumber(summary.value.mostTopics.topicCount)} topics`
      : 'No subject yet',
    icon: 'fas fa-arrow-trend-up',
  },
  {
    label: 'Lowest Subject',
    value: summary.value.fewestTopics?.courseName ?? '—',
    description: summary.value.fewestTopics
      ? `${formatNumber(summary.value.fewestTopics.topicCount)} topics`
      : 'No subject yet',
    icon: 'fas fa-arrow-trend-down',
  },
])

onMounted(() => {
  void loadTopicsOverview()
})
</script>
