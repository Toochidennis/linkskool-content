<template>
  <div class="challenge-view">
    <header class="page-header">
      <div>
        <h1 class="page-title">Exam Types</h1>
        <p class="page-subtitle">Select an exam type to continue setting up challenge content.</p>
      </div>
    </header>

    <section v-if="isLoading" class="state-card">
      <div class="loading-spinner"></div>
      <p>Loading exam types...</p>
    </section>

    <section v-else-if="sortedExamTypes.length" class="exam-type-grid">
      <article v-for="examType in sortedExamTypes" :key="examType.id" class="exam-type-card"
        :class="getExamTypeTheme(examType).cardClass">
        <div class="exam-type-card__header">
          <p class="exam-type-card__shortname">{{ examType.shortname }}</p>
          <div class="exam-type-card__icon" :class="getExamTypeTheme(examType).iconClass">
            <i :class="getExamTypeTheme(examType).icon"></i>
          </div>
        </div>

        <div class="exam-type-card__content">
          <h2 class="exam-type-card__title">{{ examType.name }}</h2>
        </div>
      </article>
    </section>

    <section v-else class="state-card empty">
      <div class="empty-icon">
        <i class="fas fa-layer-group"></i>
      </div>
      <h2>No exam types yet</h2>
      <p>Exam types from the API will show up here once they are available.</p>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import type { ExamType } from '@/api/models'
import { useChallenge } from '@/composables/useChallenge'

const { examTypes, isLoading, fetchExamTypes } = useChallenge()

const sortedExamTypes = computed(() =>
  [...examTypes.value].sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0)),
)

const challengeCardIcon = 'fas fa-book-open'

const fallbackThemes = [
  {
    icon: challengeCardIcon,
    cardClass: 'theme-blue',
    iconClass: 'theme-blue-icon',
  },
  {
    icon: challengeCardIcon,
    cardClass: 'theme-cyan',
    iconClass: 'theme-cyan-icon',
  },
  {
    icon: challengeCardIcon,
    cardClass: 'theme-rose',
    iconClass: 'theme-rose-icon',
  },
  {
    icon: challengeCardIcon,
    cardClass: 'theme-indigo',
    iconClass: 'theme-indigo-icon',
  },
  {
    icon: challengeCardIcon,
    cardClass: 'theme-orange',
    iconClass: 'theme-orange-icon',
  },
]

const getExamTypeTheme = (examType: ExamType) => {
  const normalizedName = `${examType.name} ${examType.shortname}`.toLowerCase()

  if (normalizedName.includes('jamb')) {
    return {
      icon: challengeCardIcon,
      cardClass: 'theme-jamb',
      iconClass: 'theme-jamb-icon',
    }
  }

  if (normalizedName.includes('waec')) {
    return {
      icon: challengeCardIcon,
      cardClass: 'theme-waec',
      iconClass: 'theme-waec-icon',
    }
  }

  const hash = normalizedName.split('').reduce((total, char) => total + char.charCodeAt(0), 0)
  return fallbackThemes[hash % fallbackThemes.length]!
}

onMounted(() => {
  fetchExamTypes().catch(() => undefined)
})
</script>

<style scoped>
.challenge-view {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
}

.page-title {
  margin: 0;
  font-size: 1.75rem;
  font-weight: 800;
  color: #0f172a;
}

.page-subtitle {
  margin: 0.35rem 0 0;
  color: #64748b;
  font-size: 0.98rem;
}

.exam-type-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1.25rem;
}

.exam-type-card {
  position: relative;
  overflow: hidden;
  border-radius: 1.25rem;
  padding: 1.1rem;
  min-height: 170px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 1.25rem;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  box-shadow: 0 12px 28px rgba(15, 23, 42, 0.07);
  cursor: pointer;
  transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
}

.exam-type-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 18px 34px rgba(15, 23, 42, 0.11);
  border-color: #cbd5e1;
}

.exam-type-card__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.9rem;
}

.exam-type-card__icon {
  width: 2.85rem;
  height: 2.85rem;
  border-radius: 0.95rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  flex-shrink: 0;
}

.exam-type-card__content {
  margin-top: auto;
}

.exam-type-card__title {
  margin: 0;
  font-size: 1rem;
  line-height: 1.35;
  font-weight: 700;
  letter-spacing: -0.01em;
  color: #0f172a;
}

.exam-type-card__shortname {
  margin: 0;
  padding: 0.32rem 0.62rem;
  border-radius: 9999px;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  line-height: 1;
  border: 1px solid currentColor;
  background: #f8fafc;
  align-self: flex-start;
}

.theme-jamb {
  color: #10b981;
}

.theme-jamb-icon {
  background: #10b981;
  color: #ffffff;
}

.theme-waec {
  color: #f59e0b;
}

.theme-waec-icon {
  background: #f59e0b;
  color: #ffffff;
}

.theme-blue {
  color: #3b82f6;
}

.theme-blue-icon {
  background: #3b82f6;
  color: #ffffff;
}

.theme-cyan {
  color: #06b6d4;
}

.theme-cyan-icon {
  background: #06b6d4;
  color: #ffffff;
}

.theme-rose {
  color: #ec4899;
}

.theme-rose-icon {
  background: #ec4899;
  color: #ffffff;
}

.theme-indigo {
  color: #6366f1;
}

.theme-indigo-icon {
  background: #6366f1;
  color: #ffffff;
}

.theme-orange {
  color: #f97316;
}

.theme-orange-icon {
  background: #f97316;
  color: #ffffff;
}

.state-card {
  min-height: 260px;
  border-radius: 1.25rem;
  border: 1px solid rgba(148, 163, 184, 0.18);
  background: #ffffff;
  box-shadow: 0 14px 30px rgba(15, 23, 42, 0.06);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.85rem;
  text-align: center;
  color: #475569;
}

.state-card.empty {
  background: linear-gradient(135deg, #f8fafc 0%, #eef2ff 100%);
}

.loading-spinner {
  width: 2.4rem;
  height: 2.4rem;
  border-radius: 9999px;
  border: 3px solid rgba(37, 99, 235, 0.16);
  border-top-color: #2563eb;
  animation: spin 0.8s linear infinite;
}

.empty-icon {
  width: 4.5rem;
  height: 4.5rem;
  border-radius: 9999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: #4f46e5;
  background: rgba(79, 70, 229, 0.12);
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 768px) {
  .challenge-view {
    padding: 1rem;
  }

  .page-title {
    font-size: 1.5rem;
  }

  .exam-type-card {
    min-height: 160px;
  }
}
</style>
