<template>
  <div>
    <div class="mb-2 mt-6 flex items-center">
      <h4 class="text-md font-medium">Share with others</h4>
    </div>

    <div v-if="isLoading" class="flex justify-center">
      <ProgressSpinner style="width: 40px; height: 40px" />
    </div>
    <div v-else-if="error" class="mb-4 text-red-500">
      {{ error }}
    </div>
    <div v-else-if="users.length === 0" class="mb-4 text-gray-500">
      No users found to share with.
    </div>
    <div v-else class="mb-4 max-h-60 overflow-y-auto">
      <div
        v-for="user in users"
        :key="user.id"
        class="flex cursor-pointer items-center rounded px-3 py-2 hover:bg-gray-100"
        @click="confirmShareAction(user)"
      >
        <div class="flex-1">
          <div class="font-medium">{{ user.firstName }} {{ user.lastName }}</div>
          <div class="text-sm text-gray-500">{{ user.email }}</div>
        </div>
        <div v-if="sharedWithIds.includes(user.id)" class="text-green-500">
          <CheckIcon class="h-5 w-5" />
        </div>
      </div>
    </div>

    <ShareConfirmDialog
      v-model:visible="showConfirmation"
      :user="selectedUser"
      :action="confirmationAction"
      @confirm="confirmAction"
    />
  </div>
</template>

<script setup lang="ts">
import {ref, onMounted} from 'vue'
import {trpc} from '@/trpc'
import {useUserStore} from '@/stores/userStore'
import {ProgressSpinner} from 'primevue'
import {CheckIcon} from '@heroicons/vue/24/solid'
import ShareConfirmDialog from './ShareConfirmDialog.vue'

interface User {
  id: number
  firstName: string
  lastName: string
  email: string
}

const props = defineProps<{
  todoId: number
}>()

const emit = defineEmits(['share-status-changed', 'loading', 'error'])

const userStore = useUserStore()
const users = ref<User[]>([])
const isLoading = ref(false)
const error = ref('')
const sharedWithIds = ref<number[]>([])

// Confirmation dialog
const showConfirmation = ref(false)
const selectedUser = ref<User | null>(null)
const confirmationAction = ref<'share' | 'unshare'>('share')

onMounted(async () => {
  await loadUsers()
  await loadSharedUsers()
})

const loadUsers = async () => {
  try {
    isLoading.value = true
    error.value = ''

    // Get all users except current user
    const allUsers = await trpc.user.findAll.query()
    users.value = allUsers.filter(user => user.id !== userStore.authUserId)
  } catch (err) {
    console.error('Error loading users:', err)
    error.value = 'Failed to load users'
  } finally {
    isLoading.value = false
  }
}

const loadSharedUsers = async () => {
  try {
    // Get users who this todo is shared with
    const sharedUsers = await trpc.todo.getSharedUsers.query({todoId: props.todoId})
    sharedWithIds.value = sharedUsers.map(share => share.userId)
  } catch (err) {
    console.error('Error loading shared users:', err)
  }
}

const confirmShareAction = (user: User) => {
  selectedUser.value = user
  confirmationAction.value = sharedWithIds.value.includes(user.id) ? 'unshare' : 'share'
  showConfirmation.value = true
}

const confirmAction = async () => {
  if (!selectedUser.value) return

  if (confirmationAction.value === 'share') {
    await shareTodo(selectedUser.value.id)
  } else {
    await unshareTodo(selectedUser.value.id)
  }

  showConfirmation.value = false
  selectedUser.value = null
}

const shareTodo = async (userId: number) => {
  try {
    isLoading.value = true
    error.value = ''

    // Share
    await trpc.todo.share.mutate({
      todoId: props.todoId,
      userId
    })

    // Update local state
    sharedWithIds.value.push(userId)

    // Emit event to parent
    emit('share-status-changed', true)
  } catch (err) {
    console.error('Error sharing todo:', err)
    error.value = 'Failed to share todo'
  } finally {
    isLoading.value = false
  }
}

const unshareTodo = async (userId: number) => {
  try {
    isLoading.value = true
    error.value = ''

    // Unshare
    await trpc.todo.unshare.mutate({
      todoId: props.todoId,
      userId
    })

    // Update local state
    sharedWithIds.value = sharedWithIds.value.filter(id => id !== userId)

    // Emit event to parent when no longer shared with anyone
    if (sharedWithIds.value.length === 0) {
      emit('share-status-changed', false)
    }
  } catch (err) {
    console.error('Error unsharing todo:', err)
    error.value = 'Failed to unshare todo'
  } finally {
    isLoading.value = false
  }
}
</script>
