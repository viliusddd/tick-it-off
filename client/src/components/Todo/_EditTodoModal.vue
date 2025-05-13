<template>
  <Dialog
    :visible="visible"
    @update:visible="$emit('update:visible', $event)"
    modal
    header="Edit Todo Item"
    :style="{width: '90%', maxWidth: '500px'}"
    :dismissableMask="true"
  >
    <div v-if="isLoading" class="flex justify-center">
      <ProgressSpinner style="width: 50px; height: 50px" />
    </div>
    <div v-else-if="error" class="mb-4 text-red-500">
      {{ error }}
    </div>
    <div v-else>
      <TodoTitleInput
        :todo-id="todoId"
        :todo-title="todoTitle"
        @title-updated="handleTitleUpdated"
      />

      <ShareWithOthers :todo-id="todoId" @share-status-changed="handleShareStatusChanged" />
    </div>
  </Dialog>
</template>

<script setup lang="ts">
import {Dialog, ProgressSpinner} from 'primevue'
import TodoTitleInput from './TodoTitleInput.vue'
import ShareWithOthers from './ShareWithOthers.vue'

defineProps<{
  visible: boolean
  todoId: number
  todoTitle: string
  isLoading: boolean
  error: string
}>()

const emit = defineEmits(['update:visible', 'title-updated', 'share-status-changed'])

const handleTitleUpdated = (newTitle: string) => {
  emit('title-updated', newTitle)
}

const handleShareStatusChanged = (isShared: boolean) => {
  emit('share-status-changed', isShared)
}
</script>
