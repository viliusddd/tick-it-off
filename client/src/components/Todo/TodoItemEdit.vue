<template>
  <span ref="rootEl">
    <button
      @click="toggleModal"
      class="text-blue-500 hover:text-blue-600 focus:outline-none"
      :title="isSharedWithOthers ? 'Edit or manage sharing' : 'Edit or share with others'"
    >
      <PencilSquareIcon class="h-5 w-5" />
    </button>

    <Dialog
      v-model:visible="showModal"
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
        <TodoTitleEditor
          :todoId="todoId"
          :initialTitle="todoTitle"
          @title-updated="handleTitleUpdated"
        />

        <TodoSharingManager
          :todoId="todoId"
          :isSharedWithOthers="isSharedWithOthers"
          @share-status-changed="handleShareStatusChanged"
        />
      </div>
    </Dialog>
  </span>
</template>

<script setup lang="ts">
import {ref, onMounted, onUnmounted, watch} from 'vue'
import {PencilSquareIcon} from '@heroicons/vue/24/solid'
import {Dialog, ProgressSpinner} from 'primevue'
import TodoTitleEditor from './TodoItemEdit/TodoTitleEditor.vue'
import TodoSharingManager from './TodoItemEdit/TodoSharingManager.vue'

const props = defineProps<{
  todoId: number
  isShared?: boolean
  todoTitle: string
}>()

const emit = defineEmits(['share-status-changed', 'title-updated'])

const showModal = ref(false)
const isLoading = ref(false)
const error = ref('')
const rootEl = ref<HTMLElement | null>(null)
const isSharedWithOthers = ref(false)

// Watch for changes to isShared prop
watch(
  () => props.isShared,
  newValue => {
    if (newValue !== undefined) {
      // Update component state immediately based on prop
      isSharedWithOthers.value = newValue === true
    }
  },
  {immediate: true} // Run immediately when component is created
)

onMounted(() => {
  document.addEventListener('mousedown', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('mousedown', handleClickOutside)
})

function handleClickOutside(event: MouseEvent) {
  if (!showModal.value) return
  if (rootEl.value && !rootEl.value.contains(event.target as Node)) {
    // Don't close the modal when clicking outside since it's handled by Dialog
  }
}

const toggleModal = async () => {
  showModal.value = !showModal.value
}

const handleTitleUpdated = (newTitle: string) => {
  emit('title-updated', newTitle)
}

const handleShareStatusChanged = (isShared: boolean) => {
  isSharedWithOthers.value = isShared
  emit('share-status-changed', isShared)
}
</script>
