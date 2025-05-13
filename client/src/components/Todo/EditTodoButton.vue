<template>
  <span ref="rootEl">
    <button
      @click="toggleModal"
      class="text-blue-500 hover:text-blue-600 focus:outline-none"
      :title="isSharedWithOthers ? 'Edit or manage sharing' : 'Edit or share with others'"
    >
      <PencilSquareIcon class="h-5 w-5" />
    </button>

    <Dialog
      v-model:visible="showModal"
      modal
      header="Edit Todo Item"
      :style="{width: '90%', maxWidth: '500px'}"
      :dismissableMask="true"
    >
      <div v-if="isLoading" class="flex justify-center">
        <ProgressSpinner style="width: 50px; height: 50px" />
      </div>
      <div v-else-if="error" class="mb-4 text-red-500">
        {{ error }}
      </div>
      <div v-else>
        <div class="mb-4">
          <Form
            v-slot="$form"
            :resolver="zodResolver(todoSchema)"
            :initialValues="{title: props.todoTitle}"
            :validateOnBlur="true"
          >
            <div>{{ $form }}</div>
            <label for="todoTitle" class="text-md mb-2 block font-medium">Change todo title</label>
            <div class="flex">
              <InputText
                name="todoTitle"
                type="text"
                placeholder="Todo title"
                v-model="editedTitle"
                class="mr-2 w-full"
                :resolver="zodResolver(todoSchema)"
              />
              <div class="h-6">
                <Message
                  v-if="$form.title?.invalid"
                  severity="error"
                  size="small"
                  variant="simple"
                  >{{ $form.title.error.message }}</Message
                >
              </div>
              <Button icon="pi pi-check" :disabled="!titleChanged" @click="updateTodoTitle" />
            </div>
          </Form>
        </div>

        <div class="mb-2 mt-6 flex items-center">
          <h4 class="text-md font-medium">Share with others</h4>
        </div>

        <div v-if="users.length === 0" class="mb-4 text-gray-500">
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
      </div>
    </Dialog>

    <Dialog
      v-model:visible="showConfirmation"
      modal
      :header="confirmationAction === 'share' ? 'Share with user' : 'Unshare todo'"
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
  </span>
</template>

<script setup lang="ts">
import {ref, computed, onMounted, onUnmounted, watch} from 'vue'
import {trpc} from '@/trpc'
import {useUserStore} from '@/stores/userStore'
import {Button, InputText, Dialog, ProgressSpinner} from 'primevue'
import {PencilSquareIcon, CheckIcon} from '@heroicons/vue/24/solid'

const props = defineProps<{
  todoId: number
  isShared?: boolean
  todoTitle: string
}>()

const emit = defineEmits(['share-status-changed', 'title-updated'])

const userStore = useUserStore()
const showModal = ref(false)
const editedTitle = ref(props.todoTitle || '')
const titleChanged = computed(() => editedTitle.value !== props.todoTitle)
const users = ref<{id: number; firstName: string; lastName: string; email: string}[]>([])
const isLoading = ref(false)
const error = ref('')
const sharedWithIds = ref<number[]>([])

// Confirmation dialog
const showConfirmation = ref(false)
const selectedUser = ref<{id: number; firstName: string; lastName: string; email: string} | null>(
  null
)
const confirmationAction = ref<'share' | 'unshare'>('share')

// Computed property to determine if todo is shared with anyone
const isSharedWithOthers = ref(false)

// Watch for changes to todoTitle prop to update the editedTitle
watch(
  () => props.todoTitle,
  newTitle => {
    editedTitle.value = newTitle
  }
)

// Initialize shared status immediately and load shared users
onMounted(async () => {
  // Load sharing status immediately
  await loadSharedUsers()

  // Set up event listeners
  document.addEventListener('mousedown', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('mousedown', handleClickOutside)
})

// Watch for changes to isShared prop
watch(
  () => props.isShared,
  newValue => {
    if (newValue !== undefined) {
      // Update component state immediately based on prop
      isSharedWithOthers.value = newValue === true

      // Refresh users list if dialog is open
      if (showModal.value) {
        loadUsers()
        loadSharedUsers()
      }
    }
  },
  {immediate: true} // Run immediately when component is created
)

const rootEl = ref<HTMLElement | null>(null)

function handleClickOutside(event: MouseEvent) {
  if (!showModal.value) return
  if (rootEl.value && !rootEl.value.contains(event.target as Node)) {
    // Don't close the modal when clicking outside since it's handled by Dialog
  }
}

const toggleModal = async () => {
  showModal.value = !showModal.value

  if (showModal.value) {
    editedTitle.value = props.todoTitle
    await loadUsers()
    await loadSharedUsers()
  }
}

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

    // Update the shared status based on whether there are any shared users
    isSharedWithOthers.value = sharedWithIds.value.length > 0

    // Emit event to parent to sync the status
    if (isSharedWithOthers.value !== (props.isShared === true)) {
      emit('share-status-changed', isSharedWithOthers.value)
    }
  } catch (err) {
    console.error('Error loading shared users:', err)
  }
}

const updateTodoTitle = async () => {
  if (!titleChanged.value) return

  try {
    isLoading.value = true
    error.value = ''

    await trpc.todo.update.mutate({
      id: props.todoId,
      title: editedTitle.value
    })

    emit('title-updated', editedTitle.value)
  } catch (err) {
    console.error('Error updating todo title:', err)
    error.value = 'Failed to update title'
  } finally {
    isLoading.value = false
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
