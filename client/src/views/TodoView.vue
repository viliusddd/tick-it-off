<template>
  <div
    :class="[
      'flex min-h-screen items-center justify-center p-4 transition-colors duration-300',
      isDarkMode ? 'bg-gray-900' : 'bg-gray-100',
    ]"
  >
    <div
      :class="[
        'w-full max-w-md overflow-hidden rounded-lg shadow-xl',
        isDarkMode ? 'bg-gray-800' : 'bg-white',
      ]"
    >
      <div class="p-6">
        <div class="mb-6 flex items-center justify-between">
          <h1 :class="['text-3xl font-bold', isDarkMode ? 'text-white' : 'text-gray-900']">
            Tick It Off
          </h1>
          <button
            @click="toggleDarkMode"
            :class="[
              'rounded-full p-1.5 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2',
              isDarkMode
                ? 'bg-gray-700 text-gray-300 focus:ring-gray-500'
                : 'bg-gray-200 text-gray-700 focus:ring-gray-400',
            ]"
          >
            <div class="flex items-center">
              <div
                :class="[
                  'relative h-5 w-9 rounded-full',
                  isDarkMode ? 'bg-gray-600' : 'bg-gray-400',
                ]"
              >
                <div
                  :class="[
                    'absolute top-0.5 h-4 w-4 transform rounded-full transition-transform duration-300',
                    isDarkMode ? 'translate-x-5 bg-gray-300' : 'translate-x-0.5 bg-white',
                  ]"
                ></div>
              </div>
              <div class="ml-2">
                <SunIcon v-if="!isDarkMode" class="h-4 w-4" />
                <MoonIcon v-else class="h-4 w-4" />
              </div>
            </div>
          </button>
        </div>

        <div class="mb-6 flex items-center justify-between">
          <button
            @click="changeDate(-1)"
            :class="[
              'text-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500',
              isDarkMode ? 'hover:text-blue-400' : 'hover:text-blue-600',
            ]"
          >
            <ChevronLeftIcon class="h-6 w-6" />
          </button>
          <div class="relative mx-2 flex-grow">
            <button
              @click="toggleCalendar"
              :class="[
                'w-full rounded-l-md px-4 py-2 text-left focus:outline-none focus:ring-2 focus:ring-blue-500',
                isDarkMode
                  ? 'bg-gray-700 text-white'
                  : 'border border-gray-300 bg-white text-gray-900',
              ]"
            >
              {{ formatDate(currentDate) }}
            </button>
            <button
              @click="goToToday"
              :class="[
                'absolute bottom-0 right-0 top-0 rounded-r-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50',
                isDarkMode
                  ? 'bg-gray-600 text-white hover:bg-gray-500'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200',
              ]"
              :disabled="isToday"
            >
              Today
            </button>
            <div v-if="showCalendar" class="absolute left-0 top-full z-10 mt-2 w-full">
              <DatePicker
                v-model="currentDate"
                @update:modelValue="onDateSelect"
                mode="date"
                :max-date="new Date()"
                :attributes="calendarAttributes"
                :is-dark="isDarkMode"
              />
            </div>
          </div>
          <button
            @click="changeDate(1)"
            :class="[
              'text-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500',
              isDarkMode ? 'hover:text-blue-400' : 'hover:text-blue-600',
            ]"
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
              placeholder="Add a new task..."
              :class="[
                'flex-grow rounded-l-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500',
                isDarkMode
                  ? 'bg-gray-700 text-white placeholder-gray-400'
                  : 'border border-gray-300 bg-white',
              ]"
            />
            <button
              @click="createTodo"
              :class="[
                'rounded-r-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500',
                isDarkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600',
              ]"
            >
              Add
            </button>
          </div>
        </div>

        <TransitionGroup name="list" tag="ul" class="space-y-2">
          <li
            v-for="todo in todos"
            :key="todo.id"
            :class="[
              'flex items-center space-x-3 rounded-md p-3 transition duration-300 ease-in-out',
              isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-50 hover:bg-gray-100',
            ]"
          >
            <input
              type="checkbox"
              :checked="todo.isCompleted"
              @change="toggleTodo(todo.id, currentDate)"
              :class="[
                'h-5 w-5 rounded focus:ring-2 focus:ring-offset-2',
                isDarkMode
                  ? 'text-blue-500 focus:ring-blue-600'
                  : 'text-blue-600 focus:ring-blue-500',
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
              @click="deleteTodo(todo.id)"
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
        </TransitionGroup>

        <div v-if="isFetching" class="py-4 text-center">
          <div
            :class="[
              'inline-block h-8 w-8 animate-spin rounded-full border-b-2 border-t-2',
              isDarkMode ? 'border-blue-400' : 'border-blue-500',
            ]"
          ></div>
        </div>
        <div
          v-if="!isFetching && todos.length === 0"
          :class="['py-4 text-center', isDarkMode ? 'text-gray-400' : 'text-gray-500']"
        >
          No tasks for this day. Add one above to start your magical journey!
        </div>
        <div
          v-if="!isFetching && hasMore"
          :class="['py-4 text-center', isDarkMode ? 'text-gray-400' : 'text-gray-500']"
        >
          Scroll down to reveal more enchanted tasks...
        </div>
        <div ref="loadMoreTrigger" class="h-1"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useInfiniteScroll } from '@vueuse/core'
import { trpc } from '@/trpc'
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  TrashIcon,
  SunIcon,
  MoonIcon,
} from '@heroicons/vue/24/solid'
import { DatePicker } from 'v-calendar'
import type { Ref } from 'vue'

const props = defineProps<{ currentDate: Date }>()

const router = useRouter()
const showCalendar = ref(false)
const todos: Ref<{ id: number; title: string; createdAt: Date; isCompleted?: boolean }[]> = ref([])
const completions: Ref<{ todoId: number }[]> = ref([])
const newTodo = ref('')
const currentDate = ref(props.currentDate)
const pageSize = 10
const isFetching = ref(false)
const hasMore = ref(true)
const loadMoreTrigger = ref(null)
const isDarkMode = ref(false)

const isToday = computed(() => {
  const today = new Date()
  return currentDate.value.toDateString() === today.toDateString()
})

const calendarAttributes = computed(() => [
  {
    dates: todos.value.map((todo) => new Date(todo.createdAt)),
    highlight: isDarkMode.value
      ? { color: 'blue', fillMode: 'light' }
      : { color: 'blue', fillMode: 'solid' },
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
    const lowestId = getMinMaxId(fetchedTodos, 'min')
    const highestId = getMinMaxId(fetchedTodos, 'max')

    await fetch(completions, () => fetchCompletionsByIdRange(lowestId, highestId))

    todos.value = todos.value.map((todo) => ({
      id: todo.id,
      title: todo.title,
      createdAt: todo.createdAt,
      isCompleted: completions.value.some((compl) => compl.todoId === todo.id),
    }))
  }
}

type Item = { id: number }

const getMinMaxId = (items: Item[], bar: 'min' | 'max') => {
  return items.reduce((acc, item) => {
    if (bar === 'min') return item.id < acc ? item.id : acc
    else if (bar === 'max') return item.id > acc ? item.id : acc
    return acc
  }, items[0].id)
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
    await trpc.todo.deleteById.mutate({ id })
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
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  if (newDate <= today) {
    currentDate.value = newDate
    const dateString = newDate.toISOString().split('T')[0]
    router.push({ name: 'SpecificDate', params: { date: dateString } })
  }
}

const onDateSelect = (date: Date) => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  if (date <= today) {
    currentDate.value = date
    const dateString = date.toISOString().split('T')[0]
    router.push({ name: 'SpecificDate', params: { date: dateString } })
  } else {
    currentDate.value = today
    const dateString = today.toISOString().split('T')[0]
    router.push({ name: 'SpecificDate', params: { date: dateString } })
  }
  showCalendar.value = false
}

const goToToday = () => {
  const today = new Date()
  currentDate.value = today
  const dateString = today.toISOString().split('T')[0]
  router.push({ name: 'SpecificDate', params: { date: dateString } })
}

const toggleCalendar = () => {
  showCalendar.value = !showCalendar.value
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

const toggleDarkMode = () => {
  isDarkMode.value = !isDarkMode.value
  localStorage.setItem('darkMode', isDarkMode.value.toString())
}

const initDarkMode = () => {
  const savedDarkMode = localStorage.getItem('darkMode')
  if (savedDarkMode !== null) {
    isDarkMode.value = savedDarkMode === 'true'
  } else {
    isDarkMode.value = window.matchMedia('(prefers-color-scheme: dark)').matches
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
  initDarkMode()
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
