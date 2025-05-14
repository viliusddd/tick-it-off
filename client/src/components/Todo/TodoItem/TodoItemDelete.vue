<template>
  <span ref="rootEl">
    <template v-if="!showConfirm">
      <button
        @click="!disabled && (showConfirm = true)"
        :class="[trashClass, disabled ? 'cursor-not-allowed opacity-50' : '']"
        :style="iconStyle"
      >
        <TrashIcon :class="iconSizeClass" />
      </button>
    </template>
    <template v-else>
      <button @click="showConfirm = false" :class="cancelClass" :style="iconStyle">
        <XMarkIcon :class="iconSizeClass" />
      </button>
      <button @click="onConfirm" :class="confirmClass" :style="iconStyle">
        <CheckIcon :class="iconSizeClass" />
      </button>
    </template>
  </span>
</template>

<script setup lang="ts">
import {ref, computed, onMounted, onUnmounted} from 'vue'
import {TrashIcon, CheckIcon, XMarkIcon} from '@heroicons/vue/24/solid'

const props = defineProps({
  iconSize: {
    type: String,
    default: 'h-5 w-5'
  },
  confirmColor: {
    type: String,
    default: 'text-green-500 hover:text-green-600'
  },
  trashColor: {
    type: String,
    default: 'text-red-500 hover:text-red-600'
  },
  cancelColor: {
    type: String,
    default: 'text-gray-400 hover:text-gray-600'
  },
  disabled: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['confirm'])
const showConfirm = ref(false)

const iconSizeClass = computed(() => props.iconSize)
const confirmClass = computed(() => `${props.confirmColor} focus:outline-none`)
const trashClass = computed(() => `${props.trashColor} focus:outline-none `)
const cancelClass = computed(() => `${props.cancelColor} mr-1 focus:outline-none`)
const iconStyle = ''

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

onMounted(() => {
  document.addEventListener('mousedown', handleClickOutside)
})
onUnmounted(() => {
  document.removeEventListener('mousedown', handleClickOutside)
})
</script>
