<template>
  <div class="notifications-page">
    <div class="page-header">
      <div>
        <h1>CBT Updates</h1>
        <p>Create and send CBT-specific email and in-app updates from one shared composer.</p>
      </div>
    </div>

    <div class="layout-grid">
      <section class="composer-card">
        <div class="card-header">
          <h2>CBT Update Composer</h2>
          <span class="draft-indicator">{{ isDraft ? 'Draft' : 'Ready to send' }}</span>
        </div>

        <div class="section">
          <h3>Channel Selection</h3>
          <div class="channel-grid">
            <label class="channel-item">
              <input v-model="channels.email" type="checkbox" />
              <span>Email</span>
            </label>
            <label class="channel-item">
              <input v-model="channels.notification" type="checkbox" />
              <span>In-app Notification</span>
            </label>
          </div>
        </div>

        <div class="section">
          <h3>Shared Content</h3>
          <div class="field-grid">
            <div class="field span-2">
              <label>Title</label>
              <input v-model="form.title" type="text" placeholder="Mock exam schedule update" />
            </div>
            <div class="field span-2">
              <label>Body</label>
              <div class="editor-wrap">
                <RichTextEditor v-model="form.body" placeholder="Compose the CBT update once for every channel..." />
              </div>
            </div>
          </div>
        </div>

        <div v-if="channels.email" class="section">
          <h3>Email Delivery</h3>
          <div class="field-grid">
            <div class="field span-2">
              <label>Email Subject <span class="optional-copy">Optional</span></label>
              <input v-model="form.emailSubject" type="text" placeholder="Defaults to the shared title above" />
            </div>
            <div class="field span-2">
              <label>Email Attachment <span class="optional-copy">Optional</span></label>
              <input type="file" @change="handleEmailAttachmentUpload" />
              <div v-if="form.emailAttachmentName" class="attachment-row">
                <span class="attachment-name">{{ form.emailAttachmentName }}</span>
                <button type="button" class="attachment-remove" @click="clearEmailAttachment">Remove</button>
              </div>
            </div>
          </div>
        </div>

        <div v-if="channels.notification" class="section">
          <h3>In-app Notification</h3>
          <div class="field-grid">
            <div class="field span-2">
              <label>Notification Body <span class="char-count">{{ notificationCharCount }}/120</span></label>
              <textarea v-model="form.notificationBody" rows="3" maxlength="120"
                placeholder="Short in-app message for this CBT update..." />
              <p class="field-hint">This short message is what CBT users will see inside the app notification.</p>
            </div>
            <div class="field">
              <label>Deep Link / App Route <span class="optional-copy">Optional</span></label>
              <input v-model="form.deepLink" type="text" placeholder="/dashboard/courses" />
            </div>
            <div class="field">
              <label>Optional Image</label>
              <input type="file" accept="image/*" @change="handleNotificationImageUpload" />
            </div>
          </div>
        </div>

        <div class="section">
          <h3>General</h3>
          <div class="field-grid">
            <div class="field span-2">
              <label>Tag</label>
              <input v-model="form.tag" type="text" placeholder="e.g. JAMB, WAEC, Mock" />
            </div>
            <div class="field">
              <label>Target Audience</label>
              <select v-model="form.targetAudience">
                <option value="all">All CBT Users</option>
                <option value="segment">Custom CBT Segment</option>
              </select>
            </div>
            <div v-if="form.targetAudience === 'segment'" class="field">
              <label>Segment Name</label>
              <input v-model="form.segmentName" type="text" placeholder="e.g. WAEC Candidates" />
            </div>
            <div class="field">
              <label>Schedule Date & Time <span class="optional-copy">Optional</span></label>
              <input v-model="form.scheduleAt" type="datetime-local" />
            </div>
          </div>
        </div>

        <div class="section">
          <h3>Preview</h3>
          <div class="tab-row">
            <button v-if="channels.email" class="tab-btn" :class="{ active: previewTab === 'email' }"
              @click="previewTab = 'email'">
              Email Preview
            </button>
            <button v-if="channels.notification" class="tab-btn" :class="{ active: previewTab === 'notification' }"
              @click="previewTab = 'notification'">
              Notification Preview
            </button>
          </div>
          <div class="preview-panel">
            <div v-if="previewTab === 'email'" class="email-preview">
              <p class="preview-title">{{ resolvedEmailSubject || 'Email Subject' }}</p>
              <div class="preview-body" v-html="form.body || fallbackEmailBody"></div>
            </div>
            <div v-else class="notification-preview compact">
              <div class="notification-bubble">
                <p class="app-name">Linkskool</p>
                <p class="notification-title">{{ form.title || 'Notification title' }}</p>
                <p class="notification-message">{{ form.notificationBody || 'Notification message preview' }}</p>
                <p v-if="form.deepLink" class="deep-link">{{ form.deepLink }}</p>
                <img v-if="form.notificationImagePreview" :src="form.notificationImagePreview"
                  alt="Notification preview image" />
              </div>
            </div>
          </div>
        </div>

        <div class="actions">
          <button class="btn btn-secondary" :disabled="isSubmitting" @click="onCancel">Cancel</button>
          <button class="btn btn-muted" :disabled="isSubmitting" @click="saveDraft">Save Draft</button>
          <button class="btn btn-primary" :disabled="!canSendNow || isSubmitting" @click="sendNow">
            {{ isSubmitting && lastAction === 'send' ? 'Sending…' : 'Send Now' }}
          </button>
          <button class="btn btn-primary-alt" :disabled="!canSchedule || isSubmitting" @click="scheduleUpdate">
            {{ isSubmitting && lastAction === 'schedule' ? 'Scheduling…' : 'Schedule' }}
          </button>
        </div>
        <p v-if="submitError" class="submit-hint error-hint">{{ submitError }}</p>
        <p v-else-if="actionHint" class="submit-hint">{{ actionHint }}</p>
      </section>

      <aside class="history-card">
        <h3>CBT Update History</h3>
        <div class="history-list">
          <div v-if="isHistoryLoading" class="history-empty">Loading history...</div>
          <div v-else-if="!historyItems.length" class="history-empty">No CBT updates yet.</div>
          <div v-for="item in historyItems" :key="item.id" class="history-item" role="button" tabindex="0"
            @click="fillFormFromHistory(item.id)" @keydown.enter="fillFormFromHistory(item.id)">
            <div>
              <p class="history-title">{{ item.title }}</p>
              <p class="history-meta">{{ item.channel }} · {{ item.date }}</p>
            </div>
            <div class="history-actions">
              <button v-if="item.canNotify" type="button" class="history-action-btn"
                :disabled="publishingId === item.id" @click.stop="publishDraft(item.id)">
                {{ publishingId === item.id ? 'Publishing...' : 'Publish/Notify' }}
              </button>
              <span class="delivery-status" :class="item.statusClass">{{ item.status }}</span>
            </div>
          </div>
        </div>
      </aside>
    </div>

  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useToast } from 'vue-toast-notification'
import RichTextEditor from '@/components/RichTextEditor.vue'
import { useCbtUpdate, type CbtUpdateHistoryItem } from '@/composables/useCbtUpdate'

const { createUpdate, updateUpdate, fetchUpdateHistory, publishUpdate } = useCbtUpdate()
const $toast = useToast()

const channels = reactive({
  email: true,
  notification: true,
})

const form = reactive({
  title: '',
  body: '',
  tag: '',
  targetAudience: 'all',
  segmentName: '',
  scheduleAt: '',
  emailSubject: '',
  emailAttachmentName: '',
  notificationBody: '',
  deepLink: '',
  notificationImagePreview: '',
})

const previewTab = ref<'email' | 'notification'>('email')
const isDraft = ref(false)
const lastAction = ref<'send' | 'schedule' | 'draft'>('send')
const isSubmitting = ref(false)
const submitError = ref('')
const isHistoryLoading = ref(false)
const publishingId = ref<number | null>(null)
const editingUpdateId = ref<number | null>(null)
const historyData = ref<CbtUpdateHistoryItem[]>([])

const fallbackEmailBody = '<p>Add email content to preview it here.</p>'

const formatHistoryDate = (dateValue: string) => {
  const parsed = new Date(dateValue)
  if (Number.isNaN(parsed.getTime())) return dateValue
  return parsed.toLocaleString(undefined, {
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const historyItems = computed(() =>
  historyData.value.map((item) => {
    const emailOn = Number(item.send_email) === 1
    const pushOn = Number(item.send_push) === 1
    const channel = emailOn && pushOn ? 'Email + Notification' : emailOn ? 'Email' : 'Notification'

    const delivered = Boolean(item.notified_at)
    const isDraftStatus = item.status === 'draft'
    const isScheduled = item.status === 'published' && Boolean(item.schedule_time) && !delivered

    const status = delivered ? 'Delivered' : isDraftStatus ? 'Draft' : isScheduled ? 'Scheduled' : 'Published'
    const statusClass = delivered ? 'ok' : isDraftStatus ? 'draft' : isScheduled ? 'scheduled' : 'progress'

    return {
      id: item.id,
      title: item.title,
      channel,
      date: formatHistoryDate(item.created_at),
      status,
      statusClass,
      canNotify: isDraftStatus,
    }
  }),
)

const notificationCharCount = computed(() => form.notificationBody.length)

const resolvedEmailSubject = computed(() => form.emailSubject.trim() || form.title.trim())

const hasValidContent = computed(() => {
  const hasChannel = channels.email || channels.notification
  if (!hasChannel) return false

  const sharedContentReady = Boolean(form.title.trim() && form.body.trim())
  const notificationReady = !channels.notification || Boolean(form.notificationBody.trim())

  return sharedContentReady && notificationReady
})

const canSendNow = computed(() => hasValidContent.value)

const canSchedule = computed(() => hasValidContent.value && Boolean(form.scheduleAt))

const actionHint = computed(() => {
  if (!channels.email && !channels.notification) return 'Select at least one channel to continue.'
  if (!form.title.trim() || !form.body.trim()) return 'Add a shared title and body.'
  if (channels.notification && !form.notificationBody.trim()) return 'Add a notification body.'
  if (!form.scheduleAt) return 'Add a date and time only if you want to schedule this CBT update.'
  return ''
})

const loadHistory = async () => {
  isHistoryLoading.value = true
  try {
    const response = await fetchUpdateHistory()
    const payload = response?.data as {
      data?: CbtUpdateHistoryItem[]
    }
    historyData.value = payload?.data || []
    console.log('CBT update history:', response)
  } catch (error: unknown) {
    console.error('Failed to fetch CBT update history:', error)
  } finally {
    isHistoryLoading.value = false
  }
}

const publishDraft = async (id: number) => {
  if (publishingId.value !== null) return

  publishingId.value = id
  try {
    const response = await publishUpdate(id, 'published')
    $toast.success(response?.message || 'CBT update published successfully')
    await loadHistory()
  } catch (error: unknown) {
    const err = error as { message?: string }
    $toast.error(err.message || 'Failed to publish CBT update')
  } finally {
    publishingId.value = null
  }
}

watch(
  () => [channels.email, channels.notification] as const,
  ([email, notification]) => {
    if (previewTab.value === 'email' && !email && notification) {
      previewTab.value = 'notification'
    }

    if (previewTab.value === 'notification' && !notification && email) {
      previewTab.value = 'email'
    }
  },
)

const handleNotificationImageUpload = (event: Event) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = (e) => {
    form.notificationImagePreview = (e.target?.result as string) || ''
  }
  reader.readAsDataURL(file)
}

const handleEmailAttachmentUpload = (event: Event) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  form.emailAttachmentName = file?.name || ''
}

const clearEmailAttachment = () => {
  form.emailAttachmentName = ''
}

const toDateTimeLocal = (value: string | null | undefined) => {
  if (!value) return ''
  const normalized = value.replace(' ', 'T')
  const parsed = new Date(normalized)
  if (Number.isNaN(parsed.getTime())) return ''
  return normalized.slice(0, 16)
}

const fillFormFromHistory = (id: number) => {
  const selected = historyData.value.find((item) => item.id === id)
  if (!selected) return

  const emailEnabled = Number(selected.send_email) === 1
  const pushEnabled = Number(selected.send_push) === 1

  form.title = selected.title || ''
  form.body = selected.email_body || ''
  form.tag = selected.tag || ''
  form.notificationBody = selected.notification_body || ''
  form.scheduleAt = toDateTimeLocal(selected.schedule_time)
  form.emailSubject = ''
  form.emailAttachmentName = ''
  form.deepLink = ''
  form.notificationImagePreview = ''
  form.targetAudience = 'all'
  form.segmentName = ''

  channels.email = emailEnabled
  channels.notification = pushEnabled

  if (channels.email) {
    previewTab.value = 'email'
  } else if (channels.notification) {
    previewTab.value = 'notification'
  }

  isDraft.value = selected.status === 'draft'
  editingUpdateId.value = selected.id
  submitError.value = ''
}

const resetComposerForm = () => {
  form.title = ''
  form.body = ''
  form.tag = ''
  form.targetAudience = 'all'
  form.segmentName = ''
  form.scheduleAt = ''
  form.emailSubject = ''
  form.emailAttachmentName = ''
  form.notificationBody = ''
  form.deepLink = ''
  form.notificationImagePreview = ''
  channels.email = true
  channels.notification = true
  previewTab.value = 'email'
  isDraft.value = false
  editingUpdateId.value = null
  lastAction.value = 'send'
  submitError.value = ''
}

const saveDraft = async () => {
  if (isSubmitting.value) return
  submitError.value = ''
  isSubmitting.value = true
  lastAction.value = 'draft'

  try {
    const payload = {
      title: form.title,
      email_body: form.body,
      notification_body: form.notificationBody,
      send_push: channels.notification ? 1 : 0,
      send_email: channels.email ? 1 : 0,
      tag: form.tag,
      status: 'draft',
    } as const

    const response = editingUpdateId.value
      ? await updateUpdate(editingUpdateId.value, payload)
      : await createUpdate(payload)
    isDraft.value = true
    await loadHistory()
    resetComposerForm()
    $toast.success(response?.message || 'Draft saved')
  } catch (err: unknown) {
    const error = err as { message?: string }
    submitError.value = error.message || 'Failed to save draft.'
  } finally {
    isSubmitting.value = false
  }
}

const sendNow = async () => {
  if (!canSendNow.value || isSubmitting.value) return
  submitError.value = ''
  isSubmitting.value = true
  lastAction.value = 'send'

  try {
    const payload = {
      title: form.title,
      email_body: form.body,
      notification_body: form.notificationBody,
      send_push: channels.notification ? 1 : 0,
      send_email: channels.email ? 1 : 0,
      tag: form.tag,
      status: 'published',
    } as const

    const response = editingUpdateId.value
      ? await updateUpdate(editingUpdateId.value, payload)
      : await createUpdate(payload)
    isDraft.value = false
    await loadHistory()
    resetComposerForm()
    $toast.success(response?.message || 'CBT update sent successfully')
  } catch (err: unknown) {
    const error = err as { message?: string }
    submitError.value = error.message || 'Failed to send CBT update.'
  } finally {
    isSubmitting.value = false
  }
}

const scheduleUpdate = async () => {
  if (!canSchedule.value || isSubmitting.value) return
  submitError.value = ''
  isSubmitting.value = true
  lastAction.value = 'schedule'

  try {
    const payload = {
      title: form.title,
      email_body: form.body,
      notification_body: form.notificationBody,
      send_push: channels.notification ? 1 : 0,
      send_email: channels.email ? 1 : 0,
      tag: form.tag,
      status: 'published',
      schedule_time: form.scheduleAt,
    } as const

    const response = editingUpdateId.value
      ? await updateUpdate(editingUpdateId.value, payload)
      : await createUpdate(payload)
    isDraft.value = false
    await loadHistory()
    resetComposerForm()
    $toast.success(response?.message || 'CBT update scheduled successfully')
  } catch (err: unknown) {
    const error = err as { message?: string }
    submitError.value = error.message || 'Failed to schedule CBT update.'
  } finally {
    isSubmitting.value = false
  }
}

const onCancel = () => {
  resetComposerForm()
}

onMounted(() => {
  void loadHistory()
})
</script>

<style scoped>
.notifications-page {
  padding: 1.5rem;
}

.page-header {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  align-items: center;
  margin-bottom: 1.5rem;
}

.page-header h1 {
  margin: 0;
  font-size: 1.6rem;
  font-weight: 800;
  color: #0f172a;
}

.page-header p {
  margin: 0.3rem 0 0;
  color: #64748b;
}

.layout-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 1rem;
}

.composer-card,
.history-card {
  background: var(--theme-surface);
  border: 1px solid var(--theme-border);
  border-radius: 16px;
  box-shadow: 0 12px 30px rgba(15, 23, 42, 0.06);
}

.composer-card {
  padding: 1.2rem;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.card-header h2 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 800;
}

.draft-indicator {
  font-size: 0.8rem;
  color: var(--theme-text-muted);
  background: var(--theme-surface-muted);
  border-radius: 9999px;
  padding: 0.25rem 0.65rem;
}

.section {
  border-top: 1px solid var(--theme-border);
  padding-top: 1rem;
  margin-top: 1rem;
}

.section h3 {
  margin: 0 0 0.75rem;
  font-size: 0.95rem;
  color: #334155;
}

.field-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.span-2 {
  grid-column: span 2;
}

.field label {
  font-size: 0.82rem;
  font-weight: 700;
  color: #475569;
}

.optional-copy {
  color: #64748b;
  font-weight: 600;
  margin-left: 0.2rem;
}

.field input,
.field textarea,
.field select {
  border: 1px solid var(--theme-border);
  background: var(--theme-bg);
  border-radius: 10px;
  padding: 0.65rem 0.75rem;
  font-size: 0.92rem;
}

.editor-wrap {
  border: 1px solid var(--theme-border);
  border-radius: 10px;
  overflow: hidden;
}

.channel-grid {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.channel-item {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  background: #f8fafc;
  border: 1px solid #cbd5e1;
  border-radius: 9999px;
  padding: 0.35rem 0.7rem;
  font-size: 0.85rem;
}

.attachment-row {
  margin-top: 0.4rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.6rem;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  padding: 0.45rem 0.6rem;
  background: #f8fafc;
}

.attachment-name {
  font-size: 0.8rem;
  color: #334155;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.attachment-remove {
  border: none;
  background: #fee2e2;
  color: #991b1b;
  border-radius: 6px;
  padding: 0.25rem 0.45rem;
  font-size: 0.75rem;
  font-weight: 700;
  cursor: pointer;
}

.field-hint {
  margin: 0;
  font-size: 0.78rem;
  color: #64748b;
}

.preview-panel {
  border: 1px solid var(--theme-border);
  border-radius: 12px;
  background: #f8fafc;
  padding: 0.8rem;
}

.preview-title {
  margin: 0;
  font-weight: 700;
  color: #0f172a;
}

.preview-body {
  margin-top: 0.55rem;
  color: #334155;
}

.notification-preview {
  border: 1px solid var(--theme-border-strong);
  border-radius: 16px;
  background: var(--theme-surface-muted);
  padding: 0.8rem;
}

.notification-preview.compact {
  max-width: 360px;
}

.notification-bubble {
  background: var(--theme-surface);
  border-radius: 12px;
  border: 1px solid var(--theme-border);
  padding: 0.6rem 0.7rem;
}

.app-name {
  margin: 0;
  font-size: 0.7rem;
  color: #64748b;
  text-transform: uppercase;
  font-weight: 700;
}

.notification-title {
  margin: 0.2rem 0 0;
  font-weight: 700;
  color: #0f172a;
}

.notification-message {
  margin: 0.15rem 0 0;
  color: #334155;
  font-size: 0.88rem;
}

.deep-link {
  margin: 0.3rem 0 0;
  color: var(--theme-accent);
  font-size: 0.75rem;
}

.notification-bubble img {
  width: 100%;
  max-height: 120px;
  object-fit: cover;
  border-radius: 8px;
  margin-top: 0.5rem;
}

.char-count {
  font-size: 0.75rem;
  color: #64748b;
  margin-left: 0.4rem;
}

.tab-row {
  display: flex;
  gap: 0.4rem;
  margin-bottom: 0.7rem;
}

.tab-btn {
  border: 1px solid var(--theme-border-strong);
  background: var(--theme-surface);
  color: var(--theme-text-muted);
  border-radius: 8px;
  padding: 0.4rem 0.65rem;
  font-size: 0.8rem;
  font-weight: 700;
  cursor: pointer;
}

.tab-btn.active {
  border-color: var(--theme-accent);
  color: var(--theme-accent);
  background: var(--theme-accent-soft);
}

.actions {
  margin-top: 1rem;
  display: flex;
  justify-content: flex-end;
  gap: 0.55rem;
}

.btn {
  border: none;
  border-radius: 10px;
  padding: 0.65rem 0.95rem;
  font-weight: 700;
  cursor: pointer;
}

.btn-primary {
  background: linear-gradient(135deg, #6366f1, #4f46e5);
  color: #fff;
}

.btn-primary-alt {
  background: linear-gradient(135deg, #0f766e, #0d9488);
  color: #fff;
}

.btn-secondary {
  background: var(--theme-surface-muted);
  color: var(--theme-text);
}

.btn-muted {
  background: var(--theme-surface-soft);
  color: var(--theme-text-muted);
}

.btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.submit-hint {
  margin: 0.6rem 0 0;
  color: var(--theme-warning);
  font-size: 0.82rem;
  font-weight: 600;
}

.error-hint {
  color: var(--theme-error, #e53e3e);
}

.history-card {
  padding: 1rem;
}

.history-card h3 {
  margin: 0 0 0.75rem;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
}

.history-item {
  border: 1px solid var(--theme-border);
  border-radius: 10px;
  padding: 0.65rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  cursor: pointer;
}

.history-item:hover {
  border-color: var(--theme-border-strong);
}

.history-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.history-action-btn {
  border: 1px solid var(--theme-border-strong);
  background: var(--theme-surface-soft);
  color: var(--theme-text);
  border-radius: 8px;
  padding: 0.35rem 0.55rem;
  font-size: 0.72rem;
  font-weight: 700;
  cursor: pointer;
}

.history-action-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.history-empty {
  border: 1px dashed var(--theme-border);
  border-radius: 10px;
  padding: 0.8rem;
  color: var(--theme-text-muted);
  font-size: 0.85rem;
}

.history-title {
  margin: 0;
  font-size: 0.88rem;
  font-weight: 700;
  color: #0f172a;
}

.history-meta {
  margin: 0.2rem 0 0;
  font-size: 0.78rem;
  color: #64748b;
}

.delivery-status {
  border-radius: 9999px;
  font-size: 0.72rem;
  font-weight: 700;
  padding: 0.2rem 0.55rem;
}

.delivery-status.ok {
  background: #dcfce7;
  color: #166534;
}

.delivery-status.progress {
  background: #fef3c7;
  color: #92400e;
}

.delivery-status.draft {
  background: #e2e8f0;
  color: #334155;
}

.delivery-status.scheduled {
  background: #dbeafe;
  color: #1d4ed8;
}

.delivery-status.error {
  background: #fee2e2;
  color: #991b1b;
}

@media (max-width: 1080px) {
  .layout-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 720px) {
  .notifications-page {
    padding: 1rem;
  }

  .field-grid {
    grid-template-columns: 1fr;
  }

  .span-2 {
    grid-column: span 1;
  }

  .actions {
    flex-wrap: wrap;
  }
}
</style>
