<template>
  <li
    class="relative flex items-center space-x-3 rounded-md bg-gray-50 p-3 transition duration-300 ease-in-out hover:bg-gray-100"
  >
    <input
      type="checkbox"
      :checked="props.todo.isCompleted"
      @change="toggleTodo()"
      class="h-5 w-5 cursor-pointer rounded text-blue-600"
    />
    <span
      :class="[
        'flex-grow',
        {
          'line-through': props.todo.isCompleted,
          'text-gray-400': props.todo.isCompleted,
          'text-gray-800': !props.todo.isCompleted
        }
      ]"
    >
      {{ todo.title }}
    </span>
    <ConfirmDeleteButton @confirm="confirmDelete" />
  </li>
</template>

<script setup lang="ts">
import ConfirmDeleteButton from './ConfirmDeleteButton.vue'
import {useUserStore} from '@/stores/userStore'
import {trpc} from '@/trpc'
import {ref} from 'vue'

const userStore = useUserStore()

const emit = defineEmits(['toggled', 'deleted'])

const props = defineProps<{
  todo: {
    id: number
    title: string
    isCompleted?: boolean
  }
}>()

const showConfirm = ref(false)

const confirmDelete = async () => {
  try {
    await trpc.todo.deleteById.mutate({id: props.todo.id})
    emit('deleted', props.todo.id)
  } catch (error) {
    console.error('Error deleting todo:', error)
  } finally {
    showConfirm.value = false
  }
}

const toggleTodo = async () => {
  await trpc.completion.toggle.mutate({
    todoId: props.todo.id,
    date: userStore.currentDate.toLocaleDateString('lt')
  })
  emit('toggled', props.todo.id)
}
</script>
