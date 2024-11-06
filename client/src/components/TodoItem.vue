<template>
  <li
    :class="[
      'flex items-center space-x-3 rounded-md p-3 transition duration-300 ease-in-out',
      isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-50 hover:bg-gray-100',
    ]"
  >
    <input
      type="checkbox"
      :checked="todo.isCompleted"
      @change="$emit('toggle', todo.id)"
      :class="[
        'h-5 w-5 rounded focus:ring-2 focus:ring-offset-2',
        isDarkMode ? 'text-blue-500 focus:ring-blue-600' : 'text-blue-600 focus:ring-blue-500',
      ]"
    />
    <span
      :class="[
        'flex-grow',
        {
          'line-through': todo.isCompleted,
          'text-gray-400': todo.isCompleted && isDarkMode,
          'text-gray-500': todo.isCompleted && !isDarkMode,
          'text-white': !todo.isCompleted && isDarkMode,
          'text-gray-800': !todo.isCompleted && !isDarkMode,
        },
      ]"
    >
      {{ todo.title }}
    </span>
    <button
      @click="$emit('delete', todo.id)"
      :class="[
        'focus:outline-none focus:ring-2 focus:ring-offset-2',
        isDarkMode
          ? 'text-red-400 hover:text-red-300 focus:ring-red-500'
          : 'text-red-500 hover:text-red-600 focus:ring-red-500',
      ]"
    >
      <TrashIcon class="h-5 w-5" />
    </button>
  </li>
</template>

<script setup lang="ts">
import { TrashIcon } from '@heroicons/vue/24/solid'

defineProps<{
  todo: {
    id: number
    title: string
    isCompleted?: boolean
  }
  isDarkMode: boolean
}>()

defineEmits<{
  (e: 'toggle', id: number): void
  (e: 'delete', id: number): void
}>()
</script>
