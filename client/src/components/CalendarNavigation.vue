<template>
  <div class="flex items-center justify-between">
    <button
      @click="$emit('changeDate', -1)"
      :class="['text-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500']"
    >
      <ChevronLeftIcon class="h-6 w-6" />
    </button>
    <div class="relative mx-2 flex-grow">
      <button
        @click="$emit('toggleCalendar')"
        :class="[
          'w-full rounded-l-md px-4 py-2 text-left focus:outline-none focus:ring-2 focus:ring-blue-500'
        ]"
      >
        {{ formatDate(currentDate) }}
      </button>
      <button
        @click="$emit('goToToday')"
        :class="[
          'absolute bottom-0 right-0 top-0 rounded-r-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50'
        ]"
        :disabled="isToday"
      >
        Today
      </button>
      <div v-if="showCalendar" class="absolute left-0 top-full z-10 mt-2 w-full">
        <DatePicker
          v-model="currentDateModel"
          @update:modelValue="$emit('dateSelect', $event)"
          mode="date"
          :max-date="new Date()"
          :attributes="calendarAttributes"
        />
      </div>
    </div>
    <button
      @click="$emit('changeDate', 1)"
      :class="['text-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500']"
      :disabled="isToday"
    >
      <ChevronRightIcon class="h-6 w-6" :class="{'cursor-not-allowed opacity-50': isToday}" />
    </button>
  </div>
</template>

<script setup lang="ts">
import {computed} from 'vue'
import {ChevronLeftIcon, ChevronRightIcon} from '@heroicons/vue/24/solid'
import {DatePicker} from 'v-calendar'

const props = defineProps<{
  currentDate: Date
  showCalendar: boolean
  calendarAttributes: any[]
}>()

const emit = defineEmits<{
  (e: 'changeDate', days: number): void
  (e: 'toggleCalendar'): void
  (e: 'goToToday'): void
  (e: 'dateSelect', date: Date): void
}>()

const isToday = computed(() => {
  const today = new Date()
  return props.currentDate.toDateString() === today.toDateString()
})

const currentDateModel = computed({
  get: () => props.currentDate,
  set: value => emit('dateSelect', value)
})

const formatDate = (date: Date) => {
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}
</script>
