<template>
  <button
    @click="$emit('click')"
    class="text-blue-500 hover:text-blue-600 focus:outline-none"
    :title="isShared ? 'Edit or manage sharing' : 'Edit or share with others'"
  >
    <PencilSquareIcon class="h-5 w-5" />
  </button>
</template>

<script setup lang="ts">
import {PencilSquareIcon} from '@heroicons/vue/24/solid'

defineProps<{
  isShared: boolean
}>()

defineEmits(['click'])
</script>
