<template>
  <div class="space-y-8">
    <div>
      <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">Level Management</h2>
      <p class="text-gray-600 dark:text-gray-400">Manage academic levels and their rankings</p>
    </div>

    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
      <div class="p-6 border-b border-gray-200 dark:border-gray-700">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Levels</h3>
          <div class="flex items-center space-x-3">
            <div class="relative">
              <i class="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm"></i>
              <input type="text" v-model="searchQuery" placeholder="Search levels..."
                class="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            </div>
            <button @click="showModal = true"
              class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer whitespace-nowrap">
              <i class="fas fa-plus mr-2"></i>Add Level
            </button>
          </div>
        </div>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Rank
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Level Name
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            <tr v-if="filteredLevels.length === 0">
              <td colspan="3" class="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                {{ searchQuery ? 'No levels found matching your search' : 
                'No levels created yet. Click "Add Level" to start.' }}
              </td>
            </tr>
            <tr v-for="level in filteredLevels" :key="level.id"
              class="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div class="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900">
                    <span class="text-sm font-bold text-blue-600 dark:text-blue-300">{{ level.rank }}</span>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900 dark:text-white">{{ level.name }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button @click="openEditModal(level)"
                  class="text-blue-600 hover:text-blue-900 dark:hover:text-blue-400 mr-3 cursor-pointer transition">
                  <i class="fas fa-edit mr-1"></i>Edit
                </button>
                <button @click="deleteLevel(level.id)"
                  class="text-red-600 hover:text-red-900 dark:hover:text-red-400 cursor-pointer transition">
                  <i class="fas fa-trash mr-1"></i>Delete
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Add/Edit Level Modal -->
    <div v-if="showModal" @click="closeModal"
      class="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-40">
      <div @click.stop class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 w-full max-w-md">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
            {{ isEditing ? 'Edit Level' : 'Add New Level' }}
          </h3>
          <button @click="closeModal" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <i class="fas fa-times text-xl"></i>
          </button>
        </div>

        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Level Name</label>
            <input v-model="newLevel.name" type="text" placeholder="Enter level name (e.g., Beginner, Intermediate)"
              required
              class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Rank</label>
            <input v-model.number="newLevel.rank" type="number" min="1" placeholder="Enter rank (1, 2, 3...)" required
              class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">Lower rank numbers appear first</p>
          </div>
        </div>

        <div class="flex gap-3 mt-6">
          <button @click="closeModal"
            class="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 font-medium transition-colors">
            Cancel
          </button>
          <button @click="isEditing ? updateLevel() : addLevel()" :disabled="isLoading"
            class="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg cursor-pointer font-medium transition-colors flex items-center justify-center gap-2">
            <i v-if="isLoading" class="fas fa-spinner fa-spin"></i>
            {{ isLoading ? (isEditing ? 'Updating...' : 'Adding...') : (isEditing ? 'Update Level' : 'Add Level') }}
          </button>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" @click="showDeleteModal = false"
      class="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-40">
      <div @click.stop class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 w-full max-w-sm">
        <div class="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 dark:bg-red-900 mb-4">
          <i class="fas fa-trash text-red-600 dark:text-red-400 text-lg"></i>
        </div>
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">Delete Level</h3>
        <p class="text-gray-600 dark:text-gray-300 mb-6">Are you sure you want to delete this level? This action cannot
          be undone.</p>
        <div class="flex gap-3">
          <button @click="showDeleteModal = false"
            class="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 font-medium transition-colors">
            Cancel
          </button>
          <button @click="confirmDelete" :disabled="isLoading"
            class="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-lg cursor-pointer font-medium transition-colors flex items-center justify-center gap-2">
            <i v-if="isLoading" class="fas fa-spinner fa-spin"></i>
            {{ isLoading ? 'Deleting...' : 'Delete' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useToast } from 'vue-toast-notification'
import type { Level } from '@/api/models'
import { levelService } from '@/api/services/serviceFactory'

const $toast = useToast()

const showModal = ref(false)
const showDeleteModal = ref(false)
const levelList = ref<Level[]>([])
const isLoading = ref(false)
const isEditing = ref(false)
const editingLevelId = ref<number | null>(null)
const searchQuery = ref('')
const newLevel = ref({
  name: '',
  rank: 1
})

const filteredLevels = computed(() => {
  if (!searchQuery.value.trim()) {
    return levelList.value
  }
  const query = searchQuery.value.toLowerCase()
  return levelList.value.filter(level =>
    level.name.toLowerCase().includes(query) ||
    level.rank.toString().includes(query)
  )
})

const fetchLevels = async () => {
  try {
    const response = await levelService.get()

    if (response && response.data && Array.isArray(response.data)) {
      levelList.value = response.data
        .map((levelData: Level) => ({
          id: levelData.id,
          name: levelData.name,
          rank: levelData.rank
        }))
        .sort((a, b) => a.rank - b.rank)
    }
  } catch (e) {
    console.error('Error fetching levels:', e)
    $toast.error('Failed to load levels')
  }
}

onMounted(() => {
  fetchLevels()
})

const closeModal = () => {
  showModal.value = false
  isEditing.value = false
  editingLevelId.value = null
  newLevel.value = { name: '', rank: 1 }
}

const openEditModal = (level: Level) => {
  isEditing.value = true
  editingLevelId.value = level.id
  newLevel.value = {
    name: level.name,
    rank: level.rank
  }
  showModal.value = true
}

const addLevel = async () => {
  if (!newLevel.value.name.trim()) {
    $toast.warning('Please enter a level name')
    return
  }

  if (!newLevel.value.rank || newLevel.value.rank < 1) {
    $toast.warning('Please enter a valid rank (1 or higher)')
    return
  }

  isLoading.value = true

  try {
    const response = await levelService.post(undefined, {
      name: newLevel.value.name,
      rank: newLevel.value.rank
    })

    if (response.success) {
      $toast.success(response.message || 'Level added successfully')
      closeModal()
      await fetchLevels()
    } else {
      $toast.error(response.message || 'Failed to add level')
    }
  } catch (e) {
    console.error('Error adding level:', e)
    $toast.error('Failed to add level')
  } finally {
    isLoading.value = false
  }
}

const updateLevel = async () => {
  if (!newLevel.value.name.trim()) {
    $toast.warning('Please enter a level name')
    return
  }

  if (!newLevel.value.rank || newLevel.value.rank < 1) {
    $toast.warning('Please enter a valid rank (1 or higher)')
    return
  }

  if (!editingLevelId.value) {
    $toast.error('Level ID is missing')
    return
  }

  isLoading.value = true

  try {
    const response = await levelService.put(`${editingLevelId.value}`, {
      name: newLevel.value.name,
      rank: newLevel.value.rank
    })

    if (response.success) {
      $toast.success(response.message || 'Level updated successfully')
      closeModal()
      await fetchLevels()
    } else {
      $toast.error(response.message || 'Failed to update level')
    }
  } catch (e) {
    console.error('Error updating level:', e)
    $toast.error('Failed to update level')
  } finally {
    isLoading.value = false
  }
}

const deleteLevel = (levelId: number) => {
  editingLevelId.value = levelId
  showDeleteModal.value = true
}

const confirmDelete = async () => {
  if (!editingLevelId.value) {
    $toast.error('Level ID is missing')
    return
  }

  isLoading.value = true

  try {
    const response = await levelService.delete(`${editingLevelId.value}`)
    console.log('Delete response:', response)
    if (response.success) {
      $toast.success(response.message || 'Level deleted successfully')
      showDeleteModal.value = false
      editingLevelId.value = null
      await fetchLevels()
    } else {
      $toast.error(response.message || 'Failed to delete level')
    }
  } catch (e: unknown) {
    const error = e as { response?: { status?: number; data?: { message?: string } }; message?: string };
    console.error('Error deleting level:', error)
    console.error('Error details:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    })
    $toast.error(error.response?.data?.message || 'Failed to delete level')
  } finally {
    isLoading.value = false
  }
}
</script>
