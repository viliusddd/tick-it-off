<template>
  <ShareIcon :class="['vertical-align-middle', color, iconSizeClass]" :title="title" />
</template>

<script setup lang="ts">
import {computed} from 'vue'
import {ShareIcon} from '@heroicons/vue/24/solid'

const props = defineProps({
  iconSize: {
    type: String,
    default: 'h-3 w-3'
  },
  color: {
    type: String,
    default: 'text-blue-500 hover:text-blue-600'
  },
  title: {
    type: String,
    default: 'Shared by me'
  }
})

const iconSizeClass = computed(() => props.iconSize)
</script>
