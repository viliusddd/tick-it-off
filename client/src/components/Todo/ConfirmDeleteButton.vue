<template>
  <template v-if="!showConfirm">
    <button @click="showConfirm = true" :class="trashClass" :style="iconStyle">
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
</template>

<script setup lang="ts">
import {ref, computed} from 'vue'
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
  }
})

const emit = defineEmits(['confirm'])
const showConfirm = ref(false)

const iconSizeClass = computed(() => props.iconSize)
const confirmClass = computed(() => `${props.confirmColor} focus:outline-none`)
const trashClass = computed(
  () => `${props.trashColor} focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2`
)
const cancelClass = computed(() => `${props.cancelColor} mr-1 focus:outline-none`)
const iconStyle = ''

function onConfirm() {
  emit('confirm')
  showConfirm.value = false
}
</script>
