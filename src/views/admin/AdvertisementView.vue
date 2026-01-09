<template>
  <div>
    <!-- Header Section -->
    <div class="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md mb-6">
      <div class="flex justify-between items-center">
        <h1 class="text-xl font-semibold text-gray-800 dark:text-gray-200">Advertisements</h1>
        <button @click="openModal"
          class="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow-md transition-all duration-200 flex items-center gap-2 cursor-pointer">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Add Ad
        </button>
      </div>
    </div>

    <!-- Filters Section -->
    <div class="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md mb-6">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <!-- Search Bar -->
        <div class="relative">
          <input v-model="searchQuery" type="text" placeholder="Search ads..."
            class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm" />
          <svg class="w-5 h-5 absolute left-3 top-2.5 text-gray-400" fill="none" stroke="currentColor"
            viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        <!-- Filter by Date -->
        <div>
          <select v-model="dateFilter"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm">
            <option value="">All Dates</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>
        </div>

        <!-- Filter by Status -->
        <div>
          <select v-model="statusFilter"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm">
            <option value="">All Status</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Grid View -->
    <div v-if="filteredAdsList.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div v-for="ad in filteredAdsList" :key="ad.id" class="ad-card">
        <div class="ad-image-container">
          <img :src="loadImage(ad.image)" :alt="ad.title" class="ad-image" />
          <div class="ad-status-badge" :class="getStatusClass(ad.status)">
            {{ ad.status }}
          </div>
        </div>
        <div class="ad-content">
          <div class="ad-header-row">
            <h3 class="ad-title">{{ ad.title }}</h3>
            <!-- Three Dot Menu -->
            <div class="menu-container">
              <button @click="toggleMenu(ad.id)" class="menu-button">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                </svg>
              </button>
              <Transition name="dropdown">
                <div v-if="activeMenu === ad.id" class="menu-dropdown">
                  <button @click="editAd(ad)" class="menu-item">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit
                  </button>
                  <button @click="togglePublishStatus(ad.id)" class="menu-item" :disabled="statusLoadingId === ad.id"
                    :class="statusLoadingId === ad.id ? 'opacity-60 cursor-not-allowed' : ''">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                    </svg>
                    {{ ad.status === 'published' ? 'Archive' : 'Publish' }}
                  </button>
                  <button @click="deleteAd(ad.id)" class="menu-item menu-item-danger"
                    :disabled="deleteLoadingId === ad.id"
                    :class="deleteLoadingId === ad.id ? 'opacity-60 cursor-not-allowed' : ''">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Delete
                  </button>
                </div>
              </Transition>
            </div>
          </div>
          <p class="ad-text">{{ ad.content }}</p>
          <div class="ad-meta">
            <div class="ad-meta-left">
              <span class="ad-author">By {{ ad.authorName }}</span>
              <span v-if="ad.isSponsored" class="ad-sponsored">💎 Sponsored</span>
            </div>
            <span class="ad-position">📍 {{ ad.displayPosition }}</span>
          </div>
          <div v-if="ad.actionUrl && ad.actionText" class="ad-action">
            <a :href="ad.actionUrl" target="_blank" class="action-link">
              {{ ad.actionText }}
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="empty-state">
      <svg class="empty-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
      </svg>
      <p class="empty-text">{{ searchQuery || statusFilter || dateFilter ? 'No ads match your filters' :
        'No ads yet. Click "Add Ad" to create your first advertisement.' }}</p>
    </div>

    <!-- Modal -->
    <Transition name="modal">
      <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
        <div class="modal-container">
          <div class="modal-header">
            <h3 class="modal-title">{{ editingAdId ? 'Edit Advertisement' : 'Add Advertisement' }}</h3>
            <button @click="closeModal" class="close-button">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div class="modal-body">
            <!-- Title -->
            <div class="form-group">
              <label class="form-label">Title <span class="required">*</span></label>
              <input v-model="formData.title" type="text" required class="form-input"
                placeholder="Enter advertisement title" />
            </div>

            <!-- Content -->
            <div class="form-group">
              <label class="form-label">Content <span class="required">*</span></label>
              <textarea v-model="formData.content" required rows="4" class="form-input"
                placeholder="Enter advertisement content"></textarea>
            </div>

            <!-- Author Name -->
            <div class="form-group">
              <label class="form-label">Author Name <span class="required">*</span></label>
              <input v-model="formData.authorName" type="text" required class="form-input"
                placeholder="Enter author name" />
            </div>

            <!-- Action URL -->
            <div class="form-group">
              <label class="form-label">Action URL</label>
              <input v-model="formData.actionUrl" type="url" class="form-input" placeholder="https://example.com" />
            </div>

            <!-- Action Text -->
            <div class="form-group">
              <label class="form-label">Action Text</label>
              <input v-model="formData.actionText" type="text" class="form-input"
                placeholder="Learn More, Get Started, etc." />
            </div>

            <!-- Display Position -->
            <div class="form-group">
              <label class="form-label">Display Position <span class="required">*</span></label>
              <select v-model="formData.displayPosition" required class="form-input">
                <option value="center">Center</option>
                <option value="sidebar">Sidebar</option>
                <option value="bottom">Bottom</option>
                <option value="top">Top</option>
              </select>
            </div>

            <!-- Sponsored Toggle -->
            <div class="form-group">
              <label class="form-label">Sponsored Advertisement</label>
              <div class="toggle-container">
                <button type="button" @click="formData.isSponsored = !formData.isSponsored" class="toggle-button"
                  :class="{ 'toggle-active': formData.isSponsored }">
                  <span class="toggle-slider"></span>
                </button>
                <span class="toggle-label">{{ formData.isSponsored ? 'Yes, this is a sponsored ad' : 'No, regular ad'
                }}</span>
              </div>
            </div>

            <!-- Single Image Upload -->
            <div class="form-group">
              <label class="form-label">Image <span class="required">*</span></label>
              <div class="upload-area" @click="triggerFileInput" @dragover.prevent @drop.prevent="handleDrop">
                <input ref="fileInput" type="file" accept="image/*" @change="handleFileSelect" class="hidden" />
                <svg class="upload-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <p class="upload-text">Click to upload or drag and drop</p>
                <p class="upload-hint">PNG, JPG, GIF up to 10MB</p>
              </div>

              <!-- Image Preview -->
              <div v-if="imagePreview" class="image-preview-single">
                <img :src="loadImage(imagePreview)" alt="Preview" class="preview-image-single" />
                <button type="button" @click="removeImage" class="remove-image-btn" :disabled="isRemovingImage"
                  :class="isRemovingImage ? 'opacity-60 cursor-not-allowed' : ''">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <!-- Submit Button -->
            <div class="modal-footer">
              <button type="button" @click="closeModal" class="btn-secondary" :disabled="isSubmitting">
                Cancel
              </button>
              <button type="button" @click="handleSubmit('draft')" :disabled="!isFormValid || isSubmitting"
                class="btn-draft" :class="{ 'opacity-50 cursor-not-allowed': !isFormValid || isSubmitting }">
                {{ isSubmitting ? 'Saving...' : 'Save as Draft' }}
              </button>
              <button type="button" @click="handleSubmit('published')" :disabled="!isFormValid || isSubmitting"
                class="btn-primary" :class="{ 'opacity-50 cursor-not-allowed': !isFormValid || isSubmitting }">
                {{ isSubmitting ? 'Publishing...' : 'Publish Now' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Delete Confirmation Modal -->
    <Transition name="modal">
      <div v-if="showDeleteModal" class="modal-overlay" @click.self="closeDeleteModal">
        <div class="delete-modal">
          <div class="delete-modal-header">
            <h3 class="delete-modal-title">Delete Advertisement</h3>
          </div>

          <div class="delete-modal-body">
            <p class="delete-modal-text">Are you sure you want to delete this advertisement?</p>
            <p class="delete-modal-hint">This action cannot be undone.</p>
          </div>

          <div class="delete-modal-footer">
            <button @click="closeDeleteModal" class="delete-modal-btn delete-modal-cancel">Cancel</button>
            <button @click="confirmDelete" :disabled="deleteLoadingId === adToDelete"
              class="delete-modal-btn delete-modal-delete"
              :class="{ 'opacity-50 cursor-not-allowed': deleteLoadingId === adToDelete }">
              {{ deleteLoadingId === adToDelete ? 'Deleting...' : 'Delete' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useToast } from 'vue-toast-notification';
import { useAuthStore } from '@/stores/auth';
import { useAdvertisement } from '@/composables/useAdvertisement';
import type { Advertisement, CreateAdvertisementPayload } from '@/api/models';

const toast = useToast();
const authStore = useAuthStore();
const advertisement = useAdvertisement();

interface AdItem {
  id: number;
  title: string;
  content: string;
  authorName: string;
  image: string;
  actionUrl?: string;
  actionText?: string;
  displayPosition: 'center' | 'sidebar' | 'bottom' | 'top';
  isSponsored: boolean;
  status: 'published' | 'draft' | 'archived';
  createdAt: string;
}

const showModal = ref(false);
const showDeleteModal = ref(false);
const adToDelete = ref<number | null>(null);
const fileInput = ref<HTMLInputElement | null>(null);
const imagePreview = ref<string>('');
const imageFile = ref<File | null>(null);
const adsList = ref<AdItem[]>([]);
const activeMenu = ref<number | null>(null);
const editingAdId = ref<number | null>(null);
const isSubmitting = ref(false);
const isRemovingImage = ref(false);
const originalImageFileName = ref('');
const statusLoadingId = ref<number | null>(null);
const deleteLoadingId = ref<number | null>(null);

// Filter states
const searchQuery = ref('');
const dateFilter = ref('');
const statusFilter = ref('');

const formData = ref({
  title: '',
  content: '',
  authorName: '',
  actionUrl: '',
  actionText: '',
  displayPosition: 'center' as 'center' | 'sidebar' | 'bottom' | 'top',
  isSponsored: false,
});

// Fetch advertisements from API
const fetchAds = async () => {
  try {
    const adsData = await advertisement.fetchAds();

    console.log('Fetched advertisements data:', adsData);

    if (adsData) {
      // Map API response to local AdItem format
      adsList.value = adsData.map((ad: Advertisement) => ({
        id: ad.id,
        title: ad.title,
        content: ad.content,
        authorName: ad.authorName,
        image: ad.image.fileName,
        actionUrl: ad.actionUrl,
        actionText: ad.actionText,
        displayPosition: ad.displayPosition,
        isSponsored: ad.isSponsored,
        status: ad.status,
        createdAt: ad.createdAt || new Date().toISOString(),
      }));
    }
  } catch (error: unknown) {
    console.error('Failed to fetch ads:', error);
    const message = error instanceof Error ? error.message : 'Failed to load ads';
    toast.error(message);
  }
};

const loadImage = (image: string) => {
  if (!image) return '';
  if (image.startsWith('data:') || image.startsWith('http')) {
    return image;
  }
  return import.meta.env.VITE_ASSETS_BASE_URL + '/' + image;
};

// Filtered ads based on search and filters
const filteredAdsList = computed(() => {
  let filtered = [...adsList.value];

  // Apply search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(ad =>
      ad.title.toLowerCase().includes(query) ||
      ad.content.toLowerCase().includes(query) ||
      ad.authorName.toLowerCase().includes(query)
    );
  }

  // Apply status filter
  if (statusFilter.value) {
    filtered = filtered.filter(ad => ad.status === statusFilter.value);
  }

  // Apply date filter
  if (dateFilter.value) {
    const now = new Date();
    filtered = filtered.filter(ad => {
      const adDate = new Date(ad.createdAt);
      switch (dateFilter.value) {
        case 'today':
          return adDate.toDateString() === now.toDateString();
        case 'week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          return adDate >= weekAgo;
        case 'month':
          return adDate.getMonth() === now.getMonth() && adDate.getFullYear() === now.getFullYear();
        default:
          return true;
      }
    });
  }

  return filtered;
});

// Load data on component mount
onMounted(() => {
  fetchAds();
  // Set default author name from user
  if (authStore.user) {
    formData.value.authorName = `${authStore.user.firstName} ${authStore.user.lastName || ''}`.trim();
  }
});

const isFormValid = computed(() => {
  return formData.value.title.trim() !== '' &&
    formData.value.content.trim() !== '' &&
    formData.value.authorName.trim() !== '' &&
    formData.value.actionUrl.trim() !== '' &&
    formData.value.actionText.trim() !== '' &&
    (imageFile.value !== null || (editingAdId.value && imagePreview.value));
});

const openModal = () => {
  editingAdId.value = null;
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
  resetForm();
};

const resetForm = () => {
  formData.value = {
    title: '',
    content: '',
    authorName: authStore.user ? `${authStore.user.firstName} ${authStore.user.lastName || ''}`.trim() : '',
    actionUrl: '',
    actionText: '',
    displayPosition: 'center',
    isSponsored: false,
  };
  imagePreview.value = '';
  imageFile.value = null;
  editingAdId.value = null;
};

const triggerFileInput = () => {
  fileInput.value?.click();
};

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files[0]) {
    addFile(target.files[0]);
  }
};

const handleDrop = (event: DragEvent) => {
  const files = event.dataTransfer?.files;
  if (files && files[0]) {
    addFile(files[0]);
  }
};

const addFile = (file: File) => {
  if (file.type.startsWith('image/')) {
    imageFile.value = file;
    const reader = new FileReader();
    reader.onload = (e) => {
      imagePreview.value = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  } else {
    toast.error('Please upload an image file');
  }
};

const removeImage = () => {
  // Just clear the preview locally - don't delete from server yet
  // Actual deletion will happen on submit if a new image is uploaded
  imagePreview.value = '';
  imageFile.value = null;
  if (fileInput.value) {
    fileInput.value.value = '';
  }
};

const handleSubmit = async (status: 'published' | 'draft' | 'archived') => {
  if (!isFormValid.value || isSubmitting.value) return;

  isSubmitting.value = true;

  try {
    // Get author ID and name from user or form
    const authorName = formData.value.authorName;
    const authorId = authStore.user?.id || 0;

    // Validate required fields
    if (!formData.value.actionUrl) {
      toast.error('Action URL is required');
      isSubmitting.value = false;
      return;
    }

    if (!formData.value.actionText) {
      toast.error('Action Text is required');
      isSubmitting.value = false;
      return;
    }

    if (editingAdId.value !== null) {
      // Update existing advertisement

      const payload = new FormData();
      payload.append('title', formData.value.title);
      payload.append('content', formData.value.content);
      payload.append('action_url', formData.value.actionUrl);
      payload.append('action_text', formData.value.actionText);
      payload.append('display_position', formData.value.displayPosition);
      payload.append('author_id', authorId.toString());
      payload.append('author_name', authorName);
      payload.append('is_sponsored', formData.value.isSponsored ? '1' : '0');
      payload.append('status', status);

      // If a new image is selected, include it
      if (imageFile.value) {
        payload.append('image', imageFile.value);

        // If there was an original image, send it for deletion
        if (originalImageFileName.value) {
          payload.append('old_file_name', originalImageFileName.value);
        }
      }

      const response = await advertisement.updateAd(editingAdId.value, payload as Record<string, any>);

      if (response && response.success) {
        toast.success('Advertisement updated successfully');
        await fetchAds(); // Refresh the list
        closeModal();
      }
    } else {
      // Create new advertisement
      if (!imageFile.value) {
        toast.error('Image is required');
        isSubmitting.value = false;
        return;
      }

      const payload: CreateAdvertisementPayload = {
        title: formData.value.title,
        content: formData.value.content,
        action_url: formData.value.actionUrl,
        action_text: formData.value.actionText,
        display_position: formData.value.displayPosition,
        author_id: authorId,
        author_name: authorName,
        is_sponsored: formData.value.isSponsored,
        status,
        image: imageFile.value,
      };

      const response = await advertisement.createAd(payload);

      if (response && response.success) {
        toast.success('Advertisement created successfully');
        await fetchAds(); // Refresh the list
        closeModal();
      }
    }
  } catch (error: unknown) {
    console.error('Failed to submit ad:', error);
    const message = error instanceof Error ? error.message : 'Failed to save advertisement';
    toast.error(message);
  } finally {
    isSubmitting.value = false;
  }
};

const toggleMenu = (adId: number) => {
  activeMenu.value = activeMenu.value === adId ? null : adId;
};

const editAd = (ad: AdItem) => {
  editingAdId.value = ad.id;
  formData.value = {
    title: ad.title,
    content: ad.content,
    authorName: ad.authorName,
    actionUrl: ad.actionUrl || '',
    actionText: ad.actionText || '',
    displayPosition: ad.displayPosition,
    isSponsored: ad.isSponsored,
  };
  originalImageFileName.value = ad.image;
  imagePreview.value = ad.image;
  imageFile.value = null;
  activeMenu.value = null;
  showModal.value = true;
};

const togglePublishStatus = async (adId: number) => {
  if (statusLoadingId.value === adId) return;
  statusLoadingId.value = adId;

  try {
    const ad = adsList.value.find(a => a.id === adId);
    if (ad) {
      // Cycle through statuses: draft -> published -> archived -> published
      let newStatus: 'draft' | 'published' | 'archived';

      if (ad.status === 'draft') {
        newStatus = 'published';
      } else if (ad.status === 'published') {
        newStatus = 'archived';
      } else {
        newStatus = 'published';
      }

      const response = await advertisement.updateAdStatus(adId, newStatus);

      if (response && response.success) {
        toast.success(`Advertisement ${newStatus} successfully`);
        await fetchAds(); // Refresh the list
      }
    }
  } catch (error: unknown) {
    console.error('Failed to update ad status:', error);
    const message = error instanceof Error ? error.message : 'Failed to update advertisement status';
    toast.error(message);
  } finally {
    activeMenu.value = null;
    statusLoadingId.value = null;
  }
};

const deleteAd = (adId: number) => {
  adToDelete.value = adId;
  showDeleteModal.value = true;
  activeMenu.value = null;
};

const confirmDelete = async () => {
  if (adToDelete.value === null) return;
  if (deleteLoadingId.value === adToDelete.value) return;

  const adId = adToDelete.value;
  deleteLoadingId.value = adId;

  try {
    const response = await advertisement.deleteAd(adId);

    if (response && response.success) {
      toast.success('Advertisement deleted successfully');
      await fetchAds(); // Refresh the list
      closeDeleteModal();
    }
  } catch (error: unknown) {
    console.error('Failed to delete ad:', error);
    const message = error instanceof Error ? error.message : 'Failed to delete advertisement';
    toast.error(message);
  } finally {
    deleteLoadingId.value = null;
  }
};

const closeDeleteModal = () => {
  showDeleteModal.value = false;
  adToDelete.value = null;
};

const getStatusClass = (status: string) => {
  switch (status) {
    case 'published':
      return 'status-published';
    case 'draft':
      return 'status-draft';
    case 'archived':
      return 'status-archived';
    default:
      return '';
  }
};
</script>

<style scoped>
/* Grid Layout */
.grid {
  display: grid;
}

/* Ad Card */
.ad-card {
  background: white;
  border-radius: 0.75rem;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  border: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
}

.ad-card:hover {
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.ad-image-container {
  position: relative;
  width: 100%;
  height: 200px;
  overflow: hidden;
}

.ad-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.ad-status-badge {
  position: absolute;
  top: 0.75rem;
  left: 0.75rem;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  backdrop-filter: blur(8px);
}

.status-published {
  background: rgba(16, 185, 129, 0.9);
  color: white;
}

.status-draft {
  background: rgba(251, 191, 36, 0.9);
  color: white;
}

.status-archived {
  background: rgba(107, 114, 128, 0.9);
  color: white;
}

.ad-content {
  padding: 1.25rem;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.ad-header-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.75rem;
}

.ad-title {
  font-size: 1rem;
  font-weight: 700;
  color: #111827;
  line-height: 1.3;
  flex: 1;
}

.ad-text {
  color: #6b7280;
  line-height: 1.5;
  margin-bottom: 0.75rem;
  font-size: 0.875rem;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  flex: 1;
}

.ad-meta {
  margin-bottom: 0.75rem;
  padding-top: 0.75rem;
  border-top: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.5rem;
}

.ad-meta-left {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.ad-author {
  font-size: 0.75rem;
  color: #9ca3af;
  font-weight: 500;
}

.ad-sponsored {
  font-size: 0.7rem;
  color: #f59e0b;
  font-weight: 700;
  background: #fffbeb;
  padding: 0.125rem 0.5rem;
  border-radius: 0.25rem;
  width: fit-content;
}

.ad-position {
  font-size: 0.7rem;
  color: #6366f1;
  font-weight: 600;
  text-transform: capitalize;
  background: #eef2ff;
  padding: 0.125rem 0.5rem;
  border-radius: 0.25rem;
}

/* Toggle Button */
.toggle-container {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.toggle-button {
  position: relative;
  width: 3.5rem;
  height: 2rem;
  background: #d1d5db;
  border-radius: 9999px;
  border: none;
  cursor: pointer;
  transition: background 0.3s;
}

.toggle-button:hover {
  background: #9ca3af;
}

.toggle-active {
  background: #10b981 !important;
}

.toggle-active:hover {
  background: #059669 !important;
}

.toggle-slider {
  position: absolute;
  top: 0.25rem;
  left: 0.25rem;
  width: 1.5rem;
  height: 1.5rem;
  background: white;
  border-radius: 9999px;
  transition: transform 0.3s;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.toggle-active .toggle-slider {
  transform: translateX(1.5rem);
}

.toggle-label {
  font-size: 0.875rem;
  color: #374151;
  font-weight: 500;
}

.ad-action {
  margin-top: auto;
}

.action-link {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: #4f46e5;
  color: white;
  font-size: 0.875rem;
  font-weight: 600;
  border-radius: 0.5rem;
  text-decoration: none;
  transition: background 0.2s;
}

.action-link:hover {
  background: #4338ca;
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
}

.empty-icon {
  width: 4rem;
  height: 4rem;
  color: #d1d5db;
  margin-bottom: 1rem;
}

.empty-text {
  color: #6b7280;
  font-size: 1rem;
}

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
  padding: 1rem;
}

.modal-container {
  background: white;
  border-radius: 1rem;
  max-width: 42rem;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.modal-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #111827;
}

.close-button {
  padding: 0.5rem;
  color: #6b7280;
  transition: color 0.2s;
  border: none;
  background: none;
  cursor: pointer;
  border-radius: 0.5rem;
}

.close-button:hover {
  background: #f3f4f6;
  color: #111827;
}

.modal-body {
  padding: 1.5rem;
}

.modal-footer {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
  padding-top: 1.5rem;
}

/* Form */
.form-group {
  margin-bottom: 1.5rem;
}

.form-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.5rem;
}

.required {
  color: #ef4444;
}

.form-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  transition: all 0.2s;
}

.form-input:focus {
  outline: none;
  border-color: #4f46e5;
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
}

/* Upload Area */
.upload-area {
  border: 2px dashed #d1d5db;
  border-radius: 0.75rem;
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
}

.upload-area:hover {
  border-color: #4f46e5;
  background: #fafafa;
}

.upload-icon {
  width: 3rem;
  height: 3rem;
  margin: 0 auto 1rem;
  color: #9ca3af;
}

.upload-text {
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.25rem;
}

.upload-hint {
  font-size: 0.75rem;
  color: #9ca3af;
}

.hidden {
  display: none;
}

/* Image Preview */
.image-preview-single {
  position: relative;
  margin-top: 1rem;
  border-radius: 0.5rem;
  overflow: hidden;
  border: 2px solid #e5e7eb;
  max-width: 300px;
}

.preview-image-single {
  width: 100%;
  height: auto;
  display: block;
}

.remove-image-btn {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background: rgba(0, 0, 0, 0.75);
  color: white;
  border: none;
  border-radius: 9999px;
  padding: 0.5rem;
  cursor: pointer;
  transition: background 0.2s;
}

.remove-image-btn:hover {
  background: rgba(220, 38, 38, 0.9);
}

/* Buttons */
.btn-primary {
  padding: 0.625rem 1.5rem;
  background: #4f46e5;
  color: white;
  font-weight: 600;
  border-radius: 0.5rem;
  border: none;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-primary:hover {
  background: #4338ca;
}

.btn-draft {
  padding: 0.625rem 1.5rem;
  background: #f59e0b;
  color: white;
  font-weight: 600;
  border-radius: 0.5rem;
  border: none;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-draft:hover {
  background: #d97706;
}

.btn-secondary {
  padding: 0.625rem 1.5rem;
  background: white;
  color: #374151;
  font-weight: 600;
  border-radius: 0.5rem;
  border: 1px solid #d1d5db;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-secondary:hover {
  background: #f9fafb;
}

/* Menu Dropdown */
.menu-container {
  position: relative;
}

.menu-button {
  padding: 0.25rem;
  background: transparent;
  border: none;
  color: #6b7280;
  cursor: pointer;
  border-radius: 0.375rem;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.menu-button:hover {
  background: #f3f4f6;
  color: #111827;
}

.menu-dropdown {
  position: absolute;
  right: 0;
  top: 100%;
  margin-top: 0.25rem;
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  border: 1px solid #e5e7eb;
  min-width: 10rem;
  z-index: 10;
  overflow: hidden;
}

.menu-item {
  width: 100%;
  padding: 0.625rem 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: white;
  border: none;
  color: #374151;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
  text-align: left;
}

.menu-item:hover {
  background: #f9fafb;
}

.menu-item-danger {
  color: #ef4444;
}

.menu-item-danger:hover {
  background: #fef2f2;
}

/* Dropdown Transitions */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

/* Modal Transitions */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .modal-container,
.modal-leave-active .modal-container {
  transition: transform 0.3s ease;
}

.modal-enter-from .modal-container,
.modal-leave-to .modal-container {
  transform: scale(0.95);
}

/* Delete Modal */
.delete-modal {
  background: white;
  border-radius: 0.75rem;
  width: 90%;
  max-width: 20rem;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

.delete-modal-header {
  padding: 1rem 1.25rem;
  border-bottom: 1px solid #e5e7eb;
}

.delete-modal-title {
  font-size: 1.125rem;
  font-weight: 700;
  color: #111827;
  margin: 0;
}

.delete-modal-body {
  padding: 1rem 1.25rem;
}

.delete-modal-text {
  color: #374151;
  font-size: 0.9375rem;
  font-weight: 500;
  margin: 0 0 0.5rem 0;
}

.delete-modal-hint {
  color: #6b7280;
  font-size: 0.8125rem;
  margin: 0;
}

.delete-modal-footer {
  display: flex;
  gap: 0.75rem;
  padding: 1rem 1.25rem;
  justify-content: flex-end;
}

.delete-modal-btn {
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  border: none;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.delete-modal-cancel {
  background: #f3f4f6;
  color: #374151;
  border: 1px solid #d1d5db;
}

.delete-modal-cancel:hover {
  background: #e5e7eb;
}

.delete-modal-delete {
  background: #ef4444;
  color: white;
}

.delete-modal-delete:hover:not(:disabled) {
  background: #dc2626;
}
</style>
