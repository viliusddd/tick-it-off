<template>
  <div class="flex items-center">
    <InputText
      v-model="newTodo"
      @keyup.enter="addTodo"
      placeholder="Add a new task..."
      class="flex-grow"
    />
    <Button @click="addTodo" label="Add" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Button, InputText } from 'primevue'

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
