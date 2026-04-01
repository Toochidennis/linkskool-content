<template>
  <div class="profile-page">
    <div class="profile-header-shell">
      <div class="profile-header-top">
        <button type="button" class="back-button" @click="goBack">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>

        <div class="profile-header-copy">
          <p class="eyebrow">Enrollment Profile</p>
          <h1 class="profile-title">{{ profileName }}</h1>
          <p class="profile-subtitle">
            {{ details?.profile?.email || 'No email provided' }}
            <span v-if="details?.profile?.phone">• {{ details.profile.phone }}</span>
          </p>
        </div>
      </div>

      <div v-if="summary" class="summary-grid">
        <article class="summary-card">
          <span class="summary-label">Total enrollments</span>
          <strong class="summary-value">{{ formatNumber(summary.totalEnrollments) }}</strong>
        </article>
        <article class="summary-card">
          <span class="summary-label">Payment attempts</span>
          <strong class="summary-value">{{ formatNumber(summary.totalPaymentAttempts) }}</strong>
        </article>
        <article class="summary-card">
          <span class="summary-label">Pending payments</span>
          <strong class="summary-value">{{ formatNumber(summary.totalPendingPayments) }}</strong>
        </article>
        <article class="summary-card">
          <span class="summary-label">Successful payments</span>
          <strong class="summary-value">{{ formatNumber(summary.totalSuccessfulPayments) }}</strong>
        </article>
        <article class="summary-card">
          <span class="summary-label">Amount paid</span>
          <strong class="summary-value">
            {{ formatMoney(summary.totalAmountPaid, summary.currency) }}
          </strong>
        </article>
        <article class="summary-card">
          <span class="summary-label">Abandoned payments</span>
          <strong class="summary-value">{{ formatNumber(summary.totalAbandonedPayments) }}</strong>
        </article>
      </div>
    </div>

    <div v-if="isLoadingProfileEnrollments" class="loading-state">
      <div class="loading-spinner"></div>
      <p>Loading learner enrollment details...</p>
    </div>

    <div v-else-if="loadError" class="feedback-card error">
      <p class="feedback-title">Unable to load enrollment details</p>
      <p class="feedback-text">{{ loadError }}</p>
      <button type="button" class="primary-button" @click="fetchDetails">Try again</button>
    </div>

    <div v-else-if="details" class="content-stack">
      <section class="panel">
        <div class="panel-header">
          <div>
            <h2 class="panel-title">Enrollment Records</h2>
            <p class="panel-subtitle">
              {{ formatNumber(details.enrollments.length) }} enrollments returned for this learner.
            </p>
          </div>
        </div>

        <div v-if="details.enrollments.length" class="enrollment-list">
          <article
            v-for="enrollment in details.enrollments"
            :key="enrollment.enrollmentId"
            class="enrollment-card"
          >
            <div class="enrollment-main">
              <div>
                <h3 class="enrollment-title">{{ enrollment.courseName }}</h3>
                <p class="enrollment-subtitle">
                  {{ enrollment.cohortName || 'No cohort assigned' }}
                  <span v-if="enrollment.cohortStatus">
                    • {{ humanize(enrollment.cohortStatus) }}
                  </span>
                </p>
              </div>

              <div class="pill-row">
                <span class="info-pill">{{ humanize(enrollment.enrollmentType) }}</span>
                <span class="info-pill">{{ humanize(enrollment.enrollmentStatus) }}</span>
                <span class="info-pill" :class="paymentTone(enrollment.paymentStatus)">
                  {{ humanize(enrollment.paymentStatus) }}
                </span>
              </div>
            </div>

            <div class="enrollment-grid">
              <div class="detail-item">
                <span class="detail-label">Payment attempts</span>
                <strong class="detail-value">
                  {{ formatNumber(enrollment.paymentAttemptCount) }}
                </strong>
              </div>
              <div class="detail-item">
                <span class="detail-label">Pending payments</span>
                <strong class="detail-value">
                  {{ formatNumber(enrollment.pendingPaymentCount) }}
                </strong>
              </div>
              <div class="detail-item">
                <span class="detail-label">Successful payments</span>
                <strong class="detail-value">
                  {{ formatNumber(enrollment.successfulPaymentCount) }}
                </strong>
              </div>
              <div class="detail-item">
                <span class="detail-label">Amount paid</span>
                <strong class="detail-value">
                  {{ formatMoney(enrollment.totalAmountPaid, summary?.currency || 'NGN') }}
                </strong>
              </div>
              <div class="detail-item">
                <span class="detail-label">Lessons taken</span>
                <strong class="detail-value">{{ enrollment.lessonsTaken ?? 'N/A' }}</strong>
              </div>
              <div class="detail-item">
                <span class="detail-label">Enrolled at</span>
                <strong class="detail-value">{{ formatDate(enrollment.enrolledAt) }}</strong>
              </div>
            </div>

            <div v-if="enrollment.resolvedPayment" class="resolved-payment">
              <div class="resolved-payment-header">
                <h4>Resolved payment</h4>
                <span class="info-pill" :class="paymentTone(enrollment.resolvedPayment.status)">
                  {{ humanize(enrollment.resolvedPayment.status) }}
                </span>
              </div>

              <div class="resolved-payment-grid">
                <div class="detail-item">
                  <span class="detail-label">Reference</span>
                  <strong class="detail-value">
                    {{ enrollment.resolvedPayment.reference || 'N/A' }}
                  </strong>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Amount</span>
                  <strong class="detail-value">
                    {{
                      enrollment.resolvedPayment.amount === null
                        ? 'N/A'
                        : formatMoney(enrollment.resolvedPayment.amount, summary?.currency || 'NGN')
                    }}
                  </strong>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Created at</span>
                  <strong class="detail-value">
                    {{ formatDate(enrollment.resolvedPayment.createdAt) }}
                  </strong>
                </div>
              </div>
            </div>
          </article>
        </div>

        <div v-else class="feedback-card">
          <p class="feedback-title">No enrollments found</p>
          <p class="feedback-text">This learner does not have any enrollment records yet.</p>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useProgramEnrollmentAnalysis } from '@/composables/useProgramEnrollmentAnalysis'

const route = useRoute()
const router = useRouter()

const { profileEnrollments, isLoadingProfileEnrollments, fetchProfileEnrollments } =
  useProgramEnrollmentAnalysis()

const loadError = ref('')

const programId = computed(() => Number(route.params.programId || 0))
const profileId = computed(() => Number(route.params.profileId || 0))
const details = computed(() => profileEnrollments.value)
const summary = computed(() => details.value?.summary ?? null)
const profileName = computed(() => {
  const profile = details.value?.profile
  if (!profile) return 'Enrollment profile'
  return (
    [profile.firstName, profile.lastName].filter(Boolean).join(' ').trim() || 'Enrollment profile'
  )
})

const fetchDetails = async () => {
  if (!programId.value || !profileId.value) return

  loadError.value = ''

  try {
    await fetchProfileEnrollments(programId.value, profileId.value)
  } catch (error) {
    const maybeError = error as { response?: { data?: { message?: string } }; message?: string }
    loadError.value =
      maybeError?.response?.data?.message ||
      maybeError?.message ||
      'Failed to load enrollment details'
  }
}

const goBack = () => {
  const slug = String(route.query.programSlug || '')
  const name = String(route.query.programName || '')

  if (slug) {
    router.push({
      name: 'Program Courses',
      params: { slug },
      query: {
        id: String(programId.value),
        name,
      },
    })
    return
  }

  router.back()
}

const humanize = (value: string) =>
  (value || '').replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase()) || 'N/A'

const formatNumber = (value: number) => new Intl.NumberFormat('en-NG').format(value || 0)

const formatMoney = (value: number, currency = 'NGN') =>
  new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: currency || 'NGN',
    maximumFractionDigits: 0,
  }).format(value || 0)

const formatDate = (value: string | null) => {
  if (!value) return 'N/A'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'N/A'
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

const paymentTone = (status: string) => {
  const normalized = (status || '').toLowerCase()
  if (normalized === 'free' || normalized === 'paid' || normalized === 'successful') return 'paid'
  if (normalized === 'pending') return 'pending'
  if (normalized === 'failed' || normalized === 'abandoned') return 'failed'
  return 'neutral'
}

onMounted(async () => {
  await fetchDetails()
})
</script>

<style scoped>
.profile-page {
  min-height: 100vh;
  padding-bottom: 2rem;
}

.profile-header-shell {
  margin-bottom: 1.25rem;
  padding: 1.25rem;
  border-radius: 1rem;
  background: linear-gradient(135deg, #f8fafc 0%, #eef2ff 70%, #eff6ff 100%);
  border: 1px solid #e2e8f0;
}

.profile-header-top {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1rem;
}

.back-button {
  padding: 0.5rem;
  background: #fff;
  border: 1px solid #dbe3ee;
  border-radius: 0.6rem;
  color: #64748b;
  cursor: pointer;
}

.eyebrow {
  margin: 0 0 0.35rem;
  color: #4338ca;
  font-size: 0.8rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.profile-title {
  margin: 0;
  color: #0f172a;
  font-size: 1.9rem;
  font-weight: 800;
}

.profile-subtitle {
  margin: 0.35rem 0 0;
  color: #64748b;
  font-size: 0.92rem;
}

.summary-grid,
.enrollment-grid,
.resolved-payment-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.9rem;
}

.summary-card,
.panel,
.enrollment-card,
.feedback-card {
  border: 1px solid #dbe3ee;
  border-radius: 1rem;
  background: #fff;
}

.summary-card {
  padding: 1rem;
}

.summary-label,
.detail-label {
  display: block;
  margin-bottom: 0.35rem;
  color: #64748b;
  font-size: 0.8rem;
  font-weight: 600;
}

.summary-value,
.detail-value {
  color: #0f172a;
  font-size: 1.15rem;
  font-weight: 800;
}

.loading-state,
.feedback-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 3rem 1.5rem;
  text-align: center;
}

.loading-spinner {
  width: 2rem;
  height: 2rem;
  border-radius: 999px;
  border: 3px solid #dbeafe;
  border-top-color: #2563eb;
  animation: spin 0.8s linear infinite;
}

.feedback-card.error {
  border-color: #fecaca;
  background: #fff7f7;
}

.feedback-title {
  margin: 0;
  color: #0f172a;
  font-size: 1rem;
  font-weight: 800;
}

.feedback-text {
  margin: 0;
  color: #64748b;
}

.primary-button {
  border: 1px solid #4338ca;
  background: linear-gradient(135deg, #4f46e5, #4338ca);
  color: #fff;
  border-radius: 0.75rem;
  padding: 0.75rem 1rem;
  font-weight: 700;
  cursor: pointer;
}

.content-stack {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.panel {
  padding: 1.15rem;
}

.panel-header {
  margin-bottom: 1rem;
}

.panel-title {
  margin: 0;
  color: #0f172a;
  font-size: 1.05rem;
  font-weight: 800;
}

.panel-subtitle {
  margin: 0.3rem 0 0;
  color: #64748b;
  font-size: 0.88rem;
}

.enrollment-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.enrollment-card {
  padding: 1rem;
}

.enrollment-main {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1rem;
}

.enrollment-title {
  margin: 0;
  color: #0f172a;
  font-size: 1rem;
  font-weight: 800;
}

.enrollment-subtitle {
  margin: 0.35rem 0 0;
  color: #64748b;
  font-size: 0.86rem;
}

.pill-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.info-pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  padding: 0.28rem 0.6rem;
  font-size: 0.74rem;
  font-weight: 800;
  background: #e2e8f0;
  color: #334155;
}

.info-pill.paid {
  background: #dcfce7;
  color: #166534;
}

.info-pill.pending {
  background: #dbeafe;
  color: #1d4ed8;
}

.info-pill.failed {
  background: #fee2e2;
  color: #b91c1c;
}

.info-pill.neutral {
  background: #e2e8f0;
  color: #334155;
}

.resolved-payment {
  margin-top: 1rem;
  border-top: 1px solid #eef2f7;
  padding-top: 1rem;
}

.resolved-payment-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 0.85rem;
}

.resolved-payment-header h4 {
  margin: 0;
  color: #0f172a;
  font-size: 0.94rem;
  font-weight: 800;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 900px) {
  .summary-grid,
  .enrollment-grid,
  .resolved-payment-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 768px) {
  .profile-header-top,
  .enrollment-main,
  .resolved-payment-header {
    flex-direction: column;
    align-items: stretch;
  }

  .summary-grid,
  .enrollment-grid,
  .resolved-payment-grid {
    grid-template-columns: 1fr;
  }
}
</style>
