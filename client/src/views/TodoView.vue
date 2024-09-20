<template>
  <div
    class="flex min-h-screen flex-col justify-center bg-gradient-to-br from-blue-100 to-indigo-200 py-6 sm:py-12"
  >
    <div class="relative w-full px-4 py-3 sm:mx-auto sm:max-w-xl sm:px-0">
      <div
        class="to-light-blue-500 absolute inset-0 -skew-y-6 transform bg-gradient-to-r from-cyan-400 shadow-lg sm:-rotate-6 sm:skew-y-0 sm:rounded-3xl"
      ></div>
      <div class="relative bg-white px-4 py-10 shadow-lg sm:rounded-3xl sm:p-20">
        <div class="mx-auto max-w-md">
          <h1 class="mb-6 text-center text-3xl font-extrabold text-gray-900">
            Enchanted Todo List
          </h1>

          <div class="mb-6 flex items-center justify-between">
            <button
              @click="changeDate(-1)"
              class="transform text-blue-500 transition duration-300 ease-in-out hover:scale-110 hover:text-blue-600 focus:outline-none"
            >
              <ChevronLeftIcon class="h-6 w-6" />
            </button>
            <div class="relative mx-2 flex-grow">
              <button
                class="w-full cursor-pointer rounded-full border border-gray-300 bg-white px-4 py-2 text-center transition duration-300 ease-in-out hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                @click="toggleCalendar"
              >
                {{ formatDate(currentDate) }}
              </button>
              <div
                v-if="showCalendar"
                class="absolute left-1/2 top-full z-10 mt-2 -translate-x-1/2 transform rounded-lg border border-gray-300 bg-white shadow-lg"
              >
                <DatePicker
                  v-model="currentDate"
                  @update:modelValue="onDateSelect"
                  mode="date"
                  :max-date="new Date()"
                />
              </div>
            </div>
            <button
              @click="changeDate(1)"
              class="transform text-blue-500 transition duration-300 ease-in-out hover:scale-110 hover:text-blue-600 focus:outline-none"
              :disabled="isToday"
            >
              <ChevronRightIcon class="h-6 w-6" />
            </button>
            <button
              @click="goToToday"
              class="ml-2 transform rounded-full bg-blue-500 px-4 py-2 text-white transition duration-300 ease-in-out hover:scale-105 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              :disabled="isToday"
            >
              Today
            </button>
          </div>

          <div class="mb-6">
            <div class="flex items-center rounded-full bg-gray-100 p-1">
              <input
                v-model="newTodo"
                @keyup.enter="createTodo"
                type="text"
                placeholder="Add a magical task..."
                class="flex-grow bg-transparent px-4 py-2 focus:outline-none"
              />
              <button
                @click="createTodo"
                class="ml-2 transform rounded-full bg-blue-500 px-4 py-2 text-white transition duration-300 ease-in-out hover:scale-105 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Add
              </button>
            </div>
          </div>

          <TransitionGroup name="list" tag="ul" class="space-y-2">
            <li
              v-for="todo in todos"
              :key="todo.id"
              class="flex items-center space-x-3 rounded-lg bg-gray-50 p-3 transition duration-300 ease-in-out hover:bg-gray-100 hover:shadow-md"
            >
              <input
                type="checkbox"
                :checked="todo.isCompleted"
                @change="toggleTodo(todo.id)"
                class="h-5 w-5 rounded border-gray-300 text-blue-600 transition duration-150 ease-in-out focus:ring-blue-500"
              />
              <span
                :class="{
                  'text-gray-400 line-through': todo.isCompleted,
                  'text-gray-800': !todo.isCompleted,
                }"
                class="flex-grow"
              >
                {{ todo.title }}
              </span>
              <button
                @click="deleteTodo(todo.id)"
                class="text-red-500 transition duration-150 ease-in-out hover:text-red-600 focus:outline-none"
              >
                <TrashIcon class="h-5 w-5" />
              </button>
            </li>
          </TransitionGroup>

          <div v-if="isFetching" class="py-4 text-center">
            <div
              class="inline-block h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-blue-500"
            ></div>
          </div>
          <div v-if="!isFetching && todos.length === 0" class="py-4 text-center text-gray-500">
            No tasks for this day. Add one above to start your magical journey!
          </div>
          <div v-if="!isFetching && hasMore" class="py-4 text-center text-gray-500">
            Scroll down to reveal more enchanted tasks...
          </div>
          <div ref="loadMoreTrigger" class="h-1"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useInfiniteScroll } from '@vueuse/core'
import { trpc } from '@/trpc'
import { ChevronLeftIcon, ChevronRightIcon, TrashIcon } from '@heroicons/vue/24/solid'
import { DatePicker } from 'v-calendar'

const showCalendar = ref(false)

function toggleCalendar() {
  showCalendar.value = !showCalendar.value
}
const todos = ref([])
const newTodo = ref('')
const currentDate = ref(new Date())
const pageSize = 10
const isFetching = ref(false)
const hasMore = ref(true)
const loadMoreTrigger = ref(null)

const isToday = computed(() => {
  const today = new Date()
  return currentDate.value.toDateString() === today.toDateString()
})

const fetchTodos = async () => {
  if (isFetching.value || !hasMore.value) return
  isFetching.value = true
  try {
    const result = await trpc.todo.findAll.query({
      offset: todos.value.length,
      limit: pageSize,
      date: currentDate.value.toISOString().split('T')[0],
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
      const createdTodo = await trpc.todo.create.mutate({
        title: newTodo.value,
        date: currentDate.value.toISOString().split('T')[0],
      })
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
        isCompleted: !todos.value[todoIndex].isCompleted,
      }
    }
  } catch (error) {
    console.error('Error toggling todo:', error)
  }
}

const changeDate = (days) => {
  const newDate = new Date(currentDate.value.getTime() + days * 24 * 60 * 60 * 1000)
  if (newDate <= new Date()) {
    currentDate.value = newDate
  }
}

const onDateSelect = (date) => {
  currentDate.value = date
  showCalendar.value = false
}

const goToToday = () => {
  currentDate.value = new Date()
}

const formatDate = (date) => {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

watch(currentDate, () => {
  todos.value = []
  hasMore.value = true
  fetchTodos()
})
</script>

<style scoped>
.list-enter-active,
.list-leave-active {
  transition: all 0.5s ease;
}
.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
</style>
