<template>
  <div class="mb-4">
    <Form
      v-slot="$form"
      :resolver="zodResolver(todoSchema)"
      :initialValues="{title: initialTitle}"
      :validateOnBlur="true"
      data-testid="todo-title-edit-form"
    >
      <div class="flex flex-col gap-2">
        <label for="todoTitle" class="text-md mb-2 block font-medium">Change todo title</label>
        <div class="flex">
          <InputText
            name="title"
            id="todoTitle"
            type="text"
            placeholder="Todo title"
            v-model="editedTitle"
            class="mr-2 w-full"
            data-testid="todo-title-input"
            aria-label="Todo title"
          />
          <Button
            icon="pi pi-check"
            :disabled="!titleChanged || $form.title?.invalid"
            @click="updateTodoTitle($form)"
            :class="{'cursor-not-allowed': !titleChanged || $form.title?.invalid}"
            data-testid="todo-title-save-button"
            aria-label="Save title"
          >
            <i
              class="pi pi-check"
              :class="{'cursor-not-allowed': !titleChanged || $form.title?.invalid}"
            />
          </Button>
        </div>
        <div class="flex h-6">
          <Message
            v-if="$form.title?.invalid"
            severity="warn"
            :life="3000"
            size="small"
            variant="simple"
            data-testid="todo-title-validation-message"
            >{{ $form.title.error.message }}</Message
          >
        </div>
      </div>
    </Form>
  </div>
</template>

<script setup lang="ts">
import {ref, computed, watch} from 'vue'
import {trpc} from '@/trpc'
import {zodResolver} from '@primevue/forms/resolvers/zod'
import {Button, InputText, Message} from 'primevue'
import {Form} from '@primevue/forms'
import {todoSchema} from '@entities/todo'

const props = defineProps<{
  todoId: number
  initialTitle: string
}>()

const emit = defineEmits(['title-updated'])

const editedTitle = ref(props.initialTitle || '')
const titleChanged = computed(() => editedTitle.value !== props.initialTitle)
const isLoading = ref(false)
const error = ref('')

// Watch for changes to initialTitle prop to update the editedTitle
watch(
  () => props.initialTitle,
  newTitle => {
    editedTitle.value = newTitle
  }
)

const updateTodoTitle = async ({valid}: {valid: boolean}) => {
  if (!valid) return

  try {
    isLoading.value = true
    error.value = ''

    await trpc.todo.update.mutate({
      id: props.todoId,
      title: editedTitle.value
    })

    emit('title-updated', editedTitle.value)
  } catch (err) {
    console.error('Error updating todo title:', err)
    error.value = 'Failed to update title'
  } finally {
    isLoading.value = false
  }
}
</script>
