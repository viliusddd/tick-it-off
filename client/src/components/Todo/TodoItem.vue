<template>
  <li
    class="group relative flex justify-between rounded-md p-3 transition duration-300 ease-in-out hover:bg-gray-100 dark:hover:bg-gray-900"
    :class="{'hover:bg-surface-hover': true}"
  >
    <div class="flex items-center gap-2">
      <Checkbox
        :modelValue="isCompletedLocal"
        @change="toggleTodo()"
        class="h-5 w-5"
        :binary="true"
      />
      <div
        :class="[
          'flex items-center gap-2 break-all',
          {
            'line-through': isCompletedLocal,
            'text-gray-400': isCompletedLocal
          }
        ]"
      >
        {{ todo.title }}
        <SharedByMeIndicator v-if="isLocalShared" />
      </div>
      <Tag v-if="todo.owner" severity="info"> {{ todo.owner }} </Tag>
    </div>

    <div class="flex items-center space-x-2 opacity-0 transition-opacity group-hover:opacity-100">
      <!-- Unshare button for shared items -->
      <UnshareButton v-if="props.isShared" @confirm="unshareItem" />

      <!-- Edit/Share button for own items -->
      <EditTodoButton
        v-if="!props.isShared"
        :todoId="todo.id"
        :todoTitle="todo.title"
        :isShared="isLocalShared"
        @share-status-changed="updateShareStatus"
        @title-updated="updateTitle"
      />

      <!-- Delete button - disabled for shared items -->
      <TodoItemDelete @confirm="confirmDelete" :disabled="props.isShared" />
    </div>
  </li>
</template>

<script setup lang="ts">
import {ref, watch} from 'vue'
import {trpc} from '@/trpc'
import {useUserStore} from '@/stores/userStore'
import {Checkbox, Tag} from 'primevue'
import SharedByMeIndicator from './TodoItem/SharedByMeIndicator.vue'
import TodoItemDelete from './TodoItem/TodoItemDelete.vue'
import EditTodoButton from './TodoItemEdit.vue'
import UnshareButton from './TodoItem/UnshareButton.vue'

const userStore = useUserStore()

const emit = defineEmits(['toggled', 'deleted', 'unshared', 'title-updated'])

const props = defineProps<{
  todo: {
    id: number
    title: string
    isCompleted?: boolean
    owner?: string
    isSharedByMe?: boolean
  }
  isShared?: boolean
}>()

// Local state to track sharing status that can be updated immediately
const isLocalShared = ref(props.todo.isSharedByMe || false)
// Local state to track completion status
const isCompletedLocal = ref(props.todo.isCompleted || false)

// Watch for changes in the todo prop's isSharedByMe property
watch(
  () => props.todo.isSharedByMe,
  newValue => {
    if (newValue !== undefined) {
      isLocalShared.value = newValue
    }
  }
)

// Watch for changes in the todo prop's isCompleted property
watch(
  () => props.todo.isCompleted,
  newValue => {
    if (newValue !== undefined) {
      isCompletedLocal.value = newValue
    }
  }
)

const confirmDelete = async () => {
  if (props.isShared) return // Don't allow deletion of shared items

  try {
    await trpc.todo.deleteById.mutate({id: props.todo.id})
    emit('deleted', props.todo.id)
  } catch (error) {
    console.error('Error deleting todo:', error)
  }
}

const toggleTodo = async () => {
  // Update local state immediately for responsive UI
  isCompletedLocal.value = !isCompletedLocal.value

  try {
    await trpc.completion.toggle.mutate({
      todoId: props.todo.id,
      date: userStore.currentDate.toLocaleDateString('lt')
    })
    // Emit event with updated state
    emit('toggled', {id: props.todo.id, isCompleted: isCompletedLocal.value})
  } catch (error) {
    console.error('Error toggling todo:', error)
    // Revert local state if API call fails
    isCompletedLocal.value = !isCompletedLocal.value
  }
}

const unshareItem = async () => {
  if (!props.isShared) return

  try {
    // Improved error handling with specific error message
    await trpc.todo.removeSharedWithMe.mutate({
      todoId: props.todo.id
    })

    // Emit unshared event to remove the item from the list
    emit('unshared', props.todo.id)
  } catch (error) {
    console.error('Error unsharing todo:', error)
  }
}

const updateShareStatus = (isShared: boolean) => {
  // Update local state immediately when sharing status changes
  isLocalShared.value = isShared
  // Also update the parent's data by emitting an event
  emit('title-updated', {
    id: props.todo.id,
    title: props.todo.title,
    isSharedByMe: isShared
  })
}

const updateTitle = (newTitle: string) => {
  // Emit event to update title in parent component
  emit('title-updated', {
    id: props.todo.id,
    title: newTitle,
    isSharedByMe: isLocalShared.value
  })
}
</script>
