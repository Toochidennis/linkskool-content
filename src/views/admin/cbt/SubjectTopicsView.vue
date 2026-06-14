<template>
  <div class="space-y-6">
    <header class="flex flex-wrap items-start justify-between gap-4">
      <div class="flex min-w-0 items-start gap-3">
        <button type="button" @click="goBack"
          class="mt-1 inline-flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-gray-300 text-gray-600 transition hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700"
          aria-label="Back to subjects">
          <i class="fas fa-arrow-left"></i>
        </button>
        <div class="min-w-0">
          <p class="text-xs font-semibold uppercase tracking-[0.24em] text-blue-600 dark:text-blue-400">Subject</p>
          <h1 class="mt-2 truncate text-3xl font-bold text-gray-900 dark:text-white">{{ courseName || 'Topics' }}</h1>
          <p class="mt-2 text-gray-600 dark:text-gray-400">{{ formatNumber(topicsCount) }} topics grouped by category.</p>
        </div>
      </div>

      <span v-if="isLoadingCourseTopics"
        class="inline-flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
        <i class="fas fa-spinner fa-spin"></i>
        Loading topics
      </span>
    </header>

    <div v-if="selectedCourseTopicCategories.length" class="space-y-5">
      <section v-for="category in selectedCourseTopicCategories" :key="category.categoryId"
        class="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 class="font-semibold text-gray-900 dark:text-white">{{ category.categoryName }}</h2>
            <p class="text-sm text-gray-600 dark:text-gray-400">{{ formatNumber(category.topics.length) }} topics</p>
          </div>
        </div>

        <div
          class="divide-y divide-gray-200 overflow-hidden rounded-lg border border-gray-200 dark:divide-gray-700 dark:border-gray-700">
          <article v-for="topic in category.topics" :key="topic.id"
            class="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
            <div class="min-w-0">
              <h3 class="truncate font-semibold text-gray-900 dark:text-white">{{ topic.name }}</h3>
              <p class="text-sm text-gray-600 dark:text-gray-400">
                {{ formatNumber(topic.questionsCount) }} linked questions
              </p>
            </div>
            <div class="flex shrink-0 items-center gap-2">
              <button type="button" @click="openSubtopics(topic)" title="View subtopics" aria-label="View subtopics"
                class="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-blue-200 px-3 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-50 dark:border-blue-900/60 dark:text-blue-200 dark:hover:bg-blue-900/20">
                <i class="fas fa-list-ul"></i>
                Subtopics
              </button>
              <button type="button" @click="openTopicContent(topic)" title="Edit content" aria-label="Edit content"
                class="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-emerald-200 px-3 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-50 dark:border-emerald-900/60 dark:text-emerald-200 dark:hover:bg-emerald-900/20">
                <i class="fas fa-edit"></i>
                Edit content
              </button>
            </div>
          </article>
        </div>
      </section>
    </div>

    <div v-else
      class="rounded-2xl border border-dashed border-gray-300 px-6 py-16 text-center dark:border-gray-600">
      <h2 class="text-base font-semibold text-gray-900 dark:text-white">No topics found</h2>
      <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">
        {{ isLoadingCourseTopics ? 'Loading topics for this subject...' : 'This subject has no topics yet.' }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useTopicsOverview } from '@/composables/useTopicsOverview'
import type { CourseTopic } from '@/composables/useTopicsOverview'

const route = useRoute()
const router = useRouter()
const { selectedCourseTopicCategories, selectedCourseTopicsCount, isLoadingCourseTopics, loadCourseTopics } =
  useTopicsOverview()

const courseId = computed(() => Number(route.params.courseId))
const courseName = computed(() => (typeof route.query.courseName === 'string' ? route.query.courseName : ''))
const topicsCount = computed(() => selectedCourseTopicsCount.value)

const numberFormatter = new Intl.NumberFormat('en-NG')
const formatNumber = (value: number) => numberFormatter.format(value || 0)

const goBack = () => {
  router.push({ name: 'Topics' })
}

const openSubtopics = (topic: CourseTopic) => {
  router.push({
    name: 'Topic Subtopics',
    params: { topicId: topic.id },
    query: { topicName: topic.name },
  })
}

const openTopicContent = (topic: CourseTopic) => {
  router.push({
    name: 'Topic Content Editor',
    params: { topicId: topic.id },
    query: { topicName: topic.name },
  })
}

onMounted(() => {
  if (Number.isFinite(courseId.value)) {
    void loadCourseTopics(courseId.value)
  }
})
</script>
