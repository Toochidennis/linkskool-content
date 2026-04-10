import { ref } from 'vue'
import { useToast } from 'vue-toast-notification'
import { programService } from '@/api/services/serviceFactory'

export interface ProgramEnrollmentAnalysisSummary {
  totalProfiles: number
  totalEnrollments: number
  totalPaymentAttempts: number
  totalPendingPayments: number
  totalAbandonedPayments: number
  totalSuccessfulPayments: number
  totalAmountPaid: number
  currency: string
  amountUnit: string
}

export interface ProgramEnrollmentAnalysisCourseOption {
  id: number
  name: string
}

export interface ProgramEnrollmentAnalysisFilterOptions {
  courses: ProgramEnrollmentAnalysisCourseOption[]
  enrollmentStatuses: string[]
  enrollmentTypes: string[]
  paymentStatuses: string[]
}

export interface ProgramEnrollmentAnalysisProfile {
  profileId: number
  firstName: string
  lastName: string
  email: string
  phone: string
  summary: ProgramEnrollmentAnalysisSummary
}

export interface ProgramEnrollmentAnalysisResolvedPayment {
  status: string
  reference: string | null
  amount: number | null
  createdAt: string | null
}

export interface ProgramEnrollmentAnalysisEnrollment {
  enrollmentId: number
  courseId: number
  courseName: string
  cohortId: number | null
  cohortName: string
  cohortSlug: string
  cohortStatus: string
  enrollmentType: string
  enrollmentStatus: string
  paymentStatus: string
  paymentReference: string | null
  lessonsTaken: number | null
  trialExpiryDate: string | null
  enrolledAt: string | null
  paymentAttemptCount: number
  pendingPaymentCount: number
  abandonedPaymentCount: number
  successfulPaymentCount: number
  totalAmountPaid: number
  hasSuccessfulPayment: boolean
  resolvedPayment: ProgramEnrollmentAnalysisResolvedPayment | null
}

export interface ProgramEnrollmentAnalysisProfileDetails {
  program: ProgramEnrollmentAnalysisProgram | null
  profile: Omit<ProgramEnrollmentAnalysisProfile, 'summary'> | null
  summary: ProgramEnrollmentAnalysisSummary | null
  enrollments: ProgramEnrollmentAnalysisEnrollment[]
}

export interface ProgramEnrollmentAnalysisMeta {
  total: number
  perPage: number
  currentPage: number
  lastPage: number
  hasNext: boolean
  hasPrev: boolean
}

export interface ProgramEnrollmentAnalysisProgram {
  id: number
  name: string
  slug: string
  shortname: string
  status: string
  startDate: string
}

export interface ProgramEnrollmentAnalysisPayload {
  program: ProgramEnrollmentAnalysisProgram | null
  summary: ProgramEnrollmentAnalysisSummary | null
  filterOptions: ProgramEnrollmentAnalysisFilterOptions
  profiles: ProgramEnrollmentAnalysisProfile[]
  meta: ProgramEnrollmentAnalysisMeta | null
}

export interface ProgramEnrollmentAnalysisParams {
  page?: number
  limit?: number
  courseId?: number | null
  cohortId?: number | null
  paymentStatus?: string
  enrollmentStatus?: string
  enrollmentType?: string
}

const defaultFilterOptions = (): ProgramEnrollmentAnalysisFilterOptions => ({
  courses: [],
  enrollmentStatuses: [],
  enrollmentTypes: [],
  paymentStatuses: [],
})

export function useProgramEnrollmentAnalysis() {
  const toast = useToast()

  const payload = ref<ProgramEnrollmentAnalysisPayload>({
    program: null,
    summary: null,
    filterOptions: defaultFilterOptions(),
    profiles: [],
    meta: null,
  })
  const isLoadingProfiles = ref(false)
  const profileEnrollments = ref<ProgramEnrollmentAnalysisProfileDetails | null>(null)
  const isLoadingProfileEnrollments = ref(false)

  const fetchEnrollmentProfiles = async (
    programId: number | string,
    params: ProgramEnrollmentAnalysisParams = {},
  ) => {
    if (!programId) {
      payload.value = {
        program: null,
        summary: null,
        filterOptions: defaultFilterOptions(),
        profiles: [],
        meta: null,
      }
      return payload.value
    }

    isLoadingProfiles.value = true

    try {
      const response = await programService.get(
        `${programId}/enrollment-analysis/profiles`,
        sanitizeParams(params),
      )

      const data = response?.data as Partial<ProgramEnrollmentAnalysisPayload> | undefined

      payload.value = {
        program: data?.program ?? null,
        summary: data?.summary ?? null,
        filterOptions: {
          courses: Array.isArray(data?.filterOptions?.courses) ? data!.filterOptions!.courses : [],
          enrollmentStatuses: Array.isArray(data?.filterOptions?.enrollmentStatuses)
            ? data!.filterOptions!.enrollmentStatuses
            : [],
          enrollmentTypes: Array.isArray(data?.filterOptions?.enrollmentTypes)
            ? data!.filterOptions!.enrollmentTypes
            : [],
          paymentStatuses: Array.isArray(data?.filterOptions?.paymentStatuses)
            ? data!.filterOptions!.paymentStatuses
            : [],
        },
        profiles: Array.isArray(data?.profiles) ? data!.profiles : [],
        meta: data?.meta ?? null,
      }

      return payload.value
    } catch (error) {
      console.error('Failed to fetch enrollment analysis profiles:', error)
      payload.value = {
        program: null,
        summary: null,
        filterOptions: defaultFilterOptions(),
        profiles: [],
        meta: null,
      }
      toast.error('Failed to load enrollment analysis profiles')
      throw error
    } finally {
      isLoadingProfiles.value = false
    }
  }

  const fetchProfileEnrollments = async (
    programId: number | string,
    profileId: number | string,
  ) => {
    if (!programId || !profileId) {
      profileEnrollments.value = null
      return null
    }

    isLoadingProfileEnrollments.value = true

    try {
      const response = await programService.get(
        `${programId}/enrollment-analysis/profiles/${profileId}/enrollments`,
      )

      const data = response?.data as Partial<ProgramEnrollmentAnalysisProfileDetails> | undefined

      profileEnrollments.value = {
        program: data?.program ?? null,
        profile: data?.profile ?? null,
        summary: data?.summary ?? null,
        enrollments: Array.isArray(data?.enrollments) ? data!.enrollments : [],
      }
      return profileEnrollments.value
    } catch (error) {
      console.error('Failed to fetch profile enrollments:', error)
      profileEnrollments.value = null
      toast.error('Failed to load profile enrollments')
      throw error
    } finally {
      isLoadingProfileEnrollments.value = false
    }
  }

  return {
    payload,
    isLoadingProfiles,
    profileEnrollments,
    isLoadingProfileEnrollments,
    fetchEnrollmentProfiles,
    fetchProfileEnrollments,
  }
}

const sanitizeParams = (params: ProgramEnrollmentAnalysisParams) => {
  return Object.fromEntries(
    Object.entries({
      page: params.page,
      limit: params.limit,
      course_id: params.courseId,
      cohort_id: params.cohortId,
      payment_status: params.paymentStatus,
      enrollment_status: params.enrollmentStatus,
      enrollment_type: params.enrollmentType,
    }).filter(([, value]) => value !== '' && value !== null && value !== undefined),
  )
}
