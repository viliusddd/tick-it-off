<template>
  <div class="flex items-center">
    <input
      v-model="newTodo"
      @keyup.enter="addTodo"
      type="text"
      placeholder="Add a new task..."
      :class="[
        'flex-grow rounded-l-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500',
      ]"
    />
    <button
      @click="addTodo"
      :class="[
        'rounded-r-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500',
      ]"
    >
      Add
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

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
