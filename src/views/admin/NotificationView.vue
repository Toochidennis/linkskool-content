<template>
  <div class="notifications-page" :class="{ embedded: embedded }">
    <div v-if="!embedded" class="page-header">
      <div>
        <h1>Notifications</h1>
        <p>Create and send Email or Push notifications from one composer.</p>
      </div>
    </div>

    <div class="layout-grid">
      <section class="composer-card">
        <div class="card-header">
          <h2>Notification Composer</h2>
          <span class="draft-indicator">{{ isDraft ? 'Draft' : 'Ready to send' }}</span>
        </div>

        <div class="section">
          <h3>Channel Selection</h3>
          <div class="channel-grid">
            <label class="channel-item">
              <input type="checkbox" v-model="channels.email" />
              <span>Email</span>
            </label>
            <label class="channel-item">
              <input type="checkbox" v-model="channels.push" />
              <span>Push Notification</span>
            </label>
          </div>
        </div>

        <div v-if="channels.email" class="section">
          <h3>Email</h3>
          <div class="field-grid">
            <div class="field span-2">
              <label>Subject</label>
              <input v-model="form.emailSubject" type="text" placeholder="Your weekly updates are here" />
            </div>
            <div class="field span-2">
              <label>Email Attachment (Optional)</label>
              <input type="file" @change="handleEmailAttachmentUpload" />
              <div v-if="form.emailAttachmentName" class="attachment-row">
                <span class="attachment-name">{{ form.emailAttachmentName }}</span>
                <button type="button" class="attachment-remove" @click="clearEmailAttachment">Remove</button>
              </div>
            </div>
            <div class="field span-2">
              <label>Email Body</label>
              <div class="editor-wrap">
                <RichTextEditor v-model="form.emailBody" placeholder="Compose email content..." />
              </div>
            </div>
          </div>
        </div>

        <div v-if="channels.push" class="section">
          <h3>Push Notification</h3>
          <div class="field-grid">
            <div class="field">
              <label>Push Title</label>
              <input v-model="form.pushTitle" type="text" maxlength="50" placeholder="Breaking update" />
            </div>
            <div class="field">
              <label>Push Message <span class="char-count">{{ pushCharCount }}/120</span></label>
              <textarea v-model="form.pushMessage" rows="2" maxlength="120"
                placeholder="Tap to explore the latest update..." />
            </div>
            <div class="field">
              <label>Deep Link / App Route</label>
              <input v-model="form.deepLink" type="text" placeholder="/app/offers" />
            </div>
            <div class="field">
              <label>Optional Image</label>
              <input type="file" accept="image/*" @change="handlePushImageUpload" />
            </div>
          </div>
        </div>

        <div class="section">
          <h3>General</h3>
          <div class="field-grid">
            <div class="field">
              <label>Target Audience</label>
              <select v-model="form.targetAudience">
                <option value="all">All Users</option>
                <option value="segment">Custom Segment</option>
              </select>
            </div>
            <div v-if="form.targetAudience === 'segment'" class="field">
              <label>Segment Name</label>
              <input v-model="form.segmentName" type="text" placeholder="e.g. Trial Users" />
            </div>
            <div class="field span-2">
              <label>Schedule</label>
              <div class="schedule-row">
                <label class="inline-option">
                  <input type="radio" v-model="form.scheduleType" value="now" />
                  Send Now
                </label>
                <label class="inline-option">
                  <input type="radio" v-model="form.scheduleType" value="later" />
                  Schedule for Later
                </label>
              </div>
            </div>
            <div v-if="form.scheduleType === 'later'" class="field">
              <label>Schedule Date & Time</label>
              <input v-model="form.scheduleAt" type="datetime-local" />
            </div>
          </div>
        </div>

        <div class="section">
          <h3>Preview</h3>
          <div class="tab-row">
            <button class="tab-btn" :class="{ active: previewTab === 'email' }" @click="previewTab = 'email'">
              Email Preview
            </button>
            <button class="tab-btn" :class="{ active: previewTab === 'push' }" @click="previewTab = 'push'">
              Push Notification Preview
            </button>
          </div>
          <div class="preview-panel">
            <div v-if="previewTab === 'email'" class="email-preview">
              <p class="preview-title">{{ form.emailSubject || form.title || 'Email Subject' }}</p>
              <div class="preview-body" v-html="form.emailBody || fallbackEmailBody"></div>
            </div>
            <div v-else class="push-preview compact">
              <div class="notification-bubble">
                <p class="app-name">Linkskool</p>
                <p class="push-title">{{ form.pushTitle || form.title || 'Push title' }}</p>
                <p class="push-message">{{ form.pushMessage || form.message || 'Push message preview' }}</p>
                <p v-if="form.deepLink" class="deep-link">{{ form.deepLink }}</p>
                <img v-if="form.pushImagePreview" :src="form.pushImagePreview" alt="Push preview image" />
              </div>
            </div>
          </div>
        </div>

        <div class="actions">
          <button class="btn btn-secondary" @click="onCancel">Cancel</button>
          <button class="btn btn-muted" @click="saveDraft">Save Draft</button>
          <button class="btn btn-primary" :disabled="!canSubmit" @click="sendNotification">Send Notification</button>
        </div>
        <p v-if="!canSubmit" class="submit-hint">{{ submitDisabledReason }}</p>
      </section>

      <aside class="history-card">
        <h3>Notification History</h3>
        <div class="history-list">
          <div v-for="item in historyItems" :key="item.id" class="history-item">
            <div>
              <p class="history-title">{{ item.title }}</p>
              <p class="history-meta">{{ item.channel }} · {{ item.date }}</p>
            </div>
            <span class="delivery-status" :class="item.statusClass">{{ item.status }}</span>
          </div>
        </div>
      </aside>
    </div>

    <div v-if="showSuccessModal" class="modal-backdrop" @click.self="showSuccessModal = false">
      <div class="success-modal">
        <h4>Notification queued successfully</h4>
        <p>Your notification has been queued for delivery.</p>
        <button class="btn btn-primary" @click="showSuccessModal = false">Close</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import RichTextEditor from '@/components/RichTextEditor.vue'

withDefaults(
  defineProps<{
    embedded?: boolean
  }>(),
  {
    embedded: false,
  },
)

const channels = reactive({
  email: true,
  push: true,
})

const form = reactive({
  title: '',
  message: '',
  targetAudience: 'all',
  segmentName: '',
  scheduleType: 'now',
  scheduleAt: '',
  emailSubject: '',
  emailBody: '',
  emailAttachmentName: '',
  pushTitle: '',
  pushMessage: '',
  deepLink: '',
  pushImagePreview: '',
})

const previewTab = ref<'email' | 'push'>('email')
const isDraft = ref(false)
const showSuccessModal = ref(false)

const fallbackEmailBody = '<p>Add email content to preview it here.</p>'

const historyItems = [
  { id: 1, title: 'Monthly Product Update', channel: 'Email', date: 'Today, 10:45 AM', status: 'Delivered', statusClass: 'ok' },
  { id: 2, title: 'Flash Sale Alert', channel: 'Push', date: 'Yesterday, 6:10 PM', status: 'In Progress', statusClass: 'progress' },
  { id: 3, title: 'Security Reminder', channel: 'Email + Push', date: 'Mar 02, 9:00 AM', status: 'Failed', statusClass: 'error' },
]

const pushCharCount = computed(() => form.pushMessage.length)

const canSubmit = computed(() => {
  const hasChannel = channels.email || channels.push
  if (!hasChannel) return false

  const emailReady = !channels.email || (form.emailSubject.trim() && form.emailBody.trim())
  const pushReady = !channels.push || (form.pushTitle.trim() && form.pushMessage.trim())
  const scheduleReady = form.scheduleType !== 'later' || Boolean(form.scheduleAt)

  return emailReady && pushReady && scheduleReady
})

const submitDisabledReason = computed(() => {
  if (!channels.email && !channels.push) return 'Select at least one channel to continue.'
  if (channels.email && (!form.emailSubject.trim() || !form.emailBody.trim())) return 'Add an email subject and body.'
  if (channels.push && (!form.pushTitle.trim() || !form.pushMessage.trim())) return 'Add a push title and message.'
  if (form.scheduleType === 'later' && !form.scheduleAt) return 'Choose a date and time for scheduled delivery.'
  return ''
})

const handlePushImageUpload = (event: Event) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = (e) => {
    form.pushImagePreview = (e.target?.result as string) || ''
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

const saveDraft = () => {
  isDraft.value = true
}

const sendNotification = () => {
  if (!canSubmit.value) return
  isDraft.value = false
  showSuccessModal.value = true
}

const onCancel = () => {
  form.emailSubject = ''
  form.emailBody = ''
  form.emailAttachmentName = ''
  form.pushTitle = ''
  form.pushMessage = ''
  form.deepLink = ''
  form.pushImagePreview = ''
  form.segmentName = ''
  form.scheduleType = 'now'
  form.scheduleAt = ''
}
</script>

<style scoped>
.notifications-page {
  padding: 1.5rem;
}

.notifications-page.embedded {
  padding: 0;
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

.status-chip {
  padding: 0.35rem 0.7rem;
  border-radius: 9999px;
  background: #e0e7ff;
  color: #4338ca;
  font-size: 0.75rem;
  font-weight: 700;
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

.channel-item,
.inline-option {
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

.schedule-row {
  display: flex;
  gap: 0.6rem;
  flex-wrap: wrap;
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

.push-preview {
  border: 1px solid var(--theme-border-strong);
  border-radius: 16px;
  background: var(--theme-surface-muted);
  padding: 0.8rem;
}

.push-preview.compact {
  max-width: 360px;
}

.phone-notch {
  width: 80px;
  height: 12px;
  border-radius: 9999px;
  background: #94a3b8;
  margin: 0 auto 0.8rem;
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

.push-title {
  margin: 0.2rem 0 0;
  font-weight: 700;
  color: #0f172a;
}

.push-message {
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

.delivery-status.error {
  background: #fee2e2;
  color: #991b1b;
}

.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.5);
  display: grid;
  place-items: center;
  z-index: 90;
}

.success-modal {
  width: min(360px, 92vw);
  border-radius: 14px;
  background: #fff;
  padding: 1rem;
  box-shadow: 0 20px 40px rgba(15, 23, 42, 0.2);
}

.success-modal h4 {
  margin: 0;
}

.success-modal p {
  margin: 0.4rem 0 1rem;
  color: #475569;
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
