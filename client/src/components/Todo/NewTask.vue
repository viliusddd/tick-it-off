<template>
  <div class="flex items-center">
    <InputGroup>
      <InputText
        v-model="newTodo"
        ref="inputRef"
        @keyup.enter="addTodo"
        placeholder="Add a new task..."
        class="flex-grow"
      />
      <Button @mousedown.prevent @click="addTodo" label="Add" />
    </InputGroup>
  </div>
</template>

<script setup lang="ts">
import {ref, nextTick} from 'vue'
import {Button, InputText, InputGroup} from 'primevue'

const emit = defineEmits<{
  (e: 'addTodo', title: string): void
}>()

const newTodo = ref('')
const inputRef = ref()

const addTodo = () => {
  if (newTodo.value.trim()) {
    emit('addTodo', newTodo.value.trim())
    newTodo.value = ''
    nextTick(() => {
      inputRef.value?.$el?.querySelector('input')?.focus()
    })
  }
}
</script>
