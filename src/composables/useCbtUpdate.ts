import { cbtUpdateService } from '@/api/services/serviceFactory'
import { useAuthStore } from '@/stores/auth'

export interface CbtUpdatePayload {
  title: string
  email_body: string
  notification_body: string
  send_push: 0 | 1
  send_email: 0 | 1
  tagline?: string
  tag: string
  status: 'draft' | 'published'
  schedule_time?: string
}

export interface CbtUpdateHistoryItem {
  id: number
  title: string
  tag: string | null
  email_body: string | null
  notification_body: string | null
  status: 'draft' | 'published'
  send_email: 0 | 1
  send_push: 0 | 1
  schedule_time: string | null
  notified_at: string | null
  created_at: string
}

export const useCbtUpdate = () => {
  const authStore = useAuthStore()

  const buildFormData = (payload: CbtUpdatePayload) => {
    const formData = new FormData()

    const authorName = [authStore.user?.firstName, authStore.user?.lastName]
      .filter(Boolean)
      .join(' ')

    formData.append('title', payload.title)
    formData.append('email_body', payload.email_body)
    formData.append('notification_body', payload.notification_body)
    formData.append('send_push', payload.send_push.toString())
    formData.append('send_email', payload.send_email.toString())
    formData.append('author_id', (authStore.user?.id ?? '').toString())
    formData.append('author_name', authorName)
    formData.append('tagline', payload.tagline ?? '')
    formData.append('tag', payload.tag)
    formData.append('status', payload.status)

    if (payload.schedule_time) {
      formData.append('schedule_time', payload.schedule_time)
    }

    return formData
  }

  const fetchUpdateHistory = async () => {
    try {
      const response = await cbtUpdateService.get('all')
      return response
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } }
      throw {
        success: false,
        message: err.response?.data?.message || 'Failed to fetch CBT update history',
        error,
      }
    }
  }

  const createUpdate = async (payload: CbtUpdatePayload) => {
    try {
      const formData = buildFormData(payload)

      const response = await cbtUpdateService.post(undefined, formData as unknown as Record<string, unknown>)
      return response
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } }
      throw {
        success: false,
        message: err.response?.data?.message || 'Failed to create CBT update',
        error,
      }
    }
  }

  const updateUpdate = async (id: number, payload: CbtUpdatePayload) => {
    try {
      const formData = buildFormData(payload)
      const response = await cbtUpdateService.put(id.toString(), formData as unknown as Record<string, unknown>)
      return response
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } }
      throw {
        success: false,
        message: err.response?.data?.message || 'Failed to update CBT update',
        error,
      }
    }
  }

  const publishUpdate = async (id: number, status: CbtUpdatePayload['status']) => {
    try {
      const response = await cbtUpdateService.put(`${id}/status`, {
        status,
      })
      return response
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } }
      throw {
        success: false,
        message: err.response?.data?.message || 'Failed to update CBT update status',
        error,
      }
    }
  }

  return { createUpdate, updateUpdate, fetchUpdateHistory, publishUpdate }
}
