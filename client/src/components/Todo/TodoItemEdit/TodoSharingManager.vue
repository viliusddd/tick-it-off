<template>
  <div>
    <div class="mb-2 mt-6 flex items-center">
      <h4 class="text-md font-medium">Share with friends</h4>
    </div>

    <div v-if="isLoading" class="flex justify-center">
      <ProgressSpinner style="width: 50px; height: 50px" />
    </div>
    <div v-else-if="error" class="mb-4 text-red-500">
      {{ error }}
    </div>
    <div v-else-if="friends.length === 0" class="mb-4 text-gray-500">
      No friends found to share with. Add friends in the Users page.
    </div>
    <div v-else class="mb-4 max-h-60 overflow-y-auto">
      <div
        v-for="friend in friends"
        :key="friend.id"
        class="flex cursor-pointer items-center rounded px-3 py-2 hover:bg-gray-100"
        @click="confirmShareAction(friend)"
      >
        <div class="flex-1">
          <div class="font-medium">{{ friend.firstName }} {{ friend.lastName }}</div>
          <div class="text-sm text-gray-500">{{ friend.email }}</div>
        </div>
        <div v-if="sharedWithIds.includes(friend.id)" class="text-green-500">
          <CheckIcon class="h-5 w-5" />
        </div>
      </div>
    </div>

    <Dialog
      v-model:visible="showConfirmation"
      modal
      :header="confirmationAction === 'share' ? 'Share with friend' : 'Unshare todo'"
      :style="{width: '90%', maxWidth: '450px'}"
      :dismissableMask="true"
    >
      <p class="mb-4">
        {{
          confirmationAction === 'share'
            ? `Are you sure you want to share this todo with ${selectedUser?.firstName} ${selectedUser?.lastName}?`
            : `Are you sure you want to stop sharing this todo with ${selectedUser?.firstName} ${selectedUser?.lastName}?`
        }}
      </p>

      <template #footer>
        <Button label="Cancel" class="p-button-text" @click="showConfirmation = false" />
        <Button
          :label="confirmationAction === 'share' ? 'Share' : 'Unshare'"
          :class="confirmationAction === 'share' ? 'p-button-primary' : 'p-button-danger'"
          @click="confirmAction"
        />
      </template>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import {ref, onMounted} from 'vue'
import {trpc} from '@/trpc'
import {useUserStore} from '@/stores/userStore'
import {Button, Dialog, ProgressSpinner} from 'primevue'
import {CheckIcon} from '@heroicons/vue/24/solid'

const props = defineProps<{
  todoId: number
  isSharedWithOthers: boolean
}>()

const emit = defineEmits(['share-status-changed'])

const userStore = useUserStore()
const users = ref<{id: number; firstName: string; lastName: string; email: string}[]>([])
const friends = ref<{id: number; firstName: string; lastName: string; email: string}[]>([])
const isLoading = ref(false)
const error = ref('')
const sharedWithIds = ref<number[]>([])

// Confirmation dialog
const showConfirmation = ref(false)
const selectedUser = ref<{id: number; firstName: string; lastName: string; email: string} | null>(
  null
)
const confirmationAction = ref<'share' | 'unshare'>('share')

// Initialize shared status immediately and load shared users
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

    // Get user relationships to filter for friends
    const relationships = await trpc.userRelationship.findAllWithUsers.query()

    // Filter users to only include friends
    const friendIds = relationships
      .filter(rel => rel.useraId === userStore.authUserId)
      .map(rel => rel.userbId)

    friends.value = users.value.filter(user => friendIds.includes(user.id))

    if (friends.value.length === 0 && users.value.length > 0) {
      error.value = 'You need to add friends before sharing todos.'
    }
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

    // Emit event to parent to sync the status
    emit('share-status-changed', sharedWithIds.value.length > 0)
  } catch (err) {
    console.error('Error loading shared users:', err)
  }
}

const confirmShareAction = (user: {
  id: number
  firstName: string
  lastName: string
  email: string
}) => {
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

    // Always emit event to parent with current sharing status
    emit('share-status-changed', sharedWithIds.value.length > 0)
  } catch (err) {
    console.error('Error unsharing todo:', err)
    error.value = 'Failed to unshare todo'
  } finally {
    isLoading.value = false
  }
}
</script>
