<template>
  <li
    class="group relative flex items-center space-x-3 rounded-md p-3 transition duration-300 ease-in-out"
    :class="{'hover:bg-surface-hover': true}"
  >
    <Checkbox
      :modelValue="props.todo.isCompleted"
      @change="toggleTodo()"
      class="h-5 w-5"
      :binary="true"
    />
    <span
      :class="[
        'flex-grow',
        {
          'line-through': props.todo.isCompleted,
          'text-gray-400': props.todo.isCompleted
        }
      ]"
    >
      {{ todo.title }}
      <Tag v-if="props.isShared && todo.owner" severity="info" class="ml-2">
        {{ todo.owner }}
      </Tag>
    </span>

    <!-- Shared by me indicator -->
    <div v-if="isLocalShared && !props.isShared" class="mr-2 text-blue-500">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="1.5"
        stroke="currentColor"
        class="h-5 w-5"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935-2.186 2.25 2.25 0 0 0-3.935-2.186"
        />
      </svg>
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
