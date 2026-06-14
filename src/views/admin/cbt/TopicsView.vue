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
      <div class="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 p-5 dark:border-gray-700">
        <div>
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Subjects</h2>
          <p class="text-sm text-gray-600 dark:text-gray-400">Select a subject to view its topics.</p>
        </div>

        <span
          v-if="isLoadingTopicsOverview"
          class="inline-flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
          <i class="fas fa-spinner fa-spin"></i>
          Loading
        </span>
      </div>

      <div class="p-5">
        <div v-if="courses.length" class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <button
            v-for="course in courses"
            :key="course.courseId"
            type="button"
            @click="openSubject(course)"
            class="group flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-gray-200 bg-white p-4 text-left transition hover:border-blue-300 hover:shadow-sm dark:border-gray-700 dark:bg-gray-800 dark:hover:border-blue-700">
            <div class="flex min-w-0 items-center gap-3">
              <span
                class="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300">
                <i class="fas fa-book"></i>
              </span>
              <div class="min-w-0">
                <h3 class="truncate font-semibold text-gray-900 dark:text-white">{{ course.courseName }}</h3>
                <p class="text-sm text-gray-600 dark:text-gray-400">{{ formatNumber(course.topicCount) }} topics</p>
              </div>
            </div>
            <i class="fas fa-chevron-right text-gray-300 transition group-hover:text-blue-500 dark:text-gray-600"></i>
          </button>
        </div>
        <div v-else class="py-6 text-center text-sm text-gray-500 dark:text-gray-400">
          {{ isLoadingTopicsOverview ? 'Loading subjects...' : 'No subjects found.' }}
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useTopicsOverview } from '@/composables/useTopicsOverview'
import type { TopicCourse } from '@/composables/useTopicsOverview'

const router = useRouter()
const { courses, summary, isLoadingTopicsOverview, loadTopicsOverview } = useTopicsOverview()

const numberFormatter = new Intl.NumberFormat('en-NG')

const formatNumber = (value: number) => numberFormatter.format(value || 0)

const openSubject = (course: TopicCourse) => {
  router.push({
    name: 'Subject Topics',
    params: { courseId: course.courseId },
    query: { courseName: course.courseName },
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
