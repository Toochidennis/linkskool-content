import { faqsService } from '@/api/services/serviceFactory'
import type { Faq, CreateFaqPayload } from '@/api/models'

type PersistedUser = {
  id?: number | string
  username?: string
  firstName?: string
  lastName?: string
}

const getPersistedAuthor = () => {
  const rawUser = localStorage.getItem('user')

  if (!rawUser) {
    throw {
      success: false,
      message: 'User data not found. Please login again.',
    }
  }

  let user: PersistedUser

  try {
    user = JSON.parse(rawUser) as PersistedUser
  } catch {
    throw {
      success: false,
      message: 'Invalid user data. Please login again.',
    }
  }

  const authorId = Number(user.id ?? 0)
  const authorName =
    user.username?.trim() || `${user.firstName || ''} ${user.lastName || ''}`.trim()

  if (!authorName || !Number.isFinite(authorId) || authorId <= 0) {
    throw {
      success: false,
      message: 'Invalid user data. Please login again.',
    }
  }

  return { authorId, authorName }
}

const normalizeFaq = (faq: Faq): Faq => ({
  ...faq,
  authorId: faq.authorId ?? faq.author_id,
  authorName: faq.authorName ?? faq.author_name,
})

export const useFaqs = () => {
  const fetchFaqs = async () => {
    try {
      const response = await faqsService.get<Faq[]>()
      return Array.isArray(response.data) ? response.data.map(normalizeFaq) : []
    } catch (error: any) {
      throw {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to fetch FAQs',
        error,
      }
    }
  }

  const createFaq = async (payload: CreateFaqPayload) => {
    try {
      const { authorId, authorName } = getPersistedAuthor()
      const response = await faqsService.post(undefined, {
        question: payload.question,
        answer: payload.answer,
        authorName,
        authorId,
      })

      return response
    } catch (error: any) {
      throw {
        success: false,
        message: error.message || error.response?.data?.message || 'Failed to create FAQ',
        error,
      }
    }
  }

  const updateFaq = async (id: number, payload: CreateFaqPayload) => {
    try {
      const { authorId, authorName } = getPersistedAuthor()
      const response = await faqsService.put(id.toString(), {
        question: payload.question,
        answer: payload.answer,
        authorName,
        authorId,
      })

      return response
    } catch (error: any) {
      throw {
        success: false,
        message: error.message || error.response?.data?.message || 'Failed to update FAQ',
        error,
      }
    }
  }

  const deleteFaq = async (id: number) => {
    try {
      return await faqsService.delete(id.toString())
    } catch (error: any) {
      throw {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to delete FAQ',
        error,
      }
    }
  }

  return {
    fetchFaqs,
    createFaq,
    updateFaq,
    deleteFaq,
  }
}
