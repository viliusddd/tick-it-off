<template>
  <div class="flex items-center justify-between">
    <h1 :class="['text-xl font-bold sm:text-3xl', isDarkMode ? 'text-white' : 'text-gray-900']">
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
        <div :class="['relative h-5 w-9 rounded-full', isDarkMode ? 'bg-gray-600' : 'bg-gray-400']">
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
</template>

<script setup lang="ts">
import { SunIcon, MoonIcon } from '@heroicons/vue/24/solid'

const props = defineProps<{
  isDarkMode: boolean
}>()

const emit = defineEmits<{
  (e: 'toggleDarkMode'): void
}>()

const toggleDarkMode = () => {
  emit('toggleDarkMode')
}
</script>
