import { computed, ref } from 'vue'
import { useToast } from 'vue-toast-notification'
import { programService } from '@/api/services/serviceFactory'

export type CohortStatus = 'upcoming' | 'ongoing' | 'completed'

export type Cohort = {
  id: number
  title: string
  code?: string
  imageUrl?: string
  videoUrl?: string
  startDate: string
  endDate: string
  enrollmentDeadline?: string
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
  whatsappGroupLink?: string
  instructorName?: string
  learningType?: 'self_paced' | 'instructor_led'
  isFree?: boolean | number | string
  trialType?: 'views' | 'days'
  trialValue?: number
  cost?: number
  discount?: number
  nextCohort?: LinkableCohortOption | null
}

export type LinkableCohortOption = {
  id: number
  title: string
  description: string
  startDate: string
  endDate: string
}

export type CohortForm = {
  title: string
  code: string
  status: CohortStatus
  startDate: string
  endDate: string
  enrollmentDeadline: string
  capacity: number
  description: string
  whatYouWillLearn: string
  delivery: string
  learningType: 'self_paced' | 'instructor_led'
  instructorName: string
  videoUrl: string
  image: string | File
  zoomLink: string
  whatsappGroupLink: string
  isFree: boolean
  cost?: number
  discount?: number
  trialType?: 'views' | 'days'
  trialValue?: number
  nextCohortId: number
}

export function useCohorts() {
  const toast = useToast()

  const cohorts = ref<Cohort[]>([])
  const isLoading = ref(false)
  const isSubmitting = ref(false)
  const linkableCohorts = ref<LinkableCohortOption[]>([])
  const editingCohortId = ref<number | null>(null)
  const originalImageUrl = ref<string>('')
  const fieldErrors = ref<Record<string, string>>({})

  const form = ref<CohortForm>({
    title: '',
    code: '',
    status: 'upcoming',
    startDate: '',
    endDate: '',
    enrollmentDeadline: '',
    capacity: 40,
    description: '',
    whatYouWillLearn: '',
    delivery: 'virtual',
    learningType: 'instructor_led',
    instructorName: '',
    videoUrl: '',
    image: '',
    zoomLink: '',
    whatsappGroupLink: '',
    isFree: true,
    cost: undefined,
    discount: undefined,
    trialType: undefined,
    trialValue: undefined,
    nextCohortId: 0,
  })

  // Helper functions
  const parseBoolean = (value: unknown) =>
    value === true || value === 1 || value === '1' || value === 'true'

  const parseNumber = (value: unknown): number | undefined => {
    if (value === undefined || value === null || value === '') return undefined
    const numeric = Number(value)
    return Number.isFinite(numeric) ? numeric : undefined
  }

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

  const toDateTimeLocalValue = (value?: string) => {
    if (!value) return ''

    const parsed = new Date(value)
    if (Number.isNaN(parsed.getTime())) {
      return value.slice(0, 16)
    }

    const pad = (part: number) => String(part).padStart(2, '0')
    const year = parsed.getFullYear()
    const month = pad(parsed.getMonth() + 1)
    const day = pad(parsed.getDate())
    const hours = pad(parsed.getHours())
    const minutes = pad(parsed.getMinutes())

    return `${year}-${month}-${day}T${hours}:${minutes}`
  }

  const toServerDatetime = (value?: string) => {
    if (!value) return ''

    const parsed = new Date(value)
    if (Number.isNaN(parsed.getTime())) {
      return value
    }

    const pad = (part: number) => String(part).padStart(2, '0')
    const year = parsed.getFullYear()
    const month = pad(parsed.getMonth() + 1)
    const day = pad(parsed.getDate())
    const hours = pad(parsed.getHours())
    const minutes = pad(parsed.getMinutes())
    const seconds = pad(parsed.getSeconds())

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
  }

  const normalizeCohort = (cohort: Cohort): Cohort => {
    const cohortWithAliases = cohort as Cohort & {
      whatsapp_group_link?: string
    }

    return {
      ...cohort,
      delivery: cohort.deliveryMode,
      enrollmentDeadline: cohort.enrollmentDeadline,
      whatsappGroupLink: cohort.whatsappGroupLink ?? cohortWithAliases.whatsapp_group_link ?? '',
      isFree: parseBoolean(cohort.isFree),
      cost: parseNumber(cohort.cost),
      discount: parseNumber(cohort.discount),
      trialValue: parseNumber(cohort.trialValue),
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
        return hasAtLeastOneMedia() ? '' : 'Provide at least a video URL or cover image'
      case 'zoomLink':
        if (!form.value.zoomLink) return ''
        return isValidZoomLink(form.value.zoomLink)
          ? ''
          : 'Invalid Zoom link (use zoom.us or zoom.com URL)'
      case 'videoUrl':
        if (!form.value.videoUrl) return ''
        try {
          new URL(form.value.videoUrl)
          return ''
        } catch {
          return 'Video URL must be a valid URL'
        }
      case 'cost':
        if (form.value.isFree) return ''
        if (form.value.cost === undefined || form.value.cost === null)
          return 'Cost is required for paid cohorts'
        if (form.value.cost <= 0) return 'Cost must be greater than 0'
        return ''
      case 'discount':
        if (form.value.isFree) return ''
        if (form.value.discount === undefined || form.value.discount === null || form.value.discount === 0) return ''
        if (form.value.discount < 0) return 'Discount cannot be negative'
        if (form.value.discount > 100) return 'Discount cannot exceed 100%'
        return ''
      case 'trialType':
        if (form.value.isFree) return ''
        if (form.value.trialType === undefined && form.value.trialValue == null) return ''
        if (form.value.trialValue != null && form.value.trialType === undefined)
          return 'Select a trial type when providing trial value'
        return ''
      case 'trialValue':
        if (form.value.isFree) return ''
        if (form.value.trialType === undefined && form.value.trialValue == null) return ''
        if (form.value.trialType !== undefined && form.value.trialValue == null)
          return 'Trial value is required when trial type is selected'
        if (form.value.trialType === undefined && form.value.trialValue != null)
          return 'Select a trial type when providing trial value'
        if ((form.value.trialValue ?? 0) < 0) return 'Trial value cannot be negative'
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
      'videoUrl',
      'zoomLink',
      'cost',
      'discount',
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

  const hasAtLeastOneMedia = () => {
    const hasVideo = Boolean(form.value.videoUrl?.trim())
    const hasImage =
      form.value.image instanceof File ||
      (typeof form.value.image === 'string' && form.value.image.trim() !== '')
    return hasVideo || hasImage
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

    const hasMedia = hasAtLeastOneMedia()
    const hasValidZoom = isValidZoomLink(form.value.zoomLink)
    const hasValidVideoUrl = (() => {
      if (!form.value.videoUrl) return true
      try {
        new URL(form.value.videoUrl)
        return true
      } catch {
        return false
      }
    })()

    // Validate paid cohort requirements
    const paidCohortValid = form.value.isFree
      ? true
      : (() => {
        const hasTrialType = form.value.trialType !== undefined
        const hasTrialValue = form.value.trialValue !== undefined && form.value.trialValue !== null
        const trialValid =
          (!hasTrialType && !hasTrialValue) ||
          (hasTrialType && hasTrialValue && (form.value.trialValue ?? 0) >= 0)

        return (
          form.value.cost !== undefined &&
          form.value.cost > 0 &&
          (form.value.discount === undefined ||
            form.value.discount === null ||
            (form.value.discount >= 0 && form.value.discount <= 100)) &&
          trialValid
        )
      })()

    return hasBasics && hasValidDateOrder && hasMedia && hasValidZoom && hasValidVideoUrl && paidCohortValid
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
    if (!hasAtLeastOneMedia()) return 'Provide at least a video URL or cover image'
    if (form.value.videoUrl) {
      try {
        new URL(form.value.videoUrl)
      } catch {
        return 'Video URL must be a valid URL'
      }
    }
    if (form.value.zoomLink && !isValidZoomLink(form.value.zoomLink))
      return 'Invalid Zoom link. Use a valid zoom.us or zoom.com URL'

    // Validate paid cohort requirements
    if (!form.value.isFree) {
      if (form.value.cost === undefined || form.value.cost === null || form.value.cost <= 0)
        return 'Cost is required for paid cohorts'
      if (form.value.discount !== undefined && form.value.discount !== null) {
        if (form.value.discount < 0) return 'Discount cannot be negative'
        if (form.value.discount > 100) return 'Discount cannot exceed 100%'
      }
      const hasTrialType = form.value.trialType !== undefined
      const hasTrialValue = form.value.trialValue !== undefined && form.value.trialValue !== null
      if (hasTrialType && !hasTrialValue) return 'Trial value is required when trial type is selected'
      if (!hasTrialType && hasTrialValue) return 'Select a trial type when providing trial value'
      if (hasTrialValue && (form.value.trialValue ?? 0) < 0) return 'Trial value cannot be negative'
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
    payload.append('start_date', toServerDatetime(form.value.startDate))
    payload.append('end_date', toServerDatetime(form.value.endDate))
    if (form.value.enrollmentDeadline) {
      payload.append('enrollment_deadline', toServerDatetime(form.value.enrollmentDeadline))
    }
    payload.append('status', form.value.status)
    if (form.value.description) payload.append('description', form.value.description)
    if (form.value.whatYouWillLearn) payload.append('benefits', form.value.whatYouWillLearn)
    if (form.value.capacity) payload.append('capacity', String(form.value.capacity))
    payload.append('delivery_mode', form.value.delivery.toLowerCase())
    payload.append('learning_type', form.value.learningType)
    if (form.value.instructorName) payload.append('instructor_name', form.value.instructorName)
    if (form.value.videoUrl) payload.append('video_url', form.value.videoUrl)
    if (form.value.zoomLink) payload.append('zoom_link', form.value.zoomLink)
    if (form.value.whatsappGroupLink) {
      payload.append('whatsapp_group_link', form.value.whatsappGroupLink)
    }
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

      if (form.value.discount != null) {
        payload.append('discount', String(form.value.discount))
      }
    }

    if (form.value.image instanceof File) {
      payload.append('image', form.value.image)
      // If editing and had an old image, include it for backend deletion
      if (editingCohortId.value && originalImageUrl.value) {
        payload.append('old_image_url', originalImageUrl.value)
      }
    }

    if (form.value.nextCohortId > 0) {
      const selected = linkableCohorts.value.find((cohort) => cohort.id === form.value.nextCohortId)
      if (selected) {
        payload.append('next_cohort[id]', String(selected.id))
        payload.append('next_cohort[title]', selected.title)
        payload.append('next_cohort[description]', selected.description)
        payload.append('next_cohort[start_date]', selected.startDate)
        payload.append('next_cohort[end_date]', selected.endDate)
      }
    }

    return payload
  }

  const resetForm = () => {
    form.value = {
      title: '',
      code: '',
      status: 'upcoming',
      startDate: '',
      endDate: '',
      enrollmentDeadline: '',
      capacity: 40,
      description: '',
      whatYouWillLearn: '',
      delivery: 'virtual',
      learningType: 'instructor_led',
      instructorName: '',
      videoUrl: '',
      image: '',
      zoomLink: '',
      whatsappGroupLink: '',
      isFree: true,
      cost: undefined,
      discount: undefined,
      trialType: undefined,
      trialValue: undefined,
      nextCohortId: 0,
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
      startDate: toDateTimeLocalValue(cohort.startDate),
      endDate: toDateTimeLocalValue(cohort.endDate),
      enrollmentDeadline: toDateTimeLocalValue(cohort.enrollmentDeadline),
      capacity: cohort.capacity ?? 40,
      description: cohort.description || '',
      whatYouWillLearn: cohort.benefits || '',
      delivery: (normalized.delivery || 'virtual').toLowerCase(),
      learningType: (cohort.learningType || 'instructor_led') as
        | 'self_paced'
        | 'instructor_led',
      instructorName: cohort.instructorName || '',
      videoUrl: cohort.videoUrl || '',
      image: normalized.imageUrl || '',
      zoomLink: cohort.zoomLink || '',
      whatsappGroupLink: normalized.whatsappGroupLink || '',
      isFree: Boolean(normalized.isFree),
      cost: normalized.cost,
      discount: normalized.discount,
      trialType: cohort.trialType,
      trialValue: normalized.trialValue,
      nextCohortId: cohort.nextCohort?.id ||  0,
    }
  }

  const fetchLinkableCohorts = async (programId: number, cohortId?: number) => {
    if (!programId) {
      toast.error('Missing program id')
      return
    }

    try {
      const params = cohortId ? { cohort_id: cohortId } : undefined
      const response = await programService.get<LinkableCohortOption[]>(
        `${programId}/cohorts`,
        params,
      )
      const rows = Array.isArray(response.data) ? response.data : []
      linkableCohorts.value = rows.map((row) => ({
        id: Number(row.id),
        title: String(row.title),
        description: String(row.description),
        startDate: String(row.startDate),
        endDate: String(row.endDate),
      }))
    } catch (error: unknown) {
      console.error('Failed to fetch linkable cohorts', error)
      const message = error instanceof Error ? error.message : 'Failed to load cohorts for linking'
      toast.error(message)
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
      console.log('Raw cohorts response:', response)

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
      const firstFieldError = Object.values(fieldErrors.value)[0]
      toast.error(firstFieldError || validationMessage.value || 'Please fix the errors before submitting')
      return false
    }

    if (!isFormValid.value) {
      const firstFieldError = Object.values(fieldErrors.value)[0]
      toast.error(firstFieldError || validationMessage.value || 'Please fill all required fields')
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

      if (editingCohortId.value) {
        console.log('[Cohort Update] FormData payload:')
        for (const [key, value] of payload.entries()) {
          if (value instanceof File) {
            console.log(`${key}: [File name=${value.name}, type=${value.type}, size=${value.size}]`)
          } else {
            console.log(`${key}:`, value)
          }
        }
      }

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
    linkableCohorts,
    editingCohortId,
    originalImageUrl,
    form,
    fieldErrors,

    // Computed
    isFormValid,
    validationMessage,

    // Methods
    fetchCohorts,
    fetchLinkableCohorts,
    saveCohort,
    deleteCohort,
    updateCohortStatus,
    resetForm,
    startEditCohort,
    validateField,
    clearFieldError,
  }
}
