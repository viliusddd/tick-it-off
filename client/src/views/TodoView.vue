<template>
  <div
    class="flex min-h-screen flex-col overflow-y-auto bg-gradient-to-br from-gray-100 to-gray-200 py-6 sm:py-12"
  >
    <div class="relative w-full px-4 py-3 sm:mx-auto sm:max-w-xl sm:px-0">
      <div class="relative bg-white px-4 py-10 shadow-lg sm:rounded-3xl sm:p-20">
        <div class="mx-auto max-w-md">
          <h1 class="mb-6 text-3xl font-semibold text-gray-900">Infinite Scroll Todo App</h1>
          <div class="mb-4">
            <input
              v-model="newTodo"
              @keyup.enter="createTodo"
              type="text"
              placeholder="Add a new todo"
              class="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              @click="createTodo"
              class="mt-2 w-full rounded-md bg-blue-500 px-4 py-2 text-white transition duration-300 ease-in-out hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Add Todo
            </button>
          </div>
          <ul class="space-y-2">
            <li
              v-for="todo in todos"
              :key="todo.id"
              class="flex items-center space-x-3 rounded-md bg-gray-50 p-3 transition duration-300 ease-in-out hover:bg-gray-100"
            >
              <input
                type="checkbox"
                :checked="todo.completed"
                @change="toggleTodo(todo.id)"
                class="h-5 w-5 rounded border-gray-300 text-blue-600 transition duration-150 ease-in-out focus:ring-blue-500"
              />
              <span
                :class="{
                  'text-gray-500 line-through': todo.completed,
                  'text-gray-800': !todo.completed,
                }"
                class="flex-grow"
              >
                {{ todo.title }}
              </span>
              <button
                @click="deleteTodo(todo.id)"
                class="text-red-500 transition duration-150 ease-in-out hover:text-red-700 focus:outline-none"
              >
                Delete
              </button>
            </li>
          </ul>
          <div v-if="isFetching" class="py-4 text-center">
            <div
              class="inline-block h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-blue-500"
            ></div>
          </div>
          <div v-if="!isFetching && todos.length === 0" class="py-4 text-center text-gray-500">
            No todos yet. Add one above!
          </div>
          <div v-if="!isFetching && hasMore" class="py-4 text-center text-gray-500">
            Scroll down to load more todos...
          </div>
          <div ref="loadMoreTrigger" class="h-1"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useInfiniteScroll } from '@vueuse/core'
import { trpc } from '@/trpc'

const todos = ref([])
const newTodo = ref('')
const pageSize = 10
const isFetching = ref(false)
const hasMore = ref(true)
const loadMoreTrigger = ref(null)

const fetchTodos = async () => {
  if (isFetching.value || !hasMore.value) return
  isFetching.value = true
  try {
    const result = await trpc.todo.findAll.query({
      offset: todos.value.length,
      limit: pageSize,
    })
    todos.value = [...todos.value, ...result]
    hasMore.value = result.length === pageSize
  } catch (error) {
    console.error('Error fetching todos:', error)
  } finally {
    isFetching.value = false
  }
}

useInfiniteScroll(
  loadMoreTrigger,
  () => {
    if (!isFetching.value && hasMore.value) {
      fetchTodos()
    }
  },
  { distance: 10 }
)

const createTodo = async () => {
  if (newTodo.value.trim()) {
    try {
      const createdTodo = await trpc.todo.create.mutate({ title: newTodo.value })
      todos.value.unshift(createdTodo)
      newTodo.value = ''
    } catch (error) {
      console.error('Error creating todo:', error)
    }
  }
}

const deleteTodo = async (id) => {
  try {
    await trpc.todo.deleteTodo.mutate({ id })
    todos.value = todos.value.filter((todo) => todo.id !== id)
  } catch (error) {
    console.error('Error deleting todo:', error)
  }
}

const toggleTodo = async (id) => {
  try {
    await trpc.todo.toggle.mutate({ id })
    const todoIndex = todos.value.findIndex((todo) => todo.id === id)
    if (todoIndex !== -1) {
      todos.value[todoIndex] = {
        ...todos.value[todoIndex],
        completed: !todos.value[todoIndex].completed,
      }
    }
  } catch (error) {
    console.error('Error toggling todo:', error)
  }
}

onMounted(() => {
  fetchTodos()
})
</script>

<style>
html,
body {
  height: 100%;
  margin: 0;
  padding: 0;
  overflow: hidden;
}

#app {
  height: 100%;
  overflow-y: auto;
}
</style>
