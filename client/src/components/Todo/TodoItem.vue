<template>
  <li
    class="group relative flex justify-between rounded-md p-3 transition duration-300 ease-in-out"
    :class="{'hover:bg-surface-hover': true}"
  >
    <div class="flex items-center gap-2">
      <Checkbox
        :modelValue="props.todo.isCompleted"
        @change="toggleTodo()"
        class="h-5 w-5"
        :binary="true"
      />
      <div
        :class="[
          'flex items-center gap-2',
          {
            'line-through': props.todo.isCompleted,
            'text-gray-400': props.todo.isCompleted
          }
        ]"
      >
        {{ todo.title }}
        <SharedByMeIndicator v-if="!isLocalShared" />
        <Tag v-if="props.isShared && todo.owner" severity="info" class="ml-2">
          {{ todo.owner }}
        </Tag>
      </div>
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
      <ConfirmDeleteButton @confirm="confirmDelete" :disabled="props.isShared" />
    </div>
  </li>
</template>

<script setup lang="ts">
import ConfirmDeleteButton from './ConfirmDeleteButton.vue'
import EditTodoButton from './EditTodoButton.vue'
import UnshareButton from './UnshareButton.vue'
import {useUserStore} from '@/stores/userStore'
import {trpc} from '@/trpc'
import {ref} from 'vue'
import Checkbox from 'primevue/checkbox'
import Tag from 'primevue/tag'
import SharedByMeIndicator from './SharedByMeIndicator.vue'

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
  await trpc.completion.toggle.mutate({
    todoId: props.todo.id,
    date: userStore.currentDate.toLocaleDateString('lt')
  })
  emit('toggled', props.todo.id)
}

const unshareItem = async () => {
  if (!props.isShared) return

  try {
    await trpc.todo.removeSharedWithMe.mutate({
      todoId: props.todo.id
    })
    emit('unshared', props.todo.id)
  } catch (error) {
    console.error('Error unsharing todo:', error)
  }
}

const updateShareStatus = (isShared: boolean) => {
  // Update local state immediately when sharing status changes
  isLocalShared.value = isShared
}

const updateTitle = (newTitle: string) => {
  // Emit event to update title in parent component
  emit('title-updated', {id: props.todo.id, title: newTitle})
}
</script>
