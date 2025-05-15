<template>
  <div :class="['flex justify-center']">
    <div :class="'overflow-hidden rounded-lg shadow-xl max-sm:w-full'">
      <div class="mb:p-5 p-3">
        <Calendar class="mb-3" />
        <NewTask class="my-3" @add-todo="createTodo" />

        <!-- Combined list of all todos -->
        <div>
          <div v-for="todo in allTodos" :key="`todo-${todo.id}`">
            <TodoItem
              :todo="todo"
              :isShared="todo.isSharedWithMe"
              @toggled="handleToggle"
              @deleted="handleDelete"
              @unshared="handleUnshared"
              @title-updated="handleTitleUpdate"
            />
          </div>
        </div>

        <div v-if="isLoading" class="py-4 text-center">
          <ProgressSpinner style="width: 30px; height: 30px" />
        </div>
        <div v-if="!isLoading && allTodos.length === 0">
          <Message severity="info"
            >No tasks for this day. Add one above to start your journey!</Message
          >
        </div>
        <div v-if="!isLoading && hasMore">
          <Message severity="info">Scroll down to reveal more tasks...</Message>
        </div>
        <div ref="loadMoreTrigger" class="h-1"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {type Ref, ref, watch, computed, onMounted} from 'vue'
import {useRoute, useRouter, onBeforeRouteUpdate} from 'vue-router'
import {trpc} from '@/trpc'
import {useInfiniteScroll} from '@vueuse/core'
import {ProgressSpinner, Message} from 'primevue'
import {useUserStore} from '@/stores/userStore'
import NewTask from '@/components/Todo/TodoAdd.vue'
import TodoItem from '@/components/Todo/TodoItem.vue'
import Calendar from '@/components/Todo/TodoCalendar.vue'

const userStore = useUserStore()
const route = useRoute()
const router = useRouter()

// Define todo types with additional properties for shared status
type TodoItemType = {
  id: number
  title: string
  createdAt: Date
  isCompleted?: boolean
  owner?: string
  isSharedWithMe?: boolean
  isSharedByMe?: boolean
}

const todos: Ref<TodoItemType[]> = ref([])
const completions: Ref<{todoId: number}[]> = ref([])
const sharedTodos: Ref<TodoItemType[]> = ref([])
const sharedWithUsersByTodo = ref<Record<number, number[]>>({}) // Track sharing status for own todos
const pageSize = 10
const isFetching = ref(false)
const isSharedFetching = ref(false)
const isLoading = computed(() => isFetching.value || isSharedFetching.value)
const hasMore = ref(true)
const loadMoreTrigger = ref(null)
const currentDate = computed(() => userStore.currentDate)

// Combine own and shared todos into a single list
const allTodos = computed(() => {
  // Combine both lists, with shared todos having isSharedWithMe property
  const combined = [
    ...sharedTodos.value,
    ...todos.value.map(todo => ({
      ...todo,
      isSharedByMe: (sharedWithUsersByTodo.value[todo.id]?.length || 0) > 0
    }))
  ]

  // Sort by creation date (newest first)
  return combined.sort((a, b) => {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })
})

function formatDate(date: Date): string {
  return date.toISOString().slice(0, 10)
}

// Load sharing status for each of user's own todos
const loadSharingStatus = async () => {
  for (const todo of todos.value) {
    try {
      const sharedUsers = await trpc.todo.getSharedUsers.query({todoId: todo.id})
      if (sharedUsers && sharedUsers.length > 0) {
        sharedWithUsersByTodo.value[todo.id] = sharedUsers.map(user => user.userId)
      }
    } catch (err) {
      console.error(`Error fetching sharing status for todo ${todo.id}:`, err)
    }
  }
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
  fetchAll()
  fetchSharedTodos()
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
  sharedTodos.value = []
  sharedWithUsersByTodo.value = {}
  hasMore.value = true
  fetchAll()
  fetchSharedTodos()
})

const fetchAllTodos = async () => {
  const queryResult = await trpc.todo.findAll.query({
    offset: todos.value.length,
    limit: pageSize
  })

  hasMore.value = queryResult.length === pageSize

  return queryResult
}

const fetchSharedTodos = async () => {
  isSharedFetching.value = true
  try {
    // Get all todos shared with the current user
    const result = await trpc.todo.findSharedWithMe.query()

    // Mark these todos as shared with the current user
    sharedTodos.value = result.map(todo => ({
      ...todo,
      isSharedWithMe: true
    }))

    // Fetch completions for shared todos if there are any shared todos
    if (sharedTodos.value.length > 0) {
      const lowestId = getMinMaxId(sharedTodos.value, 'min')
      const highestId = getMinMaxId(sharedTodos.value, 'max')

      // Fetch completion status for shared todos
      const sharedCompletions = await trpc.completion.findByRange.query({
        date: userStore.currentDate.toLocaleDateString('lt'),
        firstId: lowestId,
        secondId: highestId
      })

      // Update completion status for shared todos
      sharedTodos.value = sharedTodos.value.map(todo => ({
        ...todo,
        isCompleted: sharedCompletions.some(compl => compl.todoId === todo.id)
      }))
    }
  } catch (error) {
    console.error('Error fetching shared todos:', error)
  } finally {
    isSharedFetching.value = false
  }
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
    // Use all todos for finding the ID range to ensure we get completions for all todos
    const allTodosForCompletions = [...todos.value]

    if (allTodosForCompletions.length > 0) {
      const lowestId = getMinMaxId(allTodosForCompletions, 'min')
      const highestId = getMinMaxId(allTodosForCompletions, 'max')

      // Fetch completions directly without using the incremental fetch
      const fetchedCompletions = await trpc.completion.findByRange.query({
        date: userStore.currentDate.toLocaleDateString('lt'),
        firstId: lowestId,
        secondId: highestId
      })

      // Update completions reference
      completions.value = fetchedCompletions

      // Apply completion status to all todos
      todos.value = todos.value.map(todo => ({
        id: todo.id,
        title: todo.title,
        createdAt: todo.createdAt,
        isCompleted: completions.value.some(compl => compl.todoId === todo.id)
      }))
    }

    // Load sharing status for own todos
    await loadSharingStatus()
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

const handleToggle = async (todoData: number | {id: number; isCompleted: boolean}) => {
  // Convert old format (just id) to new format for backward compatibility
  const todoId = typeof todoData === 'number' ? todoData : todoData.id
  const isCompleted =
    typeof todoData === 'number'
      ? // If old format, we need to toggle the current state
        !(
          todos.value.find(t => t.id === todoId)?.isCompleted ||
          sharedTodos.value.find(t => t.id === todoId)?.isCompleted
        )
      : // If new format, use the provided isCompleted value
        todoData.isCompleted

  // Find todo in either list
  const ownTodo = todos.value.find(t => t.id === todoId)
  const sharedTodo = sharedTodos.value.find(t => t.id === todoId)

  // Update with the new completion state directly from the event
  if (ownTodo) {
    ownTodo.isCompleted = isCompleted

    // Update completions list for consistency
    const existingCompletion = completions.value.findIndex(c => c.todoId === todoId)
    if (isCompleted && existingCompletion === -1) {
      // Add to completions if marked as completed and not already there
      completions.value.push({todoId: todoId})
    } else if (!isCompleted && existingCompletion !== -1) {
      // Remove from completions if marked as not completed
      completions.value.splice(existingCompletion, 1)
    }
  }

  if (sharedTodo) {
    sharedTodo.isCompleted = isCompleted

    // Update completions list for shared todos to ensure persistence
    const existingCompletion = completions.value.findIndex(c => c.todoId === todoId)
    if (isCompleted && existingCompletion === -1) {
      // Add to completions if marked as completed and not already there
      completions.value.push({todoId: todoId})
    } else if (!isCompleted && existingCompletion !== -1) {
      // Remove from completions if marked as not completed
      completions.value.splice(existingCompletion, 1)
    }
  }
}

const handleUnshared = (id: number) => {
  const index = sharedTodos.value.findIndex(t => t.id === id)
  if (index !== -1) {
    sharedTodos.value.splice(index, 1)
  } else {
    console.error('Could not find shared todo with ID:', id)
  }
}

const handleDelete = (id: number) => {
  const index = todos.value.findIndex(t => t.id === id)
  if (index !== -1) {
    todos.value.splice(index, 1)
    // Also remove from sharedWithUsersByTodo if present
    if (id in sharedWithUsersByTodo.value) {
      delete sharedWithUsersByTodo.value[id]
    }
  }
}

// Helper function to update a todo in a specific array
const updateTodoInArray = (
  todoList: TodoItemType[],
  updatedTodo: {id: number; title: string; isSharedByMe?: boolean}
): TodoItemType[] => {
  return todoList.map(todo => {
    if (todo.id === updatedTodo.id) {
      return {
        ...todo,
        title: updatedTodo.title,
        ...(updatedTodo.isSharedByMe !== undefined ? {isSharedByMe: updatedTodo.isSharedByMe} : {})
      }
    }
    return todo
  })
}

// Helper function to update shared status tracking
const updateSharedStatus = (todoId: number, isSharedByMe: boolean | undefined) => {
  if (isSharedByMe === undefined) return

  if (isSharedByMe) {
    // Initialize with empty array if not already tracked
    if (!sharedWithUsersByTodo.value[todoId]) {
      sharedWithUsersByTodo.value[todoId] = []
    }
  } else {
    // Remove from tracking if no longer shared
    if (todoId in sharedWithUsersByTodo.value) {
      delete sharedWithUsersByTodo.value[todoId]
    }
  }
}

const handleTitleUpdate = (updatedTodo: {id: number; title: string; isSharedByMe?: boolean}) => {
  // Find where the todo exists - in own todos or shared todos
  const existsInOwn = todos.value.some(t => t.id === updatedTodo.id)
  const existsInShared = sharedTodos.value.some(t => t.id === updatedTodo.id)

  // Update in the appropriate array(s)
  if (existsInOwn) {
    todos.value = updateTodoInArray(todos.value, updatedTodo)
    updateSharedStatus(updatedTodo.id, updatedTodo.isSharedByMe)
  }

  if (existsInShared) {
    sharedTodos.value = updateTodoInArray(sharedTodos.value, updatedTodo)
  }
}
</script>
