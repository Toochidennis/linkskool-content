<template>
  <div class="faqs-page">
    <div class="page-header">
      <div>
        <h1 class="title">FAQs</h1>
        <p class="subtitle">Create and manage frequently asked questions for your users.</p>
      </div>
    </div>

    <section class="composer-card">
      <h2 class="section-title">{{ editingFaqId ? 'Edit FAQ' : 'Add FAQ' }}</h2>
      <div class="field">
        <label>Question</label>
        <input v-model="form.question" type="text" placeholder="e.g. How do I reset my password?" />
      </div>
      <div class="field">
        <label>Answer</label>
        <RichTextEditor
          v-model="form.answer"
          placeholder="Write a clear and concise answer users can follow."
        />
      </div>
      <div class="actions">
        <button class="btn ghost" @click="resetForm">Clear</button>
        <button class="btn primary" :disabled="!canSave || isSubmitting" @click="saveFaq">
          {{ isSubmitting ? 'Saving...' : editingFaqId ? 'Update FAQ' : 'Save FAQ' }}
        </button>
      </div>
    </section>

    <section class="list-card">
      <div class="list-header">
        <h2 class="section-title">FAQ List</h2>
        <span class="count">{{ faqs.length }}</span>
      </div>

      <div v-if="isLoading" class="empty-state">
        <p>Loading FAQs...</p>
      </div>

      <div v-else-if="faqs.length" class="faq-list">
        <article v-for="item in faqs" :key="item.id" class="faq-item">
          <div class="faq-content">
            <h3 class="faq-question">{{ item.question }}</h3>
            <p class="faq-answer">{{ item.answer }}</p>
          </div>
          <div class="faq-actions">
            <button class="edit-btn" @click="startEdit(item)">Edit</button>
            <button class="delete-btn" :disabled="deletingFaqId === item.id" @click="removeFaq(item.id)">
              {{ deletingFaqId === item.id ? 'Deleting...' : 'Delete' }}
            </button>
          </div>
        </article>
      </div>

      <div v-else class="empty-state">
        <p>No FAQs yet. Add your first question above.</p>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useToast } from 'vue-toast-notification'
import { useFaqs } from '@/composables/useFaqs'
import type { Faq } from '@/api/models'
import RichTextEditor from '@/components/RichTextEditor.vue'

const toast = useToast()
const { fetchFaqs, createFaq, updateFaq, deleteFaq } = useFaqs()

const form = ref({
  question: '',
  answer: '',
})

const faqs = ref<Faq[]>([])
const isLoading = ref(false)
const isSubmitting = ref(false)
const deletingFaqId = ref<number | null>(null)
const editingFaqId = ref<number | null>(null)

const stripHtml = (value: string) => {
  const text = value
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  return text
}

const canSave = computed(
  () => form.value.question.trim() !== '' && stripHtml(form.value.answer) !== '',
)

const resetForm = () => {
  form.value.question = ''
  form.value.answer = ''
  editingFaqId.value = null
}

const loadFaqs = async () => {
  isLoading.value = true
  try {
    faqs.value = await fetchFaqs()
  } catch (error: any) {
    toast.error(error.message || 'Failed to load FAQs')
  } finally {
    isLoading.value = false
  }
}

const saveFaq = async () => {
  if (!canSave.value) {
    toast.error('Question and answer are required')
    return
  }

  if (isSubmitting.value) return

  isSubmitting.value = true

  try {
    const payload = {
      question: form.value.question.trim(),
      answer: form.value.answer.trim(),
    }

    if (editingFaqId.value) {
      await updateFaq(editingFaqId.value, payload)
      toast.success('FAQ updated')
    } else {
      await createFaq(payload)
      toast.success('FAQ saved')
    }

    await loadFaqs()
    resetForm()
  } catch (error: any) {
    toast.error(error.message || 'Failed to save FAQ')
  } finally {
    isSubmitting.value = false
  }
}

const startEdit = (item: Faq) => {
  editingFaqId.value = item.id
  form.value.question = item.question
  form.value.answer = item.answer
}

const removeFaq = async (id: number) => {
  if (deletingFaqId.value === id) return

  deletingFaqId.value = id

  try {
    await deleteFaq(id)
    faqs.value = faqs.value.filter((item) => item.id !== id)
    if (editingFaqId.value === id) {
      resetForm()
    }
    toast.success('FAQ removed')
  } catch (error: any) {
    toast.error(error.message || 'Failed to remove FAQ')
  } finally {
    deletingFaqId.value = null
  }
}

onMounted(() => {
  loadFaqs()
})
</script>

<style scoped>
.faqs-page {
  padding: 1.5rem;
  display: grid;
  gap: 1rem;
}

.page-header .title {
  margin: 0;
  font-size: 1.75rem;
  font-weight: 800;
  color: #0f172a;
}

.page-header .subtitle {
  margin: 0.35rem 0 0;
  color: #64748b;
}

.composer-card,
.list-card {
  background: var(--theme-surface);
  border: 1px solid var(--theme-border);
  border-radius: 14px;
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.06);
  padding: 1rem;
}

.section-title {
  margin: 0 0 0.9rem;
  font-size: 1rem;
  font-weight: 800;
  color: #0f172a;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  margin-bottom: 0.85rem;
}

.field label {
  font-size: 0.83rem;
  font-weight: 700;
  color: #475569;
}

.field input,
.field textarea {
  width: 100%;
  border: 1px solid var(--theme-border);
  background: var(--theme-bg);
  border-radius: 10px;
  padding: 0.7rem 0.8rem;
  font-size: 0.9rem;
}

.actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.6rem;
}

.btn {
  border: none;
  border-radius: 9px;
  padding: 0.6rem 0.95rem;
  font-weight: 700;
  cursor: pointer;
}

.btn.primary {
  background: linear-gradient(135deg, #4f46e5, #4338ca);
  color: #fff;
}

.btn.ghost {
  background: #e2e8f0;
  color: #334155;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.list-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.6rem;
}

.count {
  min-width: 1.5rem;
  height: 1.5rem;
  border-radius: 999px;
  background: #e0e7ff;
  color: #3730a3;
  font-size: 0.75rem;
  font-weight: 800;
  display: grid;
  place-items: center;
}

.faq-list {
  display: grid;
  gap: 0.75rem;
}

.faq-item {
  border: 1px solid var(--theme-border);
  border-radius: 12px;
  padding: 0.8rem;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.9rem;
}

.faq-actions {
  display: flex;
  gap: 0.5rem;
  flex-shrink: 0;
}

.faq-question {
  margin: 0;
  font-size: 0.95rem;
  font-weight: 800;
  color: #0f172a;
}

.faq-answer {
  margin: 0.35rem 0 0;
  color: #475569;
  line-height: 1.5;
}

.delete-btn {
  border: 1px solid #fecaca;
  background: #fef2f2;
  color: #b91c1c;
  border-radius: 8px;
  padding: 0.4rem 0.55rem;
  font-weight: 700;
  cursor: pointer;
}

.edit-btn {
  border: 1px solid #c7d2fe;
  background: #eef2ff;
  color: #3730a3;
  border-radius: 8px;
  padding: 0.4rem 0.55rem;
  font-weight: 700;
  cursor: pointer;
}

.empty-state {
  border: 1px dashed #cbd5e1;
  border-radius: 12px;
  background: #f8fafc;
  padding: 1.1rem;
  text-align: center;
  color: #64748b;
}
</style>
