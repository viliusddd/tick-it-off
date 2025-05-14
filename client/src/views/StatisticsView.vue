<template>
  <div class="statistics-container p-5">
    <h1 class="mb-6 text-2xl font-bold">Statistics</h1>

    <div v-if="isLoading" class="flex items-center justify-center p-8">
      <ProgressSpinner style="width: 50px; height: 50px" />
    </div>

    <div v-else class="grid grid-cols-1 gap-6 md:grid-cols-3">
      <!-- Total Todo Count Card -->
      <Card class="shadow-md">
        <template #title>
          <div class="flex items-center">
            <i class="pi pi-list mr-2 text-xl"></i>
            <span>Total Todos</span>
          </div>
        </template>
        <template #content>
          <div class="py-4 text-center text-4xl font-bold">{{ stats.totalTodoCount }}</div>
          <div class="text-center text-sm text-gray-500">Total tasks created</div>
        </template>
      </Card>

      <!-- Average Completion Card -->
      <Card class="shadow-md">
        <template #title>
          <div class="flex items-center">
            <i class="pi pi-chart-line mr-2 text-xl"></i>
            <span>Daily Average</span>
          </div>
        </template>
        <template #content>
          <div class="py-4 text-center text-4xl font-bold">
            {{ stats.averageCompletionsPerDay.toFixed(1) }}
          </div>
          <div class="text-center text-sm text-gray-500">Tasks completed per day</div>
        </template>
      </Card>

      <!-- Most Active Day Card -->
      <Card class="shadow-md">
        <template #title>
          <div class="flex items-center">
            <i class="pi pi-calendar mr-2 text-xl"></i>
            <span>Most Active Day</span>
          </div>
        </template>
        <template #content>
          <div v-if="stats.mostActiveDay">
            <div class="py-2 text-center text-xl font-bold">
              {{ formatDate(stats.mostActiveDay.date) }}
            </div>
            <div class="text-center text-sm text-gray-500">
              {{ stats.mostActiveDay.dailycount }} Tasks completed
            </div>
          </div>
          <div v-else class="py-4 text-center text-gray-500">No completions yet</div>
        </template>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import {ref, onMounted} from 'vue'
import {trpc} from '@/trpc'
import {Card, ProgressSpinner} from 'primevue'

const isLoading = ref(true)

interface DayCount {
  date: Date
  dailycount: number
}
interface Stats {
  totalTodoCount: number
  averageCompletionsPerDay: number
  mostActiveDay: DayCount | null
}

const stats = ref<Stats>({
  totalTodoCount: 0,
  averageCompletionsPerDay: 0,
  mostActiveDay: null
})

onMounted(async () => {
  await fetchStats()
})

const fetchStats = async () => {
  try {
    stats.value.totalTodoCount = await trpc.todo.getTotalTodoCount.query()

    const completionsByDay = await trpc.completion.getDailyCompletions.query()

    if (completionsByDay.length !== 0) {
      const totalCompletions = completionsByDay.reduce((sum, entry: DayCount) => {
        return sum + Number(entry.dailycount)
      }, 0)

      stats.value.averageCompletionsPerDay = totalCompletions / completionsByDay.length

      stats.value.mostActiveDay = completionsByDay.reduce(
        (
          mostActive: {date: Date; dailycount: number} | null,
          current: {date: Date; dailycount: number}
        ) => {
          if (!mostActive) return current
          const mostActiveCount = Number(mostActive.dailycount)
          const currentCount = Number(current.dailycount)
          if (currentCount > mostActiveCount) return current
          if (currentCount === mostActiveCount && current.date > mostActive.date) return current
          return mostActive
        },
        null
      )
    }
  } catch (error) {
    console.error('Error fetching statistics:', error)
  } finally {
    isLoading.value = false
  }
}

const formatDate = (date: Date) => {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}
</script>
