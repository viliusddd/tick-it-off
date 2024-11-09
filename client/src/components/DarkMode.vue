<template>
  <div class="flex items-center justify-end">
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
import { ref, onMounted, watch } from 'vue'
import { SunIcon, MoonIcon } from '@heroicons/vue/24/solid'

const isDarkMode = ref(false)

const toggleDarkMode = () => {
  isDarkMode.value = !isDarkMode.value
  localStorage.setItem('darkMode', isDarkMode.value.toString())
  updateDarkMode()
}

const updateDarkMode = () => {
  if (isDarkMode.value) {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
}

const initDarkMode = () => {
  const savedDarkMode = localStorage.getItem('darkMode')
  if (savedDarkMode !== null) {
    isDarkMode.value = savedDarkMode === 'true'
  } else {
    isDarkMode.value = window.matchMedia('(prefers-color-scheme: dark)').matches
  }
  updateDarkMode()
}

onMounted(() => {
  initDarkMode()
})

watch(isDarkMode, () => {
  updateDarkMode()
})
</script>
