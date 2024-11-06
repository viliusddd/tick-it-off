<template>
  <div class="flex items-center">
    <input
      v-model="newTodo"
      @keyup.enter="addTodo"
      type="text"
      placeholder="Add a new task..."
      :class="[
        'flex-grow rounded-l-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500',
        isDarkMode
          ? 'bg-gray-700 text-white placeholder-gray-400'
          : 'border border-gray-300 bg-white',
      ]"
    />
    <button
      @click="addTodo"
      :class="[
        'rounded-r-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500',
        isDarkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600',
      ]"
    >
      Add
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  isDarkMode: boolean
}>()

const emit = defineEmits<{
  (e: 'addTodo', title: string): void
}>()

const newTodo = ref('')

const addTodo = () => {
  if (newTodo.value.trim()) {
    emit('addTodo', newTodo.value.trim())
    newTodo.value = ''
  }
}
</script>
