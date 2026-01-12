<template>
  <div>
    <div class="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md mb-6">
      <div class="flex justify-between items-center">
        <h2 class="text-2xl font-semibold text-gray-800 dark:text-gray-200">News & Announcements</h2>
        <button @click="openModal"
          class="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow-md transition-all duration-200 flex items-center gap-2 cursor-pointer">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Add News
        </button>
      </div>
    </div>

    <!-- Masonry Grid -->
    <div v-if="newsList.length > 0" class="masonry-grid">
      <div v-for="news in newsList" :key="news.id" class="masonry-item">
        <div class="news-card">
          <div class="news-image-container">
            <img :src="loadImage(news.images[0] || '')" :alt="news.title" class="news-image" />
            <div v-if="news.images.length > 1" class="image-count-badge">
              +{{ news.images.length - 1 }}
            </div>
            <div class="news-status-badge" :class="news.status === 'published' ? 'status-published' : 'status-draft'">
              {{ news.status === 'published' ? 'Published' : 'Draft' }}
            </div>
          </div>
          <div class="news-content">
            <div class="news-header-row">
              <div class="news-categories">
                <span v-for="category in news.categories" :key="category" class="category-badge">
                  {{ category }}
                </span>
              </div>
              <!-- Three Dot Menu -->
              <div class="menu-container">
                <button @click="toggleMenu(news.id)" class="menu-button">
                  <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                  </svg>
                </button>
                <Transition name="dropdown">
                  <div v-if="activeMenu === news.id" class="menu-dropdown">
                    <button @click="editNews(news)" class="menu-item">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Edit
                    </button>
                    <button @click="togglePublishStatus(news.id)" class="menu-item">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                      </svg>
                      {{ news.status === 'published' ? 'Archive' : 'Publish' }}
                    </button>
                    <button @click="deleteNews(news.id)" class="menu-item menu-item-danger">
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
            <h3 class="news-title">{{ news.title }}</h3>
            <p class="news-text">{{ news.content }}</p>
            <div class="news-footer">
              <span class="news-date">{{ formatDate(news.datePosted) }}</span>
            </div>
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
      <p class="empty-text">No news yet. Click "Add News" to create your first announcement.</p>
    </div>

    <!-- Modal -->
    <Transition name="modal">
      <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
        <div class="modal-container">
          <div class="modal-header">
            <h3 class="modal-title">Add News</h3>
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
              <input v-model="formData.title" type="text" required class="form-input" placeholder="Enter news title" />
            </div>

            <!-- Content -->
            <div class="form-group">
              <label class="form-label">Content <span class="required">*</span></label>
              <textarea v-model="formData.content" required rows="5" class="form-input"
                placeholder="Enter news content"></textarea>
            </div>

            <!-- Categories (Multi-select) -->
            <div class="form-group">
              <label class="form-label">Categories <span class="required">*</span></label>
              <div v-if="isLoadingCategories" class="text-gray-500 text-sm">Loading categories...</div>
              <div v-else class="categories-chips">
                <button v-for="category in availableCategories" :key="category.id" type="button"
                  @click="toggleCategory(category.name)" class="category-chip"
                  :class="{ 'category-chip-active': formData.categories.includes(category.name) }">
                  {{ category.name }}
                </button>

                <!-- Add Category Input or Button -->
                <div v-if="showCategoryInput" class="category-input-wrapper">
                  <input ref="categoryInput" v-model="newCategoryName" type="text" placeholder="New category"
                    @keyup.enter="addNewCategory" @keyup.esc="cancelNewCategory" class="category-input" />
                  <button type="button" @click="addNewCategory" class="category-input-btn add">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </button>
                  <button type="button" @click="cancelNewCategory" class="category-input-btn cancel">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <button v-else type="button" @click="openCategoryInput" class="category-chip category-chip-add">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                  </svg>
                  Add Category
                </button>
              </div>
            </div>

            <!-- Date Posted (Optional) -->
            <div class="form-group">
              <label class="form-label">Date Posted (Optional)</label>
              <input v-model="formData.datePosted" type="datetime-local" class="form-input" />
            </div>

            <!-- Author Name (Optional) -->
            <div class="form-group">
              <label class="form-label">Author Name (Optional)</label>
              <input v-model="formData.author" type="text" class="form-input" placeholder="Enter author name" />
            </div>

            <!-- Multiple Image Upload -->
            <div class="form-group">
              <label class="form-label">Images <span class="required">*</span></label>
              <div class="upload-area" @click="triggerFileInput" @dragover.prevent @drop.prevent="handleDrop">
                <input ref="fileInput" type="file" multiple accept="image/*" @change="handleFileSelect"
                  class="hidden" />
                <svg class="upload-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <p class="upload-text">Click to upload or drag and drop</p>
                <p class="upload-hint">PNG, JPG, GIF up to 10MB</p>
              </div>

              <!-- Image Previews -->
              <div v-if="imagePreviews.length > 0" class="image-previews">
                <div v-for="(preview, index) in imagePreviews" :key="index" class="image-preview">
                  <img :src="loadImage(preview)" alt="Preview" class="preview-image" />
                  <button type="button" @click="removeImage(index)" class="remove-image-btn">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
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
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, onMounted } from 'vue';
import { useToast } from 'vue-toast-notification';
import { useAuthStore } from '@/stores/auth';
import type { News, Category, CreateNewsPayload } from '@/api/models';
import { useAnnouncement } from '@/composables/useAnnouncement';

const announcement = useAnnouncement();

const toast = useToast();
const authStore = useAuthStore();

interface NewsItem {
  id: number;
  title: string;
  content: string;
  datePosted: string;
  images: string[];
  categories: string[];
  status: 'published' | 'draft' | 'archived';
  author?: string;
}

const showModal = ref(false);
const fileInput = ref<HTMLInputElement | null>(null);
const categoryInput = ref<HTMLInputElement | null>(null);
const imagePreviews = ref<string[]>([]);
const imageFiles = ref<File[]>([]);
const originalImages = ref<Array<{ fileName: string; oldFileName: string; file: string; isDeleted: boolean }>>([]);
const newsList = ref<NewsItem[]>([]);
const showCategoryInput = ref(false);
const newCategoryName = ref('');
const activeMenu = ref<number | null>(null);
const editingNewsId = ref<number | null>(null);
const isSubmitting = ref(false);
const isLoadingCategories = ref(false);

const formData = ref({
  title: '',
  content: '',
  datePosted: '',
  categories: [] as string[],
  author: '',
});

const availableCategories = ref<Array<{ id: number; name: string }>>([]);

// Fetch categories from API
const fetchCategories = async () => {
  try {
    isLoadingCategories.value = true;
    const response = await announcement.fetchCategories();

    if (response) {
      availableCategories.value = response;
    }
  } catch (error: unknown) {
    console.error('Failed to fetch categories:', error);
    const message = error instanceof Error ? error.message : 'Failed to load categories';
    toast.error(message);
  } finally {
    isLoadingCategories.value = false;
  }
};

// Fetch all news from API
const fetchNews = async () => {
  try {
    const newsData = await announcement.fetchNews();

    console.log('Fetched news data:', newsData);

    if (newsData) {
      // Map API response to local NewsItem format
      newsList.value = newsData.map((news: News) => ({
        id: news.id,
        title: news.title,
        content: news.content,
        datePosted: news.datePosted,
        images: news.images.map(img => img.fileName),
        categories: news.categories.map(cat => cat.name),
        status: news.status,
        author: news.authorName,
      }));
    }
  } catch (error: unknown) {
    console.error('Failed to fetch news:', error);
    const message = error instanceof Error ? error.message : 'Failed to load news';
    toast.error(message);
  }
};

const loadImage = (image: string) => {
  if (!image) return '';

  if (image.startsWith('data:')) {
    return image;
  }
  return import.meta.env.VITE_ASSETS_BASE_URL + '/' + image;
}

// Create new category
const createCategory = async (name: string): Promise<Category | null> => {
  try {
    const response = await announcement.createCategory({ name });

    if (response && response.success) {
      toast.success('Category created successfully');
      return response.data;
    }
    return null;
  } catch (error: unknown) {
    console.error('Failed to create category:', error);
    const message = error instanceof Error ? error.message : 'Failed to create category';
    toast.error(message);
    return null;
  }
};

// Load data on component mount
onMounted(() => {
  fetchCategories();
  fetchNews();
});

const isFormValid = computed(() => {
  const hasTitle = formData.value.title.trim() !== '';
  const hasContent = formData.value.content.trim() !== '';
  const hasCategories = formData.value.categories.length > 0;

  // For editing mode: allow submission if there are original images (even if being deleted) or new images
  // For create mode: require at least one new image
  const hasImages = editingNewsId.value !== null
    ? (originalImages.value.length > 0 || imageFiles.value.length > 0)
    : imageFiles.value.length > 0;

  return hasTitle && hasContent && hasCategories && hasImages;
});

const openModal = () => {
  editingNewsId.value = null;
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
    datePosted: '',
    categories: [],
    author: '',
  };
  imagePreviews.value = [];
  imageFiles.value = [];
  originalImages.value = [];
  showCategoryInput.value = false;
  newCategoryName.value = '';
  editingNewsId.value = null;
};

const toggleCategory = (categoryName: string) => {
  const index = formData.value.categories.indexOf(categoryName);
  if (index > -1) {
    formData.value.categories.splice(index, 1);
  } else {
    formData.value.categories.push(categoryName);
  }
};

const openCategoryInput = async () => {
  showCategoryInput.value = true;
  await nextTick();
  categoryInput.value?.focus();
};

const addNewCategory = async () => {
  const trimmedName = newCategoryName.value.trim();
  if (trimmedName && !availableCategories.value.some(cat => cat.name === trimmedName)) {
    const newCategory = await createCategory(trimmedName);
    if (newCategory) {
      availableCategories.value.push(newCategory);
      formData.value.categories.push(newCategory.name);
      newCategoryName.value = '';
      showCategoryInput.value = false;
    }
  }
};

const cancelNewCategory = () => {
  newCategoryName.value = '';
  showCategoryInput.value = false;
};

const triggerFileInput = () => {
  fileInput.value?.click();
};

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files) {
    addFiles(Array.from(target.files));
  }
};

const handleDrop = (event: DragEvent) => {
  const files = event.dataTransfer?.files;
  if (files) {
    addFiles(Array.from(files));
  }
};

const addFiles = (files: File[]) => {
  files.forEach(file => {
    if (file.type.startsWith('image/')) {
      // Store the actual File object
      imageFiles.value.push(file);

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        imagePreviews.value.push(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  });
};

const removeImage = (index: number) => {
  // Check if this is an original image (from editing mode)
  if (index < originalImages.value.length) {
    // Mark the original image as deleted instead of removing it
    const originalImage = originalImages.value[index];
    if (originalImage) {
      originalImage.isDeleted = true;
    }
    // Remove from previews
    imagePreviews.value.splice(index, 1);
  } else {
    // This is a newly added image, remove from both arrays
    const newImageIndex = index - originalImages.value.length;
    imagePreviews.value.splice(index, 1);
    imageFiles.value.splice(newImageIndex, 1);
  }
};

const handleSubmit = async (status: 'published' | 'draft' | 'archived') => {
  if (!isFormValid.value || isSubmitting.value) return;

  isSubmitting.value = true;

  try {
    // Get author name from form or user data
    const authorName = formData.value.author ||
      (authStore.user ? `${authStore.user.firstName} ${authStore.user.lastName || ''}`.trim() : 'Unknown Author');
    const authorId = authStore.user?.id || 0;

    // Ensure at least one category is selected
    if (formData.value.categories.length === 0) {
      toast.error('Please select at least one category');
      isSubmitting.value = false;
      return;
    }

    // Get the category IDs from the selected category names
    const categoryIds = formData.value.categories
      .map(categoryName => {
        const cat = availableCategories.value.find(c => c.name === categoryName);
        return cat?.id;
      })
      .filter((id): id is number => id !== undefined);

    if (categoryIds.length === 0) {
      toast.error('Invalid categories selected');
      isSubmitting.value = false;
      return;
    }

    // Prepare payload
    const payload: CreateNewsPayload = {
      title: formData.value.title,
      content: formData.value.content,
      category_ids: categoryIds,
      author_id: authorId,
      author_name: authorName,
      status,
      images: imageFiles.value,
    };

    if (formData.value.datePosted) {
      payload.date_posted = toServerDatetime(formData.value.datePosted);
    }

    // If editing, include old_images array for tracking changes
    if (editingNewsId.value !== null && originalImages.value.length > 0) {
      payload.old_images = originalImages.value.map(img => ({
        file_name: img.fileName,
        old_file_name: img.oldFileName,
        file: img.file,
        is_deleted: img.isDeleted
      }));
    }

    if (editingNewsId.value !== null) {
      // Update existing news
      const response = await announcement.updateNews(editingNewsId.value, payload);

      if (response && response.success) {
        toast.success('News updated successfully');
        await fetchNews(); // Refresh the list
        closeModal();
      }
    } else {
      // Create new news
      const response = await announcement.createNews(payload);

      if (response && response.success) {
        toast.success('News created successfully');
        await fetchNews(); // Refresh the list
        closeModal();
      }
    }
  } catch (error: unknown) {
    console.error('Failed to submit news:', error);
    const message = error instanceof Error ? error.message : 'Failed to save news';
    toast.error(message);
  } finally {
    isSubmitting.value = false;
  }
};

const toggleMenu = (newsId: number) => {
  activeMenu.value = activeMenu.value === newsId ? null : newsId;
};

const editNews = (news: NewsItem) => {
  editingNewsId.value = news.id;
  formData.value = {
    title: news.title,
    content: news.content,
    datePosted: toDatetimeLocal(news.datePosted),
    categories: [...news.categories],
    author: news.author || '',
  };

  // Load existing images as original images
  originalImages.value = news.images.map(imgUrl => ({
    fileName: imgUrl.split('/').pop() || imgUrl,
    oldFileName: imgUrl.split('/').pop() || imgUrl,
    file: imgUrl,
    isDeleted: false
  }));

  // Set previews from original images
  imagePreviews.value = [...news.images];

  // Clear new image files
  imageFiles.value = [];

  activeMenu.value = null;
  showModal.value = true;
};

const togglePublishStatus = async (newsId: number) => {
  try {
    const news = newsList.value.find(n => n.id === newsId);
    if (news) {
      const newStatus = news.status === 'published' ? 'archived' : 'published';
      const response = await announcement.updateNewsStatus(newsId, newStatus);

      if (response && response.success) {
        toast.success(`News ${newStatus} successfully`);
        await fetchNews(); // Refresh the list
      }
    }
  } catch (error: unknown) {
    console.error('Failed to update news status:', error);
    const message = error instanceof Error ? error.message : 'Failed to update news status';
    toast.error(message);
  } finally {
    activeMenu.value = null;
  }
};

const deleteNews = async (newsId: number) => {
  if (!confirm('Are you sure you want to delete this news?')) {
    activeMenu.value = null;
    return;
  }

  try {
    const response = await announcement.deleteNews(newsId);
    if (response && response.success) {
      toast.success('News deleted successfully');
      await fetchNews(); // Refresh the list
    }
  } catch (error: unknown) {
    console.error('Failed to delete news:', error);
    const message = error instanceof Error ? error.message : 'Failed to delete news';
    toast.error(message);
  } finally {
    activeMenu.value = null;
  }
};

const formatDate = (dateString: string) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Convert server date format to datetime-local input format
const toDatetimeLocal = (dateString: string) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

// Convert datetime-local input to server format (YYYY-MM-DD HH:mm:ss)
const toServerDatetime = (datetimeLocal: string) => {
  if (!datetimeLocal) return '';
  const date = new Date(datetimeLocal);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};
</script>

<style scoped>
/* Masonry Grid */
.masonry-grid {
  column-count: 3;
  column-gap: 1.5rem;
  margin-top: 1.5rem;
}

@media (max-width: 1024px) {
  .masonry-grid {
    column-count: 2;
  }
}

@media (max-width: 640px) {
  .masonry-grid {
    column-count: 1;
  }
}

.masonry-item {
  break-inside: avoid;
  margin-bottom: 1.5rem;
}

/* News Card */
.news-card {
  background: white;
  border-radius: 0.75rem;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  border: 1px solid #e5e7eb;
}

.news-card:hover {
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.news-image-container {
  position: relative;
  width: 100%;
  overflow: hidden;
}

.news-image {
  width: 100%;
  height: auto;
  display: block;
  object-fit: cover;
}

.image-count-badge {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  background: rgba(0, 0, 0, 0.75);
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.875rem;
  font-weight: 600;
  backdrop-filter: blur(8px);
}

.news-status-badge {
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

.news-content {
  padding: 1rem;
}

.news-header-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.75rem;
}

.news-categories {
  display: flex;
  flex-wrap: wrap;
  gap: 0.375rem;
  flex: 1;
}

.category-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  background: #eef2ff;
  color: #4f46e5;
  font-size: 0.75rem;
  font-weight: 600;
  border-radius: 9999px;
  text-transform: uppercase;
}

.news-title {
  font-size: 1.125rem;
  font-weight: 700;
  color: #111827;
  margin-bottom: 0.5rem;
  line-height: 1.3;
}

.news-text {
  color: #6b7280;
  line-height: 1.5;
  margin-bottom: 0.75rem;
  display: -webkit-box;
  font-size: 0.7rem;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.news-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 0.75rem;
  border-top: 1px solid #e5e7eb;
}

.news-date {
  font-size: 0.875rem;
  color: #9ca3af;
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
  font-size: 1.5rem;
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

/* Categories */
.categories-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.category-chip {
  padding: 0.5rem 1rem;
  border: 2px solid #e5e7eb;
  background: white;
  color: #6b7280;
  font-size: 0.875rem;
  font-weight: 500;
  border-radius: 9999px;
  cursor: pointer;
  transition: all 0.2s;
}

.category-chip:hover {
  border-color: #4f46e5;
  background: #f0f4ff;
  color: #4f46e5;
}

.category-chip-active {
  border-color: #4f46e5;
  background: #4f46e5;
  color: white;
}

.category-chip-active:hover {
  background: #4338ca;
  border-color: #4338ca;
}

.category-chip-add {
  border-color: #d1d5db;
  border-style: dashed;
  color: #9ca3af;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.category-chip-add:hover {
  border-color: #4f46e5;
  background: #f9fafb;
  color: #4f46e5;
  border-style: dashed;
}

.category-input-wrapper {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem;
  border: 2px solid #4f46e5;
  border-radius: 9999px;
  background: white;
}

.category-input {
  border: none;
  outline: none;
  padding: 0.25rem 0.75rem;
  font-size: 0.875rem;
  min-width: 120px;
  background: transparent;
}

.category-input-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.75rem;
  height: 1.75rem;
  border-radius: 9999px;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
}

.category-input-btn.add {
  background: #10b981;
  color: white;
}

.category-input-btn.add:hover {
  background: #059669;
}

.category-input-btn.cancel {
  background: #ef4444;
  color: white;
}

.category-input-btn.cancel:hover {
  background: #dc2626;
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

/* Image Previews */
.image-previews {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 0.75rem;
  margin-top: 1rem;
}

.image-preview {
  position: relative;
  aspect-ratio: 1;
  border-radius: 0.5rem;
  overflow: hidden;
  border: 2px solid #e5e7eb;
}

.preview-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.remove-image-btn {
  position: absolute;
  top: 0.25rem;
  right: 0.25rem;
  background: rgba(0, 0, 0, 0.75);
  color: white;
  border: none;
  border-radius: 9999px;
  padding: 0.25rem;
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
</style>
