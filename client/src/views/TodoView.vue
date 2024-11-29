<template>
  <div :class="['flex justify-center border-2']">
    <div :class="'overflow-hidden rounded-lg shadow-xl max-sm:w-full'">
      <div class="mb:p-5 p-3">
        <div class="mb-3">
          <CalendarNavigation
            :current-date="currentDate"
            :show-calendar="showCalendar"
            :calendar-attributes="calendarAttributes"
            @change-date="changeDate"
            @toggle-calendar="toggleCalendar"
            @go-to-today="goToToday"
            @date-select="onDateSelect"
          />
        </div>

        <div class="mb-3">
          <NewTask @add-todo="createTodo" />
        </div>

        <TransitionGroup name="list" tag="ul" class="space-y-2">
          <TodoItem
            v-for="todo in todos"
            :key="todo.id"
            :todo="todo"
            @toggle="toggleTodo($event, currentDate.toLocaleDateString('lt'))"
            @delete="deleteTodo"
          />
        </TransitionGroup>

        <div v-if="isFetching" class="py-4 text-center">
          <div
            :class="['inline-block h-8 w-8 animate-spin rounded-full border-b-2 border-t-2']"
          ></div>
        </div>
        <div v-if="!isFetching && todos.length === 0">
          No tasks for this day. Add one above to start your magical journey!
        </div>
        <div v-if="!isFetching && hasMore">Scroll down to reveal more enchanted tasks...</div>
        <div ref="loadMoreTrigger" class="h-1"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { type Ref, ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { trpc } from '@/trpc'
import { useRouter } from 'vue-router'
import { useInfiniteScroll } from '@vueuse/core'
import NewTask from '@/components/NewTask.vue'
import TodoItem from '@/components/TodoItem.vue'
import CalendarNavigation from '@/components/CalendarNavigation.vue'

const props = defineProps<{ currentDate: Date }>()

const router = useRouter()
const showCalendar = ref(false)
const todos: Ref<{ id: number; title: string; createdAt: Date; isCompleted?: boolean }[]> = ref([])
const completions: Ref<{ todoId: number }[]> = ref([])
const currentDate = ref(props.currentDate)
const pageSize = 10
const isFetching = ref(false)
const hasMore = ref(true)
const loadMoreTrigger = ref(null)

const calendarAttributes = computed(() => [
  { dates: todos.value.map((todo) => new Date(todo.createdAt)) },
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
    date: currentDate.value.toLocaleDateString('lt'),
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

const createTodo = async (title: string) => {
  try {
    const createdTodo = await trpc.todo.create.mutate({
      title,
    })
    todos.value.unshift(createdTodo)
  } catch (error) {
    console.error('Error creating todo:', error)
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

const toggleTodo = async (todoId: number, date: string) => {
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
