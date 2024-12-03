<template>
  <li
    class="flex items-center space-x-3 rounded-md bg-gray-50 p-3 transition duration-300 ease-in-out hover:bg-gray-100"
  >
    <input
      type="checkbox"
      v-model="props.todo.isCompleted"
      @change="toggleTodo()"
      class="h-5 w-5 rounded text-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
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
    <button
      @click="deleteTodo()"
      class="text-red-500 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
    >
      <TrashIcon class="h-5 w-5" />
    </button>
  </li>
</template>

<script setup lang="ts">
import {TrashIcon} from '@heroicons/vue/24/solid'
import {useUserStore} from '@/stores/userStore'
import {trpc} from '@/trpc'

const userStore = useUserStore()

const props = defineProps<{
  todo: {
    id: number
    title: string
    isCompleted?: boolean
  }
}>()

const deleteTodo = async () => {
  try {
    await trpc.todo.deleteById.mutate({id: props.todo.id})
  } catch (error) {
    console.error('Error deleting todo:', error)
  }
}

const toggleTodo = async () => {
  await trpc.completion.toggle.mutate({
    todoId: props.todo.id,
    date: userStore.currentDate.toLocaleDateString('lt')
  })
}
</script>
