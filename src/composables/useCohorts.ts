import { computed, ref } from 'vue'
import { useToast } from 'vue-toast-notification'
import { programService } from '@/api/services/serviceFactory'

export type CohortStatus = 'upcoming' | 'ongoing' | 'completed'

export type Cohort = {
  id: number
  title: string
  code?: string
  imageUrl?: string
  startDate: string
  endDate: string
  status: CohortStatus
  statusLabel?: string
  participants?: number
  capacity?: number
  waitlist?: number
  instructors?: string[]
  lessonsReady?: number
  totalLessons?: number
  attendance?: number
  retention?: number
  delivery?: string
  deliveryMode?: string
  timezone?: string | 'GMT+1'
  description?: string
  benefits?: string
  courseId?: number
  courseName?: string
  programId?: number
  zoomLink?: string
  isFree?: boolean | number | string
  trialType?: 'views' | 'days'
  trialValue?: number
  cost?: number
}

export type CohortForm = {
  title: string
  code: string
  status: CohortStatus
  startDate: string
  endDate: string
  capacity: number
  description: string
  whatYouWillLearn: string
  delivery: string
  image: string | File
  zoomLink: string
  isFree: boolean
  cost?: number
  trialType?: 'views' | 'days'
  trialValue?: number
}

export function useCohorts() {
  const toast = useToast()

  const cohorts = ref<Cohort[]>([])
  const isLoading = ref(false)
  const isSubmitting = ref(false)
  const editingCohortId = ref<number | null>(null)
  const originalImageUrl = ref<string>('')
  const fieldErrors = ref<Record<string, string>>({})

  const form = ref<CohortForm>({
    title: '',
    code: '',
    status: 'upcoming',
    startDate: '',
    endDate: '',
    capacity: 40,
    description: '',
    whatYouWillLearn: '',
    delivery: 'virtual',
    image: '',
    zoomLink: '',
    isFree: true,
    cost: undefined,
    trialType: undefined,
    trialValue: undefined,
  })

  // Helper functions
  const parseBoolean = (value: unknown) =>
    value === true || value === 1 || value === '1' || value === 'true'

  const isValidZoomLink = (url: string) => {
    if (!url) return true // Empty is valid (optional field)
    try {
      const urlObj = new URL(url)
      return urlObj.hostname.includes('zoom.us') || urlObj.hostname.includes('zoom.com')
    } catch {
      return false
    }
  }

  const statusLabel = (status: CohortStatus) => {
    if (status === 'ongoing') return 'In progress'
    if (status === 'completed') return 'Completed'
    return 'Upcoming'
  }

  const normalizeCohort = (cohort: Cohort): Cohort => {
    return {
      ...cohort,
      delivery: cohort.deliveryMode,
      isFree: parseBoolean(cohort.isFree),
      statusLabel: statusLabel((cohort.status ?? 'upcoming') as CohortStatus),
    }
  }

  // Field validation functions
  const validateField = (fieldName: string): string => {
    switch (fieldName) {
      case 'title':
        return form.value.title.trim() ? '' : 'Cohort title is required'
      case 'startDate':
        return form.value.startDate ? '' : 'Start date is required'
      case 'endDate':
        if (!form.value.endDate) return 'End date is required'
        if (form.value.startDate && new Date(form.value.endDate) <= new Date(form.value.startDate))
          return 'End date must be after start date'
        return ''
      case 'whatYouWillLearn':
        return form.value.whatYouWillLearn.trim() ? '' : 'Learning points are required'
      case 'image':
        if (editingCohortId.value) return ''
        return form.value.image instanceof File ? '' : 'Cover image is required'
      case 'zoomLink':
        if (!form.value.zoomLink) return ''
        return isValidZoomLink(form.value.zoomLink)
          ? ''
          : 'Invalid Zoom link (use zoom.us or zoom.com URL)'
      case 'cost':
        if (form.value.isFree) return ''
        if (form.value.cost === undefined || form.value.cost === null)
          return 'Cost is required for paid cohorts'
        if (form.value.cost <= 0) return 'Cost must be greater than 0'
        return ''
      case 'trialType':
        if (form.value.isFree) return ''
        return form.value.trialType ? '' : 'Trial type is required for paid cohorts'
      case 'trialValue':
        if (form.value.isFree) return ''
        if (!form.value.trialValue) return 'Trial value is required for paid cohorts'
        if (form.value.trialValue <= 0) return 'Trial value must be greater than 0'
        return ''
      default:
        return ''
    }
  }

  const validateAllFields = () => {
    const errors: Record<string, string> = {}
    const fields = [
      'title',
      'startDate',
      'endDate',
      'whatYouWillLearn',
      'image',
      'zoomLink',
      'cost',
      'trialType',
      'trialValue',
    ]

    fields.forEach((field) => {
      const error = validateField(field)
      if (error) errors[field] = error
    })

    fieldErrors.value = errors
    return Object.keys(errors).length === 0
  }

  const clearFieldError = (fieldName: string) => {
    if (fieldErrors.value[fieldName]) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { [fieldName]: _, ...rest } = fieldErrors.value
      fieldErrors.value = rest
    }
  }

  // Validation
  const isFormValid = computed(() => {
    const hasBasics = Boolean(
      form.value.title.trim() &&
      form.value.startDate &&
      form.value.endDate &&
      form.value.whatYouWillLearn.trim(),
    )

    const hasValidDateOrder =
      form.value.startDate && form.value.endDate
        ? new Date(form.value.endDate) > new Date(form.value.startDate)
        : false

    const hasImage = editingCohortId.value ? true : form.value.image instanceof File
    const hasValidZoom = isValidZoomLink(form.value.zoomLink)

    // Validate paid cohort requirements
    const paidCohortValid = form.value.isFree
      ? true
      : form.value.cost !== undefined &&
      form.value.cost > 0 &&
      form.value.trialType !== undefined &&
      form.value.trialValue !== undefined &&
      form.value.trialValue > 0

    return hasBasics && hasValidDateOrder && hasImage && hasValidZoom && paidCohortValid
  })

  const validationMessage = computed(() => {
    if (!form.value.title.trim()) return 'Title is required'
    if (!form.value.startDate) return 'Start date is required'
    if (!form.value.endDate) return 'End date is required'
    if (!form.value.whatYouWillLearn.trim()) return 'Learning points are required'
    if (
      form.value.startDate &&
      form.value.endDate &&
      new Date(form.value.endDate) <= new Date(form.value.startDate)
    ) {
      return 'End date must be after start date'
    }
    if (!editingCohortId.value && !(form.value.image instanceof File))
      return 'Cover image is required'
    if (form.value.zoomLink && !isValidZoomLink(form.value.zoomLink))
      return 'Invalid Zoom link. Use a valid zoom.us or zoom.com URL'

    // Validate paid cohort requirements
    if (!form.value.isFree) {
      if (form.value.cost === undefined || form.value.cost === null || form.value.cost <= 0)
        return 'Cost is required for paid cohorts'
      if (!form.value.trialType) return 'Trial type is required for paid cohorts'
      if (!form.value.trialValue || form.value.trialValue <= 0)
        return 'Trial value is required for paid cohorts'
    }

    return ''
  })

  // Form operations
  const buildFormData = (programId: number, courseId: number, courseName: string) => {
    const payload = new FormData()
    payload.append('course_id', courseId.toString())
    payload.append('course_name', courseName)
    payload.append('program_id', programId.toString())
    payload.append('title', form.value.title)
    if (form.value.code) payload.append('code', form.value.code)
    payload.append('start_date', form.value.startDate)
    payload.append('end_date', form.value.endDate)
    payload.append('status', form.value.status)
    if (form.value.description) payload.append('description', form.value.description)
    if (form.value.whatYouWillLearn) payload.append('benefits', form.value.whatYouWillLearn)
    if (form.value.capacity) payload.append('capacity', String(form.value.capacity))
    payload.append('delivery_mode', form.value.delivery.toLowerCase())
    if (form.value.zoomLink) payload.append('zoom_link', form.value.zoomLink)
    payload.append('is_free', form.value.isFree ? '1' : '0')

    if (form.value.isFree === false) {
      if (form.value.trialType != null) {
        payload.append('trial_type', form.value.trialType)
      }

      if (form.value.trialValue != null) {
        payload.append('trial_value', String(form.value.trialValue))
      }

      if (form.value.cost != null) {
        payload.append('cost', String(form.value.cost))
      }
    }

    if (form.value.image instanceof File) {
      payload.append('image', form.value.image)
      // If editing and had an old image, include it for backend deletion
      if (editingCohortId.value && originalImageUrl.value) {
        payload.append('old_image_url', originalImageUrl.value)
      }
    }

    // Debug: Log all FormData entries
    console.log('FormData being sent:', {
      is_free: form.value.isFree,
      cost: form.value.cost,
      trialType: form.value.trialType,
      trialValue: form.value.trialValue,
      formDataEntries: Array.from(payload.entries()),
    })

    return payload
  }

  const resetForm = () => {
    form.value = {
      title: '',
      code: '',
      status: 'upcoming',
      startDate: '',
      endDate: '',
      capacity: 40,
      description: '',
      whatYouWillLearn: '',
      delivery: 'virtual',
      image: '',
      zoomLink: '',
      isFree: true,
      cost: undefined,
      trialType: undefined,
      trialValue: undefined,
    }
    originalImageUrl.value = ''
    editingCohortId.value = null
    fieldErrors.value = {}
  }

  const startEditCohort = (cohort: Cohort) => {
    editingCohortId.value = cohort.id
    const normalized = normalizeCohort(cohort)
    originalImageUrl.value = normalized.imageUrl || ''

    form.value = {
      title: normalized.title,
      code: cohort.code || '',
      status: (cohort.status ?? 'upcoming') as CohortStatus,
      startDate: cohort.startDate || '',
      endDate: cohort.endDate || '',
      capacity: cohort.capacity ?? 40,
      description: cohort.description || '',
      whatYouWillLearn: cohort.benefits || '',
      delivery: (normalized.delivery || 'virtual').toLowerCase(),
      image: normalized.imageUrl || '',
      zoomLink: cohort.zoomLink || '',
      isFree: Boolean(normalized.isFree),
      cost: normalized.cost,
      trialType: cohort.trialType,
      trialValue: cohort.trialValue,
    }
  }

  // API operations
  const fetchCohorts = async (programId: number, courseId: number) => {
    if (!programId || !courseId) {
      toast.error('Missing program or course id')
      return
    }
    isLoading.value = true
    try {
      const response = await programService.get<Cohort[]>(
        `${programId}/courses/${courseId}/cohorts`,
      )
      console.log('Fetched cohorts response:', response)
      const data = Array.isArray(response.data) ? response.data.map(normalizeCohort) : []
      cohorts.value = data
    } catch (error: unknown) {
      console.error('Failed to fetch cohorts', error)
      const message = error instanceof Error ? error.message : 'Failed to load cohorts'
      toast.error(message)
    } finally {
      isLoading.value = false
    }
  }

  const saveCohort = async (programId: number, courseId: number, courseName: string) => {
    if (isSubmitting.value) return

    const isValid = validateAllFields()
    if (!isValid) {
      toast.error(validationMessage.value || 'Please fix the errors before submitting')
      return false
    }

    if (!isFormValid.value) {
      toast.error(validationMessage.value || 'Please fill all required fields')
      return false
    }

    if (!programId || !courseId) {
      toast.error('Missing program or course id')
      return
    }

    isSubmitting.value = true
    try {
      const payload = buildFormData(programId, courseId, courseName)
      const path = editingCohortId.value
        ? `courses/cohorts/${editingCohortId.value}`
        : `courses/cohorts`

      await programService.post(path, payload as unknown as Record<string, unknown>)
      toast.success(
        editingCohortId.value ? 'Cohort updated successfully' : 'Cohort created successfully',
      )
      await fetchCohorts(programId, courseId)
      return true
    } catch (error: unknown) {
      console.error('Failed to save cohort', error)
      const message = error instanceof Error ? error.message : 'Failed to save cohort'
      toast.error(message)
      return false
    } finally {
      isSubmitting.value = false
    }
  }

  const deleteCohort = async (programId: number, courseId: number, cohortId: number) => {
    if (!programId || !courseId || !cohortId) {
      toast.error('Missing required parameters')
      return false
    }

    try {
      await programService.delete(`${programId}/courses/${courseId}/cohorts/${cohortId}`)
      toast.success('Cohort deleted successfully')
      await fetchCohorts(programId, courseId)
      return true
    } catch (error: unknown) {
      console.error('Failed to delete cohort', error)
      const message = error instanceof Error ? error.message : 'Failed to delete cohort'
      toast.error(message)
      return false
    }
  }

  const updateCohortStatus = async (
    programId: number,
    courseId: number,
    cohortId: number,
    status: CohortStatus,
  ) => {
    if (!programId || !courseId || !cohortId) {
      toast.error('Missing required parameters')
      return false
    }

    try {
      const response = await programService.put(
        `courses/cohorts/${cohortId}/status`,
        { status },
      )
      if (response.success) {
        toast.success('Status updated successfully')
        await fetchCohorts(programId, courseId)

        return true
      } else {
        toast.error('Failed to update status')
        return false
      }
    } catch (error: unknown) {
      console.error('Failed to update status', error)
      const message = error instanceof Error ? error.message : 'Failed to update status'
      toast.error(message)
      return false
    }
  }

  return {
    // State
    cohorts,
    isLoading,
    isSubmitting,
    editingCohortId,
    originalImageUrl,
    form,
    fieldErrors,

    // Computed
    isFormValid,
    validationMessage,

    // Methods
    fetchCohorts,
    saveCohort,
    deleteCohort,
    updateCohortStatus,
    resetForm,
    startEditCohort,
    validateField,
    clearFieldError,
  }
}
