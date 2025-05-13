<template>
  <div class="mb-4">
    <label for="todoTitle" class="text-md mb-2 block font-medium">Change todo title</label>
    <div class="flex">
      <InputText
        id="todoTitle"
        v-model="localTitle"
        class="mr-2 w-full"
        placeholder="Todo title"
        :class="{'p-invalid': !!validationError}"
      />
      <Button
        icon="pi pi-check"
        :disabled="!titleChanged || !!validationError"
        @click="updateTitle"
      />
    </div>
    <small v-if="validationError" class="text-red-500">{{ validationError }}</small>
  </div>
</template>

<script setup lang="ts">
import {ref, computed, watch} from 'vue'
import {Button, InputText} from 'primevue'
import {trpc} from '@/trpc'
import {validateTodoTitle} from '@/validation/todoSchema'

const props = defineProps<{
  todoId: number
  todoTitle: string
  isLoading?: boolean
}>()

const emit = defineEmits(['title-updated', 'loading', 'error'])

const localTitle = ref(props.todoTitle || '')
const titleChanged = computed(() => localTitle.value !== props.todoTitle)
const validationError = computed(() => {
  if (!titleChanged.value) return null
  return validateTodoTitle(localTitle.value)
})

// Watch for changes to todoTitle prop to update the editedTitle
watch(
  () => props.todoTitle,
  newTitle => {
    localTitle.value = newTitle
  }
)

const updateTitle = async () => {
  if (!titleChanged.value || validationError.value) return

  try {
    emit('loading', true)
    emit('error', '')

    await trpc.todo.update.mutate({
      id: props.todoId,
      title: localTitle.value.trim() // Ensure trimmed value is sent
    })

    emit('title-updated', localTitle.value.trim())
  } catch (err) {
    console.error('Error updating todo title:', err)
    emit('error', 'Failed to update title')
  } finally {
    emit('loading', false)
  }
}
</script>
