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
              class="transform text-blue-500 transition duration-300 ease-in-out hover:scale-110 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <ChevronLeftIcon class="h-6 w-6" />
            </button>
            <div class="relative mx-2 flex flex-grow items-center">
              <button
                class="flex-grow cursor-pointer rounded-l-full border border-r-0 border-gray-300 bg-white px-4 py-2 text-center transition duration-300 ease-in-out hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                @click="toggleCalendar"
              >
                {{ formatDate(currentDate) }}
              </button>
              <button
                @click="goToToday"
                class="transform rounded-r-full border border-l-0 border-gray-300 bg-white px-4 py-2 text-blue-500 transition duration-300 ease-in-out hover:bg-gray-50 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                :disabled="isToday"
              >
                Today
              </button>
              <div
                v-if="showCalendar"
                class="absolute left-0 top-full z-10 mt-2 w-full rounded-lg border border-gray-300 bg-white shadow-lg"
              >
                <DatePicker
                  v-model="currentDate"
                  @update:modelValue="onDateSelect"
                  mode="date"
                  :max-date="new Date()"
                  :attributes="calendarAttributes"
                />
              </div>
            </div>
            <button
              @click="changeDate(1)"
              class="transform text-blue-500 transition duration-300 ease-in-out hover:scale-110 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              :disabled="isToday"
            >
              <ChevronRightIcon
                class="h-6 w-6"
                :class="{ 'cursor-not-allowed opacity-50': isToday }"
              />
            </button>
          </div>

          <div class="mb-6">
            <div class="flex items-center">
              <input
                v-model="newTodo"
                @keyup.enter="createTodo"
                type="text"
                placeholder="Add a magical task..."
                class="flex-grow rounded-l-full border border-r-0 border-gray-300 bg-white px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                @click="createTodo"
                class="rounded-r-full border border-l-0 border-blue-500 bg-blue-500 px-4 py-2 text-white transition duration-300 ease-in-out hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
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
                @change="toggleTodo(todo.id, currentDate)"
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
                class="text-red-500 transition duration-150 ease-in-out hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
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

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useInfiniteScroll } from '@vueuse/core'
import { trpc } from '@/trpc'
import { ChevronLeftIcon, ChevronRightIcon, TrashIcon } from '@heroicons/vue/24/solid'
import { DatePicker } from 'v-calendar'
import type { Ref } from 'vue'

const showCalendar = ref(false)
const todos: Ref<{ id: number; title: string; createdAt: Date; isCompleted?: boolean }[]> = ref([])
const completions: Ref<{ todoId: number }[]> = ref([])
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

const calendarAttributes = computed(() => [
  {
    dates: todos.value.map((todo) => new Date(todo.createdAt)),
  },
])

const fetchAllTodos = async () => {
  const queryResult = await trpc.todo.findAll.query({
    offset: todos.value.length,
    limit: pageSize,
  })

  hasMore.value = queryResult.length === pageSize

  return queryResult
}

const fetchCompletionsByIdRange = async (firstId: number, secondId: number) =>
  trpc.completion.findByRange.query({
    date: currentDate.value,
    firstId,
    secondId,
  })

const fetch = async <T,>(queryRef: Ref<T[]>, queryCallback: () => Promise<T[]>) => {
  if (isFetching.value || !hasMore.value) return
  isFetching.value = true
  try {
    const result = await queryCallback()

    queryRef.value = [...queryRef.value, ...result]

    return result
  } catch (error) {
    console.error('Error fetching:', error)
  } finally {
    isFetching.value = false
  }
}

const fetchAll = async () => {
  const fetchedTodos = await fetch(todos, fetchAllTodos)

  if (fetchedTodos && fetchedTodos.length !== 0) {
    const highestId = fetchedTodos.reduce(
      (max: number, todo: { id: number }) => (todo.id > max ? todo.id : max),
      fetchedTodos[0].id
    )

    const lowestId = fetchedTodos.reduce(
      (min: number, todo: { id: number }) => (todo.id < min ? todo.id : min),
      fetchedTodos[0].id
    )

    console.log(todos.value)
    await fetch(completions, () => fetchCompletionsByIdRange(lowestId, highestId))

    todos.value = todos.value.map((todo) => ({
      id: todo.id,
      title: todo.title,
      createdAt: todo.createdAt,
      isCompleted: completions.value.some((compl) => {
        return compl.todoId === todo.id
      }),
    }))
  }
}

useInfiniteScroll(
  loadMoreTrigger,
  () => {
    if (!isFetching.value && hasMore.value) {
      fetchAll()
    }
  },
  { distance: 10 }
)

const createTodo = async () => {
  if (newTodo.value.trim()) {
    try {
      const createdTodo = await trpc.todo.create.mutate({
        title: newTodo.value,
      })

      todos.value.unshift(createdTodo)

      newTodo.value = ''
    } catch (error) {
      console.error('Error creating todo:', error)
    }
  }
}

const deleteTodo = async (id: number) => {
  try {
    await trpc.todo.deleteTodo.mutate({ id })
    todos.value = todos.value.filter((todo) => todo.id !== id)
  } catch (error) {
    console.error('Error deleting todo:', error)
  }
}

const toggleTodo = async (todoId: number, date: Date) => {
  try {
    await trpc.completion.toggle.mutate({ todoId, date })
    const todoIndex = todos.value.findIndex((todo) => todo.id === todoId)
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

const changeDate = (days: number) => {
  const newDate = new Date(currentDate.value.getTime() + days * 24 * 60 * 60 * 1000)
  if (newDate <= new Date()) {
    currentDate.value = newDate
  }
}

const toggleCalendar = () => {
  showCalendar.value = !showCalendar.value
}

const onDateSelect = (date: Date) => {
  currentDate.value = date
  showCalendar.value = false
}

const goToToday = () => {
  currentDate.value = new Date()
}

const formatDate = (date: Date) => {
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

const handleClickOutside = (event: MouseEvent) => {
  const calendarElement: Element | null = document.querySelector('.vc-container')
  const calendarButton = document.querySelector('button:has(+ div > .vc-container)')

  if (
    showCalendar.value &&
    calendarElement &&
    !calendarElement.contains(event.target as Node) &&
    event.target !== calendarButton
  ) {
    showCalendar.value = false
  }
}

watch(currentDate, () => {
  todos.value = []
  completions.value = []
  hasMore.value = true
  fetchAll()
})

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
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
