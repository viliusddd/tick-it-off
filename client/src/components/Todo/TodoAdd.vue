<template>
  <div class="flex items-center">
    <Form
      v-slot="$form"
      :resolver="zodResolver(todoSchema)"
      :initialValues="{title: newTodo}"
      :validateOnBlur="true"
      class="w-full"
      data-testid="todo-add-form"
    >
      <InputGroup>
        <InputText
          name="title"
          type="text"
          v-model="newTodo"
          ref="inputRef"
          @keyup.enter="addTodo"
          placeholder="Add a new task..."
          class="flex-grow"
          autocomplete="off"
          data-testid="todo-input"
          aria-label="Add a new task"
        />
        <Button
          @mousedown.prevent
          @click="addTodo"
          label="Add"
          :disabled="$form.title?.invalid || !newTodo"
          data-testid="todo-add-button"
        >
          <p :class="{'cursor-not-allowed': $form.title?.invalid || !newTodo}">Add</p>
        </Button>
      </InputGroup>
      <div class="flex h-4">
        <Message
          v-if="$form.title?.invalid"
          severity="warn"
          :life="3000"
          size="small"
          variant="simple"
          data-testid="todo-validation-message"
          >{{ $form.title.error.message }}</Message
        >
      </div>
    </Form>
  </div>
</template>

<script setup lang="ts">
import {ref, nextTick} from 'vue'
import {Button, InputText, InputGroup, Message} from 'primevue'
import {Form} from '@primevue/forms'
import {zodResolver} from '@primevue/forms/resolvers/zod'
import {todoSchema} from '@entities/todo'

const emit = defineEmits<{
  (e: 'addTodo', title: string): void
}>()

const newTodo = ref('')
const inputRef = ref()
const addTodo = () => {
  if (newTodo.value.trim()) {
    emit('addTodo', newTodo.value.trim())
    newTodo.value = ''
    nextTick(() => {
      inputRef.value?.$el?.querySelector('input')?.focus()
    })
  }
}
</script>
