<script setup>
import { ref, watch } from 'vue'
import { useToast } from 'primevue/usetoast'
import Checkbox from 'primevue/checkbox'
import Button from 'primevue/button'

const props = defineProps({
  todo: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['update:completed', 'delete'])

const toast = useToast()

const localCompleted = ref(props.todo.completed)

watch(
  () => props.todo.completed,
  (newValue) => {
    localCompleted.value = newValue
  }
)

const updateStatus = () => {
  emit('update:completed', localCompleted.value)
  toast.add({
    severity: localCompleted.value ? 'success' : 'info',
    summary: localCompleted.value ? 'Task Completed' : 'Task Reopened',
    detail: props.todo.text,
    life: 3000,
  })
}

const deleteTodo = () => {
  emit('delete')
  toast.add({
    severity: 'warn',
    summary: 'Task Deleted',
    detail: props.todo.text,
    life: 3000,
  })
}
</script>

<template>
  <div class="align-items-center border-bottom-1 surface-border flex p-3">
    <Checkbox v-model="localCompleted" :binary="true" @change="updateStatus" />
    <span :class="{ 'ml-3 text-gray-400 line-through': localCompleted, 'ml-3': !localCompleted }">
      {{ todo.text }}
    </span>
    <Button
      icon="pi pi-trash"
      class="p-button-rounded p-button-danger p-button-text ml-auto"
      @click="deleteTodo"
    />
  </div>
</template>
