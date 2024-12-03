<template>
  <li
    class="flex items-center space-x-3 rounded-md bg-gray-50 p-3 transition duration-300 ease-in-out hover:bg-gray-100"
  >
    <input
      type="checkbox"
      :checked="todo.isCompleted"
      @change="$emit('toggle', todo.id)"
      class="h-5 w-5 rounded text-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
    />
    <span
      :class="[
        'flex-grow',
        {
          'line-through': todo.isCompleted,
          'text-gray-400': todo.isCompleted,
          'text-gray-800': !todo.isCompleted
        }
      ]"
    >
      {{ todo.title }}
    </span>
    <button
      @click="$emit('delete', todo.id)"
      class="text-red-500 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
    >
      <TrashIcon class="h-5 w-5" />
    </button>
  </li>
</template>

<script setup lang="ts">
import {TrashIcon} from '@heroicons/vue/24/solid'

defineProps<{
  todo: {
    id: number
    title: string
    isCompleted?: boolean
  }
}>()

defineEmits<{
  (e: 'toggle', id: number): void
  (e: 'delete', id: number): void
}>()
</script>
