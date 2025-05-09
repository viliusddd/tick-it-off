<template>
  <div :class="['flex justify-center']">
    <div :class="'overflow-hidden rounded-lg shadow-xl max-sm:w-full'">
      <div class="mb:p-5 p-3">
        <CalendarNavigation class="mb-3" />
        <NewTask class="my-3" @add-todo="createTodo" />
        <div v-for="todo in todos" :key="todo.id">
          <TodoItem :todo="todo" @toggled="handleToggle" />
        </div>
        <div v-if="isFetching" class="py-4 text-center">
          <div
            :class="['inline-block h-8 w-8 animate-spin rounded-full border-b-2 border-t-2']"
          ></div>
        </div>
        <div v-if="!isFetching && todos.length === 0">
          No tasks for this day. Add one above to start your magical journey!
        </div>
        <div v-if="!isFetching && hasMore">Scroll down to reveal more tasks...</div>
        <div ref="loadMoreTrigger" class="h-1"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {type Ref, ref, watch, computed, onMounted} from 'vue'
import {trpc} from '@/trpc'
import {useInfiniteScroll} from '@vueuse/core'
import NewTask from '@/components/Todo/NewTask.vue'
import TodoItem from '@/components/Todo/TodoItem.vue'
import CalendarNavigation from '@/components/Todo/CalendarNavigation.vue'
import {useUserStore} from '@/stores/userStore'
import {useRoute, useRouter, onBeforeRouteUpdate} from 'vue-router'

const userStore = useUserStore()
const route = useRoute()
const router = useRouter()

const todos: Ref<{id: number; title: string; createdAt: Date; isCompleted?: boolean}[]> = ref([])
const completions: Ref<{todoId: number}[]> = ref([])
const pageSize = 10
const isFetching = ref(false)
const hasMore = ref(true)
const loadMoreTrigger = ref(null)
const currentDate = computed(() => userStore.currentDate)

function formatDate(date: Date): string {
  return date.toISOString().slice(0, 10)
}

// Sync store with route param on mount
onMounted(() => {
  const dateParam = route.params.date as string | undefined
  if (dateParam) {
    const parsed = new Date(dateParam)
    if (!isNaN(parsed.getTime()) && formatDate(userStore.currentDate) !== dateParam) {
      userStore.currentDate = parsed
    }
  }
})

// Also update store if route changes (e.g. user navigates via browser)
onBeforeRouteUpdate(to => {
  const dateParam = to.params.date as string | undefined
  if (dateParam) {
    const parsed = new Date(dateParam)
    if (!isNaN(parsed.getTime()) && formatDate(userStore.currentDate) !== dateParam) {
      userStore.currentDate = parsed
    }
  }
})

// Watch for store date changes and update the route if needed
watch(currentDate, newDate => {
  const formatted = formatDate(newDate)
  if (route.params.date !== formatted) {
    router.replace({name: 'SpecificDate', params: {date: formatted}})
  }
  todos.value = []
  completions.value = []
  hasMore.value = true
  fetchAll()
})

const fetchAllTodos = async () => {
  const queryResult = await trpc.todo.findAll.query({
    offset: todos.value.length,
    limit: pageSize
  })

  hasMore.value = queryResult.length === pageSize

  return queryResult
}

const fetchCompletionsByIdRange = async (firstId: number, secondId: number) =>
  trpc.completion.findByRange.query({
    date: userStore.currentDate.toLocaleDateString('lt'),
    firstId,
    secondId
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

    todos.value = todos.value.map(todo => ({
      id: todo.id,
      title: todo.title,
      createdAt: todo.createdAt,
      isCompleted: completions.value.some(compl => compl.todoId === todo.id)
    }))
  }
}

const getMinMaxId = (items: {id: number}[], bar: 'min' | 'max') => {
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
  {distance: 10}
)

const createTodo = async (title: string) => {
  try {
    const createdTodo = await trpc.todo.create.mutate({title})
    todos.value.unshift(createdTodo)
  } catch (error) {
    console.error('Error creating todo:', error)
  }
}

const handleToggle = (id: number) => {
  const todo = todos.value.find(t => t.id === id)
  if (todo) todo.isCompleted = !todo.isCompleted
}
</script>
