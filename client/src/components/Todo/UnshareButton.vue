<template>
  <span ref="rootEl">
    <template v-if="!showConfirm">
      <button
        @click="showConfirm = true"
        class="text-red-500 hover:text-red-600"
        title="Remove from my list"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M13 7l5 5m0 0l-5 5m5-5H6"
          />
        </svg>
      </button>
    </template>
    <template v-else>
      <button @click="showConfirm = false" class="text-gray-400 hover:text-gray-600">
        <XMarkIcon class="h-5 w-5" />
      </button>
      <button @click="onConfirm" class="text-green-500 hover:text-green-600">
        <CheckIcon class="h-5 w-5" />
      </button>
    </template>
  </span>
</template>

<script setup lang="ts">
import {ref, onMounted, onUnmounted} from 'vue'
import {CheckIcon, XMarkIcon} from '@heroicons/vue/24/solid'

const emit = defineEmits(['confirm'])
const showConfirm = ref(false)

const rootEl = ref<HTMLElement | null>(null)

function onConfirm() {
  emit('confirm')
  showConfirm.value = false
}

function handleClickOutside(event: MouseEvent) {
  if (!showConfirm.value) return
  if (rootEl.value && !rootEl.value.contains(event.target as Node)) {
    showConfirm.value = false
  }
}

onMounted(() => document.addEventListener('mousedown', handleClickOutside))
onUnmounted(() => document.removeEventListener('mousedown', handleClickOutside))
</script>
