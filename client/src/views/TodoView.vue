<template>
  <div class="card">
    <TodoItem
      v-for="todo in todos"
      :key="todo.id"
      :todo="todo"
      @update:completed="updateTodoStatus(todo.id, $event)"
      @delete="deleteTodo(todo.id)"
    />
  </div>
  <Toast />
</template>

<script setup lang="ts">
import TodoItem from '@/components/TodoItem.vue'
import { ref } from 'vue'

const todos = ref([
  { id: 1, text: 'Learn Vue', completed: false },
  { id: 2, text: 'Master PrimeVue', completed: false },
  { id: 3, text: 'Build awesome apps', completed: false },
])

const updateTodoStatus = (id, completed) => {
  const todo = todos.value.find((t) => t.id === id)
  if (todo) {
    todo.completed = completed
  }
}

const deleteTodo = (id) => {
  todos.value = todos.value.filter((t) => t.id !== id)
}
</script>
